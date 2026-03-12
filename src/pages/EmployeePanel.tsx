import { useState } from 'react';
import { useAppState } from '@/store/AppContext';
import { Employee, EmployeeContract } from '@/types';
import CategoryManager from '@/components/CategoryManager';
import FileUploader from '@/components/FileUploader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import {
  Plus, CalendarIcon, ArrowUpDown, ChevronLeft, Edit, RefreshCw, DollarSign,
  Clock, User, Mail, Phone, FileText, CheckCircle, Loader2, Briefcase, TrendingUp
} from 'lucide-react';

export default function EmployeePanel() {
  const { employees, employeeCategories, setEmployeeCategories, addEmployee, updateEmployee } = useAppState();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [viewing, setViewing] = useState<Employee | null>(null);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [renewing, setRenewing] = useState<Employee | null>(null);
  const [sortBy, setSortBy] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', position: '',
    categories: [] as string[], salary: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    mouDetails: '', mouFiles: [] as any[],
    additionalInfo: '', status: 'active' as 'active' | 'inactive',
  });

  const resetForm = () => setFormData({
    name: '', email: '', phone: '', position: '',
    categories: [], salary: '', startDate: undefined, endDate: undefined,
    mouDetails: '', mouFiles: [], additionalInfo: '', status: 'active',
  });

  const handleAdd = () => {
    const emp: Employee = {
      id: crypto.randomUUID(),
      name: formData.name, email: formData.email, phone: formData.phone,
      position: formData.position, categories: formData.categories,
      salary: parseFloat(formData.salary) || 0,
      startDate: formData.startDate?.toISOString() || '',
      endDate: formData.endDate?.toISOString() || '',
      mouDetails: formData.mouDetails, mouFiles: formData.mouFiles,
      additionalInfo: formData.additionalInfo, status: formData.status,
      contracts: [{
        id: crypto.randomUUID(),
        startDate: formData.startDate?.toISOString() || '',
        endDate: formData.endDate?.toISOString() || '',
        salary: parseFloat(formData.salary) || 0,
        mouDetails: formData.mouDetails, mouFiles: formData.mouFiles, isRenewal: false,
      }],
      createdAt: new Date().toISOString(),
    };
    addEmployee(emp);
    resetForm();
    setAddOpen(false);
  };

  const [renewData, setRenewData] = useState({
    startDate: undefined as Date | undefined, endDate: undefined as Date | undefined,
    salary: '', mouDetails: '', mouFiles: [] as any[],
  });

  const handleRenew = () => {
    if (!renewing) return;
    const nc: EmployeeContract = {
      id: crypto.randomUUID(),
      startDate: renewData.startDate?.toISOString() || '',
      endDate: renewData.endDate?.toISOString() || '',
      salary: parseFloat(renewData.salary) || 0,
      mouDetails: renewData.mouDetails, mouFiles: renewData.mouFiles, isRenewal: true,
    };
    const updated = { ...renewing, contracts: [...renewing.contracts, nc], salary: parseFloat(renewData.salary) || renewing.salary };
    updateEmployee(updated);
    setRenewing(null);
    setViewing(updated);
    setRenewData({ startDate: undefined, endDate: undefined, salary: '', mouDetails: '', mouFiles: [] });
  };

  const handleEdit = () => {
    if (!editing) return;
    const updated: Employee = {
      ...editing,
      name: formData.name, email: formData.email, phone: formData.phone,
      position: formData.position, categories: formData.categories,
      salary: parseFloat(formData.salary) || 0,
      startDate: formData.startDate?.toISOString() || editing.startDate,
      endDate: formData.endDate?.toISOString() || editing.endDate,
      mouDetails: formData.mouDetails, mouFiles: formData.mouFiles,
      additionalInfo: formData.additionalInfo, status: formData.status,
    };
    updateEmployee(updated);
    setEditing(null);
    setViewing(updated);
    resetForm();
  };

  const startEdit = (emp: Employee) => {
    setFormData({
      name: emp.name, email: emp.email, phone: emp.phone, position: emp.position,
      categories: emp.categories, salary: emp.salary.toString(),
      startDate: emp.startDate ? new Date(emp.startDate) : undefined,
      endDate: emp.endDate ? new Date(emp.endDate) : undefined,
      mouDetails: emp.mouDetails, mouFiles: emp.mouFiles,
      additionalInfo: emp.additionalInfo, status: emp.status,
    });
    setEditing(emp);
  };

  let filtered = employees.filter(e => {
    if (selectedCategory !== 'all' && !e.categories.includes(selectedCategory)) return false;
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    return true;
  });

  if (sortBy === 'salary-high') filtered.sort((a, b) => b.salary - a.salary);
  if (sortBy === 'salary-low') filtered.sort((a, b) => a.salary - b.salary);
  if (sortBy === 'timeline-high') {
    filtered.sort((a, b) => {
      const da = a.startDate && a.endDate ? differenceInDays(new Date(a.endDate), new Date(a.startDate)) : 0;
      const db = b.startDate && b.endDate ? differenceInDays(new Date(b.endDate), new Date(b.startDate)) : 0;
      return db - da;
    });
  }

  const totalSalary = employees.reduce((s, e) => s + e.salary, 0);

  const DatePick = ({ date, onSelect, label }: { date?: Date; onSelect: (d: Date | undefined) => void; label: string }) => (
    <div>
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={onSelect} className="p-3 pointer-events-auto" />
        </PopoverContent>
      </Popover>
    </div>
  );

  const EmpFormFields = () => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Name *</Label><Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Employee name" /></div>
        <div><Label>Position</Label><Input value={formData.position} onChange={e => setFormData(p => ({ ...p, position: e.target.value }))} placeholder="e.g. Developer" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Email</Label><Input value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} /></div>
        <div><Label>Phone</Label><Input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} /></div>
      </div>
      {employeeCategories.length > 0 && (
        <div>
          <Label>Categories</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {employeeCategories.map(cat => (
              <button key={cat.id} type="button"
                onClick={() => setFormData(p => ({ ...p, categories: p.categories.includes(cat.id) ? p.categories.filter(c => c !== cat.id) : [...p.categories, cat.id] }))}
                className={cn("px-3 py-1 rounded-md text-sm transition-colors", formData.categories.includes(cat.id) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}
              >{cat.name}</button>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <DatePick date={formData.startDate} onSelect={d => setFormData(p => ({ ...p, startDate: d }))} label="Start Date" />
        <DatePick date={formData.endDate} onSelect={d => setFormData(p => ({ ...p, endDate: d }))} label="End Date" />
      </div>
      <div><Label>Salary (PKR)</Label><Input type="number" value={formData.salary} onChange={e => setFormData(p => ({ ...p, salary: e.target.value }))} placeholder="Monthly salary" /></div>
      <div><Label>MOU / Contract Details</Label><Textarea value={formData.mouDetails} onChange={e => setFormData(p => ({ ...p, mouDetails: e.target.value }))} rows={3} /></div>
      <FileUploader files={formData.mouFiles} onChange={f => setFormData(p => ({ ...p, mouFiles: f }))} label="Upload MOU / Documents" />
      <div><Label>Additional Information</Label><Textarea value={formData.additionalInfo} onChange={e => setFormData(p => ({ ...p, additionalInfo: e.target.value }))} rows={3} /></div>
      <div>
        <Label>Status</Label>
        <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v as any }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  if (viewing) {
    const emp = employees.find(e => e.id === viewing.id) || viewing;
    return (
      <div className="animate-fade-in">
        <Button variant="ghost" onClick={() => setViewing(null)} className="mb-4 gap-2"><ChevronLeft className="w-4 h-4" /> Back</Button>
        <div className="card-gradient rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">{emp.name}</h2>
              <p className="text-muted-foreground">{emp.position}</p>
              <Badge variant={emp.status === 'active' ? 'default' : 'secondary'} className="mt-2">
                {emp.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => startEdit(emp)} className="gap-1"><Edit className="w-4 h-4" /> Edit</Button>
              <Button variant="outline" size="sm" onClick={() => setRenewing(emp)} className="gap-1"><RefreshCw className="w-4 h-4" /> Renew</Button>
              <Button variant="outline" size="sm" onClick={() => {
                const updated = { ...emp, status: emp.status === 'active' ? 'inactive' as const : 'active' as const };
                updateEmployee(updated);
                setViewing(updated);
              }}>
                {emp.status === 'active' ? 'Mark Inactive' : 'Mark Active'}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {emp.email && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="w-4 h-4" />{emp.email}</div>}
            {emp.phone && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="w-4 h-4" />{emp.phone}</div>}
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><DollarSign className="w-4 h-4" />PKR {emp.salary.toLocaleString()}/mo</div>
          </div>
          {emp.additionalInfo && <div className="bg-secondary rounded-lg p-4 mb-6"><p className="text-sm text-foreground">{emp.additionalInfo}</p></div>}
          <h3 className="text-lg font-display font-semibold mb-4 text-foreground">Contracts</h3>
          {emp.contracts.map((c, idx) => (
            <div key={c.id} className="bg-secondary rounded-lg p-4 mb-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-foreground">{c.isRenewal ? `Renewal #${idx}` : 'Original Contract'}</h4>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div><p className="text-xs text-muted-foreground">Start</p><p className="font-medium text-foreground">{c.startDate ? format(new Date(c.startDate), 'PP') : 'N/A'}</p></div>
                <div><p className="text-xs text-muted-foreground">End</p><p className="font-medium text-foreground">{c.endDate ? format(new Date(c.endDate), 'PP') : 'N/A'}</p></div>
                <div><p className="text-xs text-muted-foreground">Salary</p><p className="font-medium text-foreground">PKR {c.salary.toLocaleString()}</p></div>
              </div>
              {c.mouDetails && <div className="bg-muted rounded-md p-3 mb-2"><p className="text-sm text-foreground">{c.mouDetails}</p></div>}
              {c.mouFiles.length > 0 && (
                <div className="flex gap-2 flex-wrap">{c.mouFiles.map(f => (
                  <a key={f.id} href={f.dataUrl} download={f.name} className="flex items-center gap-1 text-xs text-primary hover:underline"><FileText className="w-3 h-3" />{f.name}</a>
                ))}</div>
              )}
            </div>
          ))}
        </div>

        <Dialog open={!!renewing} onOpenChange={o => !o && setRenewing(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-display">Renew Contract</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DatePick date={renewData.startDate} onSelect={d => setRenewData(p => ({ ...p, startDate: d }))} label="New Start" />
                <DatePick date={renewData.endDate} onSelect={d => setRenewData(p => ({ ...p, endDate: d }))} label="New End" />
              </div>
              <div><Label>New Salary (PKR)</Label><Input type="number" value={renewData.salary} onChange={e => setRenewData(p => ({ ...p, salary: e.target.value }))} /></div>
              <div><Label>MOU Details</Label><Textarea value={renewData.mouDetails} onChange={e => setRenewData(p => ({ ...p, mouDetails: e.target.value }))} rows={3} /></div>
              <FileUploader files={renewData.mouFiles} onChange={f => setRenewData(p => ({ ...p, mouFiles: f }))} />
              <Button onClick={handleRenew} className="w-full">Add Renewal</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editing} onOpenChange={o => { if (!o) { setEditing(null); resetForm(); } }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle className="font-display">Edit Employee</DialogTitle></DialogHeader>
            <EmpFormFields />
            <Button onClick={handleEdit} className="w-full">Save Changes</Button>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Employee Panel</h1>
          <p className="text-muted-foreground mt-1">{employees.length} employees · PKR {totalSalary.toLocaleString()}/mo total</p>
        </div>
        <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Add Employee</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle className="font-display">Add Employee</DialogTitle></DialogHeader>
            <EmpFormFields />
            <Button onClick={handleAdd} className="w-full" disabled={!formData.name}>Add Employee</Button>
          </DialogContent>
        </Dialog>
      </div>

      <CategoryManager categories={employeeCategories} onAdd={c => setEmployeeCategories([...employeeCategories, c])} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      <div className="flex gap-3 mb-6 flex-wrap">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48"><ArrowUpDown className="w-4 h-4 mr-2" /><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="salary-high">Salary: High → Low</SelectItem>
            <SelectItem value="salary-low">Salary: Low → High</SelectItem>
            <SelectItem value="timeline-high">Timeline: Longest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(emp => (
          <div key={emp.id} onClick={() => setViewing(emp)}
            className={cn("card-gradient rounded-xl border-2 p-5 shadow-card cursor-pointer hover:shadow-elevated transition-all",
              emp.status === 'active' ? 'border-active' : 'border-inactive')}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display font-semibold text-foreground">{emp.name}</h3>
                <p className="text-sm text-muted-foreground">{emp.position}</p>
              </div>
              <Badge variant={emp.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                {emp.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground"><DollarSign className="w-3 h-3" /> PKR {emp.salary.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3" /> {emp.startDate ? format(new Date(emp.startDate), 'PP') : 'N/A'}</div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg">No employees found</p>
        </div>
      )}
    </div>
  );
}
