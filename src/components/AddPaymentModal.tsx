import React, { useState } from "react";
import { X, CreditCard } from "lucide-react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useProperties } from "../hooks/propertiesHook";
import { useUnits } from "../hooks/unitsHook";
import { useTenants } from "../hooks/tenantsHook";

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentAdded?: () => void;
}

const paymentTypes = [
  { value: "rent", label: "Monthly Rent" },
  { value: "deposit", label: "Security Deposit" },
  { value: "late_fee", label: "Late Fee" },
  { value: "maintenance", label: "Maintenance" },
  { value: "utilities", label: "Utilities" },
];

const paymentMethods = [
  { value: "mpesa", label: "Mpesa" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
];

export default function AddPaymentModal({
  isOpen,
  onClose,
  onPaymentAdded,
}: AddPaymentModalProps) {
  const [form, setForm] = useState({
    tenantId: "",
    unitId: "",
    propertyId: "",
    amount: "",
    type: "rent",
    method: "mpesa",
    referenceNumber: "",
    dueDate: "",
    paidDate: "",
    status: "paid",
    notes: "",
  });
  const { properties } = useProperties();
  const { units } = useUnits(form.propertyId);
  const { tenants } = useTenants();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await addDoc(collection(db, "payments"), {
        ...form,
        amount: Number(form.amount),
        paidDate: form.paidDate || null,
        createdAt: new Date().toISOString(),
        propertyName:
          properties.find((p) => p.id === form.propertyId)?.name || "",
        unitNumber: units.find((u) => u.id === form.unitId)?.unitNumber || "",
        tenantName:
          tenants.find((t: any) => t.id === form.tenantId)?.name || "",
      });
      setLoading(false);
      if (onPaymentAdded) onPaymentAdded();
      onClose();
    } catch (err: any) {
      setError("Failed to add payment.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
                Record New Payment
              </h2>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Log a payment received from tenant
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
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Property</label>
              <select
                name="propertyId"
                value={form.propertyId}
                onChange={handleChange}
                required
                className="input-field w-full"
              >
                <option value="">Select Property</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select
                name="unitId"
                value={form.unitId}
                onChange={handleChange}
                required
                className="input-field w-full"
                disabled={!form.propertyId}
              >
                <option value="">Select Unit</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unitNumber} ({u.propertyName})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tenant</label>
              <select
                name="tenantId"
                value={form.tenantId}
                onChange={handleChange}
                required
                className="input-field w-full"
              >
                <option value="">Select Tenant</option>
                {tenants.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                name="amount"
                type="number"
                value={form.amount}
                onChange={handleChange}
                required
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="input-field w-full"
              >
                {paymentTypes.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Method</label>
              <select
                name="method"
                value={form.method}
                onChange={handleChange}
                className="input-field w-full"
              >
                {paymentMethods.map((pm) => (
                  <option key={pm.value} value={pm.value}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Reference Number
              </label>
              <input
                name="referenceNumber"
                value={form.referenceNumber}
                onChange={handleChange}
                required
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={handleChange}
                required
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Paid Date
              </label>
              <input
                name="paidDate"
                type="date"
                value={form.paidDate}
                onChange={handleChange}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="input-field w-full"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="partial">Partial</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="input-field w-full"
              rows={2}
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white rounded-lg px-4 py-2 flex items-center justify-center space-x-2 hover:bg-primary-700 transition-colors"
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v16a8 8 0 01-8-8z"
                />
              </svg>
            )}
            <span>Save Payment</span>
          </button>
        </form>
      </div>
    </div>
  );
}
