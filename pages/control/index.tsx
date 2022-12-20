import { NextPage } from 'next';
import Link from 'next/link';

import SubHeading from '@/components/atoms/SubHeading/SubHeading';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import styles from '@/styles/pages/control/index.module.scss';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useRequireAdministratorAuthenticated from 'hooks/useRequireAdministratorAuthenticated';



type ControlLink = {
  title: string;
  description: string;
  link: string;
};

type ControlLinkGroup = {
  title: string;
  links: ControlLink[];
};

const Panel = (props: ControlLink) => {
  return (
    <Link href={props.link}>
      <a className={styles['panel']}>
        <div className={styles['panel-title']}>{props.title}</div>
        <div className={styles['panel-description']}>{props.description}</div>
      </a>
    </Link>
  );
};

const PanelGroup = (props: ControlLinkGroup) => {
  return (
    <section>
      <SubHeading>{props.title}</SubHeading>
      <div className={styles['panels']}>
        {props.links.map((link, index) => {
          return <Panel key={index} {...link} />;
        })}
      </div>
    </section>
  );
};

const Control: NextPage = () => {
  const { isAdministratorAuthenticated, isAuthenticationTried } =
    useAuthenticationStatus();
  useRequireAdministratorAuthenticated();

  if (!isAuthenticationTried || !isAdministratorAuthenticated) {
    return (
      <DefaultPage>
        <Loading />
      </DefaultPage>
    );
  }

  const groups: ControlLinkGroup[] = [
    {
      title: 'ゲーム管理',
      links: [
        {
          title: '更新',
          description: '更新処理を行います',
          link: '/control/game/update',
        },
        {
          title: 'お知らせ',
          description: 'お知らせを行います',
          link: '/control/game/announcements',
        },
        {
          title: '問い合わせ',
          description: '問い合わせを確認します',
          link: '/control/game/inquiries',
        },
        {
          title: '違反疑惑ログ',
          description:
            '自動検出された、規約違反が疑わしい行動のログを確認します',
          link: '/control/game/alerts',
        },
      ],
    },
    {
      title: 'キャラクター・ユーザー管理',
      links: [
        {
          title: '通知',
          description: 'キャラクターに通知を行います',
          link: '/control/character/notice',
        },
        {
          title: '電子メール送信',
          description:
            'メールアドレスを登録しているユーザーにメール配信を行います',
          link: '/control/character/email',
        },
        {
          title: 'ゲーム内メール',
          description: 'ゲーム内メールを送信します',
          link: '/control/character/mail',
        },
        {
          title: '情報確認',
          description: '特定のユーザーの情報を確認します',
          link: '/control/character/info',
        },
        {
          title: '警告',
          description: '特定のユーザーに対して警告を行います',
          link: '/control/character/admonish',
        },
        {
          title: 'BAN',
          description: '特定のユーザーのBANを行います',
          link: '/control/character/ban',
        },
        {
          title: 'BAN解除',
          description: '特定のユーザーのBAN解除を行います',
          link: '/control/character/unban',
        },
        {
          title: 'パスワード再発行',
          description: '特定のキャラクターのパスワードを上書き変更します',
          link: '/control/character/reset-password',
        },
        {
          title: '削除解除',
          description: '削除状態を解除します',
          link: '/control/character/undelete',
        },
      ],
    },
    {
      title: 'デバッグ',
      links: [
        {
          title: 'ダミーキャラ作成',
          description: 'ダミーキャラを作成します',
          link: '/control/debug/dummy-character',
        },
      ],
    },
  ];

  return (
    <DefaultPage>
      <PageData title="管理" />
      {groups.map((group, index) => {
        return <PanelGroup key={index} {...group} />;
      })}
    </DefaultPage>
  );
};

export default Control;
