import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Employee, PersonalExpense, Category, ExpenseCategory, Invoice, TaskList } from '@/types';

interface AppState {
  clients: Client[];
  employees: Employee[];
  expenses: PersonalExpense[];
  clientCategories: Category[];
  employeeCategories: Category[];
  expenseCategories: ExpenseCategory[];
  invoices: Invoice[];
  taskLists: TaskList[];
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
  addTaskList: (t: TaskList) => void;
  updateTaskList: (t: TaskList) => void;
  deleteTaskList: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch { return fallback; }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(() => loadFromStorage('app_clients', []));
  const [employees, setEmployees] = useState<Employee[]>(() => loadFromStorage('app_employees', []));
  const [expenses, setExpenses] = useState<PersonalExpense[]>(() => loadFromStorage('app_expenses', []));
  const [clientCategories, setClientCategories] = useState<Category[]>(() => loadFromStorage('app_client_cats', []));
  const [employeeCategories, setEmployeeCategories] = useState<Category[]>(() => loadFromStorage('app_employee_cats', []));
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(() => loadFromStorage('app_expense_cats', []));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadFromStorage('app_invoices', []));
  const [taskLists, setTaskLists] = useState<TaskList[]>(() => loadFromStorage('app_tasklists', []));

  useEffect(() => { localStorage.setItem('app_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('app_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('app_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('app_client_cats', JSON.stringify(clientCategories)); }, [clientCategories]);
  useEffect(() => { localStorage.setItem('app_employee_cats', JSON.stringify(employeeCategories)); }, [employeeCategories]);
  useEffect(() => { localStorage.setItem('app_expense_cats', JSON.stringify(expenseCategories)); }, [expenseCategories]);
  useEffect(() => { localStorage.setItem('app_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('app_tasklists', JSON.stringify(taskLists)); }, [taskLists]);

  const addClient = (c: Client) => setClients(prev => [...prev, c]);
  const updateClient = (c: Client) => setClients(prev => prev.map(x => x.id === c.id ? c : x));
  const deleteClient = (id: string) => setClients(prev => prev.filter(x => x.id !== id));
  const addEmployee = (e: Employee) => setEmployees(prev => [...prev, e]);
  const updateEmployee = (e: Employee) => setEmployees(prev => prev.map(x => x.id === e.id ? e : x));
  const deleteEmployee = (id: string) => setEmployees(prev => prev.filter(x => x.id !== id));
  const addExpense = (e: PersonalExpense) => setExpenses(prev => [...prev, e]);
  const updateExpense = (e: PersonalExpense) => setExpenses(prev => prev.map(x => x.id === e.id ? e : x));
  const deleteExpense = (id: string) => setExpenses(prev => prev.filter(x => x.id !== id));
  const addInvoice = (i: Invoice) => setInvoices(prev => [...prev, i]);
  const updateInvoice = (i: Invoice) => setInvoices(prev => prev.map(x => x.id === i.id ? i : x));
  const deleteInvoice = (id: string) => setInvoices(prev => prev.filter(x => x.id !== id));
  const addTaskList = (t: TaskList) => setTaskLists(prev => [...prev, t]);
  const updateTaskList = (t: TaskList) => setTaskLists(prev => prev.map(x => x.id === t.id ? t : x));
  const deleteTaskList = (id: string) => setTaskLists(prev => prev.filter(x => x.id !== id));

  return (
    <AppContext.Provider value={{
      clients, employees, expenses, clientCategories, employeeCategories, expenseCategories, invoices, taskLists,
      setClients, setEmployees, setExpenses, setClientCategories, setEmployeeCategories, setExpenseCategories, setInvoices, setTaskLists,
      addClient, updateClient, deleteClient, addEmployee, updateEmployee, deleteEmployee, addExpense, updateExpense, deleteExpense,
      addInvoice, updateInvoice, deleteInvoice, addTaskList, updateTaskList, deleteTaskList,
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
