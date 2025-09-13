// Temporary localStorage service for development (before Firebase is ready)
import { Property, Unit, Tenant, Payment, Maintenance, Lease } from '../types';

const STORAGE_KEYS = {
  PROPERTIES: 'bottaye_properties',
  UNITS: 'bottaye_units',
  TENANTS: 'bottaye_tenants',
  PAYMENTS: 'bottaye_payments',
  MAINTENANCE: 'bottaye_maintenance',
  LEASES: 'bottaye_leases'
} as const;

// Generate unique ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Generic localStorage operations
function getFromStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Property operations (fallback)
export const localPropertyService = {
  async create(propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const properties = getFromStorage<Property>(STORAGE_KEYS.PROPERTIES);
    const newProperty: Property = {
      ...propertyData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    properties.push(newProperty);
    saveToStorage(STORAGE_KEYS.PROPERTIES, properties);
    return newProperty.id;
  },

  async getAll(): Promise<Property[]> {
    return getFromStorage<Property>(STORAGE_KEYS.PROPERTIES);
  },

  async getById(id: string): Promise<Property | null> {
    const properties = getFromStorage<Property>(STORAGE_KEYS.PROPERTIES);
    return properties.find(p => p.id === id) || null;
  },

  async update(id: string, updates: Partial<Property>): Promise<void> {
    const properties = getFromStorage<Property>(STORAGE_KEYS.PROPERTIES);
    const index = properties.findIndex(p => p.id === id);
    if (index !== -1) {
      properties[index] = { ...properties[index], ...updates, updatedAt: new Date() };
      saveToStorage(STORAGE_KEYS.PROPERTIES, properties);
    }
  },

  async delete(id: string): Promise<void> {
    const properties = getFromStorage<Property>(STORAGE_KEYS.PROPERTIES);
    const filtered = properties.filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.PROPERTIES, filtered);
  }
};

// Unit operations (fallback)
export const localUnitService = {
  async getById(id: string): Promise<Unit | null> {
    const units = getFromStorage<Unit>(STORAGE_KEYS.UNITS);
    return units.find(unit => unit.id === id) || null;
  },

  async create(unitData: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const units = getFromStorage<Unit>(STORAGE_KEYS.UNITS);
    const newUnit: Unit = {
      ...unitData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    units.push(newUnit);
    saveToStorage(STORAGE_KEYS.UNITS, units);
    return newUnit.id;
  },

  async getAll(): Promise<Unit[]> {
    return getFromStorage<Unit>(STORAGE_KEYS.UNITS);
  },

  async getByPropertyId(propertyId: string): Promise<Unit[]> {
    const units = getFromStorage<Unit>(STORAGE_KEYS.UNITS);
    return units.filter(u => u.propertyId === propertyId);
  },

  async getAvailableUnits(): Promise<Unit[]> {
    const units = getFromStorage<Unit>(STORAGE_KEYS.UNITS);
    return units.filter(u => u.status === 'vacant');
  },

  async update(id: string, updates: Partial<Unit>): Promise<void> {
    const units = getFromStorage<Unit>(STORAGE_KEYS.UNITS);
    const index = units.findIndex(u => u.id === id);
    if (index !== -1) {
      units[index] = { ...units[index], ...updates, updatedAt: new Date() };
      saveToStorage(STORAGE_KEYS.UNITS, units);
    }
  },

  async delete(id: string): Promise<void> {
    const units = getFromStorage<Unit>(STORAGE_KEYS.UNITS);
    const filtered = units.filter(u => u.id !== id);
    saveToStorage(STORAGE_KEYS.UNITS, filtered);
  }
};

// Local tenants (fallback)
// Local leases (fallback)

export const localLeaseService = {
  async create(leaseData: Omit<Lease, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const leases = getFromStorage<Lease>(STORAGE_KEYS.LEASES);
    const newLease: Lease = {
      ...leaseData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    leases.push(newLease);
    saveToStorage(STORAGE_KEYS.LEASES, leases);
    
    // Update unit status to occupied
    if (leaseData.unitId) {
      await localUnitService.update(leaseData.unitId, {
        status: 'occupied',
        tenantId: leaseData.tenantId,
        tenantName: leaseData.tenantName,
      } as any);
    }
    
    return newLease.id;
  },

  async getAll(): Promise<Lease[]> {
    return getFromStorage<Lease>(STORAGE_KEYS.LEASES);
  },

  async getById(id: string): Promise<Lease | null> {
    const leases = getFromStorage<Lease>(STORAGE_KEYS.LEASES);
    return leases.find(l => l.id === id) || null;
  },

  async getByTenantId(tenantId: string): Promise<Lease[]> {
    const leases = getFromStorage<Lease>(STORAGE_KEYS.LEASES);
    return leases.filter(l => l.tenantId === tenantId);
  },

  async getByUnitId(unitId: string): Promise<Lease[]> {
    const leases = getFromStorage<Lease>(STORAGE_KEYS.LEASES);
    return leases.filter(l => l.unitId === unitId);
  },

  async update(id: string, updates: Partial<Lease>): Promise<void> {
    const leases = getFromStorage<Lease>(STORAGE_KEYS.LEASES);
    const index = leases.findIndex(l => l.id === id);
    if (index !== -1) {
      leases[index] = { ...leases[index], ...updates, updatedAt: new Date() };
      saveToStorage(STORAGE_KEYS.LEASES, leases);
    }
  },

  async delete(id: string): Promise<void> {
    const leases = getFromStorage<Lease>(STORAGE_KEYS.LEASES);
    const filtered = leases.filter(l => l.id !== id);
    saveToStorage(STORAGE_KEYS.LEASES, filtered);
  },

  async renewLease(leaseId: string, newEndDate: Date, specialTerms?: string): Promise<void> {
    const leases = getFromStorage<Lease>(STORAGE_KEYS.LEASES);
    const index = leases.findIndex(l => l.id === leaseId);
    if (index !== -1) {
      leases[index] = {
        ...leases[index],
        endDate: newEndDate,
        lastRenewalDate: new Date(),
        status: "active",
        specialTerms: specialTerms || leases[index].specialTerms,
        updatedAt: new Date()
      };
      saveToStorage(STORAGE_KEYS.LEASES, leases);
    }
  }
};

export const localTenantService = {
  async create(tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const tenants = getFromStorage<Tenant>(STORAGE_KEYS.TENANTS);
    const newTenant: Tenant = {
      ...tenantData as any,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    tenants.push(newTenant);
    saveToStorage(STORAGE_KEYS.TENANTS, tenants);
    // Also update unit occupancy locally
    if ((tenantData as any).unitId) {
      await localUnitService.update((tenantData as any).unitId, {
        status: 'occupied',
        tenantName: tenantData.name,
      } as any);
    }
    return newTenant.id;
  },

  async getAll(): Promise<Tenant[]> {
    return getFromStorage<Tenant>(STORAGE_KEYS.TENANTS);
  },

  async getByUnitId(unitId: string): Promise<Tenant | null> {
    const tenants = getFromStorage<Tenant>(STORAGE_KEYS.TENANTS);
    return tenants.find(t => (t as any).unitId === unitId) || null;
  },

  async update(id: string, updates: Partial<Tenant>): Promise<void> {
    const tenants = getFromStorage<Tenant>(STORAGE_KEYS.TENANTS);
    const index = tenants.findIndex(t => t.id === id);
    if (index !== -1) {
      tenants[index] = { ...tenants[index], ...updates, updatedAt: new Date() } as Tenant;
      saveToStorage(STORAGE_KEYS.TENANTS, tenants);
    }
  },

  async delete(id: string): Promise<void> {
    const tenants = getFromStorage<Tenant>(STORAGE_KEYS.TENANTS);
    const filtered = tenants.filter(t => t.id !== id);
    saveToStorage(STORAGE_KEYS.TENANTS, filtered);
  }
};

// Initialize with sample data
export const initializeSampleData = () => {
  const properties = getFromStorage<Property>(STORAGE_KEYS.PROPERTIES);
  
  if (properties.length === 0) {
    // Add sample properties
    const sampleProperties: Property[] = [
      {
        id: 'prop1',
        name: 'Kilimani Heights',
        address: 'Kilimani Road, Nairobi',
        type: 'residential',
        totalUnits: 24,
        managerId: 'user1',
        managerName: 'Admin User',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    saveToStorage(STORAGE_KEYS.PROPERTIES, sampleProperties);
    
    // Add sample units
    const sampleUnits: Unit[] = [
      {
        id: 'unit1',
        propertyId: 'prop1',
        propertyName: 'Kilimani Heights',
        unitNumber: '2A',
        type: '2_bedroom',
        rent: 45000,
        deposit: 90000,
        status: 'vacant',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    saveToStorage(STORAGE_KEYS.UNITS, sampleUnits);
    
    // Add sample tenants (first-run)
    const sampleTenants: any[] = [
      {
        id: 'tenant1',
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+254712345678',
        unitId: null,
        leaseStartDate: null,
        leaseEndDate: null,
        monthlyRent: 0,
        securityDeposit: 0,
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+254798765432',
          relationship: 'Sister'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'tenant2',
        name: 'Mary Smith',
        email: 'mary.smith@email.com',
        phone: '+254798765432',
        unitId: null,
        leaseStartDate: null,
        leaseEndDate: null,
        monthlyRent: 0,
        securityDeposit: 0,
        emergencyContact: {
          name: 'Peter Smith',
          phone: '+254712345678',
          relationship: 'Brother'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'tenant3',
        name: 'Alice Johnson',
        email: 'alice.johnson@email.com',
        phone: '+254734567890',
        unitId: null,
        leaseStartDate: null,
        leaseEndDate: null,
        monthlyRent: 0,
        securityDeposit: 0,
        emergencyContact: {
          name: 'Bob Johnson',
          phone: '+254756789012',
          relationship: 'Husband'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    saveToStorage(STORAGE_KEYS.TENANTS, sampleTenants);
  }

  // Ensure tenants exist even if properties were previously seeded
  const existingTenants = getFromStorage<Tenant>(STORAGE_KEYS.TENANTS);
  if (existingTenants.length === 0) {
    const sampleTenantsFallback: any[] = [
      {
        id: 'tenant1',
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+254712345678',
        unitId: null,
        leaseStartDate: null,
        leaseEndDate: null,
        monthlyRent: 0,
        securityDeposit: 0,
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+254798765432',
          relationship: 'Sister'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'tenant2',
        name: 'Mary Smith',
        email: 'mary.smith@email.com',
        phone: '+254798765432',
        unitId: null,
        leaseStartDate: null,
        leaseEndDate: null,
        monthlyRent: 0,
        securityDeposit: 0,
        emergencyContact: {
          name: 'Peter Smith',
          phone: '+254712345678',
          relationship: 'Brother'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'tenant3',
        name: 'Alice Johnson',
        email: 'alice.johnson@email.com',
        phone: '+254734567890',
        unitId: null,
        leaseStartDate: null,
        leaseEndDate: null,
        monthlyRent: 0,
        securityDeposit: 0,
        emergencyContact: {
          name: 'Bob Johnson',
          phone: '+254756789012',
          relationship: 'Husband'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    saveToStorage(STORAGE_KEYS.TENANTS, sampleTenantsFallback);
  }
}; 