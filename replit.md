# dex-ai

## Overview
AI tools for building on DEXes — skills, plugins, and agents. Includes a FastAPI web frontend called **arc.dex** — a stablecoin swap and bridge UI for the Arc Network testnet.

## Architecture
- **Backend/Frontend**: FastAPI (Python) serving HTML templates and static files
- **Entry point**: `web/app.py` — uvicorn ASGI server
- **Templates**: `web/templates/dex.html` — single-page DEX UI
- **Static assets**: `web/static/` — CSS and JS files
- **Plugins/Skills**: `packages/plugins/` — npm workspace packages (dex-trading, dex-hooks, dex-analytics, dex-defi, dex-bridge)
- **Core**: `packages/core/` — shared utilities

## Running the App
- Workflow: `cd web && uvicorn app:app --host 0.0.0.0 --port 5000`
- Port: **5000**

## Key Dependencies
- Python: `fastapi`, `uvicorn[standard]`, `httpx`, `gunicorn`
- Node: `nx`, `markdownlint-cli2`, `typedoc` (dev tooling only)

## API Endpoints
- `GET /` — Main DEX UI (dex.html)
- `GET /health` — Health check
- `GET /api/networks` — Network info
- `GET /api/quote` — Li.Fi quote proxy
- `GET /api/chains` — Li.Fi chains proxy
- `GET /api/tokens` — Li.Fi tokens proxy
- `GET /static/*` — Static files

## Deployment
- Target: autoscale
- Run: `gunicorn --bind=0.0.0.0:5000 --reuse-port -k uvicorn.workers.UvicornWorker app:app`
- Build: `cd web && pip install -r requirements.txt`
