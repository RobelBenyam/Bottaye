import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { leaseService, propertyService } from "../services/database";
import { Lease } from "../types";
import { useAuthStore } from "../stores/authStore";

// Generic hook for async operations
function useAsyncOperation<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (operation: () => Promise<T>, successMessage?: string): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      if (successMessage) {
        toast.success(successMessage);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}

export function useLeases(filter?: { tenantId?: string; unitId?: string; propertyId?: string }) {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const { execute, loading: operationLoading } = useAsyncOperation<string | void>();
  const { user } = useAuthStore();

  const fetchLeases = async () => {
    setLoading(true);
    try {
      let data: Lease[] = [];
      
      if (filter?.tenantId) {
        data = await leaseService.getByTenantId(filter.tenantId);
      } else if (filter?.unitId) {
        data = await leaseService.getByUnitId(filter.unitId);
      } else if (filter?.propertyId) {
        data = await leaseService.getByPropertyId(filter.propertyId);
      } else if (user) {
        const userProperties = await propertyService.getByUserId(user.id);
        
        if (userProperties.length > 0) {
          // Get property IDs
          const propertyIds = userProperties.map(property => property.id);
          
          // Fetch leases for these properties
          data = await leaseService.getByPropertyIds(propertyIds);
        } else {
          data = [];
        }
      } else {
        data = [];
      }
      
      setLeases(data);
    } catch (error) {
      console.error("❌ Failed to fetch leases:", error);
      toast.error("Failed to fetch leases");
      setLeases([]);
    } finally {
      setLoading(false);
    }
  };

  const createLease = async (leaseData: Omit<Lease, "id" | "createdAt" | "updatedAt">) => {
    const id = await execute(
      () => leaseService.create(leaseData),
      "Lease created successfully"
    );
    if (id) {
      fetchLeases(); // Refresh list
    }
    return id;
  };

  const updateLease = async (id: string, updates: Partial<Lease>) => {
    await execute(
      () => leaseService.update(id, updates),
      "Lease updated successfully"
    );
    fetchLeases(); 
  };

  const deleteLease = async (id: string) => {
    await execute(
      () => leaseService.delete(id),
      "Lease deleted successfully"
    );
    fetchLeases(); 
  };

  const renewLease = async (leaseId: string, newEndDate: Date, specialTerms?: string) => {
    await execute(
      () => leaseService.renewLease(leaseId, newEndDate, specialTerms),
      "Lease renewed successfully"
    );
    fetchLeases();
  };

  useEffect(() => {
    fetchLeases();
  }, [user?.id, filter?.tenantId, filter?.unitId, filter?.propertyId]);

  return {
    leases,
    loading,
    operationLoading,
    createLease,
    updateLease,
    deleteLease,
    renewLease,
    refetch: fetchLeases
  };
}