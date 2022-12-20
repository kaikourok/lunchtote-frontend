import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useSWR from 'swr';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import SubHeading from '@/components/atoms/SubHeading/SubHeading';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import SectionWrapper from '@/components/template/SectionWrapper/SectionWrapper';
import styles from '@/styles/pages/notification.module.scss';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import { stringifyDate } from 'lib/stringifyDate';
import { readNotifications } from 'store/actions/character';

type Notification = {
  type: 'FOLLOWED' | 'REPLIED';
  icon: string | null;
  message: string;
  detail: string;
  value: string;
  timestamp: string;
};

type Response = {
  notifications: Notification[];
  isContinue: boolean;
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
      <SubHeading>通知</SubHeading>
      <SectionWrapper>
        {!notificationsGroupedByDay.length ? (
          <CommentarySection>通知はまだありません</CommentarySection>
        ) : (
          notificationsGroupedByDay.map((group) => {
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
                    return (
                      <div
                        key={notification.timestamp}
                        className={styles['notification']}
                      >
                        <div className={styles['notification-message']}>
                          {notification.message}
                        </div>
                        {notification.detail && (
                          <div className={styles['notification-detail']}>
                            {notification.detail}
                          </div>
                        )}
                        <div className={styles['notification-date']}>
                          {stringifyDate(new Date(notification.timestamp))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
        {data.isContinue && (
          <div className={styles['load-continue-button']} onClick={() => {}}>
            続きを読み込む
          </div>
        )}
      </SectionWrapper>
    </DefaultPage>
  );
};

export default Notifications;
