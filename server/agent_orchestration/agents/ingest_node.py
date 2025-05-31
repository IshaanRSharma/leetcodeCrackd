from agent_orchestration.tools.leetcode_problem_tool import fetch_leetcode_problem
import re 
import json
from langchain_core.messages import HumanMessage

def is_human(message) -> bool:
    return isinstance(message, HumanMessage)

def extract_title_slug(user_input: str) -> str:
    """Extract title_slug from various LeetCode URL formats or direct slug input"""
    # Pattern to match LeetCode URLs with optional @ prefix and trailing slash
    url_pattern = r'@?https?://leetcode\.com/problems/([^/\s]+)/?'
    match = re.search(url_pattern, user_input)
    
    if match:
        return match.group(1)
    
    # Alternative pattern for just the problem slug with @
    slug_pattern = r'@([a-z0-9-]+)'
    match = re.search(slug_pattern, user_input.lower())
    if match:
        return match.group(1)
    
    # If no special patterns, assume the input is just the slug itself
    # Clean it up by removing any whitespace and converting to lowercase
    cleaned = user_input.strip().lower()
    if re.match(r'^[a-z0-9-]+$', cleaned):
        return cleaned
    
    return None

async def ingest_node(state: dict) -> dict:
    """Extract LeetCode problem slug from user input and fetch problem data"""
    # Fix: Access .content directly from the message object
    user_input = "" 
    if is_human(state["messages"][0]):
        user_input = state["messages"][0].content.strip()
    
    # Extract the title slug
    title_slug = extract_title_slug(user_input)
    
    if not title_slug:
        return {
            "messages": state["messages"] + [{
                "role": "system", 
                "content": json.dumps({
                    "problem_extracted": False,
                    "error": "Could not extract LeetCode problem slug from input. Please provide a valid LeetCode URL or problem slug."
                })
            }],
            "problem_extracted": False,
            "problem_data": None,
            "session_started": False
        }
    
    try:
        problem_data = await fetch_leetcode_problem.ainvoke(title_slug)

        # Get the Python code snippet
        code_snippet_python = next(
            (snip["code"] for snip in problem_data["codeSnippets"] if "python" in snip["langSlug"].lower()), ""
        )

        # Extract topic tags (e.g., Array, Hash Table)
        topics = [tag["name"] for tag in problem_data["topicTags"]]

        # Update the state with extracted problem data
        return {
            "messages": state["messages"] + [{
                "role": "system",
                "content": f"Fetched '{problem_data['title']}' with difficulty {problem_data['difficulty']} and topics: {', '.join(topics)}."
            }],
            "problem_extracted": True,
            "problem_data": {
                "question_id": problem_data["questionId"],
                "title": problem_data["title"],
                "difficulty": problem_data["difficulty"],
                "topics": topics,
                "description_html": problem_data["content"],
                "examples": problem_data.get("exampleTestcases", []),
                "code_snippet_python": code_snippet_python,
            },
            "current_checkpoint": "understanding",
            "checkpoints_completed": [],
            "hints_given": [],
            "session_started": True
        }
        
    except Exception as e:
        error_analysis = {
            "problem_extracted": False,
            "error": f"Failed to fetch problem data for '{title_slug}': {str(e)}"
        }
        
        return {
            "messages": state["messages"] + [{
                "role": "system",
                "content": json.dumps(error_analysis)
            }],
            "problem_extracted": False,
            "problem_data": None,
            "session_started": False
        }