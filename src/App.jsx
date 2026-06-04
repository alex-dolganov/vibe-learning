import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from './lib/supabase'
import AuthPage from './components/AuthPage'
import Onboarding from './components/Onboarding'
import Dashboard from './components/Dashboard'
import Reader from './components/Reader'
import Background from './components/Background'
import './App.css'

export default function App() {
  const [session, setSession] = useState(undefined)
  const [userData, setUserData] = useState(null)
  const [readerLesson, setReaderLesson] = useState(null)
  const [readerChapter, setReaderChapter] = useState(null)

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session ?? null)
        if (session) {
          const saved = localStorage.getItem(`vibecoder_user_${session.user.id}`)
          if (saved) setUserData(JSON.parse(saved))
        }
      })
      .catch(() => setSession(null))

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
    setReaderLesson(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUserData(null)
    setReaderLesson(null)
  }

  const handleOpenLesson = (lesson, chapter) => {
    setReaderLesson(lesson)
    setReaderChapter(chapter)
  }

  const initialName = session?.user?.user_metadata?.full_name
    || session?.user?.user_metadata?.name
    || session?.user?.user_metadata?.user_name
    || ''

  const userId = session?.user?.id ?? null

  const showAuth = !session
  const showOnboarding = session && !userData
  const showReader = session && userData && readerLesson
  const showDashboard = session && userData && !readerLesson

  return (
    <>
      <Background />
      <AnimatePresence mode="wait">
        {showAuth && (
          <motion.div key="auth"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}>
            <AuthPage />
          </motion.div>
        )}

        {showOnboarding && (
          <motion.div key="onboarding"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}>
            <Onboarding onComplete={handleOnboardingComplete} initialName={initialName} />
          </motion.div>
        )}

        {showDashboard && (
          <motion.div key="dashboard"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}>
            <Dashboard
              user={userData}
              userId={userId}
              onLogout={handleLogout}
              onReset={handleReset}
              onOpenLesson={handleOpenLesson}
            />
          </motion.div>
        )}

        {showReader && (
          <motion.div key="reader"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
            <Reader
              user={userData}
              userId={userId}
              initialLesson={readerLesson}
              initialChapter={readerChapter}
              onBack={() => setReaderLesson(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
