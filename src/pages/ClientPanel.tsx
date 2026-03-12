import { useState } from 'react';
import { useAppState } from '@/store/AppContext';
import { Client, Contract, SortOption, FilterStatus } from '@/types';
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
  Clock, User, Mail, Phone, Building, FileText, CheckCircle, Loader2, Search, Trash2, TrendingUp, Download
} from 'lucide-react';

export default function ClientPanel() {
  const { clients, clientCategories, setClientCategories, addClient, updateClient, deleteClient } = useAppState();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [renewClient, setRenewClient] = useState<Client | null>(null);
  const [sortBy, setSortBy] = useState<SortOption | ''>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formDetails, setFormDetails] = useState('');
  const [formCategories, setFormCategories] = useState<string[]>([]);
  const [formStartDate, setFormStartDate] = useState<Date | undefined>();
  const [formEndDate, setFormEndDate] = useState<Date | undefined>();
  const [formBudget, setFormBudget] = useState('');
  const [formCosting, setFormCosting] = useState('');
  const [formMouDetails, setFormMouDetails] = useState('');
  const [formMouFiles, setFormMouFiles] = useState<any[]>([]);
  const [formStatus, setFormStatus] = useState<'in-progress' | 'completed'>('in-progress');

  const resetForm = () => {
    setFormName(''); setFormEmail(''); setFormPhone(''); setFormCompany(''); setFormDetails('');
    setFormCategories([]); setFormStartDate(undefined); setFormEndDate(undefined);
    setFormBudget(''); setFormCosting(''); setFormMouDetails(''); setFormMouFiles([]); setFormStatus('in-progress');
  };

  const handleAddClient = () => {
    const budget = parseFloat(formBudget) || 0;
    const costing = parseFloat(formCosting) || 0;
    const client: Client = {
      id: crypto.randomUUID(),
      name: formName, email: formEmail, phone: formPhone,
      company: formCompany, details: formDetails,
      categories: formCategories, status: formStatus,
      createdAt: new Date().toISOString(),
      contracts: [{
        id: crypto.randomUUID(),
        timeline: formStartDate && formEndDate ? `${differenceInDays(formEndDate, formStartDate)} days` : 'Not decided',
        startDate: formStartDate?.toISOString() || '', endDate: formEndDate?.toISOString() || '',
        budget, costing, profit: budget - costing,
        mouDetails: formMouDetails, mouFiles: formMouFiles, isRenewal: false,
      }],
    };
    addClient(client);
    resetForm();
    setAddOpen(false);
  };

  const [renewStartDate, setRenewStartDate] = useState<Date | undefined>();
  const [renewEndDate, setRenewEndDate] = useState<Date | undefined>();
  const [renewBudget, setRenewBudget] = useState('');
  const [renewCosting, setRenewCosting] = useState('');
  const [renewMouDetails, setRenewMouDetails] = useState('');
  const [renewMouFiles, setRenewMouFiles] = useState<any[]>([]);

  const handleRenew = () => {
    if (!renewClient) return;
    const budget = parseFloat(renewBudget) || 0;
    const costing = parseFloat(renewCosting) || 0;
    const newContract: Contract = {
      id: crypto.randomUUID(),
      timeline: renewStartDate && renewEndDate ? `${differenceInDays(renewEndDate, renewStartDate)} days` : 'Not decided',
      startDate: renewStartDate?.toISOString() || '', endDate: renewEndDate?.toISOString() || '',
      budget, costing, profit: budget - costing,
      mouDetails: renewMouDetails, mouFiles: renewMouFiles, isRenewal: true,
    };
    const updated = { ...renewClient, contracts: [...renewClient.contracts, newContract] };
    updateClient(updated);
    setRenewClient(null);
    setViewingClient(updated);
    setRenewStartDate(undefined); setRenewEndDate(undefined); setRenewBudget(''); setRenewCosting(''); setRenewMouDetails(''); setRenewMouFiles([]);
  };

  const handleEdit = () => {
    if (!editingClient) return;
    const budget = parseFloat(formBudget) || 0;
    const costing = parseFloat(formCosting) || 0;
    const updated: Client = {
      ...editingClient,
      name: formName, email: formEmail, phone: formPhone,
      company: formCompany, details: formDetails,
      categories: formCategories, status: formStatus,
      contracts: editingClient.contracts.map((c, i) => i === 0
        ? { ...c, startDate: formStartDate?.toISOString() || c.startDate, endDate: formEndDate?.toISOString() || c.endDate, budget, costing, profit: budget - costing, mouDetails: formMouDetails, mouFiles: formMouFiles,
            timeline: formStartDate && formEndDate ? `${differenceInDays(formEndDate, formStartDate)} days` : c.timeline }
        : c),
    };
    updateClient(updated);
    setEditingClient(null);
    setViewingClient(updated);
    resetForm();
  };

  const startEdit = (client: Client) => {
    const c = client.contracts[0];
    setFormName(client.name); setFormEmail(client.email); setFormPhone(client.phone);
    setFormCompany(client.company); setFormDetails(client.details);
    setFormCategories(client.categories); setFormStatus(client.status);
    setFormStartDate(c?.startDate ? new Date(c.startDate) : undefined);
    setFormEndDate(c?.endDate ? new Date(c.endDate) : undefined);
    setFormBudget(c?.budget?.toString() || ''); setFormCosting(c?.costing?.toString() || '');
    setFormMouDetails(c?.mouDetails || ''); setFormMouFiles(c?.mouFiles || []);
    setEditingClient(client);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteClient(deleteId);
      if (viewingClient?.id === deleteId) setViewingClient(null);
      setDeleteId(null);
    }
  };

  let filtered = clients.filter(c => {
    if (selectedCategory !== 'all' && !c.categories.includes(selectedCategory)) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.company.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (sortBy === 'budget-high') filtered.sort((a, b) => (b.contracts[0]?.budget || 0) - (a.contracts[0]?.budget || 0));
  if (sortBy === 'budget-low') filtered.sort((a, b) => (a.contracts[0]?.budget || 0) - (b.contracts[0]?.budget || 0));
  if (sortBy === 'timeline-high') filtered.sort((a, b) => {
    const da = a.contracts[0]?.startDate && a.contracts[0]?.endDate ? differenceInDays(new Date(a.contracts[0].endDate), new Date(a.contracts[0].startDate)) : 0;
    const db = b.contracts[0]?.startDate && b.contracts[0]?.endDate ? differenceInDays(new Date(b.contracts[0].endDate), new Date(b.contracts[0].startDate)) : 0;
    return db - da;
  });
  if (sortBy === 'timeline-low') filtered.sort((a, b) => {
    const da = a.contracts[0]?.startDate && a.contracts[0]?.endDate ? differenceInDays(new Date(a.contracts[0].endDate), new Date(a.contracts[0].startDate)) : 0;
    const db = b.contracts[0]?.startDate && b.contracts[0]?.endDate ? differenceInDays(new Date(b.contracts[0].endDate), new Date(b.contracts[0].startDate)) : 0;
    return da - db;
  });

  const totalBudget = clients.reduce((sum, c) => sum + c.contracts.reduce((s, ct) => s + ct.budget, 0), 0);

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

  if (viewingClient) {
    const client = clients.find(c => c.id === viewingClient.id) || viewingClient;
    return (
      <div className="animate-fade-in">
        <Button variant="ghost" onClick={() => setViewingClient(null)} className="mb-4 gap-2">
          <ChevronLeft className="w-4 h-4" /> Back to Clients
        </Button>
        <div className="card-gradient rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">{client.name}</h2>
              <p className="text-muted-foreground">{client.company}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant={client.status === 'in-progress' ? 'default' : 'secondary'}>
                  {client.status === 'in-progress' ? <><Loader2 className="w-3 h-3 mr-1" /> In Progress</> : <><CheckCircle className="w-3 h-3 mr-1" /> Completed</>}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => startEdit(client)} className="gap-1"><Edit className="w-4 h-4" /> Edit</Button>
              <Button variant="outline" size="sm" onClick={() => setRenewClient(client)} className="gap-1"><RefreshCw className="w-4 h-4" /> Renew</Button>
              <Button variant="outline" size="sm" onClick={() => {
                const updated = { ...client, status: client.status === 'in-progress' ? 'completed' as const : 'in-progress' as const };
                updateClient(updated);
                setViewingClient(updated);
              }}>
                {client.status === 'in-progress' ? 'Mark Complete' : 'Mark In Progress'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDeleteId(client.id)} className="gap-1 text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /> Delete</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {client.email && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="w-4 h-4" />{client.email}</div>}
            {client.phone && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="w-4 h-4" />{client.phone}</div>}
            {client.company && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Building className="w-4 h-4" />{client.company}</div>}
          </div>

          {client.details && <div className="bg-secondary rounded-lg p-4 mb-6"><p className="text-sm text-foreground">{client.details}</p></div>}

          <h3 className="text-lg font-display font-semibold mb-4 text-foreground">Contracts</h3>
          {client.contracts.map((contract, idx) => (
            <div key={contract.id} className="bg-secondary rounded-lg p-4 mb-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-foreground">{contract.isRenewal ? `Renewal #${idx}` : 'Original Contract'}</h4>
                <Badge variant="outline">{contract.timeline}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div><p className="text-xs text-muted-foreground">Start Date</p><p className="font-medium text-foreground">{contract.startDate ? format(new Date(contract.startDate), 'PP') : 'N/A'}</p></div>
                <div><p className="text-xs text-muted-foreground">End Date</p><p className="font-medium text-foreground">{contract.endDate ? format(new Date(contract.endDate), 'PP') : 'N/A'}</p></div>
                <div><p className="text-xs text-muted-foreground">Budget</p><p className="font-medium text-foreground">PKR {contract.budget.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Profit</p><p className="font-medium text-accent">PKR {contract.profit.toLocaleString()}</p></div>
              </div>
              {contract.mouDetails && <div className="bg-muted rounded-md p-3 mb-2"><p className="text-sm text-foreground">{contract.mouDetails}</p></div>}
              {contract.mouFiles.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {contract.mouFiles.map(f => (
                    <a key={f.id} href={f.dataUrl} download={f.name} className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <Download className="w-3 h-3" />{f.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <Dialog open={!!renewClient} onOpenChange={o => !o && setRenewClient(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-display">Renew Contract</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DatePick date={renewStartDate} onSelect={setRenewStartDate} label="New Start Date" />
                <DatePick date={renewEndDate} onSelect={setRenewEndDate} label="New End Date" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>New Budget (PKR)</Label><Input type="number" value={renewBudget} onChange={e => setRenewBudget(e.target.value)} /></div>
                <div><Label>New Costing (PKR)</Label><Input type="number" value={renewCosting} onChange={e => setRenewCosting(e.target.value)} /></div>
              </div>
              <div><Label>MOU Details</Label><Textarea value={renewMouDetails} onChange={e => setRenewMouDetails(e.target.value)} rows={3} /></div>
              <FileUploader files={renewMouFiles} onChange={setRenewMouFiles} label="Upload New MOU" />
              <Button onClick={handleRenew} className="w-full">Add Renewal</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingClient} onOpenChange={o => { if (!o) { setEditingClient(null); resetForm(); } }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle className="font-display">Edit Client</DialogTitle></DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Client Name *</Label><Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Client name" /></div>
                <div><Label>Company</Label><Input value={formCompany} onChange={e => setFormCompany(e.target.value)} placeholder="Company name" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input value={formEmail} onChange={e => setFormEmail(e.target.value)} /></div>
                <div><Label>Phone</Label><Input value={formPhone} onChange={e => setFormPhone(e.target.value)} /></div>
              </div>
              <div><Label>Client Details</Label><Textarea value={formDetails} onChange={e => setFormDetails(e.target.value)} rows={3} /></div>
              {clientCategories.length > 0 && (
                <div>
                  <Label>Categories</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {clientCategories.map(cat => (
                      <button key={cat.id} type="button"
                        onClick={() => setFormCategories(prev => prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id])}
                        className={cn("px-3 py-1 rounded-md text-sm transition-colors", formCategories.includes(cat.id) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}
                      >{cat.name}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <DatePick date={formStartDate} onSelect={setFormStartDate} label="Start Date" />
                <DatePick date={formEndDate} onSelect={setFormEndDate} label="End Date" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Total Budget (PKR)</Label><Input type="number" value={formBudget} onChange={e => setFormBudget(e.target.value)} /></div>
                <div><Label>Costing (PKR)</Label><Input type="number" value={formCosting} onChange={e => setFormCosting(e.target.value)} /></div>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Estimated Profit</p>
                <p className="text-lg font-bold text-accent">PKR {((parseFloat(formBudget) || 0) - (parseFloat(formCosting) || 0)).toLocaleString()}</p>
              </div>
              <div><Label>MOU / Contract Details</Label><Textarea value={formMouDetails} onChange={e => setFormMouDetails(e.target.value)} rows={3} /></div>
              <FileUploader files={formMouFiles} onChange={setFormMouFiles} label="Upload MOU / Contract Files" />
              <div>
                <Label>Status</Label>
                <Select value={formStatus} onValueChange={v => setFormStatus(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleEdit} className="w-full">Save Changes</Button>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Client?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone. All client data will be permanently removed.</AlertDialogDescription>
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
          <h1 className="text-3xl font-display font-bold text-foreground">Client Panel</h1>
          <p className="text-muted-foreground mt-1">{clients.length} clients · PKR {totalBudget.toLocaleString()} total revenue</p>
        </div>
        <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Client</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle className="font-display">Add New Client</DialogTitle></DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Client Name *</Label><Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Client name" /></div>
                <div><Label>Company</Label><Input value={formCompany} onChange={e => setFormCompany(e.target.value)} placeholder="Company name" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input value={formEmail} onChange={e => setFormEmail(e.target.value)} /></div>
                <div><Label>Phone</Label><Input value={formPhone} onChange={e => setFormPhone(e.target.value)} /></div>
              </div>
              <div><Label>Client Details</Label><Textarea value={formDetails} onChange={e => setFormDetails(e.target.value)} rows={3} /></div>
              {clientCategories.length > 0 && (
                <div>
                  <Label>Categories</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {clientCategories.map(cat => (
                      <button key={cat.id} type="button"
                        onClick={() => setFormCategories(prev => prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id])}
                        className={cn("px-3 py-1 rounded-md text-sm transition-colors", formCategories.includes(cat.id) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}
                      >{cat.name}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <DatePick date={formStartDate} onSelect={setFormStartDate} label="Start Date" />
                <DatePick date={formEndDate} onSelect={setFormEndDate} label="End Date" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Total Budget (PKR)</Label><Input type="number" value={formBudget} onChange={e => setFormBudget(e.target.value)} /></div>
                <div><Label>Costing (PKR)</Label><Input type="number" value={formCosting} onChange={e => setFormCosting(e.target.value)} /></div>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Estimated Profit</p>
                <p className="text-lg font-bold text-accent">PKR {((parseFloat(formBudget) || 0) - (parseFloat(formCosting) || 0)).toLocaleString()}</p>
              </div>
              <div><Label>MOU / Contract Details</Label><Textarea value={formMouDetails} onChange={e => setFormMouDetails(e.target.value)} rows={3} /></div>
              <FileUploader files={formMouFiles} onChange={setFormMouFiles} label="Upload MOU / Contract Files" />
              <div>
                <Label>Status</Label>
                <Select value={formStatus} onValueChange={v => setFormStatus(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleAddClient} className="w-full" disabled={!formName}>Add Client</Button>
          </DialogContent>
        </Dialog>
      </div>

      <CategoryManager categories={clientCategories} onAdd={c => setClientCategories([...clientCategories, c])} onUpdate={setClientCategories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search clients..." className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={v => setFilterStatus(v as FilterStatus)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={v => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-48"><ArrowUpDown className="w-4 h-4 mr-2" /><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="budget-high">Budget: High → Low</SelectItem>
            <SelectItem value="budget-low">Budget: Low → High</SelectItem>
            <SelectItem value="timeline-high">Timeline: Longest</SelectItem>
            <SelectItem value="timeline-low">Timeline: Shortest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(client => (
          <div key={client.id} onClick={() => setViewingClient(client)}
            className={cn("card-gradient rounded-xl border-2 p-5 shadow-card cursor-pointer hover:shadow-elevated transition-all",
              client.status === 'in-progress' ? 'border-inprogress' : 'border-completed')}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display font-semibold text-foreground">{client.name}</h3>
                <p className="text-sm text-muted-foreground">{client.company}</p>
              </div>
              <Badge variant={client.status === 'in-progress' ? 'default' : 'secondary'} className="text-xs">
                {client.status === 'in-progress' ? 'Active' : 'Done'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground"><DollarSign className="w-3 h-3" /> PKR {client.contracts[0]?.budget?.toLocaleString() || '0'}</div>
              <div className="flex items-center gap-1 text-accent"><TrendingUp className="w-3 h-3" /> PKR {client.contracts[0]?.profit?.toLocaleString() || '0'}</div>
              <div className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3" /> {client.contracts[0]?.timeline || 'N/A'}</div>
              <div className="flex items-center gap-1 text-muted-foreground"><FileText className="w-3 h-3" /> {client.contracts.length} contract(s)</div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg">No clients found</p>
          <p className="text-sm">Add your first client to get started</p>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client?</AlertDialogTitle>
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
