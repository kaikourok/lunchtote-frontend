import { Url, UrlObject } from 'url';

import classNames from 'classnames';
import Link from 'next/link';
import { ReactNode } from 'react';

import styles from './PageSelector.module.scss';

const PageSelector = (props: { children: ReactNode; className?: string }) => {
  return (
    <section
      className={
        styles['page-selector'] +
        (typeof props.className == 'undefined' ? '' : props.className)
      }
    >
      {props.children}
    </section>
  );
};

const Item = (props: {
  href: string | UrlObject;
  children: ReactNode;
  current?: boolean;
  className?: string;
}) => {
  return (
    <Link href={props.href}>
      <a
        className={
          classNames(styles['page-link'], {
            [styles['page-link-current']]: !!props.current,
          }) + (typeof props.className == 'undefined' ? '' : props.className)
        }
      >
        {props.children}
      </a>
    </Link>
  );
};

PageSelector.Item = Item;

export default PageSelector;
