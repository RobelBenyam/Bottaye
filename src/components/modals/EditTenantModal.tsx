import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, User, Calendar, Home } from "lucide-react";
import LoadingSpinner from "../LoadingSpinner";

const tenantSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  idNumber: z.string().min(1, "ID number is required"),
  unitId: z.string().min(1, "Unit selection is required"),
  leaseStartDate: z.string().min(1, "Lease start date is required"),
  leaseEndDate: z.string().min(1, "Lease end date is required"),
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactPhone: z
    .string()
    .min(10, "Emergency contact phone is required"),
  emergencyContactRelationship: z.string().min(1, "Relationship is required"),
});

export type EditTenantForm = z.infer<typeof tenantSchema>;

interface EditTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: any;
  availableUnits: Array<{
    id: string;
    unitNumber: string;
    propertyName: string;
    rent: number;
  }>;
  onUpdate: (data: EditTenantForm) => Promise<void>;
  isLoading?: boolean;
}

export default function EditTenantModal({
  isOpen,
  onClose,
  tenant,
  availableUnits,
  onUpdate,
  isLoading,
}: EditTenantModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditTenantForm>({
    resolver: zodResolver(tenantSchema),
  });

  useEffect(() => {
    if (isOpen && tenant) {
      reset({
        name: tenant.name || "",
        email: tenant.email || "",
        phone: tenant.phone || "",
        idNumber: tenant.idNumber || "",
        unitId: tenant.unitId || "",
        leaseStartDate: tenant.leaseStartDate
          ? new Date(tenant.leaseStartDate).toISOString().slice(0, 10)
          : "",
        leaseEndDate: tenant.leaseEndDate
          ? new Date(tenant.leaseEndDate).toISOString().slice(0, 10)
          : "",
        emergencyContactName: tenant.emergencyContact?.name || "",
        emergencyContactPhone: tenant.emergencyContact?.phone || "",
        emergencyContactRelationship:
          tenant.emergencyContact?.relationship || "",
      });
    }
  }, [isOpen, tenant, reset]);

  const onSubmit = async (data: EditTenantForm) => {
    await onUpdate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
                Edit Tenant
              </h2>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Update tenant details and lease assignment
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

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className="input-field"
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">
                  ID Number
                </label>
                <input
                  type="text"
                  {...register("idNumber")}
                  className="input-field"
                  placeholder="12345678"
                />
                {errors.idNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.idNumber.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="input-field"
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  className="input-field"
                  placeholder="+254712345678"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Unit & Lease */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
              Unit Assignment & Lease
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">
                  Available Unit
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 h-4 w-4" />
                  <select {...register("unitId")} className="input-field pl-9">
                    <option value="">Select unit</option>
                    {availableUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.propertyName} - Unit {u.unitNumber} (
                        {u.rent.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.unitId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.unitId.message}
                  </p>
                )}
              </div>
              <div />
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">
                  Lease Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 h-4 w-4" />
                  <input
                    type="date"
                    {...register("leaseStartDate")}
                    className="input-field pl-9"
                  />
                </div>
                {errors.leaseStartDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.leaseStartDate.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">
                  Lease End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 h-4 w-4" />
                  <input
                    type="date"
                    {...register("leaseEndDate")}
                    className="input-field pl-9"
                  />
                </div>
                {errors.leaseEndDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.leaseEndDate.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register("emergencyContactName")}
                  className="input-field"
                />
                {errors.emergencyContactName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.emergencyContactName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register("emergencyContactPhone")}
                  className="input-field"
                />
                {errors.emergencyContactPhone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.emergencyContactPhone.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">
                  Relationship
                </label>
                <input
                  type="text"
                  {...register("emergencyContactRelationship")}
                  className="input-field"
                />
                {errors.emergencyContactRelationship && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.emergencyContactRelationship.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-6 border-t border-secondary-200 dark:border-secondary-600">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Updating...</span>
                </div>
              ) : (
                "Update Tenant"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
