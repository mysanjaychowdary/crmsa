"use client";

import React from 'react';
import { useFreelancer } from '@/context/FreelancerContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, FolderKanban, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

const Dashboard: React.FC = () => {
  const { getTotalIncomeThisMonth, getTotalPendingOverall, getTotalActiveProjects, getOverdueProjects } = useFreelancer();

  const totalIncomeThisMonth = getTotalIncomeThisMonth();
  const totalPendingOverall = getTotalPendingOverall();
  const totalActiveProjects = getTotalActiveProjects();
  const overdueProjectsCount = getOverdueProjects().length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncomeThisMonth)}</div>
            <p className="text-xs text-muted-foreground">
              Income received in the current month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPendingOverall)}</div>
            <p className="text-xs text-muted-foreground">
              Total outstanding amount from all clients
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveProjects}</div>
            <p className="text-xs text-muted-foreground">
              Projects currently in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Projects</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueProjectsCount}</div>
            <p className="text-xs text-muted-foreground">
              Projects past due date with pending payments
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Income Last 6 Months</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {/* Placeholder for Income Last 6 Months Chart */}
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Chart will go here
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for Recent Payments Table */}
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Table will go here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;