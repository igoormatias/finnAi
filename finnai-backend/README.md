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

