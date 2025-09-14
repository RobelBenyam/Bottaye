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
import { useAuthStore } from "@/stores/authStore";

// Units hook
export function useUnits(propertyId?: string) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const { execute, loading: operationLoading } = useAsyncOperation<
    string | void
  >();
  const { user } = useAuthStore();

  const fetchUnits = async () => {
    setLoading(true);
    try {
      // Fetch all required data in parallel
      const [propertiesData, unitsData, tenantsData] = await Promise.all([
        propertyService.getAll(),
        unitService.getAll(),
        tenantService.getAll(),
      ]);

      let filteredPropertyIds = propertiesData.map((property) => property.id);

      if (propertyId && filteredPropertyIds.includes(propertyId)) {
        filteredPropertyIds = [propertyId];
      } else if (propertyId) {
        filteredPropertyIds = [];
      }

      const filteredUnits = unitsData.filter((unit) =>
        filteredPropertyIds.includes(unit.propertyId)
      );
      const unitIds = filteredUnits.map((unit) => unit.id);
      const filteredTenants = tenantsData.filter(
        (tenant) => tenant.unitId && unitIds.includes(tenant.unitId)
      );
      setTenants(filteredTenants);
      setProperties(propertiesData);
      setUnits(filteredUnits);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch units");
    } finally {
      setLoading(false);
    }
  };

  const createUnit = async (
    unitData: Omit<Unit, "id" | "createdAt" | "updatedAt">
  ) => {
    const id = await execute(
      () => unitService.create(unitData),
      "Unit created successfully"
    );
    if (id) {
      fetchUnits(); // Refresh list
    }
    return id;
  };

  const updateUnit = async (id: string, updates: Partial<Unit>) => {
    await execute(
      () => unitService.update(id, updates),
      "Unit updated successfully"
    );
    fetchUnits(); // Refresh list
  };

  const deleteUnit = async (id: string) => {
    await execute(() => unitService.delete(id), "Unit deleted successfully");
    fetchUnits(); // Refresh list
  };

  useEffect(() => {
    fetchUnits();
  }, [propertyId]);

  return {
    units,
    properties,
    tenants,
    loading,
    operationLoading,
    createUnit,
    updateUnit,
    deleteUnit,
    refetch: fetchUnits,
  };
}

// Available units hook (for tenant assignment)
export function useAvailableUnits() {
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAvailableUnits = async () => {
    setLoading(true);
    try {
      const data = await unitService.getAvailableUnits();
      setAvailableUnits(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch available units");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableUnits();
  }, []);

  return {
    availableUnits,
    loading,
    refetch: fetchAvailableUnits,
  };
}
function useAsyncOperation<T>(): { execute: any; loading: any } {
  return { execute: null, loading: null };
}

export function useUnitsForUser() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const fetchUnits = async () => {
    if (!user) {
      setUnits([]);
      setLoading(false);
      return;
    }

    try {
      const userProperties = await propertyService.getByUserId(user.id);
      const propertyIds = userProperties.map((p) => p.id);

      if (propertyIds.length > 0) {
        const filteredUnits = await unitService.getByPropertyIds(propertyIds);
        setUnits(filteredUnits);
      } else {
        setUnits([]);
      }
    } catch (error) {
      console.error("Failed to fetch user's units:", error);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [user?.id]);

  return { units, loading, refetch: fetchUnits };
}
