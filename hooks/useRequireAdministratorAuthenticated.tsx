import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import useAuthenticationStatus from './useAuthenticationStatus';

const useRequireAdministratorAuthenticated = () => {
  const router = useRouter();
  const { isAdministratorAuthenticated, isAuthenticationTried } =
    useAuthenticationStatus();

  useEffect(() => {
    if (!isAuthenticationTried) return;
    if (!isAdministratorAuthenticated) {
      router.replace('/signin?for=' + encodeURIComponent(router.pathname));
    }
  }, [isAuthenticationTried, isAdministratorAuthenticated]);
};

export default useRequireAdministratorAuthenticated;
