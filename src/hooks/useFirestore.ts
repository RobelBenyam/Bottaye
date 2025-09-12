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

// Properties hook
export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { execute, loading: operationLoading } = useAsyncOperation<string | void>();

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await propertyService.getAll();
      setProperties(data);
    } catch (error) {
      toast.error('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const createProperty = async (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = await execute(
      () => propertyService.create(propertyData),
      'Property created successfully'
    );
    if (id) {
      fetchProperties(); // Refresh list
    }
    return id;
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    await execute(
      () => propertyService.update(id, updates),
      'Property updated successfully'
    );
    fetchProperties(); // Refresh list
  };

  const deleteProperty = async (id: string) => {
    await execute(
      () => propertyService.delete(id),
      'Property deleted successfully'
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
    refetch: fetchProperties
  };
}

// Units hook
export function useUnits(propertyId?: string) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const { execute, loading: operationLoading } = useAsyncOperation<string | void>();

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const data = propertyId 
        ? await unitService.getByPropertyId(propertyId)
        : await unitService.getAll();
      setUnits(data);
    } catch (error) {
      toast.error('Failed to fetch units');
    } finally {
      setLoading(false);
    }
  };

  const createUnit = async (unitData: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = await execute(
      () => unitService.create(unitData),
      'Unit created successfully'
    );
    if (id) {
      fetchUnits(); // Refresh list
    }
    return id;
  };

  const updateUnit = async (id: string, updates: Partial<Unit>) => {
    await execute(
      () => unitService.update(id, updates),
      'Unit updated successfully'
    );
    fetchUnits(); // Refresh list
  };

  const deleteUnit = async (id: string) => {
    await execute(
      () => unitService.delete(id),
      'Unit deleted successfully'
    );
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
    refetch: fetchUnits
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
      toast.error('Failed to fetch available units');
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
    refetch: fetchAvailableUnits
  };
}

// Tenants hook
export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const { execute, loading: operationLoading } = useAsyncOperation<string | void>();

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const data = await tenantService.getAll();
      setTenants(data);
    } catch (error) {
      try {
        const { localTenantService } = await import('../services/localStorage');
        const localData = await localTenantService.getAll();
        setTenants(localData);
      } catch (e) {
        toast.error('Failed to fetch tenants');
      }
    } finally {
      setLoading(false);
    }
  };

  const createTenant = async (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = await execute(
      () => tenantService.create(tenantData),
      'Tenant created successfully'
    );
    if (id) {
      fetchTenants(); // Refresh list
    }
    return id;
  };

  const updateTenant = async (id: string, updates: Partial<Tenant>) => {
    await execute(
      () => tenantService.update(id, updates),
      'Tenant updated successfully'
    );
    fetchTenants(); // Refresh list
  };

  const deleteTenant = async (id: string) => {
    await execute(
      () => tenantService.delete(id),
      'Tenant deleted successfully'
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
    refetch: fetchTenants
  };
}

// Payments hook
export function usePayments(filter?: { tenantId?: string; propertyId?: string }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { execute, loading: operationLoading } = useAsyncOperation<string | void>();

  const fetchPayments = async () => {
    setLoading(true);
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
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = await execute(
      () => paymentService.create(paymentData),
      'Payment recorded successfully'
    );
    if (id) {
      fetchPayments(); // Refresh list
    }
    return id;
  };

  const updatePayment = async (id: string, updates: Partial<Payment>) => {
    await execute(
      () => paymentService.update(id, updates),
      'Payment updated successfully'
    );
    fetchPayments(); // Refresh list
  };

  const deletePayment = async (id: string) => {
    await execute(
      () => paymentService.delete(id),
      'Payment deleted successfully'
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
    refetch: fetchPayments
  };
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

// Maintenance hook
export function useMaintenance(propertyId?: string) {
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const { execute, loading: operationLoading } = useAsyncOperation<string | void>();

  const fetchMaintenance = async () => {
    setLoading(true);
    try {
      const data = propertyId 
        ? await maintenanceService.getByPropertyId(propertyId)
        : await maintenanceService.getAll();
      setMaintenance(data);
    } catch (error) {
      toast.error('Failed to fetch maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  const createMaintenance = async (maintenanceData: Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = await execute(
      () => maintenanceService.create(maintenanceData),
      'Maintenance request created successfully'
    );
    if (id) {
      fetchMaintenance(); // Refresh list
    }
    return id;
  };

  const updateMaintenance = async (id: string, updates: Partial<Maintenance>) => {
    await execute(
      () => maintenanceService.update(id, updates),
      'Maintenance request updated successfully'
    );
    fetchMaintenance(); // Refresh list
  };

  const deleteMaintenance = async (id: string) => {
    await execute(
      () => maintenanceService.delete(id),
      'Maintenance request deleted successfully'
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
    refetch: fetchMaintenance
  };
} 