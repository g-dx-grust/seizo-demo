import { useEffect, useState } from 'react';
import { Card, CardTitle, KpiCard, Pill } from '../components/ui';
import { fmt, machines, stopCost, timeline24h } from '../data/mock';
import type { SegType, Tone } from '../data/mock';

const statusTone: Record<string, Tone> = { 稼働: 'green', 準備中: 'blue', 待機: 'amber', 停止: 'red' };
const barColor: Record<string, string> = {
  稼働: 'bg-green',
  準備中: 'bg-blue',
  待機: 'bg-amber',
  停止: 'bg-red',
};
const segColor: Record<SegType, string> = {
  run: 'bg-green',
  setup: 'bg-blue',
  idle: 'bg-amber',
  stop: 'bg-red',
};

function LivePill() {
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-bold text-green">
      <span className="relative flex w-2 h-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-60" />
        <span className="relative inline-flex rounded-full w-2 h-2 bg-green" />
      </span>
      ライブ
    </span>
  );
}

export default function Machines() {
  // 稼働中設備の稼働率を3秒毎に±1%だけ揺らして「動いている感」を出す
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);
  const jitter = (i: number, status: string) => (status === '稼働' ? ((tick + i) % 3) - 1 : 0);

  return (
    <>
      <div className="grid grid-cols-4 gap-6">
        <KpiCard label="総合稼働率" value="71.3%" sub="前週比 +3.5pt" subTone="green" right={<LivePill />} />
        <KpiCard label="稼働中" value="7/12台" sub="準備2 ／ 待機2 ／ 停止1" subTone="gray" />
        <KpiCard
          label="本日の停止"
          value="3回・42分"
          valueClass="text-red"
          sub="600t#2 で発生中"
          subTone="red"
        />
        <KpiCard label="本日の電力量" value="1,284kWh" sub="前日比 -4.2%" subTone="green" />
      </div>

      {/* 設備12台グリッド */}
      <Card>
        <CardTitle
          right={
            <div className="flex items-center gap-3">
              <Pill tone="gray">データ元 JupiterX（5分毎）</Pill>
              <LivePill />
            </div>
          }
        >
          設備ステータス（12台）
        </CardTitle>
        <div className="grid grid-cols-4 gap-4">
          {machines.map((m, i) => {
            const rate = Math.max(0, Math.min(100, m.rate + jitter(i, m.status)));
            return (
              <div
                key={m.name}
                className={`rounded-[12px] border p-4 ${
                  m.alert ? 'border-red/50 bg-red-l/50' : 'border-line bg-surface'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-t1 flex items-center gap-1.5">
                    {m.alert && (
                      <span className="relative flex w-2 h-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-70" />
                        <span className="relative inline-flex rounded-full w-2 h-2 bg-red" />
                      </span>
                    )}
                    {m.name}
                  </span>
                  <Pill tone={statusTone[m.status]}>{m.status}</Pill>
                </div>
                <div className="mt-2.5 flex items-baseline gap-1">
                  <span className={`text-[21px] font-black leading-none ${m.alert ? 'text-red' : 'text-t1'}`}>
                    {rate}
                  </span>
                  <span className="text-[11px] text-t3">%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-track overflow-hidden">
                  <div className={`h-full rounded-full ${barColor[m.status]}`} style={{ width: `${rate}%` }} />
                </div>
                <div className={`mt-2 text-[11px] h-4 ${m.alert ? 'text-red font-medium' : 'text-t3'}`}>
                  {m.note ?? ''}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {/* 停止コスト換算 */}
        <Card>
          <CardTitle right={<Pill tone="gray">今月</Pill>}>停止コスト換算</CardTitle>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[10px] bg-bg p-3">
              <div className="text-[10px] text-t3">停止累計</div>
              <div className="text-[17px] font-black text-t1 mt-0.5">
                {stopCost.totalHours}
                <span className="text-[11px] font-medium text-t3 ml-1">({stopCost.totalCount}回)</span>
              </div>
            </div>
            <div className="rounded-[10px] bg-bg p-3">
              <div className="text-[10px] text-t3">損失換算</div>
              <div className="text-[17px] font-black text-red mt-0.5">{fmt(stopCost.loss)}千円</div>
              <div className="text-[10px] text-green font-medium">前月 {fmt(stopCost.lossPrev)} → 改善</div>
            </div>
            <div className="rounded-[10px] bg-bg p-3">
              <div className="text-[10px] text-t3">最大要因</div>
              <div className="text-[12px] font-bold text-t1 mt-0.5">{stopCost.topFactor}</div>
              <div className="text-[10px] text-t2">
                {fmt(stopCost.topAmount)}千円（{stopCost.topShare}）
              </div>
            </div>
            <div className="rounded-[10px] bg-bg p-3">
              <div className="text-[10px] text-t3">平均チャージレート</div>
              <div className="text-[17px] font-black text-t1 mt-0.5">{stopCost.charge}</div>
              <div className="text-[10px] text-t2">{stopCost.chargeNote}</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-line text-[10px] text-t3 leading-relaxed">
            {stopCost.masterNote}
          </div>
        </Card>

        {/* 24hタイムライン */}
        <Card className="col-span-2">
          <CardTitle
            right={
              <div className="flex items-center gap-3 text-[10px] text-t2">
                {(
                  [
                    ['run', '稼働'],
                    ['setup', '準備'],
                    ['idle', '待機'],
                    ['stop', '停止'],
                  ] as [SegType, string][]
                ).map(([t, label]) => (
                  <span key={t} className="flex items-center gap-1">
                    <span className={`w-2.5 h-2.5 rounded-[3px] ${segColor[t]}`} />
                    {label}
                  </span>
                ))}
              </div>
            }
          >
            稼働タイムライン（6:00〜22:00）
          </CardTitle>
          <div className="flex flex-col gap-2.5">
            {timeline24h.map((row) => (
              <div key={row.name} className="flex items-center gap-3">
                <div className="w-[76px] shrink-0 text-[11px] font-medium text-t2">{row.name}</div>
                <div className="flex-1 flex h-5 rounded-[5px] overflow-hidden bg-track">
                  {row.segs.map((s, i) => (
                    <div key={i} className={segColor[s.t]} style={{ width: `${s.w * 100}%` }} />
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 mt-1">
              <div className="w-[76px] shrink-0" />
              <div className="flex-1 flex justify-between text-[10px] text-t3">
                <span>6:00</span>
                <span>10:00</span>
                <span>14:00</span>
                <span>18:00</span>
                <span>22:00</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
