import { useSelector } from 'react-redux';

import {
  selectAdministrator,
  selectIsAuthenticated,
  selectIsAuthenticationTried,
} from 'store/selector/character';

const useAuthenticationStatus = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAuthenticationTried = useSelector(selectIsAuthenticationTried);
  const isAdministratorAuthenticated = useSelector(selectAdministrator);

  return {
    isAuthenticated,
    isAuthenticationTried,
    isAdministratorAuthenticated,
  };
};

export default useAuthenticationStatus;
