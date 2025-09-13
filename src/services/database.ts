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
  WhereFilterOp,
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
  ACTIVITIES: "activities",
} as const;

const toDate = (timestamp: Timestamp | undefined | null): Date | undefined => {
  return timestamp instanceof Timestamp ? timestamp.toDate() : undefined;
};

export const logActivity = async (
  userId: string,
  action: string,
  type: "property" | "unit" | "tenant" | "lease" | "payment" | "maintenance"
): Promise<void> => {
  try {
    await addDoc(collection(db, COLLECTIONS.ACTIVITIES), {
      userId,
      action,
      type,
      time: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

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
    if (propertyData.managerId) {
      await logActivity(
        propertyData.managerId,
        `New property created: ${propertyData.name}`,
        "property"
      );
    }
    return docRef.id;
  },

  async getAll(): Promise<Property[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.PROPERTIES))
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
    })) as Property[];
  },

  async getById(id: string): Promise<Property | null> {
    const docRef = doc(db, COLLECTIONS.PROPERTIES, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: toDate(docSnap.data().createdAt),
      updatedAt: toDate(docSnap.data().updatedAt),
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
    const properties = await dbUtils.getCollectionWhere<Property>(
      COLLECTIONS.PROPERTIES,
      "managerId",
      "==",
      userId
    );
    return properties;
  },
};

// Unit operations
export const unitService = {
  async create(
    unitData: Omit<Unit, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const property = await propertyService.getById(unitData.propertyId);
    if (!property) {
      throw new Error(`Property with id ${unitData.propertyId} not found`);
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.UNITS), {
      ...unitData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    if (property.managerId) {
      await logActivity(
        property.managerId,
        `New unit created: ${unitData.unitNumber} in ${unitData.propertyName}`,
        "unit"
      );
    }
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
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
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
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
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
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
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
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
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
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
    })) as Unit[];
  },
};

// Tenant operations
export const tenantService = {
  async create(
    tenantData: Omit<Tenant, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
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
        tenantId: tenantRef.id, // Link tenantId to the newly created tenant
        tenantName: tenantData.name,
        updatedAt: Timestamp.now(),
      });
    }

    await batch.commit();
    return tenantRef.id;
  },

  async getAll(): Promise<Tenant[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.TENANTS), orderBy("name"))
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
      leaseStartDate: toDate(doc.data().leaseStartDate),
      leaseEndDate: toDate(doc.data().leaseEndDate),
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
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
      leaseStartDate: toDate(doc.data().leaseStartDate),
      leaseEndDate: toDate(doc.data().leaseEndDate),
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

  getByPropertyIds: async (propertyIds: string[]): Promise<Tenant[]> => {
    if (propertyIds.length === 0) return [];
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.TENANTS),
        where("propertyId", "in", propertyIds),
        orderBy("name")
      )
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
      leaseStartDate: toDate(doc.data().leaseStartDate),
      leaseEndDate: toDate(doc.data().leaseEndDate),
    })) as Tenant[];
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
      dueDate: toDate(doc.data().dueDate),
      paidDate: toDate(doc.data().paidDate),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
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
      dueDate: toDate(doc.data().dueDate),
      paidDate: toDate(doc.data().paidDate),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
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
      dueDate: toDate(doc.data().dueDate),
      paidDate: toDate(doc.data().paidDate),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
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

  getByPropertyIds: async (propertyIds: string[]): Promise<Payment[]> => {
    if (!propertyIds || propertyIds.length === 0) return [];

    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.PAYMENTS),
        where("propertyId", "in", propertyIds),
        orderBy("dueDate", "desc")
      )
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dueDate: toDate(doc.data().dueDate),
      paidDate: toDate(doc.data().paidDate),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
    })) as Payment[];
  },
};

// Maintenance operations
export const maintenanceService = {
  // Helper to enrich maintenance data with property, unit, tenant names
  async _enrichMaintenance(
    maintenanceRequests: Maintenance[]
  ): Promise<Maintenance[]> {
    if (maintenanceRequests.length === 0) return [];

    const propertyIds = [
      ...new Set(maintenanceRequests.map((req) => req.propertyId)),
    ];
    const unitIds = [
      ...new Set(
        maintenanceRequests.map((req) => req.unitId).filter((id) => !!id)
      ),
    ] as string[];
    const tenantIds = [
      ...new Set(
        maintenanceRequests.map((req) => req.tenantId).filter((id) => !!id)
      ),
    ] as string[];

    const chunk = <T>(arr: T[], size: number): T[][] =>
      Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
      );

    const fetchDocsInChunks = async (collectionName: string, ids: string[]) => {
      if (ids.length === 0) return [];
      const idChunks = chunk(ids, 30); // Firestore 'in' query limit is 30
      const queryPromises = idChunks.map((idChunk) =>
        getDocs(
          query(
            collection(db, collectionName),
            where("__name__", "in", idChunk)
          )
        )
      );
      const querySnapshots = await Promise.all(queryPromises);
      return querySnapshots.flatMap((snapshot) => snapshot.docs);
    };

    const [propertyDocs, unitDocs, tenantDocs] = await Promise.all([
      fetchDocsInChunks(COLLECTIONS.PROPERTIES, propertyIds),
      fetchDocsInChunks(COLLECTIONS.UNITS, unitIds),
      fetchDocsInChunks(COLLECTIONS.TENANTS, tenantIds),
    ]);

    const propertiesMap =
      propertyDocs.reduce((acc, doc) => {
        acc[doc.id] = doc.data() as Property;
        return acc;
      }, {} as { [key: string]: Property }) || {};
    const unitsMap =
      unitDocs.reduce((acc, doc) => {
        acc[doc.id] = doc.data() as Unit;
        return acc;
      }, {} as { [key: string]: Unit }) || {};
    const tenantsMap =
      tenantDocs.reduce((acc, doc) => {
        acc[doc.id] = doc.data() as Tenant;
        return acc;
      }, {} as { [key: string]: Tenant }) || {};

    return maintenanceRequests.map((req) => {
      const enrichedReq: Maintenance = { ...req }; // Ensure type safety
      if (req.propertyId && propertiesMap[req.propertyId]) {
        enrichedReq.propertyName = propertiesMap[req.propertyId].name;
      }
      if (req.unitId && unitsMap[req.unitId]) {
        enrichedReq.unitNumber = unitsMap[req.unitId].unitNumber;
      }
      if (req.tenantId && tenantsMap[req.tenantId]) {
        enrichedReq.tenantName = tenantsMap[req.tenantId].name;
      }
      return enrichedReq;
    });
  },

  async create(
    maintenanceData: Omit<
      Maintenance,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "propertyName"
      | "unitNumber"
      | "tenantName"
    >
  ): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.MAINTENANCE), {
      ...maintenanceData,
      reportedDate: Timestamp.fromDate(maintenanceData.reportedDate),
      scheduledDate: maintenanceData.scheduledDate
        ? Timestamp.fromDate(maintenanceData.scheduledDate)
        : null,
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
    const rawMaintenance = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      reportedDate: toDate(doc.data().reportedDate),
      scheduledDate: toDate(doc.data().scheduledDate),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
      completedAt: toDate(doc.data().completedAt),
    })) as Maintenance[];

    return this._enrichMaintenance(rawMaintenance);
  },

  async getByPropertyId(propertyId: string): Promise<Maintenance[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.MAINTENANCE),
        where("propertyId", "==", propertyId),
        orderBy("createdAt", "desc")
      )
    );
    const rawMaintenance = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      reportedDate: toDate(doc.data().reportedDate),
      scheduledDate: toDate(doc.data().scheduledDate),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
      completedAt: toDate(doc.data().completedAt),
    })) as Maintenance[];

    return this._enrichMaintenance(rawMaintenance);
  },

  async getByPropertyIds(propertyIds: string[]): Promise<Maintenance[]> {
    if (!propertyIds || propertyIds.length === 0) return [];

    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.MAINTENANCE),
        where("propertyId", "in", propertyIds),
        orderBy("createdAt", "desc")
      )
    );
    const rawMaintenance = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      reportedDate: toDate(doc.data().reportedDate),
      scheduledDate: toDate(doc.data().scheduledDate),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
      completedAt: toDate(doc.data().completedAt),
    })) as Maintenance[];

    return this._enrichMaintenance(rawMaintenance);
  },

  async update(id: string, updates: Partial<Maintenance>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.MAINTENANCE, id);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Convert Date objects to Timestamps for Firestore
    if (updates.reportedDate) {
      updateData.reportedDate = Timestamp.fromDate(updates.reportedDate);
    }
    if (updates.scheduledDate) {
      updateData.scheduledDate = Timestamp.fromDate(updates.scheduledDate);
    }
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
      // Ensure payment.dueDate is a Date object
      const paymentDate = payment.dueDate;
      if (!paymentDate) return false;
      const paymentMonth = paymentDate.getMonth();
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

  async getCollectionWhere<T>(
    collectionName: string,
    field: string,
    operator: WhereFilterOp,
    value: any
  ): Promise<T[]> {
    const processDoc = (docSnap: any) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        // Common date fields to convert
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
        startDate: toDate(data.startDate), // For leases
        endDate: toDate(data.endDate), // For leases
        reportedDate: toDate(data.reportedDate), // For maintenance
        scheduledDate: toDate(data.scheduledDate), // For maintenance
        completedAt: toDate(data.completedAt), // For maintenance
        dueDate: toDate(data.dueDate), // For payments
        paidDate: toDate(data.paidDate), // For payments
        leaseStartDate: toDate(data.leaseStartDate), // For tenants
        leaseEndDate: toDate(data.leaseEndDate), // For tenants
        lastRenewalDate: toDate(data.lastRenewalDate), // For leases
        renewalNoticeDate: toDate(data.renewalNoticeDate), // For leases
      } as T;
    };

    if (operator === "in" && Array.isArray(value) && value.length > 30) {
      const chunk = <T>(arr: T[], size: number): T[][] =>
        Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
          arr.slice(i * size, i * size + size)
        );

      const valueChunks = chunk(value, 30);
      const queryPromises = valueChunks.map((chunk) =>
        getDocs(
          query(collection(db, collectionName), where(field, "in", chunk))
        )
      );

      const querySnapshots = await Promise.all(queryPromises);
      return querySnapshots.flatMap((snapshot) =>
        snapshot.docs.map(processDoc)
      );
    }

    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(processDoc);
  },
};

export const leaseService = {
  async create(
    leaseData: Omit<Lease, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const batch = writeBatch(db);

    // Create lease
    const leaseRef = doc(collection(db, COLLECTIONS.LEASES));
    batch.set(leaseRef, {
      ...leaseData,
      startDate: Timestamp.fromDate(leaseData.startDate),
      endDate: Timestamp.fromDate(leaseData.endDate),
      lastRenewalDate: leaseData.lastRenewalDate
        ? Timestamp.fromDate(leaseData.lastRenewalDate)
        : null,
      renewalNoticeDate: leaseData.renewalNoticeDate
        ? Timestamp.fromDate(leaseData.renewalNoticeDate)
        : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Update unit status to occupied
    if (leaseData.unitId) {
      const unitRef = doc(db, COLLECTIONS.UNITS, leaseData.unitId);
      batch.update(unitRef, {
        status: "occupied",
        tenantId: leaseData.tenantId, // Assuming tenantId is provided directly
        tenantName: leaseData.tenantName,
        updatedAt: Timestamp.now(),
      });
    }

    await batch.commit();
    return leaseRef.id;
  },

  async getAll(): Promise<Lease[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.LEASES), orderBy("createdAt", "desc"))
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startDate: toDate(doc.data().startDate),
      endDate: toDate(doc.data().endDate),
      lastRenewalDate: toDate(doc.data().lastRenewalDate),
      renewalNoticeDate: toDate(doc.data().renewalNoticeDate),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
    })) as Lease[];
  },

  async getById(id: string): Promise<Lease | null> {
    const docRef = doc(db, COLLECTIONS.LEASES, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data(),
      startDate: toDate(docSnap.data().startDate),
      endDate: toDate(docSnap.data().endDate),
      lastRenewalDate: toDate(docSnap.data().lastRenewalDate),
      renewalNoticeDate: toDate(docSnap.data().renewalNoticeDate),
      createdAt: toDate(docSnap.data().createdAt),
      updatedAt: toDate(docSnap.data().updatedAt),
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
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startDate: toDate(doc.data().startDate),
      endDate: toDate(doc.data().endDate),
      lastRenewalDate: toDate(doc.data().lastRenewalDate),
      renewalNoticeDate: toDate(doc.data().renewalNoticeDate),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
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
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startDate: toDate(doc.data().startDate),
      endDate: toDate(doc.data().endDate),
      lastRenewalDate: toDate(doc.data().lastRenewalDate),
      renewalNoticeDate: toDate(doc.data().renewalNoticeDate),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
    })) as Lease[];
  },

  async update(id: string, updates: Partial<Lease>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.LEASES, id);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
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
      updateData.renewalNoticeDate = Timestamp.fromDate(
        updates.renewalNoticeDate
      );
    }

    await updateDoc(docRef, updateData);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.LEASES, id);
    await deleteDoc(docRef);
  },

  async renewLease(
    leaseId: string,
    newEndDate: Date,
    specialTerms?: string
  ): Promise<void> {
    const docRef = doc(db, COLLECTIONS.LEASES, leaseId);
    await updateDoc(docRef, {
      endDate: Timestamp.fromDate(newEndDate),
      lastRenewalDate: Timestamp.now(),
      status: "active",
      specialTerms: specialTerms || "",
      updatedAt: Timestamp.now(),
    });
  },

  getByPropertyId: async (propertyId: string) => {
    const leases = await dbUtils.getCollectionWhere<Lease>(
      COLLECTIONS.LEASES,
      "propertyId",
      "==",
      propertyId
    );
    return leases;
  },

  getByPropertyIds: async (propertyIds: string[]) => {
    const leases = await dbUtils.getCollectionWhere<Lease>(
      COLLECTIONS.LEASES,
      "propertyId",
      "in",
      propertyIds
    );
    return leases;
  },
};
