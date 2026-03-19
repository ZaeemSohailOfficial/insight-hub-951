import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Client, Employee, PersonalExpense, Category, ExpenseCategory, Invoice, TaskList, TaskItem, TaskFolder, TaskCategory, TaskPhase, Contract, EmployeeContract, InvoiceServiceRow, FileAttachment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AppState {
  clients: Client[];
  employees: Employee[];
  expenses: PersonalExpense[];
  clientCategories: Category[];
  employeeCategories: Category[];
  expenseCategories: ExpenseCategory[];
  invoices: Invoice[];
  taskLists: TaskList[];
  taskFolders: TaskFolder[];
  taskCategories: TaskCategory[];
  loading: boolean;
  setClients: (c: Client[]) => void;
  setEmployees: (e: Employee[]) => void;
  setExpenses: (e: PersonalExpense[]) => void;
  setClientCategories: (c: Category[]) => void;
  setEmployeeCategories: (c: Category[]) => void;
  setExpenseCategories: (c: ExpenseCategory[]) => void;
  setInvoices: (i: Invoice[]) => void;
  setTaskLists: (t: TaskList[]) => void;
  addClient: (c: Client) => void;
  updateClient: (c: Client) => void;
  deleteClient: (id: string) => void;
  addEmployee: (e: Employee) => void;
  updateEmployee: (e: Employee) => void;
  deleteEmployee: (id: string) => void;
  addExpense: (e: PersonalExpense) => void;
  updateExpense: (e: PersonalExpense) => void;
  deleteExpense: (id: string) => void;
  addInvoice: (i: Invoice) => void;
  updateInvoice: (i: Invoice) => void;
  deleteInvoice: (id: string) => void;
  // Task system
  addTaskFolder: (f: TaskFolder) => Promise<void>;
  updateTaskFolder: (f: TaskFolder) => Promise<void>;
  deleteTaskFolder: (id: string) => Promise<void>;
  addTaskCategory: (c: TaskCategory) => Promise<void>;
  updateTaskCategory: (c: TaskCategory) => Promise<void>;
  deleteTaskCategory: (id: string) => Promise<void>;
  addTaskList: (t: TaskList) => Promise<void>;
  updateTaskList: (t: TaskList) => Promise<void>;
  deleteTaskList: (id: string) => Promise<void>;
  addTaskPhase: (phase: TaskPhase) => Promise<void>;
  updateTaskPhase: (phase: TaskPhase) => Promise<void>;
  deleteTaskPhase: (phaseId: string) => Promise<void>;
  addTaskItem: (item: TaskItem, phaseId: string, taskListId: string) => Promise<void>;
  updateTaskItem: (item: TaskItem, phaseId: string, taskListId: string) => Promise<void>;
  deleteTaskItem: (itemId: string, phaseId: string, taskListId: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expenses, setExpenses] = useState<PersonalExpense[]>([]);
  const [clientCategories, setClientCategories] = useState<Category[]>([]);
  const [employeeCategories, setEmployeeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [taskFolders, setTaskFolders] = useState<TaskFolder[]>([]);
  const [taskCategories, setTaskCategories] = useState<TaskCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    const [
      { data: folderRows },
      { data: catRows },
      { data: taskListRows },
      { data: phaseRows },
      { data: taskItemRows },
    ] = await Promise.all([
      supabase.from('task_folders').select('*').order('position'),
      supabase.from('task_categories').select('*'),
      supabase.from('task_lists').select('*').order('position'),
      supabase.from('task_phases').select('*').order('phase_number'),
      supabase.from('task_items').select('*'),
    ]);

    const mappedFolders: TaskFolder[] = (folderRows || []).map((f: any) => ({
      id: f.id, name: f.name, position: f.position, createdAt: f.created_at,
    }));

    const mappedCats: TaskCategory[] = (catRows || []).map((c: any) => ({
      id: c.id, name: c.name, icon: c.icon,
    }));

    const mappedTaskLists: TaskList[] = (taskListRows || []).map((tl: any) => {
      const phases: TaskPhase[] = (phaseRows || [])
        .filter((p: any) => p.task_list_id === tl.id)
        .map((p: any) => ({
          id: p.id,
          taskListId: p.task_list_id,
          name: p.name,
          phaseNumber: p.phase_number,
          isCurrent: p.is_current,
          createdAt: p.created_at,
          tasks: (taskItemRows || [])
            .filter((ti: any) => ti.phase_id === p.id)
            .map((ti: any): TaskItem => ({
              id: ti.id, text: ti.text, done: ti.done,
              phaseId: ti.phase_id,
              taskType: ti.task_type || 'single',
              repeatInterval: ti.repeat_interval || undefined,
              customIntervalDays: ti.custom_interval_days || undefined,
            })),
        }));

      const legacyTasks = (taskItemRows || [])
        .filter((ti: any) => ti.task_list_id === tl.id && !ti.phase_id)
        .map((ti: any): TaskItem => ({
          id: ti.id, text: ti.text, done: ti.done,
          taskType: ti.task_type || 'single',
          repeatInterval: ti.repeat_interval || undefined,
          customIntervalDays: ti.custom_interval_days || undefined,
        }));

      const allTasks = [...phases.flatMap(p => p.tasks), ...legacyTasks];

      return {
        id: tl.id,
        name: tl.name,
        folderId: tl.folder_id || undefined,
        categoryId: tl.category_id || undefined,
        position: tl.position || 0,
        phases,
        createdAt: tl.created_at,
        tasks: allTasks,
      };
    });

    setTaskFolders(mappedFolders);
    setTaskCategories(mappedCats);
    setTaskLists(mappedTaskLists);
  }, []);

  const processRepetitiveTasks = useCallback(async () => {
    try {
      const { data: currentPhases } = await supabase.from('task_phases').select('*').eq('is_current', true);
      if (!currentPhases || currentPhases.length === 0) return;

      const now = new Date();
      let changed = false;
      for (const phase of currentPhases) {
        const { data: repetitiveTasks } = await supabase
          .from('task_items').select('*')
          .eq('phase_id', phase.id).eq('task_type', 'repetitive');
        if (!repetitiveTasks || repetitiveTasks.length === 0) continue;

        const phaseCreatedAt = new Date(phase.created_at);
        let shouldCreateNewPhase = false;

        for (const task of repetitiveTasks) {
          const intervalDays = getIntervalDays(task.repeat_interval, task.custom_interval_days);
          if (intervalDays <= 0) continue;
          const nextDue = new Date(phaseCreatedAt.getTime() + intervalDays * 24 * 60 * 60 * 1000);
          if (now >= nextDue) { shouldCreateNewPhase = true; break; }
        }
        if (!shouldCreateNewPhase) continue;

        const newPhaseNumber = phase.phase_number + 1;
        const newPhaseId = crypto.randomUUID();
        await supabase.from('task_phases').update({ is_current: false }).eq('id', phase.id);
        await supabase.from('task_phases').insert({
          id: newPhaseId, task_list_id: phase.task_list_id,
          name: `Phase ${newPhaseNumber} (Auto)`, phase_number: newPhaseNumber, is_current: true,
        });
        const newTasks = repetitiveTasks.map(task => ({
          id: crypto.randomUUID(), task_list_id: phase.task_list_id, phase_id: newPhaseId,
          text: task.text, done: false, task_type: 'repetitive',
          repeat_interval: task.repeat_interval, custom_interval_days: task.custom_interval_days,
        }));
        if (newTasks.length > 0) await supabase.from('task_items').insert(newTasks);
        changed = true;
      }
      if (changed) await fetchTasks();
    } catch (err) { console.error('processRepetitiveTasks error:', err); }
  }, [fetchTasks]);

  // ── Fetch all data on mount ──
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: clientRows },
        { data: contractRows },
        { data: empRows },
        { data: empContractRows },
        { data: expenseRows },
        { data: clientCatRows },
        { data: empCatRows },
        { data: expCatRows },
        { data: invoiceRows },
        { data: serviceRows },
      ] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('client_contracts').select('*'),
        supabase.from('employees').select('*'),
        supabase.from('employee_contracts').select('*'),
        supabase.from('personal_expenses').select('*'),
        supabase.from('client_categories').select('*'),
        supabase.from('employee_categories').select('*'),
        supabase.from('expense_categories').select('*'),
        supabase.from('invoices').select('*'),
        supabase.from('invoice_services').select('*'),
      ]);

      const mappedClients: Client[] = (clientRows || []).map((c: any) => ({
        id: c.id, name: c.name, email: c.email, phone: c.phone,
        company: c.company, details: c.details, categories: c.categories || [],
        status: c.status as 'in-progress' | 'completed', position: c.position || 0, createdAt: c.created_at,
        contracts: (contractRows || [])
          .filter((ct: any) => ct.client_id === c.id)
          .map((ct: any): Contract => ({
            id: ct.id, timeline: ct.timeline, startDate: ct.start_date,
            endDate: ct.end_date, budget: Number(ct.budget), costing: Number(ct.costing),
            profit: Number(ct.profit), mouDetails: ct.mou_details,
            mouFiles: (ct.mou_files || []) as FileAttachment[],
            isRenewal: ct.is_renewal, renewalDate: ct.renewal_date || undefined,
          })),
      }));

      const mappedEmployees: Employee[] = (empRows || []).map((e: any) => ({
        id: e.id, name: e.name, email: e.email, phone: e.phone,
        position: e.position, categories: e.categories || [], salary: Number(e.salary),
        startDate: e.start_date, endDate: e.end_date, mouDetails: e.mou_details,
        mouFiles: (e.mou_files || []) as FileAttachment[], additionalInfo: e.additional_info,
        status: e.status as 'active' | 'inactive', createdAt: e.created_at,
        contracts: (empContractRows || [])
          .filter((ct: any) => ct.employee_id === e.id)
          .map((ct: any): EmployeeContract => ({
            id: ct.id, startDate: ct.start_date, endDate: ct.end_date,
            salary: Number(ct.salary), mouDetails: ct.mou_details,
            mouFiles: (ct.mou_files || []) as FileAttachment[], isRenewal: ct.is_renewal,
          })),
      }));

      const mappedExpenses: PersonalExpense[] = (expenseRows || []).map((e: any) => ({
        id: e.id, name: e.name, cost: Number(e.cost), details: e.details,
        category: e.category, invoiceFiles: (e.invoice_files || []) as FileAttachment[],
        date: e.date, createdAt: e.created_at,
      }));

      const mappedClientCats: Category[] = (clientCatRows || []).map((c: any) => ({ id: c.id, name: c.name, icon: c.icon }));
      const mappedEmpCats: Category[] = (empCatRows || []).map((c: any) => ({ id: c.id, name: c.name, icon: c.icon }));
      const mappedExpCats: ExpenseCategory[] = (expCatRows || []).map((c: any) => ({
        id: c.id, name: c.name, type: c.type as 'recurring' | 'one-time', icon: c.icon,
      }));

      const mappedInvoices: Invoice[] = (invoiceRows || []).map((inv: any) => ({
        id: inv.id, logoDataUrl: inv.logo_data_url || undefined,
        title: inv.title, companyName: inv.company_name, companyType: inv.company_type,
        companyEmail: inv.company_email, companyPhone: inv.company_phone,
        companyAddress: inv.company_address, invoiceNumber: inv.invoice_number,
        invoiceDate: inv.invoice_date, clientBrand: inv.client_brand,
        clientOwner: inv.client_owner, clientCnic: inv.client_cnic,
        clientAccount: inv.client_account, clientAddress: inv.client_address,
        totalCost: Number(inv.total_cost), founderName: inv.founder_name,
        founderCnic: inv.founder_cnic, founderAccount: inv.founder_account,
        paymentTerms: inv.payment_terms, createdAt: inv.created_at,
        services: (serviceRows || [])
          .filter((s: any) => s.invoice_id === inv.id)
          .map((s: any): InvoiceServiceRow => ({
            id: s.id, service: s.service, description: s.description, cost: Number(s.cost),
          })),
      }));

      setClients(mappedClients);
      setEmployees(mappedEmployees);
      setExpenses(mappedExpenses);
      setClientCategories(mappedClientCats);
      setEmployeeCategories(mappedEmpCats);
      setExpenseCategories(mappedExpCats);
      setInvoices(mappedInvoices);

      await fetchTasks();
      // Process repetitive tasks on app open
      await processRepetitiveTasks();
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.error('Failed to load data from database');
    } finally {
      setLoading(false);
    }
  }, [fetchTasks]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Client CRUD ──
  const addClient = async (c: Client) => {
    setClients(prev => [...prev, c]);
    const { error } = await supabase.from('clients').insert({
      id: c.id, name: c.name, email: c.email, phone: c.phone,
      company: c.company, details: c.details, categories: c.categories,
      status: c.status, position: c.position, created_at: c.createdAt,
    });
    if (error) { toast.error('Failed to save client'); console.error(error); return; }
    if (c.contracts.length > 0) {
      await supabase.from('client_contracts').insert(
        c.contracts.map(ct => ({
          id: ct.id, client_id: c.id, timeline: ct.timeline,
          start_date: ct.startDate, end_date: ct.endDate,
          budget: ct.budget, costing: ct.costing, profit: ct.profit,
          mou_details: ct.mouDetails, mou_files: ct.mouFiles as any,
          is_renewal: ct.isRenewal, renewal_date: ct.renewalDate || null,
        }))
      );
    }
  };

  const updateClient = async (c: Client) => {
    setClients(prev => prev.map(x => x.id === c.id ? c : x));
    await supabase.from('clients').update({
      name: c.name, email: c.email, phone: c.phone,
      company: c.company, details: c.details, categories: c.categories, status: c.status, position: c.position,
    }).eq('id', c.id);
    await supabase.from('client_contracts').delete().eq('client_id', c.id);
    if (c.contracts.length > 0) {
      await supabase.from('client_contracts').insert(
        c.contracts.map(ct => ({
          id: ct.id, client_id: c.id, timeline: ct.timeline,
          start_date: ct.startDate, end_date: ct.endDate,
          budget: ct.budget, costing: ct.costing, profit: ct.profit,
          mou_details: ct.mouDetails, mou_files: ct.mouFiles as any,
          is_renewal: ct.isRenewal, renewal_date: ct.renewalDate || null,
        }))
      );
    }
  };

  const deleteClient = async (id: string) => {
    setClients(prev => prev.filter(x => x.id !== id));
    await supabase.from('clients').delete().eq('id', id);
  };

  // ── Employee CRUD ──
  const addEmployee = async (e: Employee) => {
    setEmployees(prev => [...prev, e]);
    await supabase.from('employees').insert({
      id: e.id, name: e.name, email: e.email, phone: e.phone,
      position: e.position, categories: e.categories, salary: e.salary,
      start_date: e.startDate, end_date: e.endDate,
      mou_details: e.mouDetails, mou_files: e.mouFiles as any,
      additional_info: e.additionalInfo, status: e.status, created_at: e.createdAt,
    });
    if (e.contracts.length > 0) {
      await supabase.from('employee_contracts').insert(
        e.contracts.map(ct => ({
          id: ct.id, employee_id: e.id,
          start_date: ct.startDate, end_date: ct.endDate,
          salary: ct.salary, mou_details: ct.mouDetails,
          mou_files: ct.mouFiles as any, is_renewal: ct.isRenewal,
        }))
      );
    }
  };

  const updateEmployee = async (e: Employee) => {
    setEmployees(prev => prev.map(x => x.id === e.id ? e : x));
    await supabase.from('employees').update({
      name: e.name, email: e.email, phone: e.phone,
      position: e.position, categories: e.categories, salary: e.salary,
      start_date: e.startDate, end_date: e.endDate,
      mou_details: e.mouDetails, mou_files: e.mouFiles as any,
      additional_info: e.additionalInfo, status: e.status,
    }).eq('id', e.id);
    await supabase.from('employee_contracts').delete().eq('employee_id', e.id);
    if (e.contracts.length > 0) {
      await supabase.from('employee_contracts').insert(
        e.contracts.map(ct => ({
          id: ct.id, employee_id: e.id,
          start_date: ct.startDate, end_date: ct.endDate,
          salary: ct.salary, mou_details: ct.mouDetails,
          mou_files: ct.mouFiles as any, is_renewal: ct.isRenewal,
        }))
      );
    }
  };

  const deleteEmployee = async (id: string) => {
    setEmployees(prev => prev.filter(x => x.id !== id));
    await supabase.from('employees').delete().eq('id', id);
  };

  // ── Expense CRUD ──
  const addExpense = async (e: PersonalExpense) => {
    setExpenses(prev => [...prev, e]);
    await supabase.from('personal_expenses').insert({
      id: e.id, name: e.name, cost: e.cost, details: e.details,
      category: e.category, invoice_files: e.invoiceFiles as any,
      date: e.date, created_at: e.createdAt,
    });
  };

  const updateExpense = async (e: PersonalExpense) => {
    setExpenses(prev => prev.map(x => x.id === e.id ? e : x));
    await supabase.from('personal_expenses').update({
      name: e.name, cost: e.cost, details: e.details,
      category: e.category, invoice_files: e.invoiceFiles as any, date: e.date,
    }).eq('id', e.id);
  };

  const deleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(x => x.id !== id));
    await supabase.from('personal_expenses').delete().eq('id', id);
  };

  // ── Invoice CRUD ──
  const addInvoice = async (i: Invoice) => {
    setInvoices(prev => [...prev, i]);
    await supabase.from('invoices').insert({
      id: i.id, logo_data_url: i.logoDataUrl || null,
      title: i.title, company_name: i.companyName, company_type: i.companyType,
      company_email: i.companyEmail, company_phone: i.companyPhone,
      company_address: i.companyAddress, invoice_number: i.invoiceNumber,
      invoice_date: i.invoiceDate, client_brand: i.clientBrand,
      client_owner: i.clientOwner, client_cnic: i.clientCnic,
      client_account: i.clientAccount, client_address: i.clientAddress,
      total_cost: i.totalCost, founder_name: i.founderName,
      founder_cnic: i.founderCnic, founder_account: i.founderAccount,
      payment_terms: i.paymentTerms, created_at: i.createdAt,
    });
    if (i.services.length > 0) {
      await supabase.from('invoice_services').insert(
        i.services.map(s => ({
          id: s.id, invoice_id: i.id, service: s.service,
          description: s.description, cost: s.cost,
        }))
      );
    }
  };

  const updateInvoice = async (i: Invoice) => {
    setInvoices(prev => prev.map(x => x.id === i.id ? i : x));
    await supabase.from('invoices').update({
      logo_data_url: i.logoDataUrl || null,
      title: i.title, company_name: i.companyName, company_type: i.companyType,
      company_email: i.companyEmail, company_phone: i.companyPhone,
      company_address: i.companyAddress, invoice_number: i.invoiceNumber,
      invoice_date: i.invoiceDate, client_brand: i.clientBrand,
      client_owner: i.clientOwner, client_cnic: i.clientCnic,
      client_account: i.clientAccount, client_address: i.clientAddress,
      total_cost: i.totalCost, founder_name: i.founderName,
      founder_cnic: i.founderCnic, founder_account: i.founderAccount,
      payment_terms: i.paymentTerms,
    }).eq('id', i.id);
    await supabase.from('invoice_services').delete().eq('invoice_id', i.id);
    if (i.services.length > 0) {
      await supabase.from('invoice_services').insert(
        i.services.map(s => ({
          id: s.id, invoice_id: i.id, service: s.service,
          description: s.description, cost: s.cost,
        }))
      );
    }
  };

  const deleteInvoice = async (id: string) => {
    setInvoices(prev => prev.filter(x => x.id !== id));
    await supabase.from('invoices').delete().eq('id', id);
  };

  // ── Task Folder CRUD ──
  const addTaskFolder = async (f: TaskFolder) => {
    setTaskFolders(prev => [...prev, f]);
    await supabase.from('task_folders').insert({
      id: f.id, name: f.name, position: f.position,
    });
  };

  const updateTaskFolder = async (f: TaskFolder) => {
    setTaskFolders(prev => prev.map(x => x.id === f.id ? f : x));
    await supabase.from('task_folders').update({
      name: f.name, position: f.position,
    }).eq('id', f.id);
  };

  const deleteTaskFolder = async (id: string) => {
    setTaskFolders(prev => prev.filter(x => x.id !== id));
    // Unset folder_id on task lists in this folder
    await supabase.from('task_lists').update({ folder_id: null }).eq('folder_id', id);
    await supabase.from('task_folders').delete().eq('id', id);
    await fetchTasks();
  };

  // ── Task Category CRUD ──
  const addTaskCategory = async (c: TaskCategory) => {
    setTaskCategories(prev => [...prev, c]);
    await supabase.from('task_categories').insert({
      id: c.id, name: c.name, icon: c.icon,
    });
  };

  const updateTaskCategory = async (c: TaskCategory) => {
    setTaskCategories(prev => prev.map(x => x.id === c.id ? c : x));
    await supabase.from('task_categories').update({
      name: c.name, icon: c.icon,
    }).eq('id', c.id);
  };

  const deleteTaskCategory = async (id: string) => {
    setTaskCategories(prev => prev.filter(x => x.id !== id));
    await supabase.from('task_lists').update({ category_id: null }).eq('category_id', id);
    await supabase.from('task_categories').delete().eq('id', id);
    await fetchTasks();
  };

  // ── TaskList CRUD ──
  const addTaskList = async (t: TaskList) => {
    setTaskLists(prev => [...prev, t]);
    await supabase.from('task_lists').insert({
      id: t.id, name: t.name, folder_id: t.folderId || null,
      category_id: t.categoryId || null, position: t.position,
      created_at: t.createdAt,
    });
    // Create initial phase
    if (t.phases.length > 0) {
      for (const phase of t.phases) {
        await supabase.from('task_phases').insert({
          id: phase.id, task_list_id: t.id, name: phase.name,
          phase_number: phase.phaseNumber, is_current: phase.isCurrent,
        });
      }
    }
  };

  const updateTaskList = async (t: TaskList) => {
    setTaskLists(prev => prev.map(x => x.id === t.id ? t : x));
    await supabase.from('task_lists').update({
      name: t.name, folder_id: t.folderId || null,
      category_id: t.categoryId || null, position: t.position,
    }).eq('id', t.id);
  };

  const deleteTaskList = async (id: string) => {
    setTaskLists(prev => prev.filter(x => x.id !== id));
    await supabase.from('task_lists').delete().eq('id', id);
  };

  // ── Task Phase CRUD ──
  const addTaskPhase = async (phase: TaskPhase) => {
    // Mark old phases as not current
    await supabase.from('task_phases').update({ is_current: false }).eq('task_list_id', phase.taskListId);
    await supabase.from('task_phases').insert({
      id: phase.id, task_list_id: phase.taskListId, name: phase.name,
      phase_number: phase.phaseNumber, is_current: phase.isCurrent,
    });
    await fetchTasks();
  };

  const updateTaskPhase = async (phase: TaskPhase) => {
    await supabase.from('task_phases').update({
      name: phase.name, is_current: phase.isCurrent,
    }).eq('id', phase.id);
    await fetchTasks();
  };

  const deleteTaskPhase = async (phaseId: string) => {
    await supabase.from('task_phases').delete().eq('id', phaseId);
    await fetchTasks();
  };

  // ── Task Item CRUD ──
  const addTaskItem = async (item: TaskItem, phaseId: string, taskListId: string) => {
    await supabase.from('task_items').insert({
      id: item.id, task_list_id: taskListId, phase_id: phaseId,
      text: item.text, done: item.done,
      task_type: item.taskType, repeat_interval: item.repeatInterval || null,
      custom_interval_days: item.customIntervalDays || null,
    });
    await fetchTasks();
  };

  const updateTaskItem = async (item: TaskItem, phaseId: string, taskListId: string) => {
    await supabase.from('task_items').update({
      text: item.text, done: item.done,
      task_type: item.taskType, repeat_interval: item.repeatInterval || null,
      custom_interval_days: item.customIntervalDays || null,
    }).eq('id', item.id);
    await fetchTasks();
  };

  const deleteTaskItem = async (itemId: string, phaseId: string, taskListId: string) => {
    await supabase.from('task_items').delete().eq('id', itemId);
    await fetchTasks();
  };

  // ── Category setters (bulk replace) ──
  const setClientCategoriesSync = async (cats: Category[]) => {
    setClientCategories(cats);
    await supabase.from('client_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (cats.length > 0) {
      await supabase.from('client_categories').insert(
        cats.map(c => ({ id: c.id, name: c.name, icon: c.icon }))
      );
    }
  };

  const setEmployeeCategoriesSync = async (cats: Category[]) => {
    setEmployeeCategories(cats);
    await supabase.from('employee_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (cats.length > 0) {
      await supabase.from('employee_categories').insert(
        cats.map(c => ({ id: c.id, name: c.name, icon: c.icon }))
      );
    }
  };

  const setExpenseCategoriesSync = async (cats: ExpenseCategory[]) => {
    setExpenseCategories(cats);
    await supabase.from('expense_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (cats.length > 0) {
      await supabase.from('expense_categories').insert(
        cats.map(c => ({ id: c.id, name: c.name, type: c.type, icon: c.icon }))
      );
    }
  };

  return (
    <AppContext.Provider value={{
      clients, employees, expenses, clientCategories, employeeCategories, expenseCategories, invoices, taskLists,
      taskFolders, taskCategories, loading,
      setClients, setEmployees, setExpenses,
      setClientCategories: setClientCategoriesSync,
      setEmployeeCategories: setEmployeeCategoriesSync,
      setExpenseCategories: setExpenseCategoriesSync,
      setInvoices, setTaskLists,
      addClient, updateClient, deleteClient,
      addEmployee, updateEmployee, deleteEmployee,
      addExpense, updateExpense, deleteExpense,
      addInvoice, updateInvoice, deleteInvoice,
      addTaskFolder, updateTaskFolder, deleteTaskFolder,
      addTaskCategory, updateTaskCategory, deleteTaskCategory,
      addTaskList, updateTaskList, deleteTaskList,
      addTaskPhase, updateTaskPhase, deleteTaskPhase,
      addTaskItem, updateTaskItem, deleteTaskItem,
      refreshTasks: fetchTasks,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
