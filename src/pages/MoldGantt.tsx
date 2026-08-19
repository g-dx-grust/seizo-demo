import { useNavigate } from 'react-router-dom';
import { ChevronRight, Info } from 'lucide-react';
import { Card, CardTitle, KpiCard, Pill } from '../components/ui';
import { DEMO_DATE, K1088, fmt, ganttRange, ganttRows } from '../data/mock';
import type { GanttBarType } from '../data/mock';
import { useK1088Live } from '../state/DemoContext';

const gStart = new Date(ganttRange.start).getTime();
const gEnd = new Date(ganttRange.end).getTime();
const pct = (d: string | Date) => {
  const t = typeof d === 'string' ? new Date(d).getTime() : d.getTime();
  return ((t - gStart) / (gEnd - gStart)) * 100;
};

const barStyle: Record<GanttBarType, string> = {
  done: 'bg-green',
  plan: 'bg-plan',
  late: 'bg-red',
  replan: 'bg-amber',
  future: 'bg-blue-l border border-blue/60',
};

const months = [
  { date: '2026-06-01', label: '6月' },
  { date: '2026-07-01', label: '7月' },
  { date: '2026-08-01', label: '8月' },
  { date: '2026-09-01', label: '9月' },
];

export default function MoldGantt() {
  const nav = useNavigate();
  const live = useK1088Live();
  const todayPct = pct(DEMO_DATE);

  return (
    <>
      {/* 案件ヘッダ */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[21px] font-black text-t1">{K1088.no}</span>
              <Pill tone="purple">{K1088.category}</Pill>
              <Pill tone="red">遅延 +{K1088.delayDays}日</Pill>
            </div>
            <div className="text-[14px] font-bold text-t1 mt-1.5">{K1088.name}</div>
            <div className="text-[12px] text-t2 mt-2 flex items-center gap-4">
              <span>顧客：{K1088.customer}</span>
              <span>
                納期：<span className="font-bold text-t1">{K1088.dueDate}</span>
              </span>
              <span>担当：{K1088.owner}</span>
            </div>
          </div>
          <button
            onClick={() => nav('/profit/k-1088')}
            className="h-9 px-4 rounded-[10px] bg-blue text-white text-[12px] font-medium flex items-center gap-1 hover:opacity-90"
          >
            採算詳細を見る
            <ChevronRight size={14} />
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-6">
        <KpiCard label="納期まで" value="24日" sub="9/10 出荷予定" subTone="gray" />
        <KpiCard label="現工程" value="部品加工" sub="進捗 68%" subTone="blue" />
        <KpiCard label="遅延" value="+3日" valueClass="text-red" sub="挽回計画あり" subTone="amber" />
        <KpiCard label="利益率（現時点）" value={`${live.profitRate.toFixed(1)}%`} valueClass="text-amber" sub={`粗利 ${fmt(K1088.orderAmount - live.actualCost)}千円 ／ 見積時 25.0%`} subTone="gray" />
      </div>

      {/* ガント */}
      <Card>
        <CardTitle
          right={
            <div className="flex items-center gap-3 text-[10px] text-t2">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[3px] bg-green" />完了</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[3px] bg-plan" />計画</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[3px] bg-red" />実績遅延</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[3px] bg-amber" />再計画</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[3px] bg-blue-l border border-blue/60" />予定</span>
            </div>
          }
        >
          工程スケジュール（6/1〜9/20）
        </CardTitle>

        <div className="relative pt-7">
          {/* 月ラベル＋グリッド／今日ライン（ラベル列の右側のみ） */}
          <div className="absolute top-0 bottom-0 left-[104px] right-0">
            {months.map((m) => (
              <div key={m.label} className="absolute top-0 bottom-0" style={{ left: `${pct(m.date)}%` }}>
                <div className="absolute top-6 bottom-0 border-l border-line" />
                <span className="absolute top-0 text-[10px] text-t3 pl-1 whitespace-nowrap">{m.label}</span>
              </div>
            ))}
            {/* 今日ライン（DEMO_DATEから算出） */}
            <div className="absolute top-5 bottom-0 z-10" style={{ left: `${todayPct}%` }}>
              <div className="absolute top-3 bottom-0 border-l-2 border-dashed border-red" />
              <span className="absolute top-0 -translate-x-1/2 bg-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                今日 8/17
              </span>
            </div>
          </div>

          {/* 行 */}
          <div className="mt-1">
            {ganttRows.map((row) => (
              <div key={row.label} className="flex items-center h-12 border-t border-line first:border-t-0">
                <div className="w-[104px] shrink-0 text-[12px] font-medium text-t1">{row.label}</div>
                <div className="relative flex-1 h-full">
                  {row.bars.map((bar, i) => {
                    const left = pct(bar.from);
                    const width = pct(bar.to) - left;
                    const isPlanThin = bar.type === 'plan' && row.bars.length > 1;
                    return (
                      <div key={i}>
                        <div
                          className={`absolute rounded-[5px] ${barStyle[bar.type]} ${
                            isPlanThin ? 'h-[7px] top-[9px]' : 'h-[14px] top-[24px]'
                          } ${row.bars.length === 1 ? '!top-[17px]' : ''}`}
                          style={{ left: `${left}%`, width: `${width}%` }}
                        />
                        {bar.note && (
                          <span
                            className={`absolute top-[22px] text-[10px] font-bold whitespace-nowrap ${
                              bar.type === 'late' ? 'text-red' : 'text-amber'
                            }`}
                            style={{ left: `calc(${left + width}% + 6px)` }}
                          >
                            {bar.note}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {row.milestone && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                      style={{ left: `${pct(row.milestone.date)}%` }}
                    >
                      <div className="w-3 h-3 bg-t1 rotate-45 rounded-[2px] mx-auto" />
                      <div className="text-[10px] font-bold text-t1 mt-1 whitespace-nowrap -translate-x-1/3">
                        {row.milestone.label}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 挽回計画 */}
      <Card className="border-amber/30 bg-amber-l/50">
        <div className="flex items-start gap-3">
          <span className="w-8 h-8 rounded-[10px] bg-amber text-white flex items-center justify-center shrink-0">
            <Info size={15} />
          </span>
          <div>
            <div className="text-[13px] font-bold text-t1">挽回計画</div>
            <div className="text-[12px] text-t2 mt-1 leading-relaxed">
              部品加工の遅延（+15日）を受け、組立を 8/21 開始に再計画。組立へ応援2名を投入し 9/2
              完了見込み。検査 9/3〜9/8 を経て、納期 <span className="font-bold text-t1">9/10 は死守見込み</span>。
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
