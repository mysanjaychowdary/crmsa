"use client";

import React, { useState, useMemo } from 'react';
import { useFreelancer } from '@/context/FreelancerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Search } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/currency';
import { AddPaymentDialog } from '@/components/AddPaymentDialog';
import { Link } from 'react-router-dom';

const PaymentsPage: React.FC = () => {
  const { payments, clients, projects } = useFreelancer();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState<string | 'all'>('all');
  const [filterProject, setFilterProject] = useState<string | 'all'>('all');
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Unknown Client';
  };

  const getProjectTitle = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.title || 'Unknown Project';
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const clientName = getClientName(payment.client_id);
      const projectTitle = getProjectTitle(payment.project_id);

      const matchesSearch =
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.payment_method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.reference_id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClient =
        filterClient === 'all' || payment.client_id === filterClient;

      const matchesProject =
        filterProject === 'all' || payment.project_id === filterProject;

      return matchesSearch && matchesClient && matchesProject;
    }).sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()); // Sort by date descending
  }, [payments, clients, projects, searchTerm, filterClient, filterProject]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payments</h1>
        <Button onClick={() => setIsAddPaymentDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Record Payment
        </Button>
      </div>
      <p className="text-muted-foreground">View and manage all payments.</p>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments by client, project, method, or reference..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={filterClient}
          onValueChange={(value: string | 'all') => setFilterClient(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterProject}
          onValueChange={(value: string | 'all') => setFilterProject(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference ID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{format(new Date(payment.payment_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    <Link to={`/clients/${payment.client_id}`} className="text-primary hover:underline">
                      {getClientName(payment.client_id)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`/projects/${payment.project_id}`} className="text-primary hover:underline">
                      {getProjectTitle(payment.project_id)}
                    </Link>
                  </TableCell>
                  <TableCell>{payment.payment_method || 'N/A'}</TableCell>
                  <TableCell>{payment.reference_id || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    {/* Future: Add edit/delete payment actions here */}
                    <Button variant="outline" size="sm" disabled>
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No payments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddPaymentDialog
        open={isAddPaymentDialogOpen}
        onOpenChange={setIsAddPaymentDialogOpen}
        // Default to the first client/project if available, or handle selection in dialog
        projectId={projects[0]?.id || ''}
        clientId={clients[0]?.id || ''}
      />
    </div>
  );
};

export default PaymentsPage;