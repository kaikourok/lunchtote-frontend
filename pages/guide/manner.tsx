import type { NextPage } from 'next';

import ReaderPage, {
  ReaderNode,
} from '@/components/template/ReaderPage/ReaderPage';
import SectionWrapper from '@/components/template/SectionWrapper/SectionWrapper';
import styles from '@/styles/pages/guide/manner.module.scss';

const GuideManner: NextPage = () => {
  const nodes: ReaderNode[] = [
    {
      heading: '確定ロール',
      headingLevel: 1,
      body: (
        <SectionWrapper>
          <p>
            相手の行動や心情を勝手に描写することは<b>確定ロール</b>
            と呼ばれ、多くの場合マナー違反として扱われます。以下はその例です。
          </p>
          <div className={styles['chat-example']}>
            「○○って昔けっこうワルだったよな」
            <div className={styles['chat-indicate']}>
              ⚠ 相手の過去を勝手に決めてしまっています。
            </div>
          </div>
          <div className={styles['chat-example']}>
            「あら、ありがとう。」
            <br />
            そう言って小悪魔的微笑みを浮かべると、○○は私に惚れ込んでしまった。
            <div className={styles['chat-indicate']}>
              ⚠ 相手の心情を勝手に決めてしまっています。
            </div>
          </div>
          <div className={styles['chat-example']}>
            「これでも喰らえ！」
            <br />
            直後放たれた閃光が○○の腹部を貫いた。
            <div className={styles['chat-indicate']}>
              ⚠ 相手が攻撃を避けられなかったことを勝手に決めてしまっています。
            </div>
          </div>
          <p>
            <b>
              相手の描写は相手のものです。相手のことまで勝手に決めないようにしましょう。
            </b>
            相手のアクションが必要なのであれば、その部分の描写は相手に委ねるようにするとよいでしょう。
          </p>
          <div className={styles['chat-example'] + ' ' + styles['no-indicate']}>
            「これでも喰らえ！」
            <br />
            直後放たれた閃光が○○の腹部目掛けて迸った。
          </div>
          <p>
            このようにすると、攻撃を受けるのか避けるのか相手は選ぶことができます。
          </p>
          <p>
            なお、時と場合を選べば確定ロールは必ずしもマナー違反ではありません。むしろ、まどろっこしい描写を省けたり、サプライズ的なロールに使うことができたりとメリットもあります。
          </p>
          <p>
            例えば恋人同士のキャラクターたちであれば手を繋ぐのはよくあることなので、&quot;手を取った&quot;という確定ロールを行っても問題となることはほぼないでしょう。
            ロールプレイに慣れ、どのような場合に確定ロールを使っていいのか、使ってはいけないのかを理解できたなら使ってみるのも手かもしれません。
          </p>
        </SectionWrapper>
      ),
    },
    {
      heading: '他キャラクターの設定を侵食する設定',
      headingLevel: 1,
      body: (
        <SectionWrapper>
          <p>
            このゲームでは多数のキャラクターが同じ世界を共有します。他のキャラクターの設定を侵食する設定を持ったキャラクターを出すべきではありません。
          </p>
          <p>
            例えばこの世界の創造主という設定を持ったキャラクターAがいると、その他のキャラクターにはAによる被造物という設定がついてしまうことになります。一種の確定ロールに当たりますので、このような設定はしないほうが望ましいでしょう。
          </p>
        </SectionWrapper>
      ),
    },
    {
      heading: '他キャラクターのストーリーの破壊行為',
      headingLevel: 1,
      body: (
        <SectionWrapper>
          <p>
            キャラクターはそれぞれの背景を持っており、多くはどのようにストーリーを展開するかを考えながらロールプレイされています。そのため、他キャラクターのストーリーを破壊する行為は嫌われます。
          </p>
          <div className={styles['chat-example'] + ' ' + styles['no-indicate']}>
            A「実はこいつ、俺の妹なんだが不治の病を患っていてね。俺はどうにかして治す手段を見つけるために旅をしているんだ」
          </div>
          <div className={styles['chat-example'] + ' ' + styles['no-indicate']}>
            B「なんだそんなことか。私の術があればどんな病も治すことができる。術をかけてやろう。」
            <br />
            術を唱えると、みるみるうちにAの妹の体調は良くなっていった。
          </div>
          <p>
            上記の例ではAのストーリーの核となる要素が潰されてしまっています。このような行為はマナー違反です。
          </p>
          <p>
            逆に言うと、どんな病でも治療できるなど、他者のストーリーを破壊しかねない強すぎるキャラクターは他者から敬遠される場合があります。
            「このキャラクターはどんな病でも治療できるキャラクターなんだから仕方ない」という言い訳は通用しません。キャラクターがやったことはプレイヤーの責任です。そのような設定をうまく扱えないのであれば、強すぎるキャラクターは避けた方が無難でしょう。
          </p>
          <p>
            なお、このようなストーリーの押し付けに対しては下記のように確定ロールを用いて対抗されることがあります。
          </p>
          <div className={styles['chat-example'] + ' ' + styles['no-indicate']}>
            一瞬体調が良くなったように見えたが、たちどころに顔色が悪くなっていく。
            <br />
            A「どうやら俺の妹には効かないらしいな……」
          </div>
          <p>
            この確定ロールはマナー違反ではなく自衛のための手段であり、あくまで押し付けを行った側が悪いものとして扱われます。
          </p>
        </SectionWrapper>
      ),
    },
    {
      heading: 'ロールプレイの流れの破壊行為',
      headingLevel: 1,
      body: (
        <SectionWrapper>
          <p>
            他プレイヤーはその場のロールプレイを楽しんでいます。その場のロールプレイの流れを壊さないようにしましょう。
          </p>
          <p>
            特に慣れていない内にやってしまいがちなのが、善意でロールプレイの流れを破壊してしまうことです。
          </p>
          <p>
            例えば「料理が苦手な人が集まって、教本を見て試行錯誤したりお互い教えあったりしながら頑張って料理をしている」というロールプレイを行っているところに、料理が得意なキャラクターがやってきて全部教えてしまうなど。
          </p>
          <p>
            現実であれば助かる場面かもしれませんが、プレイヤーたちは「キャラクターが苦手なものを頑張って成し遂げる展開」そのものを楽しんでいるのかもしれません。
            <b>
              現実で喜ばれることが必ずしもRP上で喜ばれることとイコールではない
            </b>
            ことに注意しましょう。
          </p>
          <p>
            とはいえ、非常に難しいラインでもあります。例えば元から関係のあるキャラクター同士であれば、教える、教えてもらうというロールプレイもまた楽しいものだからです。
            <b>
              そのキャラクターとの関係性や、そのロールプレイを行っている人は何を楽しんでいるのかを考えてロールプレイをするとよい
            </b>
            でしょう。
          </p>
          <p>
            なお、そのロールプレイの場が様々なキャラクターが使う公共の場であると見なされる場合、横で全く別のロールプレイを行う分には問題とならないことが多いです。例えばシリアスなロールプレイをやっている場で全く別のギャグロールが行われていても問題ありません（もちろんそのロールプレイに横槍を入れて流れを破壊すれば問題となります）。
          </p>
          <p>
            公共の場は全く別のロールプレイが同時進行しうるものとして認識しておくとよいでしょう。
          </p>
        </SectionWrapper>
      ),
    },
    {
      heading: 'プレイヤー自身の属性による言い訳',
      headingLevel: 1,
      body: (
        <SectionWrapper>
          <p>
            初心者や精神病など、プレイヤー自身の属性を理由にマナー違反や他者への不義を正当化することはできません。
          </p>
          <p>
            当ゲームのロールプレイはプレイヤーたち自身による自助で成り立っており、他プレイヤーはこのゲームを楽しみにきただけの他者です。「初心者だから」「こういう病気を持っているから」を慮る理由は何一つありません。
          </p>
          <p>
            もちろん初心者だから、精神病だからといって当ゲームに参加してはいけないというわけではありません。プレイヤー自身の属性に関わらず、マナーが守れないのであれば参加するべきではない、ということです。
          </p>
          <p>
            人間はミスを犯してしまうこともあります。しかし、「初心者だから」「こういう病気を持っているから」と言い訳するのではなく、やってしまったことは素直に謝り、次はやらないようにしましょう。
          </p>
        </SectionWrapper>
      ),
    },
  ];

  return <ReaderPage title="交流のマナー" nodes={nodes} />;
};

export default GuideManner;
