"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './SessionContext';

// --- Data Models ---
export interface Panel {
  id: string;
  admin_user_id: string;
  name: string;
  description?: string;
  requires_panel3_credentials: boolean;
  created_at: string;
  updated_at: string;
}

export interface PanelUser {
  id: string;
  admin_user_id: string;
  panel_id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Panel3Credential {
  id: string;
  admin_user_id: string;
  panel3_login_id: string;
  panel3_password_encrypted: string; // NOTE: In a production app, this should be securely encrypted (e.g., using Supabase Vault or a strong hashing/encryption library). For this demo, it's stored as text.
  created_at: string;
  updated_at: string;
}

export type CampaignStatus = 'pending' | 'in-progress' | 'verification' | 'completed' | 'cancelled';

export interface CampaignReport {
  id: string;
  admin_user_id: string;
  campaign_id_external: string;
  campaign_name: string;
  panel_id: string;
  assigned_panel_user_id: string;
  panel3_credential_id?: string;
  status: CampaignStatus;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  record_id: string;
  table_name: string;
  action: string;
  old_value?: any;
  new_value?: any;
  timestamp: string;
}

// --- Context Type ---
interface CampaignDashboardContextType {
  panels: Panel[];
  panelUsers: PanelUser[];
  panel3Credentials: Panel3Credential[];
  campaignReports: CampaignReport[];
  auditLogs: AuditLog[];
  loadingCampaignData: boolean;
  addPanel: (panel: Omit<Panel, 'id' | 'admin_user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePanel: (id: string, updatedPanel: Partial<Panel>) => Promise<void>;
  deletePanel: (id: string) => Promise<void>;
  addPanelUser: (panelUser: Omit<PanelUser, 'id' | 'admin_user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePanelUser: (id: string, updatedPanelUser: Partial<PanelUser>) => Promise<void>;
  deletePanelUser: (id: string) => Promise<void>;
  addPanel3Credential: (credential: Omit<Panel3Credential, 'id' | 'admin_user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePanel3Credential: (id: string, updatedCredential: Partial<Panel3Credential>) => Promise<void>;
  deletePanel3Credential: (id: string) => Promise<void>;
  addCampaignReport: (report: Omit<CampaignReport, 'id' | 'admin_user_id' | 'created_at' | 'updated_at' | 'status'>) => Promise<void>;
  updateCampaignReport: (id: string, updatedReport: Partial<CampaignReport>) => Promise<void>;
  deleteCampaignReport: (id: string) => Promise<void>;
  logAudit: (record_id: string, table_name: string, action: string, old_value?: any, new_value?: any) => Promise<void>;
  getPanelName: (panelId: string) => string;
  getPanelUserName: (panelUserId: string) => string;
  getPanel3LoginId: (credentialId: string) => string;
}

const CampaignDashboardContext = createContext<CampaignDashboardContextType | undefined>(undefined);

export const CampaignDashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loadingAuth } = useAuth();
  const [panels, setPanels] = useState<Panel[]>([]);
  const [panelUsers, setPanelUsers] = useState<PanelUser[]>([]);
  const [panel3Credentials, setPanel3Credentials] = useState<Panel3Credential[]>([]);
  const [campaignReports, setCampaignReports] = useState<CampaignReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingCampaignData, setLoadingCampaignData] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setPanels([]);
      setPanelUsers([]);
      setPanel3Credentials([]);
      setCampaignReports([]);
      setAuditLogs([]);
      setLoadingCampaignData(false);
      return;
    }

    setLoadingCampaignData(true);
    try {
      const { data: panelsData, error: panelsError } = await supabase
        .from('panels')
        .select('*')
        .eq('admin_user_id', user.id);
      if (panelsError) throw panelsError;
      setPanels(panelsData as Panel[]);

      const { data: panelUsersData, error: panelUsersError } = await supabase
        .from('panel_users')
        .select('*')
        .eq('admin_user_id', user.id);
      if (panelUsersError) throw panelUsersError;
      setPanelUsers(panelUsersData as PanelUser[]);

      const { data: panel3CredentialsData, error: panel3CredentialsError } = await supabase
        .from('panel3_credentials')
        .select('*')
        .eq('admin_user_id', user.id);
      if (panel3CredentialsError) throw panel3CredentialsError;
      setPanel3Credentials(panel3CredentialsData as Panel3Credential[]);

      const { data: campaignReportsData, error: campaignReportsError } = await supabase
        .from('campaign_reports')
        .select('*')
        .eq('admin_user_id', user.id);
      if (campaignReportsError) throw campaignReportsError;
      setCampaignReports(campaignReportsData as CampaignReport[]);

      const { data: auditLogsData, error: auditLogsError } = await supabase
        .from('audit_log')
        .select('*')
        .eq('user_id', user.id) // Only fetch logs for the current user's actions
        .order('timestamp', { ascending: false })
        .limit(50); // Limit audit logs for performance
      if (auditLogsError) throw auditLogsError;
      setAuditLogs(auditLogsData as AuditLog[]);

    } catch (error: any) {
      toast.error(`Failed to fetch campaign data: ${error.message}`);
      console.error('Error fetching campaign data:', error);
    } finally {
      setLoadingCampaignData(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!loadingAuth) {
      fetchData();
    }
  }, [loadingAuth, fetchData]);

  // --- CRUD Operations ---
  const addPanel = async (panel: Omit<Panel, 'id' | 'admin_user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) { toast.error('Authentication required.'); return; }
    const newPanel = { ...panel, admin_user_id: user.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('panels').insert(newPanel).select().single();
    if (error) { toast.error(`Failed to add panel: ${error.message}`); throw error; }
    setPanels((prev) => [data as Panel, ...prev]);
    await logAudit(data.id, 'panels', 'CREATE', null, data);
  };

  const updatePanel = async (id: string, updatedPanel: Partial<Panel>) => {
    if (!user?.id) { toast.error('Authentication required.'); return; }
    const oldPanel = panels.find(p => p.id === id);
    const { data, error } = await supabase
      .from('panels')
      .update({ ...updatedPanel, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('admin_user_id', user.id)
      .select().single();
    if (error) { toast.error(`Failed to update panel: ${error.message}`); throw error; }
    setPanels((prev) => prev.map((p) => (p.id === id ? { ...p, ...data as Panel } : p)));
    await logAudit(id, 'panels', 'UPDATE', oldPanel, data);
  };

  const deletePanel = async (id: string) => {
    if (!user?.id) { toast.error('Authentication required.'); return; }
    const { error } = await supabase.from('panels').delete().eq('id', id).eq('admin_user_id', user.id);
    if (error) { toast.error(`Failed to delete panel: ${error.message}`); throw error; }
    setPanels((prev) => prev.filter((p) => p.id !== id));
    setPanelUsers((prev) => prev.filter((pu) => pu.panel_id !== id)); // Cascade delete handled by DB, but update state
    setCampaignReports((prev) => prev.filter((cr) => cr.panel_id !== id)); // Cascade delete handled by DB, but update state
    await logAudit(id, 'panels', 'DELETE', { id }, null);
  };

  const addPanelUser = async (panelUser: Omit<PanelUser, 'id' | 'admin_user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) { toast.error('Authentication required.'); return; }
    const newPanelUser = { ...panelUser, admin_user_id: user.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('panel_users').insert(newPanelUser).select().single();
    if (error) { toast.error(`Failed to add panel user: ${error.message}`); throw error; }
    setPanelUsers((prev) => [data as PanelUser, ...prev]);
    await logAudit(data.id, 'panel_users', 'CREATE', null, data);
  };

  const updatePanelUser = async (id: string, updatedPanelUser: Partial<PanelUser>) => {
    if (!user?.id) { toast.error('Authentication required.'); return; }
    const oldPanelUser = panelUsers.find(pu => pu.id === id);
    const { data, error } = await supabase
      .from('panel_users')
      .update({ ...updatedPanelUser, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('admin_user_id', user.id)
      .select().single();
    if (error) { toast.error(`Failed to update panel user: ${error.message}`); throw error; }
    setPanelUsers((prev) => prev.map((pu) => (pu.id === id ? { ...pu, ...data as PanelUser } : pu)));
    await logAudit(id, 'panel_users', 'UPDATE', oldPanelUser, data);
  };

  const deletePanelUser = async (id: string) => {
    if (!user?.id) { toast.error('Authentication required.'); return; }
    const { error } = await supabase.from('panel_users').delete().eq('id', id).eq('admin_user_id', user.id);
    if (error) { toast.error(`Failed to delete panel user: ${error.message}`); throw error; }
    setPanelUsers((prev) => prev.filter((pu) => pu.id !== id));
    setCampaignReports((prev) => prev.filter((cr) => cr.assigned_panel_user_id !== id)); // Cascade delete handled by DB, but update state
    await logAudit(id, 'panel_users', 'DELETE', { id }, null);
  };

  const addPanel3Credential = async (credential: Omit<Panel3Credential, 'id' | 'admin_user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) { toast.error('Authentication required.'); return; }
    const newCredential = { ...credential, admin_user_id: user.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('panel3_credentials').insert(newCredential).select().single();
    if (error) { toast.error(`Failed to add Panel 3 credential: ${error.message}`); throw error; }
    setPanel3Credentials((prev) => [data as Panel3Credential, ...prev]);
    await logAudit(data.id, 'panel3_credentials', 'CREATE', null, data);
  };

  const updatePanel3Credential = async (id: string, updatedCredential: Partial<Panel3Credential>) => {
    if (!user?.id) { toast.error('Authentication required.'); return; }
    const oldCredential = panel3Credentials.find(pc => pc.id === id);
    const { data, error } = await supabase
      .from('panel3_credentials')
      .update({ ...updatedCredential, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('admin_user_id', user.id)
      .select().single();
    if (error) { toast.error(`Failed to update Panel 3 credential: ${error.message}`); throw error; }
    setPanel3Credentials((prev) => prev.map((pc) => (pc.id === id ? { ...pc, ...data as Panel3Credential } : pc)));
    await logAudit(id, 'panel3_credentials', 'UPDATE', oldCredential, data);
  };

  const deletePanel3Credential = async (id: string) => {
    if (!user?.id) { toast.error('Authentication required.'); return; }
    const { error } = await supabase.from('panel3_credentials').delete().eq('id', id).eq('admin_user_id', user.id);
    if (error) { toast.error(`Failed to delete Panel 3 credential: ${error.message}`); throw error; }
    setPanel3Credentials((prev) => prev.filter((pc) => pc.id !== id));
    setCampaignReports((prev) => prev.map((cr) => (cr.panel3_credential_id === id ? { ...cr, panel3_credential_id: undefined } : cr))); // Clear reference
    await logAudit(id, 'panel3_credentials', 'DELETE', { id }, null);
  };

  const addCampaignReport = async (report: Omit<CampaignReport, 'id' | 'admin_user_id' | 'created_at' | 'updated_at' | 'status'>) => {
    if (!user?.id) { toast.error('Authentication required.'); return; }
    const newReport = { ...report, admin_user_id: user.id, status: 'pending' as CampaignStatus, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('campaign_reports').insert(newReport).select().single();
    if (error) { toast.error(`Failed to add campaign report: ${error.message}`); throw error; }
    setCampaignReports((prev) => [data as CampaignReport, ...prev]);
    await logAudit(data.id, 'campaign_reports', 'CREATE', null, data);
  };

  const updateCampaignReport = async (id: string, updatedReport: Partial<CampaignReport>) => {
    if (!user?.id) { toast.error('Authentication required.'); return; }
    const oldReport = campaignReports.find(cr => cr.id === id);
    const { data, error } = await supabase
      .from('campaign_reports')
      .update({ ...updatedReport, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('admin_user_id', user.id) // Only admin can update for now, RLS handles this
      .select().single();
    if (error) { toast.error(`Failed to update campaign report: ${error.message}`); throw error; }
    setCampaignReports((prev) => prev.map((cr) => (cr.id === id ? { ...cr, ...data as CampaignReport } : cr)));
    await logAudit(id, 'campaign_reports', 'UPDATE', oldReport, data);
  };

  const deleteCampaignReport = async (id: string) => {
    if (!user?.id) { toast.error('Authentication required.'); return; }
    const { error } = await supabase.from('campaign_reports').delete().eq('id', id).eq('admin_user_id', user.id);
    if (error) { toast.error(`Failed to delete campaign report: ${error.message}`); throw error; }
    setCampaignReports((prev) => prev.filter((cr) => cr.id !== id));
    await logAudit(id, 'campaign_reports', 'DELETE', { id }, null);
  };

  const logAudit = async (record_id: string, table_name: string, action: string, old_value?: any, new_value?: any) => {
    if (!user?.id) return; // Don't log if no user
    const newLog = {
      user_id: user.id,
      record_id,
      table_name,
      action,
      old_value: old_value ? JSON.stringify(old_value) : null,
      new_value: new_value ? JSON.stringify(new_value) : null,
      timestamp: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('audit_log').insert(newLog).select().single();
    if (error) {
      console.error('Failed to log audit:', error.message);
    } else {
      setAuditLogs((prev) => [data as AuditLog, ...prev].slice(0, 50)); // Keep a limited number of logs in state
    }
  };

  // --- Helper functions for display ---
  const getPanelName = useCallback((panelId: string) => {
    return panels.find(p => p.id === panelId)?.name || 'Unknown Panel';
  }, [panels]);

  const getPanelUserName = useCallback((panelUserId: string) => {
    return panelUsers.find(pu => pu.id === panelUserId)?.username || 'Unknown User';
  }, [panelUsers]);

  const getPanel3LoginId = useCallback((credentialId: string) => {
    return panel3Credentials.find(pc => pc.id === credentialId)?.panel3_login_id || 'N/A';
  }, [panel3Credentials]);

  const value = {
    panels,
    panelUsers,
    panel3Credentials,
    campaignReports,
    auditLogs,
    loadingCampaignData: loadingCampaignData || loadingAuth,
    addPanel,
    updatePanel,
    deletePanel,
    addPanelUser,
    updatePanelUser,
    deletePanelUser,
    addPanel3Credential,
    updatePanel3Credential,
    deletePanel3Credential,
    addCampaignReport,
    updateCampaignReport,
    deleteCampaignReport,
    logAudit,
    getPanelName,
    getPanelUserName,
    getPanel3LoginId,
  };

  return <CampaignDashboardContext.Provider value={value}>{children}</CampaignDashboardContext.Provider>;
};

export const useCampaignDashboard = () => {
  const context = useContext(CampaignDashboardContext);
  if (context === undefined) {
    throw new Error('useCampaignDashboard must be used within a CampaignDashboardProvider');
  }
  return context;
};