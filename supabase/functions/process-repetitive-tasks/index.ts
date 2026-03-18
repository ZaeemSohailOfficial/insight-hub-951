import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all current phases
    const { data: currentPhases } = await supabase
      .from('task_phases')
      .select('*')
      .eq('is_current', true);

    if (!currentPhases || currentPhases.length === 0) {
      return new Response(JSON.stringify({ message: 'No current phases found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    let phasesCreated = 0;

    for (const phase of currentPhases) {
      // Get repetitive tasks in this phase
      const { data: repetitiveTasks } = await supabase
        .from('task_items')
        .select('*')
        .eq('phase_id', phase.id)
        .eq('task_type', 'repetitive');

      if (!repetitiveTasks || repetitiveTasks.length === 0) continue;

      // Check if any repetitive task is due for a new phase
      const phaseCreatedAt = new Date(phase.created_at);
      let shouldCreateNewPhase = false;

      for (const task of repetitiveTasks) {
        const intervalDays = getIntervalDays(task.repeat_interval, task.custom_interval_days);
        if (intervalDays <= 0) continue;

        const nextDue = new Date(phaseCreatedAt.getTime() + intervalDays * 24 * 60 * 60 * 1000);
        if (now >= nextDue) {
          shouldCreateNewPhase = true;
          break;
        }
      }

      if (!shouldCreateNewPhase) continue;

      // Create new phase
      const newPhaseNumber = phase.phase_number + 1;
      const newPhaseId = crypto.randomUUID();

      // Mark current phase as not current
      await supabase.from('task_phases').update({ is_current: false }).eq('id', phase.id);

      // Insert new phase
      await supabase.from('task_phases').insert({
        id: newPhaseId,
        task_list_id: phase.task_list_id,
        name: `Phase ${newPhaseNumber} (Auto)`,
        phase_number: newPhaseNumber,
        is_current: true,
      });

      // Copy repetitive tasks to new phase as undone
      const newTasks = repetitiveTasks.map(task => ({
        id: crypto.randomUUID(),
        task_list_id: phase.task_list_id,
        phase_id: newPhaseId,
        text: task.text,
        done: false,
        task_type: 'repetitive',
        repeat_interval: task.repeat_interval,
        custom_interval_days: task.custom_interval_days,
      }));

      if (newTasks.length > 0) {
        await supabase.from('task_items').insert(newTasks);
      }

      phasesCreated++;
    }

    return new Response(JSON.stringify({ message: `Created ${phasesCreated} new phases` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in process-repetitive-tasks:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getIntervalDays(interval: string | null, customDays: number | null): number {
  switch (interval) {
    case 'daily': return 1;
    case 'alternative_days': return 2;
    case 'weekly': return 7;
    case 'monthly': return 30;
    case 'alternative_months': return 60;
    case 'custom': return customDays || 1;
    default: return 0;
  }
}
