import { useState } from "react";
import { X, FileText, User, Home, Calendar, DollarSign } from "lucide-react";
import { Lease, Tenant, Unit } from "../../types";

interface AddLeaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: Tenant[];
  availableUnits: Unit[];
  createLease: (
    lease: Omit<Lease, "id" | "createdAt" | "updatedAt">
  ) => Promise<any>;
}

const initialLeaseFormState = {
  tenantId: "",
  unitId: "",
  startDate: "",
  endDate: "",
  monthlyRent: "",
  securityDeposit: "",
  leaseType: "yearly" as "fixed" | "month_to_month" | "yearly",
  petPolicy: "no_pets" as
    | "no_pets"
    | "cats_allowed"
    | "dogs_allowed"
    | "all_pets",
  smokingPolicy: "no_smoking" as "no_smoking" | "smoking_allowed",
  utilitiesIncluded: [] as string[],
  parkingSpaces: "0",
  lateFeePenalty: "",
  earlyTerminationFee: "",
  renewalOption: true,
  maintenanceResponsibility: "landlord" as "landlord" | "tenant" | "shared",
  specialTerms: "",
  emergencyContact: {
    name: "",
    phone: "",
    relationship: "",
  },
};

export default function AddLeaseModal({
  isOpen,
  onClose,
  tenants,
  availableUnits,
  createLease,
}: AddLeaseModalProps) {
  const [newLeaseForm, setNewLeaseForm] = useState(initialLeaseFormState);

  const handleCreateLease = async () => {
    if (
      !newLeaseForm.tenantId ||
      !newLeaseForm.unitId ||
      !newLeaseForm.startDate ||
      !newLeaseForm.endDate
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const selectedTenant = tenants.find(
        (t) => t.id === newLeaseForm.tenantId
      );
      const selectedUnit = availableUnits.find(
        (u) => u.id === newLeaseForm.unitId
      );

      if (selectedTenant && selectedUnit) {
        const newLease: Omit<Lease, "id" | "createdAt" | "updatedAt"> = {
          tenantId: selectedTenant.id,
          unitId: selectedUnit.id,
          propertyId: selectedUnit.propertyId || "unknown",
          tenantName: selectedTenant.name,
          tenantEmail: selectedTenant.email,
          tenantPhone: selectedTenant.phone,
          unitNumber: selectedUnit.unitNumber,
          propertyName: selectedUnit.propertyName,
          startDate: new Date(newLeaseForm.startDate),
          endDate: new Date(newLeaseForm.endDate),
          monthlyRent: Number(
            newLeaseForm.monthlyRent || selectedUnit.rent || 0
          ),
          securityDeposit: Number(
            newLeaseForm.securityDeposit || selectedUnit.deposit || 0
          ),
          leaseType: newLeaseForm.leaseType,
          status: "active",
          renewalOption: newLeaseForm.renewalOption,
          specialTerms: newLeaseForm.specialTerms,
          petPolicy: newLeaseForm.petPolicy,
          smokingPolicy: newLeaseForm.smokingPolicy,
          utilitiesIncluded: newLeaseForm.utilitiesIncluded,
          parkingSpaces: Number(newLeaseForm.parkingSpaces),
          lateFeePenalty: Number(newLeaseForm.lateFeePenalty) || 0,
          earlyTerminationFee: Number(newLeaseForm.earlyTerminationFee) || 0,
          maintenanceResponsibility: newLeaseForm.maintenanceResponsibility,
          emergencyContact: newLeaseForm.emergencyContact,
        };

        await createLease(newLease);
        onClose();
        setNewLeaseForm(initialLeaseFormState);
      }
    } catch (error) {
      console.error("❌ Failed to create lease:", error);
      alert("Failed to create lease");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-secondary-900 bg-opacity-50"
          onClick={onClose}
        />
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-secondary-800 shadow-xl rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                  Create New Lease
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Generate a new lease agreement for a tenant and unit
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Tenant, Unit, Dates */}
            <div className="space-y-4">
              <div>
                <label className="label-field">
                  <User className="h-4 w-4 mr-2" />
                  Select Tenant
                </label>
                <select
                  className="input-field"
                  value={newLeaseForm.tenantId}
                  onChange={(e) =>
                    setNewLeaseForm({
                      ...newLeaseForm,
                      tenantId: e.target.value,
                    })
                  }
                >
                  <option value="">Select a tenant</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">
                  <Home className="h-4 w-4 mr-2" />
                  Select Unit
                </label>
                <select
                  className="input-field"
                  value={newLeaseForm.unitId}
                  onChange={(e) =>
                    setNewLeaseForm({
                      ...newLeaseForm,
                      unitId: e.target.value,
                    })
                  }
                >
                  <option value="">Select an available unit</option>
                  {availableUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.propertyName} - {unit.unitNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">
                    <Calendar className="h-4 w-4 mr-2" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={newLeaseForm.startDate}
                    onChange={(e) =>
                      setNewLeaseForm({
                        ...newLeaseForm,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="label-field">
                    <Calendar className="h-4 w-4 mr-2" />
                    End Date
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={newLeaseForm.endDate}
                    onChange={(e) =>
                      setNewLeaseForm({
                        ...newLeaseForm,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Monthly Rent
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="e.g., 1200"
                    value={newLeaseForm.monthlyRent}
                    onChange={(e) =>
                      setNewLeaseForm({
                        ...newLeaseForm,
                        monthlyRent: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="label-field">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Security Deposit
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="e.g., 1200"
                    value={newLeaseForm.securityDeposit}
                    onChange={(e) =>
                      setNewLeaseForm({
                        ...newLeaseForm,
                        securityDeposit: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Column 2: Lease Terms */}
            <div className="space-y-4">
              <div>
                <label className="label-field">Lease Type</label>
                <select
                  className="input-field"
                  value={newLeaseForm.leaseType}
                  onChange={(e) =>
                    setNewLeaseForm({
                      ...newLeaseForm,
                      leaseType: e.target.value as any,
                    })
                  }
                >
                  <option value="yearly">Yearly</option>
                  <option value="month_to_month">Month-to-Month</option>
                  <option value="fixed">Fixed Term</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Pet Policy</label>
                  <select
                    className="input-field"
                    value={newLeaseForm.petPolicy}
                    onChange={(e) =>
                      setNewLeaseForm({
                        ...newLeaseForm,
                        petPolicy: e.target.value as any,
                      })
                    }
                  >
                    <option value="no_pets">No Pets</option>
                    <option value="cats_allowed">Cats Allowed</option>
                    <option value="dogs_allowed">Dogs Allowed</option>
                    <option value="all_pets">All Pets Allowed</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Smoking Policy</label>
                  <select
                    className="input-field"
                    value={newLeaseForm.smokingPolicy}
                    onChange={(e) =>
                      setNewLeaseForm({
                        ...newLeaseForm,
                        smokingPolicy: e.target.value as any,
                      })
                    }
                  >
                    <option value="no_smoking">No Smoking</option>
                    <option value="smoking_allowed">Smoking Allowed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label-field">Special Terms</label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Include any additional clauses or terms..."
                  value={newLeaseForm.specialTerms}
                  onChange={(e) =>
                    setNewLeaseForm({
                      ...newLeaseForm,
                      specialTerms: e.target.value,
                    })
                  }
                ></textarea>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleCreateLease} className="btn-primary">
              Create Lease
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
