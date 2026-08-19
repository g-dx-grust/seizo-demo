import { useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { Bar, Card, KpiCard, Pill } from '../components/ui';
import { kanbanColumns } from '../data/mock';

export default function Molds() {
  const nav = useNavigate();

  return (
    <>
      <div className="grid grid-cols-4 gap-6">
        <KpiCard label="進行中" value="12件" sub="受注残 1.2億円" subTone="gray" />
        <KpiCard label="今月出荷予定" value="3件" sub="K-1075 ／ K-1079 ／ K-1081" subTone="blue" />
        <KpiCard label="遅延" value="1件" valueClass="text-red" sub="K-1088（+3日）" subTone="red" />
        <KpiCard label="バーコード読取率（今月）" value="96.2%" sub="未読取分は日報から自動補完" subTone="gray" />
      </div>

      {/* カンバン */}
      <div className="grid grid-cols-5 gap-4 items-start">
        {kanbanColumns.map((col) => (
          <div key={col.title} className="bg-track/60 rounded-[14px] p-3">
            <div className="flex items-center justify-between px-1 mb-3">
              <span className="text-[12px] font-bold text-t1">{col.title}</span>
              <span className="text-[11px] font-bold text-t3 bg-surface rounded-full w-5 h-5 flex items-center justify-center">
                {col.items.length}
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {col.items.map((item) => {
                const isDelay = !!item.delay;
                return (
                  <div
                    key={item.no}
                    onClick={item.link ? () => nav(item.link!) : undefined}
                    className={`bg-surface rounded-[12px] border p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] ${
                      isDelay ? 'border-red/50' : 'border-line'
                    } ${item.link ? 'cursor-pointer hover:shadow-[0_4px_12px_rgba(15,23,42,0.12)] transition-shadow' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[13px] font-bold ${item.link ? 'text-blue' : 'text-t1'}`}>{item.no}</span>
                      {isDelay && <Pill tone="red">遅延 {item.delay}</Pill>}
                    </div>
                    <div className="text-[12px] text-t1 mt-1 leading-snug">{item.name}</div>
                    <div className="text-[11px] text-t3 mt-0.5">{item.customer}</div>
                    {item.progress !== undefined && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <Bar
                          value={item.progress}
                          color={isDelay ? 'bg-red' : 'bg-blue'}
                          className="h-1.5 flex-1"
                        />
                        <span className="text-[11px] font-bold text-t2 tabular-nums shrink-0">{item.progress}%</span>
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-t2">
                      <CalendarDays size={12} className="text-t3" />
                      納期 {item.due}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
