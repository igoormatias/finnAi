FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements/ ./requirements/
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install -r requirements/base.txt

COPY pyproject.toml README.md ./
COPY alembic.ini ./
COPY alembic/ ./alembic/
COPY src/ ./src/
COPY scripts/ ./scripts/


FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH" \
    PYTHONPATH="/app/src"

WORKDIR /app

RUN useradd -m -u 10001 appuser

COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /app /app

USER appuser

EXPOSE 8000

CMD ["bash", "scripts/start.sh"]

