# 📖 Manual do Usuário - Messenger Corporativo v2.0

## 🚀 Índice
1. [Instalação](#instalação)
2. [Primeiro Acesso](#primeiro-acesso)
3. [Funcionalidades Básicas](#funcionalidades-básicas)
4. [Funcionalidades Avançadas](#funcionalidades-avançadas)
5. [Atalhos de Teclado](#atalhos-de-teclado)
6. [Dicas e Truques](#dicas-e-truques)
7. [Perguntas Frequentes](#perguntas-frequentes)

---

## 📥 Instalação

### Requisitos
- Node.js 14+ instalado
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Porta configurada em PORT (.env) disponível

### Passos
1. Abra o terminal na pasta do projeto
2. Execute: `node server.js`
3. Abra o navegador em `http://localhost:PORTA (ex.: 3000)`

✅ Pronto! O sistema está rodando.

---

## 🔐 Primeiro Acesso

### Login como Administrador
- **Usuário**: `admin`
- **Senha**: `123`

O usuário admin é criado automaticamente na primeira execução.

### Criar Nova Conta
1. Na tela de login, clique em **"✨ Criar nova conta"**
2. Preencha:
   - Usuário (ex: joao.silva)
   - Setor (ex: TI, RH, Vendas)
   - Senha
3. Clique em **"✅ Criar Conta"**
4. Aguarde aprovação do administrador

### Aprovar Usuários (Admin)
1. Faça login como admin
2. Clique em **"Gerenciar"** no topo
3. Na lista de usuários, clique em **"✅"** para aprovar

---

## 💬 Funcionalidades Básicas

### Enviar Mensagem
1. Selecione um contato na lista lateral
2. Digite a mensagem no campo inferior
3. Pressione **Enter** ou clique em **➤**

### Enviar Emoji
1. Clique no botão **😊** ao lado do campo de mensagem
2. Selecione o emoji desejado
3. Emoji será inserido na mensagem

### Enviar Arquivo
**Método 1 - Botão:**
1. Clique no ícone **📎**
2. Selecione o arquivo
3. Arquivo será enviado automaticamente

**Método 2 - Arrastar e Soltar:**
1. Arraste arquivo do seu computador
2. Solte sobre a área de chat
3. Arquivo será enviado automaticamente

### Buscar Contatos
1. Digite no campo "🔍 Buscar contatos..."
2. Resultados aparecem em tempo real
3. Busca por nome ou setor

---

## ⭐ Funcionalidades Avançadas

### ✏️ Editar Mensagem

**Como fazer:**
1. Passe o mouse sobre sua mensagem
2. Clique no botão **✏️**
3. Edite o texto no campo de entrada
4. Pressione **Enter** para salvar

**Observações:**
- Apenas suas próprias mensagens podem ser editadas
- Mensagem editada mostra indicador "(editada)"
- Edição aparece em tempo real para o destinatário

---

### 🗑️ Excluir Mensagem

**Como fazer:**
1. Passe o mouse sobre sua mensagem
2. Clique no botão **🗑️**
3. Confirme a exclusão

**Observações:**
- Apenas suas próprias mensagens podem ser excluídas
- Mensagem é removida para ambos os usuários
- Ação não pode ser desfeita

---

### ↩️ Responder Mensagem

**Como fazer:**
1. Passe o mouse sobre mensagem recebida
2. Clique no botão **↩️**
3. Barra azul "Respondendo:" aparece
4. Digite sua resposta
5. Pressione **Enter** para enviar

**Cancelar resposta:**
- Clique no **✕** na barra azul
- Ou pressione **ESC**

---

### 📋 Copiar Texto

**Como fazer:**
1. Passe o mouse sobre qualquer mensagem
2. Clique no botão **📋**
3. Texto é copiado para área de transferência

**Uso:**
- Cole com **Ctrl + V** em qualquer aplicativo

---

### 🌙 Alternar Tema

**Como fazer:**
1. Clique no botão **🌙** (ou **☀️**) no cabeçalho do chat
2. Tema alterna entre claro e escuro
3. Preferência é salva automaticamente

**Quando usar:**
- 🌙 Tema escuro: uso noturno ou ambientes com pouca luz
- ☀️ Tema claro: uso diurno ou preferência pessoal

---

### 🔗 Links Automáticos

**Como funciona:**
- Ao enviar um link (http:// ou https://), preview é gerado automaticamente
- Preview mostra domínio e URL completa
- Clique no preview para abrir em nova aba

**Exemplo:**
```
Enviando: https://www.google.com
Preview aparece: 🔗 www.google.com
```

---

## ⌨️ Atalhos de Teclado

### Navegação
| Atalho | Ação |
|--------|------|
| **Ctrl + K** | Focar no campo de busca de contatos |
| **ESC** | Fechar modal / Cancelar ação |

### Mensagens
| Atalho | Ação |
|--------|------|
| **Enter** | Enviar mensagem |
| **Ctrl + Enter** | Enviar mensagem (alternativo) |
| **ESC** | Cancelar edição ou resposta |

### Emoji Picker
| Atalho | Ação |
|--------|------|
| **ESC** | Fechar picker de emojis |

---

## 💡 Dicas e Truques

### 📊 Dashboard Administrativo (Admin)
- Clique em **"Gerenciar"** para ver estatísticas
- Cards mostram: Aprovados, Pendentes, Online, Mensagens
- Lista de usuários com ações rápidas

### 🔔 Notificações Desktop
- Sistema pede permissão na primeira vez
- Receba notificações mesmo com navegador minimizado
- Funciona apenas se navegador estiver aberto

### 📸 Visualizar Imagens
- Clique em qualquer imagem enviada
- Imagem abre em tela cheia
- Clique fora para fechar

### 🟢 Status Online
- Bolinha verde indica usuário online
- Atualiza em tempo real
- Visível na lista de contatos

### 💬 Contador de Não Lidas
- Badge vermelho mostra mensagens não lidas
- Atualiza automaticamente
- Zerado ao abrir conversa

### 📝 Mensagens com Emoji Grande
- Envie APENAS emojis (sem texto)
- Emojis aparecem em tamanho grande (48px)
- Exemplo: 😀😃😄

---

## ❓ Perguntas Frequentes

### Como criar minha conta?
Clique em "Criar nova conta" na tela de login, preencha os dados e aguarde aprovação do administrador.

### Posso editar mensagens de outras pessoas?
Não. Apenas suas próprias mensagens podem ser editadas ou excluídas.

### Como sei se minha mensagem foi lida?
Atualmente, não há indicador de leitura (✓✓). Esta funcionalidade pode ser adicionada no futuro.

### Posso enviar vídeos?
Sim, qualquer tipo de arquivo pode ser enviado. Vídeos não têm preview, mas podem ser baixados.

### Quanto tempo as mensagens ficam salvas?
Todas as mensagens ficam salvas permanentemente no banco de dados.

### Como deletar minha conta?
Apenas administradores podem deletar contas. Solicite ao admin.

### Posso usar em celular?
Interface é otimizada para desktop e tablets. Funciona em celulares mas experiência é limitada.

### Posso fazer chamada de voz/vídeo?
Não. Esta funcionalidade está planejada para versões futuras.

### Como faço backup das mensagens?
Admin pode fazer backup do arquivo `database.db` localizado na pasta do projeto.

### Esqueci minha senha, o que fazer?
Solicite ao administrador para redefinir sua senha no banco de dados.

---

## 🎨 Personalização

### Emojis Disponíveis
Sistema possui **114 emojis** categorizados em:
- 😀 Smileys e Emoções
- ❤️ Símbolos e Corações
- 👍 Gestos e Mãos
- ⚡ Objetos e Natureza

### Tipos de Arquivo Suportados
- 🖼️ Imagens: JPG, PNG, GIF, WebP
- 📄 Documentos: PDF, DOC, DOCX, TXT
- 📊 Planilhas: XLS, XLSX, CSV
- 🎵 Outros: MP3, MP4, ZIP, etc.

---

## 🔧 Solução de Problemas

### Não consigo fazer login
- ✅ Verifique usuário e senha
- ✅ Confirme se conta foi aprovada pelo admin
- ✅ Recarregue a página (F5)

### Botões não aparecem ao passar mouse
- ✅ Limpe cache do navegador (Ctrl + Shift + Delete)
- ✅ Recarregue página (Ctrl + F5)
- ✅ Teste em navegador atualizado

### Tema não persiste
- ✅ Verifique se localStorage está habilitado
- ✅ Não use modo anônimo do navegador
- ✅ Permita cookies e armazenamento local

### Drag & drop não funciona
- ✅ Use navegador moderno (Chrome 90+, Firefox 88+, Edge 90+)
- ✅ Selecione um contato antes de arrastar arquivo
- ✅ Verifique permissões de arquivo do sistema

### Mensagens não aparecem em tempo real
- ✅ Verifique conexão com internet
- ✅ Recarregue página para reconectar WebSocket
- ✅ Verifique se servidor está rodando

---

## 📞 Suporte

### Reportar Bugs
1. Abra o console do navegador (F12)
2. Veja se há erros em vermelho
3. Anote erro e reproduza o problema
4. Contate administrador do sistema

### Solicitar Funcionalidades
Entre em contato com a equipe de desenvolvimento descrevendo:
- Funcionalidade desejada
- Benefício esperado
- Prioridade (baixa, média, alta)

---

## 🎓 Glossário

- **Admin**: Administrador do sistema com permissões especiais
- **Socket**: Conexão em tempo real entre navegador e servidor
- **WebSocket**: Tecnologia de comunicação bidirecional
- **localStorage**: Armazenamento local do navegador
- **Drag & Drop**: Arrastar e soltar
- **Preview**: Pré-visualização
- **Hover**: Passar o mouse sobre elemento

---

## 📈 Versão

**Versão Atual**: 2.0  
**Data de Lançamento**: Janeiro 2026  
**Última Atualização**: Janeiro 2026

---

## 📄 Licença

© 2026 Messenger Corporativo  
Todos os direitos reservados.

---

**Fim do Manual** 🎉

Para mais informações, consulte:
- [MELHORIAS_IMPLEMENTADAS.md](MELHORIAS_IMPLEMENTADAS.md)
- [GUIA_DE_TESTES.md](GUIA_DE_TESTES.md)
- [RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md)
