import { useRouter } from 'next/router';
import { useEffect } from 'react';

import useAuthenticationStatus from './useAuthenticationStatus';

const useRequireAuthenticated = () => {
  const router = useRouter();
  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();

  useEffect(() => {
    if (!isAuthenticationTried) return;
    if (!isAuthenticated) {
      router.replace('/signin?for=' + encodeURIComponent(router.pathname));
    }
  }, [isAuthenticationTried, isAuthenticated]);
};

export default useRequireAuthenticated;
