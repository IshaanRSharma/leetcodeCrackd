from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage
import os
import json
from dotenv import load_dotenv

load_dotenv()

def is_human(message) -> bool:
    return isinstance(message, HumanMessage)

# === Define Chat Models ===
llm = ChatOpenAI(temperature=0.4, api_key=os.getenv("OPEN_API_KEY"))

# === Prompts ===

assessment_prompt = ChatPromptTemplate.from_messages([
    ("system", """You're an intelligent tutoring assistant and an expert in Leetcode problems. Analyze whether the user is stuck and needs help.

Respond in JSON format like this (escape the braces properly):
{{
  "is_stuck": true,
  "struggling_with": "short phrase",
  "hint_type": "conceptual",
  "understanding_level": "beginner"
}}

Hint types: conceptual, algorithmic, implementation, example
Understanding levels: beginner, intermediate, advanced"""),
    ("human", """User Messages: {recent_messages}

Checkpoint: {checkpoint}
Problem: {title}""")
])

hint_prompt = ChatPromptTemplate.from_messages([
    ("system", """You're a helpful tutor. Give a concise hint based on the following:
    
Hint Type: {hint_type}
User Level: {understanding_level}
Struggling With: {struggling_with}

Respond in 1-3 sentences. Be actionable and clear."""),
    ("human", "Problem: {title}\nCheckpoint: {checkpoint}\nDescription: {description_html}")
])

assessment_chain = assessment_prompt | llm
hint_chain = hint_prompt | llm

# === Hint Node ===
def hint_node(state):
    problem_data = state.get("problem_data", {})
    recent_messages = [m.content for m in state["messages"][-10:] if is_human(m)]
    checkpoint = state.get("current_checkpoint", "understanding")
    title = problem_data.get("title", "Unknown Problem")
    description = problem_data.get("content", "No description available")

    # --- CASE 1: If user clicked "Get Hint", skip LLM assessment ---
    if state.get("hint_requested", False):
        is_hint_forced = True
    else:
        is_hint_forced = False

    # --- CASE 2: Otherwise assess if user is struggling ---
    if not is_hint_forced:
        response = assessment_chain.invoke({
            "recent_messages": "\n".join(recent_messages),
            "checkpoint": checkpoint,
            "title": title
        })

        try:
            result = json.loads(response.content)
            is_stuck = result.get("is_stuck", False)
        except json.JSONDecodeError:
            is_stuck = True  # fallback
            result = {
                "struggling_with": "general reasoning",
                "hint_type": "conceptual",
                "understanding_level": "intermediate"
            }

        if not is_stuck:
            return {
                "messages": state["messages"] + [
                    {"role": "system", "content": "👍 Keep going — you're making good progress!"}
                ],
                "hint_requested": False,
                "hint_satisfied": False
            }
    else:
        # Default fallback in case hint_requested is True but no prior assessment
        result = {
            "struggling_with": "general reasoning",
            "hint_type": "conceptual",
            "understanding_level": "intermediate"
        }

    # --- Generate Hint ---
    hint_response = hint_chain.invoke({
        "title": title,
        "checkpoint": checkpoint,
        "description_html": description,
        "hint_type": result.get("hint_type", "conceptual"),
        "understanding_level": result.get("understanding_level", "intermediate"),
        "struggling_with": result.get("struggling_with", "general")
    })

    hint_content = getattr(hint_response, "content", str(hint_response))

    # --- Update State ---
    new_hint_data = {
        "checkpoint": checkpoint,
        "hint_type": result.get("hint_type"),
        "struggling_with": result.get("struggling_with"),
        "content": hint_content
    }

    return {
        "messages": state["messages"] + [{"role": "assistant", "content": f"💡 **Hint**: {hint_content}"}],
        "hints_given": state.get("hints_given", []) + [new_hint_data],
        "hint_requested": False,
        "hint_satisfied": True,
        "last_hint_assessment": result
    }
