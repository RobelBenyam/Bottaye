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
  writeBatch,
  WhereFilterOp, // Add this import
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Property, Unit, Tenant, Payment, Maintenance, Lease } from "../types";

// Collection names
const COLLECTIONS = {
  PROPERTIES: "properties",
  UNITS: "units",
  TENANTS: "tenants",
  PAYMENTS: "payments",
  MAINTENANCE: "maintenance",
  USERS: "users",
  LEASES: "leases",
} as const;

// Property operations
export const propertyService = {
  async create(
    propertyData: Omit<Property, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.PROPERTIES), {
      ...propertyData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getAll(): Promise<Property[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.PROPERTIES))
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Property[];
  },

  async getById(id: string): Promise<Property | null> {
    const docRef = doc(db, COLLECTIONS.PROPERTIES, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    } as Property;
  },

  async update(id: string, updates: Partial<Property>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PROPERTIES, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PROPERTIES, id);
    await deleteDoc(docRef);
  },

  getByUserId: async (userId: string) => {
    // Query Firestore for properties where managerId equals userId
    const properties = await dbUtils.getCollectionWhere('properties', 'managerId', '==', userId);
    return properties;
  },
};

// Unit operations
export const unitService = {
  async create(
    unitData: Omit<Unit, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.UNITS), {
      ...unitData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
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

  async getAll(): Promise<Unit[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.UNITS),
        orderBy("propertyName"),
        orderBy("unitNumber")
      )
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Unit[];
  },

  async getByPropertyId(propertyId: string): Promise<Unit[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.UNITS),
        where("propertyId", "==", propertyId),
        orderBy("unitNumber")
      )
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Unit[];
  },

  async getAvailableUnits(): Promise<Unit[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.UNITS),
        where("status", "==", "vacant"),
        orderBy("propertyName"),
        orderBy("unitNumber")
      )
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Unit[];
  },

  async update(id: string, updates: Partial<Unit>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.UNITS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.UNITS, id);
    await deleteDoc(docRef);
  },

  getByPropertyIds: async (propertyIds: string[]): Promise<Unit[]> => {
    if (propertyIds.length === 0) return [];
    
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.UNITS),
        where("propertyId", "in", propertyIds),
        orderBy("propertyName"),
        orderBy("unitNumber")
      )
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Unit[];
  },
};

// Tenant operations
export const tenantService = {
  async create(
    tenantData: Omit<Tenant, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    console.log("Creating tenant with data:", tenantData);
    const batch = writeBatch(db);

    // Create tenant
    const tenantRef = doc(collection(db, COLLECTIONS.TENANTS));
    batch.set(tenantRef, {
      ...tenantData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Update unit status if tenant is assigned to a unit
    if (tenantData.unitId) {
      const unitRef = doc(db, COLLECTIONS.UNITS, tenantData.unitId);
      batch.update(unitRef, {
        status: "occupied",
        tenantName: tenantData.name,
        updatedAt: Timestamp.now(),
      });
    }

    try {
      await batch.commit();
      console.log("Tenant created with ID:", tenantRef.id);
      return tenantRef.id;
    } catch (error) {
      console.error("Error creating tenant:", error);
      throw error;
    }
  },

  async getAll(): Promise<Tenant[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.TENANTS), orderBy("name"))
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      leaseStartDate: doc.data().leaseStartDate?.toDate(),
      leaseEndDate: doc.data().leaseEndDate?.toDate(),
    })) as Tenant[];
  },

  async getByUnitId(unitId: string): Promise<Tenant | null> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.TENANTS), where("unitId", "==", unitId))
    );

    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      leaseStartDate: doc.data().leaseStartDate?.toDate(),
      leaseEndDate: doc.data().leaseEndDate?.toDate(),
    } as Tenant;
  },

  async update(id: string, updates: Partial<Tenant>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.TENANTS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.TENANTS, id);
    await deleteDoc(docRef);
  },
};

// Payment operations
export const paymentService = {
  async create(
    paymentData: Omit<Payment, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.PAYMENTS), {
      ...paymentData,
      dueDate: Timestamp.fromDate(paymentData.dueDate),
      paidDate: paymentData.paidDate
        ? Timestamp.fromDate(paymentData.paidDate)
        : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getAll(): Promise<Payment[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.PAYMENTS), orderBy("dueDate", "desc"))
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate?.toDate(),
      paidDate: doc.data().paidDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Payment[];
  },

  async getByTenantId(tenantId: string): Promise<Payment[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.PAYMENTS),
        where("tenantId", "==", tenantId),
        orderBy("dueDate", "desc")
      )
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate?.toDate(),
      paidDate: doc.data().paidDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Payment[];
  },

  async getByPropertyId(propertyId: string): Promise<Payment[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.PAYMENTS),
        where("propertyId", "==", propertyId),
        orderBy("dueDate", "desc")
      )
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate?.toDate(),
      paidDate: doc.data().paidDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Payment[];
  },

  async update(id: string, updates: Partial<Payment>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PAYMENTS, id);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
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
  },
};

// Maintenance operations
export const maintenanceService = {
  async create(
    maintenanceData: Omit<Maintenance, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.MAINTENANCE), {
      ...maintenanceData,
      completedAt: maintenanceData.completedAt
        ? Timestamp.fromDate(maintenanceData.completedAt)
        : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getAll(): Promise<Maintenance[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.MAINTENANCE),
        orderBy("createdAt", "desc")
      )
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      completedAt: doc.data().completedAt?.toDate(),
    })) as Maintenance[];
  },

  async getByPropertyId(propertyId: string): Promise<Maintenance[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.MAINTENANCE),
        where("propertyId", "==", propertyId),
        orderBy("createdAt", "desc")
      )
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      completedAt: doc.data().completedAt?.toDate(),
    })) as Maintenance[];
  },

  async update(id: string, updates: Partial<Maintenance>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.MAINTENANCE, id);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    if (updates.completedAt) {
      updateData.completedAt = Timestamp.fromDate(updates.completedAt);
    }

    await updateDoc(docRef, updateData);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.MAINTENANCE, id);
    await deleteDoc(docRef);
  },
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
          type: "rent",
          method: "pending",
          status: "pending",
          dueDate: Timestamp.fromDate(dueDate),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }
    }

    await batch.commit();
  },

  // Get dashboard statistics
  async getDashboardStats() {
    const [properties, units, tenants, payments] = await Promise.all([
      propertyService.getAll(),
      unitService.getAll(),
      tenantService.getAll(),
      paymentService.getAll(),
    ]);

    const occupiedUnits = units.filter(
      (unit) => unit.status === "occupied"
    ).length;
    const totalRevenue = tenants.reduce(
      (sum, tenant) => sum + (tenant.rent || 0),
      0
    );
    const thisMonthPayments = payments.filter((payment) => {
      const paymentMonth = payment.dueDate.getMonth();
      const currentMonth = new Date().getMonth();
      return paymentMonth === currentMonth && payment.status === "paid";
    });
    const collectedThisMonth = thisMonthPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    return {
      totalProperties: properties.length,
      totalUnits: units.length,
      occupiedUnits,
      totalTenants: tenants.length,
      totalRevenue,
      collectedThisMonth,
      occupancyRate:
        units.length > 0 ? Math.round((occupiedUnits / units.length) * 100) : 0,
      collectionRate:
        totalRevenue > 0
          ? Math.round((collectedThisMonth / totalRevenue) * 100)
          : 0,
    };
  },

  
  async getCollectionWhere(
    collectionName: string,
    field: string,
    operator: WhereFilterOp, 
    value: any
  ): Promise<any[]> {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },
};


export const leaseService = {
  async create(leaseData: Omit<Lease, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const batch = writeBatch(db);
    
    // Create lease
    const leaseRef = doc(collection(db, COLLECTIONS.LEASES));
    batch.set(leaseRef, {
      ...leaseData,
      startDate: Timestamp.fromDate(leaseData.startDate),
      endDate: Timestamp.fromDate(leaseData.endDate),
      lastRenewalDate: leaseData.lastRenewalDate ? Timestamp.fromDate(leaseData.lastRenewalDate) : null,
      renewalNoticeDate: leaseData.renewalNoticeDate ? Timestamp.fromDate(leaseData.renewalNoticeDate) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    // Update unit status to occupied
    if (leaseData.unitId) {
      const unitRef = doc(db, COLLECTIONS.UNITS, leaseData.unitId);
      batch.update(unitRef, {
        status: "occupied",
        tenantId: leaseData.tenantId,
        tenantName: leaseData.tenantName,
        updatedAt: Timestamp.now()
      });
    }

    await batch.commit();
    return leaseRef.id;
  },

  async getAll(): Promise<Lease[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.LEASES), orderBy("createdAt", "desc"))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      endDate: doc.data().endDate?.toDate(),
      lastRenewalDate: doc.data().lastRenewalDate?.toDate(),
      renewalNoticeDate: doc.data().renewalNoticeDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Lease[];
  },

  async getById(id: string): Promise<Lease | null> {
    const docRef = doc(db, COLLECTIONS.LEASES, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
      startDate: docSnap.data().startDate?.toDate(),
      endDate: docSnap.data().endDate?.toDate(),
      lastRenewalDate: docSnap.data().lastRenewalDate?.toDate(),
      renewalNoticeDate: docSnap.data().renewalNoticeDate?.toDate(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate()
    } as Lease;
  },

  async getByTenantId(tenantId: string): Promise<Lease[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.LEASES),
        where("tenantId", "==", tenantId),
        orderBy("createdAt", "desc")
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      endDate: doc.data().endDate?.toDate(),
      lastRenewalDate: doc.data().lastRenewalDate?.toDate(),
      renewalNoticeDate: doc.data().renewalNoticeDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Lease[];
  },

  async getByUnitId(unitId: string): Promise<Lease[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.LEASES),
        where("unitId", "==", unitId),
        orderBy("createdAt", "desc")
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      endDate: doc.data().endDate?.toDate(),
      lastRenewalDate: doc.data().lastRenewalDate?.toDate(),
      renewalNoticeDate: doc.data().renewalNoticeDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Lease[];
  },

  async update(id: string, updates: Partial<Lease>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.LEASES, id);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now()
    };

    if (updates.startDate) {
      updateData.startDate = Timestamp.fromDate(updates.startDate);
    }
    if (updates.endDate) {
      updateData.endDate = Timestamp.fromDate(updates.endDate);
    }
    if (updates.lastRenewalDate) {
      updateData.lastRenewalDate = Timestamp.fromDate(updates.lastRenewalDate);
    }
    if (updates.renewalNoticeDate) {
      updateData.renewalNoticeDate = Timestamp.fromDate(updates.renewalNoticeDate);
    }

    await updateDoc(docRef, updateData);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.LEASES, id);
    await deleteDoc(docRef);
  },

  async renewLease(leaseId: string, newEndDate: Date, specialTerms?: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.LEASES, leaseId);
    await updateDoc(docRef, {
      endDate: Timestamp.fromDate(newEndDate),
      lastRenewalDate: Timestamp.now(),
      status: "active",
      specialTerms: specialTerms || "",
      updatedAt: Timestamp.now()
    });
  },

  getByPropertyId: async (propertyId: string) => {
    // Query Firestore for leases where propertyId equals propertyId
    const leases = await dbUtils.getCollectionWhere('leases', 'propertyId', '==', propertyId);
    return leases;
  },

  getByPropertyIds: async (propertyIds: string[]) => {
    // Query Firestore for leases where propertyId is in propertyIds array
    const leases = await dbUtils.getCollectionWhere('leases', 'propertyId', 'in', propertyIds);
    return leases;
  },
};