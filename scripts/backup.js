/**
 * Script de Backup Automático do Banco de Dados
 * Cria cópias de segurança do SQLite com timestamp
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || './database.db';
const BACKUP_DIR = './backups';

// Criar diretório de backups se não existir
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function createBackup() {
    if (!fs.existsSync(DB_PATH)) {
        console.log('❌ Banco de dados não encontrado:', DB_PATH);
        return false;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupPath = path.join(BACKUP_DIR, `database_${timestamp}.db`);

    try {
        fs.copyFileSync(DB_PATH, backupPath);
        const stats = fs.statSync(backupPath);
        console.log(`✅ Backup criado: ${backupPath}`);
        console.log(`📦 Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
        
        // Limpar backups antigos (manter últimos 10)
        cleanOldBackups();
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao criar backup:', error.message);
        return false;
    }
}

function cleanOldBackups() {
    try {
        const files = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith('database_') && f.endsWith('.db'))
            .map(f => ({
                name: f,
                path: path.join(BACKUP_DIR, f),
                time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time);

        // Manter apenas os últimos 10 backups
        if (files.length > 10) {
            files.slice(10).forEach(file => {
                fs.unlinkSync(file.path);
                console.log(`🗑️  Backup antigo removido: ${file.name}`);
            });
        }
    } catch (error) {
        console.error('⚠️  Erro ao limpar backups antigos:', error.message);
    }
}

function listBackups() {
    try {
        const files = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith('database_') && f.endsWith('.db'))
            .map(f => {
                const stats = fs.statSync(path.join(BACKUP_DIR, f));
                return {
                    name: f,
                    date: stats.mtime.toLocaleString('pt-BR'),
                    size: `${(stats.size / 1024).toFixed(2)} KB`
                };
            })
            .sort((a, b) => b.date.localeCompare(a.date));

        if (files.length === 0) {
            console.log('📁 Nenhum backup encontrado');
        } else {
            console.log('\n📋 Backups disponíveis:');
            files.forEach((file, i) => {
                console.log(`  ${i + 1}. ${file.name}`);
                console.log(`     Data: ${file.date} | Tamanho: ${file.size}`);
            });
        }
    } catch (error) {
        console.error('❌ Erro ao listar backups:', error.message);
    }
}

// Executar quando chamado diretamente
if (require.main === module) {
    const command = process.argv[2];
    
    if (command === 'list') {
        listBackups();
    } else {
        createBackup();
    }
}

module.exports = { createBackup, listBackups };
