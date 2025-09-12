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

// Units hook
export function useUnits(propertyId?: string) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const { execute, loading: operationLoading } = useAsyncOperation<
    string | void
  >();

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const data = propertyId
        ? await unitService.getByPropertyId(propertyId)
        : await unitService.getAll();
      setUnits(data);
    } catch (error) {
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
