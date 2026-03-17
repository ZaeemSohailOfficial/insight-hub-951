import { useState } from 'react';
import { useAppState } from '@/store/AppContext';
import { TaskList, TaskItem } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Plus, Search, ChevronLeft, Edit, Trash2, CheckCircle2, ListTodo, Clock } from 'lucide-react';

export default function TaskPanel() {
  const { taskLists, addTaskList, updateTaskList, deleteTaskList } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [listName, setListName] = useState('');
  const [viewingList, setViewingList] = useState<TaskList | null>(null);
  const [editingList, setEditingList] = useState<TaskList | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddList = () => {
    if (!listName.trim()) return;
    const tl: TaskList = { id: crypto.randomUUID(), name: listName, tasks: [], createdAt: new Date().toISOString() };
    addTaskList(tl);
    setListName('');
    setAddOpen(false);
    setViewingList(tl);
  };

  const handleAddTask = () => {
    if (!viewingList || !newTaskText.trim()) return;
    const task: TaskItem = { id: crypto.randomUUID(), text: newTaskText, done: false };
    const updated = { ...viewingList, tasks: [...viewingList.tasks, task] };
    updateTaskList(updated);
    setViewingList(updated);
    setNewTaskText('');
  };

  const toggleTask = (taskId: string) => {
    if (!viewingList) return;
    const updated = { ...viewingList, tasks: viewingList.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) };
    updateTaskList(updated);
    setViewingList(updated);
  };

  const deleteTask = (taskId: string) => {
    if (!viewingList) return;
    const updated = { ...viewingList, tasks: viewingList.tasks.filter(t => t.id !== taskId) };
    updateTaskList(updated);
    setViewingList(updated);
  };

  const handleEditName = () => {
    if (!editingList || !listName.trim()) return;
    const updated = { ...editingList, name: listName };
    updateTaskList(updated);
    if (viewingList?.id === editingList.id) setViewingList(updated);
    setEditingList(null);
    setListName('');
  };

  const allDone = (tl: TaskList) => tl.tasks.length > 0 && tl.tasks.every(t => t.done);
  const doneCount = (tl: TaskList) => tl.tasks.filter(t => t.done).length;

  const filtered = taskLists.filter(tl => !searchQuery || tl.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (viewingList) {
    const list = taskLists.find(t => t.id === viewingList.id) || viewingList;
    const completed = allDone(list);
    return (
      <div className="animate-fade-in">
        <Button variant="ghost" onClick={() => setViewingList(null)} className="mb-4 gap-2"><ChevronLeft className="w-4 h-4" /> Back to Task Lists</Button>
        <div className={cn("card-gradient rounded-xl border-2 p-6 shadow-card", completed ? 'border-completed' : 'border-border')}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">{list.name}</h2>
              <p className="text-muted-foreground text-sm">{doneCount(list)}/{list.tasks.length} tasks completed</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditingList(list); setListName(list.name); }}><Edit className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => setDeleteId(list.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-secondary rounded-full h-2 mb-6">
            <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${list.tasks.length ? (doneCount(list) / list.tasks.length) * 100 : 0}%` }} />
          </div>

          {/* Add task */}
          <div className="flex gap-2 mb-4">
            <Input value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="Add a new task..." onKeyDown={e => e.key === 'Enter' && handleAddTask()} className="flex-1" />
            <Button onClick={handleAddTask} disabled={!newTaskText.trim()} className="gap-1"><Plus className="w-4 h-4" /> Add</Button>
          </div>

          {/* Task list */}
          <div className="space-y-2">
            {list.tasks.map(task => (
              <div key={task.id} className={cn("flex items-center gap-3 p-3 rounded-lg border transition-all", task.done ? 'bg-completed/5 border-completed/30' : 'bg-secondary border-border')}>
                <Checkbox checked={task.done} onCheckedChange={() => toggleTask(task.id)} />
                <span className={cn("flex-1 text-sm", task.done && "line-through text-muted-foreground")}>{task.text}</span>
                <button onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          {list.tasks.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <ListTodo className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No tasks yet. Add your first task above.</p>
            </div>
          )}
        </div>

        {/* Edit name dialog */}
        <Dialog open={!!editingList} onOpenChange={o => { if (!o) setEditingList(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="font-display">Edit Task List Name</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={listName} onChange={e => setListName(e.target.value)} /></div>
              <Button onClick={handleEditName} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Task List?</AlertDialogTitle><AlertDialogDescription>All tasks will be removed.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteTaskList(deleteId!); setDeleteId(null); setViewingList(null); }} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Task Panel</h1>
          <p className="text-muted-foreground mt-1">{taskLists.length} task lists</p>
        </div>
        <Button className="gap-2" onClick={() => { setListName(''); setAddOpen(true); }}><Plus className="w-4 h-4" /> Add Task List</Button>
      </div>

      <div className="relative max-w-xs mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search task lists..." className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(tl => {
          const completed = allDone(tl);
          return (
            <div key={tl.id} onClick={() => setViewingList(tl)}
              className={cn("card-gradient rounded-xl border-2 p-5 shadow-card cursor-pointer hover:shadow-elevated transition-all",
                completed ? 'border-completed' : 'border-border')}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display font-semibold text-foreground">{tl.name}</h3>
                {completed ? <CheckCircle2 className="w-5 h-5 text-completed" /> : <Clock className="w-5 h-5 text-muted-foreground" />}
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5 mb-2">
                <div className="bg-primary rounded-full h-1.5 transition-all" style={{ width: `${tl.tasks.length ? (doneCount(tl) / tl.tasks.length) * 100 : 0}%` }} />
              </div>
              <p className="text-sm text-muted-foreground">{doneCount(tl)}/{tl.tasks.length} tasks done</p>
              <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="sm" onClick={() => { setEditingList(tl); setListName(tl.name); }}><Edit className="w-3 h-3" /></Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(tl.id)} className="text-destructive"><Trash2 className="w-3 h-3" /></Button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg">No task lists found</p>
          <p className="text-sm">Create your first task list to get started</p>
        </div>
      )}

      {/* Add Task List Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Create Task List</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Task List Name</Label><Input value={listName} onChange={e => setListName(e.target.value)} placeholder="e.g. Week 1 Tasks" autoFocus /></div>
            <Button onClick={handleAddList} className="w-full" disabled={!listName.trim()}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit name dialog (from list view) */}
      <Dialog open={!!editingList} onOpenChange={o => { if (!o) setEditingList(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Edit Task List Name</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={listName} onChange={e => setListName(e.target.value)} /></div>
            <Button onClick={handleEditName} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Task List?</AlertDialogTitle><AlertDialogDescription>All tasks will be removed.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteTaskList(deleteId!); setDeleteId(null); }} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
