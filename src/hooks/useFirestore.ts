import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  propertyService, 
  unitService, 
  tenantService, 
  paymentService, 
  maintenanceService,
  dbUtils 
} from '../services/database';
import { Property, Unit, Tenant, Payment, Maintenance } from '../types';

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



// Dashboard stats hook
export function useDashboardStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await dbUtils.getDashboardStats();
      setStats(data);
    } catch (error) {
      toast.error('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    refetch: fetchStats
  };
}
