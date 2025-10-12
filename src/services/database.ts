import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  writeBatch 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Property, Unit, Tenant, Payment, Maintenance, User } from '../types';

// Collection names
const COLLECTIONS = {
  PROPERTIES: 'properties',
  UNITS: 'units', 
  TENANTS: 'tenants',
  PAYMENTS: 'payments',
  MAINTENANCE: 'maintenance',
  USERS: 'users'
} as const;

// Helper to filter data based on user role
function filterByUserAccess<T extends { propertyId?: string; id?: string }>(
  items: T[],
  user: User | null
): T[] {
  if (!user) return [];
  
  // Super admin sees everything
  if (user.role === 'super_admin') return items;
  
  // Regular admin only sees items from their assigned properties
  const userPropertyIds = user.propertyIds || [];
  
  // For properties list, filter by property id directly
  if (items.length > 0 && 'id' in items[0] && !('propertyId' in items[0])) {
    return items.filter(item => userPropertyIds.includes(item.id!));
  }
  
  // For other entities, filter by propertyId
  return items.filter(item => item.propertyId && userPropertyIds.includes(item.propertyId));
}

// Property operations
export const propertyService = {
  async create(propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.PROPERTIES), {
      ...propertyData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  },

  async getAll(user: User | null = null): Promise<Property[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.PROPERTIES), orderBy('name'))
    );
    const properties = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Property[];
    
    return filterByUserAccess(properties, user);
  },

  async getById(id: string): Promise<Property | null> {
    const docRef = doc(db, COLLECTIONS.PROPERTIES, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate()
    } as Property;
  },

  async update(id: string, updates: Partial<Property>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PROPERTIES, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PROPERTIES, id);
    await deleteDoc(docRef);
  }
};

// Unit operations
export const unitService = {
  async create(unitData: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.UNITS), {
      ...unitData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  },

  async getById(id: string): Promise<Unit | null> {
    const docRef = doc(db, COLLECTIONS.UNITS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Unit;
    }
    
    return null;
  },

  async getAll(user: User | null = null): Promise<Unit[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.UNITS), orderBy('propertyName'), orderBy('unitNumber'))
    );
    const units = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Unit[];
    
    return filterByUserAccess(units, user);
  },

  async getByPropertyId(propertyId: string): Promise<Unit[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.UNITS),
        where('propertyId', '==', propertyId),
        orderBy('unitNumber')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Unit[];
  },

  async getAvailableUnits(user: User | null = null): Promise<Unit[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.UNITS),
        where('status', '==', 'vacant'),
        orderBy('propertyName'),
        orderBy('unitNumber')
      )
    );
    const units = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Unit[];
    
    return filterByUserAccess(units, user);
  },

  async update(id: string, updates: Partial<Unit>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.UNITS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.UNITS, id);
    await deleteDoc(docRef);
  }
};

// Tenant operations
export const tenantService = {
  async create(tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const batch = writeBatch(db);
    
    // Create tenant
    const tenantRef = doc(collection(db, COLLECTIONS.TENANTS));
    batch.set(tenantRef, {
      ...tenantData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    // Update unit status if tenant is assigned to a unit
    if (tenantData.unitId) {
      const unitRef = doc(db, COLLECTIONS.UNITS, tenantData.unitId);
      batch.update(unitRef, {
        status: 'occupied',
        tenantName: tenantData.name,
        updatedAt: Timestamp.now()
      });
    }

    await batch.commit();
    return tenantRef.id;
  },

  async getAll(user: User | null = null): Promise<Tenant[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.TENANTS), orderBy('name'))
    );
    const tenants = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      leaseStartDate: doc.data().leaseStartDate?.toDate(),
      leaseEndDate: doc.data().leaseEndDate?.toDate()
    })) as Tenant[];
    
    return filterByUserAccess(tenants, user);
  },

  async getByUnitId(unitId: string): Promise<Tenant | null> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.TENANTS), where('unitId', '==', unitId))
    );
    
    if (querySnapshot.empty) return null;
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      leaseStartDate: doc.data().leaseStartDate?.toDate(),
      leaseEndDate: doc.data().leaseEndDate?.toDate()
    } as Tenant;
  },

  async update(id: string, updates: Partial<Tenant>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.TENANTS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.TENANTS, id);
    await deleteDoc(docRef);
  }
};

// Payment operations
export const paymentService = {
  async create(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.PAYMENTS), {
      ...paymentData,
      dueDate: Timestamp.fromDate(paymentData.dueDate),
      paidDate: paymentData.paidDate ? Timestamp.fromDate(paymentData.paidDate) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  },

  async getAll(user: User | null = null): Promise<Payment[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.PAYMENTS), orderBy('dueDate', 'desc'))
    );
    const payments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate?.toDate(),
      paidDate: doc.data().paidDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Payment[];
    
    return filterByUserAccess(payments, user);
  },

  async getByTenantId(tenantId: string): Promise<Payment[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.PAYMENTS),
        where('tenantId', '==', tenantId),
        orderBy('dueDate', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate?.toDate(),
      paidDate: doc.data().paidDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Payment[];
  },

  async getByPropertyId(propertyId: string): Promise<Payment[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.PAYMENTS),
        where('propertyId', '==', propertyId),
        orderBy('dueDate', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate?.toDate(),
      paidDate: doc.data().paidDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Payment[];
  },

  async update(id: string, updates: Partial<Payment>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PAYMENTS, id);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now()
    };

    if (updates.dueDate) {
      updateData.dueDate = Timestamp.fromDate(updates.dueDate);
    }
    if (updates.paidDate) {
      updateData.paidDate = Timestamp.fromDate(updates.paidDate);
    }

    await updateDoc(docRef, updateData);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PAYMENTS, id);
    await deleteDoc(docRef);
  }
};

// Maintenance operations
export const maintenanceService = {
  async create(maintenanceData: Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.MAINTENANCE), {
      ...maintenanceData,
      completedAt: maintenanceData.completedAt ? Timestamp.fromDate(maintenanceData.completedAt) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  },

  async getAll(user: User | null = null): Promise<Maintenance[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.MAINTENANCE), orderBy('createdAt', 'desc'))
    );
    const maintenance = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      completedAt: doc.data().completedAt?.toDate()
    })) as Maintenance[];
    
    return filterByUserAccess(maintenance, user);
  },

  async getByPropertyId(propertyId: string): Promise<Maintenance[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.MAINTENANCE),
        where('propertyId', '==', propertyId),
        orderBy('createdAt', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      completedAt: doc.data().completedAt?.toDate()
    })) as Maintenance[];
  },

  async update(id: string, updates: Partial<Maintenance>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.MAINTENANCE, id);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now()
    };

    if (updates.completedAt) {
      updateData.completedAt = Timestamp.fromDate(updates.completedAt);
    }

    await updateDoc(docRef, updateData);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.MAINTENANCE, id);
    await deleteDoc(docRef);
  }
};

// Utility functions
export const dbUtils = {
  // Generate monthly rent payments for all tenants
  async generateMonthlyPayments(month: number, year: number): Promise<void> {
    const tenants = await tenantService.getAll();
    const batch = writeBatch(db);

    for (const tenant of tenants) {
      if (tenant.rent && tenant.unitId) {
        const dueDate = new Date(year, month, 1); // First of the month
        const paymentRef = doc(collection(db, COLLECTIONS.PAYMENTS));
        
        batch.set(paymentRef, {
          tenantId: tenant.id,
          tenantName: tenant.name,
          unitId: tenant.unitId,
          unitNumber: tenant.unitNumber,
          propertyId: tenant.propertyId,
          propertyName: tenant.propertyName,
          amount: tenant.rent,
          type: 'rent',
          method: 'pending',
          status: 'pending',
          dueDate: Timestamp.fromDate(dueDate),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
    }

    await batch.commit();
  },

  // Get dashboard statistics
  async getDashboardStats(user: User | null = null) {
    const [properties, units, tenants, payments] = await Promise.all([
      propertyService.getAll(user),
      unitService.getAll(user),
      tenantService.getAll(user),
      paymentService.getAll(user)
    ]);

    const occupiedUnits = units.filter(unit => unit.status === 'occupied').length;
    const totalRevenue = tenants.reduce((sum, tenant) => sum + (tenant.rent || 0), 0);
    const thisMonthPayments = payments.filter(payment => {
      const paymentMonth = payment.dueDate.getMonth();
      const currentMonth = new Date().getMonth();
      return paymentMonth === currentMonth && payment.status === 'paid';
    });
    const collectedThisMonth = thisMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);

    return {
      totalProperties: properties.length,
      totalUnits: units.length,
      occupiedUnits,
      totalTenants: tenants.length,
      totalRevenue,
      collectedThisMonth,
      occupancyRate: units.length > 0 ? Math.round((occupiedUnits / units.length) * 100) : 0,
      collectionRate: totalRevenue > 0 ? Math.round((collectedThisMonth / totalRevenue) * 100) : 0
    };
  }
};

// User management operations (Super admin only)
export const userService = {
  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  },

  async getAll(): Promise<User[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.USERS), orderBy('name'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as User[];
  },

  async getById(id: string): Promise<User | null> {
    const docRef = doc(db, COLLECTIONS.USERS, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate()
    } as User;
  },

  async update(id: string, updates: Partial<User>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USERS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USERS, id);
    await deleteDoc(docRef);
  },

  async assignProperties(userId: string, propertyIds: string[]): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, {
      propertyIds,
      updatedAt: Timestamp.now()
    });
  }
}; 