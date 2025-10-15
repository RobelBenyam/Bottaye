import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { useAuthStore } from "@/stores/authStore";

export interface Activity {
  action: string;
  type: "tenant" | "payment" | "maintenance" | "lease" | string;
  time: string;
  userId?: string;
  propertyId?: string;
}

export function useRecentActivities(max = 10) {
  const { user } = useAuthStore();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.id) return;
    async function fetchActivities() {
      setLoading(true);
      if (!user || !user.id) {
        setActivities([]);
        setLoading(false);
        return;
      }
      const q = query(
        collection(db, "activities"),
        where("userId", "==", user.id),
        orderBy("time", "desc"),
        limit(max)
      );
      const snapshot = await getDocs(q);
      setActivities(
        snapshot.docs.map((doc) => {
          return {
            ...(doc.data() as Omit<Activity, "time">),
            time:
              doc.data().time?.toDate().toISOString() ||
              new Date().toISOString(),
          } as Activity;
        })
      );
      setLoading(false);
    }
    fetchActivities();
  }, [user, max]);

  return { activities, loading };
}
