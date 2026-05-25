from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from database import Base
import datetime

class Agent(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    status = Column(String)
    color = Column(String)

class FeedItem(Base):
    __tablename__ = "feed_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    time = Column(String)
    icon = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Stat(Base):
    __tablename__ = "stats"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String)
    value = Column(String)
    change = Column(String)
    icon = Column(String)
    color = Column(String)

class Memory(Base):
    __tablename__ = "memories"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(String)
    content = Column(Text)
    embedding = Column(Text) # Storing as stringified JSON for simplicity in SQLite
    metadata_json = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SocialPost(Base):
    __tablename__ = "social_posts"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String) # 'X', 'Facebook', 'LinkedIn'
    content = Column(Text)
    author = Column(String)
    handle = Column(String)
    avatar_url = Column(String)
    timestamp = Column(String)
    engagement = Column(Text) # JSON string: {"likes": 10, "reposts": 5, "replies": 2}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
