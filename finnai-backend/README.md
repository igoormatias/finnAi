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

