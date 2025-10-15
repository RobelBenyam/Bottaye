import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  // propertyService,
  // unitService,
  // tenantService,
  paymentService,
  // maintenanceService,
  // dbUtils,
} from "../services/database";
import { Payment } from "../types";

// Payments hook
export function usePayments(filter?: {
  tenantId?: string;
  propertyId?: string;
}) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { execute, loading: operationLoading } = useAsyncOperation<
    string | void
  >();

  const fetchPayments = async () => {
    setLoading(true);
    console.log("fetching payments with filter:", filter);
    try {
      let data: Payment[];
      if (filter?.tenantId) {
        data = await paymentService.getByTenantId(filter.tenantId);
      } else if (filter?.propertyId) {
        data = await paymentService.getByPropertyId(filter.propertyId);
      } else {
        data = await paymentService.getAll();
      }
      setPayments(data);
    } catch (error) {
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (
    paymentData: Omit<Payment, "id" | "createdAt" | "updatedAt">
  ) => {
    const id = await execute(
      () => paymentService.create(paymentData),
      "Payment recorded successfully"
    );
    if (id) {
      fetchPayments(); // Refresh list
    }
    return id;
  };

  const updatePayment = async (id: string, updates: Partial<Payment>) => {
    await execute(
      () => paymentService.update(id, updates),
      "Payment updated successfully"
    );
    fetchPayments(); // Refresh list
  };

  const deletePayment = async (id: string) => {
    await execute(
      () => paymentService.delete(id),
      "Payment deleted successfully"
    );
    fetchPayments(); // Refresh list
  };

  useEffect(() => {
    fetchPayments();
  }, [filter?.tenantId, filter?.propertyId]);

  return {
    payments,
    loading,
    operationLoading,
    createPayment,
    updatePayment,
    deletePayment,
    refetch: fetchPayments,
  };
}
function useAsyncOperation<_T>(): { execute: any; loading: any } {
  return { execute: null, loading: null };
}
