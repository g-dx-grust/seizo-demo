import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Card, KpiCard, Pill } from '../components/ui';
import { fmt, profitAiSummary, profitFilters, profitRows } from '../data/mock';
import { useK1088Live } from '../state/DemoContext';
import type { Tone } from '../data/mock';

const statusTone: Record<string, Tone> = { 順調: 'green', 要注意: 'amber', 赤字: 'red' };

export default function Profit() {
  const nav = useNavigate();
  const live = useK1088Live();
  const [filter, setFilter] = useState<(typeof profitFilters)[number]>('全案件');

  // K-1088 は承認stateに応じて派生値を差し込む
  const rows = profitRows
    .map((r) =>
      r.isK1088 ? { ...r, act: live.actualCost, rate: live.profitRate, diff: live.variance } : r,
    )
    .filter((r) => {
      if (filter === 'プレス量産') return r.category === 'プレス';
      if (filter === '金型製造') return r.category === '金型';
      if (filter === '赤字のみ') return r.rate < 0;
      return true;
    });

  return (
    <>
      <div className="grid grid-cols-4 gap-6">
        <KpiCard label="対象案件" value="48件" sub="うち進行中 31件" subTone="gray" />
        <KpiCard label="平均利益率" value="18.2%" sub="目標 22.0%（未達）" subTone="amber" />
        <KpiCard label="赤字案件" value="6件" valueClass="text-red" sub="先月 8件 → 改善" subTone="green" />
        <KpiCard label="見積差異 +10%超" value="9件" valueClass="text-amber" sub="要フォロー" subTone="amber" />
      </div>

      {/* AIサマリー */}
      <Card className="border-purple/20 bg-purple-l/60">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-[10px] bg-purple text-white flex items-center justify-center shrink-0">
            <Sparkles size={15} />
          </span>
          <div>
            <div className="text-[11px] font-bold text-purple">AIサマリー</div>
            <div className="text-[13px] text-t1 mt-0.5">{profitAiSummary}</div>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        {/* フィルタpill */}
        <div className="flex items-center gap-2 px-5 py-4">
          {profitFilters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-8 px-3.5 rounded-full text-[12px] font-medium transition-colors ${
                filter === f ? 'bg-blue text-white' : 'bg-track text-t2 hover:bg-line'
              }`}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-t3">{rows.length}件を表示</span>
        </div>

        <table className="w-full">
          <thead>
            <tr className="h-[42px] bg-thead text-[11px] text-t3">
              <th className="text-left font-medium pl-5">案件No</th>
              <th className="text-left font-medium">顧客</th>
              <th className="text-left font-medium">区分</th>
              <th className="text-right font-medium pr-7">受注金額（千円）</th>
              <th className="text-right font-medium pr-7">見積原価</th>
              <th className="text-right font-medium pr-7">実際原価（見込）</th>
              <th className="text-right font-medium pr-7">粗利益</th>
              <th className="text-right font-medium pr-7">利益率</th>
              <th className="text-right font-medium pr-7">差異</th>
              <th className="text-left font-medium">状態</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const gross = r.order - r.act;
              return (
              <tr
                key={r.no}
                onClick={r.isK1088 ? () => nav('/profit/k-1088') : undefined}
                className={`h-12 border-t border-line text-[13px] ${
                  r.isK1088 ? 'cursor-pointer hover:bg-blue-l/40' : ''
                }`}
              >
                <td className={`pl-5 font-bold ${r.isK1088 ? 'text-blue' : 'text-t1'}`}>{r.no}</td>
                <td className="text-t1">{r.customer}</td>
                <td>
                  <Pill tone={r.category === '金型' ? 'purple' : 'blue'}>{r.category}</Pill>
                </td>
                <td className="text-right pr-7 tabular-nums text-t1">{fmt(r.order)}</td>
                <td className="text-right pr-7 tabular-nums text-t2">{fmt(r.est)}</td>
                <td className="text-right pr-7 tabular-nums text-t1">{fmt(r.act)}</td>
                <td className={`text-right pr-7 tabular-nums font-medium ${gross < 0 ? 'text-red' : 'text-t1'}`}>
                  {fmt(gross)}
                </td>
                <td
                  className={`text-right pr-7 tabular-nums font-bold ${
                    r.rate < 0 ? 'text-red' : r.rate < 15 ? 'text-amber' : 'text-t1'
                  }`}
                >
                  {r.rate.toFixed(1)}%
                </td>
                <td className={`text-right pr-7 tabular-nums font-medium ${r.diff > 0 ? 'text-red' : 'text-green'}`}>
                  {r.diff > 0 ? '+' : ''}
                  {fmt(r.diff)}
                </td>
                <td>
                  <Pill tone={statusTone[r.status]}>{r.status}</Pill>
                </td>
                <td className="text-center">
                  {r.isK1088 && <ChevronRight size={15} className="text-t3 inline" />}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}
