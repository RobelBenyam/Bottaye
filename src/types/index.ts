export interface User {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin";
  propertyIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  description?: string;
  type: "residential" | "commercial" | "mixed";
  images?: string[];
  totalUnits: number;
  managerId: string;
  managerName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Unit {
  id: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  type:
    | "studio"
    | "1_bedroom"
    | "2_bedroom"
    | "3_bedroom"
    | "4_bedroom"
    | "office"
    | "shop";
  rent: number;
  deposit: number;
  status: "vacant" | "occupied" | "maintenance";
  tenantId?: string;
  tenantName?: string;
  images?: string[];
  floorPlan?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  unitId?: string;
  unitNumber?: string;
  propertyId?: string;
  propertyName?: string;
  leaseStartDate?: Date;
  leaseEndDate?: Date;
  rent?: number;
  deposit?: number;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  unitId: string;
  unitNumber: string;
  propertyId: string;
  propertyName: string;
  amount: number;
  type: "rent" | "deposit" | "maintenance" | "penalty" | "other";
  method: "cash" | "mpesa" | "bank_transfer" | "cheque";
  referenceNumber?: string;
  description?: string;
  dueDate: Date;
  paidDate?: Date;
  status: "pending" | "paid" | "overdue" | "partial";
  createdAt: Date;
  updatedAt: Date;
}

export interface Maintenance {
  id: string;
  propertyId: string;
  propertyName: string;
  unitId?: string;
  unitNumber?: string;
  tenantId?: string;
  tenantName?: string;
  title: string;
  description: string;
  category:
    | "plumbing"
    | "electrical"
    | "hvac"
    | "structural"
    | "cleaning"
    | "pest_control"
    | "other";
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  assignedTo?: string;
  estimatedCost?: number;
  actualCost?: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface DashboardStats {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalTenants: number;
  totalRevenue: number;
  pendingPayments: number;
  overduePayments: number;
  maintenanceRequests: number;
}

export interface PaymentSummary {
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  thisMonth: number;
  lastMonth: number;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  unitNumber: string;
  propertyName: string;
  tenantName: string;
  reportedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  assignedTo?: string;
  estimatedCost?: number;
  actualCost?: number;
  category:
    | "plumbing"
    | "electrical"
    | "hvac"
    | "appliance"
    | "structural"
    | "cleaning"
    | "other";
}
