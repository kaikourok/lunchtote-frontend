import { UrlObject } from 'url';

import { mdiAsterisk, mdiPound, mdiRhombusMedium } from '@mdi/js';
import Icon from '@mdi/react';
import classnames from 'classnames';
import Link from 'next/link';
import { Fragment, ReactNode } from 'react';

import {
  fetchConfigEqual,
  toParsedUrlQueryInput,
  toQueryString,
} from './FetchOptionManager';
import {
  MessagesFetchConfig,
  NamedMessagesFetchConfig,
  RoomRelations,
} from './types';

import roomClassName from 'lib/roomClassName';

type LeftMenuLinkProps = {
  label: string;
  href: string | UrlObject;
  icon: string;
  highlight?: boolean;
};

const LeftMenuLink = (props: LeftMenuLinkProps) => {
  return (
    <Link href={props.href}>
      <a
        className={classnames(roomClassName('left-menu-link'), {
          [roomClassName('highlight')]: props.highlight,
        })}
      >
        <div className={roomClassName('left-menu-link-icon-wrapper')}>
          <Icon
            className={roomClassName('left-menu-link-icon')}
            path={props.icon}
          />
        </div>
        <div className={roomClassName('left-menu-link-text')}>
          {props.label}
        </div>
      </a>
    </Link>
  );
};

const RoomLink = (props: {
  roomId: number;
  title: string;
  icon: string;
  currentFetchConfig: MessagesFetchConfig;
  href?: string | UrlObject;
  isCurrent?: boolean;
}) => {
  return (
    <LeftMenuLink
      href={
        props.href ?? {
          pathname: '/rooms/messages',
          query: toParsedUrlQueryInput({
            ...props.currentFetchConfig,
            room: props.roomId,
          }),
        }
      }
      label={props.title}
      highlight={props.isCurrent}
      icon={props.icon}
    />
  );
};

const RoomLinkGroups = (props: {
  currentRoomId: number;
  relations: RoomRelations;
  currentFetchConfig: MessagesFetchConfig;
}) => {
  const relations = props.relations;
  const currentFetchConfig = props.currentFetchConfig;

  const SiblingsWrapper = (props: { children: ReactNode }) => {
    return !relations.parent ? (
      <div>{props.children}</div>
    ) : (
      <div>
        <RoomLink
          roomId={relations.parent.id}
          title={relations.parent.title}
          icon={mdiPound}
          currentFetchConfig={currentFetchConfig}
        />
        <div className={roomClassName('room-link-deep-node')}>
          {props.children}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={roomClassName('left-menu-link-group')}>
        <div className={roomClassName('room-link-info')}>
          <RoomLink
            roomId={props.currentRoomId}
            title="トークルーム情報"
            icon={mdiRhombusMedium}
            href={{
              pathname: '/rooms/[id]/detail',
              query: { id: props.currentRoomId.toString() },
            }}
            currentFetchConfig={props.currentFetchConfig}
          />
        </div>
      </div>
      <div className={roomClassName('left-menu-link-group')}>
        <SiblingsWrapper>
          {props.relations.siblings.map((room) => {
            return (
              <Fragment key={room.id}>
                <RoomLink
                  roomId={room.id}
                  title={room.title}
                  icon={mdiPound}
                  isCurrent={room.id == props.currentRoomId}
                  currentFetchConfig={props.currentFetchConfig}
                />
                {room.id == props.currentRoomId &&
                  !!props.relations.children.length && (
                    <div className={roomClassName('room-link-deep-node')}>
                      {props.relations.children.map((room) => {
                        return (
                          <RoomLink
                            key={room.id}
                            roomId={room.id}
                            title={room.title}
                            icon={mdiPound}
                            currentFetchConfig={props.currentFetchConfig}
                          />
                        );
                      })}
                    </div>
                  )}
              </Fragment>
            );
          })}
        </SiblingsWrapper>
      </div>
    </>
  );
};

const MessagesViewLeftColumn = (props: {
  room: {
    id: number;
    relations: RoomRelations;
  } | null;
  currentFetchConfig: MessagesFetchConfig;
  savedFetchConfigs: NamedMessagesFetchConfig[];
}) => {
  return (
    <div className={roomClassName('left-column')}>
      <div className={roomClassName('left-menu-link-group')}>
        {props.savedFetchConfigs.map((config, index) => {
          return (
            <LeftMenuLink
              key={index}
              label={config.name}
              href={toQueryString(config)}
              icon={mdiAsterisk}
              highlight={fetchConfigEqual(props.currentFetchConfig, config)}
            />
          );
        })}
      </div>
      {!!props.room && (
        <RoomLinkGroups
          currentRoomId={props.room.id}
          relations={props.room.relations}
          currentFetchConfig={props.currentFetchConfig}
        />
      )}
    </div>
  );
};

export default MessagesViewLeftColumn;
