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

  return (
    <>
      <video
        className="bgVideo"
        autoPlay
        muted
        loop
        playsInline
        src={`${import.meta.env.BASE_URL}bg.mp4`}
      />
      <div className="bgOverlay" />
      {!user
        ? <Onboarding onComplete={handleOnboardingComplete} />
        : <CourseLayout user={user} onReset={handleReset} />
      }
    </>
  )
}
