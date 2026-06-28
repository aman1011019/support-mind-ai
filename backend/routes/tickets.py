"""
Tickets Routes — CRUD for support tickets
POST /tickets/create            → Create new ticket
GET  /tickets/history/{id}      → Get customer ticket history
POST /tickets/analyze           → Analyze ticket without generating full response
GET  /tickets/all               → List all tickets (paginated)
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from ..database.database import get_db
from ..models.models import Customer, SupportTicket, PriorityLevel, TicketStatus
from ..schemas.schemas import TicketCreate, TicketResponse, SupportResolveRequest, SupportResolveResponse
from .auth import get_current_user
from ..models.models import User
from .support import resolve_support_pipeline

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.post("/create", response_model=TicketResponse)
def create_ticket(
    payload: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    ticket = SupportTicket(
        customer_id=payload.customer_id,
        issue_text=payload.issue_text,
        issue_category=payload.issue_category,
        priority=PriorityLevel(payload.priority),
        status=TicketStatus.pending,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket.to_dict()


@router.post("/analyze", response_model=SupportResolveResponse)
def analyze_ticket(
    payload: SupportResolveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a ticket, generate a response, store AI metadata, and update memory."""
    return resolve_support_pipeline(payload, db)


@router.get("/history/{customer_id}", response_model=List[TicketResponse])
def get_ticket_history(
    customer_id: str,
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tickets = (
        db.query(SupportTicket)
        .filter(SupportTicket.customer_id == customer_id)
        .order_by(SupportTicket.created_at.desc())
        .limit(limit)
        .all()
    )
    return [t.to_dict() for t in tickets]


@router.get("/all", response_model=List[dict])
def get_all_tickets(
    skip: int = 0,
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tickets = (
        db.query(SupportTicket)
        .order_by(SupportTicket.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    result = []
    for t in tickets:
        d = t.to_dict()
        # Include customer name for display
        if t.customer:
            d["customer_name"] = t.customer.name
            d["customer_email"] = t.customer.email
        result.append(d)
    return result
