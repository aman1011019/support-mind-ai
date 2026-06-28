"""
Memory Routes — Hindsight Memory management
GET  /memory/{customer_id}   → Get memory history for customer
POST /memory/add             → Manually add memory entry
DELETE /memory/{memory_id}   → Remove a memory entry
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database.database import get_db
from ..models.models import Customer, MemoryHistory
from ..schemas.schemas import MemoryCreate, MemoryHistoryResponse
from .auth import get_current_user
from ..models.models import User

router = APIRouter(prefix="/memory", tags=["Memory"])


@router.get("/{customer_id}", response_model=List[MemoryHistoryResponse])
def get_memory_history(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    entries = (
        db.query(MemoryHistory)
        .filter(MemoryHistory.customer_id == customer_id)
        .order_by(MemoryHistory.last_interaction_date.desc())
        .all()
    )
    return [e.to_dict() for e in entries]


@router.get("/history/{customer_id}", response_model=List[MemoryHistoryResponse])
def get_memory_history_alias(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_memory_history(customer_id, db, current_user)


@router.post("/add", response_model=MemoryHistoryResponse)
def add_memory_entry(
    payload: MemoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    from ..services.memory_service import store_memory
    entry = store_memory(
        db=db,
        customer_id=payload.customer_id,
        complaint=payload.previous_complaint,
        resolution=payload.previous_resolution,
        category=payload.issue_category or "General",
        priority=payload.priority,
        sentiment=payload.sentiment,
    )
    return entry.to_dict()


@router.delete("/{memory_id}")
def delete_memory_entry(
    memory_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(MemoryHistory).filter(MemoryHistory.id == memory_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Memory entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Memory entry deleted"}
