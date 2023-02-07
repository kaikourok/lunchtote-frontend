import { mdiViewList, mdiViewModule } from '@mdi/js';
import classNames from 'classnames';
import Link from 'next/link';
import { CSSProperties, useEffect, useRef, useState } from 'react';

import styles from './CharacterList.module.scss';

import Button from '@/components/atoms/Button/Button';
import characterIdText from 'lib/characterIdText';

const uploaderPath = process.env.NEXT_PUBLIC_UPLOADER_PATH!;

type ViewMode = 'DETAIL' | 'OVERVIEW';

const getNextViewMode = (mode: ViewMode): ViewMode => {
  switch (mode) {
    case 'DETAIL':
      return 'OVERVIEW';
    case 'OVERVIEW':
      return 'DETAIL';
  }
};

const getViewModeDisp = (
  mode: ViewMode
): {
  icon: string;
  name: string;
} => {
  switch (mode) {
    case 'DETAIL':
      return {
        icon: mdiViewList,
        name: '詳細表示',
      };
    case 'OVERVIEW':
      return {
        icon: mdiViewModule,
        name: '一覧表示',
      };
  }
};

type CharacterListItemProps = {
  id: number;
  name: string;
  nickname: string;
  summary: string;
  listImage: string;
  tags: string[];
  isFollowing?: boolean;
  isFollowed?: boolean;
  isMuting?: boolean;
  isBlocking?: boolean;
};

type CharacterListItemPropsInternal = {
  style?: CSSProperties;
  action?: string;
  onAction?: () => void;
  actionEnabled?: boolean;
  selected?: boolean;
  onSelect?: (id: number) => void;
  lightMode?: boolean;
};

const CharacterListItem = (
  props: CharacterListItemProps & CharacterListItemPropsInternal
) => {
  return (
    <section
      style={props.style}
      className={classNames(
        styles['character'],
        {
          [styles['selected']]: !!props.selected,
        },
        {
          [styles['light-mode']]: !!props.lightMode,
        }
      )}
      onClick={() => {
        if (props.onSelect) {
          props.onSelect(props.id);
        }
      }}
    >
      <div className={styles['character-list-view']}>
        <div className={styles['character-list-view-background']} />
        <div className={styles['character-list-image-wrapper']}>
          {!!props.listImage && (
            <img
              className={styles['character-list-image']}
              src={uploaderPath + props.listImage}
            />
          )}
        </div>
        <div className={styles['character-list-id']}>
          <span className={styles['first-letter']}>
            {characterIdText(props.id).slice(0, 1)}
          </span>
          {characterIdText(props.id).slice(1)}
        </div>
      </div>
      <div className={styles['character-details']}>
        <Link href={`/characters/${props.id}`}>
          <a className={styles['character-names']}>
            <span className={styles['character-name']}>{props.name}</span>
            <span className={styles['character-id']}>
              {characterIdText(props.id)}
            </span>
          </a>
        </Link>
        <div className={styles['character-summary']}>{props.summary}</div>
      </div>
    </section>
  );
};

const CharactersOverviewList = (props: {
  characters: CharacterListItemProps[];
}) => {
  const characterListRef = useRef<HTMLDivElement>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(
    null
  );
  const [characterListRectWidth, setCharacterListRectWidth] = useState(0);

  useEffect(() => {
    if (characterListRef.current) {
      const handleResize = () => {
        setCharacterListRectWidth(
          characterListRef.current!.getBoundingClientRect().width
        );
      };

      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [characterListRef.current]);

  type ListCharacter = CharacterListItemProps & {
    type: 'character';
  };

  type ListIndexer = {
    type: 'indexer';
    index: number;
  };

  type ListItem = ListCharacter | ListIndexer;

  const listItems: ListItem[] = [];
  for (let i = 0; i < props.characters.length; i++) {
    listItems.push({ type: 'character', ...props.characters[i] });
  }

  const characterListItemWidth = 90;
  const characterListItemHeight = 120;
  const characterListItemGap = 5;

  const rowItemNumber = Math.floor(
    (characterListRectWidth - characterListItemGap) /
      (characterListItemWidth + characterListItemGap)
  );

  const itemsWidth =
    characterListItemWidth * rowItemNumber +
    characterListItemGap * (rowItemNumber - 1);

  const sideMargin = (characterListRectWidth - itemsWidth) / 2;

  const columnItemNumber = Math.ceil(listItems.length / rowItemNumber);

  const characterListHeight =
    characterListItemHeight * columnItemNumber +
    characterListItemGap * (columnItemNumber - 1);

  let selectedCharacterRow: number | null = null;
  for (let i = 0; i < props.characters.length; i++) {
    if (props.characters[i].id == selectedCharacterId) {
      selectedCharacterRow = Math.floor(i / rowItemNumber);
    }
  }

  return (
    <section
      className={styles['character-list']}
      style={{
        height: characterListHeight,
      }}
      ref={characterListRef}
    >
      {props.characters.map((character, index) => {
        const isSelected = character.id == selectedCharacterId;
        const column = index % rowItemNumber;
        const row = Math.floor(index / rowItemNumber);

        const top = (characterListItemHeight + characterListItemGap) * row;
        const left = isSelected
          ? sideMargin
          : sideMargin +
            (characterListItemWidth + characterListItemGap) * column;

        return (
          <CharacterListItem
            key={character.id}
            {...character}
            onSelect={(id) => {
              if (id != selectedCharacterId) {
                setSelectedCharacterId(id);
              } else {
                setSelectedCharacterId(null);
              }
            }}
            selected={isSelected}
            style={{
              cursor: 'pointer',
              position: 'absolute',
              userSelect: 'none',
              transform: `translate(${left}px, ${top}px)`,
              width: isSelected ? itemsWidth : characterListItemWidth,
              opacity: selectedCharacterRow == row && !isSelected ? 0 : 1,
            }}
          />
        );
      })}
    </section>
  );
};

const CharactersDetailList = (props: {
  characters: CharacterListItemProps[];
}) => {
  return (
    <section className={styles['character-detail-list']}>
      {props.characters.map((character) => {
        return (
          <CharacterListItem
            key={character.id}
            {...character}
            selected={true}
            lightMode
          />
        );
      })}
    </section>
  );
};

const CharacterList = (props: { characters: CharacterListItemProps[] }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('DETAIL');

  return (
    <>
      <div className={styles['view-toggle']}>
        <Button
          icon={getViewModeDisp(viewMode).icon}
          onClick={() => setViewMode(getNextViewMode(viewMode))}
        >
          {getViewModeDisp(viewMode).name}
        </Button>
      </div>
      {viewMode == 'DETAIL' && (
        <CharactersDetailList characters={props.characters} />
      )}
      {viewMode == 'OVERVIEW' && (
        <CharactersOverviewList characters={props.characters} />
      )}
    </>
  );
};

export default CharacterList;
