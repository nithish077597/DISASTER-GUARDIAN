import LiveMap from './LiveMap';
import DemoBar from '../components/DemoBar';

export default function LiveMapPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <DemoBar />
      <LiveMap />
    </div>
  );
}
