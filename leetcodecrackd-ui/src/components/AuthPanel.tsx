'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AuthPanel() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEmailLogin = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback',
        },
      })
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('🚀 Magic link sent! Check your email to get started.')
    }
    setIsLoading(false)
  }

  const handleGitHubLogin = async () => {
    setIsLoading(true)
    await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        },
      })
    setIsLoading(false)
  }

  return (
    <section id="auth" className="relative py-32 px-6 bg-gradient-to-b from-gray-800 via-gray-900 to-black overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
      
      {/* Floating gradient orbs */}
      <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600/10 to-blue-600/10 border border-emerald-500/20 backdrop-blur-xl mb-6 group hover:from-emerald-600/20 hover:to-blue-600/20 transition-all duration-300">
            <div className="relative">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <span className="text-sm font-medium text-emerald-100">Ready to Level Up?</span>
          </div>
          
          <h2 className="text-4xl font-black mb-4">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Start Your Journey
            </span>
          </h2>
        </div>

        {/* Auth container */}
        <div className={`relative backdrop-blur-xl bg-gradient-to-b from-white/10 to-white/5 rounded-3xl border border-gray-700/50 p-8 shadow-2xl transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Glowing border effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 opacity-0 hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none" />
          
          <div className="relative z-10">
            {/* Email input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  placeholder="engineer@company.com"
                  className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && email && handleEmailLogin()}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-300" />
              </div>
            </div>

            {/* Magic link button */}
            <button
              onClick={handleEmailLogin}
              disabled={isLoading || !email}
              className="w-full relative group px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-white text-lg shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-blue-500/25 mb-4 border border-blue-500/20"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending Magic Link...
                  </>
                ) : (
                  <>
                    🪄 Send Magic Link
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
            </button>

            {/* Message */}
            {message && (
              <div className={`text-center text-sm mb-4 p-3 rounded-lg backdrop-blur-sm ${
                message.includes('error') || message.includes('Error') 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {message}
              </div>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-900/80 text-gray-400 backdrop-blur-sm rounded-full">or continue with</span>
              </div>
            </div>

            {/* GitHub button */}
            <button
              onClick={handleGitHubLogin}
              disabled={isLoading}
              className="w-full group relative px-6 py-4 bg-gray-800/50 border border-gray-600/50 hover:border-gray-500 rounded-xl font-semibold text-gray-300 hover:text-white transition-all duration-300 hover:bg-gray-700/50 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                Continue with GitHub
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-600/10 to-gray-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}