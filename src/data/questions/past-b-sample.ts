import type { QuestionB } from '../../types';

/**
 * 基本情報技術者試験 科目B サンプル問題（IPA 公開）からの収録。
 * IPA は公表済みの試験問題の使用に許諾・使用料は不要としているため収録している。
 * 出典は各問の `source` に記録する。解説はアプリ側で独自に作成したもの。
 */
export const pastBSample: QuestionB[] = [
  {
    id: 'b-ipa-smp-01',
    kind: 'algorithm',
    level: 1,
    title: '変数の値の入れ替え',
    description:
      '次のプログラムを実行すると、[ ] と出力される。[ ] に入れる正しい答えを、解答群の中から選べ。',
    code: `整数型: x ← 1
整数型: y ← 2
整数型: z ← 3
x ← y
y ← z
z ← x
yの値 と zの値 をこの順にコンマ区切りで出力する`,
    subQuestions: [
      {
        prompt: '[ ] に入れる正しい答えはどれか。',
        choices: ['1,2', '1,3', '2,1', '2,3', '3,1', '3,2'],
        answer: 5,
        explanation:
          '最初 x=1, y=2, z=3。x ← y で x は 2 になる（この時点で元の x=1 は失われる）。y ← z で y は 3 になる。z ← x では、既に更新済みの x（2）が使われるので z は 2 になる。出力は y の値と z の値なので 3,2 となる。「代入前の古い値」と勘違いすると 2,1 のような誤答を選びやすい。',
      },
    ],
    source: '基本情報技術者試験 科目B サンプル問題 問1',
  },
  {
    id: 'b-ipa-smp-02',
    kind: 'algorithm',
    level: 2,
    title: 'FizzBuzz の条件分岐の順序',
    description:
      '次のプログラム中の [ a ]〜[ c ] に入れる正しい答えの組合せを、解答群の中から選べ。関数 fizzBuzz は、引数で与えられた値が、3 で割り切れて 5 で割り切れない場合は"3 で割り切れる"を、5 で割り切れて 3 で割り切れない場合は"5 で割り切れる"を、3 と 5 で割り切れる場合は"3 と 5 で割り切れる"を返す。それ以外の場合は"3 でも 5 でも割り切れない"を返す。',
    code: `○文字列型: fizzBuzz(整数型: num)
  文字列型: result
  if (num が [ a ] で割り切れる)
    result ← "[ a ] で割り切れる"
  elseif (num が [ b ] で割り切れる)
    result ← "[ b ] で割り切れる"
  elseif (num が [ c ] で割り切れる)
    result ← "[ c ] で割り切れる"
  else
    result ← "3 でも 5 でも割り切れない"
  endif
  return result`,
    subQuestions: [
      {
        prompt: '[ a ]、[ b ]、[ c ] の組合せとして正しいものはどれか。',
        choices: [
          'a: 3　b: 3 と 5　c: 5',
          'a: 3　b: 5　c: 3 と 5',
          'a: 3 と 5　b: 3　c: 5',
          'a: 5　b: 3　c: 3 と 5',
          'a: 5　b: 3 と 5　c: 3',
        ],
        answer: 2,
        explanation:
          '15 のように 3 と 5 の両方で割り切れる数は、単純な「3 で割り切れる」判定を先に置くとそちらに先に一致してしまう。したがって最初の分岐（a）で「3 と 5」の両方を満たす場合を判定し、次に「3」、最後に「5」を判定する必要がある（ウ に相当）。判定順序を入れ替えると 15 の倍数の出力が誤ってしまう。',
      },
    ],
    source: '基本情報技術者試験 科目B サンプル問題 問2',
  },
  {
    id: 'b-ipa-smp-03',
    kind: 'algorithm',
    level: 2,
    title: '累積和配列の生成',
    description:
      '関数 makeNewArray は、要素数 2 以上の整数型の配列を引数にとり、整数型の配列を返す関数である。関数 makeNewArray を makeNewArray({3, 2, 1, 6, 5, 4}) として呼び出したとき、戻り値の配列の要素番号 5 の値は [ ] となる。[ ] に入れる正しい答えを、解答群の中から選べ。ここで、配列の要素番号は 1 から始まる。',
    code: `○整数型の配列: makeNewArray(整数型の配列: in)
  整数型の配列: out ← {} // 要素数0の配列
  整数型: i, tail
  outの末尾 に in[1]の値 を追加する
  for (i を 2 から inの要素数 まで 1 ずつ増やす)
    tail ← out[outの要素数]
    outの末尾 に (tail ＋ in[i]) の結果を追加する
  endfor
  return out`,
    supplement:
      'out は「それまでの累積和」を末尾に追加していく配列になる。in = {3, 2, 1, 6, 5, 4} のとき、out は {3} → {3, 5} → {3, 5, 6} → {3, 5, 6, 12} → {3, 5, 6, 12, 17} → {3, 5, 6, 12, 17, 21} と変化する。',
    subQuestions: [
      {
        prompt: '[ ] に入れる正しい答えはどれか。',
        choices: ['5', '6', '9', '11', '12', '17', '21'],
        answer: 5,
        explanation:
          'out は累積和配列になり、要素番号 5 の値は 3+2+1+6+5=17 である。トレースすると out={3,5,6,12,17,21} となり、5 番目は 17。9 や 21 は途中や最終の値と混同した誤答である。',
      },
    ],
    source: '基本情報技術者試験 科目B サンプル問題 問3',
  },
  {
    id: 'b-ipa-smp-04',
    kind: 'algorithm',
    level: 2,
    title: '減算に基づく最大公約数の算出',
    description:
      '次のプログラム中の [ a ]〜[ c ] に入れる正しい答えの組合せを、解答群の中から選べ。関数 gcd は、引数で与えられた二つの正の整数 num1 と num2 の最大公約数を、次の(1)〜(3)の性質を利用して求める。\n\n(1) num1 と num2 が等しいとき、num1 と num2 の最大公約数は num1 である。\n(2) num1 が num2 より大きいとき、num1 と num2 の最大公約数は、(num1 － num2) と num2 の最大公約数と等しい。\n(3) num2 が num1 より大きいとき、num1 と num2 の最大公約数は、(num2 － num1) と num1 の最大公約数と等しい。',
    code: `○整数型: gcd(整数型: num1, 整数型: num2)
  整数型: x ← num1
  整数型: y ← num2
  [ a ]
    if ([ b ])
      x ← x － y
    else
      y ← y － x
    endif
  [ c ]
  return x`,
    subQuestions: [
      {
        prompt: '[ a ]、[ b ]、[ c ] の組合せとして正しいものはどれか。',
        choices: [
          'a: if (x ≠ y)　b: x ＜ y　c: endif',
          'a: if (x ≠ y)　b: x ＞ y　c: endif',
          'a: while (x ≠ y)　b: x ＜ y　c: endwhile',
          'a: while (x ≠ y)　b: x ＞ y　c: endwhile',
        ],
        answer: 3,
        explanation:
          'x と y が等しくなるまで大きい方から小さい方を引く操作を繰り返す必要があるため、1 回しか実行されない if ではなく、条件が成り立つ間繰り返す while / endwhile を使う（a, c）。また性質(2)より、x が y より大きいときに x から y を引くので、内側の条件は x ＞ y（b）となる。',
      },
    ],
    source: '基本情報技術者試験 科目B サンプル問題 問4',
  },
  {
    id: 'b-ipa-smp-05',
    kind: 'algorithm',
    level: 1,
    title: '2 乗和の平方根の計算',
    description:
      '次のプログラム中の [ ] に入れる正しい答えを、解答群の中から選べ。関数 calc は、正の実数 x と y を受け取り、x の 2 乗と y の 2 乗の和の平方根を計算結果として返す。関数 calc が使う関数 pow は、第 1 引数として正の実数 a を、第 2 引数として実数 b を受け取り、a の b 乗の値を実数型で返す。',
    code: `○実数型: calc(実数型: x, 実数型: y)
  return [ ]`,
    subQuestions: [
      {
        prompt: '[ ] に入れる正しい答えはどれか。',
        choices: [
          '(pow(x, 2) ＋ pow(y, 2)) ÷ pow(2, 0.5)',
          '(pow(x, 2) ＋ pow(y, 2)) ÷ pow(x, y)',
          'pow(2, pow(x, 0.5)) ＋ pow(2, pow(y, 0.5))',
          'pow(pow(pow(2, x), y), 0.5)',
          'pow(pow(x, 2) ＋ pow(y, 2), 0.5)',
          'pow(x, 2) × pow(y, 2) ÷ pow(x, y)',
          'pow(x, y) ÷ pow(2, 0.5)',
        ],
        answer: 4,
        explanation:
          '平方根は 0.5 乗と同じなので、x²＋y² を求めてから pow(…, 0.5) で 0.5 乗すればよい。したがって pow(pow(x, 2) ＋ pow(y, 2), 0.5) が正しい。他の選択肢は 2 で割る、べき乗の対象を取り違えるなど、平方根の計算になっていない。',
      },
    ],
    source: '基本情報技術者試験 科目B サンプル問題 問5',
  },
  {
    id: 'b-ipa-smp-06',
    kind: 'algorithm',
    level: 3,
    title: '8 ビットのビット順反転',
    description:
      '次のプログラム中の [ ] に入れる正しい答えを、解答群の中から選べ。関数 rev は 8 ビット型の引数 byte を受け取り、ビットの並びを逆にした値を返す。例えば、関数 rev を rev(01001011) として呼び出すと、戻り値は 11010010 となる。なお、演算子 ∧ はビット単位の論理積、演算子 ∨ はビット単位の論理和、演算子 >> は論理右シフト、演算子 << は論理左シフトを表す。value >> n は value の値を n ビットだけ右に論理シフトし、value << n は value の値を n ビットだけ左に論理シフトする。',
    code: `○8 ビット型: rev(8 ビット型: byte)
  8 ビット型: rbyte ← byte
  8 ビット型: r ← 00000000
  整数型: i
  for (i を 1 から 8 まで 1 ずつ増やす)
    [ ]
  endfor
  return r`,
    subQuestions: [
      {
        prompt: '[ ] に入れる正しい答えはどれか（1 か所に 2 行分の処理が入る）。',
        choices: [
          '① r ← (r << 1) ∨ (rbyte ∧ 00000001)　② rbyte ← rbyte >> 1',
          '① r ← (r << 7) ∨ (rbyte ∧ 00000001)　② rbyte ← rbyte >> 7',
          '① r ← (rbyte << 1) ∨ (rbyte >> 7)　② rbyte ← r',
          '① r ← (rbyte >> 1) ∨ (rbyte << 7)　② rbyte ← r',
        ],
        answer: 0,
        explanation:
          '毎回のループで r を 1 ビット左シフトしてから、rbyte の最下位ビット（rbyte ∧ 00000001）を r の最下位ビットに付け加え、続けて rbyte を 1 ビット右シフトして次に処理すべきビットを最下位に持ってくる。これを 8 回繰り返すと、rbyte の各ビットが末尾から順に r へ移され、全体として逆順になる。7 ビットずつシフトする選択肢では 1 ビットずつの処理にならず正しく反転できない。',
      },
    ],
    source: '基本情報技術者試験 科目B サンプル問題 問6',
  },
  {
    id: 'b-ipa-smp-07',
    kind: 'algorithm',
    level: 1,
    title: '階乗を求める再帰関数',
    description:
      '次のプログラム中の [ ] に入れる正しい答えを、解答群の中から選べ。関数 factorial は非負の整数 n を引数にとり、その階乗を返す関数である。非負の整数 n の階乗は n が 0 のときに 1 になり、それ以外の場合は 1 から n までの整数を全て掛け合わせた数となる。',
    code: `○整数型: factorial(整数型: n)
  if (n ＝ 0)
    return 1
  endif
  return [ ]`,
    subQuestions: [
      {
        prompt: '[ ] に入れる正しい答えはどれか。',
        choices: ['(n － 1) × factorial(n)', 'factorial(n － 1)', 'n', 'n × (n － 1)', 'n × factorial(1)', 'n × factorial(n － 1)'],
        answer: 5,
        explanation:
          'n の階乗は「n ×（n－1 の階乗）」として再帰的に定義できるので、n × factorial(n － 1) が正しい。factorial(n － 1) だけでは n 自身が掛け合わされず、n × factorial(1) では途中の項がすべて欠落してしまう。',
      },
    ],
    source: '基本情報技術者試験 科目B サンプル問題 問7',
  },
  {
    id: 'b-ipa-smp-08',
    kind: 'algorithm',
    level: 2,
    title: '優先度付きキューの出力順序',
    description:
      '優先度付きキューを操作するプログラムである。優先度付きキューとは扱う要素に優先度を付けたキューであり、要素を取り出す際には優先度の高いものから順番に取り出される。クラス PrioQueue は優先度付きキューを表すクラスである。ここで、優先度は整数型の値 1，2，3 のいずれかであり、小さい値ほど優先度が高いものとする。手続 prioSched を呼び出したとき、出力は [ ] の順となる。[ ] に入れる正しい答えを、解答群の中から選べ。',
    supplement:
      '**クラス PrioQueue の説明**\n\n| 種別 | 名前 | 戻り値 | 説明 |\n|---|---|---|---|\n| コンストラクタ | PrioQueue() | - | 空の優先度付きキューを生成する |\n| メソッド | enqueue(文字列型: s, 整数型: prio) | なし | 優先度付きキューに、文字列 s を要素として、優先度 prio で追加する |\n| メソッド | dequeue() | 文字列型 | 優先度付きキューからキュー内で最も優先度の高い要素を取り出して返す。最も優先度の高い要素が複数あるときは、そのうちの最初に追加された要素を一つ取り出して返す |\n| メソッド | size() | 整数型 | 優先度付きキューに格納されている要素の個数を返す |',
    code: `○prioSched()
  PrioQueue: prioQueue ← PrioQueue()
  prioQueue.enqueue("A", 1)
  prioQueue.enqueue("B", 2)
  prioQueue.enqueue("C", 2)
  prioQueue.enqueue("D", 3)
  prioQueue.dequeue() /* 戻り値は使用しない */
  prioQueue.dequeue() /* 戻り値は使用しない */
  prioQueue.enqueue("D", 3)
  prioQueue.enqueue("B", 2)
  prioQueue.dequeue() /* 戻り値は使用しない */
  prioQueue.dequeue() /* 戻り値は使用しない */
  prioQueue.enqueue("C", 2)
  prioQueue.enqueue("A", 1)
  while (prioQueue.size() が 0 と等しくない)
    prioQueue.dequeue() の戻り値を出力
  endwhile`,
    subQuestions: [
      {
        prompt: '[ ] に入れる正しい答えはどれか。',
        choices: ['"A"，"B"，"C"，"D"', '"A"，"B"，"D"，"D"', '"A"，"C"，"C"，"D"', '"A"，"C"，"D"，"D"'],
        answer: 3,
        explanation:
          '最初の 2 回の dequeue で優先度 1 の A、次いで優先度 2 の中で最も早く追加された B が取り出される（残りは C(2), D(3)）。その後 D(3), B(2) が追加され、次の 2 回の dequeue で C(2)、続いて B(2) が取り出される（残りは D(3), D(3)）。さらに C(2), A(1) が追加された状態で while ループに入り、優先度が高い順に A → C → D → D の順に出力される。',
      },
    ],
    source: '基本情報技術者試験 科目B サンプル問題 問8',
  },
  {
    id: 'b-ipa-smp-09',
    kind: 'algorithm',
    level: 2,
    title: '2 分木の走査順序',
    description:
      '手続 order は、指定した節を根とする部分木をたどりながら、全ての節番号を出力する。大域の配列 tree が 2 分木を表しており、要素番号 n の要素は、節番号 n の子の節番号を左の子、右の子の順に格納した配列である（子が一つしかない場合は左の子だけを格納し、子がない場合は要素数 0 の配列とする）。手続 order を order(1) として呼び出すと、[ ] の順に出力される。[ ] に入れる正しい答えを、解答群の中から選べ。ここで、配列の要素番号は 1 から始まる。',
    supplement:
      'tree が表す 2 分木は、節番号 1 を根とし、1 の子は 2 と 3、2 の子は 4 と 5、3 の子は 6 と 7、4 の子は 8 と 9、5 の子は 10 と 11、6 の子は 12 と 13、7 の子は 14（一つだけ）であり、8〜14 は子を持たない葉である。',
    code: `大域: 整数型配列の配列: tree ← {{2, 3}, {4, 5}, {6, 7}, {8, 9},
  {10, 11}, {12, 13}, {14}, {}, {}, {},
  {}, {}, {}, {}} // {}は要素数0の配列
○order(整数型: n)
  if (tree[n]の要素数 が 2 と等しい)
    order(tree[n][1])
    nを出力
    order(tree[n][2])
  elseif (tree[n]の要素数 が 1 と等しい)
    order(tree[n][1])
    nを出力
  else
    nを出力
  endif`,
    subQuestions: [
      {
        prompt: '[ ] に入れる正しい答えはどれか。',
        choices: [
          '1，2，3，4，5，6，7，8，9，10，11，12，13，14',
          '1，2，4，8，9，5，10，11，3，6，12，13，7，14',
          '8，4，9，2，10，5，11，1，12，6，13，3，14，7',
          '8，9，4，10，11，5，2，12，13，6，14，7，3，1',
        ],
        answer: 2,
        explanation:
          '子が 2 つある節では「左の子 → 自分 → 右の子」の順（中間順）で出力する。order(2) をたどると 8,4,9,2,10,5,11 の順に、order(3) をたどると 12,6,13,3,14,7 の順になる。order(1) 全体では order(2) の結果、1、order(3) の結果をこの順に連結するので、8，4，9，2，10，5，11，1，12，6，13，3，14，7 となる。',
      },
    ],
    source: '基本情報技術者試験 科目B サンプル問題 問9',
  },
  {
    id: 'b-ipa-smp-10',
    kind: 'algorithm',
    level: 2,
    title: '単方向リストからの要素削除',
    description:
      '手続 delNode は、単方向リストから、引数 pos で指定された位置の要素を削除する手続である。引数 pos は、リストの要素数以下の正の整数とする。リストの先頭の位置を 1 とする。クラス ListElement は単方向リストの要素を表し、メンバ変数 val（文字型、要素の値）と next（ListElement 型、次の要素の参照。次の要素がないときの状態は未定義）を持つ。ListElement 型の変数はクラス ListElement のインスタンスの参照を格納するものとする。大域変数 listHead には、リストの先頭要素の参照があらかじめ格納されている。次のプログラム中の [ ] に入れる正しい答えを、解答群の中から選べ。',
    code: `大域: ListElement: listHead // リストの先頭要素が格納されている
○delNode(整数型: pos) /* posは、リストの要素数以下の正の整数 */
  ListElement: prev
  整数型: i
  if (pos が 1 と等しい)
    listHead ← listHead.next
  else
    prev ← listHead
    /* posが2と等しいときは繰返し処理を実行しない */
    for (i を 2 から pos － 1 まで 1 ずつ増やす)
      prev ← prev.next
    endfor
    prev.next ← [ ]
  endif`,
    subQuestions: [
      {
        prompt: '[ ] に入れる正しい答えはどれか。',
        choices: ['listHead', 'listHead.next', 'listHead.next.next', 'prev', 'prev.next', 'prev.next.next'],
        answer: 5,
        explanation:
          'for ループを抜けた時点で prev は削除対象の一つ前（位置 pos－1）の要素を指している。削除対象は prev.next（位置 pos の要素）であり、これを読み飛ばして次の要素に直接つなぎ直す必要があるため、prev.next ← prev.next.next とする。',
      },
    ],
    source: '基本情報技術者試験 科目B サンプル問題 問10',
  },
];
