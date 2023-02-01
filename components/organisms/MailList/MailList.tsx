import classNames from 'classnames';
import Link from 'next/link';

import styles from './MailList.module.scss';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import characterIdText from 'lib/characterIdText';
import { stringifyDate } from 'lib/stringifyDate';

type MailBase = {
  id: number;
  title: string;
  timestamp: Date;
  message: string;
  items: {
    id: number;
    name: string;
    quantity: number;
  }[];
};

type SentMail = {
  type: 'sent';
  read?: undefined;
  collected?: undefined;
  sender?: undefined;
  receiver: {
    id: number;
    name: string;
  };
} & MailBase;

type ReceivedMail = {
  type: 'received';
  read: boolean;
  collected: boolean;
  receiver?: undefined;
  sender: {
    id: number | null; // null = 管理者
    name: string;
  };
} & MailBase;

type Mail = SentMail | ReceivedMail;

type MailTargetProps = {
  type: 'sent' | 'received';
  target: {
    name: string;
    id: number | null;
  };
};

const MailTarget = (props: MailTargetProps) => {
  const inner = (
    <>
      <div className={styles['mail-info-heading']}>
        {props.type == 'sent' ? 'To' : 'From'}
      </div>
      <div className={styles['mail-info-body']}>
        <div className={styles['mail-target-name']}>{props.target.name}</div>
        {props.target.id != null && (
          <div className={styles['mail-target-id']}>
            {characterIdText(props.target.id)}
          </div>
        )}
      </div>
    </>
  );

  if (props.target.id != null) {
    return (
      <Link
        href={{
          pathname: '/characters/[id]',
          query: { id: props.target.id },
        }}
      >
        <a className={styles['mail-info']}>{inner}</a>
      </Link>
    );
  } else {
    return <div className={styles['mail-info']}>{inner}</div>;
  }
};

type MailListProps = {
  mails: Mail[];
  onRead?: (id: number) => void;
};

const MailList = (props: MailListProps) => {
  if (!props.mails.length) {
    return <CommentarySection>メールはありません。</CommentarySection>;
  }

  return (
    <div className={styles['mails']}>
      {props.mails.map((mail) => {
        return (
          <details className={styles['mail']} key={mail.id}>
            <summary
              className={classNames(styles['mail-overviews'], {
                [styles['unread']]: mail.type == 'received' && !mail.read,
              })}
              onClick={() => {
                if (!mail.read && props.onRead) {
                  props.onRead(mail.id);
                }
              }}
            >
              <div className={styles['open-icon-area']}>▲</div>
              <div
                className={classNames(styles['mail-title'], {
                  [styles['no-title']]: !mail.title,
                })}
              >
                {mail.title || '(無題)'}
              </div>
              <div className={styles['mail-date']}>
                {stringifyDate(mail.timestamp)}
              </div>
            </summary>
            <div className={styles['mail-details']}>
              <MailTarget
                type={mail.type}
                target={mail.type == 'sent' ? mail.receiver : mail.sender}
              />
              <div className={styles['mail-info']}>
                <div className={styles['mail-info-heading']}>Date</div>
                <div className={styles['mail-info-body']}>
                  {stringifyDate(mail.timestamp)}
                </div>
              </div>
              <div className={styles['mail-message']}>{mail.message}</div>
            </div>
          </details>
        );
      })}
    </div>
  );
};

export default MailList;
