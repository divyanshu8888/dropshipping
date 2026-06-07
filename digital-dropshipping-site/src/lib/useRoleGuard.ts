import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

/**
 * Redirects the user if their role is not in the allowed list.
 * Call at the top of any page that requires specific roles.
 *
 * @param allowedRoles - roles permitted to view this page
 * @param redirectMap  - where to send each disallowed role (fallback: '/login')
 */
export function useRoleGuard(
  allowedRoles: string[],
  redirectMap: Record<string, string> = {}
) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    const role = user.role || '';
    if (!allowedRoles.includes(role)) {
      const destination =
        redirectMap[role] ||
        (role === 'FREELANCER'
          ? '/freelancers/dashboard'
          : role === 'CLIENT'
          ? '/clients/dashboard'
          : role === 'ADMIN' || role === 'TEAM_MEMBER'
          ? '/admin'
          : '/');
      router.replace(destination);
    }
  }, [user, loading, router.asPath]);

  return { user, loading };
}
