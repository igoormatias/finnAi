# FinnAI Frontend

Frontend do **FinnAI** (Next.js App Router + TypeScript).

## Setup

- **Requisitos**: Node.js 22+ e **pnpm**
- Copie `.env.example` para `.env` e preencha as variáveis
- O `AUTH_GOOGLE_ID` deve ser o **mesmo** `GOOGLE_CLIENT_ID` configurado no backend

```bash
pnpm install
pnpm dev
```

Fallback Windows (sem pnpm global):

```bash
npx -y pnpm@10.17.0 install
npx -y pnpm@10.17.0 dev
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm test
pnpm test:watch
```

## Autenticação (Fase 2)

Fluxo:

1. Usuário inicia login com Google (`Auth.js`)
2. BFF Next (`/api/auth/*`) troca `id_token` com o backend (`POST /auth/google`)
3. Backend retorna `access_token` + cookie HttpOnly de refresh
4. BFF replica o cookie refresh no domínio do frontend
5. Sessão Auth.js guarda `accessToken` + usuário
6. APIs autenticadas usam `/api/proxy/*` com Bearer (session ou Zustand)

### Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `AUTH_SECRET` | Segredo Auth.js |
| `AUTH_GOOGLE_ID` | Client ID Google (server) |
| `AUTH_GOOGLE_SECRET` | Client Secret Google (server only) |
| `AUTH_URL` | URL pública do app (ex. `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | URL pública para links |
| `API_URL` | Base do FastAPI (ex. `http://localhost:8000`) |
| `AUTH_COOKIE_NAME` | Nome do cookie refresh (padrão: `refresh_token`) |

### Google Cloud Console

Adicione em **Authorized redirect URIs**:

- `http://localhost:3000/api/auth/callback/google`

### BFF routes

- `GET/POST /api/auth/[...nextauth]` — Auth.js
- `POST /api/auth/google` — fallback `id_token`
- `POST /api/auth/refresh` — rotação de sessão
- `GET /api/auth/me` — perfil
- `POST /api/auth/logout` — limpa cookies locais
- `/api/proxy/*` — proxy autenticado para o backend

## Rotas

| Rota | Acesso |
|------|--------|
| `/` | Landing (guest) |
| `/login` | Login Google (guest) |
| `/workspaces/[slug]/dashboard` | Dashboard financeiro (protegida) |
| `/workspaces/[slug]/gastos`, `/score`, … | Seções do workspace |
| `/dashboard`, `/gastos`, … | Redirect → primeiro workspace |
| `/onboarding` | Autenticado sem workspace |

## Dashboard (Fase 3)

Após login e onboarding, o dashboard vive em `/workspaces/{slug}/dashboard`.

### Endpoints consumidos (via `/api/proxy`)

| Endpoint | Widget |
|----------|--------|
| `GET workspaces/{slug}/dashboard/overview` | Cards de resumo |
| `GET .../cashflow?start_date&end_date&granularity` | Gráfico de fluxo |
| `GET .../categories?type=expense` | Donut de categorias |
| `GET .../trends` | Painel de tendências |
| `GET .../accounts` | Distribuição por conta |
| `GET workspaces/{slug}/transactions?limit=5&sort=newest` | Preview de transações |
| `GET workspaces/{slug}/ai/score` | FinnAI Score (opcional) |

Valores monetários vêm em **centavos** (`*_cents`). Filtros de período: **7D / 30D / 1A** (toggle no header da página).

### Testar localmente

1. Backend FastAPI rodando (`API_URL`, ex. `http://localhost:8000`)
2. `pnpm dev` no frontend
3. Login → criar workspace → abrir `/workspaces/{slug}/dashboard`
4. `pnpm test` — inclui formatters, `dashboard-service`, componentes do dashboard

## Arquitetura (feature-based)

```
src/
  features/
    auth/          # login, hooks, store, services
    landing/       # landing page sections
    onboarding/    # primeiro workspace
    workspaces/    # API workspaces, switcher, slug hooks
    dashboard/     # analytics, charts (Recharts), hooks
  shared/
    api/           # client, query keys
    config/        # env, routes, middleware utils
  app/
    (marketing)/   # landing
    (auth)/        # login
    (app)/         # app protegido
    api/           # BFF
```

## Design system

- **Tokens**: `src/styles/tokens.css`
- **Tailwind**: `tailwind.config.ts`
- **Globals**: `src/app/globals.css`

## Responsividade (OBRIGATÓRIO)

Os prints em `assets/` são majoritariamente **desktop**; implementação **mobile-first** com adaptação de menus e hierarquia.

## Testes

```bash
pnpm test
```

Cobertura: auth, middleware (incl. `/workspaces/*`), dashboard formatters/service/components, sidebar por slug.
