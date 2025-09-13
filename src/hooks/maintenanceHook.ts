import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { maintenanceService } from "../services/database";
import { Maintenance } from "../types";

function useAsyncOperation<T>() {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (
      operation: () => Promise<T>,
      successMessage?: string
    ): Promise<T | null> => {
      setLoading(true);
      try {
        const result = await operation();
        if (successMessage) {
          toast.success(successMessage);
        }
        return result;
      } catch (error) {
        console.error("Operation failed:", error);
        toast.error(
          error instanceof Error ? error.message : "An unknown error occurred."
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { execute, loading };
}

/**
 * Custom hook to manage maintenance data for a given set of property IDs.
 * @param propertyIds - An array of property IDs to fetch maintenance requests for.
 */
export function useMaintenance(propertyIds?: string[]) {
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const { execute, loading: operationLoading } = useAsyncOperation<any>();

  const fetchMaintenance = useCallback(async () => {
    if (propertyIds === undefined) {
      return;
    }

    setLoading(true);
    try {
      let data: Maintenance[] = [];
      if (propertyIds.length === 0) {
        data = [];
      } else if (propertyIds.length === 1) {
        data = await maintenanceService.getByPropertyId(propertyIds[0]);
      } else {
        data = await maintenanceService.getByPropertyIds(propertyIds);
      }
      setMaintenance(data);
    } catch (error) {
      console.error("Failed to fetch maintenance requests:", error);
      toast.error("Failed to fetch maintenance requests.");
    } finally {
      setLoading(false);
    }
  }, [propertyIds]);

  useEffect(() => {
    fetchMaintenance();
  }, [fetchMaintenance]);

  /**
   * Creates a new maintenance request.
   */
  const createMaintenance = async (
    maintenanceData: Omit<
      Maintenance,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "propertyName"
      | "unitNumber"
      | "tenantName"
    >
  ) => {
    const id = await execute(
      () => maintenanceService.create(maintenanceData),
      "Maintenance request created successfully."
    );
    if (id) {
      await fetchMaintenance();
    }
    return id;
  };

  /**
   * Updates an existing maintenance request.
   */
  const updateMaintenance = async (
    id: string,
    updates: Partial<Maintenance>
  ) => {
    await execute(
      () => maintenanceService.update(id, updates),
      "Maintenance request updated successfully."
    );
    await fetchMaintenance();
  };

  /**
   * Deletes a maintenance request.
   */
  const deleteMaintenance = async (id: string) => {
    await execute(
      () => maintenanceService.delete(id),
      "Maintenance request deleted successfully."
    );
    setMaintenance((prev) => prev.filter((req) => req.id !== id));
    await fetchMaintenance();
  };

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
