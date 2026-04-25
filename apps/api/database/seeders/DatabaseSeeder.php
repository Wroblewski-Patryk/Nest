<?php

namespace Database\Seeders;

use App\Models\Goal;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\Target;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            ReferenceDictionarySeeder::class,
        ]);

        $tenant = Tenant::query()->firstOrCreate(
            ['slug' => 'nest-personal-workspace'],
            [
                'name' => 'Nest Personal Workspace',
                'is_active' => true,
            ]
        );

        $adminUser = User::query()->firstOrCreate(
            [
                'tenant_id' => $tenant->id,
                'email' => 'admin@admin.com',
            ],
            [
                'name' => 'Admin User',
                'password' => 'password',
                'timezone' => 'UTC',
                'settings' => [],
            ]
        );

        $adminSettings = is_array($adminUser->settings) ? $adminUser->settings : [];
        $adminSettings['language'] = $adminSettings['language'] ?? 'pl';
        $adminSettings['locale'] = $adminSettings['locale'] ?? 'pl-PL';
        $adminSettings['onboarding_completed_at'] = $adminSettings['onboarding_completed_at'] ?? Carbon::now()->toIso8601String();

        $adminUser->forceFill([
            'name' => 'Admin User',
            'password' => 'password',
            'timezone' => 'UTC',
            'settings' => $adminSettings,
        ])->save();

        $lifeAreasByName = $this->seedLifeAreas($tenant, $adminUser);
        $this->seedPlanningDemoData($tenant, $adminUser, $lifeAreasByName);
    }

    /**
     * @return Collection<string, object>
     */
    private function seedLifeAreas(Tenant $tenant, User $adminUser): Collection
    {
        $templates = DB::table('life_area_templates')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $timestamp = now();

        foreach ($templates as $template) {
            $existingLifeArea = DB::table('life_areas')
                ->where('tenant_id', $tenant->id)
                ->where('name', $template->name)
                ->first();

            if ($existingLifeArea === null) {
                DB::table('life_areas')->insert([
                    'id' => (string) Str::uuid(),
                    'tenant_id' => $tenant->id,
                    'user_id' => $adminUser->id,
                    'name' => $template->name,
                    'color' => $template->color,
                    'weight' => $template->default_weight,
                    'is_archived' => false,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                    'deleted_at' => null,
                ]);

                continue;
            }

            DB::table('life_areas')
                ->where('id', $existingLifeArea->id)
                ->update([
                    'user_id' => $adminUser->id,
                    'color' => $template->color,
                    'weight' => $template->default_weight,
                    'is_archived' => false,
                    'updated_at' => $timestamp,
                    'deleted_at' => null,
                ]);
        }

        return DB::table('life_areas')
            ->where('tenant_id', $tenant->id)
            ->where('user_id', $adminUser->id)
            ->whereNull('deleted_at')
            ->get()
            ->keyBy(fn (object $lifeArea): string => mb_strtolower((string) $lifeArea->name));
    }

    /**
     * @param Collection<string, object> $lifeAreasByName
     */
    private function seedPlanningDemoData(Tenant $tenant, User $adminUser, Collection $lifeAreasByName): void
    {
        $careerLifeAreaId = $this->resolveLifeAreaId($lifeAreasByName, 'Career');
        $healthLifeAreaId = $this->resolveLifeAreaId($lifeAreasByName, 'Health');
        $financeLifeAreaId = $this->resolveLifeAreaId($lifeAreasByName, 'Finance');
        $relationshipsLifeAreaId = $this->resolveLifeAreaId($lifeAreasByName, 'Relationships');

        $planningGoal = $this->upsertGoal($tenant, $adminUser, [
            'title' => 'Spokojny system planowania tygodnia',
            'description' => 'Cel demo: uporzadkowany plan tygodnia bez chaosu i gaszenia pozarow.',
            'status' => 'active',
            'target_date' => Carbon::today()->addWeeks(8)->toDateString(),
            'life_area_id' => $careerLifeAreaId,
        ]);

        $energyGoal = $this->upsertGoal($tenant, $adminUser, [
            'title' => 'Wiecej energii i regularna regeneracja',
            'description' => 'Cel demo: stabilny sen, ruch i mniejszy spadek energii w ciagu dnia.',
            'status' => 'active',
            'target_date' => Carbon::today()->addWeeks(6)->toDateString(),
            'life_area_id' => $healthLifeAreaId,
        ]);

        $financeGoal = $this->upsertGoal($tenant, $adminUser, [
            'title' => 'Kontrola finansow domowych',
            'description' => 'Cel demo: przewidywalny budzet i regularny przeglad wydatkow.',
            'status' => 'active',
            'target_date' => Carbon::today()->addWeeks(10)->toDateString(),
            'life_area_id' => $financeLifeAreaId,
        ]);

        $planningTarget = $this->upsertTarget($tenant, $planningGoal, [
            'title' => '4 kolejne tygodnie z review tygodniowym',
            'metric_type' => 'count',
            'value_target' => 4,
            'value_current' => 1,
            'unit' => 'weeks',
            'due_date' => Carbon::today()->addWeeks(4)->toDateString(),
            'status' => 'active',
        ]);

        $priorityTarget = $this->upsertTarget($tenant, $planningGoal, [
            'title' => 'Codziennie max 5 priorytetow',
            'metric_type' => 'count',
            'value_target' => 5,
            'value_current' => 3,
            'unit' => 'tasks/day',
            'due_date' => Carbon::today()->addWeeks(2)->toDateString(),
            'status' => 'active',
        ]);

        $stepsTarget = $this->upsertTarget($tenant, $energyGoal, [
            'title' => 'Srednio 8k krokow dziennie',
            'metric_type' => 'count',
            'value_target' => 8000,
            'value_current' => 6200,
            'unit' => 'steps',
            'due_date' => Carbon::today()->addWeeks(3)->toDateString(),
            'status' => 'active',
        ]);

        $budgetTarget = $this->upsertTarget($tenant, $financeGoal, [
            'title' => 'Budzet tygodniowy dotrzymany 4/4 tygodnie',
            'metric_type' => 'count',
            'value_target' => 4,
            'value_current' => 1,
            'unit' => 'weeks',
            'due_date' => Carbon::today()->addWeeks(4)->toDateString(),
            'status' => 'active',
        ]);

        $todayList = $this->upsertTaskList($tenant, $adminUser, [
            'name' => 'Dzisiaj - najwazniejsze',
            'color' => '#789262',
            'position' => 10,
            'goal_id' => $planningGoal->id,
            'target_id' => $priorityTarget->id,
            'life_area_id' => $careerLifeAreaId,
        ]);

        $planningList = $this->upsertTaskList($tenant, $adminUser, [
            'name' => 'Plan tygodnia',
            'color' => '#4F8B7E',
            'position' => 20,
            'goal_id' => $planningGoal->id,
            'target_id' => $planningTarget->id,
            'life_area_id' => $careerLifeAreaId,
        ]);

        $healthList = $this->upsertTaskList($tenant, $adminUser, [
            'name' => 'Zdrowie i energia',
            'color' => '#3AA65A',
            'position' => 30,
            'goal_id' => $energyGoal->id,
            'target_id' => $stepsTarget->id,
            'life_area_id' => $healthLifeAreaId,
        ]);

        $financeList = $this->upsertTaskList($tenant, $adminUser, [
            'name' => 'Finanse domowe',
            'color' => '#D18A2C',
            'position' => 40,
            'goal_id' => $financeGoal->id,
            'target_id' => $budgetTarget->id,
            'life_area_id' => $financeLifeAreaId,
        ]);

        $backlogList = $this->upsertTaskList($tenant, $adminUser, [
            'name' => 'Backlog pomyslow',
            'color' => '#7A84A3',
            'position' => 50,
            'goal_id' => null,
            'target_id' => null,
            'life_area_id' => $relationshipsLifeAreaId,
        ]);

        $today = Carbon::today();

        $this->upsertSeedTask($tenant, $adminUser, [
            'source' => 'seed_demo:quick_capture',
            'list_id' => null,
            'life_area_id' => null,
            'title' => 'Szybki brain dump (10 min)',
            'description' => 'Zapisz wszystko co chodzi po glowie i dopiero potem pogrupuj.',
            'status' => 'todo',
            'priority' => 'medium',
            'due_date' => $today->toDateString(),
            'starts_at' => null,
            'sort_order' => 0,
        ]);

        $this->upsertSeedTask($tenant, $adminUser, [
            'source' => 'seed_demo:today_top1',
            'list_id' => $todayList->id,
            'life_area_id' => $careerLifeAreaId,
            'title' => 'Wybrac 3 priorytety na dzisiaj',
            'description' => 'Wybierz tylko najwazniejsze rzeczy. Reszta moze poczekac.',
            'status' => 'in_progress',
            'priority' => 'high',
            'due_date' => $today->toDateString(),
            'starts_at' => $today->copy()->setTime(8, 30)->toDateTimeString(),
            'sort_order' => 10,
        ]);

        $this->upsertSeedTask($tenant, $adminUser, [
            'source' => 'seed_demo:today_top2',
            'list_id' => $todayList->id,
            'life_area_id' => $careerLifeAreaId,
            'title' => 'Domknac jedno zalegle zadanie',
            'description' => 'Wybierz jedna zaleglosc, zamknij i odznacz jako done.',
            'status' => 'todo',
            'priority' => 'urgent',
            'due_date' => $today->copy()->addDay()->toDateString(),
            'starts_at' => null,
            'sort_order' => 20,
        ]);

        $this->upsertSeedTask($tenant, $adminUser, [
            'source' => 'seed_demo:weekly_review',
            'list_id' => $planningList->id,
            'life_area_id' => $careerLifeAreaId,
            'title' => 'Weekly review i plan na kolejny tydzien',
            'description' => 'Przeglad kalendarza, list i targetow. 30-40 minut.',
            'status' => 'todo',
            'priority' => 'high',
            'due_date' => $today->copy()->next('Sunday')->toDateString(),
            'starts_at' => null,
            'sort_order' => 30,
        ]);

        $this->upsertSeedTask($tenant, $adminUser, [
            'source' => 'seed_demo:energy_walk',
            'list_id' => $healthList->id,
            'life_area_id' => $healthLifeAreaId,
            'title' => '30 minut szybkiego spaceru',
            'description' => 'Cel: krok po kroku podbijac srednia aktywnosc.',
            'status' => 'todo',
            'priority' => 'medium',
            'due_date' => $today->copy()->addDay()->toDateString(),
            'starts_at' => null,
            'sort_order' => 40,
        ]);

        $this->upsertSeedTask($tenant, $adminUser, [
            'source' => 'seed_demo:sleep_log',
            'list_id' => $healthList->id,
            'life_area_id' => $healthLifeAreaId,
            'title' => 'Zapisac jakosc snu z ostatniej nocy',
            'description' => 'Krotka notatka: godzina snu, pobudki, energia rano.',
            'status' => 'done',
            'priority' => 'low',
            'due_date' => $today->copy()->subDay()->toDateString(),
            'starts_at' => null,
            'sort_order' => 50,
        ]);

        $this->upsertSeedTask($tenant, $adminUser, [
            'source' => 'seed_demo:budget_review',
            'list_id' => $financeList->id,
            'life_area_id' => $financeLifeAreaId,
            'title' => 'Przeglad wydatkow tygodniowych',
            'description' => 'Sprawdz 3 najwieksze kategorie i zaznacz odchylenia.',
            'status' => 'todo',
            'priority' => 'medium',
            'due_date' => $today->copy()->addDays(2)->toDateString(),
            'starts_at' => null,
            'sort_order' => 60,
        ]);

        $this->upsertSeedTask($tenant, $adminUser, [
            'source' => 'seed_demo:restaurant_idea',
            'list_id' => $backlogList->id,
            'life_area_id' => $relationshipsLifeAreaId,
            'title' => 'Spisac 3 restauracje na weekend',
            'description' => 'Przyklad listy lifestyle bez przypiecia do goal/target.',
            'status' => 'todo',
            'priority' => 'low',
            'due_date' => null,
            'starts_at' => null,
            'sort_order' => 70,
        ]);
    }

    /**
     * @param Collection<string, object> $lifeAreasByName
     */
    private function resolveLifeAreaId(Collection $lifeAreasByName, string $name): ?string
    {
        $lifeArea = $lifeAreasByName->get(mb_strtolower($name));

        if ($lifeArea === null || ! isset($lifeArea->id)) {
            return null;
        }

        return (string) $lifeArea->id;
    }

    /**
     * @param array{title:string,description:?string,status:string,target_date:?string,life_area_id:?string} $payload
     */
    private function upsertGoal(Tenant $tenant, User $adminUser, array $payload): Goal
    {
        $goal = Goal::withTrashed()->firstOrNew([
            'tenant_id' => $tenant->id,
            'user_id' => $adminUser->id,
            'title' => $payload['title'],
        ]);

        if ($goal->exists && $goal->trashed()) {
            $goal->restore();
        }

        $goal->fill([
            'life_area_id' => $payload['life_area_id'],
            'description' => $payload['description'],
            'status' => $payload['status'],
            'visibility' => 'private',
            'collaboration_space_id' => null,
            'target_date' => $payload['target_date'],
        ]);
        $goal->save();

        return $goal;
    }

    /**
     * @param array{title:string,metric_type:string,value_target:float|int,value_current:float|int,unit:?string,due_date:?string,status:string} $payload
     */
    private function upsertTarget(Tenant $tenant, Goal $goal, array $payload): Target
    {
        $target = Target::withTrashed()->firstOrNew([
            'tenant_id' => $tenant->id,
            'goal_id' => $goal->id,
            'title' => $payload['title'],
        ]);

        if ($target->exists && $target->trashed()) {
            $target->restore();
        }

        $target->fill([
            'metric_type' => $payload['metric_type'],
            'value_target' => $payload['value_target'],
            'value_current' => $payload['value_current'],
            'unit' => $payload['unit'],
            'due_date' => $payload['due_date'],
            'status' => $payload['status'],
        ]);
        $target->save();

        return $target;
    }

    /**
     * @param array{name:string,color:string,position:int,goal_id:?string,target_id:?string,life_area_id:?string} $payload
     */
    private function upsertTaskList(Tenant $tenant, User $adminUser, array $payload): TaskList
    {
        $list = TaskList::withTrashed()->firstOrNew([
            'tenant_id' => $tenant->id,
            'user_id' => $adminUser->id,
            'name' => $payload['name'],
        ]);

        if ($list->exists && $list->trashed()) {
            $list->restore();
        }

        $list->fill([
            'goal_id' => $payload['goal_id'],
            'target_id' => $payload['target_id'],
            'life_area_id' => $payload['life_area_id'],
            'color' => $payload['color'],
            'position' => $payload['position'],
            'is_archived' => false,
            'visibility' => 'private',
            'collaboration_space_id' => null,
        ]);
        $list->save();

        return $list;
    }

    /**
     * @param array{
     *   source:string,
     *   list_id:?string,
     *   life_area_id:?string,
     *   title:string,
     *   description:?string,
     *   status:string,
     *   priority:string,
     *   due_date:?string,
     *   starts_at:?string,
     *   sort_order:int
     * } $payload
     */
    private function upsertSeedTask(Tenant $tenant, User $adminUser, array $payload): Task
    {
        $task = Task::withTrashed()->firstOrNew([
            'tenant_id' => $tenant->id,
            'user_id' => $adminUser->id,
            'source' => $payload['source'],
        ]);

        if ($task->exists && $task->trashed()) {
            $task->restore();
        }

        $task->fill([
            'assignee_user_id' => $adminUser->id,
            'reminder_owner_user_id' => $adminUser->id,
            'list_id' => $payload['list_id'],
            'life_area_id' => $payload['life_area_id'],
            'title' => $payload['title'],
            'description' => $payload['description'],
            'status' => $payload['status'],
            'priority' => $payload['priority'],
            'due_date' => $payload['due_date'],
            'starts_at' => $payload['starts_at'],
            'completed_at' => $payload['status'] === 'done' ? Carbon::now()->subDay() : null,
            'sort_order' => $payload['sort_order'],
        ]);
        $task->save();

        return $task;
    }
}
