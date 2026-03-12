import { useState } from 'react';
import { Category } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import IconPicker, { getIconComponent } from '@/components/IconPicker';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (cat: Category) => void;
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export default function CategoryManager({ categories, onAdd, selectedCategory, onSelectCategory }: CategoryManagerProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Briefcase');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({ id: crypto.randomUUID(), name: name.trim(), icon });
    setName('');
    setIcon('Briefcase');
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap mb-6">
      <button
        onClick={() => onSelectCategory('all')}
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium transition-all",
          selectedCategory === 'all'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-muted'
        )}
      >
        All
      </button>

      {categories.map(cat => {
        const Icon = getIconComponent(cat.icon);
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              selectedCategory === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-muted'
            )}
          >
            <Icon className="w-4 h-4" />
            {cat.name}
          </button>
        );
      })}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Add Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Marketing" />
            </div>
            <div>
              <Label>Select Icon</Label>
              <IconPicker selected={icon} onSelect={setIcon} />
            </div>
            <Button onClick={handleSubmit} className="w-full">Add Category</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
