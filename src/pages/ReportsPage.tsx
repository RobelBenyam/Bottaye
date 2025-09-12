import { useState } from 'react'
import { Download, Calendar, TrendingUp, BarChart3, PieChart, FileText } from 'lucide-react'
import { formatCurrency } from '../utils/currency'

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('this_month')

  const mockReportData = {
    revenue: {
      thisMonth: 3850000,
      lastMonth: 3600000,
      growth: 6.9
    },
    collections: {
      collected: 3650000,
      pending: 200000,
      overdue: 150000,
      rate: 94.8
    },
    occupancy: {
      occupied: 142,
      vacant: 14,
      maintenance: 8,
      rate: 91.0
    },
    properties: [
      {
        name: 'Westlands Plaza',
        revenue: 1200000,
        occupancy: 95,
        units: 24
      },
      {
        name: 'Kilimani Heights',
        revenue: 1800000,
        occupancy: 89,
        units: 48
      },
      {
        name: 'Karen Residences',
        revenue: 850000,
        occupancy: 92,
        units: 36
      }
    ]
  }

  const reportTypes = [
    {
      id: 'revenue',
      title: 'Revenue Report',
      description: 'Monthly revenue breakdown by property',
      icon: TrendingUp,
      color: 'primary'
    },
    {
      id: 'collections',
      title: 'Collections Report',
      description: 'Payment status and collection rates',
      icon: BarChart3,
      color: 'success'
    },
    {
      id: 'occupancy',
      title: 'Occupancy Report',
      description: 'Unit occupancy and vacancy analysis',
      icon: PieChart,
      color: 'warning'
    },
    {
      id: 'tenants',
      title: 'Tenant Report',
      description: 'Tenant information and lease details',
      icon: FileText,
      color: 'secondary'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">Reports</h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">Analyze performance and generate insights for your properties.</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="input-field"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="this_year">This Year</option>
          </select>
          <button className="btn-secondary flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Schedule
          </button>
          <button className="btn-primary flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">Revenue Overview</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">This Month</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                {formatCurrency(mockReportData.revenue.thisMonth)}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-success-600 mr-1" />
                <span className="text-sm text-success-600">
                  +{mockReportData.revenue.growth}% from last month
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-secondary-200 dark:border-secondary-600">
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Last Month</p>
              <p className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                {formatCurrency(mockReportData.revenue.lastMonth)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">Collections</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Collected</span>
                <span className="font-semibold text-success-600">
                  {formatCurrency(mockReportData.collections.collected)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Pending</span>
                <span className="font-semibold text-warning-600">
                  {formatCurrency(mockReportData.collections.pending)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Overdue</span>
                <span className="font-semibold text-error-600">
                  {formatCurrency(mockReportData.collections.overdue)}
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-secondary-200 dark:border-secondary-600">
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Collection Rate</p>
              <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                {mockReportData.collections.rate}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">Occupancy</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Occupied</span>
                <span className="font-semibold text-success-600">
                  {mockReportData.occupancy.occupied} units
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Vacant</span>
                <span className="font-semibold text-secondary-600 dark:text-secondary-400">
                  {mockReportData.occupancy.vacant} units
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Maintenance</span>
                <span className="font-semibold text-warning-600">
                  {mockReportData.occupancy.maintenance} units
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-secondary-200 dark:border-secondary-600">
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Occupancy Rate</p>
              <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                {mockReportData.occupancy.rate}%
              </p>
            </div>
          </div>
        </div>
      </div>

              <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">Property Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-secondary-200 dark:border-secondary-600">
                <th className="text-left py-3 px-4 font-medium text-secondary-900 dark:text-secondary-100">Property</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-900 dark:text-secondary-100">Revenue</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-900 dark:text-secondary-100">Occupancy</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-900 dark:text-secondary-100">Units</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-900 dark:text-secondary-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockReportData.properties.map((property, index) => (
                <tr key={index} className="border-b border-secondary-100 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700">
                  <td className="py-3 px-4 font-medium text-secondary-900 dark:text-secondary-100">{property.name}</td>
                  <td className="py-3 px-4 text-secondary-900 dark:text-secondary-100">{formatCurrency(property.revenue)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="text-secondary-900 dark:text-secondary-100 mr-2">{property.occupancy}%</span>
                      <div className="w-16 bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${property.occupancy}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-secondary-900 dark:text-secondary-100">{property.units}</td>
                  <td className="py-3 px-4">
                    <button className="btn-secondary px-3 py-1 text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((report) => (
          <div key={report.id} className="card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${report.color}-100 dark:bg-${report.color}-900/20`}>
                <report.icon className={`h-6 w-6 text-${report.color}-600 dark:text-${report.color}-400`} />
              </div>
              <button className="btn-secondary px-3 py-1 text-sm">
                <Download className="h-4 w-4 mr-1 inline" />
                Export
              </button>
            </div>
            <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">{report.title}</h4>
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">{report.description}</p>
            <button className="btn-primary w-full">Generate Report</button>
          </div>
        ))}
      </div>
    </div>
  )
} 