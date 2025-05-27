'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function OnboardingPage() {
  const [username, setUsername] = useState('')
  const [skillLevel, setSkillLevel] = useState('Beginner')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!username.trim()) return

    setIsLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        username: username.trim(),
        skill_level: skillLevel,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      if (error) throw error

      // Success! Redirect to solve page
      router.push('/solve')
    } catch (error) {
      console.error('Profile creation error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const skillLevels = [
    { 
      value: 'Beginner', 
      label: 'Beginner', 
      description: 'New to coding interviews',
      icon: '🌱'
    },
    { 
      value: 'Intermediate', 
      label: 'Intermediate', 
      description: 'Some leetcode experience',
      icon: '🚀'
    },
    { 
      value: 'Expert', 
      label: 'Expert', 
      description: 'Veteran problem solver',
      icon: '⚡'
    }
  ]

  if (!mounted) return null

  return (
   <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden p-6">        {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
      
      {/* Floating gradient orbs */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-1/4 w-[32rem] h-[32rem] bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />

      <div className="relative z-10 w-full max-w-md">
        {/* Welcome header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600/10 to-blue-600/10 border border-emerald-500/20 backdrop-blur-xl mb-6">
            <div className="relative">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <span className="text-sm font-medium text-emerald-100">Almost There!</span>
          </div>
          
          <h1 className="text-4xl font-black mb-4">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Welcome to
            </span>
            <br />
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-2xl">
              LeetCode Crackd
            </span>
          </h1>
          
          <p className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-2xl">
            Let's personalize your learning experience
          </p>
        </div>

        {/* Onboarding form */}
        <div className={`backdrop-blur-xl bg-gradient-to-b from-white/10 to-white/5 rounded-3xl border border-gray-700/50 p-8 shadow-2xl transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>          {/* Glowing border effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 opacity-0 hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            {/* Name input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What should we call you?
              </label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Enter your name (e.g. Alex)"
                  className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-300" />
              </div>
            </div>

            {/* Skill level selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                What's your coding interview experience?
              </label>
              <div className="space-y-3">
                {skillLevels.map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      skillLevel === level.value
                        ? 'border-blue-500/50 bg-blue-500/10 backdrop-blur-sm'
                        : 'border-gray-600/50 hover:border-gray-500/50 hover:bg-white/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name="skillLevel"
                      value={level.value}
                      checked={skillLevel === level.value}
                      onChange={(e) => setSkillLevel(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center flex-1">
                      <span className="text-2xl mr-4">{level.icon}</span>
                      <div>
                        <div className="font-semibold text-white">{level.label}</div>
                        <div className="text-sm text-gray-400">{level.description}</div>
                      </div>
                    </div>
                    {skillLevel === level.value && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || !username.trim()}
              className="w-full relative group px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-white text-lg shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-blue-500/25 border border-blue-500/20"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up your profile...
                  </>
                ) : (
                  <>
                    Start Your Journey
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}