import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { KeyMetrics } from '@/components/dashboard/key-metrics';
import Header from '@/components/shared/header';
import { getRFPs } from '@/lib/data';

function DashboardPageContent({ initialRfps }: { initialRfps: any[] }) {
  return (
    <div className="p-4 md:p-8 space-y-8">
      <KeyMetrics />
      <DashboardClient initialRfps={initialRfps} />
    </div>
  );
}


export default async function DashboardPage() {
  const initialRfps = await getRFPs();

  return (
    <>
      <Header />
      <DashboardPageContent initialRfps={initialRfps} />
    </>
  );
}
