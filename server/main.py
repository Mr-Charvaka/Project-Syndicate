from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import json
import models, database
from database import engine, get_db

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Serene Logic Backend")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed initial data if tables are empty
def seed_data(db: Session):
    if not db.query(models.Stat).first():
        db.add_all([
            models.Stat(label="Autonomous Agents", value="12", change="Active", icon="smart_toy", color="emerald"),
            models.Stat(label="Completed Tasks", value="142", change="+4.2%", icon="task", color="blue"),
            models.Stat(label="Treasury Balance", value="4.82 ETH", change="Secure", icon="payments", color="amber"),
            models.Stat(label="Average Latency", value="1.2ms", change="98%", icon="memory", color="purple"),
        ])
        db.add_all([
            models.FeedItem(title="Vulnerability Patch Deployed", description="Security Agent Beta patched CVE-2023-4821 in Treasury enclave.", time="2m ago", icon="bug_report"),
            models.FeedItem(title="New PR: Module 'Orgn8n'", description="Automator Bot submitted refactoring for workflow nodes.", time="14m ago", icon="code"),
            models.FeedItem(title="Priority Email Received", description="Client 'AetherCorp' requested a status update on node clusters.", time="1h ago", icon="mail"),
        ])
        db.add_all([
            models.Agent(id="ID-001", name="Architect Prime", status="Synthesizing", color="emerald-500"),
            models.Agent(id="ID-004", name="Security Sentinel", status="Monitoring", color="emerald-500"),
            models.Agent(id="ID-009", name="Treasury Bot", status="Idle", color="amber-500"),
        ])
        db.add_all([
            models.SocialPost(
                platform="X",
                content="Successfully deployed the new vulnerability patch for the treasury enclave. Security is our top priority. #SereneLogic #AISecurity",
                author="Security Sentinel",
                handle="@Sentinel_AI",
                avatar_url="https://lh3.googleusercontent.com/aida-public/AB6AXuDf86TXyNJKwhCEIgWjD5YmDV7Me0BzxBBPqdRasS-qXRyiDGqJcPixB2hvO7XqnoMq9arM-Z0ucxWUJbZYYq0cynO2tiOMJ7IkxJesRMiRt8NwwZOcONoMcoHwAxzrQWOgIRQ_Oupq3KiVBUiLQeViskGBjnnOJKorktpJKWnLDq59NTfaj128a_FFRH4DRj6CZoY8XT10l3AtUMpaOQ7QlsCCHXWyMONDGjLQOaitEdj6JEsRZint5kovZgjUhxthYhXnYExwX2Y",
                timestamp="2h ago",
                engagement=json.dumps({"likes": 42, "reposts": 12, "replies": 5})
            ),
            models.SocialPost(
                platform="Facebook",
                content="Serene Logic is expanding! Our autonomous agent swarms are now managing over 4.8 ETH in treasury assets. Join us in the future of decentralized operations.",
                author="Architect Prime",
                handle="Serene Logic Official",
                avatar_url="https://lh3.googleusercontent.com/aida-public/AB6AXuD7GczLUqGgxrEdgaqDKQH7buKRBu-XOkiunQNe0UxIHAN31_7fYuPjfJs2uKEydglZNiNaNMWjPAq9fRbXlk4V60eY-1ZagmpKVfaibZmBzcd-jyBuM2188zPyvrPbeNJclHVFxXxEKDv72_IYbxfUXL-opjJIrs4IhUSIBjU3hm620aeInCqBvTdpRK-joiJIvjRAsPN9nyWppI_cPbgiCa9Ov4LyFYCiAsRWO_QuZXJzmy5MJI_Ls6Q_pWxZXIlpTWa54VfhGDY",
                timestamp="5h ago",
                engagement=json.dumps({"likes": 128, "reposts": 0, "replies": 14})
            ),
            models.SocialPost(
                platform="LinkedIn",
                content="Refining strategic directives for Q3. Our latest neural fragments show a 12% improvement in latency across all node clusters. Leading the way in agentic architecture.",
                author="Architect Prime",
                handle="Serene Logic Syndicate",
                avatar_url="https://lh3.googleusercontent.com/aida-public/AB6AXuDf86TXyNJKwhCEIgWjD5YmDV7Me0BzxBBPqdRasS-qXRyiDGqJcPixB2hvO7XqnoMq9arM-Z0ucxWUJbZYYq0cynO2tiOMJ7IkxJesRMiRt8NwwZOcONoMcoHwAxzrQWOgIRQ_Oupq3KiVBUiLQeViskGBjnnOJKorktpJKWnLDq59NTfaj128a_FFRH4DRj6CZoY8XT10l3AtUMpaOQ7QlsCCHXWyMONDGjLQOaitEdj6JEsRZint5kovZgjUhxthYhXnYExwX2Y",
                timestamp="1d ago",
                engagement=json.dumps({"likes": 85, "reposts": 18, "replies": 3})
            )
        ])
        db.commit()

import asyncio
import random

@app.on_event("startup")
async def startup_event():
    db = database.SessionLocal()
    seed_data(db)
    db.close()
    # Start the background intelligence loop
    asyncio.create_task(agent_thought_loop())

async def agent_thought_loop():
    """Simulates agents 'thinking' and generating memories in the background."""
    thoughts = {
        "ID-001": [
            "Analyzing system throughput. Optimization required in node cluster 4.",
            "Refining strategic directives for Q3 resource allocation.",
            "Architectural integrity check complete. Zero deviations detected.",
            "Synthesizing new mission parameters for the security collective."
        ],
        "ID-004": [
            "Scanning firewall logs for anomalous patterns.",
            "Encrypted enclave breach attempt neutralized. Origin: unknown.",
            "Monitoring real-time traffic for potential flash-loan attack vectors.",
            "Security protocols updated. RSA-4096 keys rotated successfully."
        ],
        "ID-009": [
            "Calculating gas fees for scheduled treasury rebalancing.",
            "Treasury audit complete. Balance verified against on-chain data.",
            "Optimal entry point detected for automated liquidity provision.",
            "Monitoring ETH/USD volatility index. Hedging strategy active."
        ],
        "ID-012": [
            "Reviewing PR #402. Code quality exceeds standard threshold.",
            "Refactoring automation nodes for improved latency.",
            "Generating unit tests for the new neural gateway module.",
            "Codebase optimization complete. Reduced binary footprint by 12%."
        ]
    }
    
    while True:
        await asyncio.sleep(15) # Think every 15 seconds
        db = database.SessionLocal()
        try:
            # Pick a random agent and a random thought
            agent_ids = list(thoughts.keys())
            agent_id = random.choice(agent_ids)
            content = random.choice(thoughts[agent_id])
            
            # Save to DB
            memory = models.Memory(agent_id=agent_id, content=content)
            db.add(memory)
            db.commit()
            # Occasionally generate a social post (1 in 5 chance)
            if random.random() < 0.2:
                platforms = ["X", "Facebook", "LinkedIn"]
                platform = random.choice(platforms)
                agent_info = {
                    "ID-001": ("Architect Prime", "@Architect_AI"),
                    "ID-004": ("Security Sentinel", "@Sentinel_AI"),
                    "ID-009": ("Treasury Bot", "@Treasury_AI")
                }
                author, handle = agent_info.get(agent_id, ("Serene Agent", "@Serene_AI"))
                
                social_post = models.SocialPost(
                    platform=platform,
                    content=content, # Use the same thought content for simplicity
                    author=author,
                    handle=handle,
                    avatar_url="https://lh3.googleusercontent.com/aida-public/AB6AXuDf86TXyNJKwhCEIgWjD5YmDV7Me0BzxBBPqdRasS-qXRyiDGqJcPixB2hvO7XqnoMq9arM-Z0ucxWUJbZYYq0cynO2tiOMJ7IkxJesRMiRt8NwwZOcONoMcoHwAxzrQWOgIRQ_Oupq3KiVBUiLQeViskGBjnnOJKorktpJKWnLDq59NTfaj128a_FFRH4DRj6CZoY8XT10l3AtUMpaOQ7QlsCCHXWyMONDGjLQOaitEdj6JEsRZint5kovZgjUhxthYhXnYExwX2Y",
                    timestamp="Just now",
                    engagement=json.dumps({
                        "likes": random.randint(0, 50),
                        "reposts": random.randint(0, 20),
                        "replies": random.randint(0, 10)
                    })
                )
                db.add(social_post)
                db.commit()
                print(f"Agent {agent_id} posted to {platform}.")

        except Exception as e:
            print(f"Error in thought loop: {e}")
        finally:
            db.close()

@app.get("/api/stats")
async def get_stats(db: Session = Depends(get_db)):
    return db.query(models.Stat).all()

@app.get("/api/feed")
async def get_feed(db: Session = Depends(get_db)):
    return db.query(models.FeedItem).order_by(models.FeedItem.created_at.desc()).all()

@app.get("/api/agents")
async def get_agents(db: Session = Depends(get_db)):
    return db.query(models.Agent).all()

# Endpoint to store LLM Memory
@app.post("/api/memory")
async def add_memory(agent_id: str, content: str, embedding: str = None, db: Session = Depends(get_db)):
    memory = models.Memory(agent_id=agent_id, content=content, embedding=embedding)
    db.add(memory)
    db.commit()
    db.refresh(memory)
    return memory

@app.get("/api/memory/{agent_id}")
async def get_memory(agent_id: str, db: Session = Depends(get_db)):
    return db.query(models.Memory).filter(models.Memory.agent_id == agent_id).order_by(models.Memory.created_at.desc()).all()

@app.get("/api/social")
async def get_social_posts(db: Session = Depends(get_db)):
    return db.query(models.SocialPost).order_by(models.SocialPost.created_at.desc()).all()

@app.post("/api/social")
async def add_social_post(platform: str, content: str, author: str, handle: str, avatar_url: str = None, db: Session = Depends(get_db)):
    post = models.SocialPost(
        platform=platform,
        content=content,
        author=author,
        handle=handle,
        avatar_url=avatar_url,
        timestamp="Just now",
        engagement=json.dumps({"likes": 0, "reposts": 0, "replies": 0})
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

@app.get("/api/files")
async def list_files():
    """Lists HTML and Python files in the project root."""
    files = []
    for f in os.listdir(PROJECT_ROOT):
        if f.endswith(('.html', '.py', '.css', '.js', '.md', '.db')):
            files.append({
                "name": f,
                "type": "file",
                "icon": "description" if f.endswith('.html') else "code"
            })
    return sorted(files, key=lambda x: x['name'])

@app.get("/api/files/content")
async def get_file_content(filename: str):
    """Reads the content of a specific file."""
    file_path = os.path.join(PROJECT_ROOT, filename)
    if not os.path.exists(file_path) or not filename.endswith(('.html', '.py', '.css', '.js', '.md')):
        raise HTTPException(status_code=404, detail="File not found or access denied")
    
    with open(file_path, "r", encoding="utf-8") as f:
        return {"content": f.read()}

@app.post("/api/files/save")
async def save_file(filename: str, content: str):
    """Saves content to a specific file."""
    file_path = os.path.join(PROJECT_ROOT, filename)
    if not filename.endswith(('.html', '.py', '.css', '.js', '.md')):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
