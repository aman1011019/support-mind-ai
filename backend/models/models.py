"""
SupportMind SQLAlchemy ORM Models
Full database schema for production-grade support platform
"""
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text,
    DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from ..database.database import Base


def gen_uuid():
    return str(uuid.uuid4())


# ─── Enums ────────────────────────────────────────────────────────────────────

class PlanType(str, enum.Enum):
    starter = "Starter"
    growth = "Growth"
    enterprise = "Enterprise"

class PriorityLevel(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"

class TicketStatus(str, enum.Enum):
    pending = "Pending"
    resolved = "Resolved"
    escalated = "Escalated"

class SentimentType(str, enum.Enum):
    positive = "positive"
    neutral = "neutral"
    negative = "negative"
    frustrated = "frustrated"


# ─── Models ───────────────────────────────────────────────────────────────────

class User(Base):
    """Authenticated users (agents/admins) who log in via Email or Google OAuth."""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    google_id = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    picture = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        pic = self.profile_picture or self.picture
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "picture": pic,
            "profile_picture": pic,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class UserSession(Base):
    """Active sessions for logged-in users."""
    __tablename__ = "sessions"

    session_id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    jwt_token = Column(Text, nullable=False)
    login_provider = Column(String, nullable=False)  # 'email' or 'google'
    expiry_time = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="sessions")

    def to_dict(self):
        return {
            "session_id": self.session_id,
            "user_id": self.user_id,
            "jwt_token": self.jwt_token,
            "login_provider": self.login_provider,
            "expiry_time": self.expiry_time.isoformat() if self.expiry_time else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }



class Customer(Base):
    """Support customers — NOT the logged-in users. These are end-customers."""
    __tablename__ = "customers"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    plan = Column(Enum(PlanType), default=PlanType.starter)
    order_id = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    tickets = relationship("SupportTicket", back_populates="customer", cascade="all, delete-orphan")
    memory_entries = relationship("MemoryHistory", back_populates="customer", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "plan": self.plan.value if self.plan else "Starter",
            "order_id": self.order_id,
            "avatar_url": self.avatar_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "history": [m.to_dict() for m in self.memory_entries] if self.memory_entries else []
        }


class SupportTicket(Base):
    """Individual support tickets submitted by customers."""
    __tablename__ = "support_tickets"

    id = Column(String, primary_key=True, default=gen_uuid)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False, index=True)
    issue_text = Column(Text, nullable=False)
    issue_category = Column(String, nullable=False, default="General")
    priority = Column(Enum(PriorityLevel), default=PriorityLevel.medium)
    status = Column(Enum(TicketStatus), default=TicketStatus.pending)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    customer = relationship("Customer", back_populates="tickets")
    ai_responses = relationship("AIResponse", back_populates="ticket", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "issue_text": self.issue_text,
            "issue_category": self.issue_category,
            "priority": self.priority.value if self.priority else "medium",
            "status": self.status.value if self.status else "Pending",
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class MemoryHistory(Base):
    """Persistent Hindsight Memory — stores all resolved interactions per customer."""
    __tablename__ = "memory_history"

    id = Column(String, primary_key=True, default=gen_uuid)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False, index=True)
    previous_complaint = Column(Text, nullable=False)
    previous_resolution = Column(Text, nullable=False)
    historical_context = Column(Text, nullable=True)
    issue_category = Column(String, nullable=True)
    priority = Column(Enum(PriorityLevel), default=PriorityLevel.medium)
    sentiment = Column(Enum(SentimentType), default=SentimentType.neutral)
    repeat_issue_flag = Column(Boolean, default=False)
    last_interaction_date = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    customer = relationship("Customer", back_populates="memory_entries")

    def to_dict(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "previous_complaint": self.previous_complaint,
            "previous_resolution": self.previous_resolution,
            "historical_context": self.historical_context,
            "issue_category": self.issue_category,
            "priority": self.priority.value if self.priority else "medium",
            "sentiment": self.sentiment.value if self.sentiment else "neutral",
            "repeat_issue_flag": self.repeat_issue_flag,
            "last_interaction_date": self.last_interaction_date.isoformat() if self.last_interaction_date else None,
        }


class AIResponse(Base):
    """Stores every AI-generated response with model metadata and cost tracking."""
    __tablename__ = "ai_responses"

    id = Column(String, primary_key=True, default=gen_uuid)
    ticket_id = Column(String, ForeignKey("support_tickets.id"), nullable=False, index=True)
    llm_model_used = Column(String, nullable=False, default="SupportMind Cascade L1")
    generated_response = Column(Text, nullable=False)
    memory_context_used = Column(Text, nullable=True)
    recommended_resolution = Column(Text, nullable=True)
    confidence_score = Column(Float, default=0.95)
    urgency_score = Column(Integer, default=50)
    escalation_required = Column(Boolean, default=False)
    tokens_used = Column(Integer, default=0)
    cost_usd = Column(Float, default=0.0)
    cascade_level = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    ticket = relationship("SupportTicket", back_populates="ai_responses")

    def to_dict(self):
        return {
            "id": self.id,
            "ticket_id": self.ticket_id,
            "llm_model_used": self.llm_model_used,
            "generated_response": self.generated_response,
            "memory_context_used": self.memory_context_used,
            "recommended_resolution": self.recommended_resolution,
            "confidence_score": self.confidence_score,
            "urgency_score": self.urgency_score,
            "escalation_required": self.escalation_required,
            "tokens_used": self.tokens_used,
            "cost_usd": self.cost_usd,
            "cascade_level": self.cascade_level,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
