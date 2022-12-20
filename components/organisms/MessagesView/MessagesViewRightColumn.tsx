import { mdiCheck, mdiSwapHorizontal, mdiSwapHorizontalBold } from '@mdi/js';
import Icon from '@mdi/react';
import classnames from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import SelectAsync from 'react-select/async';

import {
  getCategories,
  getCategoryName,
  toQueryString,
} from './FetchOptionManager';
import { MessagesFetchConfig } from './types';

import SelectOption from '@/components/atoms/SelectOption/SelectOption';
import roomClassName from 'lib/roomClassName';


const ToggleMenu = (props: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  stable?: boolean;
}) => {
  return (
    <div
      onClick={() => props.onChange(!props.value)}
      className={classnames(
        roomClassName('right-toggle-menu'),
        {
          [roomClassName('disabled')]: !props.value,
        },
        {
          [roomClassName('stable')]: !!props.stable,
        }
      )}
    >
      <div className={roomClassName('right-toggle-menu-icon')}>
        <Icon path={props.stable ? mdiSwapHorizontal : mdiCheck} />
      </div>
      <div className={roomClassName('right-toggle-menu-label')}>
        {props.label}
      </div>
    </div>
  );
};

const MessagesViewRightColumn = (props: {
  currentFetchConfig: MessagesFetchConfig;
}) => {
  const router = useRouter();
  const [search, setSearch] = useState(props.currentFetchConfig.search || '');

  useEffect(() => {
    if (props.currentFetchConfig.search != null) {
      setSearch(props.currentFetchConfig.search);
    }
  }, [props.currentFetchConfig.search]);

  // 指定会話条件は選択されている時以外は出ないように
  const categories =
    props.currentFetchConfig.category == 'conversation'
      ? getCategories()
      : getCategories().filter((category) => category != 'conversation');

  return (
    <div className={roomClassName('right-column')}>
      {router.isReady && (
        <SelectOption
          options={categories.map((category) => ({
            label: getCategoryName(category),
            value: category,
          }))}
          value={props.currentFetchConfig.category}
          onChange={(category) => {
            const newFetchConfig: MessagesFetchConfig = {
              ...props.currentFetchConfig,
              category: category,
            };

            router.push(router.pathname + toQueryString(newFetchConfig));
          }}
        />
      )}
      {props.currentFetchConfig.category == 'search' && (
        <div className={roomClassName('text-search-wrapper')}>
          <input
            className={roomClassName('text-search-input')}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="検索するテキスト"
          />
          <button
            className={classnames(roomClassName('text-search-button'), {
              [roomClassName('disabled')]: !search,
            })}
            type="button"
            onClick={() => {
              if (!search) {
                toast.error('検索するテキストを入力して下さい');
                return;
              }

              const newFetchConfig: MessagesFetchConfig = {
                ...props.currentFetchConfig,
                search: search,
              };

              router.push(router.pathname + toQueryString(newFetchConfig));
            }}
          >
            検索
          </button>
        </div>
      )}
      {props.currentFetchConfig.category == 'list' && (
        <div style={{ marginTop: 5 }}>
          <SelectAsync placeholder="リストを選択" />
        </div>
      )}
      {(props.currentFetchConfig.category == 'character' ||
        props.currentFetchConfig.category == 'character-replied') && (
        <div style={{ marginTop: 5 }}>
          <SelectAsync placeholder="キャラクターを検索" />
        </div>
      )}
      <ToggleMenu
        label="関連性の薄い発言を非表示"
        value={!!props.currentFetchConfig.relateFilter}
        onChange={(relateFilter) => {
          const newFetchConfig: MessagesFetchConfig = {
            ...props.currentFetchConfig,
            relateFilter,
          };

          router.push(router.pathname + toQueryString(newFetchConfig));
        }}
      />
      {props.currentFetchConfig.room != null && (
        <ToggleMenu
          label="所属ルームの発言も取得"
          value={!!props.currentFetchConfig.children}
          onChange={(children) => {
            const newFetchConfig: MessagesFetchConfig = {
              ...props.currentFetchConfig,
              children,
            };

            router.push(router.pathname + toQueryString(newFetchConfig));
          }}
        />
      )}
    </div>
  );
};

export default MessagesViewRightColumn;
