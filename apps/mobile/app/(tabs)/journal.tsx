import { ModuleScreen } from '@/components/mvp/ModuleScreen';
import { journalData } from '@/constants/mvpData';

export default function JournalScreen() {
  return (
    <ModuleScreen
      title="Journal + Life Areas"
      subtitle="Reflect daily and balance what matters most."
      state={journalData.state}
      telemetry={journalData.telemetry}
      metrics={journalData.metrics}
      rows={journalData.rows}
    />
  );
}
