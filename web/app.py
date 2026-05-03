"""Dex AI Web Hub — DEX frontend with wallet connect, swap, and bridge."""
import json
from pathlib import Path
from fastapi import FastAPI, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI(title="dex.ai", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

BASE = Path(__file__).parent
PLUGINS_DIR = BASE.parent / "packages" / "plugins"


# ─── Pages ───
@app.get("/", response_class=HTMLResponse)
async def home():
    return (BASE / "templates" / "dex.html").read_text()


# ─── API ───
@app.get("/health")
async def health():
    return {"status": "ok", "service": "dex.ai", "version": "1.0.0"}


@app.get("/api/networks")
async def networks():
    return {"networks": list((BASE / "static" / "js" / "networks.js").read_text()[:200])}


@app.get("/api/quote")
async def get_quote(
    from_chain: int, to_chain: int,
    from_token: str, to_token: str,
    amount: str, slippage: float = 0.005
):
    """Proxy Li.Fi quote API to avoid CORS issues."""
    params = {
        "fromChain": from_chain, "toChain": to_chain,
        "fromToken": from_token, "toToken": to_token,
        "fromAmount": amount, "slippage": slippage,
    }
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://li.quest/v1/quote", params=params, timeout=15)
        return JSONResponse(resp.json(), status_code=resp.status_code)


@app.get("/api/chains")
async def chains():
    """Get supported chains from Li.Fi."""
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://li.quest/v1/chains", timeout=10)
        return JSONResponse(resp.json(), status_code=resp.status_code)


@app.get("/api/tokens")
async def tokens(chain: int = Query(default=1)):
    """Get tokens for a chain from Li.Fi."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://li.quest/v1/tokens", params={"chains": chain}, timeout=10)
        return JSONResponse(resp.json(), status_code=resp.status_code)


app.mount("/static", StaticFiles(directory=str(BASE / "static")), name="static")
