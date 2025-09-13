import {
  Building2,
  Users,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Home,
  DollarSign,
  Plus,
} from "lucide-react";
import { useRecentActivities } from "../hooks/useRecentActivities";
import { formatCurrency, formatNumber } from "../utils/currency";
import LoadingSpinner from "../components/LoadingSpinner";
import { useDashboardStats } from "../hooks/useDashboardStats";

export default function DashboardPage() {
  const { stats, loading } = useDashboardStats();
  const { activities, loading: activitiesLoading } = useRecentActivities(10);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const occupancyRate =
    stats.totalUnits > 0 ? (stats.occupiedUnits / stats.totalUnits) * 100 : 0;

  const statCards = [
    {
      title: "Total Properties",
      value: formatNumber(stats.totalProperties),
      icon: Building2,
      color: "primary",
      bg: "bg-primary-100 dark:bg-primary-900/20",
      text: "text-primary-600 dark:text-primary-400",
      change: "+2",
      changeType: "increase",
    },
    {
      title: "Total Units",
      value: formatNumber(stats.totalUnits),
      icon: Home,
      color: "success",
      bg: "bg-success-100 dark:bg-success-900/20",
      text: "text-success-600 dark:text-success-400",
      change: "+8",
      changeType: "increase",
    },
    {
      title: "Occupancy Rate",
      value: `${occupancyRate.toFixed(1)}%`,
      icon: Users,
      color: "warning",
      bg: "bg-warning-100 dark:bg-warning-900/20",
      text: "text-warning-600 dark:text-warning-400",
      change: "+5.2%",
      changeType: "increase",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "primary",
      bg: "bg-primary-100 dark:bg-primary-900/20",
      text: "text-primary-600 dark:text-primary-400",
      change: "+12.5%",
      changeType: "increase",
    },
  ];

  const alertCards = [
    {
      title: "Pending Payments",
      value: stats.pendingPayments,
      icon: CreditCard,
      color: "warning",
    },
    {
      title: "Overdue Payments",
      value: stats.overduePayments,
      icon: AlertTriangle,
      color: "error",
    },
    {
      title: "Active Maintenance",
      value: stats.maintenanceRequests,
      icon: AlertTriangle,
      color: "warning",
    },
    {
      title: "Vacant Units",
      value: stats.vacantUnits,
      icon: Home,
      color: "secondary",
    },
  ];

  const alertColorClasses: { [key: string]: { bg: string; text: string } } = {
    warning: {
      bg: "bg-warning-100 dark:bg-warning-900/20",
      text: "text-warning-600 dark:text-warning-400",
    },
    error: {
      bg: "bg-error-100 dark:bg-error-900/20",
      text: "text-error-600 dark:text-error-400",
    },
    secondary: {
      bg: "bg-secondary-100 dark:bg-secondary-900/20",
      text: "text-secondary-600 dark:text-secondary-400",
    },
  };

  const activityTypeClasses: { [key: string]: string } = {
    payment: "bg-success-500",
    maintenance: "bg-warning-500",
    tenant: "bg-primary-500",
    lease: "bg-secondary-500",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
            Dashboard
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Welcome back! Here's what's happening with your properties.
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-secondary-500 dark:text-secondary-400">
            Last updated:{" "}
            {new Date().toLocaleString("en-KE", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <button className="btn-primary mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Quick Action
          </button>
        </div>
      </div>

      {/* Stat Cards Section */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.title} className="card-hover">
            <div className="flex items-start">
              <div className={`flex-shrink-0 p-3 rounded-lg ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.text}`} />
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400 mb-1">
                  {card.title}
                </p>
                <p className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-1 break-words">
                  {card.value}
                </p>
                <div
                  className={`flex items-center text-sm ${
                    card.changeType === "increase"
                      ? "text-success-600"
                      : "text-error-600"
                  }`}
                >
                  {card.changeType === "increase" ? (
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

      {/* Alerts & Quick Stats Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Alerts & Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {alertCards.map((alert) => {
              const colorClass =
                alertColorClasses[alert.color] || alertColorClasses.secondary;
              return (
                <div
                  key={alert.title}
                  className="flex items-center p-4 rounded-lg border border-secondary-200 dark:border-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-700 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className={`p-3 rounded-xl ${colorClass.bg} mr-4`}>
                    <alert.icon className={`h-6 w-6 ${colorClass.text}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-secondary-900 dark:text-secondary-100">
                      {alert.value}
                    </p>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      {alert.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Quick Stats
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600 dark:text-secondary-400">
                  Occupied Units
                </span>
                <span className="font-medium text-secondary-900 dark:text-secondary-100">
                  {stats.occupiedUnits}/{stats.totalUnits}
                </span>
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
                <span className="text-sm text-secondary-600 dark:text-secondary-400">
                  Total Tenants
                </span>
                <span className="font-semibold text-secondary-900 dark:text-secondary-100">
                  {formatNumber(stats.totalTenants)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">
                  Monthly Revenue
                </span>
                <span className="font-semibold text-success-600">
                  {formatCurrency(stats.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">
                  Collection Rate
                </span>
                <span className="font-semibold text-primary-600 dark:text-primary-400">
                  94.2%
                </span>{" "}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {activitiesLoading ? (
            <LoadingSpinner size="sm" />
          ) : activities.length === 0 ? (
            <p className="text-secondary-500 dark:text-secondary-400">
              No recent activity.
            </p>
          ) : (
            activities.map((activity, index) => {
              const activityClass =
                activityTypeClasses[activity.type] || "bg-secondary-500";
              return (
                <div
                  key={index}
                  className="flex items-center py-3 border-b border-secondary-100 dark:border-secondary-700 last:border-0"
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-3 ${activityClass}`}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-secondary-900 dark:text-secondary-100">
                      {activity.action}
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">
                      {new Date(activity.time).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
