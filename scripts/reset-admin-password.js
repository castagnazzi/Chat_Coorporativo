#!/usr/bin/env node

/**
 * Script para Resetar Senha do Administrador
 * 
 * USO:
 * node scripts/reset-admin-password.js [username] [nova-senha]
 * 
 * Se não informar username, usa 'admin' por padrão
 * Se não informar senha, usa 'Admin@123' por padrão
 * 
 * EXEMPLOS:
 * node scripts/reset-admin-password.js
 * node scripts/reset-admin-password.js admin NovaSenha@456
 * node scripts/reset-admin-password.js meuadmin Senha@789
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

// Argumentos da linha de comando
const args = process.argv.slice(2);
const username = args[0] || process.env.DEFAULT_ADMIN_USERNAME || 'admin';
const newPassword = args[1] || 'Admin@123';

// Validar senha
if (newPassword.length < 6) {
    console.error('❌ Erro: A senha deve ter pelo menos 6 caracteres.');
    process.exit(1);
}

const dbPath = process.env.DB_PATH || './database.db';
const db = new sqlite3.Database(dbPath);

console.log('\n🔧 Iniciando reset de senha do administrador...\n');

// Verificar se o usuário existe
db.get("SELECT id, username, role FROM users WHERE username = ?", [username], async (err, user) => {
    if (err) {
        console.error('❌ Erro ao buscar usuário:', err.message);
        db.close();
        process.exit(1);
    }
    
    if (!user) {
        console.error(`❌ Erro: Usuário "${username}" não encontrado no banco de dados.`);
        console.log('\n💡 Dica: Verifique se o nome de usuário está correto.');
        db.close();
        process.exit(1);
    }
    
    console.log(`📋 Usuário encontrado:`);
    console.log(`   - Username: ${user.username}`);
    console.log(`   - Role: ${user.role}`);
    console.log(`   - ID: ${user.id}\n`);
    
    // Gerar hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Atualizar senha e garantir que o usuário é admin e está aprovado
    db.run(
        "UPDATE users SET password = ?, role = 'admin', status = 'approved' WHERE username = ?",
        [hashedPassword, username],
        function(err) {
            if (err) {
                console.error('❌ Erro ao atualizar senha:', err.message);
                db.close();
                process.exit(1);
            }
            
            if (this.changes === 0) {
                console.error('❌ Nenhuma alteração foi feita. Verifique o usuário.');
                db.close();
                process.exit(1);
            }
            
            console.log('✅ Senha do administrador resetada com sucesso!\n');
            console.log('📝 Novas credenciais:');
            console.log(`   - Username: ${username}`);
            console.log(`   - Senha: ${newPassword}`);
            console.log(`   - Role: admin`);
            console.log(`   - Status: approved\n`);
            console.log('⚠️  IMPORTANTE: Guarde esta senha em local seguro!\n');
            console.log('🔒 Recomendação: Altere esta senha após o primeiro login.\n');
            
            db.close();
            process.exit(0);
        }
    );
});
