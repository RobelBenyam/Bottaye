import { useState, useEffect } from "react";
import { X, Building2, Check } from "lucide-react";
import { User, Property } from "../../types";
import { userService, propertyService } from "../../services/database";
import toast from "react-hot-toast";

interface AssignPropertiesModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignPropertiesModal({
  user,
  onClose,
  onSuccess,
}: AssignPropertiesModalProps) {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>(
    user.propertyIds || []
  );

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const data = await propertyService.getAll();
      setProperties(data);
    } catch (error) {
      console.error("Error loading properties:", error);
      toast.error("Failed to load properties");
    }
  };

  const toggleProperty = (propertyId: string) => {
    setSelectedPropertyIds((prev) => {
      if (prev.includes(propertyId)) {
        return prev.filter((id) => id !== propertyId);
      } else {
        return [...prev, propertyId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await userService.assignProperties(user.id, selectedPropertyIds);
      toast.success("Properties assigned successfully");
      onSuccess();
    } catch (error) {
      console.error("Error assigning properties:", error);
      toast.error("Failed to assign properties");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">
                Assign Properties
              </h2>
              <p className="text-sm text-secondary-600">{user.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {properties.length === 0 ? (
              <div className="text-center py-8 text-secondary-500">
                <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No properties available</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-secondary-600">
                    Select properties this user can manage:
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPropertyIds(properties.map((p) => p.id))
                      }
                      className="text-xs text-primary-600 hover:text-primary-700 underline"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPropertyIds([])}
                      className="text-xs text-secondary-600 hover:text-secondary-700 underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {properties.map((property) => {
                    const isSelected = selectedPropertyIds.includes(
                      property.id
                    );
                    return (
                      <div
                        key={property.id}
                        onClick={() => toggleProperty(property.id)}
                        className={`
                          flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${
                            isSelected
                              ? "border-primary-500 bg-primary-50"
                              : "border-secondary-200 hover:border-secondary-300"
                          }
                        `}
                      >
                        <div
                          className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                          ${
                            isSelected
                              ? "border-primary-500 bg-primary-500"
                              : "border-secondary-300"
                          }
                        `}
                        >
                          {isSelected && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-secondary-900">
                            {property.name}
                          </h4>
                          <p className="text-sm text-secondary-600 truncate">
                            {property.address}
                          </p>
                        </div>
                        <div className="text-xs text-secondary-500">
                          {property.totalUnits} units
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : `Assign ${selectedPropertyIds.length} ${
                    selectedPropertyIds.length === 1 ? "Property" : "Properties"
                  }`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
