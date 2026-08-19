// チャプターカードの表示内容（DEMO_SCRIPT.md の順路・課題対応表に準拠）
export interface ChapterDef {
  num: number;
  no: string;
  title: string;
  sub: string;
  pills: string[];
  highlight?: boolean; // 山場（赤アクセント）
}

export const CHAPTER_DEFS: ChapterDef[] = [
  { num: 1, no: '①', title: '経営サマリー', sub: '毎朝これだけ見れば、会社の状態が分かる', pills: ['課題01', '課題09'] },
  { num: 2, no: '②', title: '設備稼働モニタリング', sub: '停止時間を正確に把握し、お金に換算する', pills: ['課題02', '課題03'] },
  { num: 3, no: '③', title: '生産計画・実績', sub: '計画と実績を同じ画面で、原因まで追う', pills: ['課題04'] },
  { num: 4, no: '④', title: '案件別採算 → K-1088 詳細', sub: '見積原価と実際原価の差異を1画面で', pills: ['課題06', '課題07', '課題08'] },
  { num: 5, no: '⑤', title: 'モバイル承認', sub: '承認した瞬間、経営数字に反映される', pills: ['デモの山場'], highlight: true },
  { num: 6, no: '⑥', title: '金型工程カンバン → ガント', sub: '納期に間に合うかが、今日ラインで一目瞭然', pills: ['納期管理'] },
  { num: 7, no: '⑦', title: 'データ取込・連携', sub: '「どうやって繋ぐの？」— 既存システムは改修しない', pills: ['課題05', '連携の山場'], highlight: true },
  { num: 8, no: '⑧', title: '通知センター・ナレッジ', sub: 'Larkに自動配信、現場のノウハウを資産に', pills: ['課題01', '課題10'] },
];

// エンディングに表示する提供元（正式社名が決まったらここを書き換えて再レンダリング）
export const VENDOR_NAME = '';
export const CUSTOMER_NAME = '一志精工電機株式会社';
export const DEMO_DATE_LABEL = '2026年8月';
