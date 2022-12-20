import { useSelector } from 'react-redux';

import { selectCsrfToken } from 'store/selector/character';

const useCsrfHeader = () => {
  const csrfToken = useSelector(selectCsrfToken);

  return csrfToken ? { 'X-Auth-key': csrfToken } : null;
};

export default useCsrfHeader;
