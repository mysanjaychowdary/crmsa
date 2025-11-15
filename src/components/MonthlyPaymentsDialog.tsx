"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Payment, useFreelancer } from '@/context/FreelancerContext';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface MonthlyPaymentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  payments: Payment[];
}

export const MonthlyPaymentsDialog: React.FC<MonthlyPaymentsDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  payments,
}) => {
  const { clients, projects } = useFreelancer();

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Unknown Client';
  };

  const getProjectTitle = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.title || 'Unknown Project';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto py-4">
          {payments.length > 0 ? (
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No payments found for this report.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};