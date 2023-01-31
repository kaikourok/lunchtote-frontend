import { UrlObject } from 'url';

import Link from 'next/link';
import { ReactNode } from 'react';

import styles from './PanelLinks.module.scss';

const PanelLink = (props: {
  title: string;
  summary?: string;
  href: string | UrlObject;
}) => {
  return (
    <Link href={props.href}>
      <a className={styles['panel-link']}>
        <div className={styles['panel-title']}>{props.title}</div>
        {props.summary != undefined && (
          <div className={styles['panel-summary']}>{props.summary}</div>
        )}
      </a>
    </Link>
  );
};

const PanelLinks = (props: { children: ReactNode }) => {
  return <section className={styles['panel-links']}>{props.children}</section>;
};

PanelLinks.Item = PanelLink;

export default PanelLinks;
