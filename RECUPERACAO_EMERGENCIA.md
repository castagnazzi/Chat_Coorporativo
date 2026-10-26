# 🆘 Guia de Recuperação de Emergência

## ⚠️ Se o Servidor Parou Após Restaurar Backup

### Sintomas:
- ❌ Servidor não responde
- ❌ Perdeu acesso como admin
- ❌ Não consegue criar nova conta

### Solução Rápida (3 passos):

#### 1️⃣ **Restaurar Backup de Segurança**
```bash
cd <pasta-do-projeto>
copy backups\pre-restore_*.db database.db
```
*Use o backup `pre-restore_*` mais recente*

#### 2️⃣ **Parar Processo que Está Travado**
```bash
# Encontrar o processo
netstat -ano | findstr :3000

# Matar o processo (substitua PID pelo número encontrado)
taskkill //F //PID <PID>
```

#### 3️⃣ **Reiniciar Servidor**
```bash
npm start
```

---

## 🔧 Solução Completa Passo a Passo

### Cenário: Servidor travou após restauração

```bash
# 1. Ir para a pasta do projeto
cd <pasta-do-projeto>

# 2. Listar backups disponíveis
dir backups\*.db

# 3. Copiar o backup de segurança mais recente
copy backups\pre-restore_2026-01-11T18-18-57.db database.db

# 4. Encontrar processo travado na porta 3000
netstat -ano | findstr :3000

# 5. Matar o processo (exemplo: PID 28412)
taskkill //F //PID 28412

# 6. Reiniciar servidor
npm start
```

---

## 🛡️ Como Evitar Esse Problema

### ✅ Correções Aplicadas

O código foi atualizado para:
1. ✅ Fechar o banco de forma segura antes de restaurar
2. ✅ Aguardar 1 segundo antes de copiar o arquivo
3. ✅ Reconectar automaticamente após restaurar
4. ✅ Desconectar usuários de forma suave
5. ✅ Não encerrar mais o processo do servidor

### 🔄 Nova Restauração (corrigida):
- Banco fecha → Arquivo é copiado → Banco reabre
- **Servidor continua rodando**
- Usuários são desconectados e reconectam automaticamente

---

## 📋 Backup de Segurança Automático

Sempre que você restaura um backup, o sistema:
1. ✅ Cria arquivo `pre-restore_<timestamp>.db`
2. ✅ Salva em `./backups/`
3. ✅ Permite reverter se algo der errado

**Exemplo:**
```
backups/
├── pre-restore_2026-01-11T18-13-16.db  ← Estado antes da restauração
├── database_2026-01-11T18-10-20.db     ← Backup normal
└── database_2026-01-11T18-11-43.db     ← Backup normal
```

---

## 🔐 Resetar Senha do Admin

Se perdeu acesso ao admin:

### Opção 1: Via Terminal
```bash
npm run reset
# Digite: CONFIRMAR
```

### Opção 2: Via Painel Admin (se tiver outro admin)
1. Login com outro admin
2. Clique em **📊 BI**
3. Clique em **🔄 Reset**
4. Digite: RESETAR
5. Login: `admin` / `Admin@123`

### Opção 3: Criar Admin Manualmente
```bash
# Instalar sqlite3
npm install -g sqlite3

# Abrir banco
sqlite3 database.db

# Atualizar senha (já hasheada para: Admin@123)
UPDATE users SET password='$2a$10$rZ0YqQY5F0IlQCGqFk5x.eXqZwXqFqZXqZwXqFqZXqZwXqFqZXqZ' WHERE username='admin';

# Sair
.exit
```

---

## 🚨 Problemas Comuns

### Problema: "Error: listen EADDRINUSE: address already in use :::3000"

**Causa:** Outro processo está usando a porta 3000

**Solução:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill //F //PID <PID>

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Problema: "SQLITE_BUSY: database is locked"

**Causa:** Banco de dados está sendo usado por outro processo

**Solução:**
```bash
# 1. Parar o servidor (Ctrl+C)
# 2. Matar todos os processos Node
taskkill //F //IM node.exe
# 3. Reiniciar
npm start
```

### Problema: Banco corrompido

**Causa:** Desligamento abrupto durante operação

**Solução:**
```bash
# 1. Restaurar último backup válido
copy backups\database_2026-01-11T18-10-20.db database.db

# 2. OU exportar/importar JSON
npm run export
npm run import exports\export_<timestamp>.json
```

---

## 📞 Checklist de Verificação

Antes de entrar em pânico, verifique:

- [ ] Servidor está rodando? (`netstat -ano | findstr :3000`)
- [ ] Banco de dados existe? (`dir database.db`)
- [ ] Há backups disponíveis? (`dir backups\*.db`)
- [ ] Porta 3000 está livre? (sem EADDRINUSE)
- [ ] Consegue fazer login? (tente `admin` / `Admin@123`)

---

## 🔄 Procedimento de Recuperação Total

Se nada funcionar, recuperação completa:

```bash
# 1. Backup atual (por precaução)
copy database.db database.db.old

# 2. Parar tudo
taskkill //F //IM node.exe

# 3. Restaurar último backup bom
copy backups\database_2026-01-11T18-10-20.db database.db

# 4. Limpar cache do npm
npm cache clean --force

# 5. Reinstalar dependências
npm install

# 6. Iniciar servidor
npm start

# 7. Verificar no navegador
# http://localhost:3000
```

---

## 💾 Manter Backups Seguros

### Estratégia Recomendada:

1. **Backups automáticos diários**
   - Agendar `npm run backup` no Task Scheduler

2. **Exportar JSON semanalmente**
   - Mais portável e legível
   ```bash
   npm run export
   ```

3. **Manter cópias externas**
   - Copiar `backups/` para outro drive
   - Upload para cloud (Google Drive, Dropbox, etc.)

4. **Testar restauração mensalmente**
   - Garantir que backups funcionam
   - Praticar procedimento de recuperação

---

## 📧 Contato de Suporte

Se precisar de ajuda adicional:
- 📖 Veja [MIGRACAO.md](MIGRACAO.md)
- 📋 Veja [BACKUP_GUIA_RAPIDO.md](BACKUP_GUIA_RAPIDO.md)
- 📝 Veja logs em `logs/error.log`

---

**Última atualização:** Janeiro 2026  
**Versão:** 2.1.0 (com correções de restauração)
