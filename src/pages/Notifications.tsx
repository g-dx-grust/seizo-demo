import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Card, CardTitle, Pill, Toggle } from '../components/ui';
import { notificationsToday, notificationsYesterday, notifyRuleDefs } from '../data/mock';
import type { NotificationItem, Tone } from '../data/mock';
import { useDemo, useK1088Live } from '../state/DemoContext';

const dotTone: Record<Tone, string> = {
  red: 'bg-red',
  amber: 'bg-amber',
  blue: 'bg-blue',
  green: 'bg-green',
  purple: 'bg-purple',
  gray: 'bg-t3',
};

function NotificationRow({ item }: { item: NotificationItem }) {
  const nav = useNavigate();
  const { showToast, imported } = useDemo();
  const { approved } = useK1088Live();
  const c00Linked = item.isC00 && imported['production_c00'];
  const isDone = !!item.done || (item.isPo2660 && approved) || c00Linked;
  const doneLabel = c00Linked ? '連携済み' : '承認済み';

  return (
    <div className="flex items-start gap-3.5 py-3.5 border-t border-line first:border-t-0 first:pt-0">
      <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${dotTone[item.tone]}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Pill tone={isDone ? 'gray' : item.tone}>{item.cat}</Pill>
          <span className={`text-[13px] font-medium truncate ${isDone ? 'text-t3' : 'text-t1'}`}>{item.title}</span>
        </div>
        <div className="text-[11px] text-t2 mt-1">{item.desc}</div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <span className="text-[11px] text-t3 tabular-nums">{item.time}</span>
        {isDone ? (
          <span className="text-[11px] text-t3 font-medium w-[104px] text-right">{doneLabel}</span>
        ) : item.to ? (
          <button
            onClick={() => nav(item.to!)}
            className="text-[11px] text-blue font-medium flex items-center gap-0.5 w-[104px] justify-end hover:underline"
          >
            {item.action}
            <ChevronRight size={12} />
          </button>
        ) : item.toastAction ? (
          <button
            onClick={() => showToast(item.toastAction!)}
            className="text-[11px] text-blue font-medium flex items-center gap-0.5 w-[104px] justify-end hover:underline"
          >
            {item.action}
            <ChevronRight size={12} />
          </button>
        ) : (
          <span className="w-[104px]" />
        )}
      </div>
    </div>
  );
}

export default function Notifications() {
  const { rules, toggleRule } = useDemo();

  return (
    <div className="grid grid-cols-3 gap-6 items-start">
      <div className="col-span-2 flex flex-col gap-6">
        <Card>
          <CardTitle right={<Pill tone="red">未対応 3件</Pill>}>今日</CardTitle>
          <div>
            {notificationsToday.map((n) => (
              <NotificationRow key={n.id} item={n} />
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>昨日</CardTitle>
          <div>
            {notificationsYesterday.map((n) => (
              <NotificationRow key={n.id} item={n} />
            ))}
          </div>
        </Card>
      </div>

      {/* 通知ルール */}
      <Card>
        <CardTitle right={<Pill tone="gray">Larkへ配信</Pill>}>通知ルール</CardTitle>
        <div className="flex flex-col">
          {notifyRuleDefs.map((r) => (
            <div key={r.key} className="flex items-center justify-between py-3.5 border-t border-line first:border-t-0 first:pt-0">
              <div>
                <div className="text-[13px] font-medium text-t1">{r.label}</div>
                <div className="text-[11px] text-t3 mt-0.5">{r.desc}</div>
              </div>
              <Toggle on={rules[r.key]} onClick={() => toggleRule(r.key)} />
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-line text-[10px] text-t3 leading-relaxed">
          通知はLarkの個人チャット／グループへ自動配信されます。ルールはノーコードで追加できます。
        </div>
      </Card>
    </div>
  );
}
