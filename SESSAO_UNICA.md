# Sistema de Sessão Única

## 📋 Descrição

Implementado sistema de **sessão única** que impede múltiplos logins simultâneos do mesmo usuário em diferentes dispositivos ou navegadores.

## ✨ Funcionalidade

Quando um usuário faz login em um novo dispositivo/navegador:
- ✅ A sessão anterior é **automaticamente desconectada**
- ✅ O usuário na sessão antiga recebe uma **notificação visual clara**
- ✅ Mensagem explicativa: *"Você foi desconectado porque sua conta foi acessada em outro dispositivo"*
- ✅ Modal com botão para fazer login novamente

## 🔧 Implementação Técnica

### Backend (server.js)

1. **Mapa de Usuários Conectados**
   ```javascript
   const connectedUsers = new Map(); // username -> socketId
   ```

2. **Lógica no Evento 'join'**
   - Verifica se usuário já está conectado
   - Se SIM: desconecta sessão anterior enviando evento `sessionExpired`
   - Registra nova sessão no mapa

3. **Limpeza no 'disconnect'**
   - Remove usuário do mapa quando desconecta

### Frontend (index.html)

1. **Listener `sessionExpired`**
   - Exibe modal explicativo
   - Toca som de alerta
   - Limpa dados do localStorage
   - Desconecta socket automaticamente

## 🎯 Benefícios

- ✅ **Segurança**: Evita uso não autorizado de contas
- ✅ **Controle**: Apenas 1 sessão ativa por usuário
- ✅ **Transparência**: Usuário é informado claramente do motivo
- ✅ **Experiência**: Mensagens claras e interface amigável

## 🔍 Logs

O sistema registra no log do servidor:
- Quando uma sessão anterior é desconectada
- Username e socketId de ambas as conexões
- Timestamps de conexão e desconexão

## 📱 Cenários de Uso

### Cenário 1: Login Normal
- Usuário faz login no computador do trabalho ✅

### Cenário 2: Segundo Login
- Mesmo usuário tenta fazer login no celular
- Computador do trabalho é **desconectado automaticamente**
- Celular agora é a sessão ativa ✅

### Cenário 3: Tentativa de Login Simultâneo
- Não é possível manter 2 sessões ativas
- Sempre prevalece a **última conexão**

## 🛡️ Segurança

Esta funcionalidade adiciona uma camada extra de segurança ao sistema, garantindo que:
- Credenciais compartilhadas indevida são detectadas
- Apenas 1 dispositivo pode usar a conta por vez
- Violações são registradas nos logs do servidor

## 📝 Notas

- A desconexão é **instantânea** e automática
- Não há período de "graça" ou aviso prévio
- A sessão mais recente sempre prevalece
- Logs detalhados ajudam na auditoria

---
**Data de Implementação**: 21 de Janeiro de 2026
**Versão**: 1.0
