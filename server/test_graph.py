#!/usr/bin/env python3
"""
Interactive Human Harness for LangGraph Testing
Run this to chat with your AI tutor in real-time
"""

import asyncio
import os
import sys
from datetime import datetime
from typing import Dict, Any

# Add the server directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agent_orchestration.graph import graph
from langchain_core.messages import HumanMessage

class Colors:
    """ANSI color codes for terminal output"""
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    PURPLE = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    END = '\033[0m'

class InteractiveHarness:
    def __init__(self):
        self.thread_id = f"interactive-session-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        self.config = {"configurable": {"thread_id": self.thread_id}}
        self.step_count = 0
        self.conversation_history = []
        
    def print_banner(self):
        """Print welcome banner"""
        print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.WHITE}🚀 LeetCode Crackd - Interactive AI Tutor{Colors.END}")
        print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
        print(f"{Colors.CYAN}Session ID: {self.thread_id}{Colors.END}")
        print(f"{Colors.YELLOW}💡 Tips:{Colors.END}")
        print(f"  • Start with a LeetCode URL or problem description")
        print(f"  • Type 'quit', 'exit', or 'bye' to end session")
        print(f"  • Type 'help' for commands")
        print(f"  • Type 'status' to see current state")
        print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")

    def print_help(self):
        """Print help commands"""
        print(f"\n{Colors.YELLOW}📚 Available Commands:{Colors.END}")
        print(f"  {Colors.GREEN}help{Colors.END}     - Show this help")
        print(f"  {Colors.GREEN}status{Colors.END}   - Show current session state")
        print(f"  {Colors.GREEN}history{Colors.END}  - Show conversation history")
        print(f"  {Colors.GREEN}reset{Colors.END}    - Reset the session")
        print(f"  {Colors.GREEN}debug{Colors.END}    - Toggle debug mode")
        print(f"  {Colors.GREEN}quit{Colors.END}     - Exit the session")
        print()

    def print_status(self, state: Dict[Any, Any]):
        """Print current session status"""
        print(f"\n{Colors.PURPLE}📊 Session Status:{Colors.END}")
        print(f"  🎯 Checkpoint: {state.get('current_checkpoint', 'None')}")
        print(f"  🔄 Socratic Turns: {state.get('total_socratic_turns', 0)}")
        print(f"  💡 Hints Given: {len(state.get('hints_given', []))}")
        print(f"  ✅ Checkpoints Completed: {len(state.get('checkpoints_completed', []))}")
        print(f"  📝 Total Messages: {len(state.get('messages', []))}")
        
        if state.get('problem_data'):
            problem = state['problem_data']
            print(f"  📚 Problem: {problem.get('title', 'Unknown')}")
            print(f"  🎚️ Difficulty: {problem.get('difficulty', 'Unknown')}")
        
        if state.get('progress_scores'):
            scores = state['progress_scores']
            avg_score = sum(scores.values()) / len(scores) if scores else 0
            print(f"  📈 Progress: {avg_score:.1f}%")
        print()

    def print_history(self):
        """Print conversation history"""
        print(f"\n{Colors.CYAN}📜 Conversation History:{Colors.END}")
        for i, (role, content, timestamp) in enumerate(self.conversation_history, 1):
            role_color = Colors.GREEN if role == "Human" else Colors.BLUE
            print(f"  {i:2d}. {role_color}[{role}]{Colors.END} {timestamp}")
            print(f"      {content[:100]}{'...' if len(content) > 100 else ''}")
        print()

    def format_ai_response(self, content: str) -> str:
        """Format AI response with better readability"""
        # Add colors to markdown-like formatting
        content = content.replace('**', f'{Colors.BOLD}').replace('**', f'{Colors.END}')
        content = content.replace('*', f'{Colors.YELLOW}').replace('*', f'{Colors.END}')
        
        # Highlight code blocks
        if '```' in content:
            parts = content.split('```')
            for i in range(1, len(parts), 2):  # Every other part is code
                parts[i] = f"{Colors.CYAN}{parts[i]}{Colors.END}"
            content = '```'.join(parts)
        
        return content

    async def get_user_input(self) -> str:
        """Get user input with prompt"""
        try:
            user_input = input(f"{Colors.GREEN}👤 You: {Colors.END}").strip()
            return user_input
        except (KeyboardInterrupt, EOFError):
            print(f"\n{Colors.YELLOW}👋 Session interrupted. Goodbye!{Colors.END}")
            return "quit"

    async def process_user_input(self, user_input: str, current_state: Dict[Any, Any]) -> bool:
        """Process user input and handle commands"""
        # Handle special commands
        if user_input.lower() in ['quit', 'exit', 'bye']:
            print(f"{Colors.YELLOW}👋 Thanks for using LeetCode Crackd! Goodbye!{Colors.END}")
            return False
        
        elif user_input.lower() == 'help':
            self.print_help()
            return True
        
        elif user_input.lower() == 'status':
            self.print_status(current_state)
            return True
        
        elif user_input.lower() == 'history':
            self.print_history()
            return True
        
        elif user_input.lower() == 'reset':
            print(f"{Colors.YELLOW}🔄 Resetting session...{Colors.END}")
            self.thread_id = f"interactive-session-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
            self.config = {"configurable": {"thread_id": self.thread_id}}
            self.step_count = 0
            self.conversation_history = []
            print(f"{Colors.GREEN}✅ Session reset! New session ID: {self.thread_id}{Colors.END}")
            return True
        
        elif user_input.lower() == 'debug':
            print(f"{Colors.CYAN}🐛 Current state keys: {list(current_state.keys())}{Colors.END}")
            return True
        
        elif not user_input:
            print(f"{Colors.RED}❌ Please enter a message or command{Colors.END}")
            return True
        
        # Process as regular message
        await self.send_message(user_input, current_state)
        return True

    async def send_message(self, message: str, current_state: Dict[Any, Any]):
        """Send message through the graph and display response"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        # Add user message to history
        self.conversation_history.append(("Human", message, timestamp))
        
        # Prepare state with user message
        if not current_state.get("messages"):
            current_state["messages"] = []
        
        # Add user message to state
        current_state["messages"].append({"role": "user", "content": message})
        
        print(f"\n{Colors.BLUE}🤖 AI Tutor is thinking...{Colors.END}")
        
        try:
            # Process through graph
            response_received = False
            async for step in graph.astream(current_state, config=self.config):
                self.step_count += 1
                
                for node_name, node_state in step.items():
                    print(f"{Colors.PURPLE}🔧 [{self.step_count}] Processing: {node_name}{Colors.END}")
                    
                    # Update current state
                    current_state.update(node_state)
                    
                    # Check for new AI messages
                    if "messages" in node_state and node_state["messages"]:
                        latest_message = node_state["messages"][-1]
                        
                        # Check if this is a new AI response
                        if hasattr(latest_message, 'content'):
                            ai_content = latest_message.content
                        elif isinstance(latest_message, dict):
                            ai_content = latest_message.get('content', str(latest_message))
                        else:
                            ai_content = str(latest_message)
                        
                        if ai_content and not response_received:
                            response_received = True
                            formatted_response = self.format_ai_response(ai_content)
                            print(f"\n{Colors.BLUE}🤖 AI Tutor:{Colors.END}")
                            print(f"{formatted_response}\n")
                            
                            # Add to history
                            self.conversation_history.append(("AI Tutor", ai_content, timestamp))
            
            if not response_received:
                print(f"{Colors.RED}❌ No response received from AI{Colors.END}")
                
        except Exception as e:
            print(f"{Colors.RED}❌ Error processing message: {e}{Colors.END}")
            import traceback
            traceback.print_exc()

    async def run(self):
        """Main interactive loop"""
        self.print_banner()
        
        # Initialize state
        current_state = {
            "messages": [],
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
            "ingest_completed": False
        }
        
        print(f"{Colors.GREEN}🎯 Ready! Start by pasting a LeetCode URL or describing a problem.{Colors.END}\n")
        
        # Main interaction loop
        while True:
            try:
                user_input = await self.get_user_input()
                should_continue = await self.process_user_input(user_input, current_state)
                
                if not should_continue:
                    break
                    
            except KeyboardInterrupt:
                print(f"\n{Colors.YELLOW}👋 Session interrupted. Goodbye!{Colors.END}")
                break
            except Exception as e:
                print(f"{Colors.RED}❌ Unexpected error: {e}{Colors.END}")
                continue

if __name__ == "__main__":
    harness = InteractiveHarness()
    asyncio.run(harness.run())