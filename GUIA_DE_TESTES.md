# 🧪 Guia de Testes - Melhorias do Messenger

## 🚀 Preparação para Testes

### 1. Iniciar o Servidor
```bash
cd <pasta-do-projeto>
node server.js
```

### 2. Abrir no Navegador
- Abra `http://localhost:3000` em duas abas diferentes
- Em uma aba, faça login como admin (usuário: admin, senha: 123)
- Em outra aba, crie um novo usuário para testar as mensagens

---

## ✅ Checklist de Testes

### 🎨 Tema Escuro/Claro
- [ ] Clique no botão 🌙 no cabeçalho do chat
- [ ] Verifique se o tema muda para escuro
- [ ] Botão deve mudar para ☀️
- [ ] Cores devem estar bem contrastadas
- [ ] Feche e reabra o navegador - tema deve persistir
- [ ] Teste alternância múltiplas vezes

**Resultado esperado**: Transição suave entre temas, cores legíveis, preferência salva.

---

### ✏️ Editar Mensagens
- [ ] Envie uma mensagem para um contato
- [ ] Passe o mouse sobre a mensagem enviada
- [ ] Botões ✏️ 🗑️ 📋 devem aparecer
- [ ] Clique no botão ✏️
- [ ] Mensagem deve aparecer no campo de entrada
- [ ] Edite o texto
- [ ] Pressione Enter
- [ ] Mensagem deve atualizar com "(editada)"
- [ ] Verifique na outra aba se a edição apareceu

**Resultado esperado**: Mensagem editada em tempo real em ambas as telas, indicador "(editada)" visível.

---

### 🗑️ Excluir Mensagens
- [ ] Envie uma nova mensagem
- [ ] Passe o mouse sobre ela
- [ ] Clique no botão 🗑️
- [ ] Confirme a exclusão no alerta
- [ ] Mensagem deve desaparecer
- [ ] Verifique na outra aba se sumiu também

**Resultado esperado**: Mensagem removida de ambas as telas instantaneamente.

---

### ↩️ Responder Mensagens
- [ ] Na aba do usuário comum, envie uma mensagem para o admin
- [ ] Na aba do admin, passe o mouse sobre a mensagem recebida
- [ ] Clique no botão ↩️
- [ ] Barra azul "Respondendo:" deve aparecer acima do campo
- [ ] Digite uma resposta
- [ ] Pressione Enter
- [ ] Resposta deve ser enviada
- [ ] Teste também cancelar com ✕ ou ESC

**Resultado esperado**: Barra de resposta aparece/desaparece corretamente, mensagem enviada normalmente.

---

### 📋 Copiar Texto
- [ ] Passe o mouse sobre qualquer mensagem
- [ ] Clique no botão 📋
- [ ] Alerta "✅ Texto copiado!" deve aparecer
- [ ] Cole em um bloco de notas (Ctrl+V)
- [ ] Texto da mensagem deve ser colado

**Resultado esperado**: Texto copiado corretamente para área de transferência.

---

### 📎 Arrastar e Soltar Arquivos
- [ ] Selecione uma imagem no seu computador
- [ ] Arraste sobre a área de chat
- [ ] Área deve mudar: borda tracejada azul
- [ ] Mensagem "📎 Solte os arquivos aqui" aparece
- [ ] Solte o arquivo
- [ ] Arquivo deve ser enviado automaticamente
- [ ] Teste com documento (PDF, DOC) também
- [ ] Teste arrastar e cancelar (sair da área)

**Resultado esperado**: Feedback visual correto, arquivo enviado automaticamente, funciona com diferentes tipos.

---

### 🔗 Preview de Links
- [ ] Envie uma mensagem com um link: https://www.google.com
- [ ] Preview do link deve aparecer abaixo da mensagem
- [ ] Deve mostrar: 🔗 domínio e URL
- [ ] Clique no preview
- [ ] Link deve abrir em nova aba

**Resultado esperado**: Preview exibido automaticamente, clique abre link corretamente.

---

### ⌨️ Atalhos de Teclado

#### Ctrl + K (Buscar contatos)
- [ ] Pressione Ctrl + K
- [ ] Campo de busca deve ficar focado
- [ ] Digite para buscar contato

#### Ctrl + Enter (Enviar mensagem)
- [ ] Digite uma mensagem
- [ ] Pressione Ctrl + Enter
- [ ] Mensagem deve ser enviada

#### ESC (Cancelar)
- [ ] Abra o emoji picker
- [ ] Pressione ESC - deve fechar
- [ ] Clique em ✏️ para editar
- [ ] Pressione ESC - deve cancelar edição
- [ ] Clique em ↩️ para responder
- [ ] Pressione ESC - deve cancelar resposta
- [ ] Abra o modal admin
- [ ] Pressione ESC - deve fechar

**Resultado esperado**: Todos os atalhos funcionam conforme especificado.

---

### 🎯 Botões de Ação (Hover)
- [ ] Passe o mouse sobre mensagem enviada
- [ ] Botões devem aparecer suavemente (fade in)
- [ ] Afaste o mouse
- [ ] Botões devem desaparecer
- [ ] Passe mouse sobre mensagem recebida
- [ ] Deve mostrar apenas ↩️ e 📋 (sem ✏️ e 🗑️)

**Resultado esperado**: Animação suave, botões corretos para cada tipo de mensagem.

---

## 🐛 Testes de Casos Extremos

### Edição de Mensagens
- [ ] Tente editar mensagem de outro usuário (não deve funcionar)
- [ ] Edite uma mensagem e imediatamente edite novamente
- [ ] Edite com emoji: 😀😃😄
- [ ] Edite com texto longo (200+ caracteres)
- [ ] Cancele edição com ESC e envie nova mensagem

### Exclusão de Mensagens
- [ ] Tente excluir mensagem de outro usuário (não deve funcionar)
- [ ] Exclua múltiplas mensagens rapidamente
- [ ] Cancele o alerta de confirmação

### Drag & Drop
- [ ] Arraste arquivo muito grande (teste até 5MB)
- [ ] Arraste múltiplos arquivos (deve enviar apenas o primeiro)
- [ ] Arraste arquivo enquanto não tem contato selecionado (não deve funcionar)

### Tema
- [ ] Alterne tema várias vezes rapidamente
- [ ] Teste em janela anônima (deve começar no tema claro)
- [ ] Mude tema, recarregue página, tema deve persistir

### Links
- [ ] Envie múltiplos links em uma mensagem
- [ ] Envie link inválido: "htp://invalid"
- [ ] Envie link com caracteres especiais

---

## 📊 Checklist Final

### Funcionalidades Novas
- [ ] ✏️ Editar mensagens funciona
- [ ] 🗑️ Excluir mensagens funciona
- [ ] ↩️ Responder mensagens funciona
- [ ] 📋 Copiar texto funciona
- [ ] 🌙 Tema escuro/claro funciona
- [ ] 📎 Drag & drop funciona
- [ ] 🔗 Preview de links funciona
- [ ] ⌨️ Todos os atalhos funcionam

### Funcionalidades Existentes
- [ ] Login/registro continua funcionando
- [ ] Envio de mensagens normal
- [ ] Emojis continuam funcionando
- [ ] Upload de arquivos pelo botão continua
- [ ] Busca de contatos funciona
- [ ] Dashboard admin funciona
- [ ] Notificações em tempo real funcionam
- [ ] Contador de não lidas funciona

### Sincronização
- [ ] Edições aparecem em tempo real
- [ ] Exclusões aparecem em tempo real
- [ ] Mensagens novas aparecem em tempo real
- [ ] Status online/offline atualiza

---

## 🎉 Resultado Esperado Final

Após completar todos os testes:
- ✅ Todas as novas funcionalidades operando perfeitamente
- ✅ Funcionalidades antigas não foram afetadas
- ✅ Interface limpa e profissional
- ✅ Sincronização em tempo real funcionando
- ✅ Sem erros no console do navegador
- ✅ Experiência do usuário melhorada significativamente

---

## 🔧 Solução de Problemas

### Botões não aparecem ao passar mouse
- Limpe o cache do navegador (Ctrl + Shift + Delete)
- Recarregue a página (Ctrl + F5)

### Tema não persiste
- Verifique se localStorage está habilitado no navegador
- Teste em janela normal (não anônima)

### Edição/exclusão não funciona
- Verifique se o servidor está rodando
- Abra o console (F12) e veja se há erros
- Verifique se fez login corretamente

### Drag & drop não funciona
- Teste em navegador atualizado (Chrome, Firefox, Edge)
- Verifique permissões de arquivo
- Certifique-se de ter um contato selecionado

---

**Data de Teste**: _________  
**Testado por**: _________  
**Navegador**: _________  
**Status**: [ ] Aprovado [ ] Com pendências
