import Link from 'next/link';

import styles from './DiaryPage.module.scss';

import CharacterIcon from '@/components/atoms/CharacterIcon/CharacterIcon';
import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Heading from '@/components/atoms/Heading/Heading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import characterIdText from 'lib/characterIdText';

const DiaryPage = (props: {
  title: string;
  diary: string;
  author: CharacterOverview;
  diaryExistings: number[];
  preview?: boolean;
}) => {
  return (
    <DefaultPage>
      <PageData title={props.title + (props.preview ? ' (プレビュー)' : '')} />
      <Heading>{props.title}</Heading>
      <div className={styles['columns']}>
        <div className={styles['sub-column']}>
          {props.preview ? (
            <div className={styles['diary-nth-link']}>第N更新</div>
          ) : (
            props.diaryExistings
              .sort((a, b) => b - a)
              .map((nth) => {
                return (
                  <Link
                    key={nth}
                    href={{
                      pathname: '/diaries/[character]/[nth]',
                      query: {
                        character: props.author.id,
                        nth: nth,
                      },
                    }}
                  >
                    <a className={styles['diary-nth-link']}>第{nth + 1}更新</a>
                  </Link>
                );
              })
          )}
        </div>
        <div className={styles['main-column']}>
          {props.preview && (
            <CommentarySection closeable>
              表示内容はプレビューです。次回の更新タイミングで日記が表示のように投稿されます。
            </CommentarySection>
          )}
          <section className={styles['character-info']}>
            <Link
              href={{
                pathname: '/characters/[id]',
                query: { id: props.author.id },
              }}
            >
              <a className={styles['character-link']}>
                <span className={styles['character-name']}>
                  {props.author.name}
                </span>
                <span className={styles['character-id']}>
                  {characterIdText(props.author.id)}
                </span>
              </a>
            </Link>
            <CharacterIcon url={props.author.mainicon} mini />
          </section>
          <section
            className={styles['diary']}
            dangerouslySetInnerHTML={{ __html: props.diary }}
          />
        </div>
      </div>
    </DefaultPage>
  );
};

export default DiaryPage;
