# 🚀 Guia Rápido: Backup e Restauração

## ✨ Novidade: Backup Direto no Painel Admin!

### 📦 Como Criar Backup (3 cliques!)

1. **Login como Admin** 
   - Entre com usuário administrador

2. **Abrir Painel BI**
   - Clique no botão **📊 BI** no topo da tela

3. **Criar Backup**
   - Clique no botão **💾 Backup**
   - Confirme a operação
   - ✅ Pronto! Backup criado em `./backups/`

---

### ♻️ Como Restaurar Backup

1. **Abrir Painel BI**
   - Clique no botão **📊 BI**

2. **Restaurar**
   - Clique no botão **♻️ Restaurar**
   - Escolha o backup da lista
   - Digite **"CONFIRMAR"** (em maiúsculas)

3. **Aguardar Reconexão Automática**
   - O banco será restaurado automaticamente
   - Todos os usuários serão desconectados
   - A página recarregará sozinha em 2 segundos
   - **Nenhuma ação manual necessária!** ✨

---

## ⚙️ O que Acontece nos Bastidores

**Durante a Restauração:**
1. 🔒 Backup de segurança é criado automaticamente (pre-restore_*)
2. 📦 Arquivo do banco é substituído pelo backup escolhido
3. 🔄 Conexão do banco é fechada e reaberta automaticamente
4. 👥 Usuários conectados são desconectados
5. 🌐 Páginas recarregam automaticamente em 2 segundos
6. ✅ Serviço volta ao ar sem intervenção manual!

**Não precisa fazer nada!** O sistema cuida de tudo. 🎉

### Antes de Restaurar:
- ✅ **Um backup automático do estado atual será criado** antes da restauração
- ✅ Todos os dados atuais serão substituídos pelos dados do backup
- ✅ Todos os usuários conectados serão desconectados
- ✅ O servidor reiniciará automaticamente

### Boas Práticas:
- 📅 **Faça backups diários** em produção
- 💾 **Mantenha backups em local seguro** (externo ao servidor)
- 🧪 **Teste a restauração** periodicamente
- 📝 **Documente quando faz backups** importantes

---

## 🛠️ Backups Via Terminal (Alternativa)

### Criar Backup
```bash
npm run backup
```

### Listar Backups
```bash
npm run backup:list
```

### Exportar para JSON
```bash
npm run export
```

### Importar de JSON
```bash
npm run import exports/export_2026-01-11T10-30-00.json
```

---

## 📁 Estrutura de Arquivos

```
messenger/
├── database.db           # Banco de dados atual
├── backups/              # Backups automáticos
│   ├── database_2026-01-11T10-30-00.db
│   ├── database_2026-01-11T15-45-12.db
│   └── pre-restore_*.db  # Backup de segurança antes de restaurar
└── exports/              # Exportações JSON
    └── export_2026-01-11T10-30-00.json
```

---

## 🆘 Recuperação de Emergência

### Se algo der errado após restaurar:

1. **Backup de segurança foi criado automaticamente**
   - Procure em `./backups/` por arquivo `pre-restore_*.db`

2. **Restaurar o backup de segurança**
   - Use o botão "♻️ Restaurar" novamente
   - Escolha o arquivo `pre-restore_*.db`

3. **Ou restaurar manualmente**
   ```bash
   # Parar servidor (Ctrl+C)
   copy backups\pre-restore_*.db database.db
   npm start
   ```

---

## 🎯 Cenários de Uso

### Antes de Atualizar o Sistema
```
1. 💾 Criar Backup
2. 🔄 Fazer atualização
3. ✅ Se tudo OK, manter
4. ❌ Se houver problema, restaurar backup
```

### Antes de Implantar em Produção
```
1. 💾 Criar Backup dos dados de teste
2. 🗑️ Resetar banco (npm run reset)
3. 🚀 Iniciar produção limpa
```

### Migração de Servidor
```
1. 💾 Criar Backup no servidor antigo
2. 📤 Exportar para JSON
3. 📥 Transferir arquivos
4. ♻️ Restaurar no servidor novo
```

---

## 💡 Dicas Pro

1. **Agendar Backups Automáticos**
   - Windows: Task Scheduler
   - Linux: Cron Job
   ```bash
   # Exemplo cron (todos os dias às 3h)
   0 3 * * * cd /caminho/projeto && npm run backup
   ```

2. **Backup antes de operações críticas**
   - Deletar muitos usuários
   - Alterações em massa
   - Testes de novas funcionalidades

3. **Manter múltiplas versões**
   - Sistema mantém automaticamente 10 últimos backups
   - Backups mais antigos são removidos automaticamente

---

## 📞 Suporte

Dúvidas ou problemas? Consulte:
- 📋 [MIGRACAO.md](MIGRACAO.md) - Guia completo
- 📖 [README.md](README.md) - Documentação geral
- 📝 [MANUAL_DO_USUARIO.md](MANUAL_DO_USUARIO.md) - Manual do usuário

---

**Última atualização:** Janeiro 2026  
**Versão:** 2.0.0
