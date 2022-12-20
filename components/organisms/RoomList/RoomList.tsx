import { UrlObject } from 'node:url';

import { mdiAccount, mdiClockOutline, mdiMessage } from '@mdi/js';
import Icon from '@mdi/react';
import Link from 'next/link';

import styles from './RoomList.module.scss';

import characterIdText from 'lib/characterIdText';
import roomIdText from 'lib/roomIdText';
import { stringifyDate } from 'lib/stringifyDate';

type RoomListItemProps = RoomListItem & {
  linkTo?: (roomId: number) => UrlObject;
};

const RoomListItem = (props: RoomListItemProps) => {
  return (
    <section className={styles['room']}>
      <Link
        href={
          props.linkTo
            ? props.linkTo(props.id)
            : { pathname: '/rooms/[id]', query: { id: props.id } }
        }
      >
        <a className={styles['room-heading']}>
          <span className={styles['room-title']}>{props.title}</span>
          <span className={styles['room-id']}>{roomIdText(props.id)}</span>
        </a>
      </Link>
      <div className={styles['room-tags']}>
        {props.tags.map((tag, index) => (
          <div key={index} className={styles['room-tag']}>
            {tag}
          </div>
        ))}
      </div>
      <div className={styles['room-summary']}>{props.summary}</div>
      <div className={styles['room-footer']}>
        <div className={styles['room-details']}>
          <div className={styles['room-detail']}>
            <div className={styles['room-detail-icon-wrapper']}>
              <Icon path={mdiMessage} />
            </div>
            <div className={styles['room-detail-value']}>
              {props.messagesCount}
            </div>
          </div>
          <div className={styles['room-detail']}>
            <div className={styles['room-detail-icon-wrapper']}>
              <Icon path={mdiAccount} />
            </div>
            <div className={styles['room-detail-value']}>
              {props.membersCount}
            </div>
          </div>
          <div className={styles['room-detail']}>
            <div className={styles['room-detail-icon-wrapper']}>
              <Icon path={mdiClockOutline} />
            </div>
            <div className={styles['room-detail-value']}>
              {stringifyDate(new Date(props.lastUpdate))}
            </div>
          </div>
        </div>
        <div className={styles['room-master']}>
          <div className={styles['room-master-names']}>
            <span className={styles['room-master-name']}>
              {props.master.name}
            </span>
            <span className={styles['room-master-id']}>
              {characterIdText(props.master.id)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

type RoomListProps = {
  rooms: RoomListItemProps[];
};

const RoomList = (props: RoomListProps) => {
  return (
    <section className={styles['room-list']}>
      {props.rooms.map((room) => (
        <RoomListItem key={room.id} {...room} />
      ))}
    </section>
  );
};

export default RoomList;
