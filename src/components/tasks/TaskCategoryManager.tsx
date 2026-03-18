import { useState } from 'react';
import { useAppState } from '@/store/AppContext';
import { TaskCategory } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Plus, Tag } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export default function TaskCategoryManager({ open, onOpenChange }: Props) {
  const { taskCategories, addTaskCategory, updateTaskCategory, deleteTaskCategory } = useAppState();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Tag');
  const [editingCat, setEditingCat] = useState<TaskCategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addTaskCategory({ id: crypto.randomUUID(), name, icon });
    setName('');
    setIcon('Tag');
  };

  const handleEdit = async () => {
    if (!editingCat || !name.trim()) return;
    await updateTaskCategory({ ...editingCat, name, icon });
    setEditingCat(null);
    setName('');
    setIcon('Tag');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-display">Manage Task Categories</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Category name" className="flex-1" />
              {editingCat ? (
                <>
                  <Button onClick={handleEdit} size="sm">Save</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditingCat(null); setName(''); }}>Cancel</Button>
                </>
              ) : (
                <Button onClick={handleAdd} size="sm" disabled={!name.trim()}><Plus className="w-4 h-4" /></Button>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {taskCategories.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary border border-border">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingCat(c); setName(c.name); }}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(c.id)} className="text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {taskCategories.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No categories yet</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Category?</AlertDialogTitle><AlertDialogDescription>Task lists will be uncategorized.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={async () => { await deleteTaskCategory(deleteId!); setDeleteId(null); }} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
