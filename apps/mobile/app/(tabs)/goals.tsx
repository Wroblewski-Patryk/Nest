import { ModuleScreen } from '@/components/mvp/ModuleScreen';
import { goalsData } from '@/constants/mvpData';

export default function GoalsScreen() {
  return (
    <ModuleScreen
      title="Goals + Targets"
      subtitle="Track progress against measurable checkpoints."
      metrics={goalsData.metrics}
      rows={goalsData.rows}
    />
  );
}
