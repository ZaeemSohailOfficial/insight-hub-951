import { useState } from 'react';
import { useAppState } from '@/store/AppContext';
import { TaskFolder } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Plus, FolderOpen } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export default function TaskFolderManager({ open, onOpenChange }: Props) {
  const { taskFolders, addTaskFolder, updateTaskFolder, deleteTaskFolder } = useAppState();
  const [name, setName] = useState('');
  const [position, setPosition] = useState(0);
  const [editingFolder, setEditingFolder] = useState<TaskFolder | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addTaskFolder({
      id: crypto.randomUUID(),
      name,
      position,
      createdAt: new Date().toISOString(),
    });
    setName('');
    setPosition(0);
  };

  const handleEdit = async () => {
    if (!editingFolder || !name.trim()) return;
    await updateTaskFolder({ ...editingFolder, name, position });
    setEditingFolder(null);
    setName('');
    setPosition(0);
  };

  const sortedFolders = [...taskFolders].sort((a, b) => a.position - b.position);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-display">Manage Folders</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* Add/Edit form */}
            <div className="flex gap-2">
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Folder name" className="flex-1" />
              <Input type="number" value={position} onChange={e => setPosition(Number(e.target.value))} className="w-20" min={0} placeholder="Pos" />
              {editingFolder ? (
                <>
                  <Button onClick={handleEdit} size="sm">Save</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditingFolder(null); setName(''); setPosition(0); }}>Cancel</Button>
                </>
              ) : (
                <Button onClick={handleAdd} size="sm" disabled={!name.trim()}><Plus className="w-4 h-4" /></Button>
              )}
            </div>

            {/* List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sortedFolders.map(f => (
                <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary border border-border">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{f.name}</span>
                    <span className="text-xs text-muted-foreground">#{f.position}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingFolder(f); setName(f.name); setPosition(f.position); }}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(f.id)} className="text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {sortedFolders.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No folders yet</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Folder?</AlertDialogTitle><AlertDialogDescription>Task lists will be moved to unfiled.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={async () => { await deleteTaskFolder(deleteId!); setDeleteId(null); }} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
