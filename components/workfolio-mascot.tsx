'use client'

import React, { useEffect, useRef, useState } from 'react'
import { MascotVariant, useWorkfolio } from '@/lib/workfolio-store'

interface WorkfolioMascotProps {
  variant?: MascotVariant
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  className?: string
  showGenderToggle?: boolean
  onVariantChange?: (newVariant: MascotVariant) => void
}

export function WorkfolioMascot({
  variant,
  size = 'lg',
  interactive = true,
  className = '',
  showGenderToggle = false,
  onVariantChange
}: WorkfolioMascotProps) {
  const store = useWorkfolio()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeVariant: MascotVariant = variant || store.userProfile?.mascot_variant || 'male'

  // Interactive 3D physics state
  const mousePos = useRef({ x: 0, y: 0 })
  const rot = useRef({ x: 0, y: 0, z: 0 })
  const targetRot = useRef({ x: 0, y: 0, z: 0 })
  const posOffset = useRef({ x: 0, y: 0 })
  const targetPosOffset = useRef({ x: 0, y: 0 })
  
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  // Dimensions
  const dimensions = {
    sm: { width: 220, height: 240, scale: 1.0 },
    md: { width: 340, height: 360, scale: 1.55 },
    lg: { width: 420, height: 440, scale: 1.95 }
  }[size]

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Box-Bound Mouse / Touch Tracking Handlers
  const handleBoxMouseMove = (clientX: number, clientY: number) => {
    if (!interactive || isReducedMotion || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const nx = (clientX - centerX) / (rect.width / 2)
    const ny = (clientY - centerY) / (rect.height / 2)

    const clampedNx = Math.max(-1.1, Math.min(1.1, nx))
    const clampedNy = Math.max(-1.1, Math.min(1.1, ny))

    mousePos.current = { x: clampedNx, y: clampedNy }

    targetRot.current = {
      y: clampedNx * (90 * (Math.PI / 180)),
      x: clampedNy * (35 * (Math.PI / 180)),
      z: clampedNx * (10 * (Math.PI / 180))
    }

    targetPosOffset.current = {
      x: clampedNx * 14,
      y: clampedNy * 10
    }
  }

  const handleBoxMouseLeave = () => {
    targetRot.current = { x: 0, y: 0, z: 0 }
    targetPosOffset.current = { x: 0, y: 0 }
    mousePos.current = { x: 0, y: 0 }
  }

  // Main 3D Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let startTime = Date.now()

    const render = () => {
      const elapsed = Date.now() - startTime

      // 3D Physics Lerp
      rot.current.x += (targetRot.current.x - rot.current.x) * 0.1
      rot.current.y += (targetRot.current.y - rot.current.y) * 0.1
      rot.current.z += (targetRot.current.z - rot.current.z) * 0.1

      posOffset.current.x += (targetPosOffset.current.x - posOffset.current.x) * 0.08
      posOffset.current.y += (targetPosOffset.current.y - posOffset.current.y) * 0.08

      const idleY = isReducedMotion ? 0 : Math.sin(elapsed * 0.0025) * 6
      const idleScale = isReducedMotion ? 1 : 1 + Math.sin(elapsed * 0.002) * 0.012

      ctx.clearRect(0, 0, dimensions.width, dimensions.height)

      const cx = dimensions.width / 2 + posOffset.current.x
      const cy = dimensions.height / 2 + posOffset.current.y + idleY - 15

      ctx.save()

      // --- 0. AMBIENT BACKDROP SPOTLIGHT GLOW ---
      ctx.save()
      const bgGlow = ctx.createRadialGradient(
        dimensions.width / 2,
        dimensions.height / 2 - 20,
        10,
        dimensions.width / 2,
        dimensions.height / 2 - 20,
        180
      )
      bgGlow.addColorStop(0, 'rgba(193, 160, 91, 0.28)')
      bgGlow.addColorStop(0.45, 'rgba(30, 68, 52, 0.35)')
      bgGlow.addColorStop(1, 'rgba(12, 22, 18, 0)')
      ctx.fillStyle = bgGlow
      ctx.fillRect(0, 0, dimensions.width, dimensions.height)
      ctx.restore()

      // --- 3D POPPED-UP FLOOR SHADOW ---
      ctx.save()
      ctx.translate(dimensions.width / 2 + posOffset.current.x * 0.4, dimensions.height - 35)
      ctx.scale(1 - idleY * 0.02, 0.3)
      const shadowGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, 85 * dimensions.scale)
      shadowGrad.addColorStop(0, 'rgba(12, 22, 18, 0.75)')
      shadowGrad.addColorStop(0.5, 'rgba(193, 160, 91, 0.3)')
      shadowGrad.addColorStop(1, 'rgba(12, 22, 18, 0)')
      ctx.fillStyle = shadowGrad
      ctx.beginPath()
      ctx.arc(0, 0, 85 * dimensions.scale, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Set main center transform
      ctx.translate(cx, cy)
      ctx.scale(dimensions.scale * idleScale, dimensions.scale * idleScale)
      ctx.rotate(rot.current.z)

      const rotY = rot.current.y
      const rotX = rot.current.x
      const cosY = Math.cos(rotY)
      const sinY = Math.sin(rotY)

      const headShiftX = sinY * 45
      const headShiftY = Math.sin(rotX) * 20
      const eyeShiftX = sinY * 30
      const eyeShiftY = Math.sin(rotX) * 14

      // --- 1. POPPED-UP 3D TORSO / SHIRT (WARM IVORY / OFF-WHITE WITH GOLD RIM & BLACK V-NECK) ---
      ctx.save()
      
      // Body Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.beginPath()
      ctx.ellipse(0, 48, 48, 24, 0, 0, Math.PI * 2)
      ctx.fill()

      // Shirt Gradient (Warm Off-White / Ivory)
      const bodyGrad = ctx.createLinearGradient(-48, -10, 48, 70)
      bodyGrad.addColorStop(0, '#ffffff')
      bodyGrad.addColorStop(0.5, '#fefcf8')
      bodyGrad.addColorStop(1, '#e8dfd0')

      ctx.fillStyle = bodyGrad
      ctx.strokeStyle = '#c1a05b' // Polished Gold Rim Outline
      ctx.lineWidth = 3.5

      // Body 3D Shape
      ctx.beginPath()
      ctx.moveTo(-48, 70)
      ctx.bezierCurveTo(-54, 22, -38, 12, -22, 6)
      ctx.lineTo(22, 6)
      ctx.bezierCurveTo(38, 12, 54, 22, 48, 70)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Inner Black V-Neck Collar
      ctx.fillStyle = '#121212'
      ctx.beginPath()
      ctx.moveTo(-18, 6)
      ctx.lineTo(0, 36)
      ctx.lineTo(18, 6)
      ctx.closePath()
      ctx.fill()

      // Gold Buttons
      ctx.fillStyle = '#c1a05b'
      ctx.beginPath()
      ctx.arc(0, 46, 3.5, 0, Math.PI * 2)
      ctx.arc(0, 59, 3.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#08090f'
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.restore()

      // --- 2. NECK ---
      ctx.fillStyle = '#ebd7be'
      ctx.fillRect(-11, -6 + headShiftY * 0.3, 22, 16)

      // --- 3. 3D POPPED-UP HEAD MESH ---
      ctx.save()
      ctx.translate(headShiftX, headShiftY - 38)

      // Radiant Skin Gradient
      const headGrad = ctx.createRadialGradient(-10 * cosY, -15, 5, 0, 0, 42)
      headGrad.addColorStop(0, '#ffffff')
      headGrad.addColorStop(0.35, '#fff7ea')
      headGrad.addColorStop(0.82, '#f0d9bb')
      headGrad.addColorStop(1, '#d8be9d')

      ctx.fillStyle = headGrad
      ctx.strokeStyle = '#0c0d14'
      ctx.lineWidth = 2.8

      // Head Shape
      ctx.beginPath()
      if (activeVariant === 'male') {
        ctx.moveTo(-33, -32)
        ctx.bezierCurveTo(-40, 0, -32, 34, 0, 38)
        ctx.bezierCurveTo(32, 34, 40, 0, 33, -32)
        ctx.bezierCurveTo(28, -54, -28, -54, -33, -32)
      } else {
        ctx.moveTo(-31, -30)
        ctx.bezierCurveTo(-38, 5, -28, 36, 0, 38)
        ctx.bezierCurveTo(28, 36, 38, 5, 31, -30)
        ctx.bezierCurveTo(27, -52, -27, -52, -31, -30)
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // 3D Ear Projection
      if (Math.abs(sinY) > 0.2) {
        ctx.save()
        const earSide = sinY > 0 ? -1 : 1
        ctx.translate(earSide * 34 * cosY, 2)
        ctx.fillStyle = '#e8dec9'
        ctx.strokeStyle = '#08090f'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(0, 0, 7, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      }

      // Cheek Highlights
      ctx.fillStyle = 'rgba(193, 160, 91, 0.18)'
      ctx.beginPath()
      ctx.arc(-18 * cosY + eyeShiftX * 0.2, 10 + eyeShiftY * 0.2, 8, 0, Math.PI * 2)
      ctx.arc(18 * cosY + eyeShiftX * 0.2, 10 + eyeShiftY * 0.2, 8, 0, Math.PI * 2)
      ctx.fill()

      // --- 4. 180° PERSPECTIVE EYES & BROWS ---
      ctx.save()
      ctx.translate(eyeShiftX, eyeShiftY)

      const leftEyeScale = Math.max(0.1, 1 + sinY * 0.5)
      const rightEyeScale = Math.max(0.1, 1 - sinY * 0.5)

      // Eyebrows
      ctx.strokeStyle = '#08090f'
      ctx.lineWidth = activeVariant === 'male' ? 3.5 : 2.5
      ctx.beginPath()
      if (leftEyeScale > 0.25) {
        ctx.moveTo(-22 * cosY, -13)
        ctx.lineTo(-7 * cosY, -11)
      }
      if (rightEyeScale > 0.25) {
        ctx.moveTo(7 * cosY, -11)
        ctx.lineTo(22 * cosY, -13)
      }
      ctx.stroke()

      // Left Eye
      if (leftEyeScale > 0.2) {
        ctx.save()
        ctx.translate(-14 * cosY, -1)
        ctx.scale(leftEyeScale, 1)
        ctx.fillStyle = '#08090f'
        ctx.beginPath()
        ctx.arc(0, 0, 5.5, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(-1.8, -2.2, 2.0, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#d4af37'
        ctx.beginPath()
        ctx.arc(1.5, 1.8, 1.0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Right Eye
      if (rightEyeScale > 0.2) {
        ctx.save()
        ctx.translate(14 * cosY, -1)
        ctx.scale(rightEyeScale, 1)
        ctx.fillStyle = '#08090f'
        ctx.beginPath()
        ctx.arc(0, 0, 5.5, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(-1.8, -2.2, 2.0, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#d4af37'
        ctx.beginPath()
        ctx.arc(1.5, 1.8, 1.0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Friendly Smile
      ctx.strokeStyle = '#08090f'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.arc(0, 11, 9 * Math.max(0.4, cosY), 0.15 * Math.PI, 0.85 * Math.PI)
      ctx.stroke()

      // --- 5. GOLD GLASSES WITH PERSPECTIVE ---
      ctx.strokeStyle = '#c1a05b'
      ctx.lineWidth = 3
      ctx.fillStyle = 'rgba(243, 238, 228, 0.25)'

      // Left Glass Frame
      if (leftEyeScale > 0.25) {
        ctx.save()
        ctx.translate(-14 * cosY, -1)
        ctx.scale(leftEyeScale, 1)
        ctx.beginPath()
        ctx.arc(0, 0, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      }

      // Right Glass Frame
      if (rightEyeScale > 0.25) {
        ctx.save()
        ctx.translate(14 * cosY, -1)
        ctx.scale(rightEyeScale, 1)
        ctx.beginPath()
        ctx.arc(0, 0, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      }

      // Glasses Bridge
      ctx.beginPath()
      ctx.moveTo(-3 * cosY, -3)
      ctx.lineTo(3 * cosY, -3)
      ctx.stroke()

      ctx.restore() // End eyes translate

      // --- 6. HAIRSTYLE (MALE VS FEMALE) ---
      ctx.fillStyle = '#2b1b17'
      ctx.strokeStyle = '#08090f'
      ctx.lineWidth = 2

      if (activeVariant === 'female') {
        // FEMALE: Sleek Bob Haircut
        ctx.beginPath()
        ctx.moveTo(-38 * cosY, 18)
        ctx.bezierCurveTo(-46 * cosY, -32, -28 * cosY, -62, 0, -62)
        ctx.bezierCurveTo(28 * cosY, -62, 46 * cosY, -32, 38 * cosY, 18)
        ctx.bezierCurveTo(34 * cosY, -12, 26 * cosY, -44, 0, -46)
        ctx.bezierCurveTo(-26 * cosY, -44, -34 * cosY, -12, -38 * cosY, 18)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // Gold Hairpin Accent
        ctx.strokeStyle = '#c1a05b'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(20 * cosY, -35)
        ctx.lineTo(35 * cosY, -28)
        ctx.stroke()
      } else {
        // MALE: Short Crop Cut
        ctx.beginPath()
        ctx.moveTo(-36 * cosY, -22)
        ctx.bezierCurveTo(-42 * cosY, -52, -12 * cosY, -60, 0, -60)
        ctx.bezierCurveTo(22 * cosY, -60, 42 * cosY, -50, 36 * cosY, -22)
        ctx.bezierCurveTo(38 * cosY, -30, 26 * cosY, -42, 6 * cosY, -38)
        ctx.bezierCurveTo(-16 * cosY, -40, -30 * cosY, -28, -36 * cosY, -22)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // Hair Strand Highlight
        ctx.strokeStyle = '#c1a05b'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(-16 * cosY, -50)
        ctx.quadraticCurveTo(0, -52, 14 * cosY, -44)
        ctx.stroke()
      }

      ctx.restore() // End head translate
      ctx.restore() // End canvas center

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => cancelAnimationFrame(animationFrameId)
  }, [activeVariant, size, isReducedMotion, dimensions])

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => handleBoxMouseMove(e.clientX, e.clientY)}
      onMouseEnter={(e) => handleBoxMouseMove(e.clientX, e.clientY)}
      onMouseLeave={handleBoxMouseLeave}
      onTouchMove={(e) => {
        if (e.touches[0]) {
          handleBoxMouseMove(e.touches[0].clientX, e.touches[0].clientY)
        }
      }}
      onTouchEnd={handleBoxMouseLeave}
      className={`relative flex flex-col items-center justify-center select-none group/mascot ${className}`}
    >
      {/* 3D WebGL / Canvas Viewport */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="block cursor-pointer transition-all duration-300 group-hover/mascot:scale-105 drop-shadow-2xl"
      />

      {/* Optional Gender Switcher Pill */}
      {showGenderToggle && onVariantChange && (
        <div className="mt-2 flex items-center gap-1 rounded-full border border-[#c1a05b]/40 bg-[#08090f]/90 p-1 backdrop-blur-sm shadow-md">
          <button
            type="button"
            onClick={() => onVariantChange('male')}
            className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer ${
              activeVariant === 'male'
                ? 'bg-[#c1a05b] text-[#08090f]'
                : 'text-[#f3eee4]/70 hover:text-[#f3eee4]'
            }`}
          >
            ♂ Male
          </button>
          <button
            type="button"
            onClick={() => onVariantChange('female')}
            className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer ${
              activeVariant === 'female'
                ? 'bg-[#c1a05b] text-[#08090f]'
                : 'text-[#f3eee4]/70 hover:text-[#f3eee4]'
            }`}
          >
            ♀ Female
          </button>
        </div>
      )}
    </div>
  )
}
