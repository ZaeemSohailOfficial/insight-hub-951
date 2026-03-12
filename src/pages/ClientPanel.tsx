import { useState } from 'react';
import { useAppState } from '@/store/AppContext';
import { Client, Contract, SortOption, FilterStatus } from '@/types';
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
  Clock, User, Mail, Phone, Building, FileText, CheckCircle, Loader2
} from 'lucide-react';

export default function ClientPanel() {
  const { clients, clientCategories, setClientCategories, addClient, updateClient } = useAppState();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [renewClient, setRenewClient] = useState<Client | null>(null);
  const [sortBy, setSortBy] = useState<SortOption | ''>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', details: '',
    categories: [] as string[],
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    budget: '', costing: '', mouDetails: '',
    mouFiles: [] as any[],
    status: 'in-progress' as 'in-progress' | 'completed',
  });

  const resetForm = () => setFormData({
    name: '', email: '', phone: '', company: '', details: '',
    categories: [], startDate: undefined, endDate: undefined,
    budget: '', costing: '', mouDetails: '', mouFiles: [], status: 'in-progress',
  });

  const handleAddClient = () => {
    const budget = parseFloat(formData.budget) || 0;
    const costing = parseFloat(formData.costing) || 0;
    const client: Client = {
      id: crypto.randomUUID(),
      name: formData.name, email: formData.email, phone: formData.phone,
      company: formData.company, details: formData.details,
      categories: formData.categories,
      status: formData.status,
      createdAt: new Date().toISOString(),
      contracts: [{
        id: crypto.randomUUID(),
        timeline: formData.startDate && formData.endDate
          ? `${differenceInDays(formData.endDate, formData.startDate)} days`
          : 'Not decided',
        startDate: formData.startDate?.toISOString() || '',
        endDate: formData.endDate?.toISOString() || '',
        budget, costing, profit: budget - costing,
        mouDetails: formData.mouDetails,
        mouFiles: formData.mouFiles,
        isRenewal: false,
      }],
    };
    addClient(client);
    resetForm();
    setAddOpen(false);
  };

  // Renew form state
  const [renewData, setRenewData] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    budget: '', costing: '', mouDetails: '', mouFiles: [] as any[],
  });

  const handleRenew = () => {
    if (!renewClient) return;
    const budget = parseFloat(renewData.budget) || 0;
    const costing = parseFloat(renewData.costing) || 0;
    const newContract: Contract = {
      id: crypto.randomUUID(),
      timeline: renewData.startDate && renewData.endDate
        ? `${differenceInDays(renewData.endDate, renewData.startDate)} days`
        : 'Not decided',
      startDate: renewData.startDate?.toISOString() || '',
      endDate: renewData.endDate?.toISOString() || '',
      budget, costing, profit: budget - costing,
      mouDetails: renewData.mouDetails, mouFiles: renewData.mouFiles, isRenewal: true,
    };
    const updated = { ...renewClient, contracts: [...renewClient.contracts, newContract] };
    updateClient(updated);
    setRenewClient(null);
    setViewingClient(updated);
    setRenewData({ startDate: undefined, endDate: undefined, budget: '', costing: '', mouDetails: '', mouFiles: [] });
  };

  const handleEdit = () => {
    if (!editingClient) return;
    const budget = parseFloat(formData.budget) || 0;
    const costing = parseFloat(formData.costing) || 0;
    const updated: Client = {
      ...editingClient,
      name: formData.name, email: formData.email, phone: formData.phone,
      company: formData.company, details: formData.details,
      categories: formData.categories, status: formData.status,
      contracts: editingClient.contracts.map((c, i) => i === 0
        ? { ...c, startDate: formData.startDate?.toISOString() || c.startDate, endDate: formData.endDate?.toISOString() || c.endDate, budget, costing, profit: budget - costing, mouDetails: formData.mouDetails, mouFiles: formData.mouFiles,
            timeline: formData.startDate && formData.endDate ? `${differenceInDays(formData.endDate, formData.startDate)} days` : c.timeline }
        : c),
    };
    updateClient(updated);
    setEditingClient(null);
    setViewingClient(updated);
    resetForm();
  };

  const startEdit = (client: Client) => {
    const c = client.contracts[0];
    setFormData({
      name: client.name, email: client.email, phone: client.phone,
      company: client.company, details: client.details,
      categories: client.categories, status: client.status,
      startDate: c?.startDate ? new Date(c.startDate) : undefined,
      endDate: c?.endDate ? new Date(c.endDate) : undefined,
      budget: c?.budget?.toString() || '', costing: c?.costing?.toString() || '',
      mouDetails: c?.mouDetails || '', mouFiles: c?.mouFiles || [],
    });
    setEditingClient(client);
  };

  // Filter & sort
  let filtered = clients.filter(c => {
    if (selectedCategory !== 'all' && !c.categories.includes(selectedCategory)) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });

  if (sortBy === 'budget-high') filtered.sort((a, b) => (b.contracts[0]?.budget || 0) - (a.contracts[0]?.budget || 0));
  if (sortBy === 'budget-low') filtered.sort((a, b) => (a.contracts[0]?.budget || 0) - (b.contracts[0]?.budget || 0));
  if (sortBy === 'timeline-high') {
    filtered.sort((a, b) => {
      const da = a.contracts[0]?.startDate && a.contracts[0]?.endDate ? differenceInDays(new Date(a.contracts[0].endDate), new Date(a.contracts[0].startDate)) : 0;
      const db = b.contracts[0]?.startDate && b.contracts[0]?.endDate ? differenceInDays(new Date(b.contracts[0].endDate), new Date(b.contracts[0].startDate)) : 0;
      return db - da;
    });
  }
  if (sortBy === 'timeline-low') {
    filtered.sort((a, b) => {
      const da = a.contracts[0]?.startDate && a.contracts[0]?.endDate ? differenceInDays(new Date(a.contracts[0].endDate), new Date(a.contracts[0].startDate)) : 0;
      const db = b.contracts[0]?.startDate && b.contracts[0]?.endDate ? differenceInDays(new Date(b.contracts[0].endDate), new Date(b.contracts[0].startDate)) : 0;
      return da - db;
    });
  }

  const totalBudget = clients.reduce((sum, c) => sum + c.contracts.reduce((s, ct) => s + ct.budget, 0), 0);
  const totalProfit = clients.reduce((sum, c) => sum + c.contracts.reduce((s, ct) => s + ct.profit, 0), 0);

  // Date picker helper
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

  // Client form fields
  const ClientFormFields = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Client Name *</Label><Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Client name" /></div>
        <div><Label>Company</Label><Input value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} placeholder="Company name" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Email</Label><Input value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" /></div>
        <div><Label>Phone</Label><Input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="+92..." /></div>
      </div>
      <div><Label>Client Details</Label><Textarea value={formData.details} onChange={e => setFormData(p => ({ ...p, details: e.target.value }))} placeholder="Details about the client..." rows={3} /></div>
      {clientCategories.length > 0 && (
        <div>
          <Label>Categories</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {clientCategories.map(cat => (
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
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Total Budget (PKR)</Label><Input type="number" value={formData.budget} onChange={e => setFormData(p => ({ ...p, budget: e.target.value }))} placeholder="0" /></div>
        <div><Label>Costing (PKR)</Label><Input type="number" value={formData.costing} onChange={e => setFormData(p => ({ ...p, costing: e.target.value }))} placeholder="0" /></div>
      </div>
      <div className="bg-secondary rounded-lg p-3">
        <p className="text-sm text-muted-foreground">Estimated Profit</p>
        <p className="text-lg font-bold text-accent">PKR {((parseFloat(formData.budget) || 0) - (parseFloat(formData.costing) || 0)).toLocaleString()}</p>
      </div>
      <div><Label>MOU / Contract Details</Label><Textarea value={formData.mouDetails} onChange={e => setFormData(p => ({ ...p, mouDetails: e.target.value }))} placeholder="Contract details..." rows={3} /></div>
      <FileUploader files={formData.mouFiles} onChange={f => setFormData(p => ({ ...p, mouFiles: f }))} label="Upload MOU / Contract Files" />
      <div>
        <Label>Status</Label>
        <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v as any }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Viewing a single client profile
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
                      <FileText className="w-3 h-3" />{f.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Renew Dialog */}
        <Dialog open={!!renewClient} onOpenChange={o => !o && setRenewClient(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-display">Renew Contract</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DatePick date={renewData.startDate} onSelect={d => setRenewData(p => ({ ...p, startDate: d }))} label="New Start Date" />
                <DatePick date={renewData.endDate} onSelect={d => setRenewData(p => ({ ...p, endDate: d }))} label="New End Date" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>New Budget (PKR)</Label><Input type="number" value={renewData.budget} onChange={e => setRenewData(p => ({ ...p, budget: e.target.value }))} /></div>
                <div><Label>New Costing (PKR)</Label><Input type="number" value={renewData.costing} onChange={e => setRenewData(p => ({ ...p, costing: e.target.value }))} /></div>
              </div>
              <div><Label>MOU Details</Label><Textarea value={renewData.mouDetails} onChange={e => setRenewData(p => ({ ...p, mouDetails: e.target.value }))} rows={3} /></div>
              <FileUploader files={renewData.mouFiles} onChange={f => setRenewData(p => ({ ...p, mouFiles: f }))} label="Upload New MOU" />
              <Button onClick={handleRenew} className="w-full">Add Renewal</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingClient} onOpenChange={o => { if (!o) { setEditingClient(null); resetForm(); } }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle className="font-display">Edit Client</DialogTitle></DialogHeader>
            <ClientFormFields isEdit />
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
          <h1 className="text-3xl font-display font-bold text-foreground">Client Panel</h1>
          <p className="text-muted-foreground mt-1">{clients.length} clients · PKR {totalBudget.toLocaleString()} total revenue</p>
        </div>
        <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Client</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle className="font-display">Add New Client</DialogTitle></DialogHeader>
            <ClientFormFields />
            <Button onClick={handleAddClient} className="w-full" disabled={!formData.name}>Add Client</Button>
          </DialogContent>
        </Dialog>
      </div>

      <CategoryManager categories={clientCategories} onAdd={c => setClientCategories([...clientCategories, c])} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
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

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(client => (
          <div
            key={client.id}
            onClick={() => setViewingClient(client)}
            className={cn(
              "card-gradient rounded-xl border-2 p-5 shadow-card cursor-pointer hover:shadow-elevated transition-all",
              client.status === 'in-progress' ? 'border-inprogress' : 'border-completed'
            )}
          >
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
    </div>
  );
}

// Need TrendingUp import
import { TrendingUp } from 'lucide-react';
