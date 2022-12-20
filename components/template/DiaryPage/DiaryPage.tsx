import Link from 'next/link';

import styles from './DiaryPage.module.scss';

import CharacterIcon from '@/components/atoms/CharacterIcon/CharacterIcon';
import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import SubHeading from '@/components/atoms/SubHeading/SubHeading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import characterIdText from 'lib/characterIdText';


const DiaryPage = (props: {
  title: string;
  diary: string;
  character: CharacterOverview;
  diaryExistings: number[];
  preview?: boolean;
}) => {
  return (
    <DefaultPage>
      <PageData title={props.title + (props.preview ? ' (プレビュー)' : '')} />
      <SubHeading>{props.title}</SubHeading>
      <div className={styles['columns']}>
        <div className={styles['sub-column']}>
          {props.preview ? (
            <div className={styles['diary-nth-link']}>第N回</div>
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
                        character: props.character.id,
                        nth: nth,
                      },
                    }}
                  >
                    <a className={styles['diary-nth-link']}>第{nth}回</a>
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
                query: { id: props.character.id },
              }}
            >
              <a className={styles['character-link']}>
                <span className={styles['character-name']}>
                  {props.character.name}
                </span>
                <span className={styles['character-id']}>
                  {characterIdText(props.character.id)}
                </span>
              </a>
            </Link>
            <CharacterIcon url={props.character.mainicon} mini />
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
