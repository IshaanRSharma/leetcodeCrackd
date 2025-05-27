'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

// Message type definitions
type ChatMessage = {
  id: string
  role: 'ai' | 'user' | 'system'
  content: string
  type?: 'text' | 'code' | 'strategy' | 'drill'
  timestamp: Date
}

export default function SolvePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const [currentProblem, setCurrentProblem] = useState<any>(null)
  const [sidebarTab, setSidebarTab] = useState('strategy')
  const [sessionData, setSessionData] = useState({
    strategy: '',
    patterns: [] as string[],
    tags: [] as string[],
    relatedProblems: [] as string[],
    miniExercises: [] as string[],
    solutionUnlocked: false
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/')
      return
    }

    setUser(session.user)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!profileData) {
      router.push('/onboarding')
      return
    }

    setProfile(profileData)
    
    // Initialize session
    setMessages([
      {
        id: '1',
        role: 'ai',
        content: `Hey ${profileData.username}! 👋 I'm your AI coding mentor.\n\nLet's get started:\nPaste a LeetCode problem url (preferred) or a problem description.\n\nI'll guide you step-by-step using questions, not just answers! 🧠`,
        timestamp: new Date(),
        type: 'text'
      }
    ])
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setIsTyping(true)
  }

  const generateAgentResponse = (userInput: string) => {
    // Mock agent responses based on input
    if (userInput.toLowerCase().includes('two sum') || userInput.toLowerCase().includes('target sum')) {
      setCurrentProblem({
        title: 'Two Sum',
        difficulty: 'Easy',
        tags: ['Array', 'Hash Table']
      })
      
      setSessionData(prev => ({
        ...prev,
        strategy: 'Use hash table to store complements',
        patterns: ['Hash Table Lookup'],
        tags: ['Array', 'Hash Table', 'One Pass'],
        relatedProblems: ['3Sum', 'Two Sum II', 'Two Sum BST']
      }))

      return {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `Perfect! **Two Sum** is a fantastic starting problem. Let me guide you through this.\n\n🧠 **First Question:** Before we code, what do you think the brute force approach would be?\n\n*Think about checking every possible pair...*`,
        timestamp: new Date(),
        type: 'text'
      }
    }

    if (userInput.toLowerCase().includes('brute force')) {
      return {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `Excellent thinking! 🎯\n\n**Brute Force = Nested Loops:**\n\`\`\`python\nfor i in range(len(nums)):\n    for j in range(i+1, len(nums)):\n        if nums[i] + nums[j] == target:\n            return [i, j]\n\`\`\`\n\n**Time Complexity:** O(n²)\n\n🤔 **Next Question:** Can we do better than O(n²)? What if we could check "does the complement exist?" in O(1) time?`,
        timestamp: new Date(),
        type: 'code'
      }
    }

    if (userInput.toLowerCase().includes('hash') || userInput.toLowerCase().includes('dictionary')) {
      setSessionData(prev => ({
        ...prev,
        miniExercises: ['Implement hash table lookup', 'Find complement in array']
      }))

      return {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `🔥 **Brilliant!** Hash tables are the key!\n\n**The insight:** For each number, we need its complement (target - current).\n\n🧠 **Challenge Question:** As we iterate through the array, what two things should we check at each step?\n\n*Hint: One check, one action...*`,
        timestamp: new Date(),
        type: 'text'
      }
    }

    // Default response
    return {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      content: `I see you mentioned: "${userInput}"\n\nLet me help you think through this systematically:\n\n**Step 1:** What's the core problem we're solving?\n**Step 2:** What constraints do we have?\n**Step 3:** What's your initial approach?\n`,
      timestamp: new Date(),
      type: 'text'
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user'
    
    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
          {!isUser && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 flex items-center justify-center">
                <span className="text-xs font-bold text-white">AI</span>
              </div>
              <span className="text-sm text-gray-400">Coding Mentor</span>
            </div>
          )}
          
          <div className={`px-6 py-4 rounded-2xl ${
            isUser
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'bg-gray-800/60 border border-gray-700/50 backdrop-blur-xl text-gray-100'
          }`}>
            {message.type === 'code' ? (
              <pre className="bg-gray-900/50 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm text-green-400">{message.content}</code>
              </pre>
            ) : (
              <div className="whitespace-pre-wrap leading-relaxed">
                {message.content.split('```').map((part, index) => {
                  if (index % 2 === 1) {
                    return (
                      <pre key={index} className="bg-gray-900/50 p-3 rounded my-2 overflow-x-auto">
                        <code className="text-sm text-emerald-400">{part}</code>
                      </pre>
                    )
                  }
                  return <span key={index}>{part}</span>
                })}
              </div>
            )}
            
            <div className="text-xs opacity-60 mt-2">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getSidebarContent = () => {
    switch (sidebarTab) {
      case 'strategy':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-white mb-3">⚡ Current Strategy</h3>
            {sessionData.strategy ? (
              <div className="bg-gray-700/30 p-3 rounded-lg">
                <p className="text-gray-300">{sessionData.strategy}</p>
              </div>
            ) : (
              <p className="text-gray-500">Start solving to see your strategy develop...</p>
            )}
          </div>
        )
      case 'patterns':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-white mb-3">🧩 Patterns</h3>
            {sessionData.patterns.length > 0 ? (
              sessionData.patterns.map((pattern, i) => (
                <div key={i} className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                  <p className="text-blue-300">{pattern}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Patterns will appear as you solve...</p>
            )}
          </div>
        )
      case 'tags':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-white mb-3">🧠 Tags</h3>
            <div className="flex flex-wrap gap-2">
              {sessionData.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )
      case 'related':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-white mb-3">📚 Related Problems</h3>
            {sessionData.relatedProblems.map((problem, i) => (
              <div key={i} className="bg-gray-700/30 p-3 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors">
                <p className="text-gray-300">{problem}</p>
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Background effects */}      
      {/* Header */}
      <header className="relative z-10 border-b border-gray-700/50 backdrop-blur-xl bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-black">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">LeetCode</span>
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Crackd</span>
              </h1>
              {currentProblem && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">{currentProblem.title}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    currentProblem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                    currentProblem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {currentProblem.difficulty}
                  </span>
                </div>
              )}
            </div>

            {/* Session Timer & User */}
            <div className="flex items-center gap-4">              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-white font-semibold">{profile.username}</div>
                  <div className="text-xs text-gray-400">{profile.skill_level}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                  <span className="text-white font-bold">
                    {profile.username?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
                className="text-gray-400 hover:text-white transition-colors"
                >
                 Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-6 h-[calc(100vh-100px)] flex gap-6">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto pr-2 mb-4">
            {messages.map(renderMessage)}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-800/60 border border-gray-700/50 backdrop-blur-xl px-6 py-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">AI</span>
                    </div>
                    <span className="text-sm text-gray-400">Thinking...</span>
                  </div>
                  <div className="flex gap-1">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: `${i * 200}ms`}} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="backdrop-blur-xl bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4">
            <div className="flex gap-4 items-end">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your reasoning, ask for a hint, or paste a problem..."
                className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none max-h-32 min-h-[60px] leading-relaxed"
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all duration-300"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 backdrop-blur-xl bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-800/50 p-1 rounded-lg">
            {[
              { id: 'strategy', label: '⚡', title: 'Strategy' },
              { id: 'patterns', label: '🧩', title: 'Patterns' },
              { id: 'tags', label: '🧠', title: 'Tags' },
              { id: 'related', label: '📚', title: 'Related' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSidebarTab(tab.id)}
                className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                  sidebarTab === tab.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title={tab.title}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {getSidebarContent()}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 space-y-2">
            <button className="w-full px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 rounded-lg hover:bg-emerald-600/30 transition-colors">
              💡 Get Hint
            </button>
            <button className="w-full px-4 py-2 bg-yellow-600/20 border border-yellow-500/30 text-yellow-300 rounded-lg hover:bg-yellow-600/30 transition-colors">
              🎯 Mini Exercise
            </button>
            <button className="w-full px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors">
              ✅ Show Solution
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}