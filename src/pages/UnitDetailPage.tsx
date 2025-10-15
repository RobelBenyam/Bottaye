import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  Camera,
  FileText,
  User,
  Calendar,
  Phone,
  MapPin,
} from "lucide-react";
import { Unit, Property } from "../types";
import { unitService, propertyService } from "../services/database";
import {
  localUnitService,
  localPropertyService,
} from "../services/localStorage";
import { formatCurrency } from "../utils/currency";

export default function UnitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);

  useEffect(() => {
    const loadUnitData = async () => {
      if (!id) return;

      try {
        let unitData, propertyData;

        try {
          // Try Firebase first
          unitData = await unitService.getById(id);
          if (unitData) {
            propertyData = await propertyService.getById(unitData.propertyId);
          }
        } catch (firebaseError) {
          // Fallback to localStorage
          unitData = await localUnitService.getById(id);
          if (unitData) {
            propertyData = await localPropertyService.getById(
              unitData.propertyId
            );
          }
        }

        setUnit(unitData);
        if (propertyData) {
          setProperty(propertyData);
        }
      } catch (error) {
        console.error("Error loading unit:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUnitData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-secondary-600 dark:text-secondary-400">
          Loading unit...
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-secondary-900 dark:text-secondary-100 mb-2">
          Unit not found
        </div>
        <button
          onClick={() => navigate("/units")}
          className="text-primary-600 hover:text-primary-700"
        >
          Back to Units
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/properties/${unit.propertyId}`)}
            className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to {property?.name}
          </button>
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
              Unit {unit.unitNumber}
            </h1>
            <div className="flex items-center text-secondary-600 dark:text-secondary-400 mt-1">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{unit.propertyName}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary flex items-center">
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Unit
          </button>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              unit.status === "occupied"
                ? "bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400"
                : unit.status === "vacant"
                ? "bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400"
                : "bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400"
            }`}
          >
            {unit.status}
          </span>
        </div>
      </div>

      {/* Unit Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Unit Photos */}
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
                Unit Photos
              </h2>
              <button className="btn-secondary flex items-center text-sm">
                <Camera className="h-4 w-4 mr-2" />
                Add Photos
              </button>
            </div>

            {unit.images && unit.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unit.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Unit ${unit.unitNumber} - Photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-secondary-200 dark:border-secondary-600"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 px-3 py-1 rounded-md text-sm font-medium transition-opacity">
                        View Full Size
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-8 text-center">
                <Camera className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <p className="text-secondary-600 dark:text-secondary-400 mb-2">
                  No photos uploaded yet
                </p>
                <button className="btn-primary">Upload Unit Photos</button>
              </div>
            )}
          </div>

          {/* Floor Plan */}
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
                Floor Plan
              </h2>
              <button className="btn-secondary flex items-center text-sm">
                <FileText className="h-4 w-4 mr-2" />
                Update Plan
              </button>
            </div>

            {unit.floorPlan ? (
              <div className="relative group">
                <img
                  src={unit.floorPlan}
                  alt={`Unit ${unit.unitNumber} - Floor Plan`}
                  className="w-full max-h-96 object-contain rounded-lg border border-secondary-200 dark:border-secondary-600 bg-white cursor-pointer"
                  onClick={() => setShowFloorPlanModal(true)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                  <button
                    onClick={() => setShowFloorPlanModal(true)}
                    className="opacity-0 group-hover:opacity-100 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 px-3 py-1 rounded-md text-sm font-medium transition-opacity"
                  >
                    View Full Size
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <p className="text-secondary-600 dark:text-secondary-400 mb-2">
                  No floor plan uploaded yet
                </p>
                <button className="btn-primary">Upload Floor Plan</button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Unit Info */}
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Unit Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">
                  Type
                </label>
                <p className="font-medium text-secondary-900 dark:text-secondary-100">
                  {unit.type.replace("_", " ")}
                </p>
              </div>
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">
                  Monthly Rent
                </label>
                <p className="font-medium text-secondary-900 dark:text-secondary-100">
                  {formatCurrency(unit.rent)}
                </p>
              </div>
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">
                  Security Deposit
                </label>
                <p className="font-medium text-secondary-900 dark:text-secondary-100">
                  {formatCurrency(unit.deposit)}
                </p>
              </div>
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">
                  Status
                </label>
                <p
                  className={`font-medium capitalize ${
                    unit.status === "occupied"
                      ? "text-success-600"
                      : unit.status === "vacant"
                      ? "text-warning-600"
                      : "text-error-600"
                  }`}
                >
                  {unit.status}
                </p>
              </div>
            </div>
          </div>

          {/* Tenant Info (if occupied) */}
          {unit.status === "occupied" && unit.tenantId && (
            <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                  Current Tenant
                </h3>
                <button
                  onClick={() => navigate(`/tenants/${unit.tenantId}`)}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm"
                >
                  View Details
                </button>
              </div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-secondary-900 dark:text-secondary-100">
                    {unit.tenantName}
                  </p>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    Tenant ID: {unit.tenantId}
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-secondary-400" />
                  <span className="text-secondary-600 dark:text-secondary-400">
                    Move-in date: Coming soon
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-secondary-400" />
                  <span className="text-secondary-600 dark:text-secondary-400">
                    Contact: Coming soon
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              {unit.status === "vacant" && (
                <button className="btn-primary w-full">Add Tenant</button>
              )}
              <button className="btn-secondary w-full">Record Payment</button>
              <button className="btn-secondary w-full">
                Schedule Maintenance
              </button>
              <button className="btn-secondary w-full">Generate Report</button>
            </div>
          </div>
        </div>
      </div>

      {/* Floor Plan Modal */}
      {showFloorPlanModal && unit.floorPlan && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative max-w-5xl max-h-full">
            <button
              onClick={() => setShowFloorPlanModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-xl"
            >
              ✕
            </button>
            <img
              src={unit.floorPlan}
              alt={`Unit ${unit.unitNumber} - Floor Plan`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
