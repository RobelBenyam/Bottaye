import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Home,
  User,
  CheckCircle,
  AlertCircle,
  Wrench,
  ArrowLeft,
  DoorOpen,
  Image as ImageIcon,
  FileText,
  Edit,
  X,
  UserPlus,
  CreditCard,
  Camera,
} from "lucide-react";
import { formatCurrency } from "../utils/currency";
import { Unit } from "../types";
import AddUnitModal from "../components/modals/AddUnitModal";
import EditUnitModal from "../components/modals/EditUnitModal";
import ViewTenantModal from "@/components/modals/ViewTenantModal";
import AddTenantModal from "../components/modals/AddTenantModal";
import { useAvailableUnits } from "@/hooks/unitsHook";
import { useUnits } from "@/hooks/unitsHook";
import { useTenants } from "@/hooks/tenantsHook";

export default function UnitsPage() {
  const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false);
  const { availableUnits } = useAvailableUnits();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const [viewTenantModalOpen, setViewTenantModalOpen] = useState(false);
  const [viewingTenant, setViewingTenant] = useState<any>(null);
  const { createTenant } = useTenants();

  const propertyName = searchParams.get("propertyName");

  const { units, properties, tenants, createUnit, updateUnit, loading } =
    useUnits();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "occupied":
        return <CheckCircle className="h-5 w-5 text-success-600" />;
      case "vacant":
        return <Home className="h-5 w-5 text-secondary-400" />;
      case "maintenance":
        return <Wrench className="h-5 w-5 text-warning-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-secondary-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      occupied: "bg-success-100 text-success-700",
      vacant: "bg-secondary-100 text-secondary-700",
      maintenance: "bg-warning-100 text-warning-700",
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${
      styles[status as keyof typeof styles]
    }`;
  };

  const getUnitTypeLabel = (type: string) => {
    const types = {
      studio: "Studio",
      "1_bedroom": "1 Bedroom",
      "2_bedroom": "2 Bedroom",
      "3_bedroom": "3 Bedroom",
      "4_bedroom": "4 Bedroom",
      office: "Office",
      shop: "Shop",
    };
    return types[type as keyof typeof types] || type;
  };

  const filteredUnits = units.filter((unit) => {
    const matchesSearch =
      unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || unit.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleUnitSubmit = async (data: any) => {
    try {
      await createUnit(data);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error creating unit:", error);
      throw error;
    }
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsEditModalOpen(true);
  };

  const handleUnitClick = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsQuickActionsOpen(true);
  };

  const handleUpdateUnit = async (data: any) => {
    if (!editingUnit) return;
    try {
      await updateUnit(editingUnit.id, data);
      setIsEditModalOpen(false);
      setEditingUnit(null);
    } catch (error) {
      console.error("Error updating unit:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center space-x-4">
            {propertyName && (
              <button
                onClick={() => navigate("/properties")}
                className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Properties
              </button>
            )}
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
            {propertyName ? `${propertyName} - Units` : "Units"}
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            {propertyName
              ? `Manage units in ${propertyName}`
              : "Monitor and manage individual units across all properties."}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary flex items-center">
            <Home className="h-5 w-5 mr-2" />
            Bulk Edit
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Unit
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search units, properties, or tenants..."
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
            <option value="occupied">Occupied</option>
            <option value="vacant">Vacant</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-secondary-600 dark:text-secondary-400">
            Loading units...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredUnits.map((unit) => (
            <div
              key={unit.id}
              className="card-hover group relative overflow-hidden cursor-pointer"
              onClick={() => handleUnitClick(unit)}
            >
              {/* Unit Image */}
              <div className="relative h-40 mb-4 rounded-lg overflow-hidden bg-secondary-100 dark:bg-secondary-700">
                {unit.images && unit.images.length > 0 ? (
                  <img
                    src={unit.images[0]}
                    alt={`Unit ${unit.unitNumber}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <DoorOpen className="h-12 w-12 text-secondary-300 dark:text-secondary-600" />
                  </div>
                )}

                {/* Image count indicator */}
                {unit.images && unit.images.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-md text-xs flex items-center">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {unit.images.length}
                  </div>
                )}

                {/* Floor plan indicator */}
                {unit.floorPlan && (
                  <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-md text-xs flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    Plan
                  </div>
                )}

                {/* Status badge */}
                <div className="absolute bottom-2 right-2">
                  <span className={getStatusBadge(unit.status)}>
                    {unit.status}
                  </span>
                </div>

                {/* Edit Button - Shows on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditUnit(unit);
                  }}
                  className="absolute bottom-2 left-2 p-2 bg-white dark:bg-secondary-800 rounded-lg shadow-md hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Edit Unit"
                >
                  <Edit className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
                </button>
              </div>

              <div className="px-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                      Unit {unit.unitNumber}
                    </h3>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      {unit.propertyName}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(unit.status)}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">
                    Type
                  </span>
                  <span className="font-medium text-secondary-900 dark:text-secondary-100">
                    {getUnitTypeLabel(unit.type)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">
                    Rent
                  </span>
                  <span className="font-semibold text-secondary-900 dark:text-secondary-100">
                    {formatCurrency(unit.rent)}/month
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">
                    Deposit
                  </span>
                  <span className="font-medium text-secondary-900 dark:text-secondary-100">
                    {formatCurrency(unit.deposit)}
                  </span>
                </div>

                {unit.status === "occupied" && unit.tenantName && (
                  <div className="pt-3 border-t border-secondary-200 dark:border-secondary-600">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-secondary-400" />
                      <span className="font-medium text-secondary-900 dark:text-secondary-100">
                        {unit.tenantName}
                      </span>
                    </div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-400">
                      <p>Tenant ID: {unit.tenantId}</p>
                      <p>Status: Occupied</p>
                    </div>
                  </div>
                )}

                {unit.status === "vacant" && (
                  <div className="pt-3 border-t border-secondary-200 dark:border-secondary-600">
                    <p className="text-sm text-secondary-500 dark:text-secondary-400 italic">
                      Available for rent
                    </p>
                  </div>
                )}

                {unit.status === "maintenance" && (
                  <div className="pt-3 border-t border-secondary-200 dark:border-secondary-600">
                    <p className="text-sm text-warning-600 italic">
                      Under maintenance
                    </p>
                  </div>
                )}

                {/* Quick Tenant Action */}
                <div className="pt-4 border-t border-secondary-200 dark:border-secondary-600 mt-4">
                  <div className="flex justify-center">
                    {/* && unit.tenantId */}
                    {unit.status === "occupied" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewTenantModalOpen(true);
                          const tenant =
                            tenants.find((t) => t.id === unit.tenantId) || null;
                          setViewingTenant(tenant);
                        }}
                        className="btn-secondary text-sm py-2 px-4"
                      >
                        View Tenant
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUnit(unit);
                          setIsAddTenantModalOpen(true);
                        }}
                        className="btn-primary text-sm py-2 px-4"
                      >
                        Add Tenant
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredUnits.length === 0 && (
            <div className="text-center py-12">
              <Home className="h-16 w-16 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                No units found
              </p>
              <p className="text-secondary-600 dark:text-secondary-400">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first unit"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Unit Modal */}
      <AddUnitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleUnitSubmit}
        properties={properties.map((p) => ({ id: p.id, name: p.name }))}
      />
      {viewTenantModalOpen && viewingTenant ? (
        <ViewTenantModal
          isOpen={viewTenantModalOpen}
          onClose={() => {
            setViewTenantModalOpen(false);
            setViewingTenant(null);
          }}
          tenant={viewingTenant}
        />
      ) : null}

      {/* Add Tenant Modal */}
      {isAddTenantModalOpen && (
        <AddTenantModal
          isOpen={isAddTenantModalOpen}
          onClose={() => setIsAddTenantModalOpen(false)}
          availableUnits={availableUnits}
          onSubmit={async (tenantData) => {
            await createTenant({
              ...tenantData,
              leaseStartDate: new Date(tenantData.leaseStartDate),
              leaseEndDate: new Date(tenantData.leaseEndDate),
              emergencyContact: {
                name: tenantData.emergencyContactName,
                phone: tenantData.emergencyContactPhone,
                relationship: tenantData.emergencyContactRelationship,
              },
            });
            setIsAddTenantModalOpen(false);
          }}
        />
      )}

      {/* Edit Unit Modal */}
      {editingUnit && (
        <EditUnitModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingUnit(null);
          }}
          unit={editingUnit}
          properties={properties.map((p) => ({ id: p.id, name: p.name }))}
          onUpdate={handleUpdateUnit}
        />
      )}

      {/* Quick Actions Modal */}
      {selectedUnit && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${
            isQuickActionsOpen ? "" : "hidden"
          }`}
        >
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-600">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                  <DoorOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
                    Unit {selectedUnit.unitNumber}
                  </h2>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    {selectedUnit.propertyName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickActionsOpen(false)}
                className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-secondary-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Unit Info & Actions */}
                <div className="space-y-6">
                  {/* Unit Information */}
                  <div className="bg-secondary-50 dark:bg-secondary-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                      Unit Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-secondary-600 dark:text-secondary-400">
                          Type:
                        </span>
                        <p className="font-medium text-secondary-900 dark:text-secondary-100">
                          {getUnitTypeLabel(selectedUnit.type)}
                        </p>
                      </div>
                      <div>
                        <span className="text-secondary-600 dark:text-secondary-400">
                          Status:
                        </span>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ml-2 ${getStatusBadge(
                            selectedUnit.status
                          )}`}
                        >
                          {selectedUnit.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-secondary-600 dark:text-secondary-400">
                          Monthly Rent:
                        </span>
                        <p className="font-medium text-secondary-900 dark:text-secondary-100">
                          {formatCurrency(selectedUnit.rent)}
                        </p>
                      </div>
                      <div>
                        <span className="text-secondary-600 dark:text-secondary-400">
                          Security Deposit:
                        </span>
                        <p className="font-medium text-secondary-900 dark:text-secondary-100">
                          {formatCurrency(selectedUnit.deposit)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={() => {
                          setIsQuickActionsOpen(false);
                          handleEditUnit(selectedUnit);
                        }}
                        className="btn-primary flex items-center justify-center"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Unit Details
                      </button>

                      {selectedUnit.status === "vacant" ? (
                        <button
                          onClick={() => {
                            setIsQuickActionsOpen(false);
                            navigate(`/tenants`);
                          }}
                          className="btn-secondary flex items-center justify-center"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Tenant
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setIsQuickActionsOpen(false);
                            setViewTenantModalOpen(true);
                            console.log("cli");
                            const tenant =
                              tenants.find(
                                (t) => t.id === selectedUnit.tenantId
                              ) || null;
                            setViewingTenant(tenant);
                          }}
                          className="btn-secondary flex items-center justify-center"
                        >
                          <User className="h-4 w-4 mr-2" />
                          View Tenant
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsQuickActionsOpen(false);
                          navigate(`/payments?unitId=${selectedUnit.id}`);
                        }}
                        className="btn-secondary flex items-center justify-center"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Payment History
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Photos & Floor Plan */}
                <div className="space-y-6">
                  {/* Unit Photos */}
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                      Unit Photos
                    </h3>
                    {selectedUnit.images && selectedUnit.images.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {selectedUnit.images.slice(0, 4).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Unit ${selectedUnit.unitNumber} - Photo ${
                              index + 1
                            }`}
                            className="w-full h-24 object-cover rounded-lg border border-secondary-200 dark:border-secondary-600"
                          />
                        ))}
                        {selectedUnit.images.length > 4 && (
                          <div className="w-full h-24 bg-secondary-100 dark:bg-secondary-700 rounded-lg border border-secondary-200 dark:border-secondary-600 flex items-center justify-center">
                            <span className="text-sm text-secondary-600 dark:text-secondary-400">
                              +{selectedUnit.images.length - 4} more
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-6 text-center">
                        <Camera className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">
                          No photos uploaded
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Floor Plan */}
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                      Floor Plan
                    </h3>
                    {selectedUnit.floorPlan ? (
                      <img
                        src={selectedUnit.floorPlan}
                        alt={`Unit ${selectedUnit.unitNumber} floor plan`}
                        className="w-full h-48 object-contain rounded-lg border border-secondary-200 dark:border-secondary-600 bg-white"
                      />
                    ) : (
                      <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-6 text-center">
                        <FileText className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">
                          No floor plan uploaded
                        </p>
                      </div>
                    )}
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
