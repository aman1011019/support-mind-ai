"""
SupportMind Database Seed Script
Seeds demo customers and Hindsight Memory for hackathon demo.
Run: python backend/seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from backend.database.database import engine, Base, SessionLocal
from backend.models.models import Customer, MemoryHistory, PlanType, PriorityLevel, SentimentType
from datetime import datetime, timedelta


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Customer).count() > 0:
            print("[INFO] Database already seeded. Skipping.")
            return

        print("[INFO] Seeding SupportMind database...")


        # ─── Customers ────────────────────────────────────────────────────────
        sarah = Customer(
            id="cust-1",
            name="Sarah Jenkins",
            email="sarah.jenkins@acmecorp.com",
            phone="+1-555-0192",
            address="Acme Corp, 123 Business Ave, San Francisco, CA",
            plan=PlanType.enterprise,
            order_id="ORD-90812",
            avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        )

        david = Customer(
            id="cust-2",
            name="David Chen",
            email="david.chen@stackdev.io",
            phone="+1-555-0847",
            address="StackDev, 88 Developer Lane, Austin, TX",
            plan=PlanType.growth,
            order_id="API-55219",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        )

        elena = Customer(
            id="cust-3",
            name="Elena Rostova",
            email="elena.rostova@designflow.co",
            phone="+1-555-0361",
            address="DesignFlow Studio, 45 Creative Blvd, New York, NY",
            plan=PlanType.starter,
            order_id="WS-88120",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        )

        db.add_all([sarah, david, elena])
        db.flush()

        # ─── Hindsight Memory for Sarah Jenkins (Enterprise) ──────────────────
        sarah_memories = [
            MemoryHistory(
                customer_id="cust-1",
                previous_complaint="Payment verification gateway failure — card kept failing at checkout",
                previous_resolution="Manually processed card transaction via secondary merchant gateway. Applied $15 processing fee waiver.",
                historical_context="Customer is on Enterprise plan. Payment issue caused 6-hour delay in order processing.",
                issue_category="Billing",
                priority=PriorityLevel.high,
                sentiment=SentimentType.frustrated,
                repeat_issue_flag=False,
                last_interaction_date=datetime.utcnow() - timedelta(days=3),
            ),
            MemoryHistory(
                customer_id="cust-1",
                previous_complaint="Overnight priority delivery upgrade needed for executive keynote presentation",
                previous_resolution="Manually adjusted shipping class to Courier-Priority. Expedited at no extra charge.",
                historical_context="Time-sensitive executive event. Customer upgraded shipping retroactively.",
                issue_category="Shipping",
                priority=PriorityLevel.medium,
                sentiment=SentimentType.neutral,
                repeat_issue_flag=False,
                last_interaction_date=datetime.utcnow() - timedelta(days=7),
            ),
            MemoryHistory(
                customer_id="cust-1",
                previous_complaint="Need to add 15 additional seats to team hub for new department onboarding",
                previous_resolution="Pro-rated billing update completed. Added 15 seats instantly. No downtime.",
                historical_context="Team expansion — enterprise growth indicator. High-value customer.",
                issue_category="Subscription",
                priority=PriorityLevel.low,
                sentiment=SentimentType.positive,
                repeat_issue_flag=False,
                last_interaction_date=datetime.utcnow() - timedelta(days=14),
            ),
        ]

        # ─── Hindsight Memory for David Chen (Growth) ─────────────────────────
        david_memories = [
            MemoryHistory(
                customer_id="cust-2",
                previous_complaint="Sandbox key generation error — credentials not working in staging environment",
                previous_resolution="Re-generated credentials in staging region and sent webhook config. Updated API docs link.",
                historical_context="Developer account. Staging vs production environment confusion is common.",
                issue_category="API Access",
                priority=PriorityLevel.medium,
                sentiment=SentimentType.neutral,
                repeat_issue_flag=False,
                last_interaction_date=datetime.utcnow() - timedelta(days=5),
            ),
            MemoryHistory(
                customer_id="cust-2",
                previous_complaint="Rate limiting tier increase needed — hitting endpoint limits on production",
                previous_resolution="Granted 14-day grace period on endpoint limits. Upgraded rate limit tier temporarily.",
                historical_context="High API usage indicates product is growing. Upsell opportunity.",
                issue_category="Billing",
                priority=PriorityLevel.high,
                sentiment=SentimentType.frustrated,
                repeat_issue_flag=False,
                last_interaction_date=datetime.utcnow() - timedelta(days=10),
            ),
        ]

        # ─── Hindsight Memory for Elena Rostova (Starter) ─────────────────────
        elena_memories = [
            MemoryHistory(
                customer_id="cust-3",
                previous_complaint="Downgraded from Pro to Starter Workspace — need confirmation of refund",
                previous_resolution="Confirmed workspace reduction. Refunded remaining 12 days on credit. Applied coupon REUPGRADE20 for future.",
                historical_context="Plan downgrade — potential churn risk. Offered retention discount.",
                issue_category="Subscription",
                priority=PriorityLevel.low,
                sentiment=SentimentType.neutral,
                repeat_issue_flag=False,
                last_interaction_date=datetime.utcnow() - timedelta(days=4),
            ),
        ]

        db.add_all(sarah_memories + david_memories + elena_memories)
        db.commit()

        print("[OK] Seeded 3 customers with Hindsight Memory histories:")
        print("   - Sarah Jenkins (Enterprise) -- 3 memory entries")
        print("   - David Chen (Growth) -- 2 memory entries")
        print("   - Elena Rostova (Starter) -- 1 memory entry")
        print("[OK] SupportMind is ready for demo!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
