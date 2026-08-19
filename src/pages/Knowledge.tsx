import { useMemo, useState } from 'react';
import { FileText, Search, Star, TrendingUp } from 'lucide-react';
import { Card, CardTitle, Pill } from '../components/ui';
import {
  knowledgeArticles,
  knowledgeCategories,
  knowledgeQueryPreset,
  knowledgeRanking,
  knowledgeStats,
  knowledgeTotalHits,
} from '../data/mock';
import type { Tone } from '../data/mock';

const catTone: Record<string, Tone> = { 作業標準: 'blue', 金型ノウハウ: 'purple', 改善事例: 'green' };

export default function Knowledge() {
  const [query, setQuery] = useState(knowledgeQueryPreset);

  // 入力でリアルタイム絞り込み（スペース区切りのOR検索）
  const results = useMemo(() => {
    const tokens = query.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return knowledgeArticles;
    return knowledgeArticles.filter((a) =>
      tokens.some(
        (t) =>
          a.title.includes(t) ||
          a.cat.includes(t) ||
          a.author.includes(t) ||
          a.keywords.some((k) => k.includes(t) || t.includes(k)),
      ),
    );
  }, [query]);

  return (
    <>
      {/* 検索ヒーロー */}
      <Card>
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-t3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-12 rounded-[12px] bg-bg border border-line pl-11 pr-4 text-[14px] placeholder:text-t3 outline-none focus:border-blue"
            placeholder="キーワードで検索（例：600t プレス 金型異常）"
          />
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-t3">
          <span>よく使われる検索：</span>
          {['600t 金型異常', 'カス上がり', '段取り替え'].map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="h-6 px-2.5 rounded-full bg-track text-t2 hover:bg-line font-medium"
            >
              {s}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-6 items-start">
        {/* 検索結果 */}
        <div className="col-span-2 flex flex-col gap-6">
          <Card>
            <CardTitle
              right={
                <span className="text-[11px] text-t3">
                  結果{knowledgeTotalHits}件のうち {results.length}件を表示
                </span>
              }
            >
              検索結果
            </CardTitle>
            <div>
              {results.map((a) => (
                <div
                  key={a.title}
                  className="flex items-start gap-3.5 py-4 border-t border-line first:border-t-0 first:pt-0 cursor-pointer group"
                >
                  <span className="w-9 h-9 rounded-[10px] bg-bg border border-line flex items-center justify-center text-t3 shrink-0">
                    <FileText size={16} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-bold text-t1 group-hover:text-blue leading-snug">
                        {a.title}
                      </span>
                      {a.hot && (
                        <Pill tone="amber">
                          <Star size={10} className="fill-current" />
                          よく見られています
                        </Pill>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 mt-1.5 text-[11px] text-t3">
                      <Pill tone={catTone[a.cat]}>{a.cat}</Pill>
                      <span>{a.author}</span>
                      <span>{a.date}</span>
                    </div>
                  </div>
                </div>
              ))}
              {results.length === 0 && (
                <div className="py-10 text-center text-[12px] text-t3">該当するナレッジが見つかりませんでした</div>
              )}
            </div>
          </Card>
        </div>

        {/* サイドカラム */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardTitle>カテゴリ</CardTitle>
            <div className="flex flex-col gap-2.5">
              {knowledgeCategories.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-[13px]">
                  <span className="flex items-center gap-2">
                    <Pill tone={catTone[c.name]}>{c.name}</Pill>
                  </span>
                  <span className="font-bold text-t1 tabular-nums">{c.count}件</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle right={<Pill tone="gray">今月</Pill>}>閲覧ランキング</CardTitle>
            <div className="flex flex-col">
              {knowledgeRanking.map((r, i) => (
                <div key={r.title} className="flex items-center gap-3 py-2.5 border-t border-line first:border-t-0 first:pt-0">
                  <span
                    className={`w-5 h-5 rounded-[6px] text-[11px] font-black flex items-center justify-center shrink-0 ${
                      i < 3 ? 'bg-blue text-white' : 'bg-track text-t3'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[12px] text-t1 leading-snug flex-1 truncate">{r.title}</span>
                  <span className="text-[10px] text-t3 tabular-nums shrink-0">{r.views}回</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle right={<TrendingUp size={14} className="text-green" />}>ナレッジ統計</CardTitle>
            <div className="flex flex-col gap-2.5 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-t2">今月の新規投稿</span>
                <span className="font-bold text-t1">{knowledgeStats.posts}件</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-t2">今月の検索回数</span>
                <span className="font-bold text-t1">{knowledgeStats.searches}回</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-t2">平均解決時間</span>
                <span className="font-bold text-green">{knowledgeStats.solveTime}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
