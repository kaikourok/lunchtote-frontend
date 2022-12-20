import classnames from 'classnames';

import styles from './AnnouncementOverview.module.scss';

import InlineLink from '@/components/atoms/InlineLink/InlineLink';
import { getAnnouncementRelatedData } from 'lib/stringifyAnnouncementType';
import { stringifyDate } from 'lib/stringifyDate';


const AnnouncementOverview = (props: {
  id: number;
  type: AnnouncementType;
  overview: string;
  announcedAt: Date;
  updatedAt: Date;
  preview?: boolean;
}) => {
  const typeData = getAnnouncementRelatedData(props.type);

  const href = props.preview
    ? '#'
    : {
        pathname: '/announcements/[id]',
        query: {
          id: props.id,
        },
      };

  return (
    <section className={styles['announcement']}>
      <div className={styles['announcement-attributes']}>
        <div
          className={classnames(
            styles['announcement-type'],
            styles[`announcement-type-${typeData.cssClassName}`]
          )}
        >
          {typeData.text}
        </div>
        <div className={styles['announcement-timestamp']}>
          {stringifyDate(props.updatedAt)}
        </div>
      </div>
      <div className={styles['announcement-overview']}>
        <InlineLink href={href}>{props.overview}</InlineLink>
      </div>
    </section>
  );
};

export default AnnouncementOverview;
