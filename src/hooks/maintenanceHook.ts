import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  propertyService,
  unitService,
  tenantService,
  paymentService,
  maintenanceService,
  dbUtils,
} from "../services/database";
import { Property, Unit, Tenant, Payment, Maintenance } from "../types";

// Maintenance hook
export function useMaintenance(propertyId?: string) {
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const { execute, loading: operationLoading } = useAsyncOperation<
    string | void
  >();

  const fetchMaintenance = async () => {
    setLoading(true);
    try {
      const data = propertyId
        ? await maintenanceService.getByPropertyId(propertyId)
        : await maintenanceService.getAll();
      setMaintenance(data);
    } catch (error) {
      toast.error("Failed to fetch maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  const createMaintenance = async (
    maintenanceData: Omit<Maintenance, "id" | "createdAt" | "updatedAt">
  ) => {
    const id = await execute(
      () => maintenanceService.create(maintenanceData),
      "Maintenance request created successfully"
    );
    if (id) {
      fetchMaintenance(); // Refresh list
    }
    return id;
  };

  const updateMaintenance = async (
    id: string,
    updates: Partial<Maintenance>
  ) => {
    await execute(
      () => maintenanceService.update(id, updates),
      "Maintenance request updated successfully"
    );
    fetchMaintenance(); // Refresh list
  };

  const deleteMaintenance = async (id: string) => {
    await execute(
      () => maintenanceService.delete(id),
      "Maintenance request deleted successfully"
    );
    fetchMaintenance(); // Refresh list
  };

  useEffect(() => {
    fetchMaintenance();
  }, [propertyId]);

  return {
    maintenance,
    loading,
    operationLoading,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
    refetch: fetchMaintenance,
  };
}
function useAsyncOperation<T>(): { execute: any; loading: any } {
  return { execute: null, loading: null };
}
