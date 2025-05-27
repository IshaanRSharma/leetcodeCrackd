import Hero from '@/components/Hero'
import Features from '@/components/Features'
import AuthPanel from '@/components/AuthPanel'

export default function HomePage() {
  return (
    <main className="bg-black text-white font-sans">
      <Hero />
      <Features />
      <AuthPanel />
    </main>
  )
}
