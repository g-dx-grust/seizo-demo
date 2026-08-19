import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Pill } from '../../components/ui';
import { DEMO_DATE_LABEL, notificationsToday } from '../../data/mock';
import type { Tone } from '../../data/mock';
import { useK1088Live } from '../../state/DemoContext';

const dotTone: Record<Tone, string> = {
  red: 'bg-red',
  amber: 'bg-amber',
  blue: 'bg-blue',
  green: 'bg-green',
  purple: 'bg-purple',
  gray: 'bg-t3',
};

export default function MHome() {
  const nav = useNavigate();
  const { pendingCount } = useK1088Live();
  const latest = notificationsToday.slice(0, 3);

  const kpis = [
    { label: '生産達成率（今週）', value: '96.4%', tone: 'text-t1', to: '/production' },
    { label: '設備稼働', value: '7/12台', tone: 'text-t1', to: '/machines' },
    { label: '承認待ち', value: `${pendingCount}件`, tone: 'text-blue', to: '/m/approvals' },
    { label: '今月粗利率', value: '24.1%', tone: 'text-green', to: '/profit' },
  ];

  return (
    <div className="p-4 flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-black text-t1">こんにちは、田中さん</h1>
        <p className="text-[12px] text-t3 mt-0.5">{DEMO_DATE_LABEL}・工場コックピット</p>
      </div>

      {/* 緊急アラートバナー */}
      <button
        onClick={() => nav('/machines')}
        className="w-full rounded-[14px] bg-red text-white p-4 flex items-center gap-3 text-left active:opacity-90"
      >
        <span className="w-9 h-9 rounded-[10px] bg-white/20 flex items-center justify-center shrink-0">
          <AlertTriangle size={17} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[13px] font-bold">600t#2 が停止中（金型異常）</span>
          <span className="block text-[11px] opacity-80 mt-0.5">14:32〜 ／ タップで設備モニタリングへ</span>
        </span>
        <ChevronRight size={17} className="opacity-80 shrink-0" />
      </button>

      {/* KPI 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((k) => (
          <button
            key={k.label}
            onClick={() => nav(k.to)}
            className="bg-surface rounded-[14px] border border-line shadow-[0_2px_8px_rgba(15,23,42,0.05)] p-4 text-left active:bg-bg"
          >
            <div className="text-[10px] font-medium text-t3">{k.label}</div>
            <div className={`mt-1 text-[21px] font-black ${k.tone}`}>{k.value}</div>
          </button>
        ))}
      </div>

      {/* 最新の通知 */}
      <div className="bg-surface rounded-[14px] border border-line shadow-[0_2px_8px_rgba(15,23,42,0.05)] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-bold text-t1">最新の通知</span>
          <Pill tone="red">3件</Pill>
        </div>
        {latest.map((n) => (
          <button
            key={n.id}
            onClick={() => n.to && nav(n.to)}
            className="w-full flex items-start gap-3 py-3 border-t border-line text-left active:bg-bg"
          >
            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotTone[n.tone]}`} />
            <span className="flex-1 min-w-0">
              <span className="block text-[12px] font-medium text-t1 leading-snug">{n.title}</span>
              <span className="block text-[10px] text-t3 mt-0.5">
                {n.cat}・{n.time}
              </span>
            </span>
            <ChevronRight size={14} className="text-t3 mt-1 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
