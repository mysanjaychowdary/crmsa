"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, isThisMonth, isPast, subMonths } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '../context/SessionContext'; // Import useAuth

// --- Data Models ---
export interface Client {
  id: string;
  user_id: string;
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
  user_id: string;
  client_id: string;
  title: string;
  description?: string;
  total_amount: number;
  start_date: string;
  due_date: string;
  status: ProjectStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  project_id: string;
  client_id: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  reference_id?: string;
  notes?: string;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  name: string;
  details?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name?: string;
  contact_email?: string;
  phone_number?: string; // Keep phone_number here if it's for business contact, not auth
  address?: string;
  // Removed whatsapp_instance_id and whatsapp_access_token
  created_at: string;
  updated_at: string;
}

// --- Context Type ---
interface FreelancerContextType {
  clients: Client[];
  projects: Project[];
  payments: Payment[];
  paymentMethods: PaymentMethod[];
  businessProfile: BusinessProfile | null; // Add businessProfile to context
  addClient: (client: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateClient: (id: string, updatedClient: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status'>) => Promise<void>;
  updateProject: (id: string, updatedProject: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updatePayment: (id: string, updatedPayment: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePaymentMethod: (id: string, updatedMethod: Partial<PaymentMethod>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  getPaidAmountForProject: (projectId: string) => number;
  getPendingAmountForProject: (projectId: string) => number;
  getProjectWithCalculations: (projectId: string) => (Project & { paid_amount: number; pending_amount: number }) | undefined;
  getPendingAmountForClient: (clientId: string) => number;
  getTotalIncomeThisMonth: () => number;
  getTotalPendingOverall: () => number;
  getTotalActiveProjects: () => number;
  getOverdueProjects: () => Project[];
  getIncomeLastSixMonths: () => { month: string; income: number }[];
  addBusinessProfile: (profile: Omit<BusinessProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBusinessProfile: (id: string, updatedProfile: Partial<BusinessProfile>) => Promise<void>;
  loadingData: boolean;
}

const FreelancerContext = createContext<FreelancerContextType | undefined>(undefined);

export const FreelancerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loadingAuth } = useAuth(); // Get user and loadingAuth from SessionContext
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null); // New state for business profile
  const [loadingData, setLoadingData] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setClients([]);
      setProjects([]);
      setPayments([]);
      setPaymentMethods([]);
      setBusinessProfile(null); // Clear business profile
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id);
      if (clientsError) throw clientsError;
      setClients(clientsData as Client[]);

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);
      if (projectsError) throw projectsError;
      setProjects(projectsData as Project[]);

      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id);
      if (paymentsError) throw paymentsError;
      setPayments(paymentsData as Payment[]);

      const { data: paymentMethodsData, error: paymentMethodsError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id);
      if (paymentMethodsError) throw paymentMethodsError;
      setPaymentMethods(paymentMethodsData as PaymentMethod[]);

      // Fetch business profile
      const { data: businessProfileData, error: businessProfileError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (businessProfileError && businessProfileError.code !== 'PGRST116') { // PGRST116 means no rows found
        throw businessProfileError;
      }
      setBusinessProfile(businessProfileData as BusinessProfile || null);

    } catch (error: any) {
      toast.error(`Failed to fetch data: ${error.message}`);
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!loadingAuth) { // Only fetch data once authentication state is known
      fetchData();
    }
  }, [loadingAuth, fetchData]);

  // --- CRUD Operations ---
  const addClient = async (client: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) {
      toast.error('You must be logged in to add a client.');
      return;
    }
    const newClient = { ...client, user_id: user.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('clients').insert(newClient).select().single();
    if (error) {
      toast.error(`Failed to add client: ${error.message}`);
      throw error;
    }
    setClients((prev) => [...prev, data as Client]);
  };

  const updateClient = async (id: string, updatedClient: Partial<Client>) => {
    if (!user?.id) {
      toast.error('You must be logged in to update a client.');
      return;
    }
    const { data, error } = await supabase
      .from('clients')
      .update({ ...updatedClient, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) {
      toast.error(`Failed to update client: ${error.message}`);
      throw error;
    }
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data as Client } : c))
    );
  };

  const deleteClient = async (id: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to delete a client.');
      return;
    }
    const { error } = await supabase.from('clients').delete().eq('id', id).eq('user_id', user.id);
    if (error) {
      toast.error(`Failed to delete client: ${error.message}`);
      throw error;
    }
    setClients((prev) => prev.filter((c) => c.id !== id));
    setProjects((prev) => prev.filter((p) => p.client_id !== id));
    setPayments((prev) => prev.filter((p) => p.client_id !== id));
  };

  const addProject = async (project: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status'>) => {
    if (!user?.id) {
      toast.error('You must be logged in to add a project.');
      return;
    }
    const newProject = { ...project, user_id: user.id, status: 'active' as ProjectStatus, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('projects').insert(newProject).select().single();
    if (error) {
      toast.error(`Failed to add project: ${error.message}`);
      throw error;
    }
    setProjects((prev) => [...prev, data as Project]);
  };

  const updateProject = async (id: string, updatedProject: Partial<Project>) => {
    if (!user?.id) {
      toast.error('You must be logged in to update a project.');
      return;
    }
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updatedProject, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) {
      toast.error(`Failed to update project: ${error.message}`);
      throw error;
    }
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data as Project } : p))
    );
  };

  const deleteProject = async (id: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to delete a project.');
      return;
    }
    const { error } = await supabase.from('projects').delete().eq('id', id).eq('user_id', user.id);
    if (error) {
      toast.error(`Failed to delete project: ${error.message}`);
      throw error;
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setPayments((prev) => prev.filter((p) => p.project_id !== id));
  };

  const addPayment = async (payment: Omit<Payment, 'id' | 'user_id' | 'created_at'>) => {
    if (!user?.id) {
      toast.error('You must be logged in to record a payment.');
      return;
    }
    const newPayment = { ...payment, user_id: user.id, created_at: new Date().toISOString() };
    const { data, error } = await supabase.from('payments').insert(newPayment).select().single();
    if (error) {
      toast.error(`Failed to record payment: ${error.message}`);
      throw error;
    }
    setPayments((prev) => [...prev, data as Payment]);
  };

  const updatePayment = async (id: string, updatedPayment: Partial<Payment>) => {
    if (!user?.id) {
      toast.error('You must be logged in to update a payment.');
      return;
    }
    const { data, error } = await supabase
      .from('payments')
      .update(updatedPayment)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) {
      toast.error(`Failed to update payment: ${error.message}`);
      throw error;
    }
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data as Payment } : p))
    );
  };

  const deletePayment = async (id: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to delete a payment.');
      return;
    }
    const { error } = await supabase.from('payments').delete().eq('id', id).eq('user_id', user.id);
    if (error) {
      toast.error(`Failed to delete payment: ${error.message}`);
      throw error;
    }
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const addPaymentMethod = async (method: Omit<PaymentMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) {
      toast.error('You must be logged in to add a payment method.');
      return;
    }
    const newMethod = { ...method, user_id: user.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('payment_methods').insert(newMethod).select().single();
    if (error) {
      toast.error(`Failed to add payment method: ${error.message}`);
      throw error;
    }
    setPaymentMethods((prev) => [...prev, data as PaymentMethod]);
  };

  const updatePaymentMethod = async (id: string, updatedMethod: Partial<PaymentMethod>) => {
    if (!user?.id) {
      toast.error('You must be logged in to update a payment method.');
      return;
    }
    const { data, error } = await supabase
      .from('payment_methods')
      .update({ ...updatedMethod, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) {
      toast.error(`Failed to update payment method: ${error.message}`);
      throw error;
    }
    setPaymentMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data as PaymentMethod } : m))
    );
  };

  const deletePaymentMethod = async (id: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to delete a payment method.');
      return;
    }
    const { error } = await supabase.from('payment_methods').delete().eq('id', id).eq('user_id', user.id);
    if (error) {
      toast.error(`Failed to delete payment method: ${error.message}`);
      throw error;
    }
    setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
  };

  // --- Business Profile CRUD ---
  const addBusinessProfile = async (profile: Omit<BusinessProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) {
      toast.error('You must be logged in to add a business profile.');
      return;
    }
    const newProfile = { ...profile, user_id: user.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('business_profiles').insert(newProfile).select().single();
    if (error) {
      toast.error(`Failed to add business profile: ${error.message}`);
      throw error;
    }
    setBusinessProfile(data as BusinessProfile);
  };

  const updateBusinessProfile = async (id: string, updatedProfile: Partial<BusinessProfile>) => {
    if (!user?.id) {
      toast.error('You must be logged in to update a business profile.');
      return;
    }
    const { data, error } = await supabase
      .from('business_profiles')
      .update({ ...updatedProfile, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) {
      toast.error(`Failed to update business profile: ${error.message}`);
      throw error;
    }
    setBusinessProfile((prev) => (prev ? { ...prev, ...data as BusinessProfile } : null));
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
      const date = subMonths(today, i);
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
    paymentMethods,
    businessProfile, // Add businessProfile to context value
    addClient,
    updateClient,
    deleteClient,
    addProject,
    updateProject,
    deleteProject,
    addPayment,
    updatePayment,
    deletePayment,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    addBusinessProfile, // Add business profile functions
    updateBusinessProfile, // Add business profile functions
    getPaidAmountForProject,
    getPendingAmountForProject,
    getProjectWithCalculations,
    getPendingAmountForClient,
    getTotalIncomeThisMonth,
    getTotalPendingOverall,
    getTotalActiveProjects,
    getOverdueProjects,
    getIncomeLastSixMonths,
    loadingData: loadingData || loadingAuth, // Combine loading states
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