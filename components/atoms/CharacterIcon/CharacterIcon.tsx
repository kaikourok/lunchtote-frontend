import classNames from 'classnames';
import React from 'react';

import styles from './CharacterIcon.module.scss';

const uploaderPath = process.env.NEXT_PUBLIC_UPLOADER_PATH!;

type CharacterIconProps = {
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
  url?: string | null;
  mini?: boolean;
  direct?: boolean;
};

const CharacterIcon = (props: CharacterIconProps) => {
  if (props.url) {
    const isDataUri = props.url && props.url.startsWith('data:');

    return (
      <img
        onClick={props.onClick}
        className={classNames(styles['character-icon'], props.className, {
          [styles['mini']]: !!props.mini,
        })}
        src={(isDataUri || props.direct ? '' : uploaderPath) + props.url}
      />
    );
  } else {
    return (
      <div
        onClick={props.onClick}
        className={classNames(
          styles['character-icon'],
          props.className,
          styles.noimage,
          {
            [styles['mini']]: !!props.mini,
          }
        )}
      />
    );
  }
};

export default CharacterIcon;
