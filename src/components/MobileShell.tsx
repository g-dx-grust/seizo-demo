import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, ScanLine, ClipboardCheck, Bell, Monitor, Signal, Wifi, BatteryFull } from 'lucide-react';
import { useK1088Live } from '../state/DemoContext';

const tabs = [
  { to: '/m/home', label: 'ホーム', icon: Home },
  { to: '/m/scan', label: '実績入力', icon: ScanLine },
  { to: '/m/approvals', label: '承認', icon: ClipboardCheck, badge: true },
  { to: '/notifications', label: '通知', icon: Bell },
];

export default function MobileShell() {
  const { pendingCount } = useK1088Live();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center py-7">
      <div className="w-[410px] flex items-center justify-between mb-3 px-1">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-[12px] text-t2 hover:text-t1">
          <Monitor size={14} />
          デスクトップ版へ
        </Link>
        <span className="text-[10px] text-t3">※デモ用サンプルデータ</span>
      </div>

      {/* iPhone風ベゼル */}
      <div className="bg-[#111827] rounded-[40px] p-[10px] shadow-[0_24px_60px_rgba(15,23,42,0.28)]">
        <div className="w-[390px] h-[844px] bg-bg rounded-[28px] overflow-hidden flex flex-col">
          {/* ステータスバー */}
          <div className="h-11 shrink-0 bg-surface flex items-center justify-between px-6 text-[13px] font-bold text-t1">
            <span>9:41</span>
            <span className="flex items-center gap-1.5 text-t1">
              <Signal size={14} />
              <Wifi size={14} />
              <BatteryFull size={16} />
            </span>
          </div>

          {/* 画面本体 */}
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>

          {/* タブバー */}
          <div className="shrink-0 bg-surface border-t border-line">
            <div className="grid grid-cols-4 h-[60px]">
              {tabs.map(({ to, label, icon: Icon, badge }) => {
                const active = pathname === to || (to === '/m/approvals' && pathname.startsWith('/m/approvals'));
                return (
                  <NavLink
                    key={to}
                    to={to}
                    className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium ${
                      active ? 'text-blue' : 'text-t3'
                    }`}
                  >
                    <span className="relative">
                      <Icon size={20} />
                      {badge && (
                        <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-red text-white text-[9px] font-bold flex items-center justify-center">
                          {pendingCount}
                        </span>
                      )}
                    </span>
                    {label}
                  </NavLink>
                );
              })}
            </div>
            <div className="pb-2 pt-0.5">
              <div className="w-32 h-1 rounded-full bg-t1/80 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
