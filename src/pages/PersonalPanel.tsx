import { useState, useMemo } from 'react';
import { useAppState } from '@/store/AppContext';
import { PersonalExpense, ExpenseCategory } from '@/types';
import FileUploader from '@/components/FileUploader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, parseISO, isAfter, isBefore, startOfMonth, endOfMonth } from 'date-fns';
import { Plus, CalendarIcon, DollarSign, TrendingUp, TrendingDown, Users, Trash2, Building2 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import IconPicker, { getIconComponent } from '@/components/IconPicker';

export default function PersonalPanel() {
  const { clients, employees, expenses, expenseCategories, setExpenseCategories, addExpense, deleteExpense } = useAppState();
  const [addOpen, setAddOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState('all');
  const [filterFrom, setFilterFrom] = useState<Date | undefined>();
  const [filterTo, setFilterTo] = useState<Date | undefined>();

  const [catForm, setCatForm] = useState({ name: '', type: 'recurring' as 'recurring' | 'one-time', icon: 'Building' });
  const [expForm, setExpForm] = useState({ name: '', cost: '', details: '', category: '', invoiceFiles: [] as any[], date: undefined as Date | undefined });

  const handleAddCat = () => {
    if (!catForm.name.trim()) return;
    setExpenseCategories([...expenseCategories, { id: crypto.randomUUID(), name: catForm.name.trim(), type: catForm.type, icon: catForm.icon }]);
    setCatForm({ name: '', type: 'recurring', icon: 'Building' });
    setCatOpen(false);
  };

  const handleAddExpense = () => {
    const exp: PersonalExpense = {
      id: crypto.randomUUID(), name: expForm.name, cost: parseFloat(expForm.cost) || 0,
      details: expForm.details, category: expForm.category,
      invoiceFiles: expForm.invoiceFiles,
      date: expForm.date?.toISOString() || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    addExpense(exp);
    setExpForm({ name: '', cost: '', details: '', category: '', invoiceFiles: [], date: undefined });
    setAddOpen(false);
  };

  // Calculate financial data
  const totalRevenue = clients.reduce((s, c) => s + c.contracts.reduce((ss, ct) => ss + ct.budget, 0), 0);
  const totalClientCosting = clients.reduce((s, c) => s + c.contracts.reduce((ss, ct) => ss + ct.costing, 0), 0);
  const totalEmployeeSalary = employees.reduce((s, e) => s + e.salary, 0);
  const totalPersonalCosting = expenses.reduce((s, e) => s + e.cost, 0);
  const totalCosting = totalClientCosting + totalEmployeeSalary + totalPersonalCosting;
  const totalProfit = totalRevenue - totalCosting;
  const activeClients = clients.filter(c => c.status === 'in-progress').length;

  // Timeline-based graph data
  const graphData = useMemo(() => {
    const allDates: string[] = [];
    clients.forEach(c => c.contracts.forEach(ct => { if (ct.startDate) allDates.push(ct.startDate); }));
    employees.forEach(e => { if (e.startDate) allDates.push(e.startDate); });
    expenses.forEach(e => { if (e.date) allDates.push(e.date); });

    if (allDates.length === 0) return [];

    allDates.sort();
    const earliest = startOfMonth(new Date(allDates[0]));
    const latest = endOfMonth(new Date());
    const months: { month: string; revenue: number; costing: number; profit: number; employeeCost: number; clientCount: number }[] = [];

    let current = earliest;
    while (isBefore(current, latest) || format(current, 'yyyy-MM') === format(latest, 'yyyy-MM')) {
      const monthStart = startOfMonth(current);
      const monthEnd = endOfMonth(current);
      const label = format(current, 'MMM yyyy');

      let revenue = 0, clientCost = 0, empCost = 0, persCost = 0, clientCount = 0;

      clients.forEach(c => {
        c.contracts.forEach(ct => {
          if (ct.startDate && !isAfter(new Date(ct.startDate), monthEnd) && (!ct.endDate || !isBefore(new Date(ct.endDate), monthStart))) {
            revenue += ct.budget;
            clientCost += ct.costing;
            clientCount++;
          }
        });
      });

      employees.forEach(e => {
        if (e.startDate && !isAfter(new Date(e.startDate), monthEnd) && (!e.endDate || !isBefore(new Date(e.endDate), monthStart))) {
          empCost += e.salary;
        }
      });

      expenses.forEach(e => {
        const d = new Date(e.date);
        if (!isBefore(d, monthStart) && !isAfter(d, monthEnd)) persCost += e.cost;
      });

      const totalCost = clientCost + empCost + persCost;

      // Apply time filter
      const include = (!filterFrom || !isBefore(monthEnd, filterFrom)) && (!filterTo || !isAfter(monthStart, filterTo));
      if (include) {
        months.push({ month: label, revenue, costing: totalCost, profit: revenue - totalCost, employeeCost: empCost, clientCount });
      }

      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }
    return months;
  }, [clients, employees, expenses, filterFrom, filterTo]);

  // Employee cost breakdown
  const employeeCostData = employees.map(e => ({ name: e.name, salary: e.salary }));

  const COLORS = ['hsl(210, 100%, 52%)', 'hsl(160, 60%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)', 'hsl(280, 60%, 50%)', 'hsl(190, 80%, 50%)'];

  const filteredExpenses = expenses.filter(e => {
    if (selectedCat !== 'all' && e.category !== selectedCat) return false;
    return true;
  });

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

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Innovelous Panel</h1>
          <p className="text-muted-foreground mt-1">Company expenses & financial overview</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={catOpen} onOpenChange={setCatOpen}>
            <DialogTrigger asChild><Button variant="outline" className="gap-1"><Plus className="w-4 h-4" /> Add Category</Button></DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle className="font-display">Add Expense Category</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Category Name</Label><Input value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Domain Rent" /></div>
                <div>
                  <Label>Type</Label>
                  <Select value={catForm.type} onValueChange={v => setCatForm(p => ({ ...p, type: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recurring">Recurring</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Icon</Label><IconPicker selected={catForm.icon} onSelect={n => setCatForm(p => ({ ...p, icon: n }))} /></div>
                <Button onClick={handleAddCat} className="w-full">Add Category</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Add Expense</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle className="font-display">Add Expense</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Name *</Label><Input value={expForm.name} onChange={e => setExpForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Domain Rent" /></div>
                <div><Label>Cost (PKR)</Label><Input type="number" value={expForm.cost} onChange={e => setExpForm(p => ({ ...p, cost: e.target.value }))} /></div>
                {expenseCategories.length > 0 && (
                  <div>
                    <Label>Category</Label>
                    <Select value={expForm.category} onValueChange={v => setExpForm(p => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>{expenseCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({c.type})</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                <DatePick date={expForm.date} onSelect={d => setExpForm(p => ({ ...p, date: d }))} label="Date" />
                <div><Label>Details</Label><Textarea value={expForm.details} onChange={e => setExpForm(p => ({ ...p, details: e.target.value }))} rows={3} /></div>
                <FileUploader files={expForm.invoiceFiles} onChange={f => setExpForm(p => ({ ...p, invoiceFiles: f }))} label="Upload Invoice (PDF)" accept=".pdf,.png,.jpg,.jpeg" />
                <Button onClick={handleAddExpense} className="w-full" disabled={!expForm.name}>Add Expense</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="card-gradient rounded-xl border border-border p-4 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><TrendingUp className="w-4 h-4" /> Revenue</div>
          <p className="text-xl font-bold font-display text-foreground">PKR {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="card-gradient rounded-xl border border-border p-4 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><TrendingDown className="w-4 h-4" /> Total Costing</div>
          <p className="text-xl font-bold font-display text-foreground">PKR {totalCosting.toLocaleString()}</p>
        </div>
        <div className="card-gradient rounded-xl border border-border p-4 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><DollarSign className="w-4 h-4" /> Profit</div>
          <p className={cn("text-xl font-bold font-display", totalProfit >= 0 ? "text-accent" : "text-destructive")}>PKR {totalProfit.toLocaleString()}</p>
        </div>
        <div className="card-gradient rounded-xl border border-border p-4 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><Users className="w-4 h-4" /> Active Clients</div>
          <p className="text-xl font-bold font-display text-foreground">{activeClients}</p>
        </div>
        <div className="card-gradient rounded-xl border border-border p-4 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><Building2 className="w-4 h-4" /> Personal Cost</div>
          <p className="text-xl font-bold font-display text-foreground">PKR {totalPersonalCosting.toLocaleString()}</p>
        </div>
      </div>

      {/* Graph Filters */}
      <div className="card-gradient rounded-xl border border-border p-6 shadow-card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-foreground">Financial Growth Overview</h2>
          <div className="flex gap-3">
            <DatePick date={filterFrom} onSelect={setFilterFrom} label="From" />
            <DatePick date={filterTo} onSelect={setFilterTo} label="To" />
            {(filterFrom || filterTo) && <Button variant="ghost" size="sm" onClick={() => { setFilterFrom(undefined); setFilterTo(undefined); }}>Clear</Button>}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Total Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
              <XAxis dataKey="month" stroke="hsl(215, 12%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 12%, 55%)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(220, 18%, 13%)', border: '1px solid hsl(220, 14%, 20%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(210, 100%, 52%)" fill="hsl(210, 100%, 52%)" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Costing Chart */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Total Costing</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
              <XAxis dataKey="month" stroke="hsl(215, 12%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 12%, 55%)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(220, 18%, 13%)', border: '1px solid hsl(220, 14%, 20%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} />
              <Area type="monotone" dataKey="costing" stroke="hsl(0, 72%, 51%)" fill="hsl(0, 72%, 51%)" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Profit Chart */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Profit</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
              <XAxis dataKey="month" stroke="hsl(215, 12%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 12%, 55%)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(220, 18%, 13%)', border: '1px solid hsl(220, 14%, 20%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} />
              <Area type="monotone" dataKey="profit" stroke="hsl(160, 60%, 45%)" fill="hsl(160, 60%, 45%)" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Employee Cost Breakdown */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Employee Payment Breakdown</h3>
          {employeeCostData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
                <XAxis dataKey="name" stroke="hsl(215, 12%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 12%, 55%)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(220, 18%, 13%)', border: '1px solid hsl(220, 14%, 20%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} />
                <Bar dataKey="salary" fill="hsl(210, 100%, 52%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-muted-foreground text-sm">No employees added yet</p>}
        </div>

        {/* Client Count */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Clients Onboard</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
              <XAxis dataKey="month" stroke="hsl(215, 12%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 12%, 55%)" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'hsl(220, 18%, 13%)', border: '1px solid hsl(220, 14%, 20%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} />
              <Line type="monotone" dataKey="clientCount" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ fill: 'hsl(38, 92%, 50%)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Categories & List */}
      <div className="card-gradient rounded-xl border border-border p-6 shadow-card">
        <h2 className="text-xl font-display font-bold text-foreground mb-4">Company Expenses</h2>

        <div className="flex items-center gap-2 flex-wrap mb-4">
          <button onClick={() => setSelectedCat('all')} className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", selectedCat === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted')}>All</button>
          {expenseCategories.map(cat => {
            const Icon = getIconComponent(cat.icon);
            return (
              <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all", selectedCat === cat.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted')}>
                <Icon className="w-4 h-4" />{cat.name}
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {filteredExpenses.map(exp => {
            const cat = expenseCategories.find(c => c.id === exp.category);
            return (
              <div key={exp.id} className="flex items-center justify-between bg-secondary rounded-lg p-4 border border-border">
                <div>
                  <h4 className="font-semibold text-foreground">{exp.name}</h4>
                  <p className="text-sm text-muted-foreground">{cat?.name || 'Uncategorized'} · {format(new Date(exp.date), 'PP')}</p>
                  {exp.details && <p className="text-sm text-muted-foreground mt-1">{exp.details}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-foreground">PKR {exp.cost.toLocaleString()}</p>
                  <button onClick={() => deleteExpense(exp.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
          {filteredExpenses.length === 0 && <p className="text-center text-muted-foreground py-8">No expenses added yet</p>}
        </div>
      </div>
    </div>
  );
}
