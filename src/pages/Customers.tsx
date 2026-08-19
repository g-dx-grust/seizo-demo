import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardTitle, Donut, Pill } from '../components/ui';
import { customerHighlights, customerShare, customers, fmt } from '../data/mock';
import type { Tone } from '../data/mock';

const trendTone: Record<string, Tone> = { 拡大: 'green', 維持: 'gray', 注意: 'amber' };
const hlIcons: Record<Tone, typeof TrendingUp> = {
  green: TrendingUp,
  red: TrendingDown,
  amber: AlertTriangle,
  blue: TrendingUp,
  purple: TrendingUp,
  gray: TrendingUp,
};
const hlTone: Record<Tone, string> = {
  green: 'bg-green-l text-green',
  red: 'bg-red-l text-red',
  amber: 'bg-amber-l text-amber',
  blue: 'bg-blue-l text-blue',
  purple: 'bg-purple-l text-purple',
  gray: 'bg-track text-t2',
};

export default function Customers() {
  const maxSales = customers[0].sales;

  return (
    <>
      <div className="grid grid-cols-3 gap-6">
        {/* 顧客別 売上・粗利バー */}
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
                <Pill tone="gray">年度累計 14.4億円</Pill>
              </div>
            }
          >
            顧客別 売上・粗利（百万円）
          </CardTitle>
          <div className="flex flex-col gap-3.5">
            {customers.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="w-[110px] shrink-0 text-[12px] text-t1 font-medium truncate">{c.name}</div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="h-[10px] rounded-full bg-track overflow-hidden">
                    <div className="h-full rounded-full bg-blue" style={{ width: `${(c.sales / maxSales) * 100}%` }} />
                  </div>
                  <div className="h-[6px] rounded-full bg-track overflow-hidden">
                    <div className="h-full rounded-full bg-green" style={{ width: `${(c.profit / maxSales) * 100}%` }} />
                  </div>
                </div>
                <div className="w-[110px] shrink-0 text-right text-[12px] tabular-nums">
                  <span className="font-bold text-t1">{fmt(c.sales)}</span>
                  <span className="text-t3"> / </span>
                  <span className="text-green font-medium">{fmt(c.profit)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 構成比 */}
        <Card>
          <CardTitle>売上構成比</CardTitle>
          <div className="flex flex-col items-center">
            <Donut
              data={customerShare.map((s) => ({ value: s.pct, color: s.color }))}
              center={
                <>
                  <div className="text-[22px] font-black text-t1 leading-none">14.4</div>
                  <div className="text-[10px] text-t3 mt-1">億円（年度累計）</div>
                </>
              }
            />
            <div className="grid grid-cols-2 gap-x-5 gap-y-2 mt-4 w-full">
              {customerShare.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-t2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                    {s.name}
                  </span>
                  <span className="font-bold text-t1 shrink-0">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 注目ポイント */}
        <Card>
          <CardTitle>注目ポイント</CardTitle>
          <div className="flex flex-col gap-3.5">
            {customerHighlights.map((h, i) => {
              const Icon = hlIcons[h.tone];
              return (
                <div key={i} className="flex items-start gap-3">
                  <span className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${hlTone[h.tone]}`}>
                    <Icon size={15} />
                  </span>
                  <span className="text-[12px] text-t1 leading-relaxed pt-1">{h.text}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 明細テーブル */}
        <Card className="col-span-2 p-0 overflow-hidden">
          <CardTitle className="px-5 pt-5 mb-3">顧客別 明細（百万円）</CardTitle>
          <table className="w-full">
            <thead>
              <tr className="h-[42px] bg-thead text-[11px] text-t3">
                <th className="text-left font-medium pl-5">顧客</th>
                <th className="text-right font-medium pr-7">売上</th>
                <th className="text-right font-medium pr-7">粗利</th>
                <th className="text-right font-medium pr-7">粗利率</th>
                <th className="text-right font-medium pr-7">前年比</th>
                <th className="text-left font-medium">傾向</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.name} className="h-12 border-t border-line text-[13px]">
                  <td className="pl-5 font-medium text-t1">{c.name}</td>
                  <td className="text-right pr-7 tabular-nums text-t1">{fmt(c.sales)}</td>
                  <td className="text-right pr-7 tabular-nums text-t1">{fmt(c.profit)}</td>
                  <td className="text-right pr-7 tabular-nums text-t2">
                    {((c.profit / c.sales) * 100).toFixed(1)}%
                  </td>
                  <td
                    className={`text-right pr-7 tabular-nums font-medium ${
                      c.yoy.startsWith('+') ? 'text-green' : c.yoy.startsWith('-') ? 'text-red' : 'text-t3'
                    }`}
                  >
                    {c.yoy}
                  </td>
                  <td>{c.trend && <Pill tone={trendTone[c.trend]}>{c.trend}</Pill>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
