import DemoBar from '../components/DemoBar';
import CitizenReports from '../components/CitizenReports';
import AIReportVerification from '../components/AIReportVerification';

export default function ReportsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <DemoBar />
      <CitizenReports />
      <AIReportVerification />
    </div>
  );
}
