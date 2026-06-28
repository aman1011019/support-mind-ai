"""
Support Routes — Main AI Resolution Endpoint
POST /support/respond → Full pipeline: memory lookup + AI + store results
"""
import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..models.models import Customer, SupportTicket, AIResponse, TicketStatus, PriorityLevel
from ..schemas.schemas import SupportResolveRequest, SupportResolveResponse
from ..services.ai_service import generate_support_response
from ..services.memory_service import get_memory_context, store_memory
from .auth import get_current_user
from ..models.models import User

router = APIRouter(prefix="/support", tags=["Support AI"])


def resolve_support_pipeline(
    req: SupportResolveRequest,
    db: Session,
) -> SupportResolveResponse:
    """
    Main AI resolution pipeline:
    1. Find customer in DB
    2. Retrieve Hindsight Memory
    3. Run CascadeFlow model routing
    4. Generate AI response
    5. Store ticket + AI response + update memory
    """
    start = time.time()

    # 1. Verify customer exists
    customer = db.query(Customer).filter(Customer.id == req.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail=f"Customer {req.customer_id} not found")

    # 2. Retrieve Hindsight Memory context
    memory_context = get_memory_context(db, req.customer_id)
    has_memory = bool(memory_context)

    # 3. Create the support ticket
    priority_enum = PriorityLevel(req.priority) if req.priority in ["low","medium","high","urgent"] else PriorityLevel.medium
    
    ticket = SupportTicket(
        customer_id=req.customer_id,
        issue_text=req.issue_text,
        issue_category=req.issue_category,
        priority=priority_enum,
        status=TicketStatus.pending,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    # 4. Generate AI response via CascadeFlow
    ai_result = generate_support_response(
        customer_name=customer.name,
        issue_text=req.issue_text,
        issue_category=req.issue_category,
        priority=req.priority,
        order_id=req.order_id or customer.order_id or "",
        memory_context=memory_context,
        customer_plan=customer.plan.value if customer.plan else "Starter",
    )

    # 5. Store the AI response
    ai_response = AIResponse(
        ticket_id=ticket.id,
        llm_model_used=ai_result["model_name"],
        generated_response=ai_result["response_text"],
        memory_context_used=memory_context if has_memory else None,
        recommended_resolution=ai_result["recommended_resolution"],
        confidence_score=ai_result["confidence_score"],
        urgency_score=ai_result["urgency_score"],
        escalation_required=ai_result["escalation_required"],
        tokens_used=ai_result["tokens_used"],
        cost_usd=ai_result["cost_usd"],
        cascade_level=ai_result["cascade_level"],
    )
    db.add(ai_response)

    # 6. Update ticket status based on escalation
    if ai_result["escalation_required"]:
        ticket.status = TicketStatus.escalated
    else:
        ticket.status = TicketStatus.resolved

    # 7. Store this interaction in Hindsight Memory for future reference
    sentiment = "frustrated" if req.priority in ["urgent", "high"] else "neutral"
    store_memory(
        db=db,
        customer_id=req.customer_id,
        complaint=req.issue_text,
        resolution=ai_result["recommended_resolution"] or "Resolved via SupportMind",
        category=req.issue_category,
        priority=req.priority,
        sentiment=sentiment,
    )

    db.commit()
    db.refresh(ai_response)

    elapsed_ms = int((time.time() - start) * 1000)

    return SupportResolveResponse(
        ticket=ticket.to_dict(),
        ai_response=ai_response.to_dict(),
        memory_found=has_memory,
        processing_time_ms=elapsed_ms,
    )


@router.post("/respond", response_model=SupportResolveResponse)
def resolve_support_ticket(
    req: SupportResolveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return resolve_support_pipeline(req, db)
