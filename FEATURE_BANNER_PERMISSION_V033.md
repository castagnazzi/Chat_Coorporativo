# 📢 Permissão de Edição do Banner - v0.3.3

## ✅ Funcionalidade Adicionada

### O que foi feito:
- **Nova permissão** no dashboard para admin definir quais usuários podem editar o aviso do banner
- **Coluna "📢 BANNER"** adicionada na tabela de usuários do dashboard
- **Badge interativo** que mostra e permite alterar a permissão com um click

---

## 🔧 Alterações Realizadas

### Frontend (index.html):

**1. Tabela do Dashboard:**
- Adicionada nova coluna "📢 BANNER" no header da tabela
- Atualizado `colspan` de 5 para 6 na mensagem "Nenhum usuário encontrado"

**2. Renderização dos Usuários:**
```javascript
const canEditBanner = u.can_edit_banner || u.role === 'admin';
const bannerBadge = canEditBanner
    ? `<span style="...">✅ Editar</span>`   // Verde
    : `<span style="...">❌ Não</span>`;      // Cinza
```

**3. Função `toggleBannerPermission()`:**
- Envia requisição POST para `/admin/toggle-banner-permission`
- Atualiza dashboard após alteração
- Mostra confirmação com nome do usuário

**4. Verificação de Permissão no Banner:**
```javascript
const canEditBanner = meuUser && (meuUser.role === 'admin' || meuUser.can_edit_banner);
if (canEditBanner) {
    editBtn.style.display = 'block';
} else {
    editBtn.style.display = 'none';
}
```

### Backend (server.js):

**1. Nova Coluna no Banco:**
```sql
ALTER TABLE users ADD COLUMN can_edit_banner INTEGER DEFAULT 0
```

**2. Novo Endpoint:**
```
POST /admin/toggle-banner-permission
Body: { userId, canEdit }
Response: { success, message }
```

**3. Atualizações em Endpoints Existentes:**
- `/login` - Retorna `can_edit_banner` no objeto user
- `/users-list` - Inclui `can_edit_banner` no SELECT
- `/admin/users-full` - Inclui `can_edit_banner` no SELECT

---

## 🎯 Como Usar

### Para o Administrador:

1. Fazer login como admin
2. Click em 📊 BI no header
3. Na tabela de usuários, localize a coluna **"📢 BANNER"**
4. Click no badge (✅ Editar ou ❌ Não)
5. Confirmar alteração
6. Dashboard recarrega com permissão atualizada

### Resultado:
- Usuário com permissão vê badge **verde** "✅ Editar"
- Usuário sem permissão vê badge **cinza** "❌ Não"
- Click alterna entre os dois estados

---

## 🔐 Regras de Permissão

**Quem pode editar o banner:**
1. ✅ Administradores (sempre podem)
2. ✅ Usuários com `can_edit_banner = 1`

**Quem NÃO pode editar:**
1. ❌ Usuários comuns sem permissão
2. ❌ Usuários pendentes (status = 'pending')

**Comportamento:**
- Admin concede permissão → botão 📢 Avisos aparece para o usuário
- Admin remove permissão → botão 📢 Avisos desaparece
- Permissão persiste no banco de dados
- Alteração é imediata (não precisa de logout)

---

## 📊 Estrutura do Banco

### Tabela `users`:
```sql
...,
can_edit_banner INTEGER DEFAULT 0  -- 0 = sem permissão, 1 = com permissão
```

### Padrão:
- Novos usuários: `can_edit_banner = 0` (sem permissão)
- Admin: sempre pode editar (verifica `role === 'admin'`)

---

## 🧪 Testes

### Teste 1: Conceder Permissão
1. Login como admin
2. Abrir dashboard (📊 BI)
3. Click em "❌ Não" de um usuário
4. Confirmar
5. Badge muda para "✅ Editar" (verde)
6. Usuário agora vê botão 📢 Avisos

### Teste 2: Remover Permissão
1. Login como admin
2. Abrir dashboard
3. Click em "✅ Editar" de um usuário
4. Confirmar
5. Badge muda para "❌ Não" (cinza)
6. Usuário não vê mais botão 📢 Avisos

### Teste 3: Usuário com Permissão
1. Login como usuário com `can_edit_banner = 1`
2. Ver botão 📢 Avisos no header
3. Click para abrir modal de avisos
4. Editar e salvar aviso
5. Banner atualiza para todos

---

## ✅ Status

**Funcionalidade implementada com sucesso!** ✨

- ✅ Coluna BANNER no dashboard
- ✅ Toggle de permissão funcional
- ✅ Backend com endpoint dedicado
- ✅ Coluna no banco criada
- ✅ Verificação de permissão no banner
- ✅ Persistência de permissão

---

**Data:** Abril/2026  
**Versão:** v0.3.3  
**Feature:** Permissão de Edição do Banner
