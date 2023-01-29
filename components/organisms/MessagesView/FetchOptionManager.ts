import { isEqual, isInteger } from 'lodash-es';

import {
  MessagesFetchCategory,
  MessagesFetchConfig,
  MessagesFetchType,
  NamedMessagesFetchConfig,
} from './types';

type MessagesFetchOption =
  | {
      type: 'latest' | 'initial';
      base?: undefined;
    }
  | {
      type: 'previous' | 'following';
      base: number;
    };

const newMessagesFetchConfig = (
  config: MessagesFetchConfig | NamedMessagesFetchConfig
): MessagesFetchConfig => {
  const newConfig = {
    ...config,
  } as MessagesFetchConfig & { name?: string };

  delete newConfig.name;

  return newConfig;
};

const categories: MessagesFetchCategory[] = [
  'all',
  'own',
  'follow',
  'replied',
  'follow-other',
  'replied-other',
  'list',
  'character',
  'character-replied',
  'search',
  'conversation',
];

const categoryNames: {
  [key in MessagesFetchCategory]: string;
} = {
  all: '全体',
  follow: 'フォロー中+自分',
  'follow-other': 'フォロー中',
  replied: '返信+自分',
  'replied-other': '返信',
  own: '自分',
  list: 'リスト',
  character: '指定キャラクター',
  'character-replied': '指定キャラクター会話',
  search: 'テキスト検索',
  conversation: '指定会話',
};

export const getCategoryName = (category: MessagesFetchCategory) => {
  return categoryNames[category];
};

export const getCategories = () => {
  return [...categories];
};

const isMessagesFetchCategory = (
  category: string
): category is MessagesFetchCategory => {
  return (categories as string[]).includes(category);
};

export const fetchConfigEqual = (
  a: MessagesFetchConfig | NamedMessagesFetchConfig,
  b: MessagesFetchConfig | NamedMessagesFetchConfig
) => {
  return isEqual(newMessagesFetchConfig(a), newMessagesFetchConfig(b));
};

export const deleteUnnecessaryOptions = (config: MessagesFetchConfig) => {
  const newConfig = { ...config };

  if (
    config.category != 'character' &&
    config.category != 'character-replied'
  ) {
    newConfig.character = null;
  }
  if (config.category != 'search') {
    newConfig.search = null;
  }
  if (config.category != 'list') {
    newConfig.list = null;
  }
  if (config.category != 'conversation') {
    newConfig.referRoot = null;
  }
  if (config.room == null) {
    newConfig.children = null;
  }

  return newConfig;
};

export const toMessagesFetchConfig = (query: string) => {
  const config: MessagesFetchConfig = {
    category: 'all',
    room: null,
    list: null,
    search: null,
    referRoot: null,
    character: null,
    relateFilter: true,
    children: true,
  };

  query.split('&').forEach((param) => {
    if (param.indexOf('=') == -1) {
      return;
    }

    const [key, value] = param.split('=');

    if (key == 'category' && isMessagesFetchCategory(value)) {
      config.category = value;
    }

    if (key == 'room') {
      const parsed = parseInt(value);
      if (0 < parsed && isInteger(parsed)) {
        config.room = parsed;
      }
    }

    if (key == 'search') {
      config.search = decodeURIComponent(value);
    }

    if (key == 'root') {
      const parsed = parseInt(value);
      if (0 < parsed && isInteger(parsed)) {
        config.referRoot = parsed;
      }
    }

    if (key == 'list') {
      const parsed = parseInt(value);
      if (0 < parsed && isInteger(parsed)) {
        config.list = parsed;
      }
    }

    if (key == 'character') {
      const parsed = parseInt(value);
      if (0 < parsed && isInteger(parsed)) {
        config.character = parsed;
      }
    }

    if (key == 'relates') {
      config.relateFilter = value === 'true';
    }

    if (key == 'children') {
      config.children = value === 'true';
    }
  });

  return config;
};

export const messagesFetchConfigError = (config: MessagesFetchConfig) => {
  if (config.category == 'character' && config.character == null) {
    return 'キャラクターを指定してください。';
  }
  if (config.category == 'character-replied' && config.character == null) {
    return 'キャラクターを指定してください。';
  }
  if (config.category == 'search' && !config.search) {
    return '検索する文字列を指定してください。';
  }
  if (config.category == 'list' && config.list == null) {
    return 'リストを指定してください。';
  }
  if (config.category == 'conversation' && config.referRoot == null) {
    return '参照する会話IDの取得に失敗しました。';
  }
};

export const toQueryString = (
  fetchConfig?: MessagesFetchConfig | NamedMessagesFetchConfig,
  fetchOption?: MessagesFetchOption
) => {
  const params: {
    key: string;
    value: string | number | boolean;
  }[] = [];

  if (fetchOption) {
    params.push({
      key: 'type',
      value: fetchOption.type,
    });

    if (fetchOption.base != undefined) {
      params.push({
        key: 'base',
        value: fetchOption.base,
      });
    }
  }

  if (fetchConfig) {
    const config = deleteUnnecessaryOptions(fetchConfig);

    if (config.room != null) {
      params.push({
        key: 'room',
        value: config.room,
      });
    }

    params.push({
      key: 'category',
      value: config.category,
    });

    if (config.search != null) {
      params.push({
        key: 'search',
        value: encodeURIComponent(config.search),
      });
    }

    if (config.referRoot != null) {
      params.push({
        key: 'root',
        value: config.referRoot,
      });
    }

    if (config.list != null) {
      params.push({
        key: 'list',
        value: config.list,
      });
    }

    if (config.character != null) {
      params.push({
        key: 'character',
        value: config.character,
      });
    }

    if (config.relateFilter != null) {
      params.push({
        key: 'relates',
        value: config.relateFilter,
      });
    }

    if (config.children != null) {
      params.push({
        key: 'children',
        value: config.children,
      });
    }
  }

  if (!params.length) {
    return '';
  }

  return '?' + params.map((param) => `${param.key}=${param.value}`).join('&');
};

export const toParsedUrlQueryInput = (
  fetchConfig?: MessagesFetchConfig | NamedMessagesFetchConfig,
  fetchOption?: MessagesFetchOption
) => {
  let s = toQueryString(fetchConfig, fetchOption);
  if (s.indexOf('?') == 0) {
    s = s.slice(1);
  }

  return s
    .split('&')
    .map((kv) => {
      const s = kv.split('=');
      return {
        key: s[0],
        value: s[1],
      };
    })
    .reduce<{ [key in string]: string }>((acc, kv) => {
      let value = kv.value;
      if (kv.key == 'search') {
        value = decodeURIComponent(value);
      }

      return {
        ...acc,
        [kv.key]: value,
      };
    }, {});
};
