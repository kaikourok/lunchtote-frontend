import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';

import styles from './SubmenuPage.module.scss';

import SubHeading from '@/components/atoms/SubHeading/SubHeading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from 'components/template/DefaultPage/DefaultPage';
import { SubmenuItem } from 'constants/submenu';

type SubmenuPageProps = {
  title?: string;
  menu: SubmenuItem[];
  children: ReactNode;
};

const SubmenuPage = (props: SubmenuPageProps) => {
  const router = useRouter();

  const [title, setTitle] = useState(props.title || '');

  useEffect(() => {
    if (!title && router.isReady) {
      for (let i = 0; i < props.menu.length; i++) {
        const link = props.menu[i].link;
        const path = typeof link === 'string' ? link : link.pathname;
        if (router.pathname == path) {
          setTitle(props.menu[i].label);
          break;
        }
      }
    }
  }, [router.isReady]);

  return (
    <main className={styles['page']}>
      <PageData title={props.title || title} />
      <div className={classNames(styles['columns'])}>
        <div className={styles['menu-wrapper']}>
          <nav className={styles['menu']}>
            {props.menu.map((item, index) => {
              return (
                <Link key={index} href={item.link}>
                  <a
                    className={classNames(styles['link'], {
                      [styles['current']]: router.pathname == item.link,
                    })}
                  >
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </nav>
        </div>
        <section className={styles['content']}>
          <SubHeading>{props.title || title}</SubHeading>
          <div className={styles['content-body']}>{props.children}</div>
        </section>
      </div>
    </main>
  );
};

export default SubmenuPage;
