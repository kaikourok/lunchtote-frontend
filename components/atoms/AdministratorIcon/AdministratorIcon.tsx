import { mdiCheckDecagram } from '@mdi/js';
import Icon from '@mdi/react';

import styles from './AdministratorIcon.module.scss';

const AdministratorIcon = () => {
  return <Icon path={mdiCheckDecagram} className={styles['icon']} />;
};

export default AdministratorIcon;
