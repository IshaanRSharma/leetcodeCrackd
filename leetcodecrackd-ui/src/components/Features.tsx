
'use client'
import { useState, useEffect } from 'react'

const features = [
  {
    icon: "🧠",
    title: "Socratic AI Guidance",
    description: "Get hints and questions that guide you to the solution, not just the answer",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: "📊",
    title: "Skill-Tagged Tracking",
    description: "Monitor your progress across data structures, algorithms, and problem patterns",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: "💡",
    title: "Contextual Insights",
    description: "Real solutions and discussions from Reddit, Blind 75, and GitHub contributors",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: "⚡",
    title: "Mini Skill Drills",
    description: "Targeted practice sessions to reinforce weak areas and build muscle memory",
    gradient: "from-indigo-500 to-purple-500"
  }
]

export default function Features() {
  const [mounted, setMounted] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-black via-gray-900 to-gray-800 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />
      
      {/* Floating gradient orbs */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-1/4 w-[32rem] h-[32rem] bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 backdrop-blur-xl mb-6">
            <span className="text-sm text-blue-400 font-medium">Everything You Need</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Built for Engineers,
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              By Engineers
            </span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Every feature designed to accelerate your journey from grinding to mastering algorithmic problem solving
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative p-8 rounded-2xl border border-gray-700/50 backdrop-blur-xl bg-gradient-to-b from-white/5 to-white/2 transition-all duration-500 hover:border-gray-600 hover:scale-105 transform cursor-pointer ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ 
                transitionDelay: `${index * 100}ms`,
                animationDelay: `${index * 100}ms` 
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`} />
              
              {/* Glowing border effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 pointer-events-none`} />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className={`text-4xl mb-4 transform transition-transform duration-300 ${hoveredIndex === index ? 'scale-110' : ''}`}>
                  {feature.icon}
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}