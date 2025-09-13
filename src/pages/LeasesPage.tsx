import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  User,
  MapPin,
  DollarSign,
  Download,
  Edit,
  Eye,
} from "lucide-react";
import { formatCurrency } from "../utils/currency";
import { useTenantsForUser } from "@/hooks/tenantsHook";
import { useUnitsForUser } from "@/hooks/unitsHook";
import { useLeases } from "@/hooks/leasesHook";
import { Lease } from "../types";
import AddLeaseModal from "../components/modals/AddLeaseModal";
import EditLeaseModal from "../components/modals/EditLeaseModal";

export default function LeasesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState<
    "active" | "expiring" | "history" | "templates"
  >("active");
  const [isNewLeaseOpen, setIsNewLeaseOpen] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [isEditLeaseOpen, setIsEditLeaseOpen] = useState(false);

  // Use hooks for user-filtered data
  const { tenants, loading: tenantsLoading } = useTenantsForUser();
  const { units: allUnits, loading: unitsLoading } = useUnitsForUser();
  const {
    leases,
    loading: leasesLoading,
    createLease,
    updateLease,
  } = useLeases();

  const availableUnits = allUnits.filter((unit) => unit.status === "vacant");

  const handleEditLease = (lease: Lease) => {
    setSelectedLease(lease);
    setIsEditLeaseOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "expiring_soon":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "terminated":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      case "renewed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "expiring_soon":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "expired":
        return <Clock className="h-5 w-5 text-red-600" />;
      case "renewed":
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <FileText className="h-5 w-5 text-secondary-400" />;
    }
  };

  // Update the getDaysUntilExpiry function to handle both Date and string inputs
  const getDaysUntilExpiry = (endDate: Date | string) => {
    const today = new Date();
    const expiry = endDate instanceof Date ? endDate : new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredLeases = leases.filter((lease) => {
    const matchesSearch =
      lease.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || lease.status === filterStatus;
    const matchesType = filterType === "all" || lease.leaseType === filterType;

    // Filter by tab
    if (activeTab === "active") {
      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        lease.status === "active"
      );
    } else if (activeTab === "expiring") {
      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        (lease.status === "expiring_soon" ||
          getDaysUntilExpiry(lease.endDate) <= 90)
      );
    } else if (activeTab === "history") {
      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        (lease.status === "expired" ||
          lease.status === "terminated" ||
          lease.status === "renewed")
      );
    }

    return matchesSearch && matchesStatus && matchesType;
  });

  const getTabCount = (tab: string) => {
    switch (tab) {
      case "active":
        return leases.filter((l) => l.status === "active").length;
      case "expiring":
        return leases.filter(
          (l) =>
            l.status === "expiring_soon" || getDaysUntilExpiry(l.endDate) <= 90
        ).length;
      case "history":
        return leases.filter((l) =>
          ["expired", "terminated", "renewed"].includes(l.status)
        ).length;
      default:
        return 0;
    }
  };

  // Add loading state
  if (leasesLoading || tenantsLoading || unitsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-400">
            Loading data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            Lease Management
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Manage lease agreements, renewals, and contract documentation
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
          <button
            onClick={() => setIsNewLeaseOpen(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Lease
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-200 dark:border-secondary-700">
        <nav className="-mb-px flex space-x-8">
          {[
            {
              id: "active",
              name: "Active Leases",
              count: getTabCount("active"),
            },
            {
              id: "expiring",
              name: "Expiring Soon",
              count: getTabCount("expiring"),
            },
            {
              id: "history",
              name: "Lease History",
              count: getTabCount("history"),
            },
            { id: "templates", name: "Templates", count: 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300 dark:text-secondary-400 dark:hover:text-secondary-300"
              }`}
            >
              <span>{tab.name}</span>
              {tab.count > 0 && (
                <span className="bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      {activeTab !== "templates" && (
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search leases, tenants, or properties..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-secondary-400" />
            <select
              className="input-field"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
              <option value="renewed">Renewed</option>
            </select>

            <select
              className="input-field"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="yearly">Yearly</option>
              <option value="fixed">Fixed Term</option>
              <option value="month_to_month">Month to Month</option>
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === "templates" ? (
        /* Lease Templates */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                  Residential Lease Template
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Standard residential lease agreement
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="btn-secondary flex-1 text-sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </button>
              <button className="btn-primary flex-1 text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Use Template
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                  Commercial Lease Template
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Commercial property lease agreement
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="btn-secondary flex-1 text-sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </button>
              <button className="btn-primary flex-1 text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Use Template
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                  Month-to-Month Template
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Flexible monthly rental agreement
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="btn-secondary flex-1 text-sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </button>
              <button className="btn-primary flex-1 text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Use Template
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Lease List */
        <div className="grid grid-cols-1 gap-6">
          {filteredLeases.map((lease) => (
            <div
              key={lease.id}
              className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(lease.status)}
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                      {lease.tenantName}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        lease.status
                      )}`}
                    >
                      {lease.status.replace("_", " ")}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-300">
                      {lease.leaseType.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-secondary-400" />
                      <span className="text-secondary-600 dark:text-secondary-400">
                        Unit {lease.unitNumber}, {lease.propertyName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-secondary-400" />
                      <span className="text-secondary-600 dark:text-secondary-400">
                        {lease.startDate.toLocaleDateString()} -{" "}
                        {lease.endDate.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-secondary-400" />
                      <span className="text-secondary-600 dark:text-secondary-400">
                        {formatCurrency(lease.monthlyRent)}/month
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-secondary-400" />
                      <span className="text-secondary-600 dark:text-secondary-400">
                        {lease.tenantPhone}
                      </span>
                    </div>
                  </div>

                  {lease.specialTerms && (
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3">
                      <span className="font-medium">Special Terms:</span>{" "}
                      {lease.specialTerms}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-2">
                  {lease.status === "expiring_soon" ||
                  getDaysUntilExpiry(lease.endDate) <= 90 ? (
                    <div className="text-right">
                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                        Expires in {getDaysUntilExpiry(lease.endDate)} days
                      </span>
                      {lease.renewalOption && (
                        <p className="text-xs text-secondary-500">
                          Renewal option available
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-secondary-500">
                      {getDaysUntilExpiry(lease.endDate)} days remaining
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-secondary-200 dark:border-secondary-600">
                <div className="flex items-center space-x-4 text-sm text-secondary-600 dark:text-secondary-400">
                  <span>Deposit: {formatCurrency(lease.securityDeposit)}</span>
                  {lease.lastRenewalDate && (
                    <span>
                      Last Renewed: {lease.lastRenewalDate.toLocaleDateString()}
                    </span>
                  )}
                  {lease.renewalNoticeDate && (
                    <span>
                      Notice Date:{" "}
                      {lease.renewalNoticeDate.toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {lease.documentUrl && (
                    <button className="btn-secondary text-sm py-1 px-3">
                      <Download className="h-3 w-3 mr-1" />
                      Document
                    </button>
                  )}
                  <button
                    onClick={() => handleEditLease(lease)}
                    className="btn-secondary text-sm py-1 px-3"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </button>
                  {lease.status === "expiring_soon" && lease.renewalOption && (
                    <button
                      onClick={() => {
                        setSelectedLease(lease);
                        setIsNewLeaseOpen(true);
                      }}
                      className="btn-primary text-sm py-1 px-3"
                    >
                      Renew Lease
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredLeases.length === 0 && activeTab !== "templates" && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
            No leases found
          </p>
          <p className="text-secondary-600 dark:text-secondary-400">
            {searchTerm || filterStatus !== "all" || filterType !== "all"
              ? "Try adjusting your search or filter criteria"
              : `No ${activeTab} leases at the moment`}
          </p>
        </div>
      )}

      {/* Modals */}
      <AddLeaseModal
        isOpen={isNewLeaseOpen}
        onClose={() => setIsNewLeaseOpen(false)}
        tenants={tenants}
        availableUnits={availableUnits}
        createLease={createLease}
      />

      <EditLeaseModal
        isOpen={isEditLeaseOpen}
        onClose={() => setIsEditLeaseOpen(false)}
        lease={selectedLease}
        updateLease={updateLease}
      />
    </div>
  );
}
