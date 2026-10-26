# 💬 Messenger Corporativo v0.3

> Sistema de mensagens instantâneas corporativo com recursos avançados de edição, temas personalizáveis e sincronização em tempo real.

<p align="center">
  <img src="docs/demo.gif" alt="Demonstração do Messenger Corporativo" width="800">
</p>

![Status](https://img.shields.io/badge/Status-Pronto_para_Produção-success)
![Versão](https://img.shields.io/badge/Versão-0.3.3-blue)
![Node](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Índice

- [Sobre](#-sobre)
- [Funcionalidades](#-funcionalidades)
- [Banco de dados e capacidade](#-banco-de-dados-e-capacidade)
- [Instalação](#-instalação)
- [Uso Rápido](#-uso-rápido)
- [Documentação](#-documentação)
- [Tecnologias](#-tecnologias)
- [Screenshots](#-screenshots)
- [Changelog](#-changelog)
- [Suporte](#-suporte)

---

## 🎯 Sobre

O **Messenger Corporativo** é uma plataforma completa de comunicação em tempo real desenvolvida para ambientes corporativos. Combina simplicidade de uso com recursos profissionais como edição de mensagens, temas personalizáveis, arrastar e soltar arquivos, e muito mais.

### Por que usar?

✅ **Privacidade Total** - Sistema auto-hospedado, dados não saem da sua rede  
✅ **Zero Configuração** - Pronto para uso em segundos  
✅ **Interface Moderna** - Design limpo e profissional  
✅ **Tempo Real** - Sincronização instantânea com WebSockets  
✅ **Sem Mensalidades** - Open-source, sem custos recorrentes  

---

## 🤖 Como foi desenvolvido

Este projeto foi desenvolvido com o auxílio de Inteligência Artificial: o código foi escrito com o **[Claude](https://claude.ai)** (Anthropic) a partir das ideias, sugestões e testes do autor, que definiu os requisitos, revisou e validou cada funcionalidade.

Por isso, trate-o como um projeto aberto e em evolução. Sugestões, issues e contribuições são muito bem-vindas.

---

## ⚡ Funcionalidades

### 💬 Conversas
- ⚡ **Tempo real** - Mensagens instantâneas via WebSocket (Socket.io)
- ✓✓ **Status de leitura** - Enviada / lida, com contador de não lidas por contato
- ⌨️ **"Digitando..."** - Veja quando o outro está escrevendo
- ✏️ **Editar e excluir mensagens** - Corrija ou remova o que enviou
- ↩️ **Responder** - Responda uma mensagem específica mantendo o contexto
- 🧵 **Threads** - Abra uma discussão paralela a partir de qualquer mensagem
- 😀 **Reações** - Reaja às mensagens com emojis
- 📌 **Fixar mensagens** - Mantenha o que é importante sempre à vista
- 🔍 **Busca nas conversas** - Encontre mensagens dentro do chat aberto
- 🔗 **Preview de links** e 📋 **copiar texto**
- 📎 **Arquivos e imagens** - Envie por botão ou arrastando para o chat, com visualizador em tela cheia
- 📢 **Envio para múltiplos contatos** - Mande o mesmo aviso para várias pessoas de uma vez

### 👥 Grupos
- Crie grupos, adicione e remova membros, edite e consulte informações
- Sair do grupo ou excluir (para quem o criou)
- Mensagens e contador de não lidas por grupo

### 📢 Avisos
- **Banner de avisos** rolando no topo para todos os usuários
- O administrador define **quais usuários podem editar** o aviso

### 🎨 Personalização
- 🌙 **Tema claro/escuro** e 🎨 **painel de temas** com presets e cor personalizada
- 🖼️ **Avatar com foto** - Envie e ajuste o enquadramento (ou use a cor automática)
- 🗜️ **Modo compacto**, 🔔 **sons** e **notificações por contato** (ative ou silencie cada um)
- ⭐ **Favoritos** e 🔍 **busca de contatos**
- 🟢 **Status online/offline** e **visto por último**

### 💼 Administração
- 👤 **Gestão de usuários** - Aprovar cadastros, editar, promover a administrador, excluir
- 📊 **Dashboard BI** - Estatísticas de uso, filtros e paginação
- 📑 **Exportação de relatórios** em **Excel (XLSX)** e **PDF**
- 🔔 **Alerta em tempo real** de novos cadastros pendentes

### 💾 Backup e recuperação
- **Pelo painel (sem terminal):** criar backup, listar e **restaurar** com um clique
- **Pela linha de comando:** `npm run backup` e `npm run backup:list` (mantém os 10 mais recentes)
- **Exportação/importação em JSON:** `npm run export` e `npm run import <arquivo>` (backup legível e portátil)
- **Restauração segura:** cria um `pre-restore` antes de sobrescrever o banco
- Reset do banco e redefinição da senha do admin por script: `npm run reset` e `npm run reset-admin`
- Guias: [Backup rápido](BACKUP_GUIA_RAPIDO.md) · [Recuperação de emergência](RECUPERACAO_EMERGENCIA.md) · [Migração e backup](MIGRACAO.md)

### 🔐 Segurança
- Login com senha criptografada (bcrypt) e **aprovação de novos usuários** pelo administrador
- **Sessão única:** novo login em outro lugar desconecta o anterior, com aviso
- Desconexão automática de usuários excluídos ou inativos
- Proteções do Helmet, limite de requisições (rate limit) e limite de tamanho de arquivo
- Sanitização de entradas

---

## 💾 Banco de dados e capacidade

### Por que SQLite?
O Messenger guarda tudo em **um único arquivo** (`database.db`) usando SQLite. A escolha é proposital para o público-alvo (redes internas de pequeno e médio porte):
- **Zero instalação e zero configuração:** não há servidor de banco para instalar, manter ou proteger
- **Backup trivial:** copiar um arquivo já é um backup (e o painel faz isso por você)
- **Transações confiáveis (ACID):** não perde mensagem em caso de queda de energia
- **Leitura muito rápida** para o volume de uma empresa e consumo baixo de memória
- **Portável:** para mudar de servidor, basta levar o arquivo

**Limites:** o SQLite aceita uma escrita por vez e funciona com uma única instância do servidor. Para centenas de usuários simultâneos ou alta disponibilidade, um banco como MySQL/PostgreSQL será mais indicado, e a migração está planejada para uma versão futura.

### Quantas mensagens suporta?
Teste real de volume (notebook comum, Node 24, mensagens de ~60 caracteres):

| Mensagens armazenadas | Tamanho do arquivo | Abrir uma conversa* | Busca por texto em todo o banco |
|---|---|---|---|
| 10 mil | 2 MB | 4 ms | 9 ms |
| 100 mil | 18 MB | 11 ms | 41 ms |
| 500 mil | 90 MB | 32 ms | 195 ms |
| 1 milhão | 180 MB | 75 ms | 486 ms |

\* Conversa entre duas pessoas, com algumas dezenas de mensagens. Uma conversa de **5.000 mensagens** abriu em ~150 ms.

Ou seja: **1 milhão de mensagens ocupa cerca de 180 MB e continua rápido**. O histórico de uma conversa ainda é carregado inteiro ao abri-la; a paginação (*lazy loading*) está no roadmap.

### Quantos usuários em tempo real?
Teste de carga com usuários simulados conectados e enviando mensagens ao mesmo tempo (servidor e clientes na mesma máquina, o que torna o teste mais exigente do que o uso real):

| Usuários conectados | Mensagens por segundo | Atraso típico (mediana) | Atraso no pior 5% |
|---|---|---|---|
| 50 | 47 | 0,3 s | 0,4 s |
| 100 | 93 | 1,6 s | 3,2 s |
| 200 | 27 | 1,8 s | 2,6 s |
| 500 | 33 | 3,4 s (entrega incompleta) | 7,8 s |

Em um chat corporativo real, cada pessoa envia bem menos de 1 mensagem por segundo, então a experiência tende a ser melhor que a da tabela. Como referência prática:
- **Até ~50 usuários simultâneos:** resposta praticamente instantânea
- **100 a 200:** funciona, com atraso de 1 a 3 segundos nos momentos de pico
- **Acima de 200:** recomendado aguardar as otimizações planejadas

O principal limitador hoje é que cada mensagem avisa **todos** os usuários conectados para atualizar a lista de contatos. Reduzir esse aviso está nos planos e deve ampliar bastante o limite.

---

## 🚀 Instalação

### Pré-requisitos
- [Node.js](https://nodejs.org/) v18 ou superior
- npm (instalado com Node.js)

### Passos

```bash
# 1. Clone o repositório e entre na pasta (escolha o local que preferir)
git clone https://github.com/castagnazzi/Chat_Coorporativo.git
cd Chat_Coorporativo

# 2. Instale as dependências
npm install

# 3. Crie o arquivo de configuração e ajuste os valores (porta, segredos, senha do admin)
#    Windows: copy .env.example .env      Linux/macOS: cp .env.example .env

# 4. Inicie o servidor
node server.js

# 5. Abra o navegador na porta definida em PORT (.env)
# Exemplo: http://localhost:3000
```

> Sem baixar via git: use **Code → Download ZIP** no GitHub, extraia onde quiser e rode a partir do passo 2, dentro da pasta extraída.

**Pronto!** O sistema está rodando. 🎉

### Primeiro Login
- **Usuário**: `admin`
- **Senha**: `Admin@123`

> ⚠️ **Aviso de segurança — leia antes de usar**
> - Defina `DEFAULT_ADMIN_PASSWORD` no `.env` **antes de iniciar o servidor pela primeira vez** (a senha padrão `Admin@123` é pública) e troque-a se já tiver iniciado.
> - Este projeto foi pensado para **redes internas (intranet)**. As rotas administrativas (`/admin/*`, `/approve-user`) ainda **não validam a identidade de quem chama no servidor**: a restrição de administrador existe apenas na interface. **Não exponha o servidor diretamente na internet** sem antes proteger essas rotas (ou use VPN/proxy com autenticação e HTTPS).
> - A proteção das rotas administrativas está nos planos das próximas versões. Contribuições são bem-vindas!

> 🔐 **Esqueceu a senha?** Veja [como recuperar](RECUPERACAO_SENHA_ADMIN.md)

---

## 💻 Uso Rápido

### Enviar Mensagem
1. Faça login
2. Selecione contato na lista
3. Digite e pressione Enter

### Editar Mensagem
1. Passe mouse sobre sua mensagem
2. Clique em ✏️
3. Edite e pressione Enter

### Alternar Tema
- Clique no botão 🌙 no cabeçalho

### Arrastar Arquivo
- Arraste arquivo e solte na área de chat

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [📖 Manual do Usuário](MANUAL_DO_USUARIO.md) | Guia completo de uso |
| [🎯 Guia de Testes](GUIA_DE_TESTES.md) | Checklist para testes |
| [📊 Resumo Executivo](RESUMO_EXECUTIVO.md) | Visão geral do projeto |
| [✨ Melhorias](MELHORIAS_IMPLEMENTADAS.md) | Lista de funcionalidades |

---

## 🔧 Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Socket.io** - WebSockets para tempo real
- **SQLite** - Banco de dados
- **Multer** - Upload de arquivos

### Frontend
- **Vanilla JavaScript** - Sem frameworks
- **CSS3** - Animações e gradientes
- **HTML5** - Estrutura semântica
- **Socket.io Client** - Comunicação em tempo real

### Arquitetura
```
┌─────────────┐      HTTP/WS      ┌─────────────┐
│   Browser   │ ◄──────────────► │  Express.js  │
│   (Client)  │   Socket.io       │   (Server)   │
└─────────────┘                   └───────┬──────┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │    SQLite    │
                                   └──────────────┘
```

### 🔮 Roadmap do banco de dados

O sistema usa **SQLite** (arquivo local, sem instalação extra). A migração para MySQL e o guia de como fazer isso ficam para uma atualização futura deste repositório.

---

## 📸 Screenshots

### Tela de Login
```
🔐 Interface limpa e moderna
- Login com usuário/senha
- Opção de criar conta
- Validação em tempo real
```

### Chat Principal
```
💬 Área de mensagens
- Lista de contatos à esquerda
- Mensagens centralizadas
- Campo de entrada com emojis
- Botões de ação ao passar mouse
```

### Dashboard Admin
```
📊 Painel administrativo
- Cards com estatísticas
- Lista de usuários
- Ações rápidas (aprovar/deletar)
```

### Tema Escuro
```
🌙 Cores suaves e confortáveis
- Backgrounds: #0f172a, #1e293b
- Alto contraste
- Transições suaves
```

---

## 📝 Changelog

### v0.3 - Abril 2026 🆕 (atual: 0.3.3)
- ✅ Animações de transição e skeleton loading
- ✅ Avatar customizado e temas personalizáveis
- ✅ Status online/offline melhorado
- ✅ Threads em mensagens
- ✅ Status de leitura (✓✓) e busca nas conversas
- ✅ Grupos de conversa
- ✅ Banner de avisos com permissão de edição por usuário (v0.3.3)
- 🔧 Correções de tema personalizado e do banner (v0.3.1 e v0.3.2)

> As versões abaixo seguem a numeração interna antiga (v1.0–v2.0), anterior à série v0.3.

### v2.0 - Janeiro 2026 🎉
**🚀 Melhorias Prioritárias Implementadas**
- ✅ Editar e excluir mensagens
- ✅ Tema escuro/claro
- ✅ Arrastar e soltar arquivos
- ✅ Preview de links
- ✅ Responder mensagens
- ✅ Copiar texto
- ✅ Atalhos de teclado

### v1.9 - Janeiro 2026
- Ajustes visuais BI
- Emojis aumentados (48px)
- Grid de BI otimizado

### v1.8 - Janeiro 2026
- Segurança para usuários deletados
- Validações robustas

### v1.7 - Janeiro 2026
- Thumbnails padronizados
- Avatares consistentes

### v1.6 - Janeiro 2026
- Dashboard BI
- Notificações admin em tempo real

### v1.5 - Janeiro 2026
- UI moderna com gradientes
- Animações suaves

### v1.0 - Janeiro 2026
- Sistema base de mensagens
- Upload de arquivos
- Autenticação

---

## 🎯 Roadmap

### Versão 0.4 (Parcialmente implementada)
- [x] Status de leitura (✓✓)
- [ ] Lazy loading de mensagens
- [x] Busca nas conversas
- [ ] Sons personalizáveis

### Versão 1.0 (Futuro)
- [ ] Criptografia de ponta a ponta
- [ ] Chamadas de voz/vídeo
- [x] Salas de grupo
- [ ] Compartilhamento de tela

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFuncionalidade'`)
4. Push para a branch (`git push origin feature/MinhaFuncionalidade`)
5. Abra um Pull Request

---

## 📊 Estatísticas do Projeto

- **Linhas de Código**: ~7.700 (servidor ~1.500 + interface ~6.200)
- **Arquivos principais**: `server.js` e `index.html`
- **Dependências**: 10 (Express, Socket.io, SQLite, Multer, bcrypt, Helmet, Winston e outras)
- **Funcionalidades**: 40+
- **Versão**: 0.3.3

---

## ❓ FAQ

**P: Funciona sem internet?**  
R: Sim, funciona em rede local (localhost ou LAN).

**P: Posso hospedar na nuvem?**  
R: Sim, deploy em qualquer servidor Node.js (AWS, Azure, Heroku, etc.).

**P: Esqueci a senha do admin, e agora?**  
R: Use o comando `npm run reset-admin` ou consulte o [Guia de Recuperação de Senha](RECUPERACAO_SENHA_ADMIN.md).

**P: Quantos usuários suporta?**  
R: Depende do servidor. SQLite suporta até ~1000 usuários simultâneos.

**P: Tem aplicativo mobile?**  
R: Não, mas funciona no navegador móvel.

**P: É seguro?**  
R: Para ambientes corporativos internos, sim. Para uso público, recomenda-se adicionar HTTPS e criptografia.

---

## 📞 Suporte

### Encontrou um bug?
1. Abra o console (F12)
2. Copie mensagem de erro
3. Crie uma issue descrevendo o problema

### Precisa de ajuda?
- 📖 Leia o [Manual do Usuário](MANUAL_DO_USUARIO.md)
- 🔍 Consulte o [FAQ](#-faq)
- 💬 Entre em contato com o administrador

---

## 📄 Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE).

---

## 👥 Equipe

**Desenvolvimento**: Autor + IA (Claude, Anthropic)  
**Versão**: 0.3.3  
**Status**: ✅ Pronto para Produção

---

## 🌟 Agradecimentos

Obrigado por usar o **Messenger Corporativo**! 

Se gostou, considere:
- ⭐ Dar uma estrela no repositório
- 🐛 Reportar bugs
- 💡 Sugerir melhorias
- 📢 Compartilhar com colegas

---

<div align="center">

**Feito com ❤️ e muito ☕**

[⬆ Voltar ao topo](#-messenger-corporativo-v03)

</div>
