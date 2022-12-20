import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';

const Introduction = () => {
  return (
    <DefaultPage>
      <PageData title="イントロダクション" />
      ◯◯へようこそ！まずは遊び方を読んでみてね、キャラクターのプロフィールとかを設定したい場合は◯◯から設定できるよみたいな感じのテキスト
    </DefaultPage>
  );
};

export default Introduction;
