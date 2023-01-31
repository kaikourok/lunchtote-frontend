import type { NextPage } from 'next';

import ReaderPage, {
  ReaderNode,
} from '@/components/template/ReaderPage/ReaderPage';
import styles from '@/styles/pages/guide/words.module.scss';
import wordGroups from 'constants/guide/word';

const GuideWords: NextPage = () => {
  const nodes: ReaderNode[] = wordGroups.map((group) => {
    return {
      heading: group.heading,
      headingLevel: 1,
      body: (
        <section className={styles['words']}>
          {group.words.map((word, index) => {
            return (
              <div key={index} className={styles['word']}>
                <div className={styles['word-names']}>
                  <div className={styles['word-name']}>{word.word}</div>
                  {word.alternateName !== undefined && (
                    <div className={styles['word-alternate-name']}>
                      {word.alternateName}
                    </div>
                  )}
                </div>
                <div className={styles['word-description']}>
                  {word.description}
                </div>
              </div>
            );
          })}
        </section>
      ),
    };
  });

  return <ReaderPage title="交流のマナー" nodes={nodes} />;
};

export default GuideWords;
