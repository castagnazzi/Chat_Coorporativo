# 🔐 Recuperação de Senha do Administrador

## Visão Geral

Se você perdeu a senha do administrador, não se preocupe! Este guia mostrará como recuperar o acesso usando um script de reset de senha.

---

## 📋 Métodos de Recuperação

### Método 1: Script Automático (Recomendado)

O método mais simples e seguro é usar o script de reset de senha incluído no sistema.

#### Passo a Passo:

1. **Abra o terminal/prompt de comando** na pasta do projeto:
   ```bash
   cd <pasta-do-projeto>
   ```

2. **Execute o script de reset**:

   **Opção A - Usar valores padrão** (username: admin, senha: Admin@123):
   ```bash
   node scripts/reset-admin-password.js
   ```

   **Opção B - Especificar username** (senha padrão: Admin@123):
   ```bash
   node scripts/reset-admin-password.js admin
   ```

   **Opção C - Especificar username E nova senha**:
   ```bash
   node scripts/reset-admin-password.js admin MinhaNovaSenha@123
   ```

3. **Aguarde a confirmação**:
   ```
   ✅ Senha do administrador resetada com sucesso!
   
   📝 Novas credenciais:
      - Username: admin
      - Senha: MinhaNovaSenha@123
      - Role: admin
      - Status: approved
   ```

4. **Faça login** com as novas credenciais

5. **⚠️ IMPORTANTE**: Altere a senha após o primeiro login através do painel admin

---

### Método 2: Reset Manual via Banco de Dados

Se o script não funcionar, você pode resetar manualmente através do SQLite.

#### Requisitos:
- SQLite3 instalado ou DB Browser for SQLite

#### Passo a Passo:

1. **Pare o servidor** (se estiver rodando)

2. **Abra o banco de dados**:
   ```bash
   sqlite3 database.db
   ```

3. **Gere uma nova senha hasheada** usando Node.js:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('NovaSenha@123', 10).then(hash => console.log(hash));"
   ```
   
   Copie o hash gerado (começa com `$2a$10$...`)

4. **Atualize a senha no banco**:
   ```sql
   UPDATE users 
   SET password = 'COLE_O_HASH_AQUI', 
       role = 'admin', 
       status = 'approved' 
   WHERE username = 'admin';
   ```

5. **Verifique a alteração**:
   ```sql
   SELECT username, role, status FROM users WHERE username = 'admin';
   ```

6. **Saia do SQLite**:
   ```sql
   .quit
   ```

7. **Reinicie o servidor** e faça login

---

### Método 3: Recriar Usuário Admin

Como último recurso, você pode deletar e recriar o usuário admin.

⚠️ **ATENÇÃO**: Isso apagará todo o histórico associado ao usuário admin.

#### Passo a Passo:

1. **Pare o servidor**

2. **Abra o banco de dados**:
   ```bash
   sqlite3 database.db
   ```

3. **Delete o admin atual**:
   ```sql
   DELETE FROM users WHERE username = 'admin';
   ```

4. **Saia do SQLite**:
   ```sql
   .quit
   ```

5. **Edite o arquivo `.env`** (ou crie se não existir):
   ```env
   DEFAULT_ADMIN_USERNAME=admin
   DEFAULT_ADMIN_PASSWORD=Admin@123
   ```

6. **Reinicie o servidor**:
   ```bash
   node server.js
   ```

   O servidor detectará que o admin não existe e o recriará automaticamente.

---

## 🛡️ Prevenção de Problemas

### Boas Práticas de Segurança:

1. **Guarde a senha em local seguro**
   - Use um gerenciador de senhas (LastPass, 1Password, Bitwarden)
   - Não anote em papel ou arquivos de texto desprotegidos

2. **Use senhas fortes**
   - Mínimo 8 caracteres
   - Combine letras maiúsculas, minúsculas, números e símbolos
   - Evite palavras comuns ou informações pessoais

3. **Crie um segundo administrador**
   - Tenha sempre um admin de backup
   - Configure através do painel admin

4. **Faça backups regulares**
   - Use o sistema de backup integrado
   - Guarde os backups em local seguro

5. **Configure variáveis de ambiente**
   - Defina `DEFAULT_ADMIN_USERNAME` e `DEFAULT_ADMIN_PASSWORD` no `.env`
   - Isso facilita a recuperação em emergências

---

## 📞 Solução de Problemas

### Erro: "Usuário não encontrado"
- Verifique se digitou o username corretamente
- Use `sqlite3 database.db "SELECT username FROM users WHERE role='admin';"` para listar admins

### Erro: "Senha deve ter pelo menos 6 caracteres"
- Use uma senha mais longa
- Siga as boas práticas de senha forte

### Erro: "Erro ao buscar usuário"
- Verifique se o arquivo `database.db` existe
- Certifique-se de estar na pasta correta do projeto
- Verifique as permissões de acesso ao arquivo

### Script não executa
- Certifique-se de ter o Node.js instalado: `node --version`
- Instale as dependências: `npm install`
- Verifique se está no diretório correto

---

## 🆘 Suporte

Se nenhum método funcionar:

1. **Verifique os logs**:
   - `logs/error.log`
   - `logs/combined.log`

2. **Restaure um backup anterior**:
   ```bash
   node scripts/backup.js
   ```
   E depois restaure via painel admin

3. **Como último recurso**, use o script de reset completo do banco:
   ```bash
   node scripts/reset-database.js
   ```
   ⚠️ **ATENÇÃO**: Isso apagará TODOS os dados!

---

## ✅ Checklist Pós-Recuperação

Após recuperar o acesso:

- [ ] Fiz login com sucesso
- [ ] Alterei a senha para uma nova e segura
- [ ] Salvei a nova senha em local seguro
- [ ] Criei um segundo usuário admin de backup
- [ ] Configurei o arquivo `.env` com credenciais de emergência
- [ ] Fiz um backup do banco de dados

---

**Última atualização**: 13 de Janeiro de 2026
