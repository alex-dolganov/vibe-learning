import { useState, useEffect } from 'react'
import Onboarding from './components/Onboarding'
import CourseLayout from './components/CourseLayout'
import './App.css'

export default function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('vibecoder_user')
    if (saved) setUser(JSON.parse(saved))
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

  if (!user) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return <CourseLayout user={user} onReset={handleReset} />
}
