import { ModuleScreen } from '@/components/mvp/ModuleScreen';
import { habitsData } from '@/constants/mvpData';

export default function HabitsScreen() {
  return (
    <ModuleScreen
      moduleKey={habitsData.module}
      title="Habits + Routines"
      subtitle="Keep consistency visible with routine-driven momentum."
      state={habitsData.state}
      telemetry={habitsData.telemetry}
      metrics={habitsData.metrics}
      rows={habitsData.rows}
      intentProgress={0.68}
    />
  );
}
