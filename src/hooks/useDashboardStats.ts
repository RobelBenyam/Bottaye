import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import {
  propertyService,
  unitService,
  tenantService,
  paymentService,
  maintenanceService,
} from "@/services/database";
import { DashboardStats } from "@/types";

const zeroStats: DashboardStats = {
  totalProperties: 0,
  totalUnits: 0,
  occupiedUnits: 0,
  vacantUnits: 0,
  totalTenants: 0,
  totalRevenue: 0,
  pendingPayments: 0,
  overduePayments: 0,
  maintenanceRequests: 0,
};

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const fetchDashboardData = async () => {
    if (!user) {
      setStats(zeroStats);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userProperties = await propertyService.getByUserId(user.id);
      const propertyIds = userProperties.map((p) => p.id);

      if (propertyIds.length === 0) {
        setStats(zeroStats);
        setLoading(false);
        return;
      }

      const [units, tenants, payments, maintenance] = await Promise.all([
        unitService.getByPropertyIds(propertyIds),
        tenantService.getByPropertyIds(propertyIds),
        paymentService.getByPropertyIds(propertyIds),
        maintenanceService.getByPropertyIds(propertyIds),
      ]);

      const totalUnits = units.length;
      const occupiedUnits = units.filter(
        (unit) => unit.status === "occupied"
      ).length;
      const vacantUnits = totalUnits - occupiedUnits;
      const totalRevenue = tenants.reduce(
        (sum, tenant) => sum + (tenant.rent || 0),
        0
      );
      const pendingPayments = payments.filter(
        (p) => p.status === "pending"
      ).length;
      const overduePayments = payments.filter(
        (p) => p.status === "overdue"
      ).length;
      const maintenanceRequests = maintenance.filter(
        (m) => m.status === "pending" || m.status === "in_progress"
      ).length;

      setStats({
        totalProperties: userProperties.length,
        totalUnits: totalUnits,
        occupiedUnits: occupiedUnits,
        vacantUnits: vacantUnits,
        totalTenants: tenants.length,
        totalRevenue: totalRevenue,
        pendingPayments: pendingPayments,
        overduePayments: overduePayments,
        maintenanceRequests: maintenanceRequests,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      setStats(zeroStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  return { stats, loading, refetch: fetchDashboardData };
}
