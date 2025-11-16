"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PanelManagement } from '@/components/PanelManagement';
import { PanelUserManagement } from '@/components/PanelUserManagement';
import { Panel3CredentialManagement } from '@/components/Panel3CredentialManagement';
import { useCampaignDashboard } from '@/context/CampaignDashboardContext';
import { Skeleton } from '@/components/ui/skeleton';

const MasterSetupPage: React.FC = () => {
  const { loadingCampaignData } = useCampaignDashboard();

  if (loadingCampaignData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                <Skeleton className="h-5 w-1/3" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Master Setup</h1>
      <p className="text-muted-foreground">Configure panels, panel users, and Panel 3 credentials.</p>

      <Tabs defaultValue="panels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="panels">Panel Management</TabsTrigger>
          <TabsTrigger value="panel-users">Panel User Management</TabsTrigger>
          <TabsTrigger value="panel3-credentials">Panel 3 Credentials</TabsTrigger>
        </TabsList>

        <TabsContent value="panels">
          <PanelManagement />
        </TabsContent>
        <TabsContent value="panel-users">
          <PanelUserManagement />
        </TabsContent>
        <TabsContent value="panel3-credentials">
          <Panel3CredentialManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MasterSetupPage;