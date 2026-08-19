import { CheckCircle2, Play, Square } from 'lucide-react';
import { Pill } from '../../components/ui';
import { scanResult, todayScanRecords } from '../../data/mock';
import { useDemo } from '../../state/DemoContext';

// バーコード意匠（静的なストライプ）
const stripes = [3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 1];

export default function MScan() {
  const { showToast } = useDemo();

  return (
    <div className="p-4 flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-black text-t1">実績入力</h1>
        <p className="text-[11px] text-t3 mt-0.5">バーコードで工数を自動記録</p>
      </div>

      {/* スキャンエリア */}
      <div className="rounded-[14px] bg-navy p-6 flex flex-col items-center">
        <div className="flex items-end gap-[3px] h-16">
          {stripes.map((w, i) => (
            <div key={i} className="bg-white/90 h-full rounded-[1px]" style={{ width: w }} />
          ))}
        </div>
        <div className="mt-4 text-white text-[13px] font-bold">部品のバーコードをスキャン</div>
        <div className="mt-1 text-side-dim text-[11px]">カメラを起動して読み取ります</div>
      </div>

      {/* 読取結果 */}
      <div className="bg-surface rounded-[14px] border border-line shadow-[0_2px_8px_rgba(15,23,42,0.05)] p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-green">
            <CheckCircle2 size={13} />
            読取成功
          </span>
          <Pill tone="gray">たった今</Pill>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[16px] font-black text-t1">{scanResult.code}</span>
          <span className="text-[13px] font-bold text-t1">{scanResult.part}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-y-2 text-[12px]">
          <div>
            <div className="text-[10px] text-t3">工程</div>
            <div className="font-medium text-t1 mt-0.5">{scanResult.process}</div>
          </div>
          <div>
            <div className="text-[10px] text-t3">設備</div>
            <div className="font-medium text-t1 mt-0.5">{scanResult.machine}</div>
          </div>
          <div>
            <div className="text-[10px] text-t3">標準工数</div>
            <div className="font-medium text-t1 mt-0.5">{scanResult.stdHours}</div>
          </div>
          <div>
            <div className="text-[10px] text-t3">実績</div>
            <div className="font-medium text-blue mt-0.5">{scanResult.actHours}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            onClick={() => showToast('作業開始を記録しました（WC-1）')}
            className="h-11 rounded-[12px] bg-green text-white text-[13px] font-bold flex items-center justify-center gap-1.5 active:opacity-80"
          >
            <Play size={14} className="fill-current" />
            作業開始
          </button>
          <button
            onClick={() => showToast('完了を記録しました。工数はK-1088へ自動集計されます')}
            className="h-11 rounded-[12px] bg-blue text-white text-[13px] font-bold flex items-center justify-center gap-1.5 active:opacity-80"
          >
            <Square size={12} className="fill-current" />
            完了を記録
          </button>
        </div>
      </div>

      {/* 本日の実績 */}
      <div className="bg-surface rounded-[14px] border border-line shadow-[0_2px_8px_rgba(15,23,42,0.05)] p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[13px] font-bold text-t1">本日の実績 {todayScanRecords.length}件</span>
          <Pill tone="green">読取率 100%</Pill>
        </div>
        {todayScanRecords.map((r) => (
          <div key={r.code} className="flex items-center gap-3 py-3 border-t border-line first:border-t-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-t1">{r.code}</span>
                <span className="text-[12px] text-t2">{r.part}</span>
              </div>
              <div className="text-[10px] text-t3 mt-0.5">
                {r.process}・{r.time}
              </div>
            </div>
            <span className="text-[12px] font-bold text-t1 tabular-nums shrink-0">{r.hours}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
