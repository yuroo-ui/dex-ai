"""Dex AI Web Hub — Uniswap-style skill marketplace dashboard."""
import json
import os
from pathlib import Path
from fastapi import FastAPI, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse

app = FastAPI(title="dex-ai", version="0.1.0")

# Mount static files
app.mount("/static", StaticFiles(directory=Path(__file__).parent / "static"), name="static")

PLUGINS_DIR = Path(__file__).parent.parent / "packages" / "plugins"


def scan_plugins():
    """Scan all plugins and their skills from the filesystem."""
    plugins = []
    if not PLUGINS_DIR.exists():
        return plugins
    for plugin_dir in sorted(PLUGINS_DIR.iterdir()):
        if not plugin_dir.is_dir():
            continue
        skill_md = plugin_dir / "SKILL.md"
        skills = []
        skills_dir = plugin_dir / "skills"
        if skills_dir.exists():
            for skill_dir in sorted(skills_dir.iterdir()):
                sm = skill_dir / "SKILL.md"
                if sm.exists():
                    skills.append({
                        "name": skill_dir.name,
                        "path": f"packages/plugins/{plugin_dir.name}/skills/{skill_dir.name}/SKILL.md",
                    })
        plugins.append({
            "name": plugin_dir.name,
            "skills": [s["name"] for s in skills],
            "skill_count": len(skills),
            "skills_detail": skills,
        })
    return plugins


@app.get("/")
async def index():
    """Serve the main page."""
    html_path = Path(__file__).parent / "templates" / "index.html"
    return HTMLResponse(html_path.read_text())


@app.get("/api/plugins")
async def get_plugins():
    """List all plugins with skills."""
    return {"plugins": scan_plugins(), "total": len(scan_plugins())}


@app.get("/api/skills")
async def get_skills():
    """List all skills across all plugins."""
    all_skills = []
    for plugin in scan_plugins():
        for skill in plugin["skills_detail"]:
            skill_md_path = PLUGINS_DIR / plugin["name"] / "skills" / skill["name"] / "SKILL.md"
            description = ""
            if skill_md_path.exists():
                content = skill_md_path.read_text()
                # Extract description from SKILL.md
                for line in content.split("\n"):
                    if line.startswith("description:"):
                        description = line.split(":", 1)[1].strip().strip('"').strip("'")
                        break
            all_skills.append({
                "name": skill["name"],
                "plugin": plugin["name"],
                "description": description,
                "path": skill["path"],
            })
    return {"skills": all_skills, "total": len(all_skills)}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "dex-ai"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
