// 工場コックピット デモ用モックデータ
// すべての画面はこのファイルのデータのみを参照する（画面へのハードコード禁止）

export const DEMO_DATE = new Date('2026-08-17T14:45:00');
export const DEMO_DATE_LABEL = '8月17日(月)';

export type Tone = 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray';

// ============ K-1088 マスタ（全画面で整合させる中心データ） ============
export const K1088 = {
  no: 'K-1088',
  name: 'リアブラケット順送型',
  moldCode: 'DIE-1088',
  customer: '三峰工業',
  category: '金型',
  orderAmount: 11800, // 千円
  orderDate: '2026/05/28',
  dueDate: '2026/09/10',
  delayDays: 3,
  owner: '佐藤 健',
  estimateCost: 8850,
  actualCost: 10220, // 承認前
  actualCostApproved: 10378, // 承認後（+158 SKD11追加材）
  variance: 1370,
  varianceApproved: 1528,
  changeCost: 820, // うち設変
  rateEstimate: 25.0,
  rateNow: 13.4,
  rateApproved: 12.1,
  po2660Amount: 158,
  hoursTotal: 504,
  hoursEstimate: 462,
  hoursExtra: 42,
  dataSourceNote: 'バーコード読取94%＋日報補完6%',
};

export interface CostItem {
  name: string;
  est: number;
  act: number;
  actApproved?: number;
  note?: string;
  alert?: boolean;
}
export const k1088CostItems: CostItem[] = [
  { name: '材料費', est: 1850, act: 2140, actApproved: 2298, note: '' },
  { name: '購入部品', est: 1300, act: 1390, note: '' },
  { name: '社内加工', est: 3200, act: 3610, note: '' },
  { name: '外注加工', est: 900, act: 1720, note: '+820 設変', alert: true },
  { name: '組立検査', est: 1600, act: 1360, note: '見込' },
];

export const k1088Processes = [
  { name: '設計', hours: 124, status: '完了', progress: 100 },
  { name: '部品加工', hours: 268, status: '進行中', progress: 68 },
  { name: '組立', hours: 88, status: '見込', progress: 0 },
  { name: '検査・出荷', hours: 24, status: '見込', progress: 0 },
];

export const k1088Members = [
  { name: '佐藤 健', dept: '金型課', role: '主担当', hours: 196, period: '6/1〜 全期間' },
  { name: '鈴木', dept: '金型課', role: '', hours: 128, period: '6/9〜8/5' },
  { name: '高橋', dept: '製造1課', role: '', hours: 98, period: '7/10〜' },
  { name: '山本', dept: '設備課', role: '設変追加加工', hours: 58, period: '8/8〜' },
  { name: '伊藤', dept: '品質保証', role: '予定', hours: 24, period: '9/3〜' },
];

export interface PurchaseOrder {
  no: string;
  vendor: string;
  item: string;
  amount: number;
  status: string;
  alert?: boolean;
  pending?: boolean; // PO-2660: 承認デモ対象
}
export const k1088POs: PurchaseOrder[] = [
  { no: 'PO-2611', vendor: '山田鋼材', item: 'SKD11プレート材', amount: 486, status: '入荷済' },
  { no: 'PO-2618', vendor: 'ミスミ', item: '標準部品', amount: 312, status: '入荷済' },
  { no: 'PO-2634', vendor: 'THK', item: 'ガイドポスト', amount: 174, status: '入荷済' },
  { no: 'PO-2652', vendor: '山口精機', item: 'ワイヤーカット外注（設変）', amount: 820, status: '加工中', alert: true },
  { no: 'PO-2660', vendor: '山田鋼材', item: 'SKD11追加材（板厚32）', amount: 158, status: '承認待ち', pending: true },
];

// ============ 09 金型案件ガント K-1088（6/1〜9/20） ============
export const ganttRange = { start: '2026-06-01', end: '2026-09-20' };
export type GanttBarType = 'done' | 'plan' | 'late' | 'replan' | 'future';
export interface GanttRow {
  label: string;
  bars: { from: string; to: string; type: GanttBarType; note?: string }[];
  milestone?: { date: string; label: string };
}
export const ganttRows: GanttRow[] = [
  { label: '見積・受注', bars: [{ from: '2026-06-01', to: '2026-06-08', type: 'done' }] },
  { label: '設計', bars: [{ from: '2026-06-09', to: '2026-06-28', type: 'done' }] },
  { label: '材料手配', bars: [{ from: '2026-06-20', to: '2026-07-05', type: 'done' }] },
  {
    label: '部品加工',
    bars: [
      { from: '2026-06-29', to: '2026-08-05', type: 'plan' },
      { from: '2026-06-29', to: '2026-08-20', type: 'late', note: '+15日' },
    ],
  },
  {
    label: '組立',
    bars: [
      { from: '2026-08-06', to: '2026-08-28', type: 'plan' },
      { from: '2026-08-21', to: '2026-09-02', type: 'replan', note: '再計画' },
    ],
  },
  { label: '検査', bars: [{ from: '2026-09-03', to: '2026-09-08', type: 'future' }] },
  { label: '出荷', bars: [], milestone: { date: '2026-09-10', label: '出荷 9/10' } },
];

// ============ 02 案件別採算一覧 ============
export interface ProfitRow {
  no: string;
  customer: string;
  category: 'プレス' | '金型';
  order: number;
  est: number;
  act: number;
  rate: number;
  diff: number;
  status: '順調' | '要注意' | '赤字';
  isK1088?: boolean;
}
export const profitRows: ProfitRow[] = [
  { no: 'J-2601', customer: 'アイチ精工', category: 'プレス', order: 12400, est: 9410, act: 9120, rate: 26.5, diff: -290, status: '順調' },
  { no: 'K-1088', customer: '三峰工業', category: '金型', order: 11800, est: 8850, act: 10220, rate: 13.4, diff: 1370, status: '要注意', isK1088: true },
  { no: 'J-2588', customer: '東海自動車部品', category: 'プレス', order: 9800, est: 7350, act: 8940, rate: 8.8, diff: 1590, status: '要注意' },
  { no: 'J-2595', customer: '中部メタル', category: 'プレス', order: 6200, est: 4700, act: 4580, rate: 26.1, diff: -120, status: '順調' },
  { no: 'K-1075', customer: '北勢プレス', category: '金型', order: 8400, est: 6300, act: 7430, rate: 11.5, diff: 1130, status: '要注意' },
  { no: 'J-2570', customer: 'アイチ精工', category: 'プレス', order: 7450, est: 5590, act: 7890, rate: -5.9, diff: 2300, status: '赤字' },
  { no: 'K-1081', customer: '東海自動車部品', category: '金型', order: 9600, est: 7200, act: 7020, rate: 26.9, diff: -180, status: '順調' },
  { no: 'J-2607', customer: '三峰工業', category: 'プレス', order: 5300, est: 4020, act: 3960, rate: 25.3, diff: -60, status: '順調' },
];
export const profitAiSummary =
  '外注費の見積差異が3案件で+15%を超えています。K-1088は追加加工費が主要因です。';
export const profitFilters = ['全案件', 'プレス量産', '金型製造', '赤字のみ'] as const;

// ============ 04 顧客別売上・利益（百万円） ============
export interface CustomerRow {
  name: string;
  sales: number;
  profit: number;
  yoy: string;
  trend: '拡大' | '維持' | '注意' | '';
}
export const customers: CustomerRow[] = [
  { name: 'アイチ精工', sales: 412, profit: 98, yoy: '+8.2%', trend: '拡大' },
  { name: '東海自動車部品', sales: 298, profit: 61, yoy: '+2.1%', trend: '維持' },
  { name: '三峰工業', sales: 214, profit: 38, yoy: '-4.8%', trend: '注意' },
  { name: '中部メタル', sales: 152, profit: 40, yoy: '+12.4%', trend: '拡大' },
  { name: '北勢プレス', sales: 118, profit: 22, yoy: '+0.9%', trend: '維持' },
  { name: '山城工業', sales: 86, profit: 21, yoy: '+3.4%', trend: '維持' },
  { name: '桑名ダイカスト', sales: 64, profit: 9, yoy: '-9.1%', trend: '注意' },
  { name: 'その他', sales: 143, profit: 30, yoy: '—', trend: '' },
];
export const customerShare = [
  { name: 'アイチ精工', pct: 28, color: '#2563EB' },
  { name: '東海自動車部品', pct: 20, color: '#16A34A' },
  { name: '三峰工業', pct: 14, color: '#D97706' },
  { name: '中部メタル', pct: 10, color: '#7C3AED' },
  { name: '北勢プレス', pct: 8, color: '#64748B' },
  { name: 'その他', pct: 20, color: '#CBD6E6' },
];
export const customerHighlights = [
  { tone: 'amber' as Tone, text: '上位2社で売上の48%。依存度に注意' },
  { tone: 'green' as Tone, text: '中部メタルは粗利率26.3%で最も高収益' },
  { tone: 'red' as Tone, text: '三峰工業は粗利率が前年比 -3.2pt' },
];

// ============ 05 設備稼働モニタリング ============
export interface Machine {
  name: string;
  status: '稼働' | '準備中' | '待機' | '停止';
  rate: number;
  note?: string;
  alert?: boolean;
}
export const machines: Machine[] = [
  { name: '200t#1', status: '稼働', rate: 92, note: '電力 118kWh・稼働 6.4h' },
  { name: '200t#2', status: '稼働', rate: 88 },
  { name: '400t#1', status: '準備中', rate: 45, note: '段取り替え 14:05〜' },
  { name: '400t#2', status: '稼働', rate: 76 },
  { name: '600t#1', status: '稼働', rate: 81 },
  { name: '600t#2', status: '停止', rate: 0, note: '金型異常アラーム 14:32〜', alert: true },
  { name: 'トランスファ#1', status: '稼働', rate: 69 },
  { name: 'MC-1', status: '稼働', rate: 74, note: 'K-1088 部品加工中' },
  { name: 'MC-2', status: '待機', rate: 12 },
  { name: 'WC-1', status: '稼働', rate: 66, note: 'K-1075 追加加工中' },
  { name: 'EDM-1', status: '待機', rate: 8 },
  { name: 'EDM-2', status: '稼働', rate: 71 },
];
export const stopCost = {
  totalHours: '26.4h',
  totalCount: 38,
  loss: 412,
  lossPrev: 486,
  topFactor: '600t#2 金型異常',
  topAmount: 148,
  topShare: '36%',
  charge: '¥15,600/h',
  chargeNote: '償却費＋電力＋労務費',
  masterNote: 'チャージレートは機械ごとにマスタ登録（例：600t ¥18,400/h、MC ¥9,800/h）',
};
// 24hタイムライン（6:00〜22:00）: w は割合（合計1.0）
export type SegType = 'run' | 'setup' | 'idle' | 'stop';
export const timeline24h: { name: string; segs: { w: number; t: SegType }[] }[] = [
  { name: '200t#1', segs: [{ w: 0.38, t: 'run' }, { w: 0.05, t: 'setup' }, { w: 0.40, t: 'run' }, { w: 0.07, t: 'idle' }, { w: 0.10, t: 'run' }] },
  { name: '200t#2', segs: [{ w: 0.45, t: 'run' }, { w: 0.06, t: 'idle' }, { w: 0.30, t: 'run' }, { w: 0.05, t: 'setup' }, { w: 0.14, t: 'run' }] },
  { name: '400t#1', segs: [{ w: 0.30, t: 'run' }, { w: 0.06, t: 'idle' }, { w: 0.145, t: 'run' }, { w: 0.495, t: 'setup' }] },
  { name: '400t#2', segs: [{ w: 0.25, t: 'run' }, { w: 0.07, t: 'setup' }, { w: 0.35, t: 'run' }, { w: 0.08, t: 'idle' }, { w: 0.25, t: 'run' }] },
  { name: '600t#1', segs: [{ w: 0.05, t: 'idle' }, { w: 0.40, t: 'run' }, { w: 0.06, t: 'setup' }, { w: 0.39, t: 'run' }, { w: 0.10, t: 'idle' }] },
  { name: '600t#2', segs: [{ w: 0.32, t: 'run' }, { w: 0.06, t: 'setup' }, { w: 0.24, t: 'run' }, { w: 0.10, t: 'idle' }, { w: 0.28, t: 'stop' }] },
];

// ============ 06 生産計画・実績 ============
export const dailyPlan = [
  { day: '月', plan: 8200, act: 8010 },
  { day: '火', plan: 8200, act: 8420 },
  { day: '水', plan: 8400, act: 7620, alert: '設備停止' },
  { day: '木', plan: 8400, act: 8510 },
  { day: '金', plan: 8400, act: 8340 },
  { day: '土', plan: 8420, act: 7310, inProgress: true },
];
export const delayedItems = [
  { tone: 'red' as Tone, code: 'P-3312', name: 'ブラケットR', qty: '-820個', note: '600t#2停止の影響・挽回計画未作成' },
  { tone: 'amber' as Tone, code: 'P-5203', name: 'カバーパネル', qty: '-1,250個', note: '段取り待ち・金曜挽回予定' },
  { tone: 'green' as Tone, code: 'その他 18品番', name: '', qty: '±2%以内', note: '計画どおり進行中' },
];
export const productionRows = [
  { code: 'P-2214', name: 'ブラケットL', machine: '200t#1', plan: 12000, act: 12180, rate: 101.5, defect: 14, status: '順調' },
  { code: 'P-3312', name: 'ブラケットR', machine: '600t#2', plan: 9600, act: 8780, rate: 91.5, defect: 22, status: '遅延' },
  { code: 'P-1108', name: '補強プレート', machine: '400t#2', plan: 8000, act: 8050, rate: 100.6, defect: 6, status: '順調' },
  { code: 'P-4451', name: 'シャシ部品A', machine: 'トランスファ#1', plan: 7200, act: 7110, rate: 98.8, defect: 18, status: '順調' },
  { code: 'P-2890', name: '精密端子', machine: '200t#2', plan: 6400, act: 6520, rate: 101.9, defect: 4, status: '順調' },
  { code: 'P-5203', name: 'カバーパネル', machine: '400t#1', plan: 6820, act: 5570, rate: 81.7, defect: 9, status: '段取待ち' },
];

// ============ 07 品質・不良分析 ============
export const pareto = [
  { name: 'P-3312', count: 68, cum: 32, color: '#DC2626' },
  { name: 'P-2214', count: 42, cum: 51, color: '#D97706' },
  { name: 'P-5203', count: 31, cum: 66, color: '#2563EB' },
  { name: 'P-1108', count: 24, cum: 77, color: '#2563EB' },
  { name: 'P-2890', count: 18, cum: 85, color: '#2563EB' },
  { name: 'その他', count: 31, cum: 100, color: '#9AA7BC' },
];
export const paretoNote = '上位2品番で全体の51%。P-3312はカエリ・バリが集中 → 金型メンテを優先';
export const defectCauses = [
  { name: 'カエリ・バリ', pct: 34, color: '#DC2626' },
  { name: 'キズ', pct: 26, color: '#D97706' },
  { name: '寸法不良', pct: 18, color: '#2563EB' },
  { name: '割れ', pct: 12, color: '#7C3AED' },
  { name: 'その他', pct: 10, color: '#9AA7BC' },
];
export const correctiveActions = [
  { item: 'P-3312', defect: 'カエリ・バリ', action: '金型メンテ（刃先再研磨）', due: '8/20', owner: '金型課 鈴木', status: '対応中' },
  { item: 'P-2214', defect: 'キズ', action: '緩衝材交換＋仕切り追加', due: '8/22', owner: '高橋', status: '対応中' },
  { item: 'P-5203', defect: '寸法不良', action: '初品検査 3個→5個', due: '8/15', owner: '伊藤', status: '完了' },
  { item: 'P-1108', defect: '割れ', action: '速度条件見直し', due: '8/29', owner: '山本', status: '未着手' },
];

// ============ 08 金型工程カンバン ============
export interface KanbanItem {
  no: string;
  name: string;
  customer: string;
  due: string;
  progress?: number;
  delay?: string;
  link?: string;
}
export const kanbanColumns: { title: string; items: KanbanItem[] }[] = [
  {
    title: '見積・受注',
    items: [
      { no: 'K-1092', name: '曲げ型', customer: '桑名ダイカスト', due: '10/02' },
      { no: 'K-1093', name: '抜き型（試作）', customer: '三峰工業', due: '10/15' },
    ],
  },
  {
    title: '設計',
    items: [
      { no: 'K-1090', name: '順送型', customer: 'アイチ精工', progress: 45, due: '9/28' },
      { no: 'K-1091', name: '絞り型', customer: '中部メタル', progress: 30, due: '10/08' },
      { no: 'K-1089', name: '抜き型（改修）', customer: '北勢プレス', progress: 60, due: '9/12' },
    ],
  },
  {
    title: '部品加工',
    items: [
      { no: 'K-1088', name: 'リアブラケット順送型', customer: '三峰工業', progress: 68, due: '9/10', delay: '+3日', link: '/molds/k-1088' },
      { no: 'K-1085', name: '曲げ型', customer: '東海自動車部品', progress: 72, due: '9/05' },
      { no: 'K-1084', name: '順送型', customer: 'アイチ精工', progress: 55, due: '9/18' },
      { no: 'K-1086', name: 'プレス型（改修）', customer: '山城工業', progress: 80, due: '8/29' },
    ],
  },
  {
    title: '組立',
    items: [
      { no: 'K-1081', name: '精密順送型', customer: '東海自動車部品', progress: 88, due: '8/26' },
      { no: 'K-1079', name: '抜き型', customer: '中部メタル', progress: 92, due: '8/22' },
    ],
  },
  {
    title: '検査・出荷',
    items: [{ no: 'K-1075', name: 'トリム型', customer: '北勢プレス', progress: 98, due: '8/18' }],
  },
];

// ============ 10 通知センター ============
export interface NotificationItem {
  id: string;
  tone: Tone;
  cat: string;
  title: string;
  desc: string;
  time: string;
  action?: string;
  to?: string;
  toastAction?: string;
  done?: string;
  isPo2660?: boolean;
  isC00?: boolean;
}
export const notificationsToday: NotificationItem[] = [
  {
    id: 'n1', tone: 'red', cat: '設備',
    title: '600t#2 異常停止',
    desc: '金型異常アラーム発報。設備課へ自動通知済み',
    time: '14:32', action: '詳細を見る', to: '/machines',
  },
  {
    id: 'n2', tone: 'blue', cat: '承認',
    title: '購買見積の承認依頼：SKD11追加材（158千円）',
    desc: '申請：佐藤 ／ 案件 K-1088 ／ 期限 明日17:00',
    time: '13:05', action: '承認画面へ', to: '/m/approvals/po-2660', isPo2660: true,
  },
  {
    id: 'n3', tone: 'amber', cat: '納期',
    title: 'K-1088 組立工程の開始が3日遅延',
    desc: '挽回計画あり。納期9/10 死守見込み',
    time: '09:12', action: '対応策を見る', to: '/molds/k-1088',
  },
  {
    id: 'n4', tone: 'blue', cat: '承認',
    title: '設備修理見積：油圧ユニット交換（1,250千円）',
    desc: '申請：設備課 ／ 対象 600t#2',
    time: '15:10', action: '承認画面へ', to: '/m/approvals',
  },
];
export const notificationsYesterday: NotificationItem[] = [
  {
    id: 'y1', tone: 'red', cat: 'データ',
    title: '生産C00 前日データ未連携',
    desc: '23:00バッチ失敗。CSVでの手動再連携が可能です',
    time: '23:00', action: '再連携する', to: '/import', isC00: true,
  },
  {
    id: 'y2', tone: 'green', cat: '品質',
    title: 'P-5203 是正対策が完了',
    desc: '初品検査 3個→5個へ変更。効果確認中',
    time: '17:24', action: '内容を確認', to: '/quality',
  },
  {
    id: 'y3', tone: 'gray', cat: '承認',
    title: '外注発注を承認：山口精機（820千円）',
    desc: 'K-1088 ワイヤーカット外注（設変）',
    time: '16:20', done: '承認済み',
  },
];
export const notifyRuleDefs = [
  { key: 'stop', label: '設備停止アラーム', desc: '発生時に即時通知', on: true },
  { key: 'profit', label: '利益率10%未満', desc: '経営陣へ週次レポート', on: true },
  { key: 'approval', label: '承認滞留 24h超', desc: 'リマインドを送信', on: true },
  { key: 'plan', label: '計画未達 -5%超', desc: '翌朝8:00に通知', on: true },
  { key: 'data', label: 'データ未連携', desc: 'バッチ失敗時に通知', on: false },
];

// ============ 11 ナレッジ検索 ============
export const knowledgeQueryPreset = '600t プレス 金型異常';
export interface KnowledgeArticle {
  title: string;
  cat: '作業標準' | '金型ノウハウ' | '改善事例';
  author: string;
  date: string;
  hot?: boolean;
  keywords: string[];
}
export const knowledgeArticles: KnowledgeArticle[] = [
  { title: '【トラブル対処】600tプレス金型異常アラームの一次対応手順', cat: '金型ノウハウ', author: '設備課 山本', date: '2025/11/20', hot: true, keywords: ['600t', 'プレス', '金型', '金型異常', 'アラーム', 'トラブル'] },
  { title: 'カス上がり対策：600t・400t共通チェックリスト', cat: '作業標準', author: '金型課 鈴木', date: '2026/03/08', keywords: ['600t', '400t', 'プレス', '金型', 'カス上がり'] },
  { title: '【改善事例】P-3312バリ不良を62%削減した金型メンテ周期の見直し', cat: '改善事例', author: '伊藤', date: '2026/06/15', keywords: ['プレス', '金型', 'バリ', 'P-3312', '金型メンテ'] },
  { title: 'プレス金型保守点検標準書 Rev.4', cat: '作業標準', author: '設備課', date: '2026/07/30', keywords: ['プレス', '金型', '保守点検', '標準書'] },
];
export const knowledgeTotalHits = 8;
export const knowledgeCategories = [
  { name: '作業標準', count: 128 },
  { name: '金型ノウハウ', count: 86 },
  { name: '改善事例', count: 54 },
];
export const knowledgeRanking = [
  { title: '600tプレス金型異常アラームの一次対応手順', views: 128 },
  { title: 'プレス金型保守点検標準書 Rev.4', views: 96 },
  { title: 'カス上がり対策チェックリスト', views: 84 },
  { title: '段取り替え時間短縮の改善事例', views: 62 },
  { title: 'P-3312バリ不良62%削減の金型メンテ', views: 58 },
];
export const knowledgeStats = { posts: 12, searches: 486, solveTime: '-42%' };

// ============ M1〜M4 モバイル ============
export interface ApprovalCard {
  id: string;
  type: string;
  title: string;
  amount: number;
  applicant: string;
  project: string;
  deadline: string;
  deadlineTone: Tone;
  hasDetail?: boolean;
}
export const approvalCards: ApprovalCard[] = [
  { id: 'po-2660', type: '購買見積', title: 'SKD11追加材（板厚32）', amount: 158, applicant: '佐藤 健', project: 'K-1088', deadline: '明日 17:00', deadlineTone: 'amber', hasDetail: true },
  { id: 'repair', type: '設備修理', title: '油圧ユニット交換', amount: 1250, applicant: '設備課', project: '600t#2', deadline: '今日中', deadlineTone: 'red' },
  { id: 'outsource', type: '外注発注', title: '追加ワイヤーカット加工', amount: 820, applicant: '鈴木', project: 'K-1088', deadline: '08/18', deadlineTone: 'gray' },
];
export const approvalsDoneBase = [
  { type: '外注発注', title: '山口精機 ワイヤーカット加工', amount: 820, date: '昨日 16:20' },
  { type: '購買見積', title: 'SS400 材料一式', amount: 96, date: '8/14' },
];
export const po2660Detail = {
  no: 'PO-2660',
  type: '購買見積',
  amount: 158,
  kv: [
    { k: '申請者', v: '佐藤 健（金型課）' },
    { k: '案件', v: 'K-1088 リアブラケット順送型' },
    { k: '仕入先', v: '山田鋼材' },
    { k: '理由', v: '客先設変による追加材料' },
    { k: '希望納期', v: '08/22' },
  ],
  attachment: { name: '見積書_山田鋼材_0815.pdf', size: '218KB' },
  impactNote: '承認後も最低利益率ライン10%は維持されます',
};
export const scanResult = {
  code: 'K-1088-037',
  part: '上型プレート',
  process: 'ワイヤーカット（設変分）',
  machine: 'WC-1',
  stdHours: '3.5h',
  actHours: '2.1h 経過',
};
export const todayScanRecords = [
  { code: 'K-1088-035', part: '下型ダイプレート', process: 'MC加工', time: '09:12', hours: '2.4h' },
  { code: 'K-1084-012', part: 'パンチプレート', process: '研磨', time: '11:05', hours: '1.6h' },
  { code: 'K-1085-021', part: 'ストリッパ', process: '組立', time: '13:40', hours: '1.2h' },
];

// ============ 01 経営サマリー ============
export const monthlySales = [
  { m: '9月', sales: 108, profit: 24 },
  { m: '10月', sales: 112, profit: 25 },
  { m: '11月', sales: 118, profit: 27 },
  { m: '12月', sales: 124, profit: 29 },
  { m: '1月', sales: 96, profit: 21 },
  { m: '2月', sales: 110, profit: 25 },
  { m: '3月', sales: 121, profit: 28 },
  { m: '4月', sales: 126, profit: 30 },
  { m: '5月', sales: 119, profit: 27 },
  { m: '6月', sales: 131, profit: 31 },
  { m: '7月', sales: 128, profit: 30 },
  { m: '8月', sales: 147, profit: 35 },
];
export const machineDonut = [
  { name: '稼働', value: 7, color: '#16A34A' },
  { name: '準備', value: 2, color: '#2563EB' },
  { name: '待機', value: 2, color: '#D97706' },
  { name: '停止', value: 1, color: '#DC2626' },
];
export const dashboardAlerts: { tone: Tone; cat: string; title: string; desc: string; to: string; usePending?: boolean }[] = [
  { tone: 'red', cat: '設備', title: '600t#2 異常停止中', desc: '金型異常アラーム 14:32〜 ／ 設備課へ自動通知済み', to: '/machines' },
  { tone: 'amber', cat: '納期', title: 'K-1088 組立開始が3日遅延', desc: '挽回計画あり ／ 納期9/10 死守見込み', to: '/molds/k-1088' },
  { tone: 'blue', cat: '承認', title: '承認待ち {n}件', desc: '最古 22時間経過 ／ 期限超過リスク1件', to: '/m/approvals', usePending: true },
  { tone: 'red', cat: '採算', title: 'J-2570 が赤字転落（-5.9%）', desc: '外注費超過 +2,300千円', to: '/profit' },
];

// ============ 12 データ取込・連携（CSVインポート） ============
// 提案書（一志精工電機様向け 2026.07.27）の既存資産に準拠:
//   JupiterX = 設備の稼動/準備/待機/停止＋電力kW(5分刻み)。「データをダウンロード(CSV)」出口あり
//   生産C00 = 受注/出荷/発注/計画/購買/実績/在庫/売掛/買掛/統計 + 品番・金型管理・得意先・単価・原価等のマスタ
//   Excel帳票 = 見積・工数・単価・補助マスタ
// APIでくっつけられない前提 → CSV出力（今ある出口）からの取込を軸に設計
// 横断キー: 製番・品番・金型コード・工程コード・設備コード・日時
export interface DataSource {
  key: string;
  name: string;
  origin: string; // 元システム・帳票
  method: 'csv' | 'auto';
  methodLabel: string;
  freq: string;
  lastImport: string;
  count: string;
  status: '正常' | '未連携' | '稼働中';
  screens: string[]; // 反映先画面
  columns?: string[]; // CSVフォーマット（csvのみ）
  sampleRows?: string[][]; // プレビュー用サンプル5行
  fileName?: string; // デモ用CSVファイル名
  validation?: { total: number; ok: number; warns: { row: number; msg: string }[] };
}

export const dataSources: DataSource[] = [
  {
    key: 'orders',
    name: '受注・生産計画（生産C00）',
    origin: '生産C00 受注処理・計画処理からCSV出力',
    method: 'csv',
    methodLabel: 'CSV手動',
    freq: '週次（月曜）',
    lastImport: '今日 08:30',
    count: '48製番',
    status: '正常',
    screens: ['案件別採算', '経営サマリー', '金型工程管理'],
    columns: ['製番', '品番', '金型コード', '得意先', '区分', '受注金額(千円)', '受注日', '納期', '担当者'],
    fileName: 'C00_受注計画_20260817.csv',
    sampleRows: [
      ['K-1088', 'BRK-2201R', 'DIE-1088', '三峰工業', '金型', '11800', '2026/05/28', '2026/09/10', '佐藤 健'],
      ['J-2601', 'P-2214', 'DIE-0955', 'アイチ精工', 'プレス', '12400', '2026/04/12', '2026/12/25', '高橋'],
      ['K-1090', 'BRK-3105', 'DIE-1090', 'アイチ精工', '金型', '9200', '2026/07/02', '2026/09/28', '佐藤 健'],
      ['J-2607', 'P-2890', 'DIE-0821', '三峰工業', 'プレス', '5300', '2026/06/18', '2026/11/30', '高橋'],
      ['K-1092', 'BND-1402', 'DIE-1092', '桑名ダイカスト', '金型', '7600', '2026/08/08', '2026/10/02', '鈴木'],
    ],
    validation: { total: 48, ok: 48, warns: [] },
  },
  {
    key: 'purchase',
    name: '発注・購買（生産C00）',
    origin: '生産C00 発注処理・購買処理からCSV出力',
    method: 'csv',
    methodLabel: 'CSV手動',
    freq: '週次',
    lastImport: '8/15 17:20',
    count: '132件',
    status: '正常',
    screens: ['案件採算詳細', '案件別採算'],
    columns: ['発注No', '製番', '仕入先コード', '仕入先', '品目', '金額(千円)', '発注日', '状態'],
    fileName: 'C00_発注購買_20260815.csv',
    sampleRows: [
      ['PO-2611', 'K-1088', 'S012', '山田鋼材', 'SKD11プレート材', '486', '2026/06/22', '入荷済'],
      ['PO-2634', 'K-1088', 'S031', 'THK', 'ガイドポスト', '174', '2026/07/03', '入荷済'],
      ['PO-2652', 'K-1088', 'S044', '山口精機', 'ワイヤーカット外注（設変）', '820', '2026/08/05', '加工中'],
      ['PO-2655', 'K-1085', 'S012', '山田鋼材', 'SS400 プレート', '212', '2026/08/07', '入荷済'],
      ['PO-2660', 'K-1088', 'S012', '山田鋼材', 'SKD11追加材（板厚32）', '158', '2026/08/15', '承認待ち'],
    ],
    validation: {
      total: 132,
      ok: 131,
      warns: [{ row: 87, msg: '仕入先名の表記ゆれ「(株)山田鋼材」→ 仕入先マスタ S012 に名寄せ' }],
    },
  },
  {
    key: 'production_c00',
    name: '製造実績（生産C00）',
    origin: '生産C00 実績処理（23:00バッチ・CSV再連携可）',
    method: 'csv',
    methodLabel: '自動バッチ 23:00（CSV再連携可）',
    freq: '日次',
    lastImport: '8/15 23:00',
    count: '—',
    status: '未連携',
    screens: ['生産計画・実績', '経営サマリー', '品質・不良分析'],
    columns: ['日付', '製番', '品番', '設備コード', '計画数', '実績数', '不良数', '段取回数'],
    fileName: 'C00_製造実績_20260816.csv',
    sampleRows: [
      ['2026/08/16', 'J-2601', 'P-2214', '200t#1', '2000', '2030', '2', '1'],
      ['2026/08/16', 'J-2588', 'P-3312', '600t#2', '1600', '1180', '8', '1'],
      ['2026/08/16', 'J-2595', 'P-1108', '400t#2', '1400', '1405', '1', '0'],
      ['2026/08/16', 'J-2607', 'P-2890', '200t#2', '1050', '1065', '0', '1'],
      ['2026/08/16', '—', 'P-9902', '400t#1', '300', '295', '1', '1'],
    ],
    validation: {
      total: 212,
      ok: 210,
      warns: [
        { row: 148, msg: '品番 P-9902 が品番マスタ未登録 → 仮登録して取込（後から製品金型対応マスタへ紐付け可）' },
        { row: 201, msg: '実績数が空欄 → 0で補完' },
      ],
    },
  },
  {
    key: 'receivable',
    name: '売掛・買掛（生産C00）',
    origin: '生産C00 売掛処理・買掛処理・月次処理',
    method: 'csv',
    methodLabel: 'CSV手動',
    freq: '月次（締め後）',
    lastImport: '8/05 09:40',
    count: '24社',
    status: '正常',
    screens: ['顧客別売上・利益', '経営サマリー'],
    columns: ['年月', '得意先コード', '得意先', '売上金額(千円)', '入金額(千円)', '売掛残(千円)'],
    fileName: 'C00_売掛買掛_202607.csv',
    sampleRows: [
      ['2026/07', 'C001', 'アイチ精工', '38200', '36400', '12400'],
      ['2026/07', 'C002', '東海自動車部品', '27100', '26800', '8900'],
      ['2026/07', 'C003', '三峰工業', '19800', '21500', '6200'],
      ['2026/07', 'C004', '中部メタル', '14100', '13800', '4700'],
      ['2026/07', 'C005', '北勢プレス', '10900', '11400', '3600'],
    ],
    validation: { total: 24, ok: 24, warns: [] },
  },
  {
    key: 'jupiterx',
    name: '設備稼働・電力（JupiterX）',
    origin: 'JupiterX「データをダウンロード(CSV)」出口から自動取得',
    method: 'auto',
    methodLabel: '自動（日次CSV取得）',
    freq: '日次＋5分毎',
    lastImport: '今日 14:40',
    count: '12台・kW 5分刻み',
    status: '稼働中',
    screens: ['設備モニタリング', '経営サマリー'],
  },
  {
    key: 'barcode',
    name: '作業工数（バーコード）',
    origin: 'ハンディ端末・作業票バーコード（読取率96.2%）',
    method: 'auto',
    methodLabel: '自動（リアルタイム）',
    freq: 'リアルタイム',
    lastImport: '今日 14:38',
    count: '読取率 96.2%',
    status: '稼働中',
    screens: ['案件採算詳細', '金型工程管理'],
  },
  {
    key: 'nippo',
    name: '日報（工数補完）',
    origin: '紙日報 → Excel転記',
    method: 'csv',
    methodLabel: 'CSV手動',
    freq: '日次',
    lastImport: '今日 09:15',
    count: '26件',
    status: '正常',
    screens: ['案件採算詳細'],
    columns: ['日付', '担当者', '製番', '工程コード', '工数(h)', '備考'],
    fileName: '日報_20260816.csv',
    sampleRows: [
      ['2026/08/16', '山本', 'K-1088', 'WC', '5.5', '設変追加加工（WC-1）'],
      ['2026/08/16', '高橋', 'K-1084', 'MC', '7.0', ''],
      ['2026/08/16', '鈴木', 'K-1085', 'ASM', '6.5', '組立'],
      ['2026/08/16', '佐藤 健', 'K-1088', 'MC', '4.0', 'バーコード読取漏れ分'],
      ['2026/08/16', '伊藤', 'K-1075', 'INS', '3.0', '検査'],
    ],
    validation: {
      total: 26,
      ok: 25,
      warns: [{ row: 12, msg: '製番「K-1808」は存在しません → K-1088 の入力ミスの可能性（要確認）' }],
    },
  },
  {
    key: 'estimate',
    name: '見積・工数単価（Excel帳票）',
    origin: '見積書・チャージレート台帳（Excel）',
    method: 'csv',
    methodLabel: 'CSV手動',
    freq: '案件受注時',
    lastImport: '8/12 15:30',
    count: '36行（K-1093ほか）',
    status: '正常',
    screens: ['案件採算詳細', '案件別採算'],
    columns: ['製番', '費目', '見積金額(千円)', '標準工数(h)', 'チャージレート(円/h)'],
    fileName: '見積原価_K-1093.csv',
    sampleRows: [
      ['K-1093', '材料費', '1620', '—', '—'],
      ['K-1093', '購入部品', '980', '—', '—'],
      ['K-1093', '社内加工', '2450', '158', '15600'],
      ['K-1093', '外注加工', '700', '—', '—'],
      ['K-1093', '組立検査', '1180', '76', '9800'],
    ],
    validation: { total: 36, ok: 36, warns: [] },
  },
  {
    key: 'quality',
    name: '品質・不良実績',
    origin: '検査記録（Excel）',
    method: 'csv',
    methodLabel: 'CSV手動',
    freq: '日次',
    lastImport: '今日 10:05',
    count: '214件',
    status: '正常',
    screens: ['品質・不良分析'],
    columns: ['日付', '品番', '不良区分', '数量', '発生工程', '処置'],
    fileName: '検査記録_20260816.csv',
    sampleRows: [
      ['2026/08/16', 'P-3312', 'カエリ・バリ', '6', 'プレス', '廃棄'],
      ['2026/08/16', 'P-2214', 'キズ', '3', '搬送', '手直し'],
      ['2026/08/16', 'P-5203', '寸法不良', '2', 'プレス', '廃棄'],
      ['2026/08/16', 'P-1108', '割れ', '1', 'プレス', '廃棄'],
      ['2026/08/16', 'P-3312', 'カエリ・バリ', '4', 'プレス', '手直し'],
    ],
    validation: { total: 214, ok: 214, warns: [] },
  },
  {
    key: 'master',
    name: 'マスタ類（生産C00）',
    origin: '品番・金型管理・得意先・単価・原価マスタ',
    method: 'csv',
    methodLabel: 'CSV手動',
    freq: '月次',
    lastImport: '8/01 09:00',
    count: '品番1,240・金型86',
    status: '正常',
    screens: ['案件別採算', '金型工程管理'],
    columns: ['品番', '品名', '金型コード', '得意先コード', '工程コード', '標準単価(円)'],
    fileName: 'C00_マスタ一式_202608.csv',
    sampleRows: [
      ['P-2214', 'ブラケットL', 'DIE-0955', 'C001', 'PRS', '48.2'],
      ['P-3312', 'ブラケットR', 'DIE-0961', 'C002', 'PRS', '52.6'],
      ['P-1108', '補強プレート', 'DIE-0870', 'C004', 'PRS', '36.4'],
      ['P-2890', '精密端子', 'DIE-0821', 'C003', 'PRS', '21.8'],
      ['P-5203', 'カバーパネル', 'DIE-1013', 'C002', 'PRS', '44.0'],
    ],
    validation: {
      total: 1240,
      ok: 1238,
      warns: [
        { row: 412, msg: '金型コード未設定の品番 → 製品金型対応マスタから補完' },
        { row: 977, msg: '単価0円の品番 → 原価マスタの標準原価で仮置き' },
      ],
    },
  },
];

export interface ImportHistoryRow {
  time: string;
  source: string;
  file: string;
  count: string;
  result: string;
  tone: Tone;
  by: string;
}
export const importHistoryBase: ImportHistoryRow[] = [
  { time: '今日 10:05', source: '品質・不良実績', file: '検査記録_20260816.csv', count: '214件', result: '成功', tone: 'green', by: '伊藤' },
  { time: '今日 09:15', source: '日報（工数補完）', file: '日報_20260816.csv', count: '26件', result: '警告1件', tone: 'amber', by: '佐藤 健' },
  { time: '今日 08:30', source: '受注・生産計画（生産C00）', file: 'C00_受注計画_20260817.csv', count: '48件', result: '成功', tone: 'green', by: '田中 一郎' },
  { time: '昨日 23:00', source: '製造実績（生産C00）', file: '自動バッチ', count: '—', result: '失敗（接続タイムアウト）', tone: 'red', by: 'システム' },
  { time: '8/15 17:20', source: '発注・購買（生産C00）', file: 'C00_発注購買_20260815.csv', count: '132件', result: '成功', tone: 'green', by: '鈴木' },
];

export const importRules = [
  '製番・品番・金型コード・工程コード・設備コードで横断突合（名寄せ）します',
  '文字コードは UTF-8 / Shift_JIS を自動判定します',
  '重複データはキー項目（製番・日付など）で上書きします',
  '欠損・重複・突合・更新遅れを取込時に自動チェックします',
  '取込後は各画面に即時反映されます（履歴から取消可能）',
];

// データ品質チェック（提案書: 欠損・重複・突合・更新遅れを検知して信頼性を担保）
export const dataQualityChecks = [
  { name: '欠損チェック', result: '2件を自動補完', tone: 'amber' as Tone, desc: '実績数の空欄 → 0補完 ほか' },
  { name: '重複チェック', result: '0件', tone: 'green' as Tone, desc: '製番×日付キーの重複なし' },
  { name: '突合チェック', result: '不一致 1件', tone: 'amber' as Tone, desc: '品番 P-9902 が品番マスタ未登録' },
  { name: '更新遅れ', result: '1件', tone: 'red' as Tone, desc: '製造実績（生産C00）バッチ失敗', c00: true },
];

export const fmt = (n: number) => n.toLocaleString('ja-JP');
