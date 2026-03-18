export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Contract {
  id: string;
  timeline: string;
  startDate: string;
  endDate: string;
  budget: number;
  costing: number;
  profit: number;
  mouDetails: string;
  mouFiles: FileAttachment[];
  isRenewal: boolean;
  renewalDate?: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  dataUrl: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  details: string;
  categories: string[];
  contracts: Contract[];
  status: 'in-progress' | 'completed';
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  categories: string[];
  salary: number;
  startDate: string;
  endDate: string;
  mouDetails: string;
  mouFiles: FileAttachment[];
  additionalInfo: string;
  status: 'active' | 'inactive';
  contracts: EmployeeContract[];
  createdAt: string;
}

export interface EmployeeContract {
  id: string;
  startDate: string;
  endDate: string;
  salary: number;
  mouDetails: string;
  mouFiles: FileAttachment[];
  isRenewal: boolean;
}

export interface PersonalExpense {
  id: string;
  name: string;
  cost: number;
  details: string;
  category: string;
  invoiceFiles: FileAttachment[];
  date: string;
  createdAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  type: 'recurring' | 'one-time';
  icon: string;
}

export interface InvoiceServiceRow {
  id: string;
  service: string;
  description: string;
  cost: number;
}

export interface Invoice {
  id: string;
  logoDataUrl?: string;
  title: string;
  companyName: string;
  companyType: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  clientBrand: string;
  clientOwner: string;
  clientCnic: string;
  clientAccount: string;
  clientAddress: string;
  services: InvoiceServiceRow[];
  totalCost: number;
  founderName: string;
  founderCnic: string;
  founderAccount: string;
  paymentTerms: string;
  createdAt: string;
}

// ── Task System Types ──

export type RepeatInterval = 'daily' | 'alternative_days' | 'weekly' | 'monthly' | 'alternative_months' | 'custom';

export interface TaskItem {
  id: string;
  text: string;
  done: boolean;
  phaseId?: string;
  taskType: 'single' | 'repetitive';
  repeatInterval?: RepeatInterval;
  customIntervalDays?: number;
}

export interface TaskPhase {
  id: string;
  taskListId: string;
  name: string;
  phaseNumber: number;
  isCurrent: boolean;
  createdAt: string;
  tasks: TaskItem[];
}

export interface TaskList {
  id: string;
  name: string;
  folderId?: string;
  categoryId?: string;
  position: number;
  phases: TaskPhase[];
  createdAt: string;
  // Legacy compat - derived from phases
  tasks: TaskItem[];
}

export interface TaskFolder {
  id: string;
  name: string;
  position: number;
  createdAt: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  icon: string;
}

export type SortOption = 'budget-high' | 'budget-low' | 'timeline-high' | 'timeline-low' | 'salary-high' | 'salary-low';
export type FilterStatus = 'all' | 'in-progress' | 'completed' | 'active' | 'inactive';
