import { useState, useRef } from 'react';
import { useAppState } from '@/store/AppContext';
import { Invoice, InvoiceServiceRow } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Plus, CalendarIcon, Search, FileText, Download, Edit, Trash2, X, Eye } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function InvoicePanel() {
  const { invoices, addInvoice, updateInvoice, deleteInvoice } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Form state
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [title, setTitle] = useState('INVOICE');
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>();
  const [clientBrand, setClientBrand] = useState('');
  const [clientOwner, setClientOwner] = useState('');
  const [clientCnic, setClientCnic] = useState('');
  const [clientAccount, setClientAccount] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [services, setServices] = useState<InvoiceServiceRow[]>([{ id: crypto.randomUUID(), service: '', description: '', cost: 0 }]);
  const [founderName, setFounderName] = useState('');
  const [founderCnic, setFounderCnic] = useState('');
  const [founderAccount, setFounderAccount] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');

  const resetForm = () => {
    setLogoDataUrl(''); setTitle('INVOICE'); setCompanyName(''); setCompanyType('');
    setCompanyEmail(''); setCompanyPhone(''); setCompanyAddress('');
    setInvoiceNumber(''); setInvoiceDate(undefined);
    setClientBrand(''); setClientOwner(''); setClientCnic(''); setClientAccount(''); setClientAddress('');
    setServices([{ id: crypto.randomUUID(), service: '', description: '', cost: 0 }]);
    setFounderName(''); setFounderCnic(''); setFounderAccount(''); setPaymentTerms('');
    setEditingInvoice(null);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addServiceRow = () => setServices(prev => [...prev, { id: crypto.randomUUID(), service: '', description: '', cost: 0 }]);
  const removeServiceRow = (id: string) => setServices(prev => prev.filter(s => s.id !== id));
  const updateServiceRow = (id: string, field: keyof InvoiceServiceRow, value: string | number) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const totalCost = services.reduce((sum, s) => sum + (Number(s.cost) || 0), 0);

  const handleSave = () => {
    const inv: Invoice = {
      id: editingInvoice?.id || crypto.randomUUID(),
      logoDataUrl, title, companyName, companyType, companyEmail, companyPhone, companyAddress,
      invoiceNumber, invoiceDate: invoiceDate?.toISOString() || '',
      clientBrand, clientOwner, clientCnic, clientAccount, clientAddress,
      services, totalCost,
      founderName, founderCnic, founderAccount, paymentTerms,
      createdAt: editingInvoice?.createdAt || new Date().toISOString(),
    };
    if (editingInvoice) updateInvoice(inv); else addInvoice(inv);
    resetForm();
    setFormOpen(false);
    setViewingInvoice(inv);
  };

  const startEdit = (inv: Invoice) => {
    setLogoDataUrl(inv.logoDataUrl || ''); setTitle(inv.title); setCompanyName(inv.companyName);
    setCompanyType(inv.companyType); setCompanyEmail(inv.companyEmail); setCompanyPhone(inv.companyPhone);
    setCompanyAddress(inv.companyAddress); setInvoiceNumber(inv.invoiceNumber);
    setInvoiceDate(inv.invoiceDate ? new Date(inv.invoiceDate) : undefined);
    setClientBrand(inv.clientBrand); setClientOwner(inv.clientOwner); setClientCnic(inv.clientCnic);
    setClientAccount(inv.clientAccount); setClientAddress(inv.clientAddress);
    setServices(inv.services.length ? inv.services : [{ id: crypto.randomUUID(), service: '', description: '', cost: 0 }]);
    setFounderName(inv.founderName); setFounderCnic(inv.founderCnic); setFounderAccount(inv.founderAccount);
    setPaymentTerms(inv.paymentTerms); setEditingInvoice(inv); setFormOpen(true);
  };

  const downloadPdf = async (inv: Invoice) => {
    setViewingInvoice(inv);
    // Wait for render
    await new Promise(r => setTimeout(r, 300));
    const el = invoiceRef.current;
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
    pdf.save(`${inv.invoiceNumber || 'invoice'}.pdf`);
  };

  const filtered = invoices.filter(inv =>
    !searchQuery || inv.clientBrand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Invoice preview component (A4 format matching reference)
  const InvoicePreview = ({ inv }: { inv: Invoice }) => (
    <div ref={invoiceRef} style={{ width: '210mm', minHeight: '297mm', padding: '20mm', fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#000', background: '#fff' }}>
      {/* Logo & Title */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        {inv.logoDataUrl && <img src={inv.logoDataUrl} alt="Logo" style={{ maxHeight: '80px', marginBottom: '10px' }} />}
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#4B0082', margin: '10px 0' }}>{inv.title}</h1>
      </div>

      {/* Company Info */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontWeight: 'bold' }}>{inv.companyName}</p>
        <p>{inv.companyType}</p>
        <p>{inv.companyEmail} | {inv.companyPhone}</p>
        <p>Address: {inv.companyAddress}</p>
      </div>

      {/* Invoice Details */}
      <div style={{ marginBottom: '16px' }}>
        <p><strong>Invoice No:</strong> {inv.invoiceNumber}</p>
        <p><strong>Date:</strong> {inv.invoiceDate ? format(new Date(inv.invoiceDate), 'dd-MM-yyyy') : 'N/A'}</p>
      </div>

      {/* Client Info */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontWeight: 'bold' }}>Bill To:</p>
        <p><strong>{inv.clientBrand}</strong></p>
        <p>Owner: {inv.clientOwner}</p>
        <p>CNIC: {inv.clientCnic}</p>
        <p>Account Number: {inv.clientAccount}</p>
        <p>Address: {inv.clientAddress}</p>
      </div>

      {/* Services Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
        <thead>
          <tr style={{ background: '#4B0082', color: '#fff' }}>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #4B0082' }}>Service</th>
            <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #4B0082' }}>Description</th>
            <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #4B0082' }}>Cost (PKR)</th>
          </tr>
        </thead>
        <tbody>
          {inv.services.map(s => (
            <tr key={s.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{s.service}</td>
              <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>{s.description}</td>
              <td style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>{Number(s.cost).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ textAlign: 'right', marginBottom: '30px', padding: '8px', background: '#e8e0f0', fontWeight: 'bold', fontSize: '14px' }}>
        {inv.totalCost.toLocaleString()} PKR
      </div>

      {/* Founder Info */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontWeight: 'bold' }}>{inv.companyName} Founder:</p>
        <p>{inv.founderName}</p>
        <p>CNIC: {inv.founderCnic}</p>
        <p>Account Number: {inv.founderAccount}</p>
      </div>

      {/* Payment Terms */}
      {inv.paymentTerms && (
        <div style={{ marginBottom: '20px' }}>
          <p><strong>Payment Terms:</strong> {inv.paymentTerms}</p>
        </div>
      )}

      <p style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '30px', color: '#333' }}>
        We appreciate your trust in {inv.companyName} and look forward to a successful collaboration.
      </p>
    </div>
  );

  // Viewing an invoice
  if (viewingInvoice) {
    const inv = invoices.find(i => i.id === viewingInvoice.id) || viewingInvoice;
    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" onClick={() => setViewingInvoice(null)}>← Back</Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={() => startEdit(inv)} className="gap-1"><Edit className="w-4 h-4" /> Edit</Button>
          <Button variant="outline" size="sm" onClick={() => downloadPdf(inv)} className="gap-1"><Download className="w-4 h-4" /> Download PDF</Button>
          <Button variant="outline" size="sm" onClick={() => setDeleteId(inv.id)} className="gap-1 text-destructive"><Trash2 className="w-4 h-4" /> Delete</Button>
        </div>
        <div className="bg-white rounded-lg shadow-lg overflow-auto max-h-[80vh]">
          <InvoicePreview inv={inv} />
        </div>
        <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Invoice?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteInvoice(deleteId!); setDeleteId(null); setViewingInvoice(null); }} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Invoice Panel</h1>
          <p className="text-muted-foreground mt-1">{invoices.length} invoices created</p>
        </div>
        <Button className="gap-2" onClick={() => { resetForm(); setFormOpen(true); }}><Plus className="w-4 h-4" /> Create Invoice</Button>
      </div>

      <div className="relative max-w-xs mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search invoices..." className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(inv => (
          <div key={inv.id} className="card-gradient rounded-xl border border-border p-5 shadow-card hover:shadow-elevated transition-all cursor-pointer" onClick={() => setViewingInvoice(inv)}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display font-semibold text-foreground">{inv.invoiceNumber || 'No Number'}</h3>
                <p className="text-sm text-muted-foreground">{inv.clientBrand}</p>
              </div>
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="text-sm space-y-1">
              <p className="text-muted-foreground">{inv.invoiceDate ? format(new Date(inv.invoiceDate), 'PP') : 'No date'}</p>
              <p className="font-medium text-accent">PKR {inv.totalCost.toLocaleString()}</p>
            </div>
            <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="sm" onClick={() => startEdit(inv)}><Edit className="w-3 h-3" /></Button>
              <Button variant="ghost" size="sm" onClick={() => downloadPdf(inv)}><Download className="w-3 h-3" /></Button>
              <Button variant="ghost" size="sm" onClick={() => setDeleteId(inv.id)} className="text-destructive"><Trash2 className="w-3 h-3" /></Button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg">No invoices found</p>
          <p className="text-sm">Create your first invoice to get started</p>
        </div>
      )}

      {/* Create/Edit Invoice Dialog */}
      <Dialog open={formOpen} onOpenChange={o => { if (!o) { resetForm(); } setFormOpen(o); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editingInvoice ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle></DialogHeader>
          <div className="space-y-6">
            {/* Logo */}
            <div>
              <Label>Company Logo</Label>
              <div className="flex items-center gap-4 mt-1">
                {logoDataUrl && <img src={logoDataUrl} alt="Logo" className="h-12 rounded" />}
                <Input type="file" accept="image/*" onChange={handleLogoUpload} />
              </div>
            </div>

            <div><Label>Invoice Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="INVOICE" /></div>

            {/* Company Info */}
            <div className="border border-border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Company Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Company Name</Label><Input value={companyName} onChange={e => setCompanyName(e.target.value)} /></div>
                <div><Label>Company Type</Label><Input value={companyType} onChange={e => setCompanyType(e.target.value)} placeholder="e.g. Technology & Digital Solutions" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email</Label><Input value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} /></div>
                <div><Label>Contact Number</Label><Input value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} /></div>
              </div>
              <div><Label>Address</Label><Input value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} /></div>
            </div>

            {/* Invoice Details */}
            <div className="border border-border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Invoice Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Invoice Number</Label><Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="e.g. INV-20250915" /></div>
                <div>
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !invoiceDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />{invoiceDate ? format(invoiceDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={invoiceDate} onSelect={setInvoiceDate} className="p-3 pointer-events-auto" /></PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Client Data */}
            <div className="border border-border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Client Data</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Bill To (Brand Name)</Label><Input value={clientBrand} onChange={e => setClientBrand(e.target.value)} /></div>
                <div><Label>Owner Name</Label><Input value={clientOwner} onChange={e => setClientOwner(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>CNIC</Label><Input value={clientCnic} onChange={e => setClientCnic(e.target.value)} /></div>
                <div><Label>Account Number</Label><Input value={clientAccount} onChange={e => setClientAccount(e.target.value)} /></div>
              </div>
              <div><Label>Address</Label><Input value={clientAddress} onChange={e => setClientAddress(e.target.value)} /></div>
            </div>

            {/* Services Table */}
            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-sm">Services</h3>
                <Button variant="outline" size="sm" onClick={addServiceRow} className="gap-1"><Plus className="w-3 h-3" /> Add Row</Button>
              </div>
              <div className="space-y-2">
                {services.map((s, idx) => (
                  <div key={s.id} className="grid grid-cols-[1fr_1.5fr_120px_32px] gap-2 items-end">
                    <div>
                      {idx === 0 && <Label className="text-xs">Service</Label>}
                      <Input value={s.service} onChange={e => updateServiceRow(s.id, 'service', e.target.value)} placeholder="Service name" />
                    </div>
                    <div>
                      {idx === 0 && <Label className="text-xs">Description</Label>}
                      <Input value={s.description} onChange={e => updateServiceRow(s.id, 'description', e.target.value)} placeholder="Description" />
                    </div>
                    <div>
                      {idx === 0 && <Label className="text-xs">Cost (PKR)</Label>}
                      <Input type="number" value={s.cost || ''} onChange={e => updateServiceRow(s.id, 'cost', Number(e.target.value))} />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeServiceRow(s.id)} className="text-destructive h-10" disabled={services.length === 1}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="text-right font-bold text-foreground text-lg">Total: PKR {totalCost.toLocaleString()}</div>
            </div>

            {/* Founder Info */}
            <div className="border border-border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Founder / Receiving Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Founder Name</Label><Input value={founderName} onChange={e => setFounderName(e.target.value)} /></div>
                <div><Label>CNIC</Label><Input value={founderCnic} onChange={e => setFounderCnic(e.target.value)} /></div>
              </div>
              <div><Label>Account Number (Receiving Bank)</Label><Input value={founderAccount} onChange={e => setFounderAccount(e.target.value)} /></div>
            </div>

            {/* Payment Terms */}
            <div><Label>Payment Terms</Label><Textarea value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} rows={3} placeholder="Enter payment terms..." /></div>

            <Button onClick={handleSave} className="w-full" disabled={!companyName && !clientBrand}>
              {editingInvoice ? 'Save Changes' : 'Generate Invoice'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Invoice?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteInvoice(deleteId!); setDeleteId(null); }} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hidden invoice for PDF generation */}
      {viewingInvoice && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <InvoicePreview inv={viewingInvoice} />
        </div>
      )}
    </div>
  );
}
