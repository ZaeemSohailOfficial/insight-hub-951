import { useState } from 'react';
import { useAppState } from '@/store/AppContext';
import { TaskList, TaskPhase, TaskItem, RepeatInterval } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Plus, Edit, Trash2, CheckCircle2, ListTodo, Clock, Repeat, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  list: TaskList;
  onBack: () => void;
}

export default function TaskListDetail({ list, onBack }: Props) {
  const { addTaskPhase, updateTaskPhase, deleteTaskPhase, addTaskItem, updateTaskItem, deleteTaskItem, updateTaskList } = useAppState();

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskType, setNewTaskType] = useState<'single' | 'repetitive'>('single');
  const [newRepeatInterval, setNewRepeatInterval] = useState<RepeatInterval>('daily');
  const [newCustomDays, setNewCustomDays] = useState(1);
  const [addPhaseOpen, setAddPhaseOpen] = useState(false);
  const [phaseName, setPhaseName] = useState('');
  const [editPhaseOpen, setEditPhaseOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<TaskPhase | null>(null);
  const [deletePhaseId, setDeletePhaseId] = useState<string | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<{ itemId: string; phaseId: string } | null>(null);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<{ item: TaskItem; phaseId: string } | null>(null);
  const [editTaskText, setEditTaskText] = useState('');
  const [editTaskType, setEditTaskType] = useState<'single' | 'repetitive'>('single');
  const [editRepeatInterval, setEditRepeatInterval] = useState<RepeatInterval>('daily');
  const [editCustomDays, setEditCustomDays] = useState(1);
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());
  const [editListNameOpen, setEditListNameOpen] = useState(false);
  const [editListName, setEditListName] = useState(list.name);

  const currentPhase = list.phases.find(p => p.isCurrent);
  const pastPhases = list.phases.filter(p => !p.isCurrent).sort((a, b) => b.phaseNumber - a.phaseNumber);

  const handleAddPhase = async () => {
    if (!phaseName.trim()) return;
    const newPhaseNumber = list.phases.length > 0 ? Math.max(...list.phases.map(p => p.phaseNumber)) + 1 : 1;
    const phase: TaskPhase = {
      id: crypto.randomUUID(),
      taskListId: list.id,
      name: phaseName,
      phaseNumber: newPhaseNumber,
      isCurrent: true,
      createdAt: new Date().toISOString(),
      tasks: [],
    };
    await addTaskPhase(phase);
    setPhaseName('');
    setAddPhaseOpen(false);
  };

  const handleEditPhase = async () => {
    if (!editingPhase || !phaseName.trim()) return;
    await updateTaskPhase({ ...editingPhase, name: phaseName });
    setEditingPhase(null);
    setEditPhaseOpen(false);
    setPhaseName('');
  };

  const handleAddTask = async (phaseId: string) => {
    if (!newTaskText.trim()) return;
    const item: TaskItem = {
      id: crypto.randomUUID(),
      text: newTaskText,
      done: false,
      phaseId,
      taskType: newTaskType,
      repeatInterval: newTaskType === 'repetitive' ? newRepeatInterval : undefined,
      customIntervalDays: newTaskType === 'repetitive' && newRepeatInterval === 'custom' ? newCustomDays : undefined,
    };
    await addTaskItem(item, phaseId, list.id);
    setNewTaskText('');
    setNewTaskType('single');
  };

  const handleToggleTask = async (item: TaskItem, phaseId: string) => {
    await updateTaskItem({ ...item, done: !item.done }, phaseId, list.id);
  };

  const handleEditTask = async () => {
    if (!editingTask || !editTaskText.trim()) return;
    await updateTaskItem({
      ...editingTask.item,
      text: editTaskText,
      taskType: editTaskType,
      repeatInterval: editTaskType === 'repetitive' ? editRepeatInterval : undefined,
      customIntervalDays: editTaskType === 'repetitive' && editRepeatInterval === 'custom' ? editCustomDays : undefined,
    }, editingTask.phaseId, list.id);
    setEditTaskOpen(false);
    setEditingTask(null);
  };

  const openEditTask = (item: TaskItem, phaseId: string) => {
    setEditingTask({ item, phaseId });
    setEditTaskText(item.text);
    setEditTaskType(item.taskType);
    setEditRepeatInterval(item.repeatInterval || 'daily');
    setEditCustomDays(item.customIntervalDays || 1);
    setEditTaskOpen(true);
  };

  const togglePhaseCollapse = (phaseId: string) => {
    setCollapsedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  const handleEditListName = async () => {
    if (!editListName.trim()) return;
    await updateTaskList({ ...list, name: editListName });
    setEditListNameOpen(false);
  };

  const renderRepeatIntervalLabel = (interval?: RepeatInterval, customDays?: number) => {
    if (!interval) return '';
    const labels: Record<RepeatInterval, string> = {
      daily: 'Daily',
      alternative_days: 'Every other day',
      weekly: 'Weekly',
      monthly: 'Monthly',
      alternative_months: 'Every other month',
      custom: `Every ${customDays || 1} days`,
    };
    return labels[interval];
  };

  const renderPhaseSection = (phase: TaskPhase, isCurrentPhase: boolean) => {
    const singleTasks = phase.tasks.filter(t => t.taskType === 'single');
    const repetitiveTasks = phase.tasks.filter(t => t.taskType === 'repetitive');
    const isCollapsed = collapsedPhases.has(phase.id);
    const doneSingle = singleTasks.filter(t => t.done).length;
    const doneRepetitive = repetitiveTasks.filter(t => t.done).length;

    return (
      <div key={phase.id} className={cn("rounded-xl border-2 p-5 shadow-card mb-4",
        isCurrentPhase ? 'card-gradient border-primary/50' : 'bg-secondary/50 border-border')}>
        {/* Phase header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => togglePhaseCollapse(phase.id)}>
            {isCollapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
            <h3 className="font-display font-semibold text-foreground">
              {phase.name}
              {!isCurrentPhase && <span className="text-xs text-muted-foreground ml-2">(Past)</span>}
            </h3>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => { setEditingPhase(phase); setPhaseName(phase.name); setEditPhaseOpen(true); }}>
              <Edit className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeletePhaseId(phase.id)} className="text-destructive">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {!isCollapsed && (
          <>
            {/* Add task - only for current phase */}
            {isCurrentPhase && (
              <div className="space-y-3 mb-4 p-3 rounded-lg bg-background/50 border border-border">
                <div className="flex gap-2">
                  <Input value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="Add a new task..."
                    onKeyDown={e => e.key === 'Enter' && handleAddTask(phase.id)} className="flex-1" />
                  <Button onClick={() => handleAddTask(phase.id)} disabled={!newTaskText.trim()} size="sm"><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="flex gap-3 items-center flex-wrap">
                  <Label className="text-xs">Type:</Label>
                  <Select value={newTaskType} onValueChange={v => setNewTaskType(v as any)}>
                    <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single time</SelectItem>
                      <SelectItem value="repetitive">Repetitive</SelectItem>
                    </SelectContent>
                  </Select>
                  {newTaskType === 'repetitive' && (
                    <>
                      <Select value={newRepeatInterval} onValueChange={v => setNewRepeatInterval(v as RepeatInterval)}>
                        <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="alternative_days">Alternative days</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="alternative_months">Alternative months</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      {newRepeatInterval === 'custom' && (
                        <div className="flex items-center gap-1">
                          <Input type="number" value={newCustomDays} onChange={e => setNewCustomDays(Number(e.target.value))}
                            className="w-16 h-8 text-xs" min={1} />
                          <span className="text-xs text-muted-foreground">days</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Single tasks column */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ListTodo className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">Single Tasks ({doneSingle}/{singleTasks.length})</h4>
                </div>
                <div className="space-y-1.5">
                  {singleTasks.map(task => (
                    <div key={task.id} className={cn("flex items-center gap-2 p-2.5 rounded-lg border transition-all",
                      task.done ? 'bg-success/5 border-success/30' : 'bg-background border-border')}>
                      <Checkbox checked={task.done} onCheckedChange={() => handleToggleTask(task, phase.id)} />
                      <span className={cn("flex-1 text-sm", task.done && "line-through text-muted-foreground")}>{task.text}</span>
                      <button onClick={() => openEditTask(task, phase.id)} className="text-muted-foreground hover:text-foreground"><Edit className="w-3 h-3" /></button>
                      <button onClick={() => setDeleteTaskId({ itemId: task.id, phaseId: phase.id })} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {singleTasks.length === 0 && <p className="text-xs text-muted-foreground py-3 text-center">No single tasks</p>}
                </div>
              </div>

              {/* Repetitive tasks column */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Repeat className="w-4 h-4 text-accent" />
                  <h4 className="text-sm font-semibold text-foreground">Repetitive Tasks ({doneRepetitive}/{repetitiveTasks.length})</h4>
                </div>
                <div className="space-y-1.5">
                  {repetitiveTasks.map(task => (
                    <div key={task.id} className={cn("flex items-center gap-2 p-2.5 rounded-lg border transition-all",
                      task.done ? 'bg-success/5 border-success/30' : 'bg-background border-border')}>
                      <Checkbox checked={task.done} onCheckedChange={() => handleToggleTask(task, phase.id)} />
                      <div className="flex-1">
                        <span className={cn("text-sm", task.done && "line-through text-muted-foreground")}>{task.text}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <RotateCcw className="w-3 h-3 text-accent" />
                          <span className="text-xs text-accent">{renderRepeatIntervalLabel(task.repeatInterval, task.customIntervalDays)}</span>
                        </div>
                      </div>
                      <button onClick={() => openEditTask(task, phase.id)} className="text-muted-foreground hover:text-foreground"><Edit className="w-3 h-3" /></button>
                      <button onClick={() => setDeleteTaskId({ itemId: task.id, phaseId: phase.id })} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {repetitiveTasks.length === 0 && <p className="text-xs text-muted-foreground py-3 text-center">No repetitive tasks</p>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const totalTasks = list.tasks.length;
  const doneTasks = list.tasks.filter(t => t.done).length;

  return (
    <div>
      {/* Header */}
      <div className="card-gradient rounded-xl border-2 border-border p-6 shadow-card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">{list.name}</h2>
            <p className="text-muted-foreground text-sm">{doneTasks}/{totalTasks} tasks completed · {list.phases.length} phases</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setEditListName(list.name); setEditListNameOpen(true); }}><Edit className="w-4 h-4" /></Button>
            <Button onClick={() => { setPhaseName(`Phase ${list.phases.length + 1}`); setAddPhaseOpen(true); }} size="sm" className="gap-1">
              <Plus className="w-4 h-4" /> New Phase
            </Button>
          </div>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${totalTasks ? (doneTasks / totalTasks) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Current phase */}
      {currentPhase && renderPhaseSection(currentPhase, true)}

      {/* Past phases */}
      {pastPhases.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-display font-semibold text-muted-foreground mb-3">Past Phases</h3>
          {pastPhases.map(phase => renderPhaseSection(phase, false))}
        </div>
      )}

      {list.phases.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <ListTodo className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No phases yet. Create your first phase to start adding tasks.</p>
        </div>
      )}

      {/* Add Phase Dialog */}
      <Dialog open={addPhaseOpen} onOpenChange={setAddPhaseOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Create New Phase</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Phase Name</Label><Input value={phaseName} onChange={e => setPhaseName(e.target.value)} placeholder="e.g. Phase 2 - March" autoFocus /></div>
            <Button onClick={handleAddPhase} className="w-full" disabled={!phaseName.trim()}>Create Phase</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Phase Dialog */}
      <Dialog open={editPhaseOpen} onOpenChange={o => { if (!o) { setEditPhaseOpen(false); setEditingPhase(null); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Edit Phase</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Phase Name</Label><Input value={phaseName} onChange={e => setPhaseName(e.target.value)} /></div>
            <Button onClick={handleEditPhase} className="w-full" disabled={!phaseName.trim()}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit List Name Dialog */}
      <Dialog open={editListNameOpen} onOpenChange={setEditListNameOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Edit Task List Name</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={editListName} onChange={e => setEditListName(e.target.value)} /></div>
            <Button onClick={handleEditListName} className="w-full" disabled={!editListName.trim()}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editTaskOpen} onOpenChange={o => { if (!o) { setEditTaskOpen(false); setEditingTask(null); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Edit Task</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Task Text</Label><Input value={editTaskText} onChange={e => setEditTaskText(e.target.value)} /></div>
            <div><Label>Type</Label>
              <Select value={editTaskType} onValueChange={v => setEditTaskType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single time</SelectItem>
                  <SelectItem value="repetitive">Repetitive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editTaskType === 'repetitive' && (
              <>
                <div><Label>Repeat Interval</Label>
                  <Select value={editRepeatInterval} onValueChange={v => setEditRepeatInterval(v as RepeatInterval)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="alternative_days">Alternative days</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="alternative_months">Alternative months</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editRepeatInterval === 'custom' && (
                  <div><Label>Custom Days</Label><Input type="number" value={editCustomDays} onChange={e => setEditCustomDays(Number(e.target.value))} min={1} /></div>
                )}
              </>
            )}
            <Button onClick={handleEditTask} className="w-full" disabled={!editTaskText.trim()}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Phase Dialog */}
      <AlertDialog open={!!deletePhaseId} onOpenChange={o => !o && setDeletePhaseId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Phase?</AlertDialogTitle><AlertDialogDescription>All tasks in this phase will be removed.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={async () => { await deleteTaskPhase(deletePhaseId!); setDeletePhaseId(null); }} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Task Dialog */}
      <AlertDialog open={!!deleteTaskId} onOpenChange={o => !o && setDeleteTaskId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Task?</AlertDialogTitle><AlertDialogDescription>This task will be permanently removed.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={async () => { if (deleteTaskId) await deleteTaskItem(deleteTaskId.itemId, deleteTaskId.phaseId, list.id); setDeleteTaskId(null); }} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
