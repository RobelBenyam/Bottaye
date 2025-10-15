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

// Properties hook
export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { execute, loading: operationLoading } = useAsyncOperation<
    string | void
  >();
  const { user } = useAuthStore();

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await propertyService.getAll();

      setProperties(data);
    } catch (error) {
      toast.error("Failed to fetch properties");
      console.log("err", error);
    } finally {
      setLoading(false);
    }
  };

  const createProperty = async (
    propertyData: Omit<Property, "id" | "createdAt" | "updatedAt">
  ) => {
    const id = await execute(
      () => propertyService.create(propertyData),
      "Property created successfully"
    );
    if (id) {
      fetchProperties(); // Refresh list
    }
    return id;
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    await execute(
      () => propertyService.update(id, updates),
      "Property updated successfully"
    );
    fetchProperties(); // Refresh list
  };

  const deleteProperty = async (id: string) => {
    await execute(
      () => propertyService.delete(id),
      "Property deleted successfully"
    );
    fetchProperties(); // Refresh list
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return {
    properties,
    loading,
    operationLoading,
    createProperty,
    updateProperty,
    deleteProperty,
    refetch: fetchProperties,
  };
}
function useAsyncOperation<T>(): { execute: any; loading: any } {
  return { execute: null, loading: null };
}
