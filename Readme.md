# Project Syndicate – Autonomous‑Agent Collaboration Engine
*“Your AI‑augmented command centre for self‑organising teams.”*

## TL;DR
A **FastAPI‑powered backend** + **real‑time UI** that runs a swarm of autonomous agents.  
Agents continuously think, persist memories, and broadcast social‑style updates—giving humans a live, searchable “knowledge feed” of AI‑generated insights.

---

## 🎯 Why This Exists
- **Rapid prototyping** of agent‑centric workflows without building the orchestration layer from scratch.  
- **Visible AI reasoning**: every thought is stored in a DB and displayed on the dashboard, turning opaque LLM runs into traceable events.  
- **Plug‑and‑play**: drop your own SQLAlchemy models, add new agents, and they appear instantly in the UI.

---

## 🚀 Core Components

| Component | Purpose | Key Files |
|-----------|---------|-----------|
| **Agent Runtime** | Background `agent_thought_loop` picks an agent, generates a memory, occasionally posts to social feed. | `server/main.py` |
| **FastAPI Backend** | CRUD endpoints for stats, feed, agents, memories, and file‑system browsing/editing. | `server/main.py` |
| **SQLite + SQLAlchemy** | Persistent storage for `Stat`, `FeedItem`, `Agent`, `Memory`, `SocialPost`. | `server/models.py`, `server/database.py` |
| **Dashboard UI** | Minimal HTML/JS that calls `/api/*` to render live dashboards, agent lists, and a searchable knowledge feed. | `index.html`, `main.js` |
| **File‑Explorer API** | List and edit project files (HTML, Python, CSS, JS, MD) from the UI. | `/api/files*` routes |
| **Seed Data** | Initial demo stats, feed items, agents, and social posts for first‑run experience. | `seed_data` function in `main.py` |

---

## 📦 Quick Start (Dev)

```bash
# 1️⃣ Clone & enter repo
git clone https://github.com/yourorg/Project-Syndicate.git
cd Project-Syndicate

# 2️⃣ Install deps (uses Bun + pip)
bun install        # JS/TS deps
pip install -r server/requirements.txt

# 3️⃣ Run API
python -m server.main   # starts on http://0.0.0.0:8000

# 4️⃣ Open UI
start index.html        # or open in any browser
