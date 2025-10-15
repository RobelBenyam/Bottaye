import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  propertyService,
  unitService,
  tenantService,
  // paymentService,
  // maintenanceService,
  // dbUtils,
} from "../services/database";
import { Tenant } from "../types";
import { useAuthStore } from "@/stores/authStore";

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
      const data = (await tenantService.getAll()) as Tenant[];
      const propertiesData = await propertyService.getAll();
      const unitsData = await unitService.getAll();

      // Filter tenants to only those belonging to the filtered properties
      const filteredPropertyIds = propertiesData.map((property) => property.id);
      //filter tenants to only those belonging to the filtered units

      const filteredUnitIds = unitsData
        .filter((unit) => filteredPropertyIds.includes(unit.propertyId))
        .map((unit) => unit.id);

      const filteredTenants = data.filter(
        (tenant) => tenant.unitId && filteredUnitIds.includes(tenant.unitId)
      );

      setTenants(filteredTenants);
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
function useAsyncOperation<_T>(): { execute: any; loading: any } {
  return { execute: null, loading: null };
}

export function useTenantsForUser() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const fetchTenants = async () => {
    if (!user) {
      setTenants([]);
      setLoading(false);
      console.log("no user");
      return;
    }
    console.log("yes user");

    try {
      // Get tenants for those units
      const allTenants = await tenantService.getAll();
      const filteredTenants = allTenants.filter(
        (_tenant) => true
        // tenant.unitId && unitIds.includes(tenant.unitId)
      );

      setTenants(filteredTenants);
    } catch (error) {
      console.error("Failed to fetch user's tenants:", error);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [user?.id]);

  return { tenants, loading, refetch: fetchTenants };
}
