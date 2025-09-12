import React from 'react'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-10 w-10'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Custom Building Icon with Modern Design */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="w-full h-full"
        >
          {/* Main Building */}
          <rect
            x="4"
            y="8"
            width="10"
            height="20"
            rx="1"
            className="fill-primary-600 dark:fill-primary-500"
          />
          
          {/* Secondary Building */}
          <rect
            x="14"
            y="12"
            width="8"
            height="16"
            rx="1"
            className="fill-primary-500 dark:fill-primary-400"
          />
          
          {/* Tower */}
          <rect
            x="22"
            y="4"
            width="6"
            height="24"
            rx="1"
            className="fill-primary-700 dark:fill-primary-600"
          />
          
          {/* Windows - Building 1 */}
          <rect x="6" y="12" width="2" height="2" rx="0.5" className="fill-white dark:fill-secondary-100" />
          <rect x="10" y="12" width="2" height="2" rx="0.5" className="fill-white dark:fill-secondary-100" />
          <rect x="6" y="16" width="2" height="2" rx="0.5" className="fill-white dark:fill-secondary-100" />
          <rect x="10" y="16" width="2" height="2" rx="0.5" className="fill-white dark:fill-secondary-100" />
          <rect x="6" y="20" width="2" height="2" rx="0.5" className="fill-white dark:fill-secondary-100" />
          <rect x="10" y="20" width="2" height="2" rx="0.5" className="fill-white dark:fill-secondary-100" />
          
          {/* Windows - Building 2 */}
          <rect x="16" y="16" width="1.5" height="1.5" rx="0.3" className="fill-white dark:fill-secondary-100" />
          <rect x="19" y="16" width="1.5" height="1.5" rx="0.3" className="fill-white dark:fill-secondary-100" />
          <rect x="16" y="20" width="1.5" height="1.5" rx="0.3" className="fill-white dark:fill-secondary-100" />
          <rect x="19" y="20" width="1.5" height="1.5" rx="0.3" className="fill-white dark:fill-secondary-100" />
          
          {/* Windows - Tower */}
          <rect x="24" y="8" width="2" height="2" rx="0.5" className="fill-white dark:fill-secondary-100" />
          <rect x="24" y="12" width="2" height="2" rx="0.5" className="fill-white dark:fill-secondary-100" />
          <rect x="24" y="16" width="2" height="2" rx="0.5" className="fill-white dark:fill-secondary-100" />
          <rect x="24" y="20" width="2" height="2" rx="0.5" className="fill-white dark:fill-secondary-100" />
          
          {/* Decorative Elements */}
          <circle cx="25" cy="6" r="1" className="fill-warning-400" />
          
          {/* Base/Ground */}
          <rect x="2" y="28" width="28" height="2" rx="1" className="fill-secondary-300 dark:fill-secondary-600" />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold text-primary-600 dark:text-primary-400 leading-none ${textSizeClasses[size]}`}>
            Bottaye
          </h1>
          {size === 'lg' && (
            <span className="text-xs text-secondary-500 dark:text-secondary-400 font-medium tracking-wider uppercase">
              Property Management
            </span>
          )}
        </div>
      )}
    </div>
  )
} 