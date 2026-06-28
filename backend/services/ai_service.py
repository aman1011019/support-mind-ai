"""
SupportMind AI Service
Powers the AI resolution engine with provider-backed generation.
Uses CascadeFlow logic to select the right model based on complexity.
"""
import time
from ..config import settings

try:
    import google.generativeai as genai
except Exception:
    genai = None

# Configure the AI provider
if settings.AI_PROVIDER_API_KEY and genai:
    genai.configure(api_key=settings.AI_PROVIDER_API_KEY)

# CascadeFlow model tiers
CASCADE_MODELS = {
    1: "gemini-2.0-flash",          # Simple queries — fast + cheap
    2: "gemini-2.0-flash",          # Medium complexity
    3: "gemini-2.0-flash-thinking-exp",  # Complex reasoning
}

CASCADE_COSTS = {
    1: 0.0002,   # per 1k tokens
    2: 0.0005,
    3: 0.0015,
}

BASELINE_COST_PER_1K = 0.002   # GPT-4 equivalent baseline


def determine_cascade_level(priority: str, has_memory: bool, issue_category: str) -> int:
    """CascadeFlow: determine which model tier to use."""
    if priority == "urgent":
        return 3
    if priority == "high" and has_memory:
        return 3
    if priority == "high" or (has_memory and issue_category in ["Billing", "Technical Bug"]):
        return 2
    return 1


def generate_support_response(
    customer_name: str,
    issue_text: str,
    issue_category: str,
    priority: str,
    order_id: str,
    memory_context: str,
    customer_plan: str = "Starter",
) -> dict:
    """
    Generate a personalized AI support response using the configured provider.
    Returns dict with response text, model used, tokens, cost.
    """
    has_memory = bool(memory_context and memory_context.strip())
    cascade_level = determine_cascade_level(priority, has_memory, issue_category)
    model_name = CASCADE_MODELS[cascade_level]
    public_model_name = f"SupportMind Cascade L{cascade_level}"

    # Build the system prompt
    system_prompt = """You are SupportMind, an elite enterprise customer support agent.
You have access to the customer's full interaction history through Hindsight Memory™.
Your goal: craft a highly personalized, empathetic, and actionable support response.

Rules:
- Reference specific historical context when available (show you actually remember them)
- Be concise but thorough — no generic filler text
- Always end with a clear next action
- Match tone to urgency level (urgent = immediate action language)
- For Enterprise customers: extra care, specific escalation paths
- Include specific order/ticket IDs and dates when relevant
- Write as a professional email/chat message to the customer"""

    # Build the user prompt
    memory_section = f"""
HINDSIGHT MEMORY — PREVIOUS INTERACTIONS:
{memory_context}
""" if has_memory else "HINDSIGHT MEMORY: No previous interactions found for this customer."

    user_prompt = f"""
CUSTOMER PROFILE:
- Name: {customer_name}
- Subscription Plan: {customer_plan}
- Order/Ticket ID: {order_id or 'N/A'}

{memory_section}

CURRENT COMPLAINT ({priority.upper()} PRIORITY — {issue_category}):
"{issue_text}"

Generate a personalized support response that:
1. Acknowledges the specific current issue
2. References relevant historical context (if any) that explains or relates to this issue
3. Provides clear, actionable next steps
4. Includes any relevant credits/escalations based on their plan and history
5. Ends with a warm closing that builds customer loyalty

Write the response as a professional customer support email/message:"""

    start_time = time.time()

    try:
        if not settings.AI_PROVIDER_API_KEY or not genai:
            raise RuntimeError("AI provider SDK or API key is not configured")
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(
            user_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=800,
            )
        )
        response_text = response.text
        tokens_used = response.usage_metadata.total_token_count if hasattr(response, 'usage_metadata') else 500

    except Exception as e:
        # Fallback: generate a contextual response without API
        response_text = _generate_fallback_response(
            customer_name, issue_text, issue_category, priority, order_id, memory_context, customer_plan
        )
        tokens_used = 400
        public_model_name = f"SupportMind Cascade L{cascade_level} (fallback)"

    elapsed_ms = int((time.time() - start_time) * 1000)

    # Calculate costs
    cost_per_1k = CASCADE_COSTS[cascade_level]
    cost_usd = (tokens_used / 1000) * cost_per_1k
    baseline_cost = (tokens_used / 1000) * BASELINE_COST_PER_1K
    savings_percent = round((1 - cost_usd / baseline_cost) * 100) if baseline_cost > 0 else 76

    # Generate recommended internal action
    recommended_resolution = _generate_recommended_action(
        issue_category, priority, has_memory, customer_plan
    )

    # Compute urgency score
    urgency_map = {"urgent": 95, "high": 78, "medium": 55, "low": 32}
    urgency_score = urgency_map.get(priority, 55)
    if has_memory:
        urgency_score = min(100, urgency_score + 10)

    return {
        "response_text": response_text,
        "model_name": public_model_name,
        "tokens_used": tokens_used,
        "cost_usd": round(cost_usd, 6),
        "baseline_cost": round(baseline_cost, 6),
        "savings_percent": savings_percent,
        "cascade_level": cascade_level,
        "confidence_score": 0.95 if has_memory else 0.82,
        "urgency_score": urgency_score,
        "escalation_required": priority in ["urgent", "high"] or (urgency_score >= 85),
        "recommended_resolution": recommended_resolution,
        "elapsed_ms": elapsed_ms,
    }


def _generate_recommended_action(category: str, priority: str, has_memory: bool, plan: str) -> str:
    """Generate internal action recommendation for support agents."""
    actions = {
        "Billing": f"Review and approve credit/refund request. Check payment gateway logs. {'Priority escalation to billing team.' if priority in ['urgent','high'] else 'Standard billing review.'}",
        "Shipping": f"Contact logistics partner for tracking update. {'Dispatch priority courier replacement.' if priority == 'urgent' else 'Issue tracking update to customer.'}",
        "API Access": "Regenerate API credentials in the correct environment. Validate webhook endpoint configuration.",
        "Subscription": f"Review plan change history. {'Offer retention coupon (20% off upgrade).' if plan != 'Enterprise' else 'Connect with enterprise account manager.'}",
        "Technical Bug": "Create engineering ticket. Collect browser/OS details. Assign P1 engineer if urgent.",
        "General": "Log and tag ticket. Assign to appropriate specialist team.",
    }
    base_action = actions.get(category, actions["General"])
    if has_memory:
        base_action += " Note: Repeat customer — reference previous interaction in response for continuity."
    return base_action


def _generate_fallback_response(
    name: str, issue: str, category: str, priority: str,
    order_id: str, memory: str, plan: str
) -> str:
    """High-quality fallback response when the AI provider is unavailable."""
    memory_section = ""
    if memory:
        memory_section = f"\n\nLooking at your account history, I can see: {memory[:200]}... I want to make sure this current situation is handled with full context of your previous experience with us.\n"

    urgency_line = ""
    if priority == "urgent":
        urgency_line = "\n\nGiven the urgency of your situation, I am personally escalating this to our senior support team with an immediate response guarantee.\n"
    elif priority == "high":
        urgency_line = "\n\nI'm prioritizing your request and will ensure it's handled within our premium SLA window.\n"

    plan_note = ""
    if plan == "Enterprise":
        plan_note = f"\n\nAs an Enterprise partner, you have direct access to our dedicated support line. I'm flagging your account for white-glove treatment."
    elif plan == "Growth":
        plan_note = f"\n\nAs a Growth customer, you're on our priority support tier. I'll make sure this is resolved today."

    return f"""Dear {name},

Thank you for reaching out to SupportMind Support. I'm sorry to hear you're experiencing an issue with your {category.lower()} — specifically: "{issue[:100]}{'...' if len(issue) > 100 else ''}".
{memory_section}{urgency_line}
Here's what I'm doing right now for your order/ticket {order_id or 'N/A'}:

• Immediately reviewing your account and flagging this {category} issue
• Routing to the appropriate specialist team with full context
• Ensuring this is resolved within our guaranteed SLA window
{plan_note}

I will personally follow up with you as soon as we have a resolution in place. If you need anything in the meantime, please reply directly to this message.

Thank you for your patience and for being a valued customer.

Best regards,
SupportMind Agent
Enterprise Customer Support"""
