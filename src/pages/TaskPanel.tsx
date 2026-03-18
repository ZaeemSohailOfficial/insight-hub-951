import { useState } from 'react';
import { useAppState } from '@/store/AppContext';
import { TaskFolder, TaskCategory, TaskList } from '@/types';
import TaskFolderView from '@/components/tasks/TaskFolderView';
import TaskListDetail from '@/components/tasks/TaskListDetail';
import TaskFolderManager from '@/components/tasks/TaskFolderManager';
import TaskCategoryManager from '@/components/tasks/TaskCategoryManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Plus, Search, ChevronLeft, FolderOpen, Tag, Settings, Filter } from 'lucide-react';

export default function TaskPanel() {
  const { taskLists, taskFolders, taskCategories, addTaskList, addTaskFolder, deleteTaskList, deleteTaskFolder, updateTaskList } = useAppState();

  const [viewingList, setViewingList] = useState<TaskList | null>(null);
  const [viewingFolderId, setViewingFolderId] = useState<string | null>(null);
  const [addListOpen, setAddListOpen] = useState(false);
  const [addListFolderId, setAddListFolderId] = useState<string | undefined>(undefined);
  const [listName, setListName] = useState('');
  const [listCategoryId, setListCategoryId] = useState<string | undefined>(undefined);
  const [listPosition, setListPosition] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editListOpen, setEditListOpen] = useState(false);
  const [editingList, setEditingList] = useState<TaskList | null>(null);

  // Navigate into a task list detail
  if (viewingList) {
    const list = taskLists.find(t => t.id === viewingList.id) || viewingList;
    return (
      <div className="animate-fade-in">
        <Button variant="ghost" onClick={() => setViewingList(null)} className="mb-4 gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <TaskListDetail list={list} onBack={() => setViewingList(null)} />
      </div>
    );
  }

  const handleAddList = async () => {
    if (!listName.trim()) return;
    const initialPhaseId = crypto.randomUUID();
    const tl: TaskList = {
      id: crypto.randomUUID(),
      name: listName,
      folderId: addListFolderId,
      categoryId: listCategoryId,
      position: listPosition,
      phases: [{
        id: initialPhaseId,
        taskListId: '',
        name: 'Phase 1',
        phaseNumber: 1,
        isCurrent: true,
        createdAt: new Date().toISOString(),
        tasks: [],
      }],
      tasks: [],
      createdAt: new Date().toISOString(),
    };
    tl.phases[0].taskListId = tl.id;
    await addTaskList(tl);
    setListName('');
    setListCategoryId(undefined);
    setListPosition(0);
    setAddListOpen(false);
    setViewingList(tl);
  };

  const handleEditList = async () => {
    if (!editingList || !listName.trim()) return;
    const updated = {
      ...editingList,
      name: listName,
      categoryId: listCategoryId,
      position: listPosition,
      folderId: addListFolderId,
    };
    await updateTaskList(updated);
    setEditingList(null);
    setEditListOpen(false);
    setListName('');
  };

  const openAddList = (folderId?: string) => {
    setAddListFolderId(folderId);
    setListName('');
    setListCategoryId(undefined);
    setListPosition(0);
    setAddListOpen(true);
  };

  const openEditList = (list: TaskList) => {
    setEditingList(list);
    setListName(list.name);
    setListCategoryId(list.categoryId);
    setListPosition(list.position);
    setAddListFolderId(list.folderId);
    setEditListOpen(true);
  };

  // Filter logic
  const filteredLists = taskLists.filter(tl => {
    if (searchQuery && !tl.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterCategoryId !== 'all' && tl.categoryId !== filterCategoryId) return false;
    return true;
  });

  // Group by folder
  const unfoldered = filteredLists.filter(tl => !tl.folderId).sort((a, b) => a.position - b.position);
  const sortedFolders = [...taskFolders].sort((a, b) => a.position - b.position);

  // Viewing a specific folder
  if (viewingFolderId) {
    const folder = taskFolders.find(f => f.id === viewingFolderId);
    if (!folder) { setViewingFolderId(null); return null; }
    const folderLists = filteredLists.filter(tl => tl.folderId === folder.id).sort((a, b) => a.position - b.position);
    return (
      <div className="animate-fade-in">
        <Button variant="ghost" onClick={() => setViewingFolderId(null)} className="mb-4 gap-2">
          <ChevronLeft className="w-4 h-4" /> Back to Task Panel
        </Button>
        <TaskFolderView
          folder={folder}
          lists={folderLists}
          categories={taskCategories}
          onViewList={setViewingList}
          onAddList={() => openAddList(folder.id)}
          onEditList={openEditList}
          onDeleteList={setDeleteId}
          onDeleteFolder={() => setDeleteFolderId(folder.id)}
        />
        {/* Delete list dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Task List?</AlertDialogTitle><AlertDialogDescription>All phases and tasks will be removed.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={async () => { await deleteTaskList(deleteId!); setDeleteId(null); }} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* Delete folder dialog */}
        <AlertDialog open={!!deleteFolderId} onOpenChange={o => !o && setDeleteFolderId(null)}>
          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Folder?</AlertDialogTitle><AlertDialogDescription>Task lists will be moved to unfiled.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={async () => { await deleteTaskFolder(deleteFolderId!); setDeleteFolderId(null); setViewingFolderId(null); }} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* Add list dialog */}
        {renderAddListDialog()}
        {renderEditListDialog()}
      </div>
    );
  }

  function renderAddListDialog() {
    return (
      <Dialog open={addListOpen} onOpenChange={setAddListOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Create Task List</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={listName} onChange={e => setListName(e.target.value)} placeholder="e.g. ABC Client Tasks" autoFocus /></div>
            <div><Label>Category</Label>
              <Select value={listCategoryId || 'none'} onValueChange={v => setListCategoryId(v === 'none' ? undefined : v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {taskCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Folder</Label>
              <Select value={addListFolderId || 'none'} onValueChange={v => setAddListFolderId(v === 'none' ? undefined : v)}>
                <SelectTrigger><SelectValue placeholder="Select folder" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Folder</SelectItem>
                  {taskFolders.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Position</Label><Input type="number" value={listPosition} onChange={e => setListPosition(Number(e.target.value))} min={0} /></div>
            <Button onClick={handleAddList} className="w-full" disabled={!listName.trim()}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  function renderEditListDialog() {
    return (
      <Dialog open={editListOpen} onOpenChange={o => { if (!o) { setEditListOpen(false); setEditingList(null); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Edit Task List</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={listName} onChange={e => setListName(e.target.value)} /></div>
            <div><Label>Category</Label>
              <Select value={listCategoryId || 'none'} onValueChange={v => setListCategoryId(v === 'none' ? undefined : v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {taskCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Folder</Label>
              <Select value={addListFolderId || 'none'} onValueChange={v => setAddListFolderId(v === 'none' ? undefined : v)}>
                <SelectTrigger><SelectValue placeholder="Select folder" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Folder</SelectItem>
                  {taskFolders.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Position</Label><Input type="number" value={listPosition} onChange={e => setListPosition(Number(e.target.value))} min={0} /></div>
            <Button onClick={handleEditList} className="w-full" disabled={!listName.trim()}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Task Panel</h1>
          <p className="text-muted-foreground mt-1">{taskFolders.length} folders · {taskLists.length} task lists</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCategoryManager(true)} className="gap-1"><Tag className="w-4 h-4" /> Categories</Button>
          <Button variant="outline" size="sm" onClick={() => setShowFolderManager(true)} className="gap-1"><Settings className="w-4 h-4" /> Folders</Button>
          <Button className="gap-2" onClick={() => openAddList()}><Plus className="w-4 h-4" /> Add Task List</Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search task lists..." className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterCategoryId} onValueChange={setFilterCategoryId}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {taskCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Folders grid */}
      {sortedFolders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-display font-semibold text-foreground mb-3">Folders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedFolders.map(folder => {
              const folderLists = taskLists.filter(tl => tl.folderId === folder.id);
              const totalTasks = folderLists.reduce((sum, tl) => sum + tl.tasks.length, 0);
              const doneTasks = folderLists.reduce((sum, tl) => sum + tl.tasks.filter(t => t.done).length, 0);
              return (
                <div key={folder.id} onClick={() => setViewingFolderId(folder.id)}
                  className="card-gradient rounded-xl border-2 border-border p-5 shadow-card cursor-pointer hover:shadow-elevated transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <FolderOpen className="w-5 h-5 text-primary" />
                    <h3 className="font-display font-semibold text-foreground">{folder.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{folderLists.length} lists · {doneTasks}/{totalTasks} tasks done</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Unfiled task lists */}
      {unfoldered.length > 0 && (
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground mb-3">
            {sortedFolders.length > 0 ? 'Unfiled Task Lists' : 'Task Lists'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unfoldered.map(tl => {
              const totalTasks = tl.tasks.length;
              const doneTasks = tl.tasks.filter(t => t.done).length;
              const completed = totalTasks > 0 && doneTasks === totalTasks;
              const cat = taskCategories.find(c => c.id === tl.categoryId);
              return (
                <div key={tl.id} onClick={() => setViewingList(tl)}
                  className={cn("card-gradient rounded-xl border-2 p-5 shadow-card cursor-pointer hover:shadow-elevated transition-all",
                    completed ? 'border-completed' : 'border-border')}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-semibold text-foreground">{tl.name}</h3>
                    {cat && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{cat.name}</span>}
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5 mb-2">
                    <div className="bg-primary rounded-full h-1.5 transition-all" style={{ width: `${totalTasks ? (doneTasks / totalTasks) * 100 : 0}%` }} />
                  </div>
                  <p className="text-sm text-muted-foreground">{doneTasks}/{totalTasks} tasks · {tl.phases.length} phases</p>
                  <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => openEditList(tl)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(tl.id)} className="text-destructive">Delete</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredLists.length === 0 && sortedFolders.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg">No task lists found</p>
          <p className="text-sm">Create a folder or task list to get started</p>
        </div>
      )}

      {/* Dialogs */}
      {renderAddListDialog()}
      {renderEditListDialog()}

      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Task List?</AlertDialogTitle><AlertDialogDescription>All phases and tasks will be removed.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={async () => { await deleteTaskList(deleteId!); setDeleteId(null); }} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Folder Manager */}
      <TaskFolderManager open={showFolderManager} onOpenChange={setShowFolderManager} />

      {/* Category Manager */}
      <TaskCategoryManager open={showCategoryManager} onOpenChange={setShowCategoryManager} />
    </div>
  );
}
