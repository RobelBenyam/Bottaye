import { useEffect, useState } from 'react'
import { 
  Building2, 
  Users, 
  CreditCard, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Home,
  DollarSign,
  Plus
} from 'lucide-react'
import { formatCurrency, formatNumber } from '../utils/currency'
import { DashboardStats } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load data immediately without artificial delay
    setStats({
      totalProperties: 12,
      totalUnits: 156,
      occupiedUnits: 142,
      vacantUnits: 14,
      totalTenants: 142,
      totalRevenue: 4250000,
      pendingPayments: 15,
      overduePayments: 3,
      maintenanceRequests: 8
    })
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const occupancyRate = stats ? (stats.occupiedUnits / stats.totalUnits) * 100 : 0

  const statCards = [
    {
      title: 'Total Properties',
      value: formatNumber(stats?.totalProperties || 0),
      icon: Building2,
      color: 'primary',
      change: '+2',
      changeType: 'increase'
    },
    {
      title: 'Total Units',
      value: formatNumber(stats?.totalUnits || 0),
      icon: Home,
      color: 'success',
      change: '+8',
      changeType: 'increase'
    },
    {
      title: 'Occupancy Rate',
      value: `${occupancyRate.toFixed(1)}%`,
      icon: Users,
      color: 'warning',
      change: '+5.2%',
      changeType: 'increase'
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'primary',
      change: '+12.5%',
      changeType: 'increase'
    }
  ]

  const alertCards = [
    {
      title: 'Pending Payments',
      value: stats?.pendingPayments || 0,
      icon: CreditCard,
      color: 'warning'
    },
    {
      title: 'Overdue Payments',
      value: stats?.overduePayments || 0,
      icon: AlertTriangle,
      color: 'error'
    },
    {
      title: 'Maintenance Requests',
      value: stats?.maintenanceRequests || 0,
      icon: AlertTriangle,
      color: 'warning'
    },
    {
      title: 'Vacant Units',
      value: stats?.vacantUnits || 0,
      icon: Home,
      color: 'secondary'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">Dashboard</h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">Welcome back! Here's what's happening with your properties.</p>
        </div>
                  <div className="text-right">
            <div className="text-sm text-secondary-500 dark:text-secondary-400">
            Last updated: {new Date().toLocaleString('en-KE', { 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
          <button className="btn-primary mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Quick Action
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.title} className="card-hover">
            <div className="flex items-start">
              <div className={`flex-shrink-0 p-3 rounded-lg bg-${card.color}-100 dark:bg-${card.color}-900/20`}>
                <card.icon className={`h-6 w-6 text-${card.color}-600 dark:text-${card.color}-400`} />
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400 mb-1">{card.title}</p>
                <p className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-1 break-words">{card.value}</p>
                <div className={`flex items-center text-sm ${
                  card.changeType === 'increase' ? 'text-success-600' : 'text-error-600'
                }`}>
                  {card.changeType === 'increase' ? (
                    <TrendingUp className="h-4 w-4 mr-1 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1 flex-shrink-0" />
                  )}
                  <span className="whitespace-nowrap">{card.change}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">Alerts & Actions</h3>
          <div className="grid grid-cols-2 gap-4">
                    {alertCards.map((alert) => (
          <div key={alert.title} className="flex items-center p-4 rounded-lg border border-secondary-200 dark:border-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-700 hover:shadow-md transition-all duration-200 cursor-pointer">
            <div className={`p-3 rounded-xl bg-${alert.color}-100 dark:bg-${alert.color}-900/20 mr-4`}>
              <alert.icon className={`h-6 w-6 text-${alert.color}-600 dark:text-${alert.color}-400`} />
            </div>
            <div>
              <p className="text-lg font-bold text-secondary-900 dark:text-secondary-100">{alert.value}</p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">{alert.title}</p>
            </div>
          </div>
        ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600 dark:text-secondary-400">Occupied Units</span>
                <span className="font-medium text-secondary-900 dark:text-secondary-100">{stats?.occupiedUnits}/{stats?.totalUnits}</span>
              </div>
              <div className="mt-1 bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                <div 
                  className="bg-success-500 h-2 rounded-full" 
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-secondary-200 dark:border-secondary-600">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Total Tenants</span>
                <span className="font-semibold text-secondary-900 dark:text-secondary-100">{formatNumber(stats?.totalTenants || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Monthly Revenue</span>
                <span className="font-semibold text-success-600">{formatCurrency(stats?.totalRevenue || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Collection Rate</span>
                <span className="font-semibold text-primary-600 dark:text-primary-400">94.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'New tenant moved into Unit 2B, Westlands Plaza', time: '2 hours ago', type: 'tenant' },
            { action: 'Payment received from John Doe - Unit 4A', time: '4 hours ago', type: 'payment' },
            { action: 'Maintenance request submitted for Unit 1C', time: '6 hours ago', type: 'maintenance' },
            { action: 'Lease renewed for Unit 3D, Kilimani Heights', time: '1 day ago', type: 'lease' },
          ].map((activity, index) => (
                      <div key={index} className="flex items-center py-3 border-b border-secondary-100 dark:border-secondary-700 last:border-0">
            <div className={`w-2 h-2 rounded-full mr-3 ${
              activity.type === 'payment' ? 'bg-success-500' :
              activity.type === 'maintenance' ? 'bg-warning-500' :
              activity.type === 'tenant' ? 'bg-primary-500' : 'bg-secondary-500'
            }`} />
            <div className="flex-1">
              <p className="text-sm text-secondary-900 dark:text-secondary-100">{activity.action}</p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400">{activity.time}</p>
            </div>
          </div>
          ))}
        </div>
      </div>
    </div>
  )
} 