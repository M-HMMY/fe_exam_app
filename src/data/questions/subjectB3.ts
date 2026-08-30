import type { QuestionB } from '../../types';

/** 科目B 追加問題3。アルゴリズムとプログラミング 14 問（b-algo-21 〜 b-algo-34） */
export const QUESTIONS_B3: QuestionB[] = [
  {
    id: 'b-algo-21',
    kind: 'algorithm',
    sectionId: 't-algo-2',
    level: 2,
    title: '挿入ソート',
    description:
      '次のプログラムは、整数型の配列 a を昇順に整列する関数 insertionSort である。配列の先頭側から整列済み部分を広げていき、新しい要素 tmp を整列済み部分の正しい位置まで差し込む。',
    code: `○整数型の配列: insertionSort(整数型の配列: a)
  整数型: i, j, tmp
  for (i を 2 から aの要素数 まで 1 ずつ増やす)
    tmp ← a[i]
    j ← i − 1
    while (j ≧ 1 and [ a ])
      a[j + 1] ← a[j]
      j ← j − 1
    endwhile
    a[j + 1] ← tmp
  endfor
  return a`,
    subQuestions: [
      {
        prompt: '[ a ] に入れる字句はどれか。',
        choices: ['a[j] > tmp', 'a[j] < tmp', 'a[i] > tmp', 'j > 1'],
        answer: 0,
        explanation:
          'tmp より大きい要素を 1 つずつ右にずらしながら、tmp の入る位置を探す。a[j] < tmp にすると比較が成立せず要素が一切ずれず、a[i] > tmp は動かない添字 i を使ってしまい常に同じ値と比較する誤り、j > 1 は値を全く比較していない。',
      },
      {
        prompt: 'a が {5, 3, 4, 1, 2} のとき、外側のループ（i）が 3 を処理し終えた時点の配列はどれか。',
        choices: ['{3, 4, 5, 1, 2}', '{3, 5, 4, 1, 2}', '{1, 3, 4, 5, 2}', '{3, 4, 5, 2, 1}'],
        answer: 0,
        explanation:
          'i = 2 の処理後は {3, 5, 4, 1, 2}。i = 3 では tmp = 4 を、5 より前の位置まで差し込むので 5 だけが 1 つ右にずれ {3, 4, 5, 1, 2} になる。まだ後半の 1, 2 は手つかずのままである点に注意。',
      },
    ],
  },
  {
    id: 'b-algo-22',
    kind: 'algorithm',
    sectionId: 't-algo-3',
    level: 1,
    title: '2 つの配列の内積',
    description:
      '次のプログラムは、要素数が等しい整数型の配列 a, b について、対応する要素どうしの積の総和（内積）を返す関数 dotProduct である。',
    code: `○整数型: dotProduct(整数型の配列: a, 整数型の配列: b)
  整数型: i
  整数型: sum ← 0
  for (i を 1 から aの要素数 まで 1 ずつ増やす)
    sum ← [ a ]
  endfor
  return sum`,
    subQuestions: [
      {
        prompt: '[ a ] に入れる字句はどれか。',
        choices: ['sum + a[i] × b[i]', 'sum + a[i] + b[i]', 'a[i] × b[i]', 'sum × a[i] × b[i]'],
        answer: 0,
        explanation:
          '対応する要素の積を毎回 sum に足し込むのが内積の定義。sum + a[i] + b[i] は積ではなく和を集計してしまい、a[i] × b[i] だけでは代入のたびに sum が上書きされて累積されず、sum × a[i] × b[i] は加算すべきところを乗算してしまっている。',
      },
      {
        prompt: 'a が {1, 2, 3}、b が {4, 5, 6} のとき、dotProduct(a, b) の戻り値はどれか。',
        choices: ['32', '21', '18', '90'],
        answer: 0,
        explanation:
          '1×4 + 2×5 + 3×6 = 4 + 10 + 18 = 32。21 は積ではなく和（1+4）+(2+5)+(3+6）を計算した場合の誤り、18 は sum が上書きされ最後の項だけが残った場合の誤りである。',
      },
    ],
  },
  {
    id: 'b-algo-23',
    kind: 'algorithm',
    sectionId: 't-algo-6',
    level: 1,
    title: '特定の文字を取り除いた配列を作る',
    description:
      '次のプログラムは、文字型配列 s から、指定した文字 c と一致する要素を取り除いた新しい配列を作って返す関数 removeChar である。out は空の配列で、「out の末尾に x を追加する」操作が使えるものとする。',
    code: `○文字型の配列: removeChar(文字型の配列: s, 文字型: c)
  文字型の配列: out ← 空の配列
  整数型: i
  for (i を 1 から sの要素数 まで 1 ずつ増やす)
    if ([ a ])
      out の末尾に s[i] を追加する
    endif
  endfor
  return out`,
    subQuestions: [
      {
        prompt: '[ a ] に入れる字句はどれか。',
        choices: ['s[i] ≠ c', 's[i] = c', 'i ≠ c', 's[i] ≧ c'],
        answer: 0,
        explanation:
          '「c を取り除く」ので、c と一致しない要素だけを out に残す。s[i] = c にすると逆に c だけを残す関数になってしまい、i ≠ c は添字と文字を比較する型違い、s[i] ≧ c は「除く」という仕様に合わない大小比較である。',
      },
      {
        prompt: 's が {"b", "a", "n", "a", "n", "a"}、c が "a" のとき、removeChar(s, c) の戻り値はどれか。',
        choices: ['{"b", "n", "n"}', '{"a", "a", "a"}', '{"b", "n", "a", "n", "a"}', '{"b", "a", "n", "a", "n", "a"}'],
        answer: 0,
        explanation:
          '"a" を除いた残りの要素を先頭から順に詰め直すと "b", "n", "n" になる。元の並びのまま何も除かない、あるいは "a" だけを残すといった取り違えが誤答の選択肢になっている。',
      },
    ],
  },
  {
    id: 'b-algo-24',
    kind: 'algorithm',
    sectionId: 't-algo-1',
    level: 3,
    title: '10 進数から 2 進数文字列への変換',
    description:
      '次のプログラムは、0 以上の整数 n を 2 進数表記の文字列（文字型の配列）に変換する関数 toBinary である。n を 2 で割った余りを求めてはスタックに積んでいき、最後にスタックから順に取り出して並べる。n = 0 のときは {"0"} を返す。',
    code: `○文字型の配列: toBinary(整数型: n)
  文字型のスタック: st ← 空のスタック
  文字型の配列: out ← 空の配列
  整数型: m ← n
  if (m = 0)
    return {"0"}
  endif
  while (m > 0)
    if (m % 2 = 0)
      st に "0" を push する
    else
      st に "1" を push する
    endif
    m ← [ a ]
  endwhile
  while (st が空でない)
    out の末尾に (st から pop した値) を追加する
  endwhile
  return out`,
    supplement:
      'スタックは後入れ先出し（LIFO）なので、push した順序と pop で取り出す順序は逆になる。この巻き戻しによって、下位の桁から積んだ余りが上位の桁から並ぶようになる。',
    subQuestions: [
      {
        prompt: '[ a ] に入れる字句はどれか。',
        choices: ['m ÷ 2 の商', 'm % 2', 'm ÷ 2 の商 + 1', 'm − 2'],
        answer: 0,
        explanation:
          '次の桁を求めるには m を 2 で割った商へ更新していく必要がある。m % 2 にすると m が 0 か 1 の間で堂々巡りになり正しく縮まらず、+1 では商がずれる。m − 2 は 2 進変換の縮め方として無関係で、途中で正しい余りが得られなくなる。',
      },
      {
        prompt: 'n が 13 のとき、toBinary(n) の戻り値はどれか。',
        choices: ['{"1", "1", "0", "1"}', '{"1", "0", "1", "1"}', '{"1", "1", "1", "0"}', '{"0", "1", "0", "1"}'],
        answer: 0,
        explanation:
          '13 は 2 で割ると 1 余り 6、6 は 0 余り 3、3 は 1 余り 1、1 は 1 余り 0 なので、下位から "1","0","1","1" の順に push される。pop すると逆順になり "1","1","0","1"、すなわち 2 進数の 1101（10 進の 13）になる。push した順のまま出力してしまうのが典型的な誤り。',
      },
    ],
  },
  {
    id: 'b-algo-25',
    kind: 'algorithm',
    sectionId: 't-algo-6',
    level: 2,
    title: '最頻値を求める',
    description:
      '次のプログラムは、整数型の配列 a の中で最も出現回数が多い値（最頻値）を返す関数 mode である。出現回数が同数の値が複数あるときは、先に出現した値を返すものとする。',
    code: `○整数型: mode(整数型の配列: a)
  整数型: i, j, cnt
  整数型: bestVal ← a[1]
  整数型: bestCnt ← 0
  for (i を 1 から aの要素数 まで 1 ずつ増やす)
    cnt ← 0
    for (j を 1 から aの要素数 まで 1 ずつ増やす)
      if (a[j] = a[i])
        cnt ← cnt + 1
      endif
    endfor
    if ([ a ])
      bestVal ← a[i]
      bestCnt ← cnt
    endif
  endfor
  return bestVal`,
    subQuestions: [
      {
        prompt: '[ a ] に入れる字句はどれか。',
        choices: ['cnt > bestCnt', 'cnt ≧ bestCnt', 'cnt > bestVal', 'cnt = bestCnt'],
        answer: 0,
        explanation:
          '「先に出現した値を返す」という仕様を満たすには、同数のときに更新してはならないので厳密な > を使う。≧ にすると後から出てきた同数の値で上書きされてしまう。cnt > bestVal は回数と値を比較する型違い、cnt = bestCnt は初期値 bestCnt = 0 と噛み合わず、実質更新されない。',
      },
      {
        prompt: 'a が {7, 7, 3, 3} のとき、mode(a) の戻り値はどれか。',
        choices: ['7', '3', '2', '4'],
        answer: 0,
        explanation:
          '7 も 3 もそれぞれ 2 回ずつ出現し同数になる。i = 1（値 7）で bestCnt が 2 に確定した後、i = 3（値 3）でも cnt = 2 だが cnt > bestCnt（2 > 2）は偽なので更新されず、先に確定した 7 が保持される。仮に条件が ≧ であれば、後から出てきた 3 に上書きされてしまう。',
      },
    ],
  },
  {
    id: 'b-algo-26',
    kind: 'algorithm',
    sectionId: 't-algo-1',
    level: 2,
    title: 'キューによる印刷ジョブの待ち時間',
    description:
      '次のプログラムは、印刷ジョブを到着順（先頭から）にキューへ入れて 1 つずつ処理するときの、全ジョブの待ち時間（自分の処理が始まるまでに経過した時間）の合計を求める関数 totalWaitTime である。times[i] は i 番目に到着したジョブの印刷にかかる時間（分）を表す。ジョブは直前のジョブの処理が終わった時刻から続けて処理されるものとする。',
    code: `○整数型: totalWaitTime(整数型の配列: times)
  整数型のキュー: q ← 空のキュー
  整数型: i, t
  整数型: clock ← 0, total ← 0
  for (i を 1 から timesの要素数 まで 1 ずつ増やす)
    q に times[i] を enqueue する
  endfor
  while (q が空でない)
    t ← q から dequeue した値
    total ← total + clock
    clock ← [ a ]
  endwhile
  return total`,
    subQuestions: [
      {
        prompt: '[ a ] に入れる字句はどれか。',
        choices: ['clock + t', 'clock + total', 't', 'clock − t'],
        answer: 0,
        explanation:
          '今取り出したジョブの待ち時間（＝それまでの経過時間 clock）を total に加えたあと、clock はこのジョブの処理時間 t の分だけ進める必要がある。clock + total は 2 つの累積変数を混同しており、t だけにすると clock がリセットされてそれ以前の経過時間を失う。clock − t は時間が逆行してしまい不合理である。',
      },
      {
        prompt: 'times が {3, 5, 2} のとき、totalWaitTime(times) の戻り値はどれか。',
        choices: ['11', '10', '8', '13'],
        answer: 0,
        explanation:
          '1 番目のジョブの待ち時間は 0、2 番目は 3（1 番目の処理時間）、3 番目は 3 + 5 = 8。合計すると 0 + 3 + 8 = 11。10 は最終的な clock の値を、8 は 2 番目終了時点の clock を誤って戻り値と取り違えた場合の答えである。',
      },
    ],
  },
  {
    id: 'b-algo-27',
    kind: 'algorithm',
    sectionId: 't-algo-1',
    level: 3,
    title: '連結リストからの要素削除',
    description:
      '連結リストを value・next という 2 つの配列と head で表現する。value[k] は k 番目の箱の値、next[k] は次の箱の添字（0 は末尾を意味する）を表す。次のプログラムは、値が key と一致する最初の箱をリストから取り除く手続き deleteNode である。value・next・head は大域変数として扱う。該当する値が見つからない場合、リストは変化しない。',
    code: `○deleteNode(整数型: key)
  整数型: p ← head
  整数型: prev ← 0
  while (p ≠ 0)
    if (value[p] = key)
      if (prev = 0)
        head ← next[p]
      else
        [ a ]
      endif
      return
    endif
    prev ← p
    p ← next[p]
  endwhile`,
    supplement:
      'value が {12, 25, 33, 47, 未定義の値}、next が {2, 3, 4, 0, 未定義の値}、head が 1 のとき、このリストは 12 → 25 → 33 → 47 を表す。',
    subQuestions: [
      {
        prompt: '[ a ] に入れる字句はどれか。',
        choices: ['next[prev] ← next[p]', 'next[p] ← next[prev]', 'next[prev] ← p', 'value[prev] ← value[p]'],
        answer: 0,
        explanation:
          '削除する節点 p を飛び越えてつなぎ直すには、1 つ前の節点の next に「p が指していた次の節点」をそのまま渡す必要がある。next[p] ← next[prev] は代入の向きが逆で p 自身の next を壊してしまい、next[prev] ← p は削除対象を指したままで何も変わらず、value の書き換えではリストの構造（next のつながり）は変化しない。',
      },
      {
        prompt:
          'value が {12, 25, 33, 47, 未定義の値}、next が {2, 3, 4, 0, 未定義の値}、head が 1 のとき、deleteNode(33) を実行した後に head からたどった値の並びはどれか。',
        choices: ['12 → 25 → 47', '12 → 25 → 33 → 47', '12 → 47', '25 → 47'],
        answer: 0,
        explanation:
          '33 は 3 番目の箱（添字 3）にあり、その 1 つ前は添字 2（25）。next[2] を next[3]（＝4）に付け替えるので、head=1（12）→ next[1]=2（25）→ next[2]=4（47）とたどり、12 → 25 → 47 になる。配列上の箱そのものは残るが、たどる経路から外れるので実質的に削除されたことになる。',
      },
    ],
  },
  {
    id: 'b-algo-28',
    kind: 'algorithm',
    sectionId: 't-algo-5',
    level: 2,
    title: '再帰による配列の総和（分割統治）',
    description:
      '次のプログラムは、整数型の配列 a の添字 lo から hi までの区間の総和を、区間を前半・後半の 2 つに分割して再帰的に求める関数 sumRange である。最初は sumRange(a, 1, aの要素数) の形で呼び出す。',
    code: `○整数型: sumRange(整数型の配列: a, 整数型: lo, 整数型: hi)
  整数型: mid
  if (lo > hi)
    return 0
  endif
  if (lo = hi)
    return a[lo]
  endif
  mid ← (lo + hi) ÷ 2 の商
  return sumRange(a, lo, mid) + [ a ]`,
    subQuestions: [
      {
        prompt: '[ a ] に入れる字句はどれか。',
        choices: ['sumRange(a, mid + 1, hi)', 'sumRange(a, mid, hi)', 'sumRange(a, lo, hi)', 'sumRange(a, mid + 1, hi − 1)'],
        answer: 0,
        explanation:
          '前半を lo〜mid で求めたので、後半は mid の次（mid + 1）から hi までにしないと a[mid] を二重に数えてしまう。sumRange(a, lo, hi) は区間を全く狭めておらず無限に近い再帰になり、hi − 1 にすると末尾の要素 a[hi] が計算から漏れる。',
      },
      {
        prompt: 'a が {2, 4, 6, 8, 10} のとき、sumRange(a, 1, 5) の呼出し（最初の呼出しを含む）は合計何回発生するか。',
        choices: ['9', '5', '7', '11'],
        answer: 0,
        explanation:
          'この分割は要素数 5 個の配列に対して、葉（lo = hi の基底部）が 5 個、それらをまとめる内部の呼出しが 4 個生じ、合計 9 回になる。一般に要素数 n の分割統治では呼出し回数が 2n − 1 回になる、という数え方をトレースなしに導ける点も併せて押さえておきたい。',
      },
    ],
  },
  {
    id: 'b-algo-29',
    kind: 'algorithm',
    sectionId: 't-algo-3',
    level: 2,
    title: 'シーザー暗号',
    description:
      '次のプログラムは、文字型配列 s の各文字を、アルファベット順で n 文字分だけ後ろにずらして暗号化するシーザー暗号の関数 encrypt である。ずらした結果が "z" を超える場合は先頭の "a" に戻って続ける。charCode(文字) は "a" を 0、"b" を 1、…、"z" を 25 とする整数に変換し、char(整数) はその逆変換を行うものとする。s の要素はすべて小文字のアルファベットとする。',
    code: `○文字型の配列: encrypt(文字型の配列: s, 整数型: n)
  文字型の配列: out ← 空の配列
  整数型: i, code
  for (i を 1 から sの要素数 まで 1 ずつ増やす)
    code ← (charCode(s[i]) + n) % [ a ]
    out の末尾に char(code) を追加する
  endfor
  return out`,
    supplement: '例えば charCode("c") = 2、char(4) = "e" である。',
    subQuestions: [
      {
        prompt: '[ a ] に入れる字句はどれか。',
        choices: ['26', '25', 'n', 'sの要素数'],
        answer: 0,
        explanation:
          'アルファベットは 26 文字なので、"z"（25）を超えた分を "a"（0）に巻き戻すには 26 で割った余りを使う。25 にすると "z" の次が誤った文字になり境界がずれる。n や sの要素数はずらし幅や配列長であり、アルファベットの周期とは無関係である。',
      },
      {
        prompt: 's が {"x", "y", "z"}、n が 3 のとき、encrypt(s, n) の戻り値はどれか。',
        choices: ['{"a", "b", "c"}', '{"z", "a", "b"}', '{"a", "a", "a"}', '未定義（配列の範囲外エラーになる）'],
        answer: 0,
        explanation:
          '"x"=23 → (23+3)%26=0 → "a"、"y"=24 → (24+3)%26=1 → "b"、"z"=25 → (25+3)%26=2 → "c"。3 文字とも "z" を跨いで巻き戻るため、剰余演算の境界（% 26）が正しく効いているかがこの設問の要点である。',
      },
    ],
  },
  {
    id: 'b-algo-30',
    kind: 'algorithm',
    sectionId: 't-algo-6',
    level: 1,
    title: '昇順配列から重複を取り除く',
    description:
      '次のプログラムは、昇順に整列済みの整数型配列 a の中の重複する値を前方に詰めながら取り除き、重複を除いた要素の個数を返す関数 dedup である。処理後、a の先頭 w 個には重複のない値が昇順に並んでいる。読み込み用の添字 i と書き込み用の添字 w の 2 つを使う。a の要素数は 1 以上とする。',
    code: `○整数型: dedup(整数型の配列: a)
  整数型: i
  整数型: w ← 1
  for (i を 2 から aの要素数 まで 1 ずつ増やす)
    if (a[i] ≠ a[w])
      w ← w + 1
      a[w] ← [ a ]
    endif
  endfor
  return w`,
    subQuestions: [
      {
        prompt: '[ a ] に入れる字句はどれか。',
        choices: ['a[i]', 'a[w]', 'i', 'w'],
        answer: 0,
        explanation:
          '新しい値だと判明した a[i] を、詰め先である a[w] にコピーする。a[w] を代入すると自分自身に上書きするだけで新しい値が前方に運ばれず、i や w は添字（数値）であって配列の値ではないので、そのまま代入するのは仕様と噛み合わない。',
      },
      {
        prompt: 'a が {1, 1, 2, 2, 2, 3, 5, 5} のとき、dedup(a) の戻り値はどれか。',
        choices: ['4', '5', '8', '3'],
        answer: 0,
        explanation:
          '重複を除いた値は 1, 2, 3, 5 の 4 種類なので戻り値は 4。8 は元の要素数をそのまま返してしまった誤り、3 は最後の値を数え忘れた場合に生じやすい off-by-one の誤りである。',
      },
    ],
  },
  {
    id: 'b-algo-31',
    kind: 'algorithm',
    sectionId: 't-algo-3',
    level: 1,
    title: '括弧の入れ子の深さの最大値',
    description:
      '次のプログラムは、文字型配列 s に含まれる丸括弧の入れ子の深さの最大値を求める関数 maxDepth である。開き括弧 "(" が現れるたびに深さが 1 増え、閉じ括弧 ")" が現れるたびに深さが 1 減るものとする。s の括弧の対応は常に正しいものとする。',
    code: `○整数型: maxDepth(文字型の配列: s)
  整数型: i
  整数型: depth ← 0, best ← 0
  for (i を 1 から sの要素数 まで 1 ずつ増やす)
    if (s[i] = "(")
      depth ← depth + 1
      if (depth > best)
        best ← [ a ]
      endif
    elseif (s[i] = ")")
      depth ← depth − 1
    endif
  endfor
  return best`,
    subQuestions: [
      {
        prompt: '[ a ] に入れる字句はどれか。',
        choices: ['depth', 'best + 1', 'best', 'depth − 1'],
        answer: 0,
        explanation:
          'これまでの最大値 best を更新するときは、その時点の実際の深さ depth を代入する。best + 1 は実際の深さと無関係に 1 ずつ増やすだけで正しい深さを反映せず、best のままでは更新されず、depth − 1 は 1 つ古い（浅い）深さを記録してしまう。',
      },
      {
        prompt: 's が {"(", "(", ")", "(", "(", ")", ")", ")"} のとき、maxDepth(s) の戻り値はどれか。',
        choices: ['3', '2', '4', '8'],
        answer: 0,
        explanation:
          '深さは 1, 2, 1, 2, 3, 2, 1, 0 と推移する。最大は 5 文字目の "(" を処理した直後の 3 なので、戻り値は 3。8 は括弧の総数、2 は 2 巡目の "(" までしか追わなかった場合の誤りである。',
      },
    ],
  },
  {
    id: 'b-algo-32',
    kind: 'algorithm',
    sectionId: 't-algo-1',
    level: 3,
    title: '2 分探索木への挿入',
    description:
      '2 分探索木を value・left・right という 3 つの配列と root で表現する。value[k] は節点 k の値、left[k]・right[k] はそれぞれ左の子・右の子の節点番号（0 は子がないことを意味する）を表す。次のプログラムは、新しい値 v 用の節点（節点番号は size で、value[size]・left[size]・right[size] は呼出し前にあらかじめ設定済みとする）を、2 分探索木の性質を保つ位置に接続する手続き insertBST である。value・left・right・root・size は大域変数として扱う。',
    code: `○insertBST(整数型: v)
  整数型: p ← root
  整数型: newNode ← size
  if (root = 0)
    root ← newNode
    return
  endif
  while (true)
    if (v < value[p])
      if (left[p] = 0)
        left[p] ← newNode
        return
      endif
      p ← left[p]
    else
      if ([ a ])
        right[p] ← newNode
        return
      endif
      p ← right[p]
    endif
  endwhile`,
    supplement:
      'root が 1、value が {8, 4, 12, 10}、left が {2, 0, 0, 0}、right が {3, 0, 0, 0}（節点1の値は8、節点2は4、節点3は12、節点4は10。size は 4 で、value[4]・left[4]・right[4] は挿入前にすでに設定済み）のとき、木は根8の左に4、右に12がぶら下がった形をしている。',
    subQuestions: [
      {
        prompt: '[ a ] に入れる字句はどれか。',
        choices: ['right[p] = 0', 'left[p] = 0', 'right[p] = newNode', 'v > value[p]'],
        answer: 0,
        explanation:
          '左側の分岐と対になる形で、右の子が空いているか（right[p] = 0）を確認してから接続する。left[p] = 0 は反対側の子を調べてしまう誤り、right[p] = newNode は代入前なので常に偽になり深さが際限なく進んでしまう。v > value[p] は値の比較を繰り返すだけで子の有無を確認しておらず、既存の右部分木を上書きして消してしまう危険がある。',
      },
      {
        prompt:
          '上記の supplement の状態（root=1、節点1=8、節点2=4、節点3=12、節点4=10 で value[4]・left[4]・right[4] は設定済み）で insertBST(10) を実行すると、新しい節点（節点4、値10）はどこに接続されるか。',
        choices: [
          '節点3（値12）の左の子として接続される',
          '節点3（値12）の右の子として接続される',
          '根（節点1、値8）の右の子として接続され、既存の節点3が上書きされる',
          '節点2（値4）の右の子として接続される',
        ],
        answer: 0,
        explanation:
          '10 は根の値 8 より大きいので右部分木（節点3、値12）へ進み、12 より小さいので左へ進もうとするが、節点3にはまだ左の子がないのでそこに接続される。8 より大きい値は節点2（値4）側には進まないため、節点2に接続される選択肢は誤り。',
      },
    ],
  },
  {
    id: 'b-algo-33',
    kind: 'algorithm',
    sectionId: 't-algo-2',
    level: 2,
    title: 'バブルソートの改良（早期打ち切り）',
    description:
      '次のプログラムは、整数型の配列 a を昇順に整列する関数 bubbleSort2 である。基本の手順は素朴なバブルソートと同じだが、1 回の外側ループの中で 1 度も交換が起きなければ、それ以上整列する必要はないと判断して処理を打ち切る。',
    code: `○整数型の配列: bubbleSort2(整数型の配列: a)
  整数型: i, j, tmp
  論理型: swapped
  for (i を 1 から aの要素数 − 1 まで 1 ずつ増やす)
    swapped ← false
    for (j を 1 から aの要素数 − i まで 1 ずつ増やす)
      if (a[j] > a[j + 1])
        tmp ← a[j]
        a[j] ← a[j + 1]
        a[j + 1] ← tmp
        swapped ← true
      endif
    endfor
    if (not [ a ])
      return a
    endif
  endfor
  return a`,
    supplement:
      '比較や交換の手順そのものは b-algo-04 の素朴なバブルソートと同じで、交換の有無を記録する swapped と早期打ち切りの判定だけが追加されている。',
    subQuestions: [
      {
        prompt: '[ a ] に入れる字句はどれか。',
        choices: ['swapped', 'true', 'i = 1', 'j'],
        answer: 0,
        explanation:
          '「1 度も交換が起きなければ swapped は false のまま」なので、not swapped が真になったときに打ち切ればよい。true にすると not true は常に偽で早期打ち切りが一切発生せず改良の意味がなくなり、i = 1 は 1 巡目でしか判定が働かず、j はループ変数であって交換の有無を表さない。',
      },
      {
        prompt:
          '配列 a が既に昇順に整列済み（例えば {1, 2, 3, 4, 5}）である場合、b-algo-04 の素朴なバブルソートとこの bubbleSort2 の動作の違いとして、最も適切なものはどれか。',
        choices: [
          'bubbleSort2 は外側のループを 1 回実行しただけで打ち切るのに対し、素朴な版は最後まで全ての外側ループを実行する',
          '両者の比較回数は完全に同じになる',
          'bubbleSort2 の方が戻り値の配列の並びが異なる',
          '素朴な版の方が少ない比較回数で終了する',
        ],
        answer: 0,
        explanation:
          '整列済みの配列では 1 巡目の内側ループで一度も交換が起きないため、bubbleSort2 は swapped が false のままとなり直ちに打ち切る。一方、素朴な版はすでに整列済みでも i を最後まで回し続けるので、比較回数は bubbleSort2 より多くなる。最終的な並びはどちらも同じ（整列済みのまま）である。',
      },
    ],
  },
  {
    id: 'b-algo-34',
    kind: 'algorithm',
    sectionId: 't-algo-6',
    level: 2,
    title: '1 次元配列で表現した表の行ごとの集計',
    description:
      '次のプログラムは、rows 行 cols 列の表を 1 次元の整数型配列 a で表現し（r 行 c 列の要素は a[(r − 1) × cols + c] に格納されているものとする）、各行の合計のうち最大のものを返す関数 maxRowSum である。2 次元配列の記法は使わず、1 次元配列と添字の計算だけで表を扱う。',
    code: `○整数型: maxRowSum(整数型の配列: a, 整数型: rows, 整数型: cols)
  整数型: r, c, rowSum
  整数型: best ← 0
  for (c を 1 から cols まで 1 ずつ増やす)
    best ← best + a[c]      /* 1 行目の合計で best を初期化する */
  endfor
  for (r を 2 から rows まで 1 ずつ増やす)
    rowSum ← 0
    for (c を 1 から cols まで 1 ずつ増やす)
      rowSum ← rowSum + a[[ a ]]
    endfor
    if (rowSum > best)
      best ← rowSum
    endif
  endfor
  return best`,
    supplement:
      '例えば rows = 2, cols = 3 のとき、a[1]〜a[3] が 1 行目、a[4]〜a[6] が 2 行目に対応する。',
    subQuestions: [
      {
        prompt: '[ a ] に入れる字句はどれか。',
        choices: ['(r − 1) × cols + c', 'r × cols + c', '(r − 1) × cols + c − 1', '(c − 1) × rows + r'],
        answer: 0,
        explanation:
          '行 r・列 c の要素は、r − 1 個分の行（各 cols 個）を飛ばした先の c 番目にある。r × cols + c にすると 1 行分余分にずれて最終行で範囲外を参照し、c − 1 を加えると先頭がずれて前の行の末尾を指してしまう。(c − 1) × rows + r は行と列を入れ替えた（列優先の）添字計算であり、この問題の行優先の格納方式とは合わない。',
      },
      {
        prompt: 'rows が 2、cols が 3、a が {1, 5, 2, 9, 0, 4} のとき、maxRowSum(a, rows, cols) の戻り値はどれか。',
        choices: ['13', '8', '21', '9'],
        answer: 0,
        explanation:
          '1 行目は a[1]〜a[3] の 1, 5, 2 で合計 8。2 行目は a[4]〜a[6] の 9, 0, 4 で合計 13。大きい方の 13 が戻り値になる。21 は全要素の合計、9 は配列中の最大値そのものであり、行ごとの合計を求めるという設問の趣旨とは異なる。',
      },
    ],
  },
];

export const questionsB3ById = (id: string): QuestionB | undefined => QUESTIONS_B3.find((q) => q.id === id);
