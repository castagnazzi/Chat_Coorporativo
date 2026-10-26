# 🧪 Guia Rápido de Teste - Melhorias v0.3

## 🚀 Como Iniciar

```bash
npm start
# ou
npm run dev
```

Acesse: **http://localhost:4040**

---

## ✅ Checklist de Testes

### 1. Animações de Transição
- [ ] Abrir modal - deve ter animação de scale + slide
- [ ] Trocar abas (Contatos/Grupos) - fade suave
- [ ] Enviar mensagem - slide da direita (enviada) ou esquerda (recebida)
- [ ] Entrar no chat - fade in do conteúdo

**O que observar:**
- Transições devem ser suaves (0.2-0.3s)
- Sem travamentos ou delays
- Animação natural e fluida

---

### 2. Skeleton Loading
- [ ] Fazer logout e login novamente
- [ ] Observar lista de contatos durante carregamento

**O que observar:**
- Skeleton aparece antes dos dados (5 items)
- Animação pulsante suave
- Desaparece quando dados carregam

---

### 3. Avatar Customizado
- [ ] Click no avatar do header
- [ ] Upload de imagem (PNG, JPG ou GIF)
- [ ] Ajustar zoom e posição
- [ ] Click em "Salvar"
- [ ] Ver avatar atualizado no header

**O que observar:**
- Preview aparece antes de salvar
- Controles de zoom/posição funcionam
- Avatar atualiza em tempo real para todos

---

### 4. Customização de Temas
- [ ] Click no botão 🎨 no header
- [ ] Painel deve abrir da direita
- [ ] Testar cada tema predefinido (7 temas)
- [ ] Selecionar cor personalizada
- [ ] Fechar painel e reabrir

**O que observar:**
- Painel abre com animação suave
- Temas aplicam instantaneamente
- Cor personalizada persiste após reload
- Botão ativo destacado

**Temas para testar:**
- Padrão (Roxo/Índigo)
- Roxo
- Azul
- Verde
- Rosa
- Laranja
- Turquesa

---

### 5. Status Online/Offline
- [ ] Abrir lista de contatos
- [ ] Verificar separação Online/Offline
- [ ] Passar mouse sobre avatar

**O que observar:**
- Headers: "🟢 Online" e "🔴 Offline"
- Badge verde pulsante para online
- Badge vermelho estático para offline
- Tooltip mostra "Online" ou última vez visto
- Favoritos têm seções separadas também

---

### 6. Threads em Mensagens
- [ ] Enviar mensagem para outro usuário
- [ ] Hover sobre a mensagem
- [ ] Click no botão 💬
- [ ] Painel de thread deve abrir
- [ ] Enviar resposta na thread
- [ ] Ver contador na mensagem original

**O que observar:**
- Botão 💬 aparece no hover
- Painel abre da direita
- Mensagens carregam corretamente
- Contador atualiza em tempo real
- Formato: "💬 N resposta(s)"

**Teste avançado:**
- Múltiplos usuários respondendo
- Contador atualiza automaticamente
- Thread persiste após reload

---

## 🐛 Problemas Comuns

### Servidor não inicia
```bash
npm install
npm start
```

### Temas não carregam
- Limpar cache do navegador (Ctrl+Shift+Del)
- Verificar console por erros (F12)

### Threads não funcionam
- Verificar se banco de dados criou tabelas (auto)
- Reiniciar servidor
- Ver console do backend

### Animações não aparecem
- Verificar se navegador suporta CSS3
- Testar em Chrome/Edge/Firefox modernos

---

## 📊 Métricas de Performance

### Esperado:
- **Animações:** 60fps, sem lag
- **Skeleton:** aparece em <100ms
- **Temas:** aplicação instantânea
- **Threads:** carregamento <500ms
- **Status:** atualização em tempo real

---

## 📝 Reportando Bugs

Se encontrar problemas, registre com:
1. **O que fez** (passos)
2. **O que esperava** (comportamento esperado)
3. **O que aconteceu** (comportamento real)
4. **Screenshot** (se aplicável)

---

**Boos testes! 🚀**
