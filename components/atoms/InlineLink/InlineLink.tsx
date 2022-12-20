import { UrlObject } from 'url';

import Link from 'next/link';
import { ReactNode } from 'react';

import styles from './InlineLink.module.scss';

type InlineLinkProps =
  | {
      external?: false | undefined;
      href: string | UrlObject;
      children: ReactNode;
    }
  | {
      external: true;
      href: string;
      children: ReactNode;
    };

const InlineLink = (props: InlineLinkProps) => {
  if (props.external) {
    return (
      <a
        className={styles['inline-link']}
        href={props.href}
        target="_blank"
        rel="noreferrer"
      >
        {props.children}
      </a>
    );
  } else {
    return (
      <Link href={props.href}>
        <a className={styles['inline-link']}>{props.children}</a>
      </Link>
    );
  }
};

export default InlineLink;
