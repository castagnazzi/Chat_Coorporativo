require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

// Configuração de Logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Criar pasta de logs se não existir
if (!fs.existsSync('logs')) fs.mkdirSync('logs');

// Mapa para rastrear usuários conectados e suas sessões (sessão única)
const connectedUsers = new Map(); // username -> socketId

const db = new sqlite3.Database(process.env.DB_PATH || './database.db');
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

app.use(express.json());
app.use(express.static(__dirname)); 
app.use('/uploads', express.static('uploads'));

db.serialize(() => {
    // Tabela de usuários com novos campos
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, dept TEXT, role TEXT, status TEXT, user_status TEXT DEFAULT 'Disponível', last_seen DATETIME, avatar_color TEXT)");
    
    // Tabela de mensagens com prioridade e tipo
    db.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, sender TEXT, receiver TEXT, content TEXT, fileUrl TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, read INTEGER DEFAULT 0, priority TEXT DEFAULT 'normal', message_type TEXT DEFAULT 'text', group_id INTEGER)");
    
    // Tabelas de grupos
    db.run("CREATE TABLE IF NOT EXISTS groups (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, created_by TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, avatar_color TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS group_members (id INTEGER PRIMARY KEY AUTOINCREMENT, group_id INTEGER, username TEXT, joined_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(group_id) REFERENCES groups(id))");

    // Tabela de avisos
    db.run("CREATE TABLE IF NOT EXISTS announcements (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, created_by TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, expires_at DATETIME, duration_hours INTEGER DEFAULT 0, font_size INTEGER DEFAULT 15, speed INTEGER DEFAULT 20)");

    // Tabelas de threads
    db.run("CREATE TABLE IF NOT EXISTS threads (id INTEGER PRIMARY KEY AUTOINCREMENT, message_id INTEGER UNIQUE, created_by TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(message_id) REFERENCES messages(id))");
    db.run("CREATE TABLE IF NOT EXISTS thread_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, thread_id INTEGER, sender TEXT, content TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(thread_id) REFERENCES threads(id))");

    // Adicionar colunas se não existirem (migração)
    db.run("ALTER TABLE users ADD COLUMN user_status TEXT DEFAULT 'Disponível'", () => {});
    db.run("ALTER TABLE users ADD COLUMN last_seen DATETIME", () => {});
    db.run("ALTER TABLE users ADD COLUMN avatar_color TEXT", () => {});
    db.run("ALTER TABLE users ADD COLUMN avatar_url TEXT", () => {});
    db.run("ALTER TABLE users ADD COLUMN avatar_position TEXT DEFAULT '50% 50%'", () => {});
    db.run("ALTER TABLE users ADD COLUMN can_edit_banner INTEGER DEFAULT 0", () => {});
    db.run("ALTER TABLE messages ADD COLUMN priority TEXT DEFAULT 'normal'", () => {});
    db.run("ALTER TABLE messages ADD COLUMN message_type TEXT DEFAULT 'text'", () => {});
    db.run("ALTER TABLE messages ADD COLUMN group_id INTEGER", () => {});
    db.run("ALTER TABLE announcements ADD COLUMN font_size INTEGER DEFAULT 15", () => {});
    db.run("ALTER TABLE announcements ADD COLUMN speed INTEGER DEFAULT 20", () => {});
    
    // Criar índices para melhorar performance
    db.run("CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender)", () => {});
    db.run("CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver)", () => {});
    db.run("CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)", () => {});
    db.run("CREATE INDEX IF NOT EXISTS idx_messages_group ON messages(group_id)", () => {});
    db.run("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)", () => {});
    db.run("CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)", () => {});
    db.run("CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id)", () => {});
    
    // Criar usuário admin padrão se não existir
    const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
    
    db.get("SELECT * FROM users WHERE username = ?", [adminUsername], async (err, row) => {
        if (!row) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            db.run("INSERT INTO users (username, password, dept, role, status) VALUES (?, ?, 'TI', 'admin', 'approved')", 
            [adminUsername, hashedPassword], (err) => {
                if (!err) {
                    logger.info(`✅ Usuário admin criado: ${adminUsername}`);
                    console.log(`✅ Usuário admin criado: ${adminUsername}`);
                }
            });
        }
    });
});

// Configuração de Upload com validação
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => { 
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); 
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(',');
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não permitido. Apenas: ' + allowedTypes.join(', ')), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB padrão
    }
});

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

// --- GESTÃO DE USUÁRIOS ---
app.post('/register', async (req, res) => {
    try {
        const { username, password, dept } = req.body;
        
        // Validações
        if (!username || username.trim().length < 3) {
            return res.status(400).json({ error: "Usuário deve ter pelo menos 3 caracteres." });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres." });
        }
        if (!dept || dept.trim().length < 2) {
            return res.status(400).json({ error: "Setor deve ter pelo menos 2 caracteres." });
        }
        
        // Sanitizar inputs
        const cleanUsername = username.trim().toLowerCase();
        const cleanDept = dept.trim();
        
        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run("INSERT INTO users (username, password, dept, role, status) VALUES (?, ?, ?, 'user', 'pending')", 
        [cleanUsername, hashedPassword, cleanDept], (err) => {
            if (err) {
                // Verificar se é erro de username duplicado
                if (err.message.includes('UNIQUE constraint failed') || err.code === 'SQLITE_CONSTRAINT') {
                    logger.warn('Tentativa de registro com username duplicado:', { username: cleanUsername });
                    return res.status(409).json({ 
                        error: `O nome de usuário "${cleanUsername}" já está em uso. Por favor, escolha outro nome. Exemplo: paulo_silva.` 
                    });
                }
                
                // Outros erros do servidor
                logger.error('Erro ao registrar usuário:', { username: cleanUsername, error: err.message });
                return res.status(500).json({ error: "Erro no servidor ao criar conta. Tente novamente." });
            }
            
            logger.info('Novo usuário registrado:', { username: cleanUsername, dept: cleanDept });
            
            // Notificar todos os admins em tempo real sobre novo cadastro
            io.emit('newUserPending', { 
                username: cleanUsername, 
                dept: cleanDept,
                timestamp: new Date().toISOString()
            });
            io.emit('updateUserList');
            
            res.json({ success: true });
        });
    } catch (error) {
        logger.error('Erro no registro:', error);
        res.status(500).json({ error: "Erro ao processar registro." });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: "Usuário e senha são obrigatórios." });
        }
        
        const cleanUsername = username.trim().toLowerCase();
        
        db.get("SELECT * FROM users WHERE username = ?", [cleanUsername], async (err, user) => {
            if (err) {
                logger.error('Erro no login:', { username: cleanUsername, error: err.message });
                return res.status(500).json({ error: "Erro no servidor." });
            }
            if (!user) {
                return res.status(401).json({ error: "Credenciais incorretas ou conta excluída." });
            }
            
            // Verificar senha com bcrypt
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                logger.warn('Tentativa de login falha:', { username: cleanUsername });
                return res.status(401).json({ error: "Credenciais incorretas ou conta excluída." });
            }
            
            if (user.status === 'pending') {
                return res.status(403).json({ error: "Aguarde aprovação do administrador." });
            }
            if (user.status !== 'approved') {
                return res.status(403).json({ error: "Acesso negado. Conta inativa ou excluída." });
            }
            
            logger.info('Login bem-sucedido:', { username: cleanUsername });
            res.json({ user: { id: user.id, name: user.username, role: user.role, dept: user.dept, can_edit_banner: !!user.can_edit_banner } });
        });
    } catch (error) {
        logger.error('Erro no login:', error);
        res.status(500).json({ error: "Erro ao processar login." });
    }
});

app.get('/users-list', (req, res) => {
    const currentUser = req.query.user;
    db.all("SELECT username, dept, status, role, user_status, last_seen, avatar_url, avatar_position, can_edit_banner FROM users WHERE status = 'approved'", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Erro ao carregar usuários." });
        }

        const activeUsers = rows.map(u => ({
            ...u,
            online: Array.from(io.sockets.sockets.values()).some(s => s.username === u.username),
            unread: 0
        }));
        
        if (currentUser) {
            const promises = activeUsers.map(u => {
                return new Promise((resolve) => {
                    db.get("SELECT COUNT(*) as count FROM messages WHERE sender = ? AND receiver = ? AND read = 0",
                    [u.username, currentUser], (err, result) => {
                        u.unread = result ? result.count : 0;
                        resolve();
                    });
                });
            });
            
            Promise.all(promises).then(() => res.json(activeUsers));
        } else {
            res.json(activeUsers);
        }
    });
});

app.post('/mark-read', (req, res) => {
    const { sender, receiver } = req.body;
    db.run("UPDATE messages SET read = 1 WHERE sender = ? AND receiver = ? AND read = 0",
    [sender, receiver], () => {
        io.emit('updateUserList');
        res.json({ success: true });
    });
});

app.put('/admin/update-user', async (req, res) => {
    try {
        const { userId, newDept, newPassword } = req.body;
        if (newDept) {
            db.run("UPDATE users SET dept = ? WHERE id = ?", [newDept, userId], (err) => {
                if (err) {
                    logger.error('Erro ao atualizar departamento:', err);
                    return res.status(500).json({ error: "Erro ao atualizar." });
                }
                logger.info('Departamento atualizado:', { userId, newDept });
                io.emit('updateUserList');
                res.json({ success: true });
            });
        } else if (newPassword) {
            if (newPassword.length < 6) {
                return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres." });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            db.run("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId], (err) => {
                if (err) {
                    logger.error('Erro ao atualizar senha:', err);
                    return res.status(500).json({ error: "Erro ao atualizar." });
                }
                logger.info('Senha atualizada:', { userId });
                res.json({ success: true });
            });
        }
    } catch (error) {
        logger.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: "Erro ao processar atualização." });
    }
});

app.post('/admin/toggle-role', (req, res) => {
    const { userId } = req.body;

    // Verificar quantos admins existem
    db.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'", [], (err, result) => {
        if (err) return res.status(500).json({ error: "Erro ao verificar admins." });

        // Buscar usuário atual
        db.get("SELECT role, username FROM users WHERE id = ?", [userId], (err, user) => {
            if (err || !user) return res.status(404).json({ error: "Usuário não encontrado." });

            // Se está tentando remover admin e só tem 1, bloquear
            if (user.role === 'admin' && result.count <= 1) {
                return res.status(400).json({ error: "Não é possível remover o último administrador." });
            }

            // Alternar role
            const newRole = user.role === 'admin' ? 'user' : 'admin';
            db.run("UPDATE users SET role = ? WHERE id = ?", [newRole, userId], (err) => {
                if (err) return res.status(500).json({ error: "Erro ao atualizar permissão." });

                // Notificar o usuário específico sobre mudança de role
                io.emit('roleChanged', {
                    username: user.username,
                    newRole: newRole
                });

                io.emit('updateUserList');
                res.json({ success: true, newRole });
            });
        });
    });
});

app.post('/admin/toggle-banner-permission', (req, res) => {
    const { userId, canEdit } = req.body;

    db.run("UPDATE users SET can_edit_banner = ? WHERE id = ?", [canEdit ? 1 : 0, userId], (err) => {
        if (err) return res.status(500).json({ error: "Erro ao atualizar permissão." });

        db.get("SELECT username FROM users WHERE id = ?", [userId], (err, user) => {
            if (err || !user) return res.status(404).json({ error: "Usuário não encontrado." });

            const actionText = canEdit ? 'pode editar o banner de avisos.' : 'não pode mais editar o banner de avisos.';
            io.emit('updateUserList');
            res.json({ success: true, message: `"${user.username}" ${actionText}` });
        });
    });
});

app.post('/approve-user', (req, res) => {
    const userId = req.body.id;
    
    // Buscar o username do usuário aprovado
    db.get("SELECT username FROM users WHERE id = ?", [userId], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }
        
        // Aprovar o usuário
        db.run("UPDATE users SET status = 'approved' WHERE id = ?", [userId], (err) => {
            if (err) {
                return res.status(500).json({ error: "Erro ao aprovar usuário." });
            }
            
            // Notificar o usuário aprovado em tempo real
            io.emit('userApproved', { 
                username: user.username,
                timestamp: new Date().toISOString()
            });
            
            io.emit('updateUserList');
            res.json({ success: true });
        });
    });
});

app.post('/admin/delete-user', (req, res) => {
    const { userId } = req.body;
    
    // Primeiro buscar o username antes de deletar
    db.get("SELECT username FROM users WHERE id = ?", [userId], (err, user) => {
        if (err || !user) {
            return res.status(500).json({ error: "Usuário não encontrado." });
        }
        
        const deletedUsername = user.username;
        
        // Deletar usuário
        db.run("DELETE FROM users WHERE id = ?", [userId], (err) => {
            if (err) {
                return res.status(500).json({ error: "Erro ao deletar usuário." });
            }
            
            // Notificar o usuário deletado para desconectar
            io.emit('userDeleted', { username: deletedUsername });
            
            // Desconectar sockets do usuário deletado
            io.sockets.sockets.forEach(socket => {
                if (socket.username === deletedUsername) {
                    socket.disconnect(true);
                }
            });
            
            io.emit('updateUserList');
            res.json({ success: true });
        });
    });
});

// --- BI / DASHBOARD ---
app.get('/admin/stats', (req, res) => {
    db.get("SELECT COUNT(*) as total FROM users WHERE status='approved'", (e1, r1) => {
        db.get("SELECT COUNT(*) as pending FROM users WHERE status='pending'", (e2, r2) => {
            db.get("SELECT COUNT(*) as msgs FROM messages", (e3, r3) => {
                const online = Array.from(io.sockets.sockets.values()).filter(s => s.username).length;
                res.json({ 
                    totalUsers: r1 ? r1.total : 0, 
                    pendingUsers: r2 ? r2.pending : 0, 
                    totalMessages: r3 ? r3.msgs : 0, 
                    onlineNow: online 
                });
            });
        });
    });
});

app.get('/admin/users-full', (req, res) => {
    db.all("SELECT id, username, dept, status, role, can_edit_banner FROM users", [], (err, rows) => res.json(rows || []));
});

// Endpoint para criar backup
app.post('/admin/backup', (req, res) => {
    try {
        const { createBackup } = require('./scripts/backup');
        const success = createBackup();
        
        if (success) {
            const backupFiles = fs.readdirSync('./backups')
                .filter(f => f.startsWith('database_') && f.endsWith('.db'))
                .sort((a, b) => {
                    const statsA = fs.statSync(path.join('./backups', a));
                    const statsB = fs.statSync(path.join('./backups', b));
                    return statsB.mtime - statsA.mtime;
                });
            
            if (backupFiles.length > 0) {
                const latestBackup = backupFiles[0];
                const stats = fs.statSync(path.join('./backups', latestBackup));
                logger.info('Backup criado via painel admin:', latestBackup);
                res.json({
                    success: true,
                    filename: latestBackup,
                    size: `${(stats.size / 1024).toFixed(2)} KB`
                });
            } else {
                res.json({ success: true, filename: 'backup criado' });
            }
        } else {
            res.status(500).json({ error: 'Erro ao criar backup' });
        }
    } catch (error) {
        logger.error('Erro ao criar backup:', error);
        res.status(500).json({ error: 'Erro ao criar backup: ' + error.message });
    }
});

// Endpoint para listar backups
app.get('/admin/backups', (req, res) => {
    try {
        if (!fs.existsSync('./backups')) {
            return res.json([]);
        }
        
        const backups = fs.readdirSync('./backups')
            .filter(f => f.startsWith('database_') && f.endsWith('.db'))
            .map(f => {
                const stats = fs.statSync(path.join('./backups', f));
                return {
                    name: f,
                    date: stats.mtime.toLocaleString('pt-BR'),
                    size: `${(stats.size / 1024).toFixed(2)} KB`,
                    timestamp: stats.mtime.getTime()
                };
            })
            .sort((a, b) => b.timestamp - a.timestamp);
        
        res.json(backups);
    } catch (error) {
        logger.error('Erro ao listar backups:', error);
        res.status(500).json({ error: 'Erro ao listar backups' });
    }
});

// Endpoint para restaurar backup
app.post('/admin/restore', (req, res) => {
    const { filename } = req.body;
    
    if (!filename) {
        return res.status(400).json({ error: 'Nome do backup não informado' });
    }
    
    const backupPath = path.join('./backups', filename);
    const dbPath = process.env.DB_PATH || './database.db';
    
    if (!fs.existsSync(backupPath)) {
        return res.status(404).json({ error: 'Backup não encontrado' });
    }
    
    try {
        // Criar backup do estado atual antes de restaurar
        const timestampBackup = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const safetyBackup = path.join('./backups', `pre-restore_${timestampBackup}.db`);
        fs.copyFileSync(dbPath, safetyBackup);
        logger.info('Backup de segurança criado antes da restauração:', safetyBackup);
        
        // Notificar clientes antes de desconectar
        io.emit('serverRestart', { message: 'Banco de dados sendo restaurado. Aguarde...' });
        
        // Fechar conexão do banco de forma síncrona
        try {
            db.close();
            logger.info('Conexão do banco fechada');
        } catch (closeErr) {
            logger.error('Erro ao fechar banco:', closeErr);
        }
        
        // Aguardar um momento para garantir que o arquivo foi liberado
        setTimeout(() => {
            try {
                // Restaurar backup
                fs.copyFileSync(backupPath, dbPath);
                logger.info('Backup restaurado:', filename);
                
                // Reconectar ao banco
                global.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
                    if (err) {
                        logger.error('Erro ao reconectar banco:', err);
                        // Tentar criar uma nova conexão
                        global.db = new sqlite3.Database(dbPath);
                        logger.info('Banco reconectado com conexão alternativa');
                    } else {
                        logger.info('Banco de dados reconectado com sucesso');
                    }
                    
                    // Desconectar todos os sockets para forçar reconexão
                    const sockets = Array.from(io.sockets.sockets.values());
                    sockets.forEach(socket => {
                        socket.emit('forceReconnect', { message: 'Banco restaurado. Reconectando...' });
                        setTimeout(() => socket.disconnect(true), 100);
                    });
                    
                    logger.info(`${sockets.length} usuários serão desconectados para reconexão`);
                });
                
                res.json({ 
                    success: true, 
                    message: 'Backup restaurado com sucesso. Serviço reiniciado.',
                    reconnect: true
                });
                
            } catch (copyErr) {
                logger.error('Erro ao copiar backup:', copyErr);
                res.status(500).json({ error: 'Erro ao restaurar arquivo: ' + copyErr.message });
            }
        }, 1000); // Delay de 1 segundo para garantir que o arquivo foi liberado
        
    } catch (error) {
        logger.error('Erro ao restaurar backup:', error);
        res.status(500).json({ error: 'Erro ao restaurar backup: ' + error.message });
    }
});

// Endpoint para resetar banco de dados
app.post('/admin/reset-database', async (req, res) => {
    try {
        logger.warn('Iniciando reset do banco de dados');
        
        // Criar backup antes de resetar
        const { createBackup } = require('./scripts/backup');
        createBackup();
        logger.info('Backup criado antes do reset');
        
        // Notificar clientes
        io.emit('serverRestart', { message: 'Banco sendo resetado. Todos serão desconectados...' });
        
        const dbPath = process.env.DB_PATH || './database.db';
        
        // Fechar conexão do banco
        db.close();
        logger.info('Conexão do banco fechada para reset');
        
        setTimeout(async () => {
            try {
                // Remover banco existente
                if (fs.existsSync(dbPath)) {
                    fs.unlinkSync(dbPath);
                    logger.info('Banco de dados antigo removido');
                }
                
                // Criar novo banco
                global.db = new sqlite3.Database(dbPath);
                
                // Criar tabelas
                db.serialize(async () => {
                    db.run(`CREATE TABLE users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE,
                        password TEXT,
                        dept TEXT,
                        role TEXT,
                        status TEXT,
                        user_status TEXT DEFAULT 'Disponível',
                        last_seen DATETIME,
                        avatar_color TEXT
                    )`);

                    db.run(`CREATE TABLE messages (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        sender TEXT,
                        receiver TEXT,
                        content TEXT,
                        fileUrl TEXT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        read INTEGER DEFAULT 0,
                        priority TEXT DEFAULT 'normal',
                        message_type TEXT DEFAULT 'text',
                        group_id INTEGER
                    )`);

                    db.run(`CREATE TABLE groups (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT,
                        created_by TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        avatar_color TEXT
                    )`);

                    db.run(`CREATE TABLE group_members (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        group_id INTEGER,
                        username TEXT,
                        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(group_id) REFERENCES groups(id)
                    )`);

                    // Criar índices
                    db.run("CREATE INDEX idx_messages_sender ON messages(sender)");
                    db.run("CREATE INDEX idx_messages_receiver ON messages(receiver)");
                    db.run("CREATE INDEX idx_messages_timestamp ON messages(timestamp)");
                    db.run("CREATE INDEX idx_messages_group ON messages(group_id)");
                    db.run("CREATE INDEX idx_users_username ON users(username)");
                    db.run("CREATE INDEX idx_users_status ON users(status)");
                    db.run("CREATE INDEX idx_group_members_group ON group_members(group_id)");

                    logger.info('Tabelas e índices criados');

                    // Criar usuário admin padrão
                    const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
                    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
                    const hashedPassword = await bcrypt.hash(adminPassword, 10);

                    db.run(
                        "INSERT INTO users (username, password, dept, role, status) VALUES (?, ?, 'TI', 'admin', 'approved')",
                        [adminUsername, hashedPassword],
                        (err) => {
                            if (!err) {
                                logger.info(`Usuário admin criado após reset: ${adminUsername}`);
                            }

                            // Desconectar todos os usuários
                            const sockets = Array.from(io.sockets.sockets.values());
                            sockets.forEach(socket => {
                                socket.emit('forceReconnect', { message: 'Banco resetado. Faça login novamente.' });
                                setTimeout(() => socket.disconnect(true), 100);
                            });

                            res.json({ 
                                success: true, 
                                message: 'Banco resetado com sucesso',
                                admin: { username: adminUsername }
                            });
                        }
                    );
                });
            } catch (error) {
                logger.error('Erro ao resetar banco:', error);
                res.status(500).json({ error: 'Erro ao resetar banco: ' + error.message });
            }
        }, 1000);
        
    } catch (error) {
        logger.error('Erro no processo de reset:', error);
        res.status(500).json({ error: 'Erro ao resetar banco: ' + error.message });
    }
});

app.post('/upload', upload.single('file'), (req, res) => { 
    if (!req.file) {
        logger.warn('Upload sem arquivo');
        return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
    }
    logger.info('Arquivo enviado:', { filename: req.file.filename, size: req.file.size });
    res.json({ url: `/uploads/${req.file.filename}` }); 
});

// Upload de Avatar
app.post('/upload-avatar', upload.single('avatar'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
        }
        
        const { username, position } = req.body;
        if (!username) {
            // Deletar arquivo se não tiver username
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Usuário não especificado.' });
        }
        
        // Validar tipo de arquivo (apenas imagens)
        if (!req.file.mimetype.startsWith('image/')) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Apenas imagens são permitidas.' });
        }
        
        const avatarUrl = '/uploads/' + req.file.filename;
        const avatarPosition = position || '50% 50%';
        
        // Buscar avatar antigo para deletar
        db.get("SELECT avatar_url FROM users WHERE username = ?", [username], (err, user) => {
            if (!err && user && user.avatar_url) {
                const oldPath = path.join(__dirname, user.avatar_url);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            
            // Atualizar banco com novo avatar e posição
            db.run("UPDATE users SET avatar_url = ?, avatar_position = ? WHERE username = ?", [avatarUrl, avatarPosition, username], (err) => {
                if (err) {
                    logger.error('Erro ao salvar avatar:', err);
                    return res.status(500).json({ error: 'Erro ao salvar avatar.' });
                }
                
                logger.info('Avatar atualizado:', { username, avatarUrl });
                
                // Notificar todos sobre atualização de avatar
                io.emit('avatarUpdated', { username, avatarUrl });
                
                res.json({ success: true, avatarUrl });
            });
        });
    } catch (error) {
        logger.error('Erro no upload de avatar:', error);
        res.status(500).json({ error: 'Erro ao processar upload.' });
    }
});

// Remover Avatar
app.post('/remove-avatar', (req, res) => {
    try {
        const { username } = req.body;
        
        if (!username) {
            return res.status(400).json({ error: 'Usuário não especificado.' });
        }
        
        // Buscar avatar para deletar arquivo
        db.get("SELECT avatar_url FROM users WHERE username = ?", [username], (err, user) => {
            if (!err && user && user.avatar_url) {
                const avatarPath = path.join(__dirname, user.avatar_url);
                if (fs.existsSync(avatarPath)) {
                    fs.unlinkSync(avatarPath);
                }
            }
            
            // Remover do banco
            db.run("UPDATE users SET avatar_url = NULL, avatar_position = '50% 50%' WHERE username = ?", [username], (err) => {
                if (err) {
                    logger.error('Erro ao remover avatar:', err);
                    return res.status(500).json({ error: 'Erro ao remover avatar.' });
                }
                
                logger.info('Avatar removido:', { username });
                
                // Notificar todos
                io.emit('avatarUpdated', { username, avatarUrl: null });
                
                res.json({ success: true });
            });
        });
    } catch (error) {
        logger.error('Erro ao remover avatar:', error);
        res.status(500).json({ error: 'Erro ao processar remoção.' });
    }
});

// Tratamento de erro de upload
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        logger.error('Erro de upload Multer:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Arquivo muito grande. Tamanho máximo: ' + (parseInt(process.env.MAX_FILE_SIZE) / (1024*1024)) + 'MB' });
        }
        return res.status(400).json({ error: 'Erro no upload: ' + err.message });
    } else if (err) {
        logger.error('Erro geral:', err);
        return res.status(500).json({ error: err.message || 'Erro no servidor.' });
    }
    next();
});

// --- API DE ANÚNCIOS/AVISOS ---
// Obter aviso atual
app.get('/api/announcements', (req, res) => {
    db.get("SELECT * FROM announcements ORDER BY created_at DESC LIMIT 1", [], (err, row) => {
        if (err) {
            logger.error('Erro ao buscar aviso:', err);
            return res.status(500).json({ error: 'Erro ao buscar aviso.' });
        }
        res.json(row || {});
    });
});

// Criar ou atualizar aviso
app.post('/api/announcements', (req, res) => {
    const { text, duration, userId, fontSize, speed } = req.body;

    if (!text || !userId) {
        return res.status(400).json({ error: 'Texto e userId são obrigatórios.' });
    }

    // Calcular data de expiração (se duration > 0)
    let expiresAt = null;
    const durationHours = duration || 0;
    const fontSizeVal = fontSize || 15;
    const speedVal = speed || 20;
    
    if (durationHours > 0) {
        const now = new Date();
        expiresAt = new Date(now.getTime() + (durationHours * 60 * 60 * 1000)).toISOString();
    }

    // Verificar se já existe um aviso
    db.get("SELECT id FROM announcements ORDER BY created_at DESC LIMIT 1", [], (err, row) => {
        if (row) {
            // Atualizar aviso existente
            db.run(
                "UPDATE announcements SET text = ?, created_by = ?, expires_at = ?, duration_hours = ?, font_size = ?, speed = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?",
                [text, userId, expiresAt, durationHours, fontSizeVal, speedVal, row.id],
                function(err) {
                    if (err) {
                        logger.error('Erro ao atualizar aviso:', err);
                        return res.status(500).json({ error: 'Erro ao atualizar aviso.' });
                    }
                    
                    logger.info('Aviso atualizado:', { userId, durationHours, fontSize: fontSizeVal, speed: speedVal });
                    
                    // Notificar todos os usuários sobre o novo aviso
                    io.emit('announcementUpdate', { 
                        text, 
                        createdAt: new Date().toISOString(),
                        expiresAt,
                        duration_hours: durationHours,
                        font_size: fontSizeVal,
                        speed: speedVal
                    });
                    
                    res.json({ success: true, id: row.id });
                }
            );
        } else {
            // Criar novo aviso
            db.run(
                "INSERT INTO announcements (text, created_by, expires_at, duration_hours, font_size, speed) VALUES (?, ?, ?, ?, ?, ?)",
                [text, userId, expiresAt, durationHours, fontSizeVal, speedVal],
                function(err) {
                    if (err) {
                        logger.error('Erro ao criar aviso:', err);
                        return res.status(500).json({ error: 'Erro ao criar aviso.' });
                    }
                    
                    logger.info('Aviso criado:', { userId, durationHours, fontSize: fontSizeVal, speed: speedVal, announcementId: this.lastID });
                    
                    // Notificar todos os usuários sobre o novo aviso
                    io.emit('announcementUpdate', { 
                        text, 
                        createdAt: new Date().toISOString(),
                        expiresAt,
                        duration_hours: durationHours,
                        font_size: fontSizeVal,
                        speed: speedVal
                    });
                    
                    res.json({ success: true, id: this.lastID });
                }
            );
        }
    });
});

// Remover aviso
app.delete('/api/announcements', (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'userId é obrigatório.' });
    }

    db.run("DELETE FROM announcements", [], function(err) {
        if (err) {
            logger.error('Erro ao remover aviso:', err);
            return res.status(500).json({ error: 'Erro ao remover aviso.' });
        }
        
        logger.info('Aviso removido:', { userId });
        res.json({ success: true });
        
        // Notificar todos os usuários sobre a remoção do aviso
        io.emit('announcementRemoved');
    });
});

// --- SOCKETS ---
io.on('connection', (socket) => {
    socket.on('join', (username) => {
        // Validar se o usuário ainda existe e está aprovado
        db.get("SELECT status FROM users WHERE username = ?", [username], (err, user) => {
            if (err || !user || user.status !== 'approved') {
                socket.emit('error', { message: 'Usuário inválido ou inativo.' });
                socket.disconnect(true);
                return;
            }
            
            // Verificar se o usuário já está conectado em outro lugar
            if (connectedUsers.has(username)) {
                const previousSocketId = connectedUsers.get(username);
                const previousSocket = io.sockets.sockets.get(previousSocketId);
                
                // Desconectar sessão anterior
                if (previousSocket) {
                    previousSocket.emit('sessionExpired', { 
                        message: 'Você foi desconectado porque sua conta foi acessada em outro dispositivo.' 
                    });
                    previousSocket.disconnect(true);
                    logger.info('Sessão anterior desconectada:', { username, previousSocketId });
                }
                
                // Remover da lista antes de adicionar a nova conexão
                connectedUsers.delete(username);
            }
            
            // Registrar nova sessão
            socket.username = username;
            connectedUsers.set(username, socket.id);
            
            logger.info('Usuário conectado:', { username, socketId: socket.id });
            io.emit('userStatusUpdate');
        });
    });

    // Usuário aguardando aprovação
    socket.on('waitingApproval', (data) => {
        socket.waitingUsername = data.username;
    });

    socket.on('getHistory', (data) => {
        db.all("SELECT * FROM messages WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?) ORDER BY timestamp ASC", 
        [data.me, data.other, data.other, data.me], (err, rows) => {
            if (err) {
                console.error('Erro ao buscar histórico:', err);
                socket.emit('chatHistory', []);
                return;
            }
            socket.emit('chatHistory', rows); 
        });
    });

    socket.on('privateMessage', (data) => {
        // Validar se o remetente ainda existe no banco
        db.get("SELECT status FROM users WHERE username = ?", [data.sender], (err, user) => {
            if (err || !user || user.status !== 'approved') {
                socket.emit('error', { message: 'Usuário inválido ou inativo.' });
                socket.disconnect(true);
                return;
            }

            const msgContent = data.text || data.content || "";
            const priority = data.priority || 'normal';
            const messageType = data.message_type || 'text';

            db.run("INSERT INTO messages (sender, receiver, content, fileUrl, priority, message_type) VALUES (?, ?, ?, ?, ?, ?)",
            [data.sender, data.receiver, msgContent, data.fileUrl || null, priority, messageType], function() {
                const messageData = {
                    sender: data.sender,
                    receiver: data.receiver,
                    content: msgContent,
                    fileUrl: data.fileUrl || null,
                    timestamp: new Date().toISOString(),
                    id: this.lastID,
                    priority: priority,
                    message_type: messageType
                };

                // Enviar mensagem apenas para remetente e destinatário
                io.sockets.sockets.forEach(s => {
                    if (s.username === data.sender || s.username === data.receiver) {
                        s.emit('newMessage', messageData);
                    }
                });

                io.emit('updateUserList');
            });
        });
    });

    // Thread messages
    socket.on('threadMessage', (data) => {
        const { threadId, sender, content } = data;

        db.run("INSERT INTO thread_messages (thread_id, sender, content) VALUES (?, ?, ?)",
        [threadId, sender, content], function(err) {
            if (err) {
                socket.emit('error', { message: 'Erro ao enviar mensagem na thread.' });
                return;
            }

            // Notificar todos sobre nova mensagem na thread
            io.emit('newThreadMessage', {
                threadId,
                sender,
                content,
                timestamp: new Date().toISOString()
            });
        });
    });

    socket.on('typing', (data) => {
        // Enviar notificação de digitando apenas para o destinatário
        io.sockets.sockets.forEach(s => {
            if (s.username === data.to) {
                s.emit('userTyping', { from: data.from });
            }
        });
    });

    // Reações
    socket.on('addReaction', (data) => {
        io.sockets.sockets.forEach(s => {
            if (s.username === data.to) {
                s.emit('reactionAdded', data);
            }
        });
    });

    socket.on('toggleReaction', (data) => {
        io.sockets.sockets.forEach(s => {
            if (s.username === data.to) {
                s.emit('reactionAdded', data);
            }
        });
    });

    // Marcar como lida
    socket.on('markAsRead', (data) => {
        db.run("UPDATE messages SET read = 1 WHERE id = ?", [data.msgId], (err) => {
            if (!err) {
                io.sockets.sockets.forEach(s => {
                    s.emit('messageRead', { msgId: data.msgId });
                });
            }
        });
    });

    // --- EVENTOS DE GRUPOS ---
    socket.on('joinGroup', (data) => {
        socket.join(`group_${data.groupId}`);
        // Buscar histórico do grupo
        db.all("SELECT * FROM messages WHERE group_id = ? ORDER BY timestamp ASC", 
        [data.groupId], (err, rows) => {
            if (!err) {
                socket.emit('groupHistory', { groupId: data.groupId, messages: rows });
            }
        });
    });

    socket.on('groupMessage', (data) => {
        db.get("SELECT status FROM users WHERE username = ?", [data.sender], (err, user) => {
            if (err || !user || user.status !== 'approved') {
                socket.emit('error', { message: 'Usuário inválido ou inativo.' });
                return;
            }
            
            const msgContent = data.text || data.content || "";
            const messageType = data.message_type || 'text';
            
            db.run("INSERT INTO messages (sender, content, fileUrl, group_id, message_type) VALUES (?, ?, ?, ?, ?)", 
            [data.sender, msgContent, data.fileUrl || null, data.groupId, messageType], function() {
                const messageData = {
                    id: this.lastID,
                    groupId: data.groupId,
                    sender: data.sender,
                    content: msgContent,
                    fileUrl: data.fileUrl || null,
                    timestamp: new Date().toISOString(),
                    message_type: messageType
                };
                
                // Enviar para todos no grupo
                io.to(`group_${data.groupId}`).emit('newGroupMessage', messageData);
            });
        });
    });

    socket.on('leaveGroup', (data) => {
        socket.leave(`group_${data.groupId}`);
    });

    socket.on('disconnect', () => {
        // Remover usuário da lista de conectados
        if (socket.username && connectedUsers.get(socket.username) === socket.id) {
            connectedUsers.delete(socket.username);
            logger.info('Usuário desconectado:', { username: socket.username, socketId: socket.id });
        }
        io.emit('userStatusUpdate');
    });
});

// Rotas para editar e excluir mensagens
app.post('/edit-message', (req, res) => {
    const { id, content, sender } = req.body;
    
    // Verificar se a mensagem pertence ao usuário
    db.get("SELECT sender FROM messages WHERE id = ?", [id], (err, msg) => {
        if (err || !msg) {
            return res.status(404).json({ error: "Mensagem não encontrada." });
        }
        
        if (msg.sender !== sender) {
            return res.status(403).json({ error: "Você não pode editar esta mensagem." });
        }
        
        db.run("UPDATE messages SET content = ? WHERE id = ?", [content, id], (err) => {
            if (err) {
                return res.status(500).json({ error: "Erro ao editar mensagem." });
            }
            
            // Notificar ambos os usuários sobre a edição
            io.emit('messageEdited', { id, content });
            res.json({ success: true });
        });
    });
});

app.post('/delete-message', (req, res) => {
    const { id, sender } = req.body;
    
    // Verificar se a mensagem pertence ao usuário
    db.get("SELECT sender FROM messages WHERE id = ?", [id], (err, msg) => {
        if (err || !msg) {
            return res.status(404).json({ error: "Mensagem não encontrada." });
        }
        
        if (msg.sender !== sender) {
            return res.status(403).json({ error: "Você não pode excluir esta mensagem." });
        }
        
        db.run("DELETE FROM messages WHERE id = ?", [id], (err) => {
            if (err) {
                return res.status(500).json({ error: "Erro ao excluir mensagem." });
            }
            
            // Notificar ambos os usuários sobre a exclusão
            io.emit('messageDeleted', { id });
            res.json({ success: true });
        });
    });
});

// Rotas para novos recursos
app.post('/update-user-status', (req, res) => {
    const { username, status } = req.body;
    db.run("UPDATE users SET user_status = ? WHERE username = ?", [status, username], (err) => {
        if (err) return res.status(500).json({ error: "Erro ao atualizar status" });
        io.emit('statusChanged', { username, status });
        res.json({ success: true });
    });
});

app.post('/update-last-seen', (req, res) => {
    const { username } = req.body;
    db.run("UPDATE users SET last_seen = datetime('now') WHERE username = ?", [username], (err) => {
        if (err) return res.status(500).json({ error: "Erro ao atualizar last seen" });
        res.json({ success: true });
    });
});

app.get('/user-info/:username', (req, res) => {
    const { username } = req.params;
    db.get("SELECT user_status, last_seen, avatar_color FROM users WHERE username = ?", [username], (err, user) => {
        if (err || !user) return res.status(404).json({ error: "Usuário não encontrado" });
        res.json(user);
    });
});

app.get('/user-stats/:username', (req, res) => {
    const { username } = req.params;
    
    Promise.all([
        new Promise((resolve) => {
            db.get("SELECT COUNT(*) as sent FROM messages WHERE sender = ?", [username], (err, r) => resolve(r));
        }),
        new Promise((resolve) => {
            db.get("SELECT COUNT(*) as received FROM messages WHERE receiver = ?", [username], (err, r) => resolve(r));
        }),
        new Promise((resolve) => {
            db.all("SELECT sender as contact, COUNT(*) as count FROM messages WHERE receiver = ? GROUP BY sender ORDER BY count DESC LIMIT 5", [username], (err, r) => resolve(r || []));
        }),
        new Promise((resolve) => {
            db.all("SELECT receiver as contact, COUNT(*) as count FROM messages WHERE sender = ? GROUP BY receiver ORDER BY count DESC LIMIT 5", [username], (err, r) => resolve(r || []));
        })
    ]).then(([sent, received, topReceived, topSent]) => {
        // Combinar contatos mais frequentes
        const contacts = {};
        topReceived.forEach(c => contacts[c.contact] = (contacts[c.contact] || 0) + c.count);
        topSent.forEach(c => contacts[c.contact] = (contacts[c.contact] || 0) + c.count);
        
        const topContacts = Object.entries(contacts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([contact, count]) => ({ contact, count }));
        
        res.json({
            messagesSent: sent.sent,
            messagesReceived: received.received,
            totalMessages: sent.sent + received.received,
            topContacts
        });
    });
});

// --- ROTAS DE GRUPOS ---
app.post('/create-group', (req, res) => {
    const { name, createdBy, members } = req.body;
    
    if (!name || name.trim().length < 3) {
        return res.status(400).json({ error: "Nome do grupo deve ter pelo menos 3 caracteres." });
    }
    
    const avatarColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    
    db.run("INSERT INTO groups (name, created_by, avatar_color) VALUES (?, ?, ?)", 
    [name.trim(), createdBy, avatarColor], function(err) {
        if (err) return res.status(500).json({ error: "Erro ao criar grupo." });
        
        const groupId = this.lastID;
        
        // Adicionar criador como membro
        const allMembers = [createdBy, ...members];
        const uniqueMembers = [...new Set(allMembers)];
        
        const stmt = db.prepare("INSERT INTO group_members (group_id, username) VALUES (?, ?)");
        uniqueMembers.forEach(member => stmt.run(groupId, member));
        stmt.finalize();
        
        io.emit('groupCreated', { groupId, name: name.trim(), createdBy });
        res.json({ success: true, groupId, name: name.trim(), avatarColor });
    });
});

app.get('/my-groups', (req, res) => {
    const username = req.query.username;
    
    db.all(`SELECT g.*, 
            (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count,
            (SELECT COUNT(*) FROM messages WHERE group_id = g.id AND sender != ? AND read = 0) as unread
            FROM groups g 
            WHERE g.id IN (SELECT group_id FROM group_members WHERE username = ?)
            ORDER BY g.created_at DESC`, 
    [username, username], (err, groups) => {
        if (err) return res.status(500).json({ error: "Erro ao carregar grupos." });
        res.json(groups);
    });
});

app.get('/group-members/:groupId', (req, res) => {
    const { groupId } = req.params;
    
    db.all("SELECT username FROM group_members WHERE group_id = ?", [groupId], (err, members) => {
        if (err) return res.status(500).json({ error: "Erro ao carregar membros." });
        res.json(members);
    });
});

app.post('/send-group-message', (req, res) => {
    const { groupId, sender, content, fileUrl } = req.body;
    
    db.run("INSERT INTO messages (sender, content, fileUrl, group_id, message_type) VALUES (?, ?, ?, ?, ?)",
    [sender, content, fileUrl || null, groupId, fileUrl ? 'file' : 'text'], function(err) {
        if (err) return res.status(500).json({ error: "Erro ao enviar mensagem." });
        
        io.emit('groupMessage', {
            id: this.lastID,
            groupId,
            sender,
            content,
            fileUrl,
            timestamp: new Date().toISOString()
        });
        
        res.json({ success: true, id: this.lastID });
    });
});

app.get('/group-history/:groupId', (req, res) => {
    const { groupId } = req.params;
    
    db.all("SELECT * FROM messages WHERE group_id = ? ORDER BY timestamp ASC", [groupId], (err, messages) => {
        if (err) return res.status(500).json({ error: "Erro ao carregar histórico." });
        res.json(messages);
    });
});

app.post('/mark-group-read', (req, res) => {
    const { groupId, username } = req.body;

    // Marcar todas as mensagens do grupo como lidas (que não são do próprio usuário)
    db.run("UPDATE messages SET read = 1 WHERE group_id = ? AND sender != ? AND read = 0",
    [groupId, username], (err) => {
        if (err) return res.status(500).json({ error: "Erro ao marcar como lido." });
        res.json({ success: true });
    });
});

// ===== ENDPOINTS DE THREADS =====
app.get('/thread/:messageId', (req, res) => {
    const { messageId } = req.params;

    // Verificar se thread existe para esta mensagem
    db.get("SELECT * FROM threads WHERE message_id = ?", [messageId], (err, thread) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar thread." });
        
        // Se thread não existe, retornar array vazio
        if (!thread) return res.json([]);

        // Buscar todas as mensagens da thread
        db.all("SELECT * FROM thread_messages WHERE thread_id = ? ORDER BY timestamp ASC", [thread.id], (err, messages) => {
            if (err) return res.status(500).json({ error: "Erro ao buscar mensagens." });
            res.json(messages);
        });
    });
});

app.get('/thread/:messageId/count', (req, res) => {
    const { messageId } = req.params;

    db.get("SELECT t.id, COUNT(tm.id) as count FROM threads t LEFT JOIN thread_messages tm ON t.id = tm.thread_id WHERE t.message_id = ? GROUP BY t.id", [messageId], (err, row) => {
        if (err) return res.status(500).json({ error: "Erro ao contar mensagens." });
        res.json({ count: row ? row.count : 0 });
    });
});

app.post('/thread/create', (req, res) => {
    const { messageId, createdBy } = req.body;

    // Criar thread se não existir
    db.run("INSERT OR IGNORE INTO threads (message_id, created_by) VALUES (?, ?)", [messageId, createdBy], function(err) {
        if (err) return res.status(500).json({ error: "Erro ao criar thread." });
        
        // Buscar thread ID
        db.get("SELECT id FROM threads WHERE message_id = ?", [messageId], (err, thread) => {
            if (err) return res.status(500).json({ error: "Erro ao buscar thread." });
            res.json({ success: true, threadId: thread.id });
        });
    });
});

app.post('/thread/message', (req, res) => {
    const { threadId, sender, content } = req.body;

    db.run("INSERT INTO thread_messages (thread_id, sender, content) VALUES (?, ?, ?)", [threadId, sender, content], function(err) {
        if (err) return res.status(500).json({ error: "Erro ao enviar mensagem na thread." });

        // Notificar todos sobre nova mensagem na thread
        io.emit('newThreadMessage', {
            threadId,
            sender,
            content,
            timestamp: new Date().toISOString()
        });

        res.json({ success: true, id: this.lastID });
    });
});

app.delete('/delete-group/:groupId', (req, res) => {
    const { groupId } = req.params;
    const { username } = req.body;
    
    // Verificar se o usuário é o criador do grupo
    db.get("SELECT created_by FROM groups WHERE id = ?", [groupId], (err, group) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar grupo." });
        if (!group) return res.status(404).json({ error: "Grupo não encontrado." });
        
        if (group.created_by !== username) {
            return res.status(403).json({ error: "Apenas o criador pode excluir o grupo." });
        }
        
        // Excluir mensagens do grupo
        db.run("DELETE FROM messages WHERE group_id = ?", [groupId], (err) => {
            if (err) logger.error('Erro ao excluir mensagens do grupo:', err);
            
            // Excluir membros do grupo
            db.run("DELETE FROM group_members WHERE group_id = ?", [groupId], (err) => {
                if (err) logger.error('Erro ao excluir membros do grupo:', err);
                
                // Excluir o grupo
                db.run("DELETE FROM groups WHERE id = ?", [groupId], (err) => {
                    if (err) return res.status(500).json({ error: "Erro ao excluir grupo." });
                    
                    logger.info(`Grupo ${groupId} excluído por ${username}`);
                    io.emit('groupDeleted', { groupId });
                    res.json({ success: true, message: "Grupo excluído com sucesso." });
                });
            });
        });
    });
});

app.post('/leave-group', (req, res) => {
    const { groupId, username } = req.body;
    
    // Verificar se o usuário não é o criador
    db.get("SELECT created_by FROM groups WHERE id = ?", [groupId], (err, group) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar grupo." });
        if (!group) return res.status(404).json({ error: "Grupo não encontrado." });
        
        if (group.created_by === username) {
            return res.status(403).json({ error: "O criador não pode sair do grupo. Exclua o grupo ou transfira a propriedade." });
        }
        
        // Remover usuário do grupo
        db.run("DELETE FROM group_members WHERE group_id = ? AND username = ?", [groupId, username], (err) => {
            if (err) return res.status(500).json({ error: "Erro ao sair do grupo." });
            
            logger.info(`${username} saiu do grupo ${groupId}`);
            io.emit('groupMemberLeft', { groupId, username });
            res.json({ success: true, message: "Você saiu do grupo." });
        });
    });
});

app.post('/add-group-member', (req, res) => {
    const { groupId, username, newMember } = req.body;
    
    // Verificar se o usuário é o criador
    db.get("SELECT created_by FROM groups WHERE id = ?", [groupId], (err, group) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar grupo." });
        if (!group) return res.status(404).json({ error: "Grupo não encontrado." });
        
        if (group.created_by !== username) {
            return res.status(403).json({ error: "Apenas o criador pode adicionar membros." });
        }
        
        // Verificar se o membro já existe
        db.get("SELECT * FROM group_members WHERE group_id = ? AND username = ?", [groupId, newMember], (err, existing) => {
            if (existing) {
                return res.status(400).json({ error: "Usuário já é membro do grupo." });
            }
            
            // Adicionar novo membro
            db.run("INSERT INTO group_members (group_id, username) VALUES (?, ?)", [groupId, newMember], (err) => {
                if (err) return res.status(500).json({ error: "Erro ao adicionar membro." });
                
                logger.info(`${newMember} adicionado ao grupo ${groupId} por ${username}`);
                io.emit('groupMemberAdded', { groupId, newMember });
                res.json({ success: true, message: "Membro adicionado com sucesso." });
            });
        });
    });
});

app.post('/remove-group-member', (req, res) => {
    const { groupId, username, memberToRemove } = req.body;
    
    // Verificar se o usuário é o criador
    db.get("SELECT created_by FROM groups WHERE id = ?", [groupId], (err, group) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar grupo." });
        if (!group) return res.status(404).json({ error: "Grupo não encontrado." });
        
        if (group.created_by !== username) {
            return res.status(403).json({ error: "Apenas o criador pode remover membros." });
        }
        
        if (memberToRemove === username) {
            return res.status(400).json({ error: "Você não pode remover a si mesmo. Use a opção de excluir grupo." });
        }
        
        // Remover membro
        db.run("DELETE FROM group_members WHERE group_id = ? AND username = ?", [groupId, memberToRemove], (err) => {
            if (err) return res.status(500).json({ error: "Erro ao remover membro." });
            
            logger.info(`${memberToRemove} removido do grupo ${groupId} por ${username}`);
            io.emit('groupMemberRemoved', { groupId, memberToRemove });
            res.json({ success: true, message: "Membro removido com sucesso." });
        });
    });
});

const PORT = process.env.PORT || 4040;
const HOST = process.env.HOST || '0.0.0.0';

http.listen(PORT, HOST, () => {
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    const addresses = [];
    
    for (const name of Object.keys(networkInterfaces)) {
        for (const net of networkInterfaces[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                addresses.push(net.address);
            }
        }
    }
    
    logger.info(`Servidor ONLINE na porta ${PORT}`);
    console.log(`\n🚀 Servidor ONLINE na porta ${PORT}`);
    console.log(`\n📡 Acesse através de:`);
    console.log(`   Local:   http://localhost:${PORT}`);
    addresses.forEach(ip => {
        console.log(`   Rede:    http://${ip}:${PORT}`);
    });
    console.log('');
});