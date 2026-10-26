# 📂 Scripts do Messenger

## 📋 Índice

- [Scripts de Backup](#-scripts-de-backup)
- [Exportação de Dados](#-exportação-de-dados)
- [Scripts de Administração](#-scripts-de-administração)

---

## 💾 Scripts de Backup

### `backup.js`
Cria backups do banco de dados SQLite.

```bash
# Criar backup
npm run backup

# Listar backups disponíveis
npm run backup:list
```

**Local dos backups:** `./backups/`

---

## 📤 Exportação de Dados

### `export-data.js`
Exporta dados do SQLite para JSON.

```bash
# Exportar todos os dados
npm run export

# Importar de um arquivo JSON
npm run import exports/export_2026-02-09T12-30-00.json
```

**Útil para:**
- Backup portátil
- Migração para outros sistemas
- Análise externa dos dados

---

## ⚙️ Scripts de Administração

### `reset-database.js`
Reseta o banco de dados (apaga todos os dados).

```bash
npm run reset
```

**⚠️ CUIDADO:** Apaga TODOS os dados!

**Quando usar:**
- Antes de implantar em produção
- Para remover dados de teste
- Começar do zero

---

### `reset-admin-password.js`
Reseta a senha do administrador.

```bash
npm run reset-admin
```

**Útil quando:**
- Esqueceu a senha do admin
- Precisa reconfigurar acesso

---

## 📊 Resumo de Comandos

| Comando | Descrição |
|---------|-----------|
| `npm run backup` | Criar backup SQLite |
| `npm run backup:list` | Listar backups |
| `npm run export` | Exportar para JSON |
| `npm run import <arquivo>` | Importar de JSON |
| `npm run reset` | Resetar banco |
| `npm run reset-admin` | Resetar senha admin |

---

## 📚 Documentação

- [Manual do Usuário](../MANUAL_DO_USUARIO.md)
- [Notas de Versão](../NOTAS_DE_VERSAO.md)

---

**Última atualização:** Fevereiro 2026  
**Versão:** 1.0.0
