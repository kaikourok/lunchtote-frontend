import classnames from 'classnames';
import { marked } from 'marked';

import styles from './AnnouncementDetail.module.scss';

import { getAnnouncementRelatedData } from 'lib/stringifyAnnouncementType';
import { stringifyDate } from 'lib/stringifyDate';

const AnnouncementDetail = (props: {
  id: number;
  type: AnnouncementType;
  announcedAt: Date;
  updatedAt: Date;
  title: string;
  content: string;
}) => {
  const typeData = getAnnouncementRelatedData(props.type);

  return (
    <section>
      <section className={styles['announcement-attributes']}>
        <div
          className={classnames(
            styles['announcement-type'],
            styles[`announcement-type-${typeData.cssClassName}`]
          )}
        >
          {typeData.text}
        </div>
        <div className={styles['announcement-timestamp']}>
          {stringifyDate(props.announcedAt)}
          {props.announcedAt.getTime() != props.updatedAt.getTime() && (
            <span className={styles['announcement-timestamp-updated']}>
              (更新: {stringifyDate(props.updatedAt)})
            </span>
          )}
        </div>
      </section>
      <section
        className={styles['announcement-content']}
        dangerouslySetInnerHTML={{
          __html: marked.parse(props.content),
        }}
      />
    </section>
  );
};

export default AnnouncementDetail;
