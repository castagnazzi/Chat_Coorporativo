/**
 * Script de Exportação de Dados
 * Exporta dados do SQLite para JSON (útil para migração)
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || './database.db';
const EXPORT_DIR = './exports';

// Criar diretório de exportação se não existir
if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

async function exportData() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('❌ Erro ao conectar ao banco:', err.message);
                reject(err);
                return;
            }
        });

        const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0.0',
            tables: {}
        };

        const tables = ['users', 'messages', 'groups', 'group_members'];
        let completed = 0;

        tables.forEach(table => {
            db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
                if (err) {
                    console.error(`❌ Erro ao exportar tabela ${table}:`, err.message);
                } else {
                    exportData.tables[table] = rows;
                    console.log(`✅ Tabela '${table}' exportada: ${rows.length} registros`);
                }
                
                completed++;
                if (completed === tables.length) {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                    const exportPath = path.join(EXPORT_DIR, `export_${timestamp}.json`);
                    
                    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
                    
                    const stats = fs.statSync(exportPath);
                    console.log(`\n📦 Exportação concluída: ${exportPath}`);
                    console.log(`📊 Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
                    
                    db.close();
                    resolve(exportPath);
                }
            });
        });
    });
}

async function importData(filePath) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            console.error('❌ Arquivo de importação não encontrado:', filePath);
            reject(new Error('Arquivo não encontrado'));
            return;
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const db = new sqlite3.Database(DB_PATH);

        console.log(`📥 Importando dados de: ${filePath}`);
        console.log(`📅 Exportado em: ${data.exportDate}`);

        db.serialize(() => {
            // Desabilitar foreign keys temporariamente
            db.run('PRAGMA foreign_keys = OFF');

            // Limpar tabelas existentes (CUIDADO!)
            db.run('DELETE FROM group_members');
            db.run('DELETE FROM groups');
            db.run('DELETE FROM messages');
            db.run('DELETE FROM users');

            // Importar dados
            const tables = Object.keys(data.tables);
            tables.forEach(table => {
                const rows = data.tables[table];
                if (rows.length === 0) {
                    console.log(`⚠️  Tabela '${table}' vazia, pulando...`);
                    return;
                }

                const columns = Object.keys(rows[0]);
                const placeholders = columns.map(() => '?').join(',');
                const stmt = db.prepare(`INSERT INTO ${table} (${columns.join(',')}) VALUES (${placeholders})`);

                rows.forEach(row => {
                    const values = columns.map(col => row[col]);
                    stmt.run(values);
                });

                stmt.finalize();
                console.log(`✅ Tabela '${table}' importada: ${rows.length} registros`);
            });

            // Reabilitar foreign keys
            db.run('PRAGMA foreign_keys = ON');

            db.close(() => {
                console.log('\n✅ Importação concluída com sucesso!');
                resolve();
            });
        });
    });
}

// Executar quando chamado diretamente
if (require.main === module) {
    const command = process.argv[2];
    const filePath = process.argv[3];

    if (command === 'import' && filePath) {
        importData(filePath).catch(console.error);
    } else if (command === 'export') {
        exportData().catch(console.error);
    } else {
        console.log('Uso:');
        console.log('  node export-data.js export          - Exportar dados');
        console.log('  node export-data.js import <file>   - Importar dados');
    }
}

module.exports = { exportData, importData };
