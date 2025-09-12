import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Phone,
  Mail,
  Home,
  Calendar,
  User,
  Edit,
  Eye,
  X,
  CreditCard,
  FileText,
} from "lucide-react";
import { formatCurrency } from "../utils/currency";
import AddTenantModal from "../components/modals/AddTenantModal";
import EditTenantModal from "../components/modals/EditTenantModal";
import { tenantService } from "../services/database";
import {
  localUnitService as localUnits,
  localPropertyService as localProps,
} from "../services/localStorage";
import { unitService } from "../services/database";
import { localUnitService } from "../services/localStorage";
import { Tenant } from "@/types";

export default function TenantsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAvailableUnits = async () => {
      try {
        let units;
        try {
          units = await unitService.getAll();
        } catch (firebaseError) {
          units = await localUnitService.getAll();
        }

        // Filter to only vacant units
        const vacantUnits = units
          .filter((unit) => unit.status === "vacant")
          .map((unit) => ({
            id: unit.id,
            unitNumber: unit.unitNumber,
            propertyName: unit.propertyName,
            rent: unit.rent,
          }));

        setAvailableUnits(vacantUnits);
      } catch (error) {
        console.error("Error loading units:", error);
        setAvailableUnits([]);
      } finally {
        setLoading(false);
      }
    };

    loadAvailableUnits();
  }, []);

  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    const loadTenants = async () => {
      try {
        let fetchedTenants: Tenant[];
        try {
          fetchedTenants = await tenantService.getAll();
        } catch (firebaseError) {
          fetchedTenants = [];
        }
        setTenants(fetchedTenants);
      } catch (error) {
        console.error("Error loading tenants:", error);
        setTenants([]);
      }
    };
    loadTenants();
  }, []);

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone.includes(searchTerm) ||
      tenant.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.propertyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isLeaseExpiringSoon = (endDate: string) => {
    const today = new Date();
    const lease = new Date(endDate);
    const diffTime = lease.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 60 && diffDays >= 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
            Tenants
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Manage tenant relationships and lease agreements.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary flex items-center">
            <User className="h-5 w-5 mr-2" />
            Export List
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Tenant
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search tenants..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredTenants.map((tenant) => (
          <div
            key={tenant.id}
            className="card-hover group cursor-pointer relative"
            onClick={() => {
              setSelectedTenant(tenant);
              setIsDetailsModalOpen(true);
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                    {tenant.name}
                  </h3>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    ID: {tenant.idNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isLeaseExpiringSoon(tenant.leaseEndDate) && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning-100 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400">
                    Lease Expiring
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTenant(tenant);
                    setIsEditModalOpen(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-white dark:bg-secondary-800 rounded-lg shadow-md hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-all duration-200"
                  title="Edit Tenant"
                >
                  <Edit className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-secondary-400" />
                <span className="text-sm text-secondary-900 dark:text-secondary-100">
                  {tenant.email}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-secondary-400" />
                <span className="text-sm text-secondary-900 dark:text-secondary-100">
                  {tenant.phone}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <Home className="h-4 w-4 text-secondary-400" />
                <span className="text-sm text-secondary-900 dark:text-secondary-100">
                  Unit {tenant.unitNumber}, {tenant.propertyName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-secondary-200 dark:border-secondary-600">
                <div>
                  <p className="text-xs text-secondary-600 dark:text-secondary-400">
                    Monthly Rent
                  </p>
                  <p className="font-semibold text-secondary-900 dark:text-secondary-100">
                    {formatCurrency(tenant.rent)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondary-600 dark:text-secondary-400">
                    Deposit
                  </p>
                  <p className="font-semibold text-secondary-900 dark:text-secondary-100">
                    {formatCurrency(tenant.deposit)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-secondary-400" />
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">
                    {formatDate(tenant.leaseStartDate)} -{" "}
                    {formatDate(tenant.leaseEndDate)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-secondary-200 dark:border-secondary-600">
                <p className="text-xs text-secondary-600 dark:text-secondary-400 mb-1">
                  Emergency Contact
                </p>
                <div className="text-sm text-secondary-900 dark:text-secondary-100">
                  <p className="font-medium">{tenant.emergencyContact.name}</p>
                  <p>
                    {tenant.emergencyContact.phone} (
                    {tenant.emergencyContact.relationship})
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-2 pt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/payments");
                  }}
                  className="btn-secondary flex-1 text-sm py-2"
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  Payments
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/leases");
                  }}
                  className="btn-secondary flex-1 text-sm py-2"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Lease
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTenants.length === 0 && (
        <div className="text-center py-12">
          <User className="h-16 w-16 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
            No tenants found
          </p>
          <p className="text-secondary-600 dark:text-secondary-400">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Get started by adding your first tenant"}
          </p>
        </div>
      )}

      {/* Add Tenant Modal */}
      <AddTenantModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (data) => {
          try {
            try {
              await tenantService.create({
                name: data.name,
                email: data.email,
                phone: data.phone,
                idNumber: data.idNumber,
                unitId: data.unitId,
                unitNumber: availableUnits.find((u) => u.id === data.unitId)
                  ?.unitNumber,
                // propertyId: undefined,
                propertyName: availableUnits.find((u) => u.id === data.unitId)
                  ?.propertyName,
                leaseStartDate: new Date(data.leaseStartDate) as unknown as any,
                leaseEndDate: new Date(data.leaseEndDate) as unknown as any,
                rent: availableUnits.find((u) => u.id === data.unitId)?.rent,
                deposit:
                  (availableUnits.find((u) => u.id === data.unitId)?.rent ||
                    0) * 2,
                emergencyContact: {
                  name: data.emergencyContactName,
                  phone: data.emergencyContactPhone,
                  relationship: data.emergencyContactRelationship,
                },
                createdAt: new Date() as unknown as any,
                updatedAt: new Date() as unknown as any,
              } as any);
            } catch (firebaseError) {
              // fallback not implemented for tenants; no-op
              console.error("Failed to add tenant", firebaseError);
            }
            setIsAddModalOpen(false);
          } catch (e) {
            console.error("Failed to create tenant", e);
          }
        }}
        availableUnits={availableUnits}
      />

      {/* Edit Tenant Modal */}
      {selectedTenant && (
        <EditTenantModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          tenant={selectedTenant}
          availableUnits={availableUnits}
          onUpdate={async (data) => {
            try {
              await tenantService.update(selectedTenant.id, {
                name: data.name,
                email: data.email,
                phone: data.phone,
                idNumber: data.idNumber,
                unitId: data.unitId,
                leaseStartDate: new Date(data.leaseStartDate) as unknown as any,
                leaseEndDate: new Date(data.leaseEndDate) as unknown as any,
                emergencyContact: {
                  name: data.emergencyContactName,
                  phone: data.emergencyContactPhone,
                  relationship: data.emergencyContactRelationship,
                },
                updatedAt: new Date() as unknown as any,
              } as any);
              setIsEditModalOpen(false);
            } catch (e) {
              console.error("Failed to update tenant", e);
            }
          }}
        />
      )}

      {/* Tenant Details Modal */}
      {selectedTenant && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${
            isDetailsModalOpen ? "" : "hidden"
          }`}
        >
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-600">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
                    {selectedTenant.name}
                  </h2>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    Tenant Details & Management
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
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
                            {selectedTenant.name}
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
                            {selectedTenant.email}
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
                            {selectedTenant.phone}
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
                            {selectedTenant.idNumber}
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
                        {selectedTenant.emergencyContact.name}
                      </p>
                      <p className="text-secondary-600 dark:text-secondary-400">
                        {selectedTenant.emergencyContact.phone}
                      </p>
                      <p className="text-secondary-600 dark:text-secondary-400">
                        Relationship:{" "}
                        {selectedTenant.emergencyContact.relationship}
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
                            Unit {selectedTenant.unitNumber},{" "}
                            {selectedTenant.propertyName}
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
                            {formatDate(selectedTenant.leaseStartDate)} -{" "}
                            {formatDate(selectedTenant.leaseEndDate)}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <span className="text-secondary-600 dark:text-secondary-400">
                            Monthly Rent:
                          </span>
                          <p className="font-semibold text-lg text-secondary-900 dark:text-secondary-100">
                            {formatCurrency(selectedTenant.rent)}
                          </p>
                        </div>
                        <div>
                          <span className="text-secondary-600 dark:text-secondary-400">
                            Security Deposit:
                          </span>
                          <p className="font-semibold text-lg text-secondary-900 dark:text-secondary-100">
                            {formatCurrency(selectedTenant.deposit)}
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
                        onClick={() => {
                          setIsDetailsModalOpen(false);
                          setIsEditModalOpen(true);
                        }}
                        className="btn-primary flex items-center justify-center"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Tenant Details
                      </button>
                      <button
                        onClick={() => {
                          setIsDetailsModalOpen(false);
                          navigate("/payments");
                        }}
                        className="btn-secondary flex items-center justify-center"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        View Payment History
                      </button>
                      <button
                        onClick={() => {
                          setIsDetailsModalOpen(false);
                          navigate("/leases");
                        }}
                        className="btn-secondary flex items-center justify-center"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Lease Agreement
                      </button>
                      <button
                        onClick={() => {
                          setIsDetailsModalOpen(false);
                          navigate("/maintenance");
                        }}
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
      )}
    </div>
  );
}
