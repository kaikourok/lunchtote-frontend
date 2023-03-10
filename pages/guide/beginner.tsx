import type { NextPage } from 'next';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Heading from '@/components/atoms/Heading/Heading';
import InlineLink from '@/components/atoms/InlineLink/InlineLink';
import Annotations from '@/components/organisms/Annotations/Annotations';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';

const RulebookGuideBeginnerIntroduction: NextPage = () => {
  return (
    <DefaultPage>
      <PageData title="ビギナーガイド" />
      <Heading>ビギナーガイド</Heading>
      <CommentarySection>
        このページでは、交流ゲーム初心者、あるいは初めての方に向けた解説を行っています。類似のゲームと多少違う部分もあるので、慣れている方も一度目を通しておくとよいかもしれません。
      </CommentarySection>
      <h1>キャラクター交流型ウェブゲームってどんなもの？</h1>
      <h1>どんなキャラクターでいくべき？</h1>
      <p>
        もし、多人数で交流するゲームが初めてなら
        <b>人に話しかけやすいキャラクターのほうが遊びやすい</b>かもしれません。
        少人数の環境と違い、多人数で交流するゲームでは、自分から話しかけないと交流を持てない場合も少なくありません。
        その際、明るいキャラクターや好奇心旺盛なキャラクターなどであれば交友関係を持ちやすいです。
      </p>
      <p>
        反面、無口なキャラクターやものぐさなキャラクターは人に話しかけづらいため、人と交流を持ちづらい傾向にあります。
        ロールプレイにまだ不慣れで、交流相手を別の方法などで確保できない場合、人に話しかけやすいキャラクターにしたほうがよいかもしれません。
      </p>
      <p>
        もちろん、このようなキャラクターをしてはいけないというわけではありません。交流を持ちづらいとしても、こんなキャラクターがやりたい！というものがある場合、何らかの方法で他のキャラクターと関わろうとすることをより意識しておくとよいでしょう。
      </p>
      <h1>イラストを用意してみよう</h1>
      <p>
        イラストがなくとも交流を行うことはできますが、イラストには
        <b>
          自分のキャラクターがどういう見た目のキャラクターなのかがわかって貰いやすくなる
        </b>
        などの効果がある他、<b>発言欄が華やかになって好印象にも繋がりやすく</b>
        なったり、
        <b>表情差分で感情の機微を表現できたり</b>
        などメリットがたくさんあります。ここではそんなイラストの用意の方法をご紹介します。
      </p>
      <h3>自分でイラストを描く</h3>
      自由度：★★★★★　手軽度：★
      <p>
        あなたがもしイラストを描くスキルを持っているのであれば、自分でイラストを描くのは有力な手となるでしょう。
        このゲームにおいて画像を設定できる箇所にはプロフィール画像、アイコン、戦闘カットイン、メッセージ画像の4つがあります。
        どのような場所で表示されるか、どのような規格なのか等の詳細については■■を参照してください。
      </p>
      <p>
        このゲームではアイコンと一緒にメッセージを送るのが基本のため、上記の中では最もアイコンが多用されます。様々な状況に対応できるよう、いろいろな表情のアイコンを用意しておくとよいでしょう。
      </p>
      <p>
        以下はよく使われる表情の例です。以下の中からキャラクターのやりそうな表情のアイコンを用意しておくとよいかもしれません。
      </p>
      <h3>キャラクターメーカーを利用する</h3>
      自由度：★★　手軽度：★★★★★
      <p>
        絵が描けない場合でも、
        <InlineLink href="https://picrew.me/" external>
          Picrew
        </InlineLink>
        などのキャラクターメーカーを利用してイラストを作成することもできます。
      </p>
      <p>
        キャラクターメーカーを利用する場合、キャラクターメーカー側の規約にも注意しましょう。当ゲームでは以下の基準でキャラクターメーカーの使用可否の判断を行っています。
      </p>
      <section>
        <h4>OK例</h4>
        <ul>
          <li>
            「ご自由にお使いください」など、幅広い用途に対応していると解釈できるもの
          </li>
          <li>
            「TRPG<b>など</b>
            に利用可」など、当ゲームのようなゲームへの使用が許可されていると解釈できるもの
          </li>
        </ul>
      </section>
      <section>
        <h4>NG例</h4>
        <ul>
          <li>どのような用途で利用していいのか記載のないもの</li>
          <li>
            「SNSアイコンなどに利用可」のみ書かれているなど、キャラクター交流を行うゲームへの使用が想定されていない可能性が高いもの
          </li>
          <li>
            「TRPGに利用可」など、特定の類似ゲームへの使用が許可されているが、当ゲームのようなゲームへの使用の許可は行われていないもの
          </li>
        </ul>
      </section>
      <Annotations>
        <Annotations.Item>
          あくまで上記は当ゲーム側がイラストの使用可否を判断し、独自に対応を行う際の基準です。上記OK例に該当する場合でも、権利者からの通達等があった場合、該当の画像の削除対応等を行う場合があります。
        </Annotations.Item>
      </Annotations>
      <h3>コミッションを利用する</h3>
      自由度：★★★★　手軽度：★★
      <p>
        コミッションとは主に趣味でイラストを描いている人などに有料で依頼することを指します。コミッションを行うことができるプラットフォームには
        <InlineLink href="https://skima.jp/item/search?s=1&amp;c=6" external>
          SKIMA
        </InlineLink>
        や
        <InlineLink href="https://coconala.com/categories/192" external>
          coconala
        </InlineLink>
        などがあり、その他にも、Twitter上でコミッションなどを募集している場合もあります。
      </p>
      <p>
        最初からイラストを用意しておきたい場合、依頼先にもよりますが納品に2週間～1ヶ月強ほどかかることが多いので、開催2ヶ月前には依頼しておくとよいでしょう。当ゲームで利用する場合、表情差分のあるコミッションに依頼を行うとよいかもしれません。その際、TRPGや定期ゲーム、PBWなどキャラクター交流系のゲームに理解のありそうな方に依頼するとスムーズです。
      </p>
      <h3>アドプトを購入する</h3>
      自由度：★★　手軽度：★★★
      <p>
        アドプトとはオリジナルキャラクターの売買を行うことを指し、キャラ販売とも呼ばれます。すでにイラストが完成しているので、自分だけのキャラクターが購入するだけですぐに利用できるのがメリットです。アドプトによってキャラクターを購入することができるプラットフォームには
        <InlineLink href="https://skima.jp/dl" external>
          SKIMA
        </InlineLink>
        などがあります。
      </p>
      <p>
        アドプトによって規約などは異なるので、当ゲームへの利用目的の場合、規約が適合するかどうかに注意して購入しましょう。
      </p>
      <h1>登録後にすること</h1>
      <h1>してはいけないこと</h1>
      <h2>オリジナルキャラクター以外の登録</h2>
      <p>
        著作権違反を禁ずる規約は多くのサービスに存在していますが、その中でもこのゲームにおいては著作権違反は厳しく取り締まられます。
        確認された場合、一度でアカウント停止になることがほとんどのため、絶対に行わないようにしましょう。
      </p>
      <h2>マナー違反</h2>
      <p>
        参加者同士がお互い楽しくゲームを遊べるよう、このゲームにおいてもマナーが存在しています。一般にどのような行為がマナー違反とされるかについては、交流のマナー■■を参照してください。
      </p>
    </DefaultPage>
  );
};

export default RulebookGuideBeginnerIntroduction;
