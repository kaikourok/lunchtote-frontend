import Link from 'next/link';

import styles from './DiaryOverviewList.module.scss';

import CharacterIcon from '@/components/atoms/CharacterIcon/CharacterIcon';
import characterIdText from 'lib/characterIdText';

const DiaryOverviewList = (props: {
  nth: number;
  diaries: DiaryOverview[];
}) => {
  return (
    <section className={styles['diary-overviews']}>
      {props.diaries.map((diary) => {
        return (
          <div key={diary.author.id} className={styles['diary-overview']}>
            <Link
              href={{
                pathname: '/diaries/[nth]/[character]',
                query: {
                  nth: props.nth,
                  character: diary.author.id,
                },
              }}
            >
              <a className={styles['diary-title']}>{diary.title}</a>
            </Link>
            <div className={styles['diary-attributes']}>
              <Link
                href={{
                  pathname: '/characters/[id]',
                  query: { id: diary.author.id },
                }}
              >
                <a className={styles['diary-link']}>
                  <div className={styles['diary-author-names']}>
                    <span className={styles['diary-author-name']}>
                      {diary.author.name}
                    </span>
                    <span className={styles['diary-author-id']}>
                      {characterIdText(diary.author.id)}
                    </span>
                  </div>
                  <CharacterIcon url={diary.author.mainicon} mini />
                </a>
              </Link>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default DiaryOverviewList;
