import { useState } from 'react';
import { useAppState } from '@/store/AppContext';
import { Employee, EmployeeContract } from '@/types';
import CategoryManager from '@/components/CategoryManager';
import FileUploader from '@/components/FileUploader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
  Clock, Search, Trash2, Mail, Phone, FileText, Briefcase, Download
} from 'lucide-react';

export default function EmployeePanel() {
  const { employees, employeeCategories, setEmployeeCategories, addEmployee, updateEmployee, deleteEmployee } = useAppState();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [viewing, setViewing] = useState<Employee | null>(null);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [renewing, setRenewing] = useState<Employee | null>(null);
  const [editingContract, setEditingContract] = useState<{ emp: Employee; contract: EmployeeContract } | null>(null);
  const [sortBy, setSortBy] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Individual form fields to avoid cursor loss
  const [fName, setFName] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fPosition, setFPosition] = useState('');
  const [fCategories, setFCategories] = useState<string[]>([]);
  const [fSalary, setFSalary] = useState('');
  const [fStartDate, setFStartDate] = useState<Date | undefined>();
  const [fEndDate, setFEndDate] = useState<Date | undefined>();
  const [fMouDetails, setFMouDetails] = useState('');
  const [fMouFiles, setFMouFiles] = useState<any[]>([]);
  const [fAdditionalInfo, setFAdditionalInfo] = useState('');
  const [fStatus, setFStatus] = useState<'active' | 'inactive'>('active');

  const resetForm = () => {
    setFName(''); setFEmail(''); setFPhone(''); setFPosition('');
    setFCategories([]); setFSalary(''); setFStartDate(undefined); setFEndDate(undefined);
    setFMouDetails(''); setFMouFiles([]); setFAdditionalInfo(''); setFStatus('active');
  };

  const handleAdd = () => {
    const emp: Employee = {
      id: crypto.randomUUID(),
      name: fName, email: fEmail, phone: fPhone, position: fPosition,
      categories: fCategories, salary: parseFloat(fSalary) || 0,
      startDate: fStartDate?.toISOString() || '', endDate: fEndDate?.toISOString() || '',
      mouDetails: fMouDetails, mouFiles: fMouFiles,
      additionalInfo: fAdditionalInfo, status: fStatus,
      contracts: [{
        id: crypto.randomUUID(),
        startDate: fStartDate?.toISOString() || '', endDate: fEndDate?.toISOString() || '',
        salary: parseFloat(fSalary) || 0,
        mouDetails: fMouDetails, mouFiles: fMouFiles, isRenewal: false,
      }],
      createdAt: new Date().toISOString(),
    };
    addEmployee(emp);
    resetForm();
    setAddOpen(false);
  };

  const [rStartDate, setRStartDate] = useState<Date | undefined>();
  const [rEndDate, setREndDate] = useState<Date | undefined>();
  const [rSalary, setRSalary] = useState('');
  const [rMouDetails, setRMouDetails] = useState('');
  const [rMouFiles, setRMouFiles] = useState<any[]>([]);

  const resetRenewForm = () => {
    setRStartDate(undefined); setREndDate(undefined); setRSalary(''); setRMouDetails(''); setRMouFiles([]);
  };

  const handleRenew = () => {
    if (!renewing) return;
    const nc: EmployeeContract = {
      id: crypto.randomUUID(),
      startDate: rStartDate?.toISOString() || '', endDate: rEndDate?.toISOString() || '',
      salary: parseFloat(rSalary) || 0,
      mouDetails: rMouDetails, mouFiles: rMouFiles, isRenewal: true,
    };
    const updated = { ...renewing, contracts: [...renewing.contracts, nc], salary: parseFloat(rSalary) || renewing.salary };
    updateEmployee(updated);
    setRenewing(null);
    setViewing(updated);
    resetRenewForm();
  };

  const startEditContract = (emp: Employee, contract: EmployeeContract) => {
    setEditingContract({ emp, contract });
    setRStartDate(contract.startDate ? new Date(contract.startDate) : undefined);
    setREndDate(contract.endDate ? new Date(contract.endDate) : undefined);
    setRSalary(contract.salary.toString());
    setRMouDetails(contract.mouDetails);
    setRMouFiles(contract.mouFiles);
  };

  const handleEditContract = () => {
    if (!editingContract) return;
    const updatedContract: EmployeeContract = {
      ...editingContract.contract,
      startDate: rStartDate?.toISOString() || editingContract.contract.startDate,
      endDate: rEndDate?.toISOString() || editingContract.contract.endDate,
      salary: parseFloat(rSalary) || 0,
      mouDetails: rMouDetails,
      mouFiles: rMouFiles,
    };
    const updatedEmp = {
      ...editingContract.emp,
      contracts: editingContract.emp.contracts.map(c => c.id === updatedContract.id ? updatedContract : c),
    };
    updateEmployee(updatedEmp);
    setEditingContract(null);
    setViewing(updatedEmp);
    resetRenewForm();
  };

  const handleEdit = () => {
    if (!editing) return;
    const updated: Employee = {
      ...editing,
      name: fName, email: fEmail, phone: fPhone, position: fPosition,
      categories: fCategories, salary: parseFloat(fSalary) || 0,
      startDate: fStartDate?.toISOString() || editing.startDate,
      endDate: fEndDate?.toISOString() || editing.endDate,
      mouDetails: fMouDetails, mouFiles: fMouFiles,
      additionalInfo: fAdditionalInfo, status: fStatus,
    };
    updateEmployee(updated);
    setEditing(null);
    setViewing(updated);
    resetForm();
  };

  const startEdit = (emp: Employee) => {
    setFName(emp.name); setFEmail(emp.email); setFPhone(emp.phone); setFPosition(emp.position);
    setFCategories(emp.categories); setFSalary(emp.salary.toString());
    setFStartDate(emp.startDate ? new Date(emp.startDate) : undefined);
    setFEndDate(emp.endDate ? new Date(emp.endDate) : undefined);
    setFMouDetails(emp.mouDetails); setFMouFiles(emp.mouFiles);
    setFAdditionalInfo(emp.additionalInfo); setFStatus(emp.status);
    setEditing(emp);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteEmployee(deleteId);
      if (viewing?.id === deleteId) setViewing(null);
      setDeleteId(null);
    }
  };

  let filtered = employees.filter(e => {
    if (selectedCategory !== 'all' && !e.categories.includes(selectedCategory)) return false;
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    if (searchQuery && !e.name.toLowerCase().includes(searchQuery.toLowerCase()) && !e.position.toLowerCase().includes(searchQuery.toLowerCase())) return false;
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

  const formFields = (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Name *</Label><Input value={fName} onChange={e => setFName(e.target.value)} placeholder="Employee name" /></div>
        <div><Label>Position</Label><Input value={fPosition} onChange={e => setFPosition(e.target.value)} placeholder="e.g. Developer" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Email</Label><Input value={fEmail} onChange={e => setFEmail(e.target.value)} /></div>
        <div><Label>Phone</Label><Input value={fPhone} onChange={e => setFPhone(e.target.value)} /></div>
      </div>
      {employeeCategories.length > 0 && (
        <div>
          <Label>Categories</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {employeeCategories.map(cat => (
              <button key={cat.id} type="button"
                onClick={() => setFCategories(prev => prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id])}
                className={cn("px-3 py-1 rounded-md text-sm transition-colors", fCategories.includes(cat.id) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}
              >{cat.name}</button>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <DatePick date={fStartDate} onSelect={setFStartDate} label="Start Date" />
        <DatePick date={fEndDate} onSelect={setFEndDate} label="End Date" />
      </div>
      <div><Label>Salary (PKR)</Label><Input type="number" value={fSalary} onChange={e => setFSalary(e.target.value)} placeholder="Monthly salary" /></div>
      <div><Label>MOU / Contract Details</Label><Textarea value={fMouDetails} onChange={e => setFMouDetails(e.target.value)} rows={3} /></div>
      <FileUploader files={fMouFiles} onChange={setFMouFiles} label="Upload MOU / Documents" />
      <div><Label>Additional Information</Label><Textarea value={fAdditionalInfo} onChange={e => setFAdditionalInfo(e.target.value)} rows={3} /></div>
      <div>
        <Label>Status</Label>
        <Select value={fStatus} onValueChange={v => setFStatus(v as any)}>
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
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => startEdit(emp)} className="gap-1"><Edit className="w-4 h-4" /> Edit</Button>
              <Button variant="outline" size="sm" onClick={() => setRenewing(emp)} className="gap-1"><RefreshCw className="w-4 h-4" /> Renew</Button>
              <Button variant="outline" size="sm" onClick={() => {
                const updated = { ...emp, status: emp.status === 'active' ? 'inactive' as const : 'active' as const };
                updateEmployee(updated);
                setViewing(updated);
              }}>
                {emp.status === 'active' ? 'Mark Inactive' : 'Mark Active'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDeleteId(emp.id)} className="gap-1 text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /> Delete</Button>
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
                <Button variant="ghost" size="sm" onClick={() => startEditContract(emp, c)} className="gap-1"><Edit className="w-3 h-3" /> Edit</Button>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div><p className="text-xs text-muted-foreground">Start</p><p className="font-medium text-foreground">{c.startDate ? format(new Date(c.startDate), 'PP') : 'N/A'}</p></div>
                <div><p className="text-xs text-muted-foreground">End</p><p className="font-medium text-foreground">{c.endDate ? format(new Date(c.endDate), 'PP') : 'N/A'}</p></div>
                <div><p className="text-xs text-muted-foreground">Salary</p><p className="font-medium text-foreground">PKR {c.salary.toLocaleString()}</p></div>
              </div>
              {c.mouDetails && <div className="bg-muted rounded-md p-3 mb-2"><p className="text-sm text-foreground">{c.mouDetails}</p></div>}
              {c.mouFiles.length > 0 && (
                <div className="flex gap-2 flex-wrap">{c.mouFiles.map(f => (
                  <a key={f.id} href={f.dataUrl} download={f.name} className="flex items-center gap-1 text-xs text-primary hover:underline"><Download className="w-3 h-3" />{f.name}</a>
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
                <DatePick date={rStartDate} onSelect={setRStartDate} label="New Start" />
                <DatePick date={rEndDate} onSelect={setREndDate} label="New End" />
              </div>
              <div><Label>New Salary (PKR)</Label><Input type="number" value={rSalary} onChange={e => setRSalary(e.target.value)} /></div>
              <div><Label>MOU Details</Label><Textarea value={rMouDetails} onChange={e => setRMouDetails(e.target.value)} rows={3} /></div>
              <FileUploader files={rMouFiles} onChange={setRMouFiles} />
              <Button onClick={handleRenew} className="w-full">Add Renewal</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editing} onOpenChange={o => { if (!o) { setEditing(null); resetForm(); } }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle className="font-display">Edit Employee</DialogTitle></DialogHeader>
            {formFields}
            <Button onClick={handleEdit} className="w-full">Save Changes</Button>
          </DialogContent>
        </Dialog>

        {/* Edit Contract Dialog */}
        <Dialog open={!!editingContract} onOpenChange={o => { if (!o) { setEditingContract(null); resetRenewForm(); } }}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-display">Edit Contract</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DatePick date={rStartDate} onSelect={setRStartDate} label="Start Date" />
                <DatePick date={rEndDate} onSelect={setREndDate} label="End Date" />
              </div>
              <div><Label>Salary (PKR)</Label><Input type="number" value={rSalary} onChange={e => setRSalary(e.target.value)} /></div>
              <div><Label>MOU Details</Label><Textarea value={rMouDetails} onChange={e => setRMouDetails(e.target.value)} rows={3} /></div>
              <FileUploader files={rMouFiles} onChange={setRMouFiles} />
              <Button onClick={handleEditContract} className="w-full">Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Employee?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
            {formFields}
            <Button onClick={handleAdd} className="w-full" disabled={!fName}>Add Employee</Button>
          </DialogContent>
        </Dialog>
      </div>

      <CategoryManager categories={employeeCategories} onAdd={c => setEmployeeCategories([...employeeCategories, c])} onUpdate={setEmployeeCategories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search employees..." className="pl-9" />
        </div>
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

      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
