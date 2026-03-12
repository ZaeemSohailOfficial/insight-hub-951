import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Employee, PersonalExpense, Category, ExpenseCategory } from '@/types';

interface AppState {
  clients: Client[];
  employees: Employee[];
  expenses: PersonalExpense[];
  clientCategories: Category[];
  employeeCategories: Category[];
  expenseCategories: ExpenseCategory[];
  setClients: (c: Client[]) => void;
  setEmployees: (e: Employee[]) => void;
  setExpenses: (e: PersonalExpense[]) => void;
  setClientCategories: (c: Category[]) => void;
  setEmployeeCategories: (c: Category[]) => void;
  setExpenseCategories: (c: ExpenseCategory[]) => void;
  addClient: (c: Client) => void;
  updateClient: (c: Client) => void;
  addEmployee: (e: Employee) => void;
  updateEmployee: (e: Employee) => void;
  addExpense: (e: PersonalExpense) => void;
  updateExpense: (e: PersonalExpense) => void;
  deleteExpense: (id: string) => void;
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

  useEffect(() => { localStorage.setItem('app_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('app_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('app_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('app_client_cats', JSON.stringify(clientCategories)); }, [clientCategories]);
  useEffect(() => { localStorage.setItem('app_employee_cats', JSON.stringify(employeeCategories)); }, [employeeCategories]);
  useEffect(() => { localStorage.setItem('app_expense_cats', JSON.stringify(expenseCategories)); }, [expenseCategories]);

  const addClient = (c: Client) => setClients(prev => [...prev, c]);
  const updateClient = (c: Client) => setClients(prev => prev.map(x => x.id === c.id ? c : x));
  const addEmployee = (e: Employee) => setEmployees(prev => [...prev, e]);
  const updateEmployee = (e: Employee) => setEmployees(prev => prev.map(x => x.id === e.id ? e : x));
  const addExpense = (e: PersonalExpense) => setExpenses(prev => [...prev, e]);
  const updateExpense = (e: PersonalExpense) => setExpenses(prev => prev.map(x => x.id === e.id ? e : x));
  const deleteExpense = (id: string) => setExpenses(prev => prev.filter(x => x.id !== id));

  return (
    <AppContext.Provider value={{
      clients, employees, expenses, clientCategories, employeeCategories, expenseCategories,
      setClients, setEmployees, setExpenses, setClientCategories, setEmployeeCategories, setExpenseCategories,
      addClient, updateClient, addEmployee, updateEmployee, addExpense, updateExpense, deleteExpense,
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
