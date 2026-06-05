import { useId } from 'react'

/**
 * Логотип Build&Vibe — восходящий знак (шеврон + две наклонные полосы).
 * variant="color" — градиентный знак для светлых фонов (Onboarding, Dashboard)
 * variant="mono"  — сплошной белый знак для цветных фонов (промо AuthPage)
 */
export default function Logo({ size = 34, variant = 'color', className }) {
  const gid = useId()
  const isColor = variant === 'color'
  const barFill = isColor ? `url(#${gid})` : '#fff'
  const chevronFill = isColor ? '#3ab6ff' : '#fff'

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {isColor && (
        <defs>
          <linearGradient id={gid} x1="8" y1="19" x2="34" y2="39" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9b5fe6" />
            <stop offset="1" stopColor="#2f6af6" />
          </linearGradient>
        </defs>
      )}
      {/* шеврон-стрелка вверх */}
      <path d="M24 6 L33 15 L28.5 15 L24 10.5 L19.5 15 L15 15 Z" fill={chevronFill} />
      {/* верхняя полоса */}
      <path d="M14 19 L32 19 L29 27 L11 27 Z" fill={barFill} />
      {/* нижняя полоса */}
      <path d="M11 30 L34 30 L31 39 L8 39 Z" fill={barFill} />
    </svg>
  )
}
