import { ModuleScreen } from '@/components/mvp/ModuleScreen';
import { calendarData } from '@/constants/mvpData';

export default function CalendarScreen() {
  return (
    <ModuleScreen
      title="Calendar"
      subtitle="Plan events linked to tasks, goals, and routines."
      metrics={calendarData.metrics}
      rows={calendarData.rows}
    />
  );
}
