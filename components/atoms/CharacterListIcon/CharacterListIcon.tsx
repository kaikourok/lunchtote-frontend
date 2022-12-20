import classNames from 'classnames';

import styles from './CharacterListIcon.module.scss';

const uploaderPath = process.env.NEXT_PUBLIC_UPLOADER_PATH!;

const CharacterListIcon = (props: {
  onClick?: (event: React.MouseEvent) => void;
  url?: string | null;
  direct?: boolean;
}) => {
  if (props.url) {
    const isDataUri = props.url && props.url.startsWith('data:');

    return (
      <div className={styles['character-list-icon-wrapper']}>
        <img
          onClick={props.onClick}
          className={styles['character-list-icon']}
          src={(isDataUri || props.direct ? '' : uploaderPath) + props.url}
        />
      </div>
    );
  } else {
    return (
      <div
        onClick={props.onClick}
        className={classNames(styles['character-list-icon'], styles['noimage'])}
      />
    );
  }
};

export default CharacterListIcon;
