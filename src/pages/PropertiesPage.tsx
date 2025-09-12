import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  MapPin,
  Building2,
  Edit3,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import AddPropertyModal from "../components/modals/AddPropertyModal";
import EditPropertyModal from "../components/modals/EditPropertyModal";
import InitializeDatabase from "../components/InitializeDatabase";
import { propertyService, unitService } from "../services/database";
import {
  localPropertyService,
  localUnitService,
} from "../services/localStorage";
import { Property, Unit } from "../types";

interface PropertyWithStats extends Property {
  occupiedUnits: number;
  monthlyRevenue: number;
}

export default function PropertiesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] =
    useState<PropertyWithStats | null>(null);
  const [properties, setProperties] = useState<PropertyWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Load properties function (shared between initial load and refresh)
  const loadProperties = async () => {
    try {
      let propertiesData: Property[] = [];
      let getUnits: any;

      try {
        // Try Firebase first
        propertiesData = await propertyService.getAll();
        getUnits = unitService.getByPropertyId;
        console.log("✅ Using Firebase data");
      } catch (firebaseError) {
        // Fallback to localStorage
        console.log("🔄 Firebase failed, using localStorage");
      }

      // Get units count for each property
      const propertiesWithStats = await Promise.all(
        propertiesData.map(async (property) => {
          const units = await getUnits(property.id);
          const occupiedUnits = units.filter(
            (unit: Unit) => unit.status === "occupied"
          ).length;
          const monthlyRevenue = units.reduce(
            (sum: number, unit: Unit) => sum + (unit.rent || 0),
            0
          );

          return {
            ...property,
            totalUnits: units.length,
            occupiedUnits,
            monthlyRevenue,
          };
        })
      );

      setProperties(propertiesWithStats);
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load properties on component mount
  useEffect(() => {
    loadProperties();

    // Listen for data initialization event
    const handleDataInitialized = () => {
      console.log("📊 Data initialized, refreshing...");
      loadProperties();
    };

    window.addEventListener("dataInitialized", handleDataInitialized);

    return () => {
      window.removeEventListener("dataInitialized", handleDataInitialized);
    };
  }, []);

  const handleEditProperty = (
    property: PropertyWithStats,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent card click navigation
    setEditingProperty(property);
    setIsEditModalOpen(true);
  };

  const handleUpdateProperty = async (data: any) => {
    if (!editingProperty) return;

    try {
      // Try Firebase first, fallback to localStorage
      try {
        await propertyService.update(editingProperty.id, data);
      } catch (firebaseError) {
        await localPropertyService.update(editingProperty.id, data);
      }

      // Refresh properties list
      loadProperties();
      setIsEditModalOpen(false);
      setEditingProperty(null);
    } catch (error) {
      console.error("Error updating property:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
            Properties
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Manage your property portfolio and track performance.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Import
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Property
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search properties..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-secondary-600 dark:text-secondary-400">
            Loading properties...
          </div>
        </div>
      ) : properties.length === 0 ? (
        <InitializeDatabase />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <div
              key={property.id}
              className="card-hover group relative overflow-hidden cursor-pointer"
              onClick={() =>
                navigate(
                  `/units?propertyId=${
                    property.id
                  }&propertyName=${encodeURIComponent(property.name)}`
                )
              }
            >
              {/* Property Image */}
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-secondary-100 dark:bg-secondary-700">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="h-16 w-16 text-secondary-300 dark:text-secondary-600" />
                  </div>
                )}

                {/* Image count indicator */}
                {property.images && property.images.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-md text-xs flex items-center">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {property.images.length}
                  </div>
                )}

                {/* Edit button */}
                <button
                  onClick={(e) => handleEditProperty(property, e)}
                  className="absolute top-2 left-2 p-2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit3 className="h-4 w-4" />
                </button>

                {/* Property type badge */}
                <div className="absolute bottom-2 left-2">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      property.type === "residential"
                        ? "bg-primary-100 text-primary-700"
                        : property.type === "commercial"
                        ? "bg-warning-100 text-warning-700"
                        : "bg-secondary-100 text-secondary-700"
                    }`}
                  >
                    {property.type}
                  </span>
                </div>
              </div>

              <div className="px-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {property.name}
                    </h3>
                    <div className="flex items-center text-secondary-600 dark:text-secondary-400 mt-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{property.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    Total Units
                  </p>
                  <p className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                    {property.totalUnits}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    Occupied
                  </p>
                  <p className="text-lg font-semibold text-success-600">
                    {property.occupiedUnits}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-600">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      Monthly Revenue
                    </p>
                    <p className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                      KES {property.monthlyRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      Occupancy
                    </p>
                    <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                      {property.totalUnits > 0
                        ? Math.round(
                            (property.occupiedUnits / property.totalUnits) * 100
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>

                {/* Quick Details Button */}
                <div className="flex justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/properties/${property.id}`);
                    }}
                    className="btn-secondary text-sm py-2 px-4"
                  >
                    Property Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {editingProperty && (
        <EditPropertyModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProperty(null);
          }}
          property={editingProperty}
          onUpdate={handleUpdateProperty}
        />
      )}
    </div>
  );
}
