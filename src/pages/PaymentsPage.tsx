"use client";

import React, { useState, useMemo } from 'react';
import { useFreelancer, Payment } from '@/context/FreelancerContext';
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
import { PlusCircle, Search, Edit, Trash2 } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const PaymentsPage: React.FC = () => {
  const { payments, clients, projects, deletePayment } = useFreelancer();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState<string | 'all'>('all');
  const [filterProject, setFilterProject] = useState<string | 'all'>('all');
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

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

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setIsAddPaymentDialogOpen(true);
  };

  const handleDeletePayment = (paymentId: string) => {
    deletePayment(paymentId);
    toast.success('Payment deleted successfully!');
    setPaymentToDelete(null); // Close dialog
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payments</h1>
        {/* Removed the "Record Payment" button as requested */}
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
                  <TableCell className="text-right flex gap-2 justify-end">
                    <Button variant="outline" size="icon" onClick={() => handleEditPayment(payment)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog open={paymentToDelete === payment.id} onOpenChange={(open) => setPaymentToDelete(open ? payment.id : null)}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the payment record.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeletePayment(payment.id)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
        onOpenChange={(open) => {
          setIsAddPaymentDialogOpen(open);
          if (!open) setEditingPayment(null); // Clear editing state when dialog closes
        }}
        projectId={editingPayment?.project_id || projects[0]?.id || ''}
        clientId={editingPayment?.client_id || clients[0]?.id || ''}
        editingPayment={editingPayment}
      />
    </div>
  );
};

export default PaymentsPage;