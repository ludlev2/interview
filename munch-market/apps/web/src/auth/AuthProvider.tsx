import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { api, tokenStore } from '@/lib/api';
import { AuthContext, type AuthContextValue } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(tokenStore.get);

  const me = useQuery({
    queryKey: ['me', token],
    queryFn: api.me,
    enabled: !!token,
    retry: false,
  });

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await api.login(email, password);
      tokenStore.set(result.accessToken);
      queryClient.setQueryData(['me', result.accessToken], result.user);
      setToken(result.accessToken);
      return result.user;
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: token && me.data ? me.data : null,
      loading: !!token && me.isPending,
      login,
      logout,
    }),
    [token, me.data, me.isPending, login, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
