import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronRight, CircleDollarSign, ClipboardCheck, Factory, CalendarClock } from 'lucide-react';
import { Card, CardTitle, Donut, KpiCard, Pill } from '../components/ui';
import { customers, dashboardAlerts, machineDonut, monthlySales, fmt } from '../data/mock';
import { useK1088Live } from '../state/DemoContext';
import type { Tone } from '../data/mock';

const alertIcons: Record<string, typeof AlertTriangle> = {
  設備: Factory,
  納期: CalendarClock,
  承認: ClipboardCheck,
  採算: CircleDollarSign,
};
const alertIconTone: Record<Tone, string> = {
  red: 'bg-red-l text-red',
  amber: 'bg-amber-l text-amber',
  blue: 'bg-blue-l text-blue',
  green: 'bg-green-l text-green',
  purple: 'bg-purple-l text-purple',
  gray: 'bg-track text-t2',
};

export default function Dashboard() {
  const nav = useNavigate();
  const { pendingCount } = useK1088Live();
  const top5 = customers.slice(0, 5);
  const maxSales = 150; // バーのスケール上限（百万円）

  return (
    <>
      {/* KPI */}
      <div className="grid grid-cols-4 gap-6">
        <KpiCard label="年度売上（累計）" value="14.4億円" sub="前年同期比 +3.4%" subTone="green" />
        <KpiCard label="今月粗利率" value="24.1%" sub="粗利 35百万円 ／ 前月比 +0.8pt" subTone="green" />
        <KpiCard label="平均案件利益率" value="18.2%" sub="目標 22.0%（未達）" subTone="amber" />
        <KpiCard label="赤字案件" value="6件" valueClass="text-red" sub="先月 8件 → 改善" subTone="green" />
      </div>

      {/* 売上・粗利12ヶ月 ＋ 設備稼働ドーナツ */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardTitle
            right={
              <div className="flex items-center gap-3 text-[11px] text-t2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[3px] bg-blue" />
                  売上
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[3px] bg-green" />
                  粗利
                </span>
                <Pill tone="gray">2025/09〜2026/08</Pill>
              </div>
            }
          >
            売上・粗利 推移（12ヶ月）
          </CardTitle>
          <div className="flex items-end gap-2.5">
            {monthlySales.map((m) => (
              <div
                key={m.m}
                className="relative group flex-1 flex flex-col items-center gap-1.5 rounded-[8px] cursor-default hover:bg-track/50 transition-colors"
              >
                {/* ホバーツールチップ */}
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap rounded-[10px] bg-navy text-white px-3 py-2 shadow-lg">
                  <div className="text-[10px] font-bold text-white/60">{m.m}</div>
                  <div className="mt-1 flex flex-col gap-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-[2px] bg-blue" />
                      売上 <span className="font-bold tabular-nums">{m.sales}百万円</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-[2px] bg-green" />
                      粗利 <span className="font-bold tabular-nums">{m.profit}百万円</span>
                      <span className="text-white/60">粗利率 {((m.profit / m.sales) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div className="w-full h-[150px] flex items-end justify-center gap-1">
                  <div
                    className="w-[45%] max-w-[24px] bg-blue rounded-t-[4px]"
                    style={{ height: `${(m.sales / maxSales) * 100}%` }}
                  />
                  <div
                    className="w-[30%] max-w-[14px] bg-green rounded-t-[4px]"
                    style={{ height: `${(m.profit / maxSales) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-t3 group-hover:text-t1 group-hover:font-bold">{m.m}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-line text-[11px] text-t2">
            年度累計：売上 <span className="font-bold text-t1">14.4億円</span> ／ 粗利{' '}
            <span className="font-bold text-t1">3.3億円</span>（粗利率 22.9%）
          </div>
        </Card>

        <Card>
          <CardTitle right={<Pill tone="green">稼働中 7/12台</Pill>}>設備稼働状況</CardTitle>
          <div className="flex flex-col items-center">
            <Donut
              data={machineDonut}
              center={
                <>
                  <div className="text-[26px] font-black text-t1 leading-none">71.3%</div>
                  <div className="text-[10px] text-t3 mt-1">総合稼働率</div>
                </>
              }
            />
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 w-full px-2">
              {machineDonut.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-t2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    {d.name}
                  </span>
                  <span className="font-bold text-t1">{d.value}台</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => nav('/machines')}
              className="mt-4 w-full h-9 rounded-[10px] border border-line text-[12px] text-t2 hover:bg-bg flex items-center justify-center gap-1"
            >
              設備モニタリングへ
              <ChevronRight size={14} />
            </button>
          </div>
        </Card>
      </div>

      {/* アラート ＋ 顧客TOP5 */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardTitle right={<Pill tone="red">4件</Pill>}>要対応アラート</CardTitle>
          <div>
            {dashboardAlerts.map((a, i) => {
              const Icon = alertIcons[a.cat] ?? AlertTriangle;
              const title = a.usePending ? a.title.replace('{n}', String(pendingCount)) : a.title;
              return (
                <button
                  key={i}
                  onClick={() => nav(a.to)}
                  className="w-full flex items-center gap-3.5 py-3 border-t border-line first:border-t-0 first:pt-0 last:pb-0 text-left group"
                >
                  <span className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${alertIconTone[a.tone]}`}>
                    <Icon size={16} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <Pill tone={a.tone}>{a.cat}</Pill>
                      <span className="text-[13px] font-medium text-t1 truncate">{title}</span>
                    </span>
                    <span className="block text-[11px] text-t2 mt-1">{a.desc}</span>
                  </span>
                  <ChevronRight size={16} className="text-t3 group-hover:text-t2 shrink-0" />
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardTitle
            right={
              <button onClick={() => nav('/customers')} className="text-[11px] text-blue font-medium flex items-center gap-0.5">
                詳細を見る
                <ChevronRight size={12} />
              </button>
            }
          >
            顧客別売上 TOP5
          </CardTitle>
          <div className="flex flex-col gap-3.5">
            {top5.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-t2">{c.name}</span>
                  <span className="font-bold text-t1">{fmt(c.sales)}百万円</span>
                </div>
                <div className="h-2 rounded-full bg-track overflow-hidden">
                  <div className="h-full rounded-full bg-blue" style={{ width: `${(c.sales / top5[0].sales) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-line text-[11px] text-t2">
            上位2社で売上の <span className="font-bold text-amber">48%</span>（依存度に注意）
          </div>
        </Card>
      </div>
    </>
  );
}
