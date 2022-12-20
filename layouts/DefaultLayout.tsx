import { ReactNode } from 'react';

import HeaderNavigation from '@/components/organisms/HeaderNavigation/HeaderNavigation';
import styles from '@/styles/layouts/DefaultLayout.module.scss';

type LayoutProps = Required<{
  readonly children: ReactNode;
}>;

function DefaultLayout({ children }: LayoutProps) {
  return (
    <div id="app">
      <div className={styles['background']}></div>
      <HeaderNavigation />
      {children}
    </div>
  );
}

export default DefaultLayout;
