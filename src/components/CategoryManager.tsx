import { useState } from 'react';
import { Category } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import IconPicker, { getIconComponent } from '@/components/IconPicker';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (cat: Category) => void;
  onUpdate?: (cats: Category[]) => void;
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export default function CategoryManager({ categories, onAdd, onUpdate, selectedCategory, onSelectCategory }: CategoryManagerProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Briefcase');
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({ id: crypto.randomUUID(), name: name.trim(), icon });
    setName(''); setIcon('Briefcase'); setOpen(false);
  };

  const startEdit = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editingCat || !name.trim() || !onUpdate) return;
    onUpdate(categories.map(c => c.id === editingCat.id ? { ...c, name: name.trim(), icon } : c));
    setEditingCat(null); setName(''); setIcon('Briefcase'); setEditOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId || !onUpdate) return;
    onUpdate(categories.filter(c => c.id !== deleteId));
    if (selectedCategory === deleteId) onSelectCategory('all');
    setDeleteId(null);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap mb-6">
      <button onClick={() => onSelectCategory('all')}
        className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all",
          selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted')}>
        All
      </button>

      {categories.map(cat => {
        const Icon = getIconComponent(cat.icon);
        return (
          <div key={cat.id} className="relative group">
            <button onClick={() => onSelectCategory(cat.id)}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                selectedCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted')}>
              <Icon className="w-4 h-4" />
              {cat.name}
            </button>
            {onUpdate && (
              <div className="absolute -top-2 -right-2 hidden group-hover:flex gap-0.5">
                <button onClick={(e) => { e.stopPropagation(); startEdit(cat); }}
                  className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Edit className="w-3 h-3 text-primary-foreground" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteId(cat.id); }}
                  className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                  <Trash2 className="w-3 h-3 text-destructive-foreground" />
                </button>
              </div>
            )}
          </div>
        );
      })}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1"><Plus className="w-4 h-4" /> Add Category</Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-display">Add Category</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Category Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Marketing" /></div>
            <div><Label>Select Icon</Label><IconPicker selected={icon} onSelect={setIcon} /></div>
            <Button onClick={handleSubmit} className="w-full">Add Category</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={o => { if (!o) { setEditOpen(false); setEditingCat(null); setName(''); setIcon('Briefcase'); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-display">Edit Category</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Category Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>Select Icon</Label><IconPicker selected={icon} onSelect={setIcon} /></div>
            <Button onClick={handleEdit} className="w-full">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the category. Items in this category won't be deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
