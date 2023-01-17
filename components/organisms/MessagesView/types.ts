export type MessagesFetchType = 'latest' | 'initial' | 'previous' | 'following';

export type MessagesFetchCategory =
  | 'all'
  | 'follow'
  | 'follow-other'
  | 'replied'
  | 'replied-other'
  | 'own'
  | 'conversation'
  | 'search'
  | 'list'
  | 'character'
  | 'character-replied';

export type MessagesFetchConfig = {
  category: MessagesFetchCategory;
  room: number | null;
  search: string | null;
  referRoot: number | null;
  list: number | null;
  character: number | null;
  relateFilter: boolean | null;
  children: boolean | null;
};

export type NamedMessagesFetchConfig = MessagesFetchConfig & {
  name: string;
};

export type RoomMessageRecipient = {
  id: number;
  name: string;
};

export type RoomMessage = {
  id: number;
  character: number;
  refer: number | null;
  referRoot: number | null;
  secret: boolean;
  icon: string | null;
  name: string;
  message: string;
  repliedCount: number;
  postedAt: string | null;
  replyPermission: RelationPermission;
  replyable: boolean;
  room: {
    id: number;
    title: string;
  };
  recipients: RoomMessageRecipient[];
};

export type RoomOverview = {
  id: number;
  title: string;
};

export type RoomRelations = {
  parent: RoomOverview | null;
  siblings: RoomOverview[];
  children: RoomOverview[];
};

export type RoomOwnPermissions = {
  banned: boolean;
  permissions: RoomPermission;
};
