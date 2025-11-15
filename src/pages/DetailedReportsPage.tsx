"use client";

import React, { useState, useMemo } from 'react';
import { useFreelancer } from '@/context/FreelancerContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/currency';
import { CalendarDays, DollarSign, FolderKanban, PlusCircle, CheckCircle, Hourglass, PiggyBank } from 'lucide-react'; // Import PiggyBank icon
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MonthlyProjectsDialog } from '@/components/MonthlyProjectsDialog'; // Import new dialog
import { MonthlyPaymentsDialog } from '@/components/MonthlyPaymentsDialog'; // Import new dialog

const DetailedReportsPage: React.FC = () => {
  const { getMonthlyReportSummary, loadingData, clients } = useFreelancer(); // Get clients from context
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // getMonth() is 0-indexed

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  // States for dialogs
  const [isNewProjectsDialogOpen, setIsNewProjectsDialogOpen] = useState(false);
  const [isPaymentsReceivedDialogOpen, setIsPaymentsReceivedDialogOpen] = useState(false);
  const [isPendingProjectsDialogOpen, setIsPendingProjectsDialogOpen] = useState(false);
  const [isCompletedProjectsDialogOpen, setIsCompletedProjectsDialogOpen] = useState(false);
  const [isOtherPaymentsDialogOpen, setIsOtherPaymentsDialogOpen] = useState(false); // New state for other payments dialog


  const years = useMemo(() => {
    const yearsArray = [];
    for (let i = currentYear; i >= currentYear - 5; i--) { // Last 5 years
      yearsArray.push(i);
    }
    return yearsArray;
  }, [currentYear]);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: format(new Date(currentYear, i, 1), 'MMMM'),
    }));
  }, [currentYear]);

  const reportSummary = useMemo(() => {
    if (!loadingData) {
      return getMonthlyReportSummary(selectedYear, selectedMonth);
    }
    return null;
  }, [selectedYear, selectedMonth, getMonthlyReportSummary, loadingData]);

  if (loadingData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-5 w-2/3" />

        <div className="flex gap-4">
          <Skeleton className="h-10 w-[150px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[100px] mb-2" />
                <Skeleton className="h-3 w-[200px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const monthLabel = months[selectedMonth - 1]?.label;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Detailed Reports</h1>
      <p className="text-muted-foreground">View monthly summaries of your projects and finances.</p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={selectedYear.toString()}
          onValueChange={(value) => setSelectedYear(Number(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedMonth.toString()}
          onValueChange={(value) => setSelectedMonth(Number(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value.toString()}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {reportSummary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setIsNewProjectsDialogOpen(true)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Projects</CardTitle>
              <PlusCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportSummary.newProjectsCount}</div>
              <p className="text-xs text-muted-foreground">
                Projects started in {monthLabel} {selectedYear}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Project Value</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportSummary.totalProjectsAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Total value of projects started in the month
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setIsPaymentsReceivedDialogOpen(true)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payments Received (This Month's Projects)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportSummary.totalPaymentsReceived)}</div>
              <p className="text-xs text-muted-foreground">
                Payments for projects started in {monthLabel} {selectedYear}
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setIsOtherPaymentsDialogOpen(true)}> {/* New Card */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payments Received (Other Projects)</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportSummary.totalPaymentsReceivedFromOtherProjects)}</div>
              <p className="text-xs text-muted-foreground">
                Payments for projects started before {monthLabel} {selectedYear}
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setIsPendingProjectsDialogOpen(true)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending for Month's Projects</CardTitle>
              <Hourglass className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportSummary.totalPendingAmountForMonthProjects)}</div>
              <p className="text-xs text-muted-foreground">
                Pending amount for projects due in {monthLabel} {selectedYear}
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setIsCompletedProjectsDialogOpen(true)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed for Month's Projects</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportSummary.totalCompletedAmountForMonthProjects)}</div>
              <p className="text-xs text-muted-foreground">
                Total value of projects completed and due in {monthLabel} {selectedYear}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialogs for detailed views */}
      {reportSummary && (
        <>
          <MonthlyProjectsDialog
            open={isNewProjectsDialogOpen}
            onOpenChange={setIsNewProjectsDialogOpen}
            title={`New Projects in ${monthLabel} ${selectedYear}`}
            description="Projects whose start date falls within the selected month."
            projects={reportSummary.newProjects}
            clients={clients}
          />
          <MonthlyPaymentsDialog
            open={isPaymentsReceivedDialogOpen}
            onOpenChange={setIsPaymentsReceivedDialogOpen}
            title={`Payments Received for This Month's Projects in ${monthLabel} ${selectedYear}`}
            description={`Payments recorded in ${monthLabel} ${selectedYear} for projects that also started in ${monthLabel} ${selectedYear}.`}
            payments={reportSummary.paymentsReceived}
          />
          <MonthlyPaymentsDialog
            open={isOtherPaymentsDialogOpen}
            onOpenChange={setIsOtherPaymentsDialogOpen}
            title={`Payments Received for Other Projects in ${monthLabel} ${selectedYear}`}
            description={`Payments recorded in ${monthLabel} ${selectedYear} for projects that started before ${monthLabel} ${selectedYear}.`}
            payments={reportSummary.paymentsReceivedFromOtherProjects}
          />
          <MonthlyProjectsDialog
            open={isPendingProjectsDialogOpen}
            onOpenChange={setIsPendingProjectsDialogOpen}
            title={`Pending Projects Due in ${monthLabel} ${selectedYear}`}
            description="Active projects with outstanding amounts whose due date falls within the selected month."
            projects={reportSummary.pendingProjectsForMonth}
            clients={clients}
          />
          <MonthlyProjectsDialog
            open={isCompletedProjectsDialogOpen}
            onOpenChange={setIsCompletedProjectsDialogOpen}
            title={`Completed Projects Due in ${monthLabel} ${selectedYear}`}
            description="Projects marked as completed whose due date falls within the selected month."
            projects={reportSummary.completedProjectsForMonth}
            clients={clients}
          />
        </>
      )}
    </div>
  );
};

export default DetailedReportsPage;