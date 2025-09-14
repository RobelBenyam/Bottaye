import React from "react";
import {
  User,
  Mail,
  Phone,
  FileText,
  Home,
  Calendar,
  CreditCard,
  Edit,
  X,
} from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { Tenant } from "@/types";

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface ViewTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant?: Tenant;
}

// You should fetch tenant data by tenantId in the parent and pass it as prop
const ViewTenantModal: React.FC<ViewTenantModalProps> = ({
  isOpen,
  onClose,
  tenant,
}) => {
  if (!isOpen || !tenant) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  console.log("tenant is,", tenant);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
                {tenant.name}
              </h2>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Tenant Details & Management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-secondary-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Personal Info */}
            <div className="space-y-6">
              <div className="bg-secondary-50 dark:bg-secondary-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                  Personal Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-secondary-400" />
                    <div>
                      <span className="text-secondary-600 dark:text-secondary-400">
                        Full Name:
                      </span>
                      <p className="font-medium text-secondary-900 dark:text-secondary-100">
                        {tenant.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-secondary-400" />
                    <div>
                      <span className="text-secondary-600 dark:text-secondary-400">
                        Email:
                      </span>
                      <p className="font-medium text-secondary-900 dark:text-secondary-100">
                        {tenant.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-secondary-400" />
                    <div>
                      <span className="text-secondary-600 dark:text-secondary-400">
                        Phone:
                      </span>
                      <p className="font-medium text-secondary-900 dark:text-secondary-100">
                        {tenant.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-secondary-400" />
                    <div>
                      <span className="text-secondary-600 dark:text-secondary-400">
                        ID Number:
                      </span>
                      <p className="font-medium text-secondary-900 dark:text-secondary-100">
                        {tenant.idNumber}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-secondary-50 dark:bg-secondary-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                  Emergency Contact
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-secondary-900 dark:text-secondary-100">
                    {tenant.emergencyContact.name}
                  </p>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    {tenant.emergencyContact.phone}
                  </p>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    Relationship: {tenant.emergencyContact.relationship}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Lease & Property Info */}
            <div className="space-y-6">
              <div className="bg-secondary-50 dark:bg-secondary-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                  Lease Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <Home className="h-4 w-4 text-secondary-400" />
                    <div>
                      <span className="text-secondary-600 dark:text-secondary-400">
                        Property:
                      </span>
                      <p className="font-medium text-secondary-900 dark:text-secondary-100">
                        Unit {tenant.unitNumber}, {tenant.propertyName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-secondary-400" />
                    <div>
                      <span className="text-secondary-600 dark:text-secondary-400">
                        Lease Period:
                      </span>
                      <p className="font-medium text-secondary-900 dark:text-secondary-100">
                        {formatDate((tenant.leaseStartDate ?? "").toString())} -{" "}
                        {formatDate(tenant.leaseEndDate?.toString() ?? "")}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="text-secondary-600 dark:text-secondary-400">
                        Monthly Rent:
                      </span>
                      <p className="font-semibold text-lg text-secondary-900 dark:text-secondary-100">
                        {formatCurrency(tenant.rent ?? 0)}
                      </p>
                    </div>
                    <div>
                      <span className="text-secondary-600 dark:text-secondary-400">
                        Security Deposit:
                      </span>
                      <p className="font-semibold text-lg text-secondary-900 dark:text-secondary-100">
                        {formatCurrency(tenant.deposit ?? 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={onClose}
                    className="btn-primary flex items-center justify-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Tenant Details
                  </button>
                  <button
                    onClick={onClose}
                    className="btn-secondary flex items-center justify-center"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    View Payment History
                  </button>
                  <button
                    onClick={onClose}
                    className="btn-secondary flex items-center justify-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Lease Agreement
                  </button>
                  <button
                    onClick={onClose}
                    className="btn-secondary flex items-center justify-center"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Maintenance
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTenantModal;
