# FinnAI Backend

Backend do FinnAI, uma plataforma moderna de controle financeiro inteligente com IA.

## Stack

- Python 3.12+
- FastAPI
- Pydantic v2
- SQLAlchemy 2
- PostgreSQL
- Alembic
- Docker
- Pytest

## Arquitetura (Clean Architecture)

O backend segue camadas com baixo acoplamento, conforme as regras em [`finnai-backend/.cursor/rules.md`](.cursor/rules.md).

Estrutura base:

```txt
src/
  api/            # rotas e dependências (camada de transporte)
  core/           # config, app factory, infra compartilhada
  domain/         # regras de domínio (fase 2+)
  services/       # casos de uso (fase 2+)
  repositories/   # persistência (fase 2+)
  models/         # entidades do banco (SQLAlchemy)
  schemas/        # DTOs (Pydantic)
  integrations/   # integrações (Redis/IA) (fase 2+)
  workers/        # filas e jobs (fase 2+)
  tests/          # testes
  main.py         # ASGI entrypoint
```

## Autenticação (Fase 2)

### Fluxo

1. Frontend obtém `id_token` do Google OAuth.
2. `POST /auth/google` envia `{ "id_token": "..." }`.
3. Backend valida o token no endpoint oficial do Google (`tokeninfo`).
4. Usuário é criado ou atualizado no Postgres.
5. Resposta retorna `access_token` (Bearer) e define cookie HttpOnly `refresh_token`.
6. `POST /auth/refresh` usa o cookie para rotacionar sessão e emitir novos tokens.
7. `GET /auth/me` retorna o usuário autenticado via `Authorization: Bearer <access_token>`.

### Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/google` | Login com Google id_token |
| POST | `/auth/refresh` | Renova tokens (cookie HttpOnly) |
| GET | `/auth/me` | Usuário autenticado |

### Setup Google OAuth

1. Crie um projeto no [Google Cloud Console](https://console.cloud.google.com/).
2. Configure OAuth consent screen.
3. Crie credenciais OAuth 2.0 (Web client).
4. Defina `GOOGLE_CLIENT_ID` no `.env` com o Client ID gerado.

### Variáveis de auth

- `GOOGLE_CLIENT_ID`: Client ID do Google OAuth
- `JWT_SECRET_KEY`: secret do access token (HS256)
- `JWT_REFRESH_SECRET_KEY`: secret do refresh token (HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: expiração do access token (default: 15)
- `REFRESH_TOKEN_EXPIRE_DAYS`: expiração do refresh token (default: 30)
- `AUTH_COOKIE_SECURE`: cookie Secure (auto `true` em production)
- `AUTH_COOKIE_SAMESITE`: `lax`, `strict` ou `none`
- `AUTH_COOKIE_DOMAIN`: domínio do cookie (opcional)

### Exemplo

```bash
curl -X POST http://localhost:8000/auth/google \
  -H "Content-Type: application/json" \
  -d '{"id_token":"<google-id-token>"}'

curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer <access_token>"
```

## Workspaces colaborativos (Fase 3)

### Conceito

Usuários podem criar e participar de múltiplos workspaces (famílias) para colaborar em finanças compartilhadas.

### Roles e permissões

| Role | Permissões |
|------|------------|
| owner | Acesso total; deletar workspace |
| admin | Gerenciar membros e convites; editar workspace |
| member | Acesso colaborativo (criar/editar finanças nas próximas fases) |
| viewer | Somente leitura |

### Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/workspaces` | Criar workspace |
| GET | `/workspaces` | Listar workspaces do usuário |
| GET | `/workspaces/{slug}` | Detalhes (membro) |
| PATCH | `/workspaces/{slug}` | Atualizar (admin/owner) |
| DELETE | `/workspaces/{slug}` | Deletar (owner) |
| GET | `/workspaces/{slug}/members` | Listar membros |
| PATCH | `/workspaces/{slug}/members/{member_id}` | Alterar role (admin/owner) |
| DELETE | `/workspaces/{slug}/members/{member_id}` | Remover membro (admin/owner) |
| POST | `/workspaces/{slug}/invites` | Criar convite (admin/owner) |
| GET | `/workspaces/{slug}/invites` | Listar convites (admin/owner) |
| DELETE | `/workspaces/{slug}/invites/{invite_id}` | Cancelar convite |
| POST | `/invites/{token}/accept` | Aceitar convite (autenticado) |

### Fluxo de convite

1. Admin/owner cria convite com email e role desejada.
2. Backend gera token único com expiração (`INVITE_EXPIRE_DAYS`).
3. Usuário convidado faz login e chama `POST /invites/{token}/accept`.
4. Backend valida email, expiração e cria membership.

### Exemplo

```bash
curl -X POST http://localhost:8000/workspaces \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Familia Silva"}'

curl -X POST http://localhost:8000/workspaces/familia-silva/invites \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"invited_email":"membro@example.com","role":"member"}'
```

## Core financeiro (Fase 4)

### Convenção de dinheiro (centavos)

- Todos os valores monetários são **inteiros em centavos**.
- Exemplos: R$ 10,00 → `1000`, R$ 0,99 → `99`.

### Permissões

- `viewer`: somente leitura (GET).
- `member/admin/owner`: podem criar/editar/deletar (POST/PATCH/DELETE).

### Endpoints

- **Categorias**
  - `POST /workspaces/{slug}/categories`
  - `GET /workspaces/{slug}/categories`
  - `PATCH /workspaces/{slug}/categories/{category_id}`
  - `DELETE /workspaces/{slug}/categories/{category_id}`

- **Contas**
  - `POST /workspaces/{slug}/accounts`
  - `GET /workspaces/{slug}/accounts`
  - `GET /workspaces/{slug}/accounts/{account_id}`
  - `PATCH /workspaces/{slug}/accounts/{account_id}`
  - `DELETE /workspaces/{slug}/accounts/{account_id}`

- **Transações**
  - `POST /workspaces/{slug}/transactions`
  - `GET /workspaces/{slug}/transactions` (filtros + paginação + sorting)
  - `GET /workspaces/{slug}/transactions/{transaction_id}`
  - `PATCH /workspaces/{slug}/transactions/{transaction_id}`
  - `DELETE /workspaces/{slug}/transactions/{transaction_id}`

- **Dashboard**
  - `GET /workspaces/{slug}/dashboard/summary`

### Filtros / paginação / sorting (transactions)

- **Paginação**: `limit` (default 50, max 200), `offset` (default 0)
- **Sorting**: `newest|oldest|amount_asc|amount_desc`
- **Filtros**:
  - `type` (`income|expense`)
  - `category_id`, `account_id`
  - `start_date`, `end_date` (ISO datetime)
  - `amount_min_cents`, `amount_max_cents`
  - `recurring` (`true|false`)
  - `search` (busca em `description`/`notes`)

### Exemplo (listar transações)

```bash
curl "http://localhost:8000/workspaces/familia-silva/transactions?limit=50&offset=0&sort=newest&recurring=true&search=rent" \
  -H "Authorization: Bearer <access_token>"
```

### Summary (dashboard)

`GET /workspaces/{slug}/dashboard/summary` retorna:

- `total_balance_cents`: soma dos saldos atuais das contas
- `total_incomes_cents`: soma de receitas no mês atual
- `total_expenses_cents`: soma de despesas no mês atual
- `monthly_balance_cents`: \(incomes - expenses\)
- `savings_rate`: \(0\) se `incomes=0`, senão \(monthly_balance / incomes\)

## Relatórios, analytics e dashboard (Fase 5)

### Timezone por workspace

- Workspaces possuem `timezone` (default `UTC`) e ele é usado para interpretar `start_date/end_date` e comparações mensais.

### Dashboard endpoints

- `GET /workspaces/{slug}/dashboard/overview`
- `GET /workspaces/{slug}/dashboard/cashflow`
- `GET /workspaces/{slug}/dashboard/categories`
- `GET /workspaces/{slug}/dashboard/trends`
- `GET /workspaces/{slug}/dashboard/accounts`

### Overview

Retorna:
- `total_balance_cents`
- `monthly_income_cents`
- `monthly_expense_cents`
- `savings_cents`
- `savings_rate`
- `transaction_count`
- `biggest_expense`
- `biggest_income`

### Cashflow

Query params:
- `start_date`, `end_date` (ISO datetime)
- `granularity`: `daily|weekly|monthly|yearly`

Retorna série temporal com:
- `income_cents`, `expense_cents`, `cumulative_balance_cents`

### Category analytics

Query params:
- `start_date`, `end_date` (ISO datetime)
- `type`: `income|expense`

Retorna ranking/percentual por categoria.

### Exportação

- `GET /workspaces/{slug}/reports/export/csv`
- `GET /workspaces/{slug}/reports/export/xlsx`

Filtros (query params):
- `start_date`, `end_date`
- `type` (`income|expense`)
- `category_id`, `account_id`
- `amount_min_cents`, `amount_max_cents`
- `search`

Exemplo:

```bash
curl "http://localhost:8000/workspaces/familia-silva/reports/export/csv?start_date=2026-01-01T00:00:00Z&end_date=2026-01-31T23:59:59Z&type=expense" \
  -H "Authorization: Bearer <access_token>" \
  -o export.csv
```

## FinnAI Score (Fase 6 — IA financeira)

### Objetivo

Gerar um **score financeiro (0–100)** por workspace, com:
- `label`
- `summary`
- `strengths`, `weaknesses`, `tips`
- `badges`

### Provider (atual) e troca futura

- Provider atual: **Google Gemini API** (`AI_PROVIDER=gemini`).
- Arquitetura preparada para suportar providers futuros (OpenAI/Claude/OpenRouter) sem acoplar o domínio.

### Endpoints

- `GET /workspaces/{slug}/ai/score`
- `POST /workspaces/{slug}/ai/regenerate` (retorna **202**)

### Cache / debounce (baixo custo)

- O score é **persistido no banco** e reutilizado.\n+- `POST regenerate` aplica **debounce** para evitar múltiplas gerações seguidas (configurável por `AI_SCORE_DEBOUNCE_SECONDS`).\n+- Se a IA falhar, o sistema mantém o **último score válido** (e registra erro no estado do score).

### Variáveis de ambiente (IA)

- `AI_PROVIDER` (default: `gemini`)
- `AI_MODEL` (opcional)
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (opcional)
- `AI_SCORE_DEBOUNCE_SECONDS` (default: `600`)

## Variáveis de ambiente

Copie o exemplo:

```bash
cp .env.example .env
```

Principais:

- `APP_ENV`: `development` | `test` | `production`
- `DEBUG`: `true`/`false`
- `DATABASE_URL`: URL async (`postgresql+asyncpg://...`)
- `DATABASE_URL_SYNC`: URL sync (migrations) (`postgresql+psycopg://...`)

### Render (PostgreSQL)

No Web Service, defina **Root Directory** `finnai-backend` e use a **Internal Database URL** do Postgres:

| Campo | Valor |
|-------|--------|
| **Build Command** | `pip install -r requirements/base.txt` |
| **Start Command** | `bash scripts/render_start.sh` |

| Variável | Exemplo |
|----------|---------|
| `APP_ENV` | `production` |
| `DATABASE_URL` | `postgresql+asyncpg://USER:PASS@dpg-xxxx-a:5432/finn_ai_db` |
| `DATABASE_URL_SYNC` | `postgresql+psycopg://USER:PASS@dpg-xxxx-a:5432/finn_ai_db?sslmode=require` |

**Como configurar sem erro de hostname:**

1. Abra o serviço **PostgreSQL** no Render → aba **Connections**.
2. Clique em **copiar** na **Internal Database URL** (não digite o hostname na mão).
3. Cole em `DATABASE_URL_SYNC` e troque o início para `postgresql+psycopg://`.
4. Duplique para `DATABASE_URL` com `postgresql+asyncpg://` (mesmo host, user, senha e database).
5. API e Postgres devem estar na **mesma região** (ex.: Oregon).

Se o log mostrar `failed to resolve host "dpg-..."`, o hostname está **errado ou desatualizado** (typo comum: `alusk8` vs `a1usk8`). Copie de novo do painel do Postgres.

Alternativa: defina só `DATABASE_URL` com a Internal URL (`postgresql://...`); o `render_start.sh` deriva a URL sync automaticamente.

- Em `DATABASE_URL_SYNC`, use `?sslmode=require` (Alembic/psycopg).
- Em produção, a API habilita SSL no asyncpg automaticamente; não use `sslmode` na `DATABASE_URL` (asyncpg não aceita esse parâmetro na URL).
- Se a senha tiver `@`, `#`, etc., faça [URL encode](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding) na senha.
- Remova variáveis com host `db` (são do Docker local).

## Setup local (sem Docker)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements/dev.txt
```

Rodar a API:

```bash
uvicorn main:app --reload
```

## Docker

Subir API + Postgres:

```bash
docker compose up --build
```

Healthcheck:

```bash
curl http://localhost:8000/health
```

## Migrations (Alembic)

Aplicar migrations:

```bash
alembic upgrade head
```

Criar nova migration:

```bash
alembic revision -m "message" --autogenerate
```

## Qualidade

- Ruff:

```bash
ruff check src
ruff format src
```

- Black:

```bash
black src
```

- Pre-commit:

```bash
pre-commit install
pre-commit run --all-files
```

## Testes

```bash
pytest
```

