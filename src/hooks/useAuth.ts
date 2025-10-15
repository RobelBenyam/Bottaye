import { useAuthStore } from '../stores/authStore'

/**
 * Hook to check if current user is a super admin
 */
export const useIsSuperAdmin = () => {
  const user = useAuthStore((state) => state.user)
  return user?.role === 'super_admin'
}

/**
 * Hook to check if current user is a regular admin
 */
export const useIsAdmin = () => {
  const user = useAuthStore((state) => state.user)
  return user?.role === 'admin'
}

/**
 * Hook to get user's accessible property IDs
 * Returns empty array for super_admin (meaning all properties)
 * Returns specific propertyIds for regular admin
 */
export const useUserPropertyIds = (): string[] => {
  const user = useAuthStore((state) => state.user)
  
  if (!user) return []
  
  // Super admin has access to all properties (empty array = no filtering)
  if (user.role === 'super_admin') return []
  
  // Regular admin only has access to assigned properties
  return user.propertyIds || []
}

/**
 * Hook to check if user can access a specific property
 */
export const useCanAccessProperty = (propertyId: string): boolean => {
  const user = useAuthStore((state) => state.user)
  
  if (!user) return false
  
  // Super admin can access all properties
  if (user.role === 'super_admin') return true
  
  // Regular admin can only access assigned properties
  return (user.propertyIds || []).includes(propertyId)
}

/**
 * Hook to check if user can manage users (super admin only)
 */
export const useCanManageUsers = (): boolean => {
  const user = useAuthStore((state) => state.user)
  return user?.role === 'super_admin'
}

