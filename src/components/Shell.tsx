import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  CalendarCheck,
  Activity,
  Hammer,
  ShieldCheck,
  Bell,
  BookOpen,
  Search,
  Smartphone,
  DatabaseZap,
} from 'lucide-react';

const menu = [
  { to: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { to: '/profit', label: '案件別採算', icon: TrendingUp },
  { to: '/production', label: '生産計画・実績', icon: CalendarCheck },
  { to: '/machines', label: '設備モニタリング', icon: Activity },
  { to: '/molds', label: '金型工程管理', icon: Hammer },
  { to: '/quality', label: '品質・不良分析', icon: ShieldCheck },
  { to: '/notifications', label: '通知センター', icon: Bell },
  { to: '/knowledge', label: 'ナレッジ検索', icon: BookOpen },
  { to: '/import', label: 'データ取込', icon: DatabaseZap },
];

const titles: Record<string, { title: string; sub: string }> = {
  '/dashboard': { title: '経営サマリー', sub: '全社の採算・生産・設備の状況をひと目で' },
  '/profit': { title: '案件別採算一覧', sub: '進行中案件の見積原価と実際原価の差異' },
  '/profit/k-1088': { title: '案件採算詳細', sub: 'K-1088 リアブラケット順送型（三峰工業）' },
  '/customers': { title: '顧客別売上・利益', sub: '年度累計（百万円）' },
  '/machines': { title: '設備稼働モニタリング', sub: '12設備のリアルタイム稼働状況' },
  '/production': { title: '生産計画・実績', sub: '今週の計画達成状況（8/10週）' },
  '/quality': { title: '品質・不良分析', sub: '今月の不良状況と是正対策' },
  '/molds': { title: '金型工程カンバン', sub: '進行中12案件の工程ステータス' },
  '/molds/k-1088': { title: '金型案件ガント', sub: 'K-1088 リアブラケット順送型（三峰工業）' },
  '/notifications': { title: '通知センター', sub: 'アラート・承認依頼・リマインド' },
  '/knowledge': { title: 'ナレッジ検索', sub: '作業標準・金型ノウハウ・改善事例' },
  '/import': { title: 'データ取込・連携', sub: 'JupiterX・生産C00・Excel帳票からのCSV取込' },
};

export default function Shell() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const t = titles[pathname] ?? titles['/dashboard'];

  return (
    <div className="flex min-h-screen bg-bg min-w-[1440px]">
      {/* サイドバー */}
      <aside className="w-[232px] shrink-0 bg-navy flex flex-col">
        <div className="flex items-center gap-3 px-5 pt-6 pb-2">
          <div className="w-9 h-9 rounded-[10px] bg-blue text-white font-black flex items-center justify-center text-[17px]">
            工
          </div>
          <div>
            <div className="text-white text-[13px] font-bold leading-tight">工場コックピット</div>
            <div className="text-side-dim text-[10px] mt-0.5">Powered by Lark</div>
          </div>
        </div>
        <div className="mx-5 mb-4 mt-1 px-2.5 py-1.5 rounded-[8px] bg-navy2 text-side text-[10px] font-medium">
          一志精工電機株式会社
        </div>
        <nav className="px-3 mt-1 flex flex-col gap-1">
          {menu.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 h-10 rounded-[10px] text-[13px] transition-colors ${
                  isActive ? 'bg-blue text-white font-medium' : 'text-side hover:bg-navy2 hover:text-white'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto px-5 py-4 border-t border-navy2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-navy2 text-white text-[12px] font-bold flex items-center justify-center">
              田
            </div>
            <div>
              <div className="text-white text-[12px] font-medium">田中 一郎</div>
              <div className="text-side-dim text-[10px]">製造部長</div>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-side-dim">※デモ用サンプルデータ</div>
        </div>
      </aside>

      {/* メイン */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-surface border-b border-line flex items-center justify-between px-7 sticky top-0 z-30">
          <div>
            <div className="text-[16px] font-bold text-t1 leading-tight">{t.title}</div>
            <div className="text-[11px] text-t3 mt-0.5">{t.sub}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" />
              <input
                className="w-[230px] h-9 rounded-[10px] bg-bg border border-line pl-8 pr-3 text-[12px] placeholder:text-t3 outline-none focus:border-blue"
                placeholder="案件・設備・品番を検索"
              />
            </div>
            <Link
              to="/m/home"
              className="h-9 px-3 rounded-[10px] border border-line flex items-center gap-1.5 text-[12px] text-t2 hover:bg-bg"
            >
              <Smartphone size={14} />
              モバイル
            </Link>
            <button
              onClick={() => nav('/notifications')}
              className="relative w-9 h-9 rounded-[10px] border border-line flex items-center justify-center text-t2 hover:bg-bg"
              aria-label="通知センター"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red rounded-full ring-2 ring-white" />
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-l text-blue text-[12px] font-bold flex items-center justify-center">
              田
            </div>
          </div>
        </header>
        <main className="p-7 flex flex-col gap-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
