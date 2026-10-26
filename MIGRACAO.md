# 📋 Guia de Migração e Backup de Dados

## 🎯 Visão Geral

Este documento explica como gerenciar dados, fazer backups do SQLite.

---

## 📦 Sistema de Backup

### Backup via Painel Admin (Interface Gráfica) ⭐ NOVO!
1. Faça login como administrador
2. Clique no botão **"📊 BI"** no header
3. No painel administrativo, clique em **"💾 Backup"**
4. Confirme a operação
5. O backup será criado automaticamente em `./backups/`

### Restaurar Backup via Painel Admin ⭐ NOVO!
1. No painel administrativo, clique em **"♻️ Restaurar"**
2. Selecione o backup desejado da lista
3. Digite **"CONFIRMAR"** quando solicitado
4. ⚠️ ATENÇÃO: Todos os dados atuais serão substituídos!
5. O servidor será reiniciado automaticamente

### Backup Manual via Terminal
```bash
# Criar backup do banco de dados
npm run backup

# Listar backups disponíveis
npm run backup:list
```

### Backups Automáticos
- Backups são salvos em `./backups/`
- Mantém automaticamente os últimos 10 backups
- Nomeia arquivos com timestamp: `database_2026-01-11T10-30-00.db`

### Restaurar Backup
```bash
# 1. Pare o servidor
# 2. Substitua o arquivo database.db pelo backup desejado
copy backups\database_2026-01-11T10-30-00.db database.db
# 3. Reinicie o servidor
```

---

## 📤 Exportação de Dados

### Exportar para JSON
```bash
# Exportar todos os dados para JSON
npm run export

# Arquivo será salvo em: exports/export_YYYY-MM-DDTHH-MM-SS.json
```

**Use exportação JSON para:**
- ✅ Análise de dados externamente
- ✅ Backup legível em qualquer sistema
- ✅ Transferência entre servidores

### Estrutura do Arquivo Exportado
```json
{
  "exportDate": "2026-01-11T10:30:00.000Z",
  "version": "1.0.0",
  "tables": {
    "users": [...],
    "messages": [...],
    "groups": [...],
    "group_members": [...]
  }
}
```

---

## 📥 Importação de Dados

### Importar de JSON
```bash
# ATENÇÃO: Isso apaga todos os dados atuais!
npm run import exports/export_2026-01-11T10-30-00.json
```

⚠️ **CUIDADO:** A importação SOBRESCREVE todos os dados atuais!

---

## 🔄 Reset do Banco de Dados (Produção)

### Quando Usar
- ✅ Antes de implantar em produção (remover dados de teste)
- ✅ Começar do zero com estrutura atualizada
- ✅ Após desenvolvimento/testes

### Como Resetar
```bash
npm run reset

# O script irá:
# 1. Criar backup automático de segurança
# 2. Pedir confirmação (digite "CONFIRMAR")
# 3. Apagar banco atual
# 4. Criar novo banco zerado
# 5. Criar apenas usuário admin padrão
```

---

## 🚀 Procedimento de Implantação em Produção

### Passo a Passo Recomendado

1. **Exportar dados de teste (opcional)**
   ```bash
   npm run export
   ```

2. **Resetar banco de dados**
   ```bash
   npm run reset
   ```

3. **Configurar variáveis de ambiente**
   ```bash
   # Edite .env para produção
   DEFAULT_ADMIN_USERNAME=seu_admin
   DEFAULT_ADMIN_PASSWORD=SenhaSegura@2026
   NODE_ENV=production
   ```

4. **Iniciar servidor**
   ```bash
   npm start
   ```

5. **Fazer login com admin e criar usuários reais**

---

## 🔮 Migração para MySQL

Prevista para uma atualização futura deste repositório.

---

## 📊 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run backup` | Criar backup do banco atual |
| `npm run backup:list` | Listar backups disponíveis |
| `npm run export` | Exportar dados para JSON |
| `npm run import <arquivo>` | Importar dados de JSON |
| `npm run reset` | Resetar banco (apaga tudo) |

---

## 🛡️ Boas Práticas

### Durante Desenvolvimento
- ✅ Fazer backup antes de mudanças grandes
- ✅ Exportar dados periodicamente
- ✅ Testar importação em ambiente de teste

### Antes da Produção
- ✅ Fazer reset completo para remover dados de teste
- ✅ Configurar senhas fortes no .env
- ✅ Fazer backup imediato após começar a usar

### Em Produção
- ✅ Backup diário automatizado (adicionar ao cron/task scheduler)
- ✅ Exportar JSON semanalmente
- ✅ Manter backups em local seguro (externo ao servidor)
- ✅ Testar restauração de backup periodicamente

---

## 🆘 Recuperação de Desastres

### Se perder dados
1. Pare o servidor
2. Verifique backups disponíveis (`npm run backup:list`)
3. Restaure o backup mais recente
4. Reinicie o servidor

### Se o banco corromper
1. Tente abrir com SQLite Browser
2. Se não funcionar, restaure último backup
3. Se não tiver backup, use último JSON exportado

---

## 📞 Suporte

Se precisar de ajuda com:
- ✅ Automação de backups
- ✅ Implementação de ORM
- ✅ Scripts customizados

**Entre em contato com o desenvolvedor.**

---

## 📝 Notas de Versão

### v1.0.0 (Janeiro 2026)
- ✅ Sistema de backup automático
- ✅ Exportação/importação JSON
- ✅ Script de reset para produção
- ✅ Documentação completa
- ✅ Banco SQLite
