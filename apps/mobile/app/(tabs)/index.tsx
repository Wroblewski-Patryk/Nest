import { ModuleScreen } from '@/components/mvp/ModuleScreen';
import { tasksData } from '@/constants/mvpData';

export default function TasksScreen() {
  return (
    <ModuleScreen
      title="Tasks + Lists"
      subtitle="Capture commitments and execute daily priorities."
      metrics={tasksData.metrics}
      rows={tasksData.rows}
    />
  );
}
