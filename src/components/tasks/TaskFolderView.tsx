import { TaskFolder, TaskList, TaskCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Edit, Trash2, FolderOpen, Plus, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  folder: TaskFolder;
  lists: TaskList[];
  categories: TaskCategory[];
  onViewList: (list: TaskList) => void;
  onAddList: () => void;
  onEditList: (list: TaskList) => void;
  onDeleteList: (id: string) => void;
  onDeleteFolder: () => void;
}

export default function TaskFolderView({ folder, lists, categories, onViewList, onAddList, onEditList, onDeleteList, onDeleteFolder }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">{folder.name}</h2>
            <p className="text-muted-foreground text-sm">{lists.length} task lists</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onAddList} className="gap-1"><Plus className="w-4 h-4" /> Add Task List</Button>
          <Button variant="outline" size="sm" onClick={onDeleteFolder} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map(tl => {
          const totalTasks = tl.tasks.length;
          const doneTasks = tl.tasks.filter(t => t.done).length;
          const completed = totalTasks > 0 && doneTasks === totalTasks;
          const cat = categories.find(c => c.id === tl.categoryId);
          return (
            <div key={tl.id} onClick={() => onViewList(tl)}
              className={cn("card-gradient rounded-xl border-2 p-5 shadow-card cursor-pointer hover:shadow-elevated transition-all",
                completed ? 'border-completed' : 'border-border')}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display font-semibold text-foreground">{tl.name}</h3>
                <div className="flex items-center gap-2">
                  {cat && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{cat.name}</span>}
                  {completed ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5 mb-2">
                <div className="bg-primary rounded-full h-1.5 transition-all" style={{ width: `${totalTasks ? (doneTasks / totalTasks) * 100 : 0}%` }} />
              </div>
              <p className="text-sm text-muted-foreground">{doneTasks}/{totalTasks} tasks · {tl.phases.length} phases</p>
              <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="sm" onClick={() => onEditList(tl)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => onDeleteList(tl.id)} className="text-destructive">Delete</Button>
              </div>
            </div>
          );
        })}
      </div>

      {lists.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No task lists in this folder yet</p>
        </div>
      )}
    </div>
  );
}
