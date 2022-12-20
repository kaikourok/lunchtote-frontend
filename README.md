# ディレクトリ構造
| ディレクトリ | 概要 |
| --- | --- |
| .vscode | VSCode用設定群 |
| components/* | Atomic Designで分類されたコンポーネント群 |
| constants | 定数 |
| hooks | React Hooks |
| layouts | ページのレイアウトを定めるコンポーネント群 |
| lib | ユーティリティ関数群 |
| pages | 表示されるページに対応したコンポーネント群 Next.jsによってルーティングされる |
| plugins | 独自ライブラリ・設定済みライブラリ |
| public/fonts | Webフォント |
| public/images | プロジェクト内で利用される画像群 |
| store | Redux関連ファイル |
| styles | 対応した箇所のスタイル定義 |
| types | 広域で利用される型定義 |

# コミットメッセージ・ブランチ名等に関して
コントリビューター数は少ないことが予想されるため、現段階では厳密な規則は設けません。
だいたい分かればOKです。（もしコントリビューターが増えるのであればまた考えます）
英語/日本語についてもどちらを使用して頂いても構いません。

# ブランチ運用に関して
雰囲気としてはGitHub Flowにdevelopブランチを足したような感じです。

| ブランチ | 概要 |
| --- | --- |
| master | リリース用ブランチ。 |
| develop | デプロイ可能なブランチ。ある程度まとまったらdevelopからmasterにマージする。 |
| 作業用ブランチ | developから分岐させ、developに向けてマージさせる。ブランチ名はおおよその変更内容を表すようにする。 |

# 機能開発を行った際のUIデザインについて
デザインを目的としたコミットでない限り、デザインはこちら側で行います。そのため、とりわけCSSを適用してコミットする必要はありません。

UIに波及しうる機能開発を行った際、JSX箇所ではあまり複雑なデータ加工を行わないようにしてください。提出されたコミットから実際のUIに落とし込む際、必ずしも提出されたUI要素と同じ要素が採用されるとは限りません。
ラジオボタンで実装されるかもしれませんし、selectかもしれませんし、はたまた別の独自コンポーネントかもしれません。その際にViewとLogicが密結合だと変更が容易でないからです。

# ライセンス
MIT License

ただしプロジェクト内に別のオープンソースプロジェクト等の成果物を含んでおり、それらのライセンスに関しては別途参照する必要があります。概要は以下のとおりです。
これらのプロジェクトに関するライセンス表記はpages/legal/license.tsx内で行われています。

| プロジェクト | ライセンス | パス |
| --- | --- | --- |
| sanitize.css | CC0-1.0 license | styles/sanitize.css |
| googlefonts/morisawa-biz-ud-gothic | SIL OFL-1.1 license | public/fonts/BIZUDPGothic-*.ttf |
| googlefonts/noto-cjk | SIL OFL-1.1 license | public/fonts/NotoSansJP-*.otf |
| twitter/opensource-website | Apache License 2.0 | public/images/brand-icons/twitter.svg |
| - | [Sign-In Branding Guidelines](https://developers.google.com/identity/branding-guidelines) | public/images/brand-icons/google.svg |