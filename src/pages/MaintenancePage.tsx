import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Wrench,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  MapPin,
  DollarSign,
} from "lucide-react";

import { useMaintenance } from "@/hooks/maintenanceHook";
import {
  Maintenance,
  NewMaintenanceForm,
  Property,
  Unit,
  Tenant,
} from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { useProperties } from "@/hooks/propertiesHook";
import { useUnitsForUser } from "@/hooks/unitsHook";
import { useTenantsForUser } from "@/hooks/tenantsHook";
import AddMaintenanceRequest from "@/components/modals/AddMaintenanceRequest";
import LoadingSpinner from "@/components/LoadingSpinner";

// Helper to format dates safely, returning a fallback if the date is invalid
const formatDate = (date: string | Date | undefined): string => {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleDateString();
  } catch (error) {
    return "Invalid Date";
  }
};

const MaintenancePage: React.FC = () => {
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);

  const { user } = useAuthStore();
  const { properties, loading: propertiesLoading } = useProperties();
  const { units, loading: unitsLoading } = useUnitsForUser();
  const { tenants, loading: tenantsLoading } = useTenantsForUser();

  const userProperties: Property[] = useMemo(
    () => (user ? properties.filter((p) => p.managerId === user.id) : []),
    [properties, user]
  );

  const propertyIds: string[] = useMemo(
    () => userProperties.map((p) => p.id),
    [userProperties]
  );

  const userUnits: Unit[] = useMemo(
    () => units.filter((u) => propertyIds.includes(u.propertyId)),
    [units, propertyIds]
  );

  const userTenants: Tenant[] = useMemo(
    () =>
      tenants.filter((t) => t.propertyId && propertyIds.includes(t.propertyId)),
    [tenants, propertyIds]
  );

  const {
    maintenance,
    loading: maintenanceLoading,
    createMaintenance,
  } = useMaintenance(propertyIds);

  const handleCreateRequest = async (formData: NewMaintenanceForm) => {
    const maintenanceData = {
      ...formData,
      category: formData.requestType,
      reportedDate: new Date(formData.reportedDate),
      scheduledDate: formData.scheduledDate
        ? new Date(formData.scheduledDate)
        : undefined,
      completedAt: formData.completedDate
        ? new Date(formData.completedDate)
        : undefined,
      estimatedCost:
        formData.estimatedCost === ""
          ? undefined
          : Number(formData.estimatedCost),
      actualCost:
        formData.actualCost === "" ? undefined : Number(formData.actualCost),
      status: "pending" as const,
    };

    delete (maintenanceData as any).requestType;
    delete (maintenanceData as any).completedDate;

    try {
      await createMaintenance(maintenanceData as any);
      setIsNewRequestOpen(false);
    } catch (err) {
      console.error("Failed to create request:", err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Wrench className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const filteredRequests = useMemo(() => {
    return maintenance.filter((request: Maintenance) => {
      const lowerCaseSearch = searchTerm.toLowerCase();
      const matchesSearch =
        (request.title ?? "").toLowerCase().includes(lowerCaseSearch) ||
        (request.unitNumber ?? "").toLowerCase().includes(lowerCaseSearch) ||
        (request.propertyName ?? "").toLowerCase().includes(lowerCaseSearch) ||
        (request.tenantName ?? "").toLowerCase().includes(lowerCaseSearch);

      const matchesStatus =
        filterStatus === "all" || (request.status ?? "") === filterStatus;
      const matchesPriority =
        filterPriority === "all" || (request.priority ?? "") === filterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [maintenance, searchTerm, filterStatus, filterPriority]);

  const isLoading =
    propertiesLoading || unitsLoading || tenantsLoading || maintenanceLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Maintenance Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage property maintenance requests and schedules.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Schedule
          </button>
          <button
            className="btn-primary flex items-center"
            onClick={() => setIsNewRequestOpen(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            New Request
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full md:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by title, unit, property..."
              className="input-field pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="input-field"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            className="input-field"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-500 mt-4">Loading maintenance requests...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            {filteredRequests.map((request: Maintenance) => (
              <div
                key={request.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(request.status ?? "pending")}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {request.title || "Untitled Request"}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                          request.priority ?? "medium"
                        )}`}
                      >
                        {request.priority ?? "medium"}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {request.description || "No description provided."}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>
                          Unit {request.unitNumber || "N/A"},{" "}
                          {request.propertyName || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{request.tenantName || "N/A"}</span>
                      </div>
                      {request.estimatedCost != null && (
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>
                            Est. KES {request.estimatedCost.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2 text-right">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                        request.status ?? "pending"
                      )}`}
                    >
                      {(request.status ?? "pending").replace("_", " ")}
                    </span>
                    <span className="text-xs text-gray-500">
                      Reported: {formatDate(request.reportedDate)}
                    </span>
                    {request.scheduledDate && (
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        Scheduled: {formatDate(request.scheduledDate)}
                      </span>
                    )}
                  </div>
                </div>

                {request.assignedTo && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Assigned to:{" "}
                      <span className="font-medium">{request.assignedTo}</span>
                    </span>
                    {request.actualCost != null && (
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        Actual: KES {request.actualCost.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredRequests.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Wrench className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No maintenance requests found
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ||
                filterStatus !== "all" ||
                filterPriority !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "All new maintenance requests for your properties will appear here."}
              </p>
            </div>
          )}

          <AddMaintenanceRequest
            isOpen={isNewRequestOpen}
            setIsOpen={setIsNewRequestOpen}
            properties={userProperties}
            units={userUnits}
            tenants={userTenants}
            onCreateRequest={handleCreateRequest}
          />
        </>
      )}
    </div>
  );
};

export default MaintenancePage;
