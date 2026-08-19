import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DemoProvider } from './state/DemoContext';
import Shell from './components/Shell';
import MobileShell from './components/MobileShell';
import { GlobalHotkeys, ResetButton, Toast } from './components/Overlays';
import Dashboard from './pages/Dashboard';
import Profit from './pages/Profit';
import ProfitDetail from './pages/ProfitDetail';
import Customers from './pages/Customers';
import Machines from './pages/Machines';
import Production from './pages/Production';
import Quality from './pages/Quality';
import Molds from './pages/Molds';
import MoldGantt from './pages/MoldGantt';
import Notifications from './pages/Notifications';
import Knowledge from './pages/Knowledge';
import DataImport from './pages/DataImport';
import MApprovals from './pages/m/Approvals';
import MApprovalDetail from './pages/m/ApprovalDetail';
import MHome from './pages/m/Home';
import MScan from './pages/m/Scan';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <DemoProvider>
        <GlobalHotkeys />
        <Routes>
          <Route element={<Shell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profit" element={<Profit />} />
            <Route path="/profit/k-1088" element={<ProfitDetail />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/machines" element={<Machines />} />
            <Route path="/production" element={<Production />} />
            <Route path="/quality" element={<Quality />} />
            <Route path="/molds" element={<Molds />} />
            <Route path="/molds/k-1088" element={<MoldGantt />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/import" element={<DataImport />} />
          </Route>
          <Route element={<MobileShell />}>
            <Route path="/m/home" element={<MHome />} />
            <Route path="/m/approvals" element={<MApprovals />} />
            <Route path="/m/approvals/po-2660" element={<MApprovalDetail />} />
            <Route path="/m/scan" element={<MScan />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toast />
        <ResetButton />
      </DemoProvider>
    </BrowserRouter>
  );
}
