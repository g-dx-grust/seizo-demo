import { createContext, useCallback, useContext, useMemo, useRef, useState, ReactNode } from 'react';
import { K1088, notifyRuleDefs } from '../data/mock';

interface DemoContextValue {
  approved: boolean; // PO-2660 承認済みか（承認連動デモの中心state）
  approve: () => void;
  reset: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
  rules: Record<string, boolean>;
  toggleRule: (key: string) => void;
  imported: Record<string, boolean>; // CSV取込済みデータソース（key: DataSource.key）
  markImported: (key: string) => void;
}

const DemoContext = createContext<DemoContextValue>(null!);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [approved, setApproved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [rules, setRules] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(notifyRuleDefs.map((r) => [r.key, r.on])),
  );
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const approve = useCallback(() => {
    setApproved(true);
    showToast('承認しました。Larkで申請者へ通知されました');
  }, [showToast]);

  const [imported, setImported] = useState<Record<string, boolean>>({});
  const markImported = useCallback((key: string) => {
    setImported((prev) => ({ ...prev, [key]: true }));
  }, []);

  const reset = useCallback(() => {
    setApproved(false);
    setImported({});
    showToast('デモをリセットしました');
  }, [showToast]);

  const toggleRule = useCallback((key: string) => {
    setRules((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const value = useMemo(
    () => ({ approved, approve, reset, toast, showToast, rules, toggleRule, imported, markImported }),
    [approved, approve, reset, toast, showToast, rules, toggleRule, imported, markImported],
  );
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  return useContext(DemoContext);
}

// K-1088 の承認連動派生値。数値は state から計算で導出する
export function useK1088Live() {
  const { approved } = useDemo();
  return {
    approved,
    profitRate: approved ? K1088.rateApproved : K1088.rateNow,
    actualCost: approved ? K1088.actualCostApproved : K1088.actualCost,
    variance: approved ? K1088.varianceApproved : K1088.variance,
    poStatus: approved ? '発注済' : '承認待ち',
    pendingCount: approved ? 4 : 5,
  };
}
