type CharacterListItem = {
  id: number;
  name: string;
  summary: string;
  mainicon: string;
  tags: string[];
  isFollowing?: boolean;
  isFollowed?: boolean;
  isMuting?: boolean;
  isBlocking?: boolean;
};

type AnnouncementType = 'UPDATE' | 'ANNOUNCE' | 'IMPORTANT';

type CharacterInlineSearchResult = {
  id: number;
  text: string;
};

type RoomOverview = {
  id: number;
  title: string;
};

type RoomListItem = {
  id: number;
  master: {
    id: number;
    name: string;
  };
  title: string;
  summary: string;
  tags: string[];
  official: boolean;
  messagesCount: number;
  membersCount: number;
  lastUpdate: string;
  postsPerDay: number;
  followedMembers?: CharacterOverview[];
};

type RoleType = 'VISITOR' | 'INVITED' | 'DEFAULT' | 'MEMBER' | 'MASTER';

type ForumPostType = 'ANONYMOUS' | 'SIGNED_IN' | 'ADMINISTRATOR';

type ForumSender =
  | {
      postType: 'ANONYMOUS';
      name: string;
      character: null;
      identifier: string;
    }
  | {
      postType: 'SIGNED_IN';
      name: string;
      character: int;
      identifier: null;
    }
  | {
      postType: 'ADMINISTRATOR';
      name: string;
      character: null;
      identifier: null;
    };

type ForumTopicStatus = 'OPEN' | 'CLOSE';

type CharacterOverview = {
  id: number;
  name: string;
  mainicon: string;
};

type CharacterIcon = {
  path: string;
};

type RoomPermission = {
  write: boolean;
  ban: boolean;
  invite: boolean;
  useReply: boolean;
  useSecret: boolean;
  deleteOtherMessage: boolean;
};

type RelationPermission =
  | 'DISALLOW'
  | 'FOLLOW'
  | 'FOLLOWED'
  | 'MUTUAL_FOLLOW'
  | 'ALL';

type ListOverview = {
  id: number;
  name: string;
};

type Role = {
  id: number;
  prioriry: number;
  name: string;
  write: boolean | null;
  ban: boolean | null;
  invite: boolean | null;
  useReply: boolean | null;
  useSecret: boolean | null;
  deleteOtherMessage: boolean | null;
  createChildrenRoom: boolean | null;
  color: string | null;
  type: RoleType;
};
