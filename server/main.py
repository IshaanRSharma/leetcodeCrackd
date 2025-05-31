import os
import json
import requests
from fastapi import FastAPI, HTTPException, Depends, Request, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from agent_orchestration.graph import graph as langgraph_app
from langchain_core.messages import HumanMessage, AIMessage


app = FastAPI(title="LeetCodeCrackd Server", version="1.0.0")

# === CORS for local Next.js ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# === LeetCode Problem Fetcher ===
async def get_leetcode_problem(title_slug: str):
    url = "https://leetcode.com/graphql"

    query = """
    query getQuestionDetail($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
            questionId
            title
            titleSlug
            content
            difficulty
            topicTags {
                name
                slug
            }
            codeSnippets {
                lang
                langSlug
                code
            }
            sampleTestCase
            exampleTestcases
        }
    }
    """
    payload = {
        "query": query,
        "variables": {"titleSlug": title_slug}
    }

    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 200:
        return response.json().get("data", {}).get("question")
    else:
        raise Exception(f"Failed to fetch problem: {response.status_code}")

@app.get("/leetcode/{title_slug}")
async def get_problem(title_slug: str):
    try:
        problem = await get_leetcode_problem(title_slug)
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")
        return {"status": "success", "problem": problem}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "healthy"}

# === Run LangGraph MVP Flow ===
@app.post("/run-graph")
async def run_langgraph_api():
    print("🚀 Starting Enhanced LangGraph Test")
    print("=" * 50)
    thread_id = "test-session-enhanced-001"

    test_conversation = [
        "https://leetcode.com/problems/two-sum/",
        "I read the problem but I'm not really sure what it's asking for. Something about numbers?",
        "I don't understand. Can you explain what we need to do?",
        "Oh I see, so we need to find two numbers that add up to a target. But how do I actually do that?",
        "I'm thinking maybe I should just try every combination? But that seems slow...",
        "I think I understand now. I could use a hash map."
    ]

    config = {"configurable": {"thread_id": thread_id}}
    max_steps_total = 30
    max_steps_per_message = 8
    step_count = 0
    final_state = None

    def log_node_state(step_idx, node_name, state):
        print(f"📍 STEP {step_idx}: {node_name}")
        print(f"🔧 Node: {node_name}")
        if "total_socratic_turns" in state:
            print(f"   🔄 Socratic turns: {state['total_socratic_turns']}")
        if "current_checkpoint" in state:
            print(f"   🎯 Checkpoint: {state['current_checkpoint']}")
        if "progress_scores" in state and state["progress_scores"]:
            avg = sum(state["progress_scores"].values()) / len(state["progress_scores"])
            print(f"   📊 Progress: {avg:.1f}%")
        if "hints_given" in state:
            print(f"   💡 Hints given: {len(state['hints_given'])}")
        if "messages" in state and state["messages"]:
            latest = state["messages"][-1]
            role = getattr(latest, "type", "unknown").upper()
            content = getattr(latest, "content", str(latest))
            print(f"   💬 {role}: {content}...")

    try:
        for i, user_msg in enumerate(test_conversation):
            print(f"\n🔄 PROCESSING MESSAGE {i + 1}")
            print(f"👤 USER: {user_msg}")
            print("-" * 60)

            # Restore prior state
            state_snapshot = langgraph_app.get_state(config)
            current_state = state_snapshot[0] if state_snapshot else None

            if not current_state:
                # First message
                current_state = {
                    "messages": [HumanMessage(content=user_msg)],
                    "problem_extracted": False,
                    "problem_data": None,
                    "current_checkpoint": "understanding",
                    "checkpoints_completed": [],
                    "hint_requested": False,
                    "hints_given": [],
                    "session_started": False,
                    "conversation_complete": False,
                    "hint_satisfied": False,
                    "progress_scores": {},
                    "checkpoint_analysis": {},
                    "needs_guidance": False,
                    "last_hint_assessment": {},
                    "total_socratic_turns": 0,
                }
            else:
                current_state["messages"].append(HumanMessage(content=user_msg))

            steps_this_msg = 0
            async for step in langgraph_app.astream(current_state, config=config):
                steps_this_msg += 1
                step_count += 1

                if steps_this_msg > max_steps_per_message:
                    print(f"⚠️ Too many steps for one message ({steps_this_msg}), skipping ahead")
                    break
                if step_count > max_steps_total:
                    print(f"🛑 Max step count reached ({step_count})")
                    break

                for node_name, state in step.items():
                    final_state = state
                    current_state = state
                    log_node_state(step_count, node_name, state)

            if step_count > max_steps_total:
                break

        print("\n🏁 Graph Execution Complete")
        print("=" * 60)
        print(f"📊 Final Statistics:")
        print(f"   - Total Steps: {step_count}")
        print(f"   - Messages Processed: {len(test_conversation)}")
        if final_state:
            print(f"   - Final Checkpoint: {final_state.get('current_checkpoint')}")
            print(f"   - Socratic Turns: {final_state.get('total_socratic_turns', 0)}")
            print(f"   - Hints Given: {len(final_state.get('hints_given', []) if final_state else [])}")

        return {
            "success": True,
            "step_count": step_count,
            "conversation_length": len(test_conversation),
            "final_state": final_state,
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e), "step_count": step_count}
