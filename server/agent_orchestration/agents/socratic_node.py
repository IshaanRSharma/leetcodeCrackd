from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
import os
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage


load_dotenv()

def is_human(message) -> bool:
    return isinstance(message, HumanMessage)

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an expert Socratic tutor specializing in LeetCode coding interview preparation. Your role is to guide software engineers through problem-solving without giving away solutions.

CORE PRINCIPLES:
- Ask probing questions that lead to insights rather than providing direct answers
- Help users break down complex problems into manageable parts
- Guide them to recognize patterns and data structures
- Encourage thinking about edge cases, time/space complexity
- Validate progress with encouraging feedback when they're on the right track

RESPONSE FORMAT:
- Start with brief validation if user shows correct reasoning: "That's right!" or "Good thinking!" or "You're on the right track!"
- Follow with 1-2 Socratic questions that advance their understanding
- Focus on the current checkpoint: understanding → approach → implementation → optimization

QUESTION TYPES TO USE:
- Pattern recognition: "What similar problems have you solved?"
- Data structure selection: "What data structure might help here?"
- Algorithm approach: "How would you approach this step by step?"
- Edge cases: "What happens if the input is empty/very large?"
- Complexity analysis: "How efficient is this approach?"

Keep responses concise and focused. Never solve the problem directly."""),
    ("human", "Problem: {problem_title}\nCheckpoint: {checkpoint}\nMessage: {user_message}")
])

llm = ChatOpenAI(temperature=0.3, streaming=True, api_key=os.getenv("OPEN_API_KEY"))

# Define the chain
chain = prompt | llm

def socratic_node(state):
    user_messages = [m.content for m in state["messages"] if is_human(m)]
    last_user_message = user_messages[-1] if user_messages else ""
    
    # Use the nested problem_data structure
    problem_data = state.get("problem_data", {})
    
    response = chain.invoke({
        "problem_title": problem_data.get("title", "Unknown Problem"),
        "checkpoint": state.get("current_checkpoint", "understanding"),
        "user_message": last_user_message
    })
    
    # NEW: Increment socratic turn counter
    current_turns = state.get("total_socratic_turns", 0)
    return {
        "messages": [response],
        "total_socratic_turns": current_turns + 1
    }