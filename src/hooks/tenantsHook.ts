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

// Tenants hook
export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const { execute, loading: operationLoading } = useAsyncOperation<
    string | void
  >();

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const data = await tenantService.getAll();
      setTenants(data);
    } catch (error) {
      try {
        const { localTenantService } = await import("../services/localStorage");
        const localData = await localTenantService.getAll();
        setTenants(localData);
      } catch (e) {
        toast.error("Failed to fetch tenants");
      }
    } finally {
      setLoading(false);
    }
  };

  const createTenant = async (
    tenantData: Omit<Tenant, "id" | "createdAt" | "updatedAt">
  ) => {
    const id = await execute(
      () => tenantService.create(tenantData),
      "Tenant created successfully"
    );
    if (id) {
      fetchTenants(); // Refresh list
    }
    return id;
  };

  const updateTenant = async (id: string, updates: Partial<Tenant>) => {
    await execute(
      () => tenantService.update(id, updates),
      "Tenant updated successfully"
    );
    fetchTenants(); // Refresh list
  };

  const deleteTenant = async (id: string) => {
    await execute(
      () => tenantService.delete(id),
      "Tenant deleted successfully"
    );
    fetchTenants(); // Refresh list
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  return {
    tenants,
    loading,
    operationLoading,
    createTenant,
    updateTenant,
    deleteTenant,
    refetch: fetchTenants,
  };
}
function useAsyncOperation<T>(): { execute: any; loading: any } {
  return { execute: null, loading: null };
}
