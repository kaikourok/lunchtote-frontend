import { Url } from 'url';

import { Scrollspy } from '@makotot/ghostui';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, {
  createRef,
  ReactNode,
  RefObject,
  useEffect,
  useState,
} from 'react';

import styles from './ReaderPage.module.scss';

import Heading from '@/components/atoms/Heading/Heading';
import PageData from '@/components/organisms/PageData/PageData';
import { SubmenuItem } from 'constants/submenu';

type HeadingNode = {
  heading: string;
  headingLevel: 1 | 2;
  body: ReactNode;
};

type NonHeadingNode = {
  heading?: undefined;
  headingLevel?: undefined;
  body: ReactNode;
};

export type ReaderNode = HeadingNode | NonHeadingNode;

const HEADER_OFFSET = 70;

const ReaderPage = (props: {
  title: string;
  nodes: ReaderNode[];
  submenu?: SubmenuItem[];
}) => {
  const nodeItems = props.nodes.map((node) => ({
    ...node,
    ref: createRef<HTMLElement>(),
  }));
  const nodeRefs = nodeItems.map((item) => item.ref);

  return (
    <>
      <PageData title={props.title} />
      <Scrollspy sectionRefs={nodeRefs} offset={-HEADER_OFFSET}>
        {({ currentElementIndexInViewport }) => (
          <div className={styles['page']}>
            <nav className={styles['sidemenu']}>
              {props.submenu &&
                props.submenu.map((item, index) => {
                  return (
                    <Link key={index} href={item.link}>
                      <a className={styles['sidemenu-link']}>{item.label}</a>
                    </Link>
                  );
                })}
            </nav>
            <div className={styles['main-column']}>
              {nodeItems.map((node, index) => {
                return (
                  <section
                    key={index}
                    className={styles['node']}
                    id={'node-' + index}
                    ref={node.ref}
                  >
                    {node.headingLevel == 1 && (
                      <Heading>{node.heading}</Heading>
                    )}
                    {node.headingLevel == 2 && (
                      <Heading>{node.heading}</Heading>
                    )}
                    <div className={styles['node-body']}>{node.body}</div>
                  </section>
                );
              })}
            </div>
            <div className={styles['scrollspy-nav']}>
              {nodeItems.map((node, index) => {
                if (node.heading === undefined) {
                  return <React.Fragment key={index} />;
                }

                return (
                  <div
                    key={index}
                    className={classNames(
                      styles['scrollspy-link'],
                      {
                        [styles['scrollspy-link-sub']]: node.headingLevel == 2,
                      },
                      {
                        [styles['active']]:
                          currentElementIndexInViewport == index,
                      }
                    )}
                    onClick={() => {
                      if (!node.ref.current) return;

                      window.scrollTo({
                        top:
                          node.ref.current.getBoundingClientRect().top +
                          window.pageYOffset -
                          HEADER_OFFSET,
                        behavior: 'smooth',
                      });
                    }}
                  >
                    {node.heading}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Scrollspy>
    </>
  );
};

export default ReaderPage;
