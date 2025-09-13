import { useState } from "react";
import { X, FileText, Calendar, DollarSign } from "lucide-react";
import { Lease } from "../../types";

interface EditLeaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  lease: Lease | null;
  updateLease: (id: string, updates: Partial<Lease>) => Promise<void>;
}

export default function EditLeaseModal({
  isOpen,
  onClose,
  lease,
  updateLease,
}: EditLeaseModalProps) {
  const [formData, setFormData] = useState<Partial<Lease>>({});

  useState(() => {
    if (lease) {
      setFormData({
        ...lease,
        startDate: lease.startDate ? new Date(lease.startDate) : undefined,
        endDate: lease.endDate ? new Date(lease.endDate) : undefined,
      });
    }
  });

  const handleUpdate = async () => {
    if (!lease) return;

    const updatedData: Partial<Lease> = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
    };

    await updateLease(lease.id, updatedData);
    onClose();
  };

  if (!isOpen || !lease) return null;

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
                  Edit Lease
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Update details for the lease agreement
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">
                    <Calendar className="h-4 w-4 mr-2" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={
                      formData.startDate instanceof Date
                        ? formData.startDate.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startDate: new Date(e.target.value),
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
                    value={
                      formData.endDate instanceof Date
                        ? formData.endDate.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        endDate: new Date(e.target.value),
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
                    value={formData.monthlyRent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyRent: Number(e.target.value),
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
                    value={formData.securityDeposit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        securityDeposit: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label-field">Lease Type</label>
                <select
                  className="input-field"
                  value={formData.leaseType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      leaseType: e.target.value as any,
                    })
                  }
                >
                  <option value="yearly">Yearly</option>
                  <option value="month_to_month">Month-to-Month</option>
                  <option value="fixed">Fixed Term</option>
                </select>
              </div>
              <div>
                <label className="label-field">Special Terms</label>
                <textarea
                  className="input-field"
                  rows={4}
                  value={formData.specialTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, specialTerms: e.target.value })
                  }
                ></textarea>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleUpdate} className="btn-primary">
              Update Lease
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
