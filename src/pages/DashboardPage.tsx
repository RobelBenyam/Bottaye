import {
  Building2,
  Users,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Home,
  DollarSign,
  ChevronDown,
  Wrench,
  FileText,
} from "lucide-react";
import { useRecentActivities } from "../hooks/useRecentActivities";
import { formatCurrency, formatNumber } from "../utils/currency";
import LoadingSpinner from "../components/LoadingSpinner";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { Menu } from "@headlessui/react";
import { useState } from "react";
import AddPropertyModal from "../components/modals/AddPropertyModal";
import AddUnitModal from "../components/modals/AddUnitModal";
import AddTenantModal from "../components/modals/AddTenantModal";
import AddMaintenanceRequestModal from "../components/modals/AddMaintenanceRequest";
import AddLeaseModal from "../components/modals/AddLeaseModal";
import { useLeases } from "@/hooks/leasesHook";
import { useTenantsForUser } from "@/hooks/tenantsHook";
import { useUnitsForUser } from "@/hooks/unitsHook";
import { useProperties } from "@/hooks/propertiesHook";

export default function DashboardPage() {
  const { stats, loading } = useDashboardStats();
  const { activities, loading: activitiesLoading } = useRecentActivities(10);
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false);
  const [isAddMaintenanceModalOpen, setIsAddMaintenanceModalOpen] =
    useState(false);
  const [isAddLeaseModalOpen, setIsAddLeaseModalOpen] = useState(false);

  const { createLease } = useLeases();
  const { tenants } = useTenantsForUser();
  const { units } = useUnitsForUser();
  const { properties } = useProperties();

  const availableUnits = units.filter((unit) => unit.status === "vacant");

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
        <div className="text-right relative">
          <div className="text-sm text-secondary-500 dark:text-secondary-400">
            Last updated:{" "}
            {new Date().toLocaleString("en-KE", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <Menu as="div" className="relative inline-block text-left mt-2">
            <div>
              <Menu.Button className="btn-primary flex items-center">
                Quick Action
                <ChevronDown className="h-4 w-4 ml-2" />
              </Menu.Button>
            </div>
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-secondary-800 divide-y divide-secondary-100 dark:divide-secondary-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setIsAddPropertyModalOpen(true)}
                      className={`${
                        active
                          ? "bg-primary-500 text-white"
                          : "text-secondary-900 dark:text-secondary-100"
                      } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      <Building2 className="mr-2 h-5 w-5" />
                      Add Property
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setIsAddUnitModalOpen(true)}
                      className={`${
                        active
                          ? "bg-primary-500 text-white"
                          : "text-secondary-900 dark:text-secondary-100"
                      } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      <Home className="mr-2 h-5 w-5" />
                      Add Unit
                    </button>
                  )}
                </Menu.Item>
              </div>
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setIsAddTenantModalOpen(true)}
                      className={`${
                        active
                          ? "bg-primary-500 text-white"
                          : "text-secondary-900 dark:text-secondary-100"
                      } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      <Users className="mr-2 h-5 w-5" />
                      Add Tenant
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setIsAddLeaseModalOpen(true)}
                      className={`${
                        active
                          ? "bg-primary-500 text-white"
                          : "text-secondary-900 dark:text-secondary-100"
                      } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      <FileText className="mr-2 h-5 w-5" />
                      Add Lease
                    </button>
                  )}
                </Menu.Item>
              </div>
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setIsAddMaintenanceModalOpen(true)}
                      className={`${
                        active
                          ? "bg-primary-500 text-white"
                          : "text-secondary-900 dark:text-secondary-100"
                      } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      <Wrench className="mr-2 h-5 w-5" />
                      New Maintenance
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active
                          ? "bg-primary-500 text-white"
                          : "text-secondary-900 dark:text-secondary-100"
                      } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      <CreditCard className="mr-2 h-5 w-5" />
                      Record Payment
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
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
      <AddPropertyModal
        isOpen={isAddPropertyModalOpen}
        onClose={() => setIsAddPropertyModalOpen(false)}
        onSubmit={async () => {
          // Handle property submission
          setIsAddPropertyModalOpen(false);
        }}
      />
      <AddUnitModal
        isOpen={isAddUnitModalOpen}
        onClose={() => setIsAddUnitModalOpen(false)}
        onSubmit={async () => {
          // Handle unit submission
          setIsAddUnitModalOpen(false);
        }}
        properties={properties} // Pass required props
      />
      <AddTenantModal
        isOpen={isAddTenantModalOpen}
        onClose={() => setIsAddTenantModalOpen(false)}
        onSubmit={async () => {
          // Handle tenant submission
          setIsAddTenantModalOpen(false);
        }}
        availableUnits={availableUnits} // Pass required props
      />
      <AddMaintenanceRequestModal
        isOpen={isAddMaintenanceModalOpen}
        setIsOpen={setIsAddMaintenanceModalOpen}
        properties={properties}
        units={units}
        tenants={tenants}
        onCreateRequest={async () => {
          // Handle maintenance request submission
          setIsAddMaintenanceModalOpen(false);
        }}
      />
      <AddLeaseModal
        isOpen={isAddLeaseModalOpen}
        onClose={() => setIsAddLeaseModalOpen(false)}
        tenants={tenants}
        availableUnits={availableUnits}
        createLease={createLease}
      />
    </div>
  );
}
