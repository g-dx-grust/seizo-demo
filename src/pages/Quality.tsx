import { Card, CardTitle, Donut, KpiCard, Pill } from '../components/ui';
import { correctiveActions, defectCauses, pareto, paretoNote } from '../data/mock';
import type { Tone } from '../data/mock';

const actionTone: Record<string, Tone> = { 対応中: 'amber', 完了: 'green', 未着手: 'gray' };

// パレート図（自作SVG: 棒＋累積折れ線）
function ParetoChart() {
  const W = 640;
  const H = 240;
  const padL = 16;
  const padR = 40;
  const padT = 20;
  const padB = 34;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxCount = 80;
  const n = pareto.length;
  const slot = chartW / n;
  const barW = slot * 0.52;

  const barX = (i: number) => padL + slot * i + (slot - barW) / 2;
  const cumX = (i: number) => padL + slot * i + slot / 2;
  const cumY = (cum: number) => padT + chartH - (cum / 100) * chartH;

  const linePoints = pareto.map((p, i) => `${cumX(i)},${cumY(p.cum)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* 右軸グリッド（累積%） */}
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={padL} x2={W - padR} y1={cumY(v)} y2={cumY(v)} stroke="var(--color-track)" strokeWidth={1} />
          <text x={W - padR + 6} y={cumY(v) + 3.5} fontSize={10} fill="var(--color-t3)">
            {v}%
          </text>
        </g>
      ))}
      {/* 棒 */}
      {pareto.map((p, i) => {
        const h = (p.count / maxCount) * chartH;
        return (
          <g key={p.name}>
            <rect x={barX(i)} y={padT + chartH - h} width={barW} height={h} rx={4} fill={p.color} />
            <text
              x={barX(i) + barW / 2}
              y={padT + chartH - h - 6}
              fontSize={11}
              fontWeight={700}
              textAnchor="middle"
              fill="var(--color-t1)"
            >
              {p.count}
            </text>
            <text x={cumX(i)} y={H - 12} fontSize={10.5} textAnchor="middle" fill="var(--color-t2)">
              {p.name}
            </text>
          </g>
        );
      })}
      {/* 累積折れ線 */}
      <polyline points={linePoints} fill="none" stroke="var(--color-t1)" strokeWidth={1.8} />
      {pareto.map((p, i) => (
        <circle key={i} cx={cumX(i)} cy={cumY(p.cum)} r={3.2} fill="var(--color-surface)" stroke="var(--color-t1)" strokeWidth={1.8} />
      ))}
    </svg>
  );
}

export default function Quality() {
  return (
    <>
      <div className="grid grid-cols-4 gap-6">
        <KpiCard label="不良率（今月）" value="0.42%" valueClass="text-green" sub="前月 0.51% → 改善" subTone="green" />
        <KpiCard label="不良数" value="214個" sub="対象 51,240個" subTone="gray" />
        <KpiCard label="不良コスト" value="386千円" sub="廃棄＋手直し換算" subTone="gray" />
        <KpiCard label="顧客クレーム" value="0件" valueClass="text-green" sub="直近90日" subTone="green" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* パレート */}
        <Card className="col-span-2">
          <CardTitle right={<Pill tone="gray">今月・品番別不良数</Pill>}>不良パレート図</CardTitle>
          <ParetoChart />
          <div className="mt-3 pt-3 border-t border-line text-[12px] text-t1 flex items-start gap-2">
            <span className="text-[11px] font-bold text-amber bg-amber-l rounded-full px-2 py-[3px] shrink-0">所見</span>
            <span className="leading-relaxed">{paretoNote}</span>
          </div>
        </Card>

        {/* 要因ドーナツ */}
        <Card>
          <CardTitle right={<Pill tone="gray">計214件</Pill>}>不良要因の内訳</CardTitle>
          <div className="flex flex-col items-center">
            <Donut
              data={defectCauses.map((d) => ({ value: d.pct, color: d.color }))}
              size={158}
              thickness={22}
              center={
                <>
                  <div className="text-[22px] font-black text-t1 leading-none">214</div>
                  <div className="text-[10px] text-t3 mt-1">件</div>
                </>
              }
            />
            <div className="flex flex-col gap-2 mt-4 w-full">
              {defectCauses.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-2 text-t2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    {d.name}
                  </span>
                  <span className="font-bold text-t1 tabular-nums">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* 是正対策 */}
      <Card className="p-0 overflow-hidden">
        <CardTitle className="px-5 pt-5 mb-3" right={<Pill tone="amber" className="mr-5">対応中 2件</Pill>}>
          是正対策の進捗
        </CardTitle>
        <table className="w-full">
          <thead>
            <tr className="h-[42px] bg-thead text-[11px] text-t3">
              <th className="text-left font-medium pl-5">品番</th>
              <th className="text-left font-medium">不良内容</th>
              <th className="text-left font-medium">是正対策</th>
              <th className="text-left font-medium">期限</th>
              <th className="text-left font-medium">担当</th>
              <th className="text-left font-medium">状態</th>
            </tr>
          </thead>
          <tbody>
            {correctiveActions.map((a) => (
              <tr key={a.item} className="h-12 border-t border-line text-[13px]">
                <td className="pl-5 font-bold text-t1">{a.item}</td>
                <td className="text-t1">{a.defect}</td>
                <td className="text-t2">{a.action}</td>
                <td className="text-t2 tabular-nums">{a.due}</td>
                <td className="text-t2">{a.owner}</td>
                <td>
                  <Pill tone={actionTone[a.status]}>{a.status}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
