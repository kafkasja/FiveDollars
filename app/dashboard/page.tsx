import { Suspense } from 'react';
import Dashboard from '@/components/Dashboard';

function DashboardLoading() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0f13', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      Loading...
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <Dashboard />
    </Suspense>
  );
}
