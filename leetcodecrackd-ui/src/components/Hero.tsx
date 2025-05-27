'use client'
import { useEffect, useState } from 'react'

export default function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
      
      {/* Floating gradient orbs */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-1/4 w-[32rem] h-[32rem] bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      
      <div className={`relative z-10 text-center max-w-7xl mx-auto px-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Main heading with enhanced gradients */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight mb-8">
          <div className="relative">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-2xl">
              LeetCode
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-gray-100/20 to-gray-300/20 bg-clip-text text-transparent blur-2xl" />
          </div>
          <div className="relative mt-2">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent animate-pulse">
              Crackd
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-emerald-400/30 bg-clip-text text-transparent blur-xl" />
          </div>
        </h1>

        {/* Enhanced subtitle */}
        <p className="text-xl md:text-2xl lg:text-3xl text-gray-200 mb-4 max-w-4xl mx-auto leading-relaxed font-light">
          Stop grinding blindly. Master algorithms with{' '}
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">
            Socratic AI guidance
          </span>
        </p>
        
        <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
          Get personalized hints, pattern recognition, and personalized practice. 
          <br className="hidden md:block" />
        </p>

        {/* Enhanced CTA section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <a
            href="#auth"
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-2xl font-bold text-white text-lg shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 transform border border-blue-500/20 backdrop-blur-xl"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Learning Free
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
          </a>
          
          <button className="group px-8 py-4 border border-gray-600 hover:border-gray-400 rounded-2xl font-semibold text-gray-300 hover:text-white transition-all duration-300 backdrop-blur-xl hover:bg-white/5">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a.5.5 0 01.5.5v1a.5.5 0 01-.5.5H9m4.5-2h.5a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-.5m-2.5 0h1.5m-1.5 0v2.5M12 7v1.5" />
              </svg>
              Watch Demo
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}