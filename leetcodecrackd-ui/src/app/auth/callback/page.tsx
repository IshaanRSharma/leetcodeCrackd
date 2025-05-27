'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState('Authenticating...')

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth error:', error)
          setStatus('Authentication failed. Redirecting...')
          setTimeout(() => router.push('/'), 2000)
          return
        }

        const session = data.session
        if (!session) {
          setStatus('No session found. Redirecting...')
          setTimeout(() => router.push('/'), 2000)
          return
        }

        setStatus('Checking your profile...')

        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile check error:', profileError)
        }

        if (!profile || !profile.username) {
          setStatus('Setting up your profile...')
          setTimeout(() => router.push('/auth/onboarding'), 1000)
        } else {
          setStatus('Welcome back! Redirecting...')
          setTimeout(() => router.push('/solve'), 1000)
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setStatus('Something went wrong. Redirecting...')
        setTimeout(() => router.push('/'), 2000)
      }
    }

    handleRedirect()
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden p-6">        {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />
      
      {/* Floating gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 text-center">
        {/* Loading container */}
        <div className="backdrop-blur-xl bg-gradient-to-b from-white/10 to-white/5 rounded-3xl border border-gray-700/50 p-12 shadow-2xl max-w-md mx-auto">
          {/* Spinner */}
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-gray-600 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          
          {/* Status text */}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            {status}
          </h2>
          
          <p className="text-gray-400">
            Please wait while we set things up for you...
          </p>
          
          {/* Animated dots */}
          <div className="flex justify-center gap-1 mt-6">
            {[1,2,3].map(i => (
              <div 
                key={i} 
                className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" 
                style={{animationDelay: `${i * 200}ms`}}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}