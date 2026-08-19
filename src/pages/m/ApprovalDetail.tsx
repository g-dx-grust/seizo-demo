import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, TrendingDown } from 'lucide-react';
import { Pill } from '../../components/ui';
import { K1088, fmt, po2660Detail } from '../../data/mock';
import { useDemo, useK1088Live } from '../../state/DemoContext';

export default function MApprovalDetail() {
  const nav = useNavigate();
  const { approve, showToast } = useDemo();
  const { approved } = useK1088Live();

  return (
    <div className="p-4 flex flex-col gap-4">
      <button onClick={() => nav('/m/approvals')} className="flex items-center gap-1 text-[13px] text-t2 font-medium self-start">
        <ArrowLeft size={16} />
        承認一覧
      </button>

      {/* ヒーロー */}
      <div className="bg-surface rounded-[14px] border border-line shadow-[0_2px_8px_rgba(15,23,42,0.05)] p-5">
        <div className="flex items-center gap-2">
          <Pill tone="blue">{po2660Detail.type}</Pill>
          <span className="text-[11px] text-t3 font-medium">{po2660Detail.no}</span>
          {approved && <Pill tone="green">承認済み</Pill>}
        </div>
        <div className="mt-2.5 text-[30px] font-black text-t1 tabular-nums leading-none">
          {fmt(po2660Detail.amount)}
          <span className="text-[14px] font-bold text-t2 ml-1">千円</span>
        </div>
        <div className="mt-4 flex flex-col">
          {po2660Detail.kv.map((row) => (
            <div key={row.k} className="flex items-start justify-between py-2.5 border-t border-line text-[13px]">
              <span className="text-t3 shrink-0">{row.k}</span>
              <span className="text-t1 font-medium text-right ml-4">{row.v}</span>
            </div>
          ))}
        </div>
        {/* 添付 */}
        <div className="mt-2 flex items-center gap-3 bg-bg rounded-[10px] p-3">
          <span className="w-9 h-9 rounded-[8px] bg-red-l text-red flex items-center justify-center shrink-0">
            <FileText size={16} />
          </span>
          <div className="min-w-0">
            <div className="text-[12px] font-medium text-t1 truncate">{po2660Detail.attachment.name}</div>
            <div className="text-[10px] text-t3">PDF・{po2660Detail.attachment.size}</div>
          </div>
        </div>
      </div>

      {/* 採算インパクト */}
      <div className="rounded-[14px] border border-amber/40 bg-amber-l p-4">
        <div className="flex items-center gap-1.5 text-[12px] font-bold text-amber">
          <TrendingDown size={14} />
          採算インパクト（{K1088.no}）
        </div>
        <div className="mt-2.5 flex items-center gap-2.5">
          <span className="text-[21px] font-black text-t1 tabular-nums">{K1088.rateNow.toFixed(1)}%</span>
          <ArrowRight size={16} className="text-t3" />
          <span className="text-[21px] font-black text-amber tabular-nums">{K1088.rateApproved.toFixed(1)}%</span>
          <Pill tone="amber">-1.3pt</Pill>
        </div>
        <div className="mt-2 text-[11px] text-t2 leading-relaxed">{po2660Detail.impactNote}</div>
      </div>

      {/* アクション */}
      {approved ? (
        <div className="rounded-[14px] border border-green/40 bg-green-l p-4 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-green shrink-0 mt-0.5" />
          <div>
            <div className="text-[14px] font-bold text-green">承認しました</div>
            <div className="text-[11px] text-t2 mt-1 leading-relaxed">
              Larkで申請者（佐藤 健）へ通知されました。PO-2660 は発注済に変わり、K-1088 の利益率は{' '}
              {K1088.rateApproved.toFixed(1)}% に更新されています。
            </div>
            <button onClick={() => nav('/m/approvals')} className="mt-3 text-[12px] font-bold text-blue">
              承認一覧へ戻る
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <button
            onClick={approve}
            className="h-12 rounded-[12px] bg-blue text-white text-[15px] font-bold active:opacity-80"
          >
            承認する
          </button>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => showToast('デモでは承認操作のみ有効です')}
              className="h-11 rounded-[12px] border border-line bg-surface text-[13px] font-bold text-t2 active:bg-bg"
            >
              却下する
            </button>
            <button
              onClick={() => showToast('デモでは承認操作のみ有効です')}
              className="h-11 rounded-[12px] border border-line bg-surface text-[12px] font-bold text-t2 active:bg-bg"
            >
              コメントを付けて差し戻す
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
