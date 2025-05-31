from langchain.tools import tool
import httpx

@tool
async def fetch_leetcode_problem(title_slug: str) -> dict:
    """
    Fetch LeetCode problem data from the FastAPI server given a title slug like 'two-sum'.
    Returns JSON with description, difficulty, tags, test cases, and code snippets.
    """
    async with httpx.AsyncClient() as client:
        res = await client.get(f"http://localhost:8000/leetcode/{title_slug}")
    res.raise_for_status()
    return res.json()["problem"]