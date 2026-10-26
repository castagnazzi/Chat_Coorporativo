/**
 * Script de Reset do Banco de Dados
 * ATENÇÃO: Este script APAGA TODOS OS DADOS!
 * Use apenas em desenvolvimento ou antes de implantar em produção
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || './database.db';
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function resetDatabase() {
    console.log('\n⚠️  ═══════════════════════════════════════════════════');
    console.log('⚠️  ATENÇÃO: Esta ação irá APAGAR TODOS OS DADOS!');
    console.log('⚠️  ═══════════════════════════════════════════════════\n');

    // Fazer backup antes de resetar
    const { createBackup } = require('./backup');
    console.log('📦 Criando backup de segurança antes de resetar...');
    createBackup();

    return new Promise((resolve) => {
        rl.question('Digite "CONFIRMAR" para continuar: ', async (answer) => {
            if (answer === 'CONFIRMAR') {
                console.log('\n🔄 Resetando banco de dados...\n');

                // Remover banco existente
                if (fs.existsSync(DB_PATH)) {
                    fs.unlinkSync(DB_PATH);
                    console.log('🗑️  Banco de dados antigo removido');
                }

                // Criar novo banco
                const db = new sqlite3.Database(DB_PATH);

                db.serialize(async () => {
                    // Criar tabelas
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

                    console.log('✅ Tabelas criadas');
                    console.log('✅ Índices criados');

                    // Criar usuário admin padrão
                    const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
                    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
                    const hashedPassword = await bcrypt.hash(adminPassword, 10);

                    db.run(
                        "INSERT INTO users (username, password, dept, role, status) VALUES (?, ?, 'TI', 'admin', 'approved')",
                        [adminUsername, hashedPassword],
                        (err) => {
                            if (!err) {
                                console.log(`✅ Usuário admin criado: ${adminUsername}`);
                                console.log(`🔑 Senha: ${adminPassword}`);
                            }

                            db.close(() => {
                                console.log('\n✅ Banco de dados resetado com sucesso!');
                                console.log('📝 Pronto para implantação em produção\n');
                                rl.close();
                                resolve();
                            });
                        }
                    );
                });
            } else {
                console.log('\n❌ Operação cancelada');
                rl.close();
                resolve();
            }
        });
    });
}

// Executar
if (require.main === module) {
    resetDatabase();
}

module.exports = { resetDatabase };
