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

export type SortOption = 'budget-high' | 'budget-low' | 'timeline-high' | 'timeline-low' | 'salary-high' | 'salary-low';
export type FilterStatus = 'all' | 'in-progress' | 'completed' | 'active' | 'inactive';
