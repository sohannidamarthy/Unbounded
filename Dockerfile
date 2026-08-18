FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# deps for psycopg + common builds
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
 && rm -rf /var/lib/apt/lists/*

# install Poetry (your project uses poetry-core)
RUN pip install --no-cache-dir "poetry>=2.0.0,<3.0.0"

# install into container env (no venv inside image)
RUN poetry config virtualenvs.create false

# copy only dependency files first (better caching)
COPY pyproject.toml poetry.lock ./

# install runtime deps only
RUN poetry install --only main --no-interaction --no-ansi --no-root

# copy the rest of your app
COPY . .

EXPOSE 8000

# your FastAPI app is app/main.py with `app = FastAPI()`
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]