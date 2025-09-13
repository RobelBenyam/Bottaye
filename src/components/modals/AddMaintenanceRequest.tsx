import React, { useState, useEffect } from "react";
import { Wrench, X } from "lucide-react";
import { NewMaintenanceForm, Property, Unit, Tenant } from "@/types";

const getTodayISOString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const initialFormState: NewMaintenanceForm = {
  propertyId: "",
  unitId: "",
  tenantId: "",
  title: "",
  requestType: "other",
  description: "",
  priority: "medium",
  reportedDate: getTodayISOString(),
  scheduledDate: "",
  completedDate: "",
  assignedTo: "",
  estimatedCost: "",
  actualCost: "",
};

interface AddMaintenanceRequestProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  properties: Property[];
  units: Unit[];
  tenants: Tenant[];
  onCreateRequest: (form: NewMaintenanceForm) => Promise<void>;
}

export default function AddMaintenanceRequest({
  isOpen,
  setIsOpen,
  properties,
  units,
  tenants,
  onCreateRequest,
}: AddMaintenanceRequestProps) {
  const [form, setForm] = useState<NewMaintenanceForm>(initialFormState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(initialFormState);
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propertyId = e.target.value;
    setForm((prev) => ({
      ...prev,
      propertyId,
      unitId: "",
      tenantId: "",
    }));
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unitId = e.target.value;
    setForm((prev) => ({
      ...prev,
      unitId,
      tenantId: "",
    }));
  };

  const handleSubmit = async () => {
    const requiredFields: (keyof NewMaintenanceForm)[] = [
      "propertyId",
      "unitId",
      "tenantId",
      "title",
      "description",
      "requestType",
      "reportedDate",
    ];

    const missingField = requiredFields.find((field) => !form[field]);

    if (missingField) {
      alert(
        `Please fill out all required fields. The '${missingField}' field is missing.`
      );
      return;
    }

    setLoading(true);
    try {
      await onCreateRequest(form);
      // The parent component is responsible for closing the modal on success
    } catch (err) {
      console.error(err);
      alert("Failed to create the maintenance request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                New Maintenance Request
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Fill in the details to create a new maintenance task.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Row 1: Property, Unit, Tenant */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label-field">Property *</label>
              <select
                className="input-field"
                value={form.propertyId}
                onChange={handlePropertyChange}
                name="propertyId"
              >
                <option value="">Select property</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Unit *</label>
              <select
                className="input-field"
                value={form.unitId}
                onChange={handleUnitChange}
                name="unitId"
                disabled={!form.propertyId}
              >
                <option value="">Select unit</option>
                {units
                  .filter((u) => u.propertyId === form.propertyId)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      Unit {u.unitNumber}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="label-field">Tenant *</label>
              <select
                className="input-field"
                value={form.tenantId}
                onChange={handleChange}
                name="tenantId"
                disabled={!form.unitId}
              >
                <option value="">Select tenant</option>
                {tenants
                  .filter((t) => t.unitId === form.unitId)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Row 2: Title */}
          <div>
            <label className="label-field">Title *</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., Leaking Kitchen Faucet"
              name="title"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          {/* Row 3: Type & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Request Type *</label>
              <select
                className="input-field"
                name="requestType"
                value={form.requestType}
                onChange={handleChange}
              >
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="appliance">Appliance Repair</option>
                <option value="cleaning">Cleaning</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label-field">Priority</label>
              <select
                className="input-field"
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Row 4: Description */}
          <div>
            <label className="label-field">Description *</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Describe the problem in detail..."
              name="description"
              value={form.description}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Row 5: Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label-field">Reported Date *</label>
              <input
                type="date"
                className="input-field"
                name="reportedDate"
                value={form.reportedDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label-field">Scheduled Date</label>
              <input
                type="date"
                className="input-field"
                name="scheduledDate"
                value={form.scheduledDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label-field">Completed Date</label>
              <input
                type="date"
                className="input-field"
                name="completedDate"
                value={form.completedDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 6: Assignment & Costs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label-field">Assigned To</label>
              <input
                type="text"
                className="input-field"
                placeholder="Name of vendor/staff"
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label-field">Estimated Cost (KES)</label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g., 5000"
                min={0}
                name="estimatedCost"
                value={form.estimatedCost}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label-field">Actual Cost (KES)</label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g., 4500"
                min={0}
                name="actualCost"
                value={form.actualCost}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-6 mt-auto border-t border-gray-200 dark:border-gray-600">
          <button
            className="flex-1 btn-secondary"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="flex-1 btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Create Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
