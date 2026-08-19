import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock, Database } from 'lucide-react';
import { Card, CardTitle, KpiCard, Pill } from '../components/ui';
import { dailyPlan, delayedItems, fmt, productionRows } from '../data/mock';
import type { Tone } from '../data/mock';
import { useDemo } from '../state/DemoContext';

const rowStatusTone: Record<string, Tone> = { 順調: 'green', 遅延: 'red', 段取待ち: 'amber' };
const delayIcon: Record<Tone, typeof AlertTriangle> = {
  red: AlertTriangle,
  amber: Clock,
  green: CheckCircle2,
  blue: Clock,
  purple: Clock,
  gray: Clock,
};
const delayIconTone: Record<Tone, string> = {
  red: 'bg-red-l text-red',
  amber: 'bg-amber-l text-amber',
  green: 'bg-green-l text-green',
  blue: 'bg-blue-l text-blue',
  purple: 'bg-purple-l text-purple',
  gray: 'bg-track text-t2',
};

export default function Production() {
  const nav = useNavigate();
  const { imported } = useDemo();
  const c00Linked = !!imported['production_c00'];
  const maxQty = 9000;
  return (
    <>
      {/* 生産実績（C00）の連携状態バナー */}
      {c00Linked ? (
        <Card className="border-green/40 bg-green-l/60 py-3.5">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={16} className="text-green shrink-0" />
            <div className="text-[12px] text-t1">
              <span className="font-bold">製造実績（生産C00）連携済み：</span>
              8/16分 210行を手動CSVで取り込みました（たった今）。グラフ・テーブルは最新データです。
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-red/40 bg-red-l/60 py-3.5">
          <div className="flex items-center gap-3">
            <Database size={16} className="text-red shrink-0" />
            <div className="flex-1 text-[12px] text-t1">
              <span className="font-bold text-red">製造実績（生産C00）の前日データが未連携です</span>
              （昨日23:00 バッチ失敗）。表示は前回連携時点の値です。
            </div>
            <button
              onClick={() => nav('/import')}
              className="h-8 px-3.5 rounded-[8px] bg-red text-white text-[11px] font-bold hover:opacity-90 shrink-0"
            >
              CSVで再連携する
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-4 gap-6">
        <KpiCard label="計画達成率（今週）" value="96.4%" sub="目標 98.0%" subTone="amber" />
        <KpiCard label="生産数量" value="48,210個" sub="計画 50,020個" subTone="gray" />
        <KpiCard label="段取り替え" value="14回" sub="平均 38分" subTone="gray" />
        <KpiCard label="直行率" value="98.6%" sub="前週比 +0.3pt" subTone="green" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 日別 計画vs実績 */}
        <Card className="col-span-2">
          <CardTitle
            right={
              <div className="flex items-center gap-3 text-[11px] text-t2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[3px] bg-plan" />
                  計画
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[3px] bg-blue" />
                  実績
                </span>
              </div>
            }
          >
            日別 計画 vs 実績（個）
          </CardTitle>
          <div className="flex items-end gap-5 px-2">
            {dailyPlan.map((d) => {
              const actColor = d.alert ? 'bg-red' : d.inProgress ? 'bg-blue/50' : 'bg-blue';
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="text-[10px] tabular-nums text-t2 font-medium">{fmt(d.act)}</div>
                  <div className="w-full h-[150px] flex items-end justify-center gap-1.5">
                    <div
                      className="w-[38%] max-w-[30px] bg-plan rounded-t-[4px]"
                      style={{ height: `${(d.plan / maxQty) * 100}%` }}
                      title={`計画 ${fmt(d.plan)}個`}
                    />
                    <div
                      className={`w-[38%] max-w-[30px] rounded-t-[4px] ${actColor}`}
                      style={{ height: `${(d.act / maxQty) * 100}%` }}
                      title={`実績 ${fmt(d.act)}個`}
                    />
                  </div>
                  <div className="text-[11px] text-t2 font-medium">{d.day}</div>
                  <div className="h-5">
                    {d.alert && <Pill tone="red">{d.alert}</Pill>}
                    {d.inProgress && <Pill tone="blue">進行中</Pill>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 遅延品番 */}
        <Card>
          <CardTitle right={<Pill tone="red">要挽回 2件</Pill>}>遅延品番</CardTitle>
          <div className="flex flex-col gap-4">
            {delayedItems.map((d, i) => {
              const Icon = delayIcon[d.tone];
              return (
                <div key={i} className="flex items-start gap-3">
                  <span className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${delayIconTone[d.tone]}`}>
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-t1">{d.code}</span>
                      {d.name && <span className="text-[12px] text-t2">{d.name}</span>}
                      <span
                        className={`text-[12px] font-bold tabular-nums ${
                          d.tone === 'red' ? 'text-red' : d.tone === 'amber' ? 'text-amber' : 'text-green'
                        }`}
                      >
                        {d.qty}
                      </span>
                    </div>
                    <div className="text-[11px] text-t2 mt-0.5 leading-relaxed">{d.note}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* 品番テーブル */}
      <Card className="p-0 overflow-hidden">
        <CardTitle className="px-5 pt-5 mb-3">品番別 生産状況（今週）</CardTitle>
        <table className="w-full">
          <thead>
            <tr className="h-[42px] bg-thead text-[11px] text-t3">
              <th className="text-left font-medium pl-5">品番</th>
              <th className="text-left font-medium">品名</th>
              <th className="text-left font-medium">設備</th>
              <th className="text-right font-medium pr-7">計画（個）</th>
              <th className="text-right font-medium pr-7">実績（個）</th>
              <th className="text-right font-medium pr-7">達成率</th>
              <th className="text-right font-medium pr-7">不良数</th>
              <th className="text-left font-medium">状態</th>
            </tr>
          </thead>
          <tbody>
            {productionRows.map((r) => (
              <tr key={r.code} className="h-12 border-t border-line text-[13px]">
                <td className="pl-5 font-bold text-t1">{r.code}</td>
                <td className="text-t1">{r.name}</td>
                <td className="text-t2">{r.machine}</td>
                <td className="text-right pr-7 tabular-nums text-t2">{fmt(r.plan)}</td>
                <td className="text-right pr-7 tabular-nums text-t1">{fmt(r.act)}</td>
                <td
                  className={`text-right pr-7 tabular-nums font-bold ${
                    r.rate < 95 ? 'text-red' : r.rate < 100 ? 'text-amber' : 'text-green'
                  }`}
                >
                  {r.rate.toFixed(1)}%
                </td>
                <td className="text-right pr-7 tabular-nums text-t2">{r.defect}</td>
                <td>
                  <Pill tone={rowStatusTone[r.status]}>{r.status}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
