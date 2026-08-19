import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Database,
  Download,
  FileSpreadsheet,
  FileUp,
  UploadCloud,
  X,
} from 'lucide-react';
import { Card, CardTitle, KpiCard, Pill } from '../components/ui';
import { dataQualityChecks, dataSources, importHistoryBase, importRules } from '../data/mock';
import type { DataSource, Tone } from '../data/mock';
import { useDemo } from '../state/DemoContext';

const statusTone: Record<string, Tone> = { 正常: 'green', 未連携: 'red', 稼働中: 'green' };
const screenRoutes: Record<string, string> = {
  案件別採算: '/profit',
  経営サマリー: '/dashboard',
  金型工程管理: '/molds',
  案件採算詳細: '/profit/k-1088',
  '生産計画・実績': '/production',
  '品質・不良分析': '/quality',
  設備モニタリング: '/machines',
  '顧客別売上・利益': '/customers',
};

// CSVテンプレートを実ファイルとしてダウンロード（クライアント生成・オフライン動作）
function downloadTemplate(src: DataSource) {
  const rows = [src.columns!.join(','), ...(src.sampleRows ?? []).slice(0, 2).map((r) => r.join(','))];
  const blob = new Blob(['﻿' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${src.name}_取込テンプレート.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ============ 取込ウィザード（4ステップのシミュレーション） ============
function ImportWizard({ source, onClose }: { source: DataSource; onClose: () => void }) {
  const nav = useNavigate();
  const { markImported, showToast } = useDemo();
  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState<string | null>(null);
  const [realFile, setRealFile] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const v = source.validation!;

  // Step3: 検証プログレスの演出
  useEffect(() => {
    if (step !== 3) return;
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          return 100;
        }
        return Math.min(100, p + 6);
      });
    }, 30);
    return () => clearInterval(id);
  }, [step]);

  const complete = () => {
    markImported(source.key);
    showToast(`${source.name}のCSVを取り込みました。各画面に反映されています`);
    setStep(4);
  };

  const steps = ['ファイル選択', 'プレビュー・列マッピング', '検証', '完了'];

  return (
    <div className="fixed inset-0 z-50 bg-navy/50 flex items-center justify-center p-6" onClick={onClose}>
      <div
        className="w-[760px] max-h-[88vh] overflow-y-auto bg-surface rounded-[14px] shadow-[0_24px_60px_rgba(15,23,42,0.35)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダ */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[15px] font-bold text-t1">CSV取込 — {source.name}</div>
            <div className="text-[11px] text-t3 mt-0.5">{source.origin}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-[8px] hover:bg-bg flex items-center justify-center text-t3">
            <X size={16} />
          </button>
        </div>

        {/* ステップインジケータ */}
        <div className="flex items-center gap-2 mt-4 mb-5">
          {steps.map((label, i) => {
            const n = i + 1;
            const state = n < step ? 'done' : n === step ? 'active' : 'todo';
            return (
              <div key={label} className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${
                    state === 'done'
                      ? 'bg-green text-white'
                      : state === 'active'
                        ? 'bg-blue text-white'
                        : 'bg-track text-t3'
                  }`}
                >
                  {state === 'done' ? '✓' : n}
                </span>
                <span className={`text-[12px] font-medium ${state === 'active' ? 'text-t1' : 'text-t3'}`}>{label}</span>
                {n < steps.length && <span className="w-6 h-px bg-line" />}
              </div>
            );
          })}
        </div>

        {/* Step1: ファイル選択 */}
        {step === 1 && (
          <div>
            <div className="border-2 border-dashed border-line rounded-[14px] bg-bg p-8 flex flex-col items-center">
              <span className="w-12 h-12 rounded-[14px] bg-blue-l text-blue flex items-center justify-center">
                <UploadCloud size={22} />
              </span>
              <div className="mt-3 text-[13px] font-bold text-t1">ここにCSVファイルをドロップ</div>
              <div className="mt-1 text-[11px] text-t3">または</div>
              <div className="mt-3 flex items-center gap-2.5">
                <button
                  onClick={() => fileInput.current?.click()}
                  className="h-9 px-4 rounded-[10px] border border-line bg-surface text-[12px] font-medium text-t2 hover:bg-bg"
                >
                  ファイルを選択
                </button>
                <button
                  onClick={() => {
                    setFileName(source.fileName!);
                    setRealFile(false);
                  }}
                  className="h-9 px-4 rounded-[10px] bg-blue text-white text-[12px] font-medium hover:opacity-90 flex items-center gap-1.5"
                >
                  <FileSpreadsheet size={14} />
                  デモ用サンプルCSVを使う
                </button>
                <input
                  ref={fileInput}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setFileName(f.name);
                      setRealFile(true);
                    }
                  }}
                />
              </div>
            </div>

            {fileName && (
              <div className="mt-4 flex items-center gap-3 bg-green-l rounded-[10px] p-3">
                <FileUp size={16} className="text-green shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-t1 truncate">{fileName}</div>
                  <div className="text-[10px] text-t2">
                    {realFile
                      ? '※デモ環境のため、実ファイルの内容に関わらずサンプルデータでプレビューします'
                      : `${source.validation!.total}行・UTF-8（自動判定）`}
                  </div>
                </div>
                <CheckCircle2 size={16} className="text-green shrink-0" />
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2.5">
              <button onClick={onClose} className="h-10 px-4 rounded-[10px] border border-line text-[12px] font-medium text-t2">
                キャンセル
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!fileName}
                className={`h-10 px-5 rounded-[10px] text-[13px] font-bold text-white ${
                  fileName ? 'bg-blue hover:opacity-90' : 'bg-plan cursor-not-allowed'
                }`}
              >
                次へ（プレビュー）
              </button>
            </div>
          </div>
        )}

        {/* Step2: プレビュー・列マッピング */}
        {step === 2 && (
          <div>
            <div className="rounded-[12px] border border-line overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="h-9 bg-thead text-[10px] text-t3">
                    {source.columns!.map((c) => (
                      <th key={c} className="text-left font-medium px-3 whitespace-nowrap">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {source.sampleRows!.map((row, i) => (
                    <tr key={i} className="h-9 border-t border-line text-[11px] text-t1">
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 whitespace-nowrap tabular-nums">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-[10px] text-t3">先頭5行を表示（全{v.total}行）</div>

            <div className="mt-4 rounded-[12px] bg-green-l/70 border border-green/30 p-3.5 flex items-start gap-2.5">
              <CheckCircle2 size={15} className="text-green mt-px shrink-0" />
              <div className="text-[12px] text-t1">
                <span className="font-bold">列マッピング：自動判定OK</span>
                <span className="text-t2">
                  （{source.columns!.length}列すべてを取込先項目に紐付けました。前回の取込設定を再利用）
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-between">
              <button onClick={() => setStep(1)} className="h-10 px-4 rounded-[10px] border border-line text-[12px] font-medium text-t2">
                戻る
              </button>
              <button onClick={() => setStep(3)} className="h-10 px-5 rounded-[10px] bg-blue text-white text-[13px] font-bold hover:opacity-90">
                検証する
              </button>
            </div>
          </div>
        )}

        {/* Step3: 検証 */}
        {step === 3 && (
          <div>
            {progress < 100 ? (
              <div className="py-8 flex flex-col items-center">
                <div className="text-[13px] font-bold text-t1">データを検証しています…</div>
                <div className="mt-4 w-[380px] h-2 rounded-full bg-track overflow-hidden">
                  <div className="h-full rounded-full bg-blue transition-all duration-100" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-2 text-[11px] text-t3 tabular-nums">
                  {Math.floor((v.total * progress) / 100)} / {v.total} 行
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="rounded-[10px] bg-bg p-3 text-center">
                    <div className="text-[10px] text-t3">対象</div>
                    <div className="text-[19px] font-black text-t1 tabular-nums">{v.total}行</div>
                  </div>
                  <div className="rounded-[10px] bg-green-l p-3 text-center">
                    <div className="text-[10px] text-green">取込可</div>
                    <div className="text-[19px] font-black text-green tabular-nums">{v.ok}行</div>
                  </div>
                  <div className="rounded-[10px] bg-amber-l p-3 text-center">
                    <div className="text-[10px] text-amber">警告</div>
                    <div className="text-[19px] font-black text-amber tabular-nums">{v.warns.length}行</div>
                  </div>
                  <div className="rounded-[10px] bg-bg p-3 text-center">
                    <div className="text-[10px] text-t3">エラー</div>
                    <div className="text-[19px] font-black text-t1 tabular-nums">0行</div>
                  </div>
                </div>

                {v.warns.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2">
                    {v.warns.map((w) => (
                      <div key={w.row} className="flex items-start gap-2.5 rounded-[10px] border border-amber/40 bg-amber-l/60 p-3">
                        <AlertTriangle size={14} className="text-amber mt-px shrink-0" />
                        <div className="text-[12px] text-t1">
                          <span className="font-bold text-amber">{w.row}行目：</span>
                          {w.msg}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex justify-between">
                  <button onClick={() => setStep(2)} className="h-10 px-4 rounded-[10px] border border-line text-[12px] font-medium text-t2">
                    戻る
                  </button>
                  <button onClick={complete} className="h-10 px-5 rounded-[10px] bg-blue text-white text-[13px] font-bold hover:opacity-90">
                    {v.ok}行を取り込む
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step4: 完了 */}
        {step === 4 && (
          <div className="py-4 flex flex-col items-center">
            <span className="w-14 h-14 rounded-full bg-green-l text-green flex items-center justify-center">
              <CheckCircle2 size={28} />
            </span>
            <div className="mt-3 text-[16px] font-black text-t1">取込が完了しました</div>
            <div className="mt-1 text-[12px] text-t2">
              {source.name}：{v.ok}行を取り込みました（警告{v.warns.length}行はスキップせず補完）
            </div>
            <div className="mt-5 w-full rounded-[12px] bg-bg p-4">
              <div className="text-[11px] font-bold text-t3 mb-2.5">反映された画面</div>
              <div className="flex flex-wrap gap-2">
                {source.screens.map((s) => (
                  <button
                    key={s}
                    onClick={() => nav(screenRoutes[s] ?? '/dashboard')}
                    className="h-8 px-3 rounded-full bg-surface border border-line text-[12px] font-medium text-blue hover:bg-blue-l flex items-center gap-1"
                  >
                    {s}
                    <ArrowRight size={12} />
                  </button>
                ))}
              </div>
            </div>
            <button onClick={onClose} className="mt-5 h-10 px-6 rounded-[10px] border border-line text-[13px] font-bold text-t2 hover:bg-bg">
              閉じる
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ 画面本体 ============
export default function DataImport() {
  const { imported } = useDemo();
  const [wizardSource, setWizardSource] = useState<DataSource | null>(null);
  const csvSources = dataSources.filter((s) => s.method === 'csv');
  const [formatKey, setFormatKey] = useState(csvSources[0].key);
  const formatSrc = csvSources.find((s) => s.key === formatKey)!;

  const c00 = dataSources.find((s) => s.key === 'production_c00')!;
  const c00Linked = !!imported['production_c00'];
  const importedCount = Object.values(imported).filter(Boolean).length;

  // 取込済みソースは表示を派生させる
  const rows = dataSources.map((s) => {
    if (imported[s.key]) {
      return {
        ...s,
        lastImport: 'たった今',
        status: '正常' as const,
        count: s.key === 'production_c00' ? `${s.validation!.ok}行（8/16分）` : s.count,
      };
    }
    return s;
  });

  const history = [
    ...dataSources
      .filter((s) => imported[s.key])
      .map((s) => ({
        time: 'たった今',
        source: s.name,
        file: s.fileName ?? '-',
        count: `${s.validation!.ok}件`,
        result: s.validation!.warns.length > 0 ? `警告${s.validation!.warns.length}件` : '成功',
        tone: (s.validation!.warns.length > 0 ? 'amber' : 'green') as Tone,
        by: '田中 一郎',
      })),
    ...importHistoryBase,
  ];

  return (
    <>
      {/* 未連携アラートバナー */}
      {!c00Linked && (
        <Card className="border-red/40 bg-red-l/60">
          <div className="flex items-center gap-3.5">
            <span className="w-9 h-9 rounded-[10px] bg-red text-white flex items-center justify-center shrink-0">
              <AlertTriangle size={16} />
            </span>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-t1">製造実績（生産C00）が未連携です</div>
              <div className="text-[11px] text-t2 mt-0.5">
                昨日23:00の自動バッチが失敗しました（接続タイムアウト）。C00の実績処理からCSV出力すれば手動で再連携できます。
              </div>
            </div>
            <button
              onClick={() => setWizardSource(c00)}
              className="h-9 px-4 rounded-[10px] bg-red text-white text-[12px] font-bold hover:opacity-90 shrink-0"
            >
              今すぐCSVで再連携
            </button>
          </div>
        </Card>
      )}

      {/* KPI */}
      <div className="grid grid-cols-4 gap-6">
        <KpiCard label="連携データソース" value="10種" sub="生産C00系5 ／ JupiterX1 ／ Excel帳票3 ／ バーコード1" subTone="gray" />
        <KpiCard
          label="今日の取込"
          value={`${4 + importedCount}回`}
          sub={importedCount > 0 ? '最終 たった今' : '最終 今日 10:05'}
          subTone="gray"
        />
        {c00Linked ? (
          <KpiCard label="未連携" value="0件" valueClass="text-green" sub="すべて連携済み" subTone="green" />
        ) : (
          <KpiCard label="未連携" value="1件" valueClass="text-red" sub="製造実績（生産C00）" subTone="red" />
        )}
        <KpiCard label="バーコード読取率（今月）" value="96.2%" sub="実績データの自動化率" subTone="gray" />
      </div>

      <div className="grid grid-cols-3 gap-6 items-start">
        {/* データソース一覧 */}
        <Card className="col-span-2 p-0 overflow-hidden">
          <CardTitle className="px-5 pt-5 mb-3" right={<Pill tone="gray" className="mr-0">最終確認 今日 14:40</Pill>}>
            データソース一覧
          </CardTitle>
          <table className="w-full">
            <thead>
              <tr className="h-[42px] bg-thead text-[11px] text-t3">
                <th className="text-left font-medium pl-5">データソース</th>
                <th className="text-left font-medium">方式</th>
                <th className="text-left font-medium">最終取込</th>
                <th className="text-left font-medium">件数</th>
                <th className="text-left font-medium">状態</th>
                <th className="text-left font-medium w-[110px]">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.key} className={`border-t border-line text-[13px] ${s.status === '未連携' ? 'bg-red-l/40' : ''}`}>
                  <td className="pl-5 py-3">
                    <div className="font-bold text-t1">{s.name}</div>
                    <div className="text-[10px] text-t3 mt-0.5">{s.origin}</div>
                  </td>
                  <td>
                    <Pill tone={s.method === 'csv' ? 'blue' : 'green'}>{s.method === 'csv' ? 'CSV手動' : '自動'}</Pill>
                    <div className="text-[10px] text-t3 mt-1">{s.methodLabel}</div>
                  </td>
                  <td className="text-[12px] text-t2 whitespace-nowrap">{s.lastImport}</td>
                  <td className="text-[12px] text-t1 tabular-nums whitespace-nowrap">{s.count}</td>
                  <td>
                    <Pill tone={statusTone[s.status]}>
                      {s.status === '未連携' && (
                        <span className="relative flex w-1.5 h-1.5 mr-0.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-70" />
                          <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-red" />
                        </span>
                      )}
                      {s.status}
                    </Pill>
                  </td>
                  <td>
                    {s.method === 'csv' &&
                      (imported[s.key] ? (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-green">
                          <CheckCircle2 size={13} />
                          取込済み
                        </span>
                      ) : (
                        <button
                          onClick={() => setWizardSource(s)}
                          className={`h-8 px-3 rounded-[8px] text-[11px] font-bold flex items-center gap-1 ${
                            s.status === '未連携'
                              ? 'bg-red text-white hover:opacity-90'
                              : 'border border-line text-t2 hover:bg-bg'
                          }`}
                        >
                          <UploadCloud size={12} />
                          {s.status === '未連携' ? '再連携' : 'CSV取込'}
                        </button>
                      ))}
                    {s.method === 'auto' && <span className="text-[10px] text-t3">自動連携中</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* 右カラム */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardTitle>CSVフォーマット定義</CardTitle>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {csvSources.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setFormatKey(s.key)}
                  className={`h-7 px-2.5 rounded-full text-[11px] font-medium ${
                    formatKey === s.key ? 'bg-blue text-white' : 'bg-track text-t2 hover:bg-line'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <div className="text-[11px] font-bold text-t3 mb-2">必須列（{formatSrc.columns!.length}列）</div>
            <div className="flex flex-wrap gap-1.5">
              {formatSrc.columns!.map((c, i) => (
                <span key={c} className="inline-flex items-center gap-1 rounded-[6px] bg-bg border border-line px-2 py-1 text-[11px] text-t1">
                  <span className="text-[9px] font-bold text-t3">{i + 1}</span>
                  {c}
                </span>
              ))}
            </div>
            <div className="text-[11px] font-bold text-t3 mt-4 mb-2">反映先の画面</div>
            <div className="flex flex-wrap gap-1.5">
              {formatSrc.screens.map((s) => (
                <Pill key={s} tone="blue">{s}</Pill>
              ))}
            </div>
            <button
              onClick={() => downloadTemplate(formatSrc)}
              className="mt-4 w-full h-9 rounded-[10px] border border-line text-[12px] font-medium text-t2 hover:bg-bg flex items-center justify-center gap-1.5"
            >
              <Download size={13} />
              テンプレートをダウンロード
            </button>
          </Card>

          <Card>
            <CardTitle right={c00Linked ? <Pill tone="green">正常</Pill> : <Pill tone="amber">要確認 3件</Pill>}>
              データ品質チェック（今日）
            </CardTitle>
            <div className="flex flex-col gap-3">
              {dataQualityChecks.map((c) => {
                const resolved = c.c00 && c00Linked;
                const tone = resolved ? 'green' : c.tone;
                return (
                  <div key={c.name} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[12px] font-bold text-t1">{c.name}</div>
                      <div className="text-[10px] text-t3 mt-0.5 leading-relaxed">
                        {resolved ? '手動CSV連携で解消（たった今）' : c.desc}
                      </div>
                    </div>
                    <Pill tone={tone} className="shrink-0 mt-0.5">
                      {resolved ? '解消済み' : c.result}
                    </Pill>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-line text-[10px] text-t3 leading-relaxed">
              欠損・重複・突合・更新遅れを毎回自動チェックし、「数字を説明する時間」を削減します。
            </div>
          </Card>

          <Card>
            <CardTitle right={<Database size={14} className="text-t3" />}>取込ルール</CardTitle>
            <div className="flex flex-col gap-2.5">
              {importRules.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-[12px] text-t2 leading-relaxed">
                  <ChevronRight size={13} className="text-blue mt-0.5 shrink-0" />
                  {r}
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-line text-[10px] text-t3 leading-relaxed">
              JupiterX・生産C00は改修せず、CSV出力（今ある出口）から取得します。データ調査後にDB・API接続へ最適化することも可能です。
            </div>
          </Card>
        </div>
      </div>

      {/* 取込履歴 */}
      <Card className="p-0 overflow-hidden">
        <CardTitle className="px-5 pt-5 mb-3">取込履歴</CardTitle>
        <table className="w-full">
          <thead>
            <tr className="h-[42px] bg-thead text-[11px] text-t3">
              <th className="text-left font-medium pl-5">日時</th>
              <th className="text-left font-medium">データソース</th>
              <th className="text-left font-medium">ファイル</th>
              <th className="text-right font-medium pr-7">件数</th>
              <th className="text-left font-medium">結果</th>
              <th className="text-left font-medium">実行者</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i} className="h-12 border-t border-line text-[13px]">
                <td className="pl-5 text-t2 text-[12px] whitespace-nowrap">{h.time}</td>
                <td className="font-medium text-t1">{h.source}</td>
                <td className="text-t2 text-[12px]">{h.file}</td>
                <td className="text-right pr-7 tabular-nums text-t1">{h.count}</td>
                <td>
                  <Pill tone={h.tone}>{h.result}</Pill>
                </td>
                <td className="text-t2 text-[12px]">{h.by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {wizardSource && <ImportWizard source={wizardSource} onClose={() => setWizardSource(null)} />}
    </>
  );
}
