import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Onboarding from './components/Onboarding'
import CourseLayout from './components/CourseLayout'
import Background from './components/Background'
import './App.css'

export default function App() {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('vibecoder_user')
    if (saved) setUser(JSON.parse(saved))
    setReady(true)
  }, [])

  const handleOnboardingComplete = (userData) => {
    localStorage.setItem('vibecoder_user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleReset = () => {
    localStorage.removeItem('vibecoder_user')
    localStorage.removeItem('vibecoder_progress')
    setUser(null)
  }

  return (
    <>
      <Background />
      <AnimatePresence mode="wait">
        {ready && !user && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Onboarding onComplete={handleOnboardingComplete} />
          </motion.div>
        )}
        {ready && user && (
          <motion.div
            key="course"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ height: '100vh' }}
          >
            <CourseLayout user={user} onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
