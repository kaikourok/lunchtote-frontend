import { UrlObject } from 'node:url';

import {
  mdiAccount,
  mdiClockOutline,
  mdiMessage,
  mdiTrendingUp,
} from '@mdi/js';
import Icon from '@mdi/react';
import Link from 'next/link';

import styles from './RoomList.module.scss';

import CharacterIcon from '@/components/atoms/CharacterIcon/CharacterIcon';
import characterIdText from 'lib/characterIdText';
import roomIdText from 'lib/roomIdText';
import { stringifyDate } from 'lib/stringifyDate';

type RoomListItemProps = RoomListItem & {
  linkTo?: (roomId: number) => UrlObject;
};

const RoomListItem = (props: RoomListItemProps) => {
  return (
    <section className={styles['room']}>
      <div className={styles['room-data']}>
        <div className={styles['room-heading']}>
          <Link
            href={
              props.linkTo
                ? props.linkTo(props.id)
                : { pathname: '/rooms/messages', query: { room: props.id } }
            }
          >
            <a className={styles['room-titles']}>
              <span className={styles['room-title']}>{props.title}</span>
              <span className={styles['room-id']}>{roomIdText(props.id)}</span>
            </a>
          </Link>
          <Link
            href={{
              pathname: '/characters/[id]',
              query: { id: props.master.id },
            }}
          >
            <a className={styles['room-master-names']}>
              <span className={styles['room-master-name']}>
                {props.master.name}
              </span>
              <span className={styles['room-master-id']}>
                {characterIdText(props.master.id)}
              </span>
            </a>
          </Link>
        </div>
        <div className={styles['room-tags']}>
          {props.tags.map((tag, index) => (
            <div key={index} className={styles['room-tag']}>
              {tag}
            </div>
          ))}
        </div>
        <div className={styles['room-summary']}>{props.summary}</div>
        {!!props.followedMembers && !!props.followedMembers.length && (
          <div className={styles['room-members']}>
            {props.followedMembers.map((member) => {
              return (
                <div className={styles['room-member']} key={member.id}>
                  <div className={styles['room-member-icon-wrapper']}>
                    <CharacterIcon url={member.mainicon} mini />
                  </div>
                  <div className={styles['room-member-names']}>
                    <span className={styles['room-member-name']}>
                      {member.name}
                    </span>
                    <span className={styles['room-member-id']}>
                      {characterIdText(member.id)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className={styles['room-attributes']}>
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
              <Icon path={mdiTrendingUp} />
            </div>
            <div className={styles['room-detail-value']}>
              {props.postsPerDay.toFixed(2)}
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
