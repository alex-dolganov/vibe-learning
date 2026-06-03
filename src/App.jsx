import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from './lib/supabase'
import AuthPage from './components/AuthPage'
import Onboarding from './components/Onboarding'
import CourseLayout from './components/CourseLayout'
import Background from './components/Background'
import './App.css'

export default function App() {
  // undefined = still checking, null = not logged in, object = logged in
  const [session, setSession] = useState(undefined)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session ?? null)
        if (session) {
          const saved = localStorage.getItem(`vibecoder_user_${session.user.id}`)
          if (saved) setUserData(JSON.parse(saved))
        }
      })
      .catch(() => setSession(null))

    // Listen for auth changes (fires on login/logout/OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null)
      if (session) {
        const saved = localStorage.getItem(`vibecoder_user_${session.user.id}`)
        setUserData(saved ? JSON.parse(saved) : null)
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

  const initialName = session?.user?.user_metadata?.full_name
    || session?.user?.user_metadata?.name
    || session?.user?.user_metadata?.user_name
    || ''

  const userId = session?.user?.id ?? null

  // session=undefined means still loading — show AuthPage anyway (best UX)
  const showAuth = !session
  const showOnboarding = session && !userData
  const showCourse = session && userData

  return (
    <>
      <Background />
      <AnimatePresence mode="wait">
        {showAuth && (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <AuthPage />
          </motion.div>
        )}

        {showOnboarding && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Onboarding onComplete={handleOnboardingComplete} initialName={initialName} />
          </motion.div>
        )}

        {showCourse && (
          <motion.div
            key="course"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ height: '100vh' }}
          >
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
