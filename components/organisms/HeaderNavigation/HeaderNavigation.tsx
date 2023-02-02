import { mdiBellOutline, mdiClose, mdiEmailOutline, mdiMenu } from '@mdi/js';
import Icon from '@mdi/react';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styles from './HeaderNavigation.module.scss';

import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import { useClient } from 'hooks/useClient';
import { signOutRequest } from 'store/actions/character';
import {
  selectExistsUnreadMail,
  selectExistsUnreadNotification,
} from 'store/selector/character';

type LinkProps = {
  text: string;
  href: string;
};

type LinkGroup = {
  text: string;
  textLocalized: string;
  prefix: string;
  href: string;
  links?: Array<LinkProps>;
  active?: boolean;
};

const HeaderLinkGroup = (props: { groups: Array<LinkGroup> }) => {
  const router = useRouter();
  const isClient = useClient();

  return (
    <div className={styles['header-links']}>
      {props.groups.map((group, index) => {
        return (
          <div
            className={classNames(styles['header-link-wrapper'])}
            key={index}
          >
            <Link href={group.href}>
              <a className={styles['header-link']}>
                <div
                  className={classNames(styles['header-link-text'], {
                    [styles['active']]:
                      isClient &&
                      router.isReady &&
                      router.asPath.indexOf(group.prefix) == 0,
                  })}
                >
                  {group.text}
                </div>
                <div className={styles['header-link-text-localized']}>
                  {group.textLocalized}
                </div>
              </a>
            </Link>
            <div className={styles['header-link-dropdown']}>
              <div
                className={classNames(
                  styles['header-link-dropdown-arrow-wrapper'],
                  { [styles['hidden']]: !group.links || !group.links.length }
                )}
              >
                <div className={styles['header-link-dropdown-arrow']} />
              </div>
              {group.links &&
                group.links.map((link, index) => {
                  return (
                    <Link key={index} href={link.href}>
                      <a className={styles['header-link-dropdown-links']}>
                        {link.text}
                      </a>
                    </Link>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SubMenuLinkGroup = (props: { groups: Array<LinkGroup> }) => {
  return (
    <div className={styles['submenu-links']}>
      {props.groups.map((group, index) => {
        return (
          <div key={index} className={styles['submenu-link-wrapper']}>
            <Link href={group.href}>
              <a className={styles['submenu-link']}>
                <span className={styles['submenu-link-text']}>
                  {group.text}
                </span>
                <span className={styles['submenu-link-subtext']}>
                  {group.textLocalized}
                </span>
              </a>
            </Link>
            <div className={styles['submenu-link-sublinks']}>
              {group.links &&
                group.links.map((link, index) => {
                  return (
                    <Link key={index} href={link.href}>
                      <a className={styles['submenu-link-sublink']}>
                        {link.text}
                      </a>
                    </Link>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const HeaderNavigation = () => {
  const router = useRouter();
  const isClient = useClient();
  const dispatch = useDispatch();

  const {
    isAuthenticated,
    isAuthenticationTried,
    isAdministratorAuthenticated,
  } = useAuthenticationStatus();

  const [isShowingSubmenu, setIsShowingSubmenu] = useState(false);

  useEffect(() => {
    setIsShowingSubmenu(false);
  }, [router.pathname]);

  const existsUnreadNotification = useSelector(selectExistsUnreadNotification);
  const existsUnreadMail = useSelector(selectExistsUnreadMail);

  const linkGroups: Array<LinkGroup> = (() => {
    if (!isAuthenticationTried) {
      return [];
    }

    if (!isAuthenticated) {
      return [
        {
          text: 'Register',
          textLocalized: '登録',
          prefix: '/signup',
          href: '/signup',
        },
        {
          text: 'Login',
          textLocalized: 'ログイン',
          prefix: '/signin',
          href: '/signin',
        },
        {
          text: 'Characters',
          textLocalized: 'キャラクター',
          prefix: '/characters',
          href: '/characters',
          links: [
            { text: 'キャラクター一覧', href: '/characters' },
            { text: 'キャラクター検索', href: '/characters/search' },
          ],
        },
        {
          text: 'Guide',
          textLocalized: 'ガイド',
          prefix: '/guide',
          href: '/guide',
        },
        {
          text: 'Forum',
          textLocalized: 'フォーラム',
          prefix: '/forums',
          href: '/forums',
        },
      ];
    } else {
      const base = [
        {
          text: 'Home',
          textLocalized: 'ホーム',
          prefix: '/home',
          href: '/home',
        },
        {
          text: 'Talks',
          textLocalized: '交流',
          prefix: '/rooms',
          href: '/rooms/messages',
          links: [
            { text: '交流', href: '/rooms/messages' },
            { text: '参加ルーム', href: '/rooms/membered' },
            { text: 'ルーム検索', href: '/rooms/search' },
            { text: 'ルーム作成', href: '/rooms/create' },
            { text: 'ルーム管理', href: '/rooms/owned' },
            { text: 'タブ管理', href: '/rooms/tabs' },
          ],
        },
        {
          text: 'Diaries',
          textLocalized: '日記',
          prefix: '/diaries',
          href: '/diaries',
          links: [
            { text: '日記一覧', href: '/diaries' },
            { text: '日記検索', href: '/diaries/search' },
            { text: '日記作成', href: '/diaries/write' },
            { text: '日記プレビュー', href: '/diaries/preview' },
          ],
        },
        {
          text: 'Characters',
          textLocalized: 'キャラクター',
          prefix: '/characters',
          href: '/characters',
          links: [
            { text: 'キャラクター一覧', href: '/characters' },
            { text: 'キャラクター検索', href: '/characters/search' },
            { text: 'リスト管理', href: '/characters/lists' },
          ],
        },
        {
          text: 'Settings',
          textLocalized: '設定',
          prefix: '/settings',
          href: '/settings/profile',
          links: [
            { text: 'プロフィール', href: '/settings/profile' },
            { text: 'プロフィール画像', href: '/settings/profile-images' },
            { text: 'アイコン', href: '/settings/icons' },
            { text: 'アイコンレイヤリング', href: '/settings/make-icons' },
            { text: 'アップロード画像', href: '/settings/uploaded-images' },
            { text: 'その他', href: '/settings/general' },
          ],
        },
        {
          text: 'Guide',
          textLocalized: 'ガイド',
          prefix: '/guide',
          href: '/guide',
        },
        {
          text: 'Forum',
          textLocalized: 'フォーラム',
          prefix: '/forums',
          href: '/forums',
        },
      ];

      if (isAdministratorAuthenticated) {
        base.push({
          text: 'Control',
          textLocalized: '管理',
          prefix: '/control',
          href: '/control',
        });
      }

      return base;
    }
  })();

  return (
    <>
      <header className={styles['header']}>
        <HeaderLinkGroup groups={linkGroups} />
        <div className={styles['header-spacer']} />
        <div className={styles['header-buttons']}>
          {isAuthenticated && (
            <Link href="/notifications">
              <a
                className={classNames(styles['header-button'], {
                  [styles['active']]:
                    isClient &&
                    router.isReady &&
                    router.asPath.indexOf('/notifications') == 0,
                })}
              >
                <div
                  className={classNames(styles['header-button-tip'], {
                    [styles['enable']]: !!existsUnreadNotification,
                  })}
                >
                  <span className={styles['header-button-tip-text']}>！</span>
                </div>
                <Icon
                  className={classNames(
                    styles['header-button-icon'],
                    styles['small']
                  )}
                  path={mdiBellOutline}
                />
              </a>
            </Link>
          )}
          {isAuthenticated && (
            <Link href="/mails">
              <a
                className={classNames(styles['header-button'], {
                  [styles['active']]:
                    isClient &&
                    router.isReady &&
                    router.asPath.indexOf('/mails') == 0,
                })}
              >
                <div
                  className={classNames(styles['header-button-tip'], {
                    [styles['enable']]: !!existsUnreadMail,
                  })}
                >
                  <span className={styles['header-button-tip-text']}>！</span>
                </div>
                <Icon
                  className={classNames(
                    styles['header-button-icon'],
                    styles['small']
                  )}
                  path={mdiEmailOutline}
                />
              </a>
            </Link>
          )}

          {isAuthenticationTried && (
            <div
              className={styles['header-button']}
              onClick={() => setIsShowingSubmenu(true)}
            >
              <Icon className={styles['header-button-icon']} path={mdiMenu} />
            </div>
          )}
        </div>
      </header>
      <div
        className={classNames(styles['submenu'], {
          [styles['hidden']]: !isShowingSubmenu,
        })}
      >
        <div className={styles['submenu-header']}>
          <div
            className={styles['submenu-header-button']}
            onClick={() => setIsShowingSubmenu(false)}
          >
            <Icon
              className={styles['submenu-header-button-icon']}
              path={mdiClose}
            />
          </div>
        </div>
        <SubMenuLinkGroup groups={linkGroups} />
        <section className={styles['aside-menus']}>
          <Link href="/inquiry">
            <a className={styles['aside-menu']}>お問い合わせ</a>
          </Link>
          <Link href="/legal">
            <a className={styles['aside-menu']}>法的情報</a>
          </Link>
          {isAuthenticated && (
            <span
              onClick={() => {
                dispatch(signOutRequest());
                setIsShowingSubmenu(false);
              }}
              className={styles['aside-menu']}
            >
              ログアウト
            </span>
          )}
        </section>
      </div>
    </>
  );
};

export default HeaderNavigation;
