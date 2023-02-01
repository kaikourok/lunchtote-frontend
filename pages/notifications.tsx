import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useSWR from 'swr';

import CharacterIcon from '@/components/atoms/CharacterIcon/CharacterIcon';
import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import styles from '@/styles/pages/notification.module.scss';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import characterIdText from 'lib/characterIdText';
import { stringifyDate } from 'lib/stringifyDate';
import { readNotifications } from 'store/actions/character';

type NotificationBase = {
  id: number;
  timestamp: string;
};

type FollowedNotification = NotificationBase & {
  type: 'FOLLOWED';
  character: CharacterOverview;
};

type RepliedNotification = NotificationBase & {
  type: 'REPLIED';
  character: CharacterOverview;
  room: RoomOverview;
  message: {
    referRoot: number;
    message: string;
  };
};

type SubscribeNotification = NotificationBase & {
  type: 'SUBSCRIBE';
  character: CharacterOverview;
  room: RoomOverview;
  message: {
    message: string;
  };
};

type MailNotification = NotificationBase & {
  type: 'MAIL';
  character: {
    id: number | null;
    name: string;
    mainicon: string | null;
  };
  mail: {
    id: number;
    title: string;
  };
};

type MassMailNotification = NotificationBase & {
  type: 'MASS_MAIL';
  mail: {
    id: number;
    name: string;
    title: string;
  };
};

type Notification =
  | FollowedNotification
  | RepliedNotification
  | SubscribeNotification
  | MailNotification
  | MassMailNotification;

type Response = {
  notifications: Notification[];
  isContinue: boolean;
};

const NotificationTemplate = (props: {
  notification: NotificationBase;
  message: ReactNode;
  detail?: ReactNode;
}) => {
  return (
    <div className={styles['notification']}>
      <div className={styles['notification-message']}>{props.message}</div>
      {!!props.detail && (
        <div className={styles['notification-detail']}>{props.detail}</div>
      )}
      <div className={styles['notification-date']}>
        {stringifyDate(new Date(props.notification.timestamp))}
      </div>
    </div>
  );
};

const FollowedNotificationView = (props: {
  notification: FollowedNotification;
}) => {
  return (
    <NotificationTemplate
      notification={props.notification}
      message={
        <Link
          href={{
            pathname: '/characters/[id]',
            query: { id: props.notification.character.id },
          }}
        >
          <a className={styles['message-link']}>
            <div className={styles['icon-wrapper']}>
              <CharacterIcon url={props.notification.character.mainicon} mini />
            </div>
            <div className={styles['message-link-content']}>
              <span className={styles['character-names']}>
                <span className={styles['character-name']}>
                  {props.notification.character.name}
                </span>
                <span className={styles['character-id']}>
                  {characterIdText(props.notification.character.id)}
                </span>
              </span>
              にフォローされました
            </div>
          </a>
        </Link>
      }
    />
  );
};

const RepliedNotificationView = (props: {
  notification: RepliedNotification;
}) => {
  const detailText = props.notification.message.message.replaceAll(
    /<.+?>/g,
    ''
  );

  return (
    <NotificationTemplate
      notification={props.notification}
      message={
        <Link
          href={{
            pathname: '/rooms/messages',
            query: {
              category: 'conversation',
              root: props.notification.message.referRoot,
            },
          }}
        >
          <a className={styles['message-link']}>
            <div className={styles['icon-wrapper']}>
              <CharacterIcon url={props.notification.character.mainicon} mini />
            </div>
            <div className={styles['message-link-content']}>
              <span className={styles['room-title']}>
                {props.notification.room.title}
              </span>
              にて
              <span className={styles['character-names']}>
                <span className={styles['character-name']}>
                  {props.notification.character.name}
                </span>
                <span className={styles['character-id']}>
                  {characterIdText(props.notification.character.id)}
                </span>
              </span>
              からのリプライがあります
            </div>
          </a>
        </Link>
      }
      detail={!detailText ? undefined : detailText}
    />
  );
};

const SubscribeNotificationView = (props: {
  notification: SubscribeNotification;
}) => {
  const detailText = props.notification.message.message.replaceAll(
    /<.+?>/g,
    ''
  );

  return (
    <NotificationTemplate
      notification={props.notification}
      message={
        <Link
          href={{
            pathname: '/rooms/messages',
            query: {
              room: props.notification.room.id,
            },
          }}
        >
          <a className={styles['message-link']}>
            <div className={styles['icon-wrapper']}>
              <CharacterIcon url={props.notification.character.mainicon} mini />
            </div>
            <div className={styles['message-link-content']}>
              <span className={styles['room-title']}>
                {props.notification.room.title}
              </span>
              にて
              <span className={styles['character-names']}>
                <span className={styles['character-name']}>
                  {props.notification.character.name}
                </span>
                <span className={styles['character-id']}>
                  {characterIdText(props.notification.character.id)}
                </span>
              </span>
              の新規メッセージがあります
            </div>
          </a>
        </Link>
      }
      detail={!detailText ? undefined : detailText}
    />
  );
};

const MailNotificationView = (props: { notification: MailNotification }) => {
  return (
    <NotificationTemplate
      notification={props.notification}
      message={
        <Link href="/mails">
          <a className={styles['message-link']}>
            <div className={styles['icon-wrapper']}>
              <CharacterIcon url={props.notification.character.mainicon} mini />
            </div>
            <div className={styles['message-link-content']}>
              <span className={styles['character-names']}>
                <span className={styles['character-name']}>
                  {props.notification.character.name}
                </span>
                {props.notification.character.id != null && (
                  <span className={styles['character-id']}>
                    {characterIdText(props.notification.character.id)}
                  </span>
                )}
              </span>
              からの新着メールがあります
            </div>
          </a>
        </Link>
      }
      detail={props.notification.mail.title}
    />
  );
};

const MassMailNotificationView = (props: {
  notification: MassMailNotification;
}) => {
  return (
    <NotificationTemplate
      notification={props.notification}
      message={
        <Link href="/mails">
          <a className={styles['message-link']}>
            <div className={styles['icon-wrapper']} />
            <div className={styles['message-link-content']}>
              <span className={styles['character-names']}>
                <span className={styles['character-name']}>
                  {props.notification.mail.name}
                </span>
              </span>
              からの新着メールがあります
            </div>
          </a>
        </Link>
      }
      detail={props.notification.mail.title}
    />
  );
};

const Notifications: NextPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();
  useRequireAuthenticated();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(readNotifications());
    }
  }, [isAuthenticated]);

  const { data, error, mutate } = useSWR<Response>(
    !router.isReady ? null : `/characters/main/notifications`
  );

  if (error) {
    return <DefaultPage>表示中にエラーが発生しました。</DefaultPage>;
  }

  if (!isAuthenticationTried || !isAuthenticated || !data) {
    return (
      <DefaultPage>
        <Loading />
      </DefaultPage>
    );
  }

  type NotificationGroup = {
    year: number;
    month: number;
    date: number;
    day: number;
    notifications: Notification[];
  };

  const notificationsGroupedByDay: NotificationGroup[] = [];

  const isSameDate = (group: NotificationGroup, timestamp: string) => {
    const time = new Date(timestamp);
    return (
      group.year == time.getFullYear() &&
      group.month == time.getMonth() &&
      group.date == time.getDate()
    );
  };

  for (let i = 0; i < data.notifications.length; i++) {
    if (
      !notificationsGroupedByDay.length ||
      !isSameDate(
        notificationsGroupedByDay[notificationsGroupedByDay.length - 1],
        data.notifications[i].timestamp
      )
    ) {
      const date = new Date(data.notifications[i].timestamp);

      notificationsGroupedByDay.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        date: date.getDate(),
        day: date.getDay(),
        notifications: [data.notifications[i]],
      });
    } else {
      notificationsGroupedByDay[
        notificationsGroupedByDay.length - 1
      ].notifications.push(data.notifications[i]);
    }
  }

  const relativeTime = (year: number, month: number, date: number) => {
    const targetDate = new Date();

    targetDate.setFullYear(year);
    targetDate.setMonth(month);
    targetDate.setDate(date);
    targetDate.setHours(0);
    targetDate.setMinutes(0);
    targetDate.setSeconds(0);
    targetDate.setMilliseconds(0);

    const targetEpoch = targetDate.getTime();
    const currentEpoch = new Date().getTime();

    const dayErapsed = Math.floor(
      (currentEpoch - targetEpoch) / (1000 * 60 * 60 * 24)
    );

    switch (dayErapsed) {
      case 0:
        return '今日';
      case 1:
        return '昨日';
      default:
        return `${dayErapsed}日前`;
    }
  };

  return (
    <DefaultPage>
      <PageData title="通知" />
      {!notificationsGroupedByDay.length && (
        <CommentarySection noMargin>通知はまだありません</CommentarySection>
      )}
      {!!notificationsGroupedByDay.length && (
        <section>
          {notificationsGroupedByDay.map((group) => {
            return (
              <div
                key={`${group.year}/${group.month}/${group.date}`}
                className={styles['notification-group']}
              >
                <div className={styles['notification-group-date']}>
                  <div className={styles['absolute-date']}>
                    {group.year}/{group.month + 1}/{group.date}{' '}
                    {['日', '月', '火', '水', '木', '金', '土'][group.day]}
                  </div>
                  <div className={styles['relative-date']}>
                    {relativeTime(group.year, group.month, group.date)}
                  </div>
                </div>
                <div className={styles['day-notifications']}>
                  {group.notifications.map((notification) => {
                    switch (notification.type) {
                      case 'FOLLOWED':
                        return (
                          <FollowedNotificationView
                            key={notification.id}
                            notification={notification}
                          />
                        );
                      case 'REPLIED':
                        return (
                          <RepliedNotificationView
                            key={notification.id}
                            notification={notification}
                          />
                        );
                      case 'SUBSCRIBE':
                        return (
                          <SubscribeNotificationView
                            key={notification.id}
                            notification={notification}
                          />
                        );
                      case 'MAIL':
                        return (
                          <MailNotificationView
                            key={notification.id}
                            notification={notification}
                          />
                        );
                      case 'MASS_MAIL':
                        return (
                          <MassMailNotificationView
                            key={notification.id}
                            notification={notification}
                          />
                        );
                    }
                  })}
                </div>
              </div>
            );
          })}
          {data.isContinue && (
            <div className={styles['load-continue-button']} onClick={() => {}}>
              続きを読み込む
            </div>
          )}
        </section>
      )}
    </DefaultPage>
  );
};

export default Notifications;
