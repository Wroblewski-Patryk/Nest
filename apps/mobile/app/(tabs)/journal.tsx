import { ModuleScreen } from '@/components/mvp/ModuleScreen';
import { journalData } from '@/constants/mvpData';

export default function JournalScreen() {
  return (
    <ModuleScreen
      moduleKey={journalData.module}
      title="Journal + Life Areas"
      subtitle="Reflect daily and balance what matters most."
      state={journalData.state}
      telemetry={journalData.telemetry}
      metrics={journalData.metrics}
      rows={journalData.rows}
      intentProgress={0.62}
      quickActions={[
        { label: 'Szybki Wpis', variant: 'primary' },
        { label: 'Nastroje', variant: 'secondary' },
        { label: 'Wdzięczność', variant: 'secondary' },
      ]}
    />
  );
}
