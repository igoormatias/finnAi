# 🚀 FinnAI

Plataforma moderna de controle financeiro inteligente com IA para uso individual e familiar.

O FinnAI permite controlar receitas, despesas, metas financeiras e acompanhar insights inteligentes através de IA, tudo com uma experiência premium responsiva para mobile, tablet e desktop.

---

# ✨ Features

- 🔐 Login social com Google
- 👨‍👩‍👧‍👦 Workspace familiar compartilhado
- 💸 Controle de receitas e despesas
- 🧾 Categorias financeiras
- 📊 Dashboard financeiro moderno
- 🤖 FinnAI Score (análise financeira com IA)
- 📈 Relatórios inteligentes
- 🎯 Metas financeiras
- ❤️ Favoritos e compartilhamento
- 📤 Exportação XLSX/PDF
- 🌙 Dark mode premium
- 📱 Responsivo (mobile-first)

---

# 🧠 FinnAI Score

O sistema utiliza IA para:
- analisar hábitos financeiros
- identificar padrões
- gerar insights
- sugerir melhorias
- calcular uma pontuação financeira inteligente

Exemplos:
- Gastos excessivos em delivery
- Boa taxa de economia
- Alto comprometimento com despesas fixas
- Sugestões de economia mensal

---

# 🏗️ Arquitetura

O projeto é dividido em:

```txt
FinnAI/
 ├── finnai-frontend/
 └── finnai-backend/
```

---

# 🎨 Frontend

Aplicação web responsável pela experiência do usuário.

## Referência visual (prints) e responsividade (OBRIGATÓRIO)

- Os **prints em `finnai-frontend/assets/` são referência visual oficial** (identidade, spacing, tipografia, hierarquia e composição).
- **Os prints são majoritariamente desktop**. Mesmo assim, **todas as telas devem ser mobile-first e responsivas**.
- Regra de implementação:
  - Desenvolver a versão **desktop** baseada nos prints
  - Em seguida **adaptar para mobile/tablet** seguindo boas práticas (não “espremer” o desktop)
  - **Simplificar** quando necessário: trocar sidebar por drawer/bottom nav, reduzir densidade de informação, reorganizar grids, priorizar conteúdo, ajustar CTAs.
  - Garantir a11y e suporte a **reduced motion**.

## Stack

- Next.js (App Router)
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query
- Zustand
- Framer Motion
- Recharts

## Responsabilidades

- UI/UX
- dashboards
- gráficos
- autenticação
- responsividade
- animações
- consumo da API

---

# ⚙️ Backend

API responsável pela lógica de negócio, IA e processamento financeiro.

## Stack

- FastAPI
- Python
- Pydantic v2
- SQLAlchemy 2
- Alembic
- PostgreSQL
- Redis
- Celery/RQ
- Docker

## Responsabilidades

- autenticação
- regras financeiras
- gestão familiar
- relatórios
- IA
- processamento assíncrono
- exportações
- segurança

---

# 🗂️ Estrutura Backend

```txt
src/
 ├── api/
 ├── core/
 ├── models/
 ├── schemas/
 ├── services/
 ├── repositories/
 ├── workers/
 ├── tests/
 └── main.py
```

---

# 🗂️ Estrutura Frontend

```txt
src/
 ├── app/
 ├── features/
 ├── components/
 ├── services/
 ├── hooks/
 ├── store/
 ├── types/
 ├── lib/
 └── styles/
```

---

# 🎯 Objetivo

O FinnAI foi criado para unir:
- organização financeira
- experiência premium
- colaboração familiar
- inteligência artificial

Tudo isso em uma plataforma moderna, intuitiva e escalável.

---

# 🎨 Design System

O projeto utiliza:
- dark premium UI
- emerald accents
- glassmorphism leve
- microinterações modernas
- foco em acessibilidade
- responsividade completa

Inspirado em:
- Revolut
- Stripe
- Linear
- Arc Browser
- Copilot Money

---

# 📱 Responsividade

O FinnAI é:
- mobile-first
- adaptado para tablets
- otimizado para desktop

---

# 🚀 Roadmap

- [ ] Integração bancária
- [ ] App mobile
- [ ] IA financeira avançada
- [ ] Notificações inteligentes
- [ ] Planejamento financeiro automático
- [ ] Comparação mensal inteligente
- [ ] Compartilhamento de relatórios
- [ ] Modo investimentos

---

# 🧪 Qualidade

- Testes automatizados
- Arquitetura escalável
- Clean Code
- Tipagem forte
- Boas práticas de frontend e backend
- Async processing
- Dockerized environment

---

# 📦 Deploy

## Frontend
- Vercel

## Backend
- Railway / Render / VPS

## Banco
- PostgreSQL

---

# 🔐 Autenticação

- Google OAuth
- JWT
- Sessões seguras
- Controle de permissões familiares

---

# 🤝 Objetivo do projeto

Além de ser um produto funcional, o FinnAI também serve como laboratório para:
- arquitetura fullstack moderna
- IA aplicada
- UX/UI premium
- escalabilidade
- sistemas SaaS reais

---

# 📄 Licença

Projeto desenvolvido para fins de estudo, portfólio e evolução contínua.