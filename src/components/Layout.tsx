import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Building2, 
  Users, 
  CreditCard, 
  BarChart3, 
  UserCog,
  Menu,
  X,
  LogOut,
  DoorOpen,
  Moon,
  Sun,
  Wrench,
  FileText
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import Logo from './Logo'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user, signOut } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Properties', href: '/properties', icon: Building2 },
    { name: 'Units', href: '/units', icon: DoorOpen },
    { name: 'Tenants', href: '/tenants', icon: Users },
    { name: 'Leases', href: '/leases', icon: FileText },
    { name: 'Payments', href: '/payments', icon: CreditCard },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ]

  if (user?.role === 'super_admin') {
    navigation.push({ name: 'Users', href: '/users', icon: UserCog })
  }

  const isCurrentPath = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-300">
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white dark:bg-secondary-800 px-4 py-3 shadow-sm border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center">
            <button
              type="button"
              className="text-secondary-700 hover:text-secondary-900"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Logo size="sm" className="ml-3" />
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-secondary-700 dark:text-secondary-200">{user?.name}</span>
            <button
              onClick={signOut}
              className="text-secondary-500 hover:text-secondary-700"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-secondary-900/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-secondary-800 shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200 dark:border-secondary-700">
              <Logo size="md" />
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-6 px-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg mb-1 ${
                    isCurrentPath(item.href)
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border-r-2 border-primary-600 dark:border-primary-400'
                      : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 shadow-sm">
          <div className="flex items-center px-6 py-6 border-b border-secondary-200 dark:border-secondary-700">
                          <Logo size="lg" />
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  isCurrentPath(item.href)
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border-r-2 border-primary-600 dark:border-primary-400'
                    : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex-shrink-0 border-t border-secondary-200 dark:border-secondary-700 p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">{user?.name}</p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg"
                  title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <button
                  onClick={signOut}
                  className="p-2 text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:pl-64">
        <main className="flex-1">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 