import { useNavigate } from 'react-router-dom';
import { CalendarRange, ChevronRight, QrCode } from 'lucide-react';
import { Bar, Card, CardTitle, Pill } from '../components/ui';
import { K1088, fmt, k1088CostItems, k1088Members, k1088POs, k1088Processes } from '../data/mock';
import { useK1088Live } from '../state/DemoContext';
import type { Tone } from '../data/mock';

const poStatusTone: Record<string, Tone> = {
  入荷済: 'green',
  加工中: 'amber',
  承認待ち: 'gray',
  発注済: 'blue',
};

export default function ProfitDetail() {
  const nav = useNavigate();
  const live = useK1088Live();

  const costItems = k1088CostItems.map((c) =>
    live.approved && c.actApproved ? { ...c, act: c.actApproved } : c,
  );
  const estRatio = ((live.variance / K1088.estimateCost) * 100).toFixed(1);

  return (
    <>
      {/* 案件ヘッダ */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[21px] font-black text-t1">{K1088.no}</span>
              <Pill tone="purple">{K1088.category}</Pill>
              <Pill tone="red">遅延 +{K1088.delayDays}日</Pill>
              {live.approved && <Pill tone="blue">PO-2660 発注済</Pill>}
            </div>
            <div className="text-[14px] font-bold text-t1 mt-1.5">{K1088.name}</div>
            <div className="text-[12px] text-t2 mt-2 flex items-center gap-4">
              <span>顧客：{K1088.customer}</span>
              <span>金型コード：{K1088.moldCode}</span>
              <span>受注日：{K1088.orderDate}</span>
              <span>
                納期：<span className="font-bold text-t1">{K1088.dueDate}</span>
              </span>
              <span>担当：{K1088.owner}</span>
            </div>
          </div>
          <button
            onClick={() => nav('/molds/k-1088')}
            className="h-9 px-4 rounded-[10px] bg-blue text-white text-[12px] font-medium flex items-center gap-1.5 hover:opacity-90"
          >
            <CalendarRange size={14} />
            ガントを見る
          </button>
        </div>
      </Card>

      {/* KPI */}
      <div className="grid grid-cols-6 gap-6">
        <Card>
          <div className="text-[11px] font-medium text-t3">受注金額</div>
          <div className="mt-1.5 text-[21px] font-black text-t1">{fmt(K1088.orderAmount)}千円</div>
          <div className="mt-1 text-[11px] text-t3">受注日 {K1088.orderDate}</div>
        </Card>
        <Card>
          <div className="text-[11px] font-medium text-t3">見積原価</div>
          <div className="mt-1.5 text-[21px] font-black text-t1">{fmt(K1088.estimateCost)}千円</div>
          <div className="mt-1 text-[11px] text-t3">見積時利益率 {K1088.rateEstimate.toFixed(1)}%</div>
        </Card>
        <Card>
          <div className="text-[11px] font-medium text-t3">実際原価（見込）</div>
          <div className="mt-1.5 text-[21px] font-black text-t1">{fmt(live.actualCost)}千円</div>
          <div className="mt-1 text-[11px] font-medium text-amber">うち設変 +{fmt(K1088.changeCost)}</div>
        </Card>
        <Card>
          <div className="text-[11px] font-medium text-t3">見積差異</div>
          <div className="mt-1.5 text-[21px] font-black text-red">+{fmt(live.variance)}千円</div>
          <div className="mt-1 text-[11px] font-medium text-red">見積比 +{estRatio}%</div>
        </Card>
        <Card>
          <div className="text-[11px] font-medium text-t3">粗利益（現時点）</div>
          <div className="mt-1.5 text-[21px] font-black text-amber">{fmt(K1088.orderAmount - live.actualCost)}千円</div>
          <div className="mt-1 text-[11px] text-t3">見積時 {fmt(K1088.orderAmount - K1088.estimateCost)}千円</div>
        </Card>
        <Card>
          <div className="text-[11px] font-medium text-t3">利益率（現時点）</div>
          <div className="mt-1.5 text-[21px] font-black text-amber">{live.profitRate.toFixed(1)}%</div>
          <div className="mt-1 text-[11px] text-t3">
            見積時 {K1088.rateEstimate.toFixed(1)}% → <span className="text-amber font-medium">悪化</span>
          </div>
        </Card>
      </div>

      {/* 費目別 ＋ 工数サマリー */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-0 overflow-hidden">
          <CardTitle className="px-5 pt-5 mb-3">費目別 原価内訳（千円）</CardTitle>
          <table className="w-full">
            <thead>
              <tr className="h-[42px] bg-thead text-[11px] text-t3">
                <th className="text-left font-medium pl-5">費目</th>
                <th className="text-right font-medium pr-7">見積</th>
                <th className="text-right font-medium pr-7">実際（見込）</th>
                <th className="text-right font-medium pr-7">差異</th>
                <th className="text-left font-medium">備考</th>
              </tr>
            </thead>
            <tbody>
              {costItems.map((c) => {
                const diff = c.act - c.est;
                return (
                  <tr key={c.name} className={`h-12 border-t border-line text-[13px] ${c.alert ? 'bg-red-l/40' : ''}`}>
                    <td className="pl-5 font-medium text-t1">{c.name}</td>
                    <td className="text-right pr-7 tabular-nums text-t2">{fmt(c.est)}</td>
                    <td className="text-right pr-7 tabular-nums text-t1">{fmt(c.act)}</td>
                    <td className={`text-right pr-7 tabular-nums font-bold ${diff > 0 ? 'text-red' : 'text-green'}`}>
                      {diff > 0 ? '+' : ''}
                      {fmt(diff)}
                    </td>
                    <td>
                      {c.alert ? (
                        <Pill tone="red">設変 +{fmt(K1088.changeCost)}</Pill>
                      ) : (
                        <span className="text-[11px] text-t3">{c.note}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr className="h-12 border-t border-line text-[13px] bg-thead font-bold">
                <td className="pl-5 text-t1">合計</td>
                <td className="text-right pr-7 tabular-nums text-t2">{fmt(K1088.estimateCost)}</td>
                <td className="text-right pr-7 tabular-nums text-t1">{fmt(live.actualCost)}</td>
                <td className="text-right pr-7 tabular-nums text-red">+{fmt(live.variance)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </Card>

        <Card>
          <CardTitle>投入工数サマリー</CardTitle>
          <div className="text-[26px] font-black text-t1 leading-none">
            {K1088.hoursTotal}
            <span className="text-[14px] font-bold text-t2 ml-1">h</span>
          </div>
          <div className="mt-3 flex flex-col gap-2.5 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="text-t2">見積工数</span>
              <span className="font-bold text-t1 tabular-nums">{K1088.hoursEstimate}h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-t2">設変対応</span>
              <span className="font-bold text-red tabular-nums">+{K1088.hoursExtra}h</span>
            </div>
            <Bar value={(K1088.hoursEstimate / K1088.hoursTotal) * 100} color="bg-blue" className="h-2 mt-1" />
          </div>
          <div className="mt-4 pt-3 border-t border-line flex items-start gap-2 text-[11px] text-t2">
            <QrCode size={14} className="text-t3 mt-px shrink-0" />
            <span>
              工数データ元：<span className="font-medium text-t1">{K1088.dataSourceNote}</span>
            </span>
          </div>
        </Card>
      </div>

      {/* 工程別 ＋ 担当者別 */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardTitle right={<Pill tone="gray">計 {K1088.hoursTotal}h</Pill>}>工程別工数</CardTitle>
          <div className="flex flex-col gap-4">
            {k1088Processes.map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-t1">{p.name}</span>
                    <Pill tone={p.status === '完了' ? 'green' : p.status === '進行中' ? 'blue' : 'gray'}>
                      {p.status}
                      {p.status === '進行中' ? ` ${p.progress}%` : ''}
                    </Pill>
                  </div>
                  <span className="text-[12px] font-bold text-t1 tabular-nums">{p.hours}h</span>
                </div>
                <Bar
                  value={p.progress}
                  color={p.status === '完了' ? 'bg-green' : 'bg-blue'}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <CardTitle className="px-5 pt-5 mb-3">担当者別工数</CardTitle>
          <table className="w-full">
            <thead>
              <tr className="h-[42px] bg-thead text-[11px] text-t3">
                <th className="text-left font-medium pl-5">担当者</th>
                <th className="text-left font-medium">所属</th>
                <th className="text-right font-medium pr-7">工数</th>
                <th className="text-left font-medium">期間</th>
              </tr>
            </thead>
            <tbody>
              {k1088Members.map((m) => (
                <tr key={m.name} className="h-12 border-t border-line text-[13px]">
                  <td className="pl-5">
                    <span className="font-medium text-t1">{m.name}</span>
                    {m.role === '主担当' && <Pill tone="blue" className="ml-2">主担当</Pill>}
                    {m.role && m.role !== '主担当' && (
                      <span className="ml-2 text-[11px] text-t3">{m.role}</span>
                    )}
                  </td>
                  <td className="text-t2">{m.dept}</td>
                  <td className="text-right pr-7 tabular-nums font-bold text-t1">{m.hours}h</td>
                  <td className="text-[12px] text-t2">{m.period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* 発注一覧 */}
      <Card className="p-0 overflow-hidden">
        <CardTitle className="px-5 pt-5 mb-3" right={<span className="text-[11px] text-t3 pr-5">単位：千円</span>}>
          発注一覧
        </CardTitle>
        <table className="w-full">
          <thead>
            <tr className="h-[42px] bg-thead text-[11px] text-t3">
              <th className="text-left font-medium pl-5">発注No</th>
              <th className="text-left font-medium">仕入先</th>
              <th className="text-left font-medium">品目</th>
              <th className="text-right font-medium pr-7">金額</th>
              <th className="text-left font-medium">状態</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {k1088POs.map((po) => {
              const status = po.pending ? live.poStatus : po.status;
              return (
                <tr
                  key={po.no}
                  onClick={po.pending && !live.approved ? () => nav('/m/approvals/po-2660') : undefined}
                  className={`h-12 border-t border-line text-[13px] ${
                    po.pending && !live.approved ? 'cursor-pointer hover:bg-blue-l/40' : ''
                  }`}
                >
                  <td className="pl-5 font-bold text-t1">{po.no}</td>
                  <td className="text-t1">{po.vendor}</td>
                  <td className="text-t2">
                    {po.item}
                    {po.alert && <Pill tone="red" className="ml-2">設変</Pill>}
                  </td>
                  <td className="text-right pr-7 tabular-nums text-t1">{fmt(po.amount)}</td>
                  <td>
                    <Pill tone={poStatusTone[status] ?? 'gray'}>{status}</Pill>
                    {po.pending && !live.approved && (
                      <span className="ml-2 text-[11px] text-blue font-medium">承認画面へ</span>
                    )}
                  </td>
                  <td className="text-center">
                    {po.pending && !live.approved && <ChevronRight size={15} className="text-t3 inline" />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}
