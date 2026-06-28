"""
SupportMind Pydantic Schemas
Request/Response validation schemas for all API endpoints
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ─── Enums ────────────────────────────────────────────────────────────────────

class PriorityLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"

class TicketStatus(str, Enum):
    pending = "Pending"
    resolved = "Resolved"
    escalated = "Escalated"

class PlanType(str, Enum):
    starter = "Starter"
    growth = "Growth"
    enterprise = "Enterprise"


# ─── Auth Schemas ──────────────────────────────────────────────────────────────

class GoogleTokenRequest(BaseModel):
    credential: str = Field(..., description="Google ID token from client-side OAuth")

class EmailLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserSignupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    picture: Optional[str] = None
    profile_picture: Optional[str] = None
    created_at: Optional[str] = None



# ─── Customer Schemas ──────────────────────────────────────────────────────────

class CustomerCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    plan: PlanType = PlanType.starter
    order_id: Optional[str] = None
    avatar_url: Optional[str] = None

class MemoryHistoryResponse(BaseModel):
    id: str
    customer_id: str
    previous_complaint: str
    previous_resolution: str
    historical_context: Optional[str] = None
    issue_category: Optional[str] = None
    priority: str
    sentiment: str
    repeat_issue_flag: bool
    last_interaction_date: Optional[str] = None

class CustomerResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    plan: str
    order_id: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[str] = None
    history: List[MemoryHistoryResponse] = []


# ─── Ticket Schemas ────────────────────────────────────────────────────────────

class TicketCreate(BaseModel):
    customer_id: str
    issue_text: str = Field(..., min_length=5, max_length=2000)
    issue_category: str = "General"
    priority: PriorityLevel = PriorityLevel.medium

class TicketResponse(BaseModel):
    id: str
    customer_id: str
    issue_text: str
    issue_category: str
    priority: str
    status: str
    created_at: Optional[str] = None


# ─── Support / AI Resolution Schemas ──────────────────────────────────────────

class SupportResolveRequest(BaseModel):
    customer_id: str
    customer_name: str
    order_id: Optional[str] = None
    issue_text: str = Field(..., min_length=5, max_length=2000)
    issue_category: str = "General"
    priority: PriorityLevel = PriorityLevel.medium

class AIResponseOut(BaseModel):
    id: str
    ticket_id: str
    llm_model_used: str
    generated_response: str
    memory_context_used: Optional[str] = None
    recommended_resolution: Optional[str] = None
    confidence_score: float
    urgency_score: int
    escalation_required: bool
    tokens_used: int
    cost_usd: float
    cascade_level: int
    created_at: Optional[str] = None

class SupportResolveResponse(BaseModel):
    ticket: TicketResponse
    ai_response: AIResponseOut
    memory_found: bool
    processing_time_ms: int


# ─── Memory Schemas ────────────────────────────────────────────────────────────

class MemoryCreate(BaseModel):
    customer_id: str
    previous_complaint: str
    previous_resolution: str
    historical_context: Optional[str] = None
    issue_category: Optional[str] = None
    priority: PriorityLevel = PriorityLevel.medium
    sentiment: str = "neutral"
    repeat_issue_flag: bool = False


# ─── Analytics Schemas ─────────────────────────────────────────────────────────

class DashboardAnalytics(BaseModel):
    resolved_today: int
    pending_cases: int
    escalated_tickets: int
    avg_response_time_ms: float
    csat_score: float
    total_tickets: int
    total_customers: int
    memory_entries: int
    cascade_savings_percent: float
    cost_without_routing: float
    cost_with_cascade: float
    query_count: int
    recent_tickets: List[dict] = []
