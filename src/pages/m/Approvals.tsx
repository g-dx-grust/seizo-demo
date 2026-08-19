import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { Pill } from '../../components/ui';
import { approvalCards, approvalsDoneBase, fmt } from '../../data/mock';
import { useDemo, useK1088Live } from '../../state/DemoContext';

export default function MApprovals() {
  const nav = useNavigate();
  const { approve, showToast } = useDemo();
  const { approved, pendingCount } = useK1088Live();
  const [tab, setTab] = useState<'pending' | 'done'>('pending');

  // 承認済みなら PO-2660 を承認待ちから外し、対応済みの先頭に足す
  const pending = approvalCards.filter((a) => !(a.id === 'po-2660' && approved));
  const done = approved
    ? [{ type: '購買見積', title: 'SKD11追加材（板厚32）', amount: 158, date: 'たった今' }, ...approvalsDoneBase]
    : approvalsDoneBase;

  const handleApprove = (id: string) => {
    if (id === 'po-2660') approve();
    else showToast('デモでは PO-2660（SKD11追加材）のみ承認操作できます');
  };
  const handleReject = () => showToast('デモでは PO-2660 の承認操作のみ有効です');

  return (
    <div className="p-4 flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-black text-t1">承認</h1>
        <p className="text-[11px] text-t3 mt-0.5">タップで詳細を確認できます</p>
      </div>

      {/* タブ */}
      <div className="grid grid-cols-2 bg-track rounded-[12px] p-1">
        <button
          onClick={() => setTab('pending')}
          className={`h-9 rounded-[9px] text-[13px] font-bold flex items-center justify-center gap-1.5 ${
            tab === 'pending' ? 'bg-surface text-t1 shadow-sm' : 'text-t3'
          }`}
        >
          承認待ち
          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red text-white text-[10px] font-bold flex items-center justify-center">
            {pendingCount}
          </span>
        </button>
        <button
          onClick={() => setTab('done')}
          className={`h-9 rounded-[9px] text-[13px] font-bold ${
            tab === 'done' ? 'bg-surface text-t1 shadow-sm' : 'text-t3'
          }`}
        >
          対応済み
        </button>
      </div>

      {tab === 'pending' ? (
        <div className="flex flex-col gap-3">
          {pending.map((a) => (
            <div
              key={a.id}
              onClick={a.hasDetail ? () => nav('/m/approvals/po-2660') : undefined}
              className={`bg-surface rounded-[14px] border border-line shadow-[0_2px_8px_rgba(15,23,42,0.05)] p-4 ${
                a.hasDetail ? 'cursor-pointer active:bg-bg' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <Pill tone="blue">{a.type}</Pill>
                <span className="text-[17px] font-black text-t1 tabular-nums">
                  {fmt(a.amount)}
                  <span className="text-[11px] font-bold text-t3 ml-0.5">千円</span>
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-[14px] font-bold text-t1">{a.title}</span>
                {a.hasDetail && <ChevronRight size={14} className="text-t3" />}
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-t2 flex-wrap">
                <span>申請：{a.applicant}</span>
                <span className="text-line">|</span>
                <span>{a.project}</span>
                <span className="text-line">|</span>
                <Pill tone={a.deadlineTone}>期限 {a.deadline}</Pill>
              </div>
              <div className="mt-3.5 grid grid-cols-2 gap-2.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReject();
                  }}
                  className="h-10 rounded-[10px] border border-line text-[13px] font-bold text-t2 active:bg-bg"
                >
                  却下
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(a.id);
                  }}
                  className="h-10 rounded-[10px] bg-blue text-white text-[13px] font-bold active:opacity-80"
                >
                  承認する
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {done.map((d, i) => (
            <div key={i} className="bg-surface rounded-[14px] border border-line p-4">
              <div className="flex items-center justify-between">
                <Pill tone="gray">{d.type}</Pill>
                <span className="text-[15px] font-black text-t2 tabular-nums">
                  {fmt(d.amount)}
                  <span className="text-[11px] font-bold text-t3 ml-0.5">千円</span>
                </span>
              </div>
              <div className="text-[13px] font-bold text-t2 mt-2">{d.title}</div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] font-medium text-green">
                  <CheckCircle2 size={13} />
                  承認済み
                </span>
                <span className="text-[11px] text-t3">{d.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
