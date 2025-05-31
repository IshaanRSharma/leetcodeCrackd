from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv
import json
from langchain_core.messages import HumanMessage

load_dotenv()

# LLM Setup
llm = ChatOpenAI(temperature=0.2, api_key=os.getenv("OPEN_API_KEY"))

# Prompt Template
prompt = ChatPromptTemplate.from_messages([
    ("system", """You're an intelligent DSA progress tracker. Analyze the user's message and determine their current progress.

Assess:
1. Problem Understanding (0-100)
2. Approach Clarity (0-100)
3. Implementation Readiness (0-100)
4. Complexity Awareness (0-100)

Respond strictly in JSON:
{{
    "checkpoint": "understanding|planning|implementing|optimizing|complete",
    "problem_understanding": 0-100,
    "approach_clarity": 0-100,
    "implementation_readiness": 0-100,
    "complexity_awareness": 0-100,
    "completion_confidence": 0-100,
    "key_concepts_mentioned": [...],
    "missing_concepts": [...],
    "progress_summary": "...",
    "needs_guidance": true/false
}}"""),
    ("human", """Problem Title: {title}
Previous Checkpoint: {previous_checkpoint}
Problem Description: {description}
User Message: {user_message}""")
])

chain = prompt | llm

def checkpoint_node(state):
    # Safely get last user message
    user_message = ""
    for msg in reversed(state.get("messages", [])):
        # Handle LangChain HumanMessage
        if isinstance(msg, HumanMessage):
            user_message = msg.content
            break
        # Handle raw dictionary format
        elif isinstance(msg, dict) and msg.get("role") == "user":
            user_message = msg.get("content", "")
            break

    problem_data = state.get("problem_data", {})
    title = problem_data.get("title", "Unknown Problem")
    description = problem_data.get("content", "No description available")
    previous_checkpoint = state.get("current_checkpoint", "understanding")

    # Run LLM
    response = chain.invoke({
        "title": title,
        "user_message": user_message,
        "description": description,
        "previous_checkpoint": previous_checkpoint
    })

    # Try parsing response
    try:
        parsed = json.loads(response.content)
        checkpoint = parsed.get("checkpoint", "understanding")
        confidence = parsed.get("completion_confidence", 0)

        # Build updated state
        updated_state = dict(state)
        updated_state["current_checkpoint"] = checkpoint

        # Prevent checkpoint duplication
        prev_checkpoints = set(state.get("checkpoints_completed", []))
        if checkpoint not in prev_checkpoints:
            updated_state["checkpoints_completed"] = list(prev_checkpoints | {checkpoint})

        updated_state["progress_scores"] = {
            "problem_understanding": parsed.get("problem_understanding", 50),
            "approach_clarity": parsed.get("approach_clarity", 50),
            "implementation_readiness": parsed.get("implementation_readiness", 50),
            "complexity_awareness": parsed.get("complexity_awareness", 50),
            "completion_confidence": confidence
        }
        updated_state["checkpoint_analysis"] = parsed

        # Only set needs_guidance if scores are actually low
        avg_score = sum(updated_state["progress_scores"].values()) / len(updated_state["progress_scores"]) if updated_state["progress_scores"] else 50
        updated_state["needs_guidance"] = avg_score < 40 or any(score < 30 for score in updated_state["progress_scores"].values())

        # Optional: mark complete based on confidence
        if checkpoint == "complete" and confidence >= 90:
            updated_state["conversation_complete"] = True

        return updated_state

    except Exception as e:
        print(f"[checkpoint_node] ❌ JSON parse failed: {e}")
        fallback_state = dict(state)
        fallback_state["current_checkpoint"] = previous_checkpoint
        return fallback_state
