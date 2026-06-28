"""Hindsight Memory Service — retrieves and formats customer history for AI context."""
from sqlalchemy.orm import Session
from ..models.models import Customer, MemoryHistory, SupportTicket
from typing import Optional


def get_memory_context(db: Session, customer_id: str) -> str:
    """
    Retrieve all memory entries for a customer and format them
    into a rich context string for the AI prompt.
    """
    entries = (
        db.query(MemoryHistory)
        .filter(MemoryHistory.customer_id == customer_id)
        .order_by(MemoryHistory.last_interaction_date.desc())
        .limit(5)
        .all()
    )

    if not entries:
        return ""

    lines = []
    for i, entry in enumerate(entries, 1):
        date_str = entry.last_interaction_date.strftime("%B %d, %Y") if entry.last_interaction_date else "Previously"
        lines.append(
            f"{i}. [{date_str}] Category: {entry.issue_category or 'General'} | "
            f"Priority: {entry.priority.value if entry.priority else 'medium'}\n"
            f"   Issue: {entry.previous_complaint}\n"
            f"   Resolution: {entry.previous_resolution}\n"
            f"   Sentiment: {entry.sentiment.value if entry.sentiment else 'neutral'}"
            + (" [REPEAT ISSUE]" if entry.repeat_issue_flag else "")
        )

    return "\n".join(lines)


def store_memory(
    db: Session,
    customer_id: str,
    complaint: str,
    resolution: str,
    category: str,
    priority: str,
    sentiment: str = "neutral",
) -> MemoryHistory:
    """Save a resolved interaction to the Hindsight Memory database."""
    from ..models.models import PriorityLevel, SentimentType

    # Check if this is a repeat issue (same category)
    existing = db.query(MemoryHistory).filter(
        MemoryHistory.customer_id == customer_id,
        MemoryHistory.issue_category == category
    ).first()

    repeat = existing is not None

    entry = MemoryHistory(
        customer_id=customer_id,
        previous_complaint=complaint,
        previous_resolution=resolution,
        issue_category=category,
        priority=PriorityLevel(priority) if priority in ["low","medium","high","urgent"] else PriorityLevel.medium,
        sentiment=SentimentType(sentiment) if sentiment in ["positive","neutral","negative","frustrated"] else SentimentType.neutral,
        repeat_issue_flag=repeat,
        historical_context=f"Resolved via SupportMind on category: {category}",
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
