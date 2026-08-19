// 工場コックピット デモ録画スクリプト
// 使い方: node record.mjs          … 全8章を録画
//         node record.mjs 1,5,7    … 指定章のみ再録画（meta.jsonはマージ）
//
// 各章 = 独立したブラウザコンテキスト（state初期化済み）。
// 承認/取込済みstateが必要な章（⑥⑦⑧）は、冒頭に高速セットアップ操作を行い、
// contentStart 以降だけを Remotion 側で使う（頭はトリムされる）。
// 字幕(cue)・ズーム(zoom)・クリックのタイムラインを clips/meta.json に記録する。

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL || 'http://localhost:5173';
const CLIPS = path.join(__dirname, 'clips');
const VIEW = { width: 1920, height: 1080 };

// 疑似カーソル・クリックリップル・リセットボタン/スクロールバー非表示
const INIT_SCRIPT = `
(() => {
  const install = () => {
    if (document.getElementById('__democursor')) return;
    const style = document.createElement('style');
    style.textContent = \`
      button.fixed.bottom-4.right-4 { display: none !important; }
      ::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
      * { scrollbar-width: none !important; }
    \`;
    document.head.appendChild(style);
    const c = document.createElement('div');
    c.id = '__democursor';
    c.innerHTML = '<svg width="30" height="30" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><path d="M7 3 L7 22.5 L11.8 18 L14.9 25 L18.2 23.5 L15.1 16.6 L21.6 16 Z" fill="#111827" stroke="#ffffff" stroke-width="1.7" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, {
      position: 'fixed', left: '-40px', top: '-40px', zIndex: '2147483647',
      pointerEvents: 'none', margin: '0', transform: 'translate(-6px,-3px)',
      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))',
    });
    document.documentElement.appendChild(c);
    document.addEventListener('mousemove', (e) => {
      c.style.left = e.clientX + 'px';
      c.style.top = e.clientY + 'px';
    }, { capture: true, passive: true });
    document.addEventListener('mousedown', (e) => {
      const r = document.createElement('div');
      Object.assign(r.style, {
        position: 'fixed', left: e.clientX + 'px', top: e.clientY + 'px',
        width: '14px', height: '14px', borderRadius: '50%',
        border: '3px solid rgba(37,99,235,0.9)', background: 'rgba(37,99,235,0.25)',
        transform: 'translate(-50%,-50%) scale(1)', opacity: '1',
        zIndex: '2147483646', pointerEvents: 'none',
        transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
      });
      document.documentElement.appendChild(r);
      requestAnimationFrame(() => {
        r.style.transform = 'translate(-50%,-50%) scale(3.6)';
        r.style.opacity = '0';
      });
      setTimeout(() => r.remove(), 650);
    }, { capture: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
})();
`;

function makeApi(page, rec) {
  let mx = 0, my = 0;
  const now = () => Date.now() - rec.anchor;
  const log = (ev) => rec.events.push({ t: now(), ...ev });
  const wait = (ms) => page.waitForTimeout(ms);

  const resolve = (loc) => (typeof loc === 'string' ? page.locator(loc) : loc).first();
  const box = async (loc) => {
    const el = resolve(loc);
    await el.waitFor({ state: 'visible', timeout: 15000 });
    const b = await el.boundingBox();
    if (!b) throw new Error('boundingBox is null');
    return b;
  };
  const moveTo = async (x, y, opts = {}) => {
    const dist = Math.hypot(x - mx, y - my);
    const steps = opts.steps ?? Math.max(10, Math.min(42, Math.round(dist / 34)));
    await page.mouse.move(x, y, { steps });
    mx = x; my = y;
  };
  const hover = async (loc, opts = {}) => {
    const b = await box(loc);
    const x = b.x + b.width * (opts.rx ?? 0.5) + (opts.dx ?? 0);
    const y = b.y + b.height * (opts.ry ?? 0.5) + (opts.dy ?? 0);
    await moveTo(x, y, opts);
    return b;
  };
  const click = async (loc, opts = {}) => {
    await hover(loc, opts);
    await wait(opts.before ?? 420);
    await page.mouse.down();
    await wait(90);
    await page.mouse.up();
    log({ type: 'click', x: mx, y: my });
    await wait(opts.after ?? 700);
  };
  // 字幕。ms の間だけ表示し、待機する
  const cue = async (text, ms) => { log({ type: 'cue', text, dur: ms }); await wait(ms); };
  // 字幕（待機なし。直後の操作と並行して表示する）
  const cueBg = (text, ms) => log({ type: 'cue', text, dur: ms });
  // ハイライト枠＋軽ズーム。dur ミリ秒の演出ウィンドウを記録（待機はしない）
  const zoom = async (loc, dur, opts = {}) => {
    let b = loc && typeof loc.x === 'number' ? { ...loc } : await box(loc);
    const p = opts.pad ?? 14;
    const ex = opts.expand ?? {};
    b = {
      x: b.x - p - (ex.left ?? 0),
      y: b.y - p - (ex.top ?? 0),
      width: b.width + p * 2 + (ex.left ?? 0) + (ex.right ?? 0),
      height: b.height + p * 2 + (ex.top ?? 0) + (ex.bottom ?? 0),
    };
    log({ type: 'zoom', box: b, dur, scale: opts.scale ?? 1.28 });
    return b;
  };
  const scrollWin = async (toY, ms = 1000) => {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), toY);
    await wait(ms);
  };
  const intoView = async (loc, ms = 1000, blockPos = 'center') => {
    const el = resolve(loc);
    await el.waitFor({ state: 'visible', timeout: 15000 });
    await el.evaluate((e, b) => e.scrollIntoView({ behavior: 'smooth', block: b }), blockPos);
    await wait(ms);
  };
  const goto = async (p) => {
    await page.goto(BASE + p, { waitUntil: 'load' });
    await page.waitForFunction(
      () => document.fonts.check('700 16px "Noto Sans JP"') && document.fonts.check('400 13px "Noto Sans JP"'),
      { timeout: 15000 },
    ).catch(() => console.warn('  [warn] Noto Sans JP の読込を確認できませんでした'));
    await wait(400);
  };
  const markStart = () => { rec.contentStart = now(); };
  // カード（rounded-[14px]）をテキストで特定
  const card = (text) => page.locator('div[class*="rounded-[14px]"]').filter({ hasText: text }).first();

  return { page, wait, moveTo, hover, click, cue, cueBg, zoom, scrollWin, intoView, goto, markStart, card, box, log };
}

// ============ 各章のシナリオ ============

// ① 経営サマリー
async function ch1(a) {
  await a.goto('/dashboard');
  await a.moveTo(1400, 300, { steps: 4 });
  a.markStart();
  await a.wait(700);
  await a.cueBg('毎朝これだけ見れば、会社の状態が分かる画面です', 5200);
  await a.hover(a.page.locator('div[class*="rounded-[14px]"]').filter({ hasText: '年度売上' }).first());
  await a.wait(1400);
  await a.hover(a.page.locator('div[class*="rounded-[14px]"]').filter({ hasText: '今月粗利率' }).first());
  await a.wait(1300);
  await a.hover(a.page.locator('div[class*="rounded-[14px]"]').filter({ hasText: '赤字案件' }).first());
  await a.wait(1600);
  await a.cue('売上・粗利・設備稼働・要対応事項を1画面に集約しています', 4800);

  // 顧客別TOP5（課題09）
  const top5 = a.card('顧客別売上 TOP5');
  await a.hover(top5);
  await a.zoom(top5, 5600, { pad: 6 });
  await a.cue('顧客別売上TOP5 — 上位2社で売上の48%まで見えます（課題09）', 5600);

  // 要対応アラート
  const alerts = a.card('要対応アラート');
  await a.hover(alerts, { ry: 0.25 });
  await a.cue('そして「今日対応すべきこと」が上から順に並びます', 4600);
  const alertBtn = a.page.locator('button').filter({ hasText: '600t#2 異常停止中' }).first();
  await a.zoom(alertBtn, 4600, { pad: 8 });
  await a.cueBg('一番上「600t#2 異常停止中」をクリック → 設備画面へ', 4600);
  await a.wait(2400);
  await a.click(alertBtn, { after: 1000 });
  await a.wait(1200);
}

// ② 設備稼働モニタリング
async function ch2(a) {
  await a.goto('/machines');
  await a.moveTo(1400, 300, { steps: 4 });
  a.markStart();
  await a.wait(700);
  await a.cue('JupiterXに既にあるデータを、そのまま判断できる形にした画面です', 5400);
  await a.cue('稼働率をExcelで報告用に加工する手間は、もう不要です（課題02）', 5200);

  // 600t#2 赤カード（点滅・ライブ揺らぎ）
  const alertCard = a.page.locator('div[class*="rounded-[12px]"]').filter({ hasText: '金型異常アラーム' }).first();
  await a.hover(alertCard);
  await a.zoom(alertCard, 9400, { pad: 10 });
  await a.cue('600t#2 が異常停止中 — 金型異常アラーム 14:32〜', 4900);
  await a.cue('稼働率はライブ更新。現場に行かなくても状態が分かります', 4500);

  // 24hタイムライン（課題03）
  const timeline = a.card('稼働タイムライン');
  await a.intoView(timeline, 1100);
  await a.hover(timeline, { ry: 0.35 });
  await a.zoom(timeline, 5400, { pad: 4 });
  await a.cue('稼働・準備・待機・停止が機械ごとに見えるタイムライン', 5400);
  await a.cue('「停止時間の正確な把握」（課題03）はこれで解決です', 4600);

  // 停止コスト換算
  const cost = a.card('停止コスト換算');
  await a.hover(cost);
  await a.zoom(cost, 9600, { pad: 6 });
  await a.cue('さらに停止を「お金」に換算 — 今月の損失もすぐ分かります', 5200);
  await a.cue('チャージレートは機械ごとにマスタ登録（600t ¥18,400/h）', 4400);
}

// ③ 生産計画・実績
async function ch3(a) {
  await a.goto('/production');
  await a.moveTo(1400, 300, { steps: 4 });
  a.markStart();
  await a.wait(700);
  await a.cue('計画と実績を、同じ画面で確認できます（課題04）', 4800);

  // 赤バナー（⑦への伏線）
  const banner = a.card('前日データが未連携');
  await a.hover(banner, { rx: 0.35 });
  await a.zoom(banner, 5400, { pad: 6 });
  await a.cue('製造実績（生産C00）が未連携の赤バナー — これは後ほど解決します', 5400);

  // 水曜の落ち込み
  const wed = a.page.getByText('設備停止', { exact: true }).locator('xpath=ancestor::div[contains(@class,"flex-col")][1]');
  await a.hover(wed);
  await a.zoom(wed, 5600, { pad: 16 });
  await a.cue('水曜の落ち込みは「600t#2停止の影響」と原因まで追えます', 5600);

  // 遅延品番
  const delayed = a.card('遅延品番');
  await a.hover(delayed, { ry: 0.3 });
  await a.zoom(delayed, 5200, { pad: 6 });
  await a.cue('遅延品番 P-3312 は -820個。挽回の要否がすぐ判断できます', 5200);
}

// ④ 案件別採算 → K-1088 詳細
async function ch4(a) {
  await a.goto('/profit');
  await a.moveTo(1400, 300, { steps: 4 });
  a.markStart();
  await a.wait(700);
  await a.cue('案件別の採算一覧。金型ごとに利益が出たかを色で即判断（課題08）', 5600);

  // AIサマリー
  const ai = a.card('AIサマリー');
  await a.hover(ai, { rx: 0.4 });
  await a.zoom(ai, 5200, { pad: 6 });
  await a.cue('AIが要注意ポイントを要約 — 「K-1088は追加加工費が主要因」', 5200);

  // K-1088 行 → クリック
  const row = a.page.locator('tr').filter({ hasText: 'K-1088' }).first();
  await a.hover(row);
  await a.zoom(row, 5000, { pad: 4 });
  await a.cueBg('K-1088 の利益率は 13.4% — 行をクリックして詳細へ', 5000);
  await a.wait(3000);
  await a.click(row, { after: 1000 });

  // 詳細
  await a.cue('材料費・購入部品・加工時間・工数が「この1画面」に（課題06）', 5600);
  const estCard = a.card('見積原価');
  const varCard = a.card('見積差異');
  const b1 = await a.box(estCard);
  const b2 = await a.box(varCard);
  await a.hover(varCard);
  await a.zoom({ x: b1.x, y: b1.y, width: b2.x + b2.width - b1.x, height: b1.height }, 5800, { pad: 8 });
  await a.cue('見積 8,850 vs 実際 10,220千円 — 差異 +1,370（課題07）', 5800);

  // 費目別テーブルの赤行
  const redRow = a.page.locator('tr').filter({ hasText: '外注加工' }).first();
  await a.intoView(redRow, 1100);
  await a.hover(redRow);
  await a.zoom(redRow, 5400, { pad: 4 });
  await a.cue('外注加工の赤い行 — 設変による +820 が原因と一目で分かります', 5400);

  // 工数サマリー
  const hours = a.card('投入工数サマリー');
  await a.hover(hours);
  await a.zoom(hours, 5800, { pad: 6 });
  await a.cue('工数 504h（見積462h）。バーコード読取94%＋日報補完6%', 5800);

  // 発注一覧 PO-2660
  const po = a.page.locator('tr').filter({ hasText: 'PO-2660' }).first();
  await a.intoView(po, 1100);
  await a.hover(po);
  await a.zoom(po, 6000, { pad: 4 });
  await a.cue('最下段 PO-2660 が承認待ち — この承認、スマホでできます', 6000);
}

// ⑤ モバイル承認（山場①）
async function ch5(a) {
  await a.goto('/profit');
  await a.moveTo(1400, 300, { steps: 4 });
  a.markStart();
  await a.wait(600);
  const row = a.page.locator('tr').filter({ hasText: 'K-1088' }).first();
  await a.hover(row);
  await a.zoom(row, 4400, { pad: 4 });
  await a.cue('承認前 — K-1088 の利益率は 13.4% です', 4400);

  // モバイルへ
  const mobileLink = a.page.getByRole('link', { name: 'モバイル' });
  await a.cueBg('トップバーの「モバイル」からスマホ画面へ', 4000);
  await a.click(mobileLink, { after: 1200 });
  await a.wait(800);

  // 承認タブ（バッジ5）
  const tab = a.page.locator('a[href="/m/approvals"]');
  await a.zoom(tab, 4200, { pad: 26 });
  await a.cue('承認タブ — 承認待ちは 5件（赤バッジ）', 4200);
  await a.click(tab, { after: 900 });

  // SKD11カードをタップ
  const skd = a.page.getByText('SKD11追加材（板厚32）').first();
  await a.cueBg('SKD11追加材のカードをタップ', 3400);
  await a.click(skd, { after: 1000 });

  // 採算インパクト
  const impact = a.page.locator('div[class*="rounded-[14px]"]').filter({ hasText: '採算インパクト' }).first();
  await a.intoView(impact, 1100);
  await a.hover(impact);
  await a.zoom(impact, 10400, { pad: 8 });
  await a.cue('承認の「前に」利益率への影響が見えます — 13.4% → 12.1%', 5800);
  await a.cue('最低利益率ライン10%は維持 — 安心して判断できます', 4600);

  // 承認する
  const approveBtn = a.page.getByRole('button', { name: '承認する', exact: true });
  await a.intoView(approveBtn, 900);
  await a.click(approveBtn, { after: 500 });
  const toast = a.page.getByText('承認しました。Larkで申請者へ通知されました');
  await a.zoom(toast, 4600, { pad: 12 });
  await a.cue('承認完了 — Larkで申請者へ即時通知されます', 4600);

  // 一覧へ戻ってバッジ 5→4
  await a.click(a.page.getByRole('button', { name: '承認一覧へ戻る' }), { after: 900 });
  await a.zoom(a.page.locator('a[href="/m/approvals"]'), 4600, { pad: 26 });
  await a.cue('承認待ちバッジが 5 → 4 に。カードは対応済みへ移動しました', 4600);

  // デスクトップへ戻る → /profit
  await a.cueBg('デスクトップ版に戻ると…', 3400);
  await a.click(a.page.getByRole('link', { name: 'デスクトップ版へ' }), { after: 900 });
  await a.click(a.page.locator('aside a[href="/profit"]'), { after: 1000 });

  // 反映を見せる（山場）
  const row2 = a.page.locator('tr').filter({ hasText: 'K-1088' }).first();
  await a.hover(row2);
  await a.zoom(row2, 12000, { pad: 4, scale: 1.34 });
  await a.cue('さっきの承認が、もう経営数字に反映 — 利益率 13.4% → 12.1%', 6200);
  await a.cue('実際原価も +158千円。承認と採算がつながる、これがG-DXです', 5800);
  await a.wait(400);
}

// 高速セットアップ: PO-2660 を承認して指定画面へ（頭はトリムされる）
async function fastApprove(a, sidebarHref) {
  await a.goto('/m/approvals/po-2660');
  await a.click(a.page.getByRole('button', { name: '承認する', exact: true }), { before: 100, after: 350, steps: 3 });
  await a.click(a.page.getByRole('link', { name: 'デスクトップ版へ' }), { before: 100, after: 400, steps: 3 });
  await a.click(a.page.locator(`aside a[href="${sidebarHref}"]`), { before: 100, after: 400, steps: 3 });
  await a.wait(2600); // トーストが消えるのを待つ
}

// ⑥ 金型工程カンバン → ガント
async function ch6(a) {
  await fastApprove(a, '/molds');
  await a.moveTo(1400, 300, { steps: 4 });
  a.markStart();
  await a.wait(700);
  await a.cue('金型12案件の工程をカンバンで。遅延案件は赤枠で浮き上がります', 5400);

  const k1088 = a.page.locator('div[class*="rounded-[12px]"]').filter({ hasText: 'K-1088' }).first();
  await a.hover(k1088);
  await a.zoom(k1088, 5000, { pad: 8 });
  await a.cueBg('K-1088 は遅延 +3日 — カードをクリックしてガントへ', 5000);
  await a.wait(3000);
  await a.click(k1088, { after: 1100 });

  await a.cue('部品加工が +15日遅延し、組立を再計画済み', 4800);
  const lateRow = a.page.locator('div.flex.items-center.h-12').filter({ hasText: '部品加工' }).first();
  await a.hover(lateRow);
  await a.zoom(lateRow, 4800, { pad: 4 });
  await a.cue('赤=実績遅延、黄=再計画 — 計画とのズレが色で分かります', 4800);

  const today = a.page.getByText('今日 8/17', { exact: true });
  await a.hover(today, { dy: 60 });
  await a.zoom(today, 6000, { pad: 10, expand: { left: 150, right: 150, bottom: 320 } });
  await a.cue('「今日」ラインの位置で、納期 9/10 に間に合うかが一目瞭然', 6000);

  const plan = a.card('挽回計画');
  await a.intoView(plan, 1000);
  await a.hover(plan, { rx: 0.35 });
  await a.zoom(plan, 5400, { pad: 6 });
  await a.cue('挽回計画も画面に残ります — 応援2名投入で 9/10 死守見込み', 5400);
}

// ⑦ データ取込（山場②）
async function ch7(a) {
  await fastApprove(a, '/import');
  await a.moveTo(1400, 300, { steps: 4 });
  a.markStart();
  await a.wait(700);
  await a.cue('ここまでの数字の「出どころ」がこの画面です', 4400);
  await a.cue('JupiterXと生産C00は改修しません。今あるCSV出力から取り込みます', 5800);

  // データソース一覧を眺める
  const sources = a.page.locator('div[class*="rounded-[14px]"]').filter({ hasText: 'データソース一覧' }).first();
  await a.hover(sources, { ry: 0.3 });
  await a.wait(900);
  await a.hover(sources, { ry: 0.62 });
  await a.cue('受注・購買・実績・売掛買掛…C00の実メニュー名がそのまま並びます', 5400);

  // 赤バナー → 再連携
  const banner = a.card('製造実績（生産C00）が未連携です');
  await a.hover(banner, { rx: 0.3 });
  await a.zoom(banner, 5000, { pad: 6 });
  await a.cueBg('昨日23:00のバッチが失敗 → 「今すぐCSVで再連携」', 5000);
  await a.wait(2800);
  const modal = a.page.locator('div.fixed.inset-0');
  await a.click(a.page.getByRole('button', { name: '今すぐCSVで再連携' }), { after: 900 });

  // ウィザード Step1
  await a.click(modal.getByRole('button', { name: 'デモ用サンプルCSVを使う' }), { after: 800 });
  await a.cue('CSVを選ぶだけ。行数・文字コードは自動判定します', 4400);
  await a.click(modal.getByRole('button', { name: '次へ（プレビュー）' }), { after: 900 });

  // Step2 プレビュー
  const preview = modal.locator('div[class*="rounded-[12px]"]').filter({ hasText: '製番' }).first();
  await a.zoom(preview, 5200, { pad: 6 });
  await a.cue('製番・金型コードなどの列を自動マッピング（前回設定を再利用）', 5200);
  await a.click(modal.getByRole('button', { name: '検証する' }), { after: 700 });

  // Step3 検証
  await modal.getByRole('button', { name: /行を取り込む/ }).waitFor({ state: 'visible', timeout: 10000 });
  const grid = modal.locator('div.grid.grid-cols-4');
  await a.zoom(grid, 6200, { pad: 8 });
  await a.cue('212行中 210行OK・警告2行・エラー0 — 毎回自動チェック（課題05）', 6200);
  const warns = modal.locator('div.mt-4.flex.flex-col.gap-2');
  await a.hover(warns);
  await a.zoom(warns, 5000, { pad: 6 });
  await a.cue('警告2行も止めません — 仮登録・0補完で受け止めます', 5000);

  // 取込 → 完了
  await a.click(modal.getByRole('button', { name: /行を取り込む/ }), { after: 900 });
  await a.cue('取込完了。反映された画面がその場で分かります', 4200);

  // 生産計画・実績へ → 緑バナー
  await a.click(modal.getByRole('button', { name: '生産計画・実績' }), { after: 1100 });
  const green = a.card('連携済み');
  await a.hover(green, { rx: 0.35 });
  await a.zoom(green, 6000, { pad: 6 });
  await a.cue('先ほどの赤バナーが緑に — グラフは最新データに更新されました', 6000);

  // データ品質チェック 解消済み
  await a.click(a.page.locator('aside a[href="/import"]'), { after: 1000 });
  const quality = a.card('データ品質チェック');
  await a.intoView(quality, 1000);
  await a.hover(quality);
  await a.zoom(quality, 5000, { pad: 6 });
  await a.cue('データ品質チェックの「更新遅れ」も解消済みに変わりました', 5000);
}

// ⑧ クロージング（通知センター → ナレッジ）
async function ch8(a) {
  // セットアップ: 承認 + CSV取込を高速実行
  await fastApprove(a, '/import');
  const modal = a.page.locator('div.fixed.inset-0');
  await a.click(a.page.getByRole('button', { name: '今すぐCSVで再連携' }), { before: 120, after: 500, steps: 3 });
  await a.click(modal.getByRole('button', { name: 'デモ用サンプルCSVを使う' }), { before: 120, after: 400, steps: 3 });
  await a.click(modal.getByRole('button', { name: '次へ（プレビュー）' }), { before: 120, after: 400, steps: 3 });
  await a.click(modal.getByRole('button', { name: '検証する' }), { before: 120, after: 400, steps: 3 });
  await modal.getByRole('button', { name: /行を取り込む/ }).waitFor({ state: 'visible', timeout: 10000 });
  await a.click(modal.getByRole('button', { name: /行を取り込む/ }), { before: 120, after: 500, steps: 3 });
  await a.click(modal.getByRole('button', { name: '閉じる' }), { before: 120, after: 400, steps: 3 });
  await a.click(a.page.locator('aside a[href="/notifications"]'), { before: 120, after: 500, steps: 3 });
  await a.wait(3000); // トーストが消えるのを待つ

  await a.moveTo(1400, 300, { steps: 4 });
  a.markStart();
  await a.wait(700);
  const today = a.page.locator('div[class*="rounded-[14px]"]')
    .filter({ has: a.page.locator('h3', { hasText: /^今日$/ }) }).first();
  await a.hover(today, { ry: 0.3 });
  await a.cue('アラート・承認依頼・データ異常は、Larkに自動配信されます', 5600);
  await a.zoom(today, 5000, { pad: 6 });
  await a.cue('先ほどの承認・CSV連携も「対応済み」として記録されています', 5000);

  // 通知ルールをトグル
  const rules = a.card('通知ルール');
  await a.hover(rules, { ry: 0.3 });
  await a.zoom(rules, 6800, { pad: 6 });
  await a.cueBg('配信ルールはノーコード — トグル1つで追加・変更', 6800);
  await a.wait(1200);
  await a.click(rules.locator('button[aria-pressed]').first(), { after: 700 });
  await a.wait(1600);

  // ナレッジ
  await a.click(a.page.locator('aside a[href="/knowledge"]'), { after: 1100 });
  const results = a.card('検索結果');
  await a.hover(results, { ry: 0.3 });
  await a.zoom(results, 5600, { pad: 6 });
  await a.cue('「600t 金型異常」の一次対応手順が、検索1回で出てきます', 5600);
  await a.cue('現場のノウハウが、会社の資産になります', 4400);
  await a.cue('単位や表示形式は、御社の業務に合わせてゼロから作ります（課題10）', 6000);
  await a.wait(400);
}

const CHAPTERS = { 1: ch1, 2: ch2, 3: ch3, 4: ch4, 5: ch5, 6: ch6, 7: ch7, 8: ch8 };

async function recordChapter(browser, num) {
  console.log(`--- 第${num}章 録画開始 ---`);
  const context = await browser.newContext({
    viewport: VIEW,
    deviceScaleFactor: 2,
    recordVideo: { dir: CLIPS, size: VIEW },
  });
  await context.addInitScript(INIT_SCRIPT);
  const page = await context.newPage();
  const rec = { anchor: Date.now(), events: [], contentStart: 0 };
  const api = makeApi(page, rec);
  let error = null;
  try {
    await CHAPTERS[num](api);
    await page.waitForTimeout(500);
  } catch (e) {
    error = e;
    console.error(`  [error] 第${num}章: ${e.message}`);
  }
  const wallMs = Date.now() - rec.anchor;
  const video = page.video();
  await context.close();
  if (error) throw error;
  const src = await video.path();
  const file = `ch${num}.webm`;
  fs.renameSync(src, path.join(CLIPS, file));
  const meta = { chapter: num, file, wallMs, contentStart: rec.contentStart, events: rec.events };
  console.log(`  完了: ${file} wall=${(wallMs / 1000).toFixed(1)}s content=${((wallMs - rec.contentStart) / 1000).toFixed(1)}s cues=${rec.events.filter((e) => e.type === 'cue').length}`);
  return meta;
}

async function main() {
  fs.mkdirSync(CLIPS, { recursive: true });
  const arg = process.argv[2];
  const nums = arg ? arg.split(',').map(Number) : [1, 2, 3, 4, 5, 6, 7, 8];

  const metaPath = path.join(CLIPS, 'meta.json');
  const all = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf8')) : {};

  const browser = await chromium.launch();
  try {
    for (const n of nums) {
      all[n] = await recordChapter(browser, n);
      fs.writeFileSync(metaPath, JSON.stringify(all, null, 2));
    }
  } finally {
    await browser.close();
  }
  const total = Object.values(all).reduce((s, m) => s + (m.wallMs - m.contentStart), 0);
  console.log(`\n全${Object.keys(all).length}章 合計コンテンツ尺: ${(total / 1000 / 60).toFixed(1)}分`);
}

main().catch((e) => { console.error(e); process.exit(1); });
