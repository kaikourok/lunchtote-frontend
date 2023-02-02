import { NextPage } from 'next';
import Link from 'next/link';

import Heading from '@/components/atoms/Heading/Heading';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import PanelLinks from '@/components/organisms/PanelLinks/PanelLinks';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import styles from '@/styles/pages/control/index.module.scss';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useRequireAdministratorAuthenticated from 'hooks/useRequireAdministratorAuthenticated';

type ControlLink = {
  title: string;
  summary: string;
  href: string;
};

type ControlLinkGroup = {
  title: string;
  links: ControlLink[];
};

const PanelGroup = (props: ControlLinkGroup) => {
  return (
    <section>
      <Heading>{props.title}</Heading>
      <PanelLinks>
        {props.links.map((link, index) => {
          return <PanelLinks.Item key={index} {...link} />;
        })}
      </PanelLinks>
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
          summary: '更新処理を行います',
          href: '/control/game/update',
        },
        {
          title: 'お知らせ',
          summary: 'お知らせを行います',
          href: '/control/game/announcements',
        },
        {
          title: '問い合わせ',
          summary: '問い合わせを確認します',
          href: '/control/game/inquiries',
        },
        {
          title: '違反疑惑ログ',
          summary: '自動検出された、規約違反が疑わしい行動のログを確認します',
          href: '/control/game/alerts',
        },
      ],
    },
    {
      title: 'キャラクター・ユーザー管理',
      links: [
        {
          title: '通知',
          summary: 'キャラクターに通知を行います',
          href: '/control/character/notice',
        },
        {
          title: '電子メール送信',
          summary: 'メールアドレスを登録しているユーザーにメール配信を行います',
          href: '/control/character/email',
        },
        {
          title: 'ゲーム内メール',
          summary: 'ゲーム内メールを送信します',
          href: '/control/character/mail',
        },
        {
          title: '情報確認',
          summary: '特定のユーザーの情報を確認します',
          href: '/control/character/info',
        },
        {
          title: '警告',
          summary: '特定のユーザーに対して警告を行います',
          href: '/control/character/admonish',
        },
        {
          title: 'BAN',
          summary: '特定のユーザーのBANを行います',
          href: '/control/character/ban',
        },
        {
          title: 'BAN解除',
          summary: '特定のユーザーのBAN解除を行います',
          href: '/control/character/unban',
        },
        {
          title: 'パスワード再発行',
          summary: '特定のキャラクターのパスワードを上書き変更します',
          href: '/control/character/reset-password',
        },
        {
          title: '削除解除',
          summary: '削除状態を解除します',
          href: '/control/character/undelete',
        },
      ],
    },
    {
      title: 'デバッグ',
      links: [
        {
          title: 'ダミーキャラ作成',
          summary: 'ダミーキャラを作成します',
          href: '/control/debug/dummy-character',
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
