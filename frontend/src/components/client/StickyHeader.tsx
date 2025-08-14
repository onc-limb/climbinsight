'use client'

import { useState, useEffect } from 'react'
import Header from '../Header'

export default function StickyHeader() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY
      
      if (isMobile) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false)
        } else {
          setIsVisible(true)
        }
      } else {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', controlHeader)
    return () => window.removeEventListener('scroll', controlHeader)
  }, [lastScrollY, isMobile])

  return (
    <div className={`
      ${isMobile ? 'fixed' : 'sticky'} 
      top-0 
      w-full 
      z-50 
      transition-transform 
      duration-300 
      ${isVisible ? 'translate-y-0' : '-translate-y-full'}
    `}>
      <Header />
    </div>
  )
}