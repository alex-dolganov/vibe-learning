import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from './lib/supabase'
import AuthPage from './components/AuthPage'
import Onboarding from './components/Onboarding'
import CourseLayout from './components/CourseLayout'
import Background from './components/Background'
import './App.css'

export default function App() {
  const [session, setSession] = useState(null)
  const [userData, setUserData] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        const saved = localStorage.getItem(`vibecoder_user_${session.user.id}`)
        if (saved) setUserData(JSON.parse(saved))
      }
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        const saved = localStorage.getItem(`vibecoder_user_${session.user.id}`)
        if (saved) setUserData(JSON.parse(saved))
      } else {
        setUserData(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleOnboardingComplete = (data) => {
    localStorage.setItem(`vibecoder_user_${session.user.id}`, JSON.stringify(data))
    setUserData(data)
  }

  const handleReset = () => {
    localStorage.removeItem(`vibecoder_user_${session.user.id}`)
    localStorage.removeItem(`vibecoder_progress_${session.user.id}`)
    setUserData(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUserData(null)
  }

  // Pre-fill name from OAuth provider (GitHub / Google)
  const initialName = session?.user?.user_metadata?.full_name
    || session?.user?.user_metadata?.name
    || session?.user?.user_metadata?.user_name
    || ''

  const userId = session?.user?.id ?? null

  return (
    <>
      <Background />
      <AnimatePresence mode="wait">
        {authLoading && (
          <motion.div
            key="loading"
            className="loadingScreen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loadingSpinner" />
          </motion.div>
        )}

        {!authLoading && !session && (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <AuthPage />
          </motion.div>
        )}

        {!authLoading && session && !userData && (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <Onboarding onComplete={handleOnboardingComplete} initialName={initialName} />
          </motion.div>
        )}

        {!authLoading && session && userData && (
          <motion.div key="course" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ height: '100vh' }}>
            <CourseLayout
              user={userData}
              userId={userId}
              onReset={handleReset}
              onLogout={handleLogout}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
