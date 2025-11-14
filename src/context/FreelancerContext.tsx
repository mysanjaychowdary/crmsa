"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, isThisMonth, isPast } from 'date-fns';

// --- Data Models ---
export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'proposal' | 'active' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  total_amount: number;
  start_date: string;
  due_date: string;
  status: ProjectStatus;
  notes?: string; // Added notes property
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  project_id: string;
  client_id: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  reference_id?: string;
  notes?: string;
  created_at: string;
}

// --- Context Type ---
interface FreelancerContextType {
  clients: Client[];
  projects: Project[];
  payments: Payment[];
  addClient: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => void;
  updateClient: (id: string, updatedClient: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'status'>) => void;
  updateProject: (id: string, updatedProject: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'created_at'>) => void;
  updatePayment: (id: string, updatedPayment: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  getPaidAmountForProject: (projectId: string) => number;
  getPendingAmountForProject: (projectId: string) => number;
  getProjectWithCalculations: (projectId: string) => (Project & { paid_amount: number; pending_amount: number }) | undefined;
  getPendingAmountForClient: (clientId: string) => number;
  getTotalIncomeThisMonth: () => number;
  getTotalPendingOverall: () => number;
  getTotalActiveProjects: () => number;
  getOverdueProjects: () => Project[];
  getIncomeLastSixMonths: () => { month: string; income: number }[];
}

const FreelancerContext = createContext<FreelancerContextType | undefined>(undefined);

// --- Mock Data Generation ---
const generateMockData = () => {
  const now = new Date();
  const clients: Client[] = [
    { id: uuidv4(), name: 'Acme Corp', company: 'Acme Innovations', email: 'contact@acme.com', phone: '555-1001', address: '123 Main St', created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: uuidv4(), name: 'Beta Solutions', company: 'Beta Tech', email: 'info@beta.com', phone: '555-1002', address: '456 Oak Ave', created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: uuidv4(), name: 'Gamma Enterprises', company: 'Gamma Group', email: 'sales@gamma.com', phone: '555-1003', address: '789 Pine Ln', created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: uuidv4(), name: 'Delta Dynamics', company: 'Delta Systems', email: 'support@delta.com', phone: '555-1004', address: '101 Elm Rd', created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: uuidv4(), name: 'Epsilon Innovations', company: 'Epsilon Labs', email: 'hello@epsilon.com', phone: '555-1005', address: '202 Birch Blvd', created_at: now.toISOString(), updated_at: now.toISOString() },
  ];

  const projects: Project[] = [
    { id: uuidv4(), client_id: clients[0].id, title: 'Website Redesign', description: 'Complete overhaul of existing website.', total_amount: 5000, start_date: '2023-01-15', due_date: '2023-03-30', status: 'completed', notes: 'Client requested a modern, minimalist design.', created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: uuidv4(), client_id: clients[0].id, title: 'Mobile App Development', description: 'Develop iOS and Android applications.', total_amount: 12000, start_date: '2023-04-01', due_date: '2023-08-31', status: 'active', notes: 'Phase 1: UI/UX design. Phase 2: Backend integration.', created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: uuidv4(), client_id: clients[1].id, title: 'Marketing Campaign', description: 'Launch new digital marketing campaign.', total_amount: 3000, start_date: '2023-02-01', due_date: '2023-04-15', status: 'completed', notes: 'Focus on social media and email marketing.', created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: uuidv4(), client_id: clients[1].id, title: 'SEO Optimization', description: 'Improve search engine rankings.', total_amount: 1500, start_date: '2023-09-01', due_date: '2023-11-30', status: 'active', notes: 'Keyword research and on-page optimization.', created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: uuidv4(), client_id: clients[2].id, title: 'Brand Identity Design', description: 'Create new logo and brand guidelines.', total_amount: 2500, start_date: '2023-05-10', due_date: '2023-06-20', status: 'completed', notes: 'Delivered logo variations and style guide.', created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: uuidv4(), client_id: clients[2].id, title: 'E-commerce Platform', description: 'Build a new online store.', total_amount: 10000, start_date: '2023-07-01', due_date: '2024-01-31', status: 'active', notes: 'Integrating Stripe for payments.', created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: uuidv4(), client_id: clients[3].id, title: 'Content Writing', description: 'Generate blog posts and website copy.', total_amount: 1800, start_date: '2023-03-01', due_date: '2023-05-01', status: 'completed', notes: '5 blog posts and 3 landing page copies delivered.', created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: uuidv4(), client_id: clients[3].id, title: 'CRM Integration', description: 'Integrate new CRM system.', total_amount: 4000, start_date: '2023-10-01', due_date: '2024-02-28', status: 'active', notes: 'Migrating existing customer data.', created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: uuidv4(), client_id: clients[4].id, title: 'UI/UX Audit', description: 'Audit existing product for usability.', total_amount: 2000, start_date: '2023-06-01', due_date: '2023-07-15', status: 'completed', notes: 'Provided a detailed report with recommendations.', created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: uuidv4(), client_id: clients[4].id, title: 'Cloud Migration', description: 'Migrate infrastructure to cloud.', total_amount: 8000, start_date: '2023-11-01', due_date: '2024-03-31', status: 'active', notes: 'Moving from AWS to Google Cloud Platform.', created_at: now.toISOString(), updated_at: now.toISOString() },
  ];

  const payments: Payment[] = [
    { id: uuidv4(), project_id: projects[0].id, client_id: clients[0].id, amount: 2500, payment_date: '2023-02-01', payment_method: 'Bank Transfer', created_at: now.toISOString() },
    { id: uuidv4(), project_id: projects[0].id, client_id: clients[0].id, amount: 2500, payment_date: '2023-03-15', payment_method: 'Bank Transfer', created_at: now.toISOString() },
    { id: uuidv4(), project_id: projects[1].id, client_id: clients[0].id, amount: 4000, payment_date: '2023-05-01', payment_method: 'Credit Card', created_at: now.toISOString() },
    { id: uuidv4(), project_id: projects[1].id, client_id: clients[0].id, amount: 3000, payment_date: '2023-07-01', payment_method: 'Credit Card', created_at: now.toISOString() },
    { id: uuidv4(), project_id: projects[2].id, client_id: clients[1].id, amount: 1500, payment_date: '2023-02-15', payment_method: 'PayPal', created_at: now.toISOString() },
    { id: uuidv4(), project_id: projects[2].id, client_id: clients[1].id, amount: 1500, payment_date: '2023-04-01', payment_method: 'PayPal', created_at: now.toISOString() },
    { id: uuidv4(), project_id: projects[3].id, client_id: clients[1].id, amount: 500, payment_date: '2023-09-15', payment_method: 'Bank Transfer', created_at: now.toISOString() },
    { id: uuidv4(), project_id: projects[4].id, client_id: clients[2].id, amount: 1000, payment_date: '2023-05-20', payment_method: 'Bank Transfer', created_at: now.toISOString() },
    { id: uuidv4(), project_id: projects[4].id, client_id: clients[2].id, amount: 1500, payment_date: '2023-06-10', payment_method: 'Bank Transfer', created_at: now.toISOString() },
    { id: uuidv4(), project_id: projects[5].id, client_id: clients[2].id, amount: 3000, payment_date: '2023-07-15', payment_method: 'Credit Card', created_at: now.toISOString() },
    { id: uuidv4(), project_id: projects[5].id, client_id: clients[2].id, amount: 2000, payment_date: '2023-09-01', payment_method: 'Credit Card', created_at: now.toISOString() },
    { id: uuidv4(), project_id: projects[6].id, client_id: clients[3].id, amount: 900, payment_date: '2023-03-10', payment_method: 'PayPal', created_at: now.toISOString() },
    { id: uuidv4(), project_id: projects[6].id, client_id: clients[3].id, amount: 900, payment_date: '2023-04-25', payment_method: 'PayPal', created_at: now.toISOString() },
    { id: uuidv4(), project_id: projects[7].id, client_id: clients[3].id, amount: 1500, payment_date: '2023-10-10', payment_method: 'Bank Transfer', created_at: now.toISOString() },
    { id: uuidv4(), project_id: projects[8].id, client_id: clients[4].id, amount: 1000, payment_date: '2023-06-05', payment_method: 'Bank Transfer', created_at: now.toISOString() },
    { id: uuidv4(), project_id: projects[8].id, client_id: clients[4].id, amount: 1000, payment_date: '2023-07-10', payment_method: 'Bank Transfer', created_at: now.toISOString() },
    { id: uuidv4(), project_id: projects[9].id, client_id: clients[4].id, amount: 2000, payment_date: '2023-11-15', payment_method: 'Credit Card', created_at: now.toISOString() },
    { id: uuidv4(), project_id: projects[1].id, client_id: clients[0].id, amount: 2000, payment_date: format(new Date(), 'yyyy-MM-dd'), payment_method: 'Credit Card', created_at: now.toISOString() }, // Payment this month
    { id: uuidv4(), project_id: projects[3].id, client_id: clients[1].id, amount: 500, payment_date: format(new Date(), 'yyyy-MM-dd'), payment_method: 'Bank Transfer', created_at: now.toISOString() }, // Payment this month
    { id: uuidv4(), project_id: projects[5].id, client_id: clients[2].id, amount: 1000, payment_date: format(new Date(), 'yyyy-MM-dd'), payment_method: 'Credit Card', created_at: now.toISOString() }, // Payment this month
  ];

  return { clients, projects, payments };
};

export const FreelancerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const { clients: initialClients, projects: initialProjects, payments: initialPayments } = generateMockData();
    setClients(initialClients);
    setProjects(initialProjects);
    setPayments(initialPayments);
  }, []);

  // --- CRUD Operations ---
  const addClient = (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    const newClient: Client = { ...client, id: uuidv4(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    setClients((prev) => [...prev, newClient]);
  };

  const updateClient = (id: string, updatedClient: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedClient, updated_at: new Date().toISOString() } : c))
    );
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setProjects((prev) => prev.filter((p) => p.client_id !== id)); // Delete associated projects
    setPayments((prev) => prev.filter((p) => p.client_id !== id)); // Delete associated payments
  };

  const addProject = (project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    const newProject: Project = { ...project, id: uuidv4(), status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    setProjects((prev) => [...prev, newProject]);
  };

  const updateProject = (id: string, updatedProject: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedProject, updated_at: new Date().toISOString() } : p))
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setPayments((prev) => prev.filter((p) => p.project_id !== id)); // Delete associated payments
  };

  const addPayment = (payment: Omit<Payment, 'id' | 'created_at'>) => {
    const newPayment: Payment = { ...payment, id: uuidv4(), created_at: new Date().toISOString() };
    setPayments((prev) => [...prev, newPayment]);
  };

  const updatePayment = (id: string, updatedPayment: Partial<Payment>) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedPayment } : p))
    );
  };

  const deletePayment = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  // --- Auto-Calculations ---
  const getPaidAmountForProject = useCallback((projectId: string) => {
    return payments
      .filter((p) => p.project_id === projectId)
      .reduce((sum, payment) => sum + payment.amount, 0);
  }, [payments]);

  const getPendingAmountForProject = useCallback((projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return 0;
    const paid = getPaidAmountForProject(projectId);
    return project.total_amount - paid;
  }, [projects, getPaidAmountForProject]);

  const getProjectWithCalculations = useCallback((projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return undefined;
    const paid_amount = getPaidAmountForProject(projectId);
    const pending_amount = project.total_amount - paid_amount;
    return { ...project, paid_amount, pending_amount };
  }, [projects, getPaidAmountForProject]);

  const getPendingAmountForClient = useCallback((clientId: string) => {
    return projects
      .filter((p) => p.client_id === clientId)
      .reduce((sum, project) => sum + getPendingAmountForProject(project.id), 0);
  }, [projects, getPendingAmountForProject]);

  const getTotalIncomeThisMonth = useCallback(() => {
    const currentMonthPayments = payments.filter((p) => isThisMonth(new Date(p.payment_date)));
    return currentMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);
  }, [payments]);

  const getTotalPendingOverall = useCallback(() => {
    return projects.reduce((sum, project) => sum + getPendingAmountForProject(project.id), 0);
  }, [projects, getPendingAmountForProject]);

  const getTotalActiveProjects = useCallback(() => {
    return projects.filter((p) => p.status === 'active').length;
  }, [projects]);

  const getOverdueProjects = useCallback(() => {
    const today = new Date();
    return projects.filter(project =>
      project.status === 'active' && isPast(new Date(project.due_date)) && getPendingAmountForProject(project.id) > 0
    );
  }, [projects, getPendingAmountForProject]);

  const getIncomeLastSixMonths = useCallback(() => {
    const incomeByMonth: { [key: string]: number } = {};
    const today = new Date();

    for (let i = 0; i < 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = format(date, 'MMM yyyy');
      incomeByMonth[monthKey] = 0;
    }

    payments.forEach(payment => {
      const paymentDate = new Date(payment.payment_date);
      const monthKey = format(paymentDate, 'MMM yyyy');
      if (incomeByMonth.hasOwnProperty(monthKey)) {
        incomeByMonth[monthKey] += payment.amount;
      }
    });

    return Object.keys(incomeByMonth)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(month => ({ month, income: incomeByMonth[month] }));
  }, [payments]);

  // --- Auto-update project status if fully paid ---
  useEffect(() => {
    setProjects(prevProjects =>
      prevProjects.map(project => {
        const paid = getPaidAmountForProject(project.id);
        if (project.status === 'active' && paid >= project.total_amount) {
          return { ...project, status: 'completed', updated_at: new Date().toISOString() };
        }
        return project;
      })
    );
  }, [payments, getPaidAmountForProject]);


  const value = {
    clients,
    projects,
    payments,
    addClient,
    updateClient,
    deleteClient,
    addProject,
    updateProject,
    deleteProject,
    addPayment,
    updatePayment,
    deletePayment,
    getPaidAmountForProject,
    getPendingAmountForProject,
    getProjectWithCalculations,
    getPendingAmountForClient,
    getTotalIncomeThisMonth,
    getTotalPendingOverall,
    getTotalActiveProjects,
    getOverdueProjects,
    getIncomeLastSixMonths,
  };

  return <FreelancerContext.Provider value={value}>{children}</FreelancerContext.Provider>;
};

export const useFreelancer = () => {
  const context = useContext(FreelancerContext);
  if (context === undefined) {
    throw new Error('useFreelancer must be used within a FreelancerProvider');
  }
  return context;
};