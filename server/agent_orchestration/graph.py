from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from typing import TypedDict, List, Optional, Annotated

from agent_orchestration.agents.ingest_node import ingest_node
from agent_orchestration.agents.socratic_node import socratic_node
from agent_orchestration.agents.hint_node import hint_node
from agent_orchestration.agents.checkpoint_node import checkpoint_node

# === State Schema ===
class ProblemData(TypedDict, total=False):
    question_id: str
    title: str
    title_slug: str
    difficulty: str
    topics: List[str]
    description_html: str
    examples: List[str]
    code_snippet_python: str
    content: str
    sample_test_case: str
    patterns: List[str]
    data_structures: List[str]
    concepts: List[str]

class HintData(TypedDict, total=False):
    checkpoint: str
    hint_type: str
    struggling_with: str
    content: str

class HintAssessment(TypedDict, total=False):
    is_stuck: bool
    struggling_with: str
    hint_type: str
    understanding_level: str

class State(TypedDict, total=False):
    messages: Annotated[List[dict], add_messages]
    problem_extracted: bool
    problem_data: Optional[ProblemData]
    title_slug: Optional[str]
    extraction_successful: bool
    current_checkpoint: Optional[str]
    checkpoints_completed: List[str]
    hint_requested: bool
    hints_given: List[HintData]
    session_started: bool
    conversation_complete: bool
    hint_satisfied: bool
    progress_scores: Optional[dict]
    checkpoint_analysis: Optional[dict]
    needs_guidance: bool
    last_hint_assessment: Optional[HintAssessment]
    total_socratic_turns: int
    ingest_completed: bool

# === Memory + Graph Builder ===
memory = MemorySaver()
builder = StateGraph(State)

# === Define Nodes ===
builder.set_entry_point("router")
builder.add_node("router", lambda state: state)
builder.add_node("ingest", ingest_node)
builder.add_node("socratic", socratic_node)
builder.add_node("checkpoint", checkpoint_node)
builder.add_node("hint", hint_node)
builder.add_node("completion_checker", lambda state: {
    **state,
    "conversation_complete": state.get("current_checkpoint") == "complete"
})

# === Routing Logic ===
def router_node(state: State) -> str:
    if not state.get("problem_extracted"):
        print("🧭 ROUTER → ingest")
        return "ingest"
    if state.get("conversation_complete"):
        print("🧭 ROUTER → END")
        return END
    print("🧭 ROUTER → socratic")
    return "socratic"

def after_ingest(state: State) -> str:
    return "socratic" if state.get("problem_extracted") else END

def after_socratic(state: State) -> str:
    return "checkpoint"

def after_checkpoint(state: State) -> str:
    return "completion_checker"

def after_completion_checker(state: State) -> str:
    if state.get("conversation_complete"):
        print("✅ Completion → END")
        return END
    if state.get("hint_requested") or state.get("needs_guidance"):
        print("🧠 Needs guidance → hint")
        return "hint"
    print("🔁 Good progress → socratic")
    return "socratic"

def after_hint(state: State) -> str:
    return END

# === Define Graph Edges ===
builder.add_conditional_edges("router", router_node, {
    "ingest": "ingest",
    "socratic": "socratic",
    END: END,
})

builder.add_conditional_edges("ingest", after_ingest, {
    "socratic": "socratic",
    END: END,
})

builder.add_conditional_edges("socratic", after_socratic, {
    "checkpoint": "checkpoint"
})

builder.add_conditional_edges("checkpoint", after_checkpoint, {
    "completion_checker": "completion_checker"
})

builder.add_conditional_edges("completion_checker", after_completion_checker, {
    END: END,
    "hint": "hint",
    "socratic": "socratic"
})

builder.add_conditional_edges("hint", after_hint, {
    END: END
})

# === Compile the Graph ===
graph = builder.compile(checkpointer=memory)
