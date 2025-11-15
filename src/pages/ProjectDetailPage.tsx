"use client";

import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFreelancer, ProjectStatus, Payment } from '@/context/FreelancerContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, CalendarDays, FileText, PlusCircle, ArrowLeft, CheckCircle, XCircle, Hourglass, Info, Edit, Trash2, ReceiptText } from 'lucide-react'; // Changed FileInvoice to ReceiptText
import { format, isPast } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AddPaymentDialog } from '@/components/AddPaymentDialog';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
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

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, clients, payments, getProjectWithCalculations, deletePayment } = useFreelancer();
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  const project = useMemo(() => projects.find(p => p.id === projectId), [projects, projectId]);
  const client = useMemo(() => clients.find(c => c.id === project?.client_id), [clients, project]);
  const projectWithCalcs = useMemo(() => getProjectWithCalculations(projectId || ''), [getProjectWithCalculations, projectId]);

  const projectPayments = useMemo(() =>
    payments
      .filter(p => p.project_id === projectId)
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()),
    [payments, projectId]
  );

  if (!project || !client || !projectWithCalcs) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
        <p>The project you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link to="/projects">Back to Projects</Link>
        </Button>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'proposal':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const isOverdue = project.status === 'active' && isPast(new Date(project.due_date)) && projectWithCalcs.pending_amount > 0;

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setIsAddPaymentDialogOpen(true);
  };

  const handleDeletePayment = (paymentId: string) => {
    deletePayment(paymentId);
    toast.success('Payment deleted successfully!');
    setPaymentToDelete(null); // Close dialog
  };

  const handleGenerateInvoice = () => {
    // In a real application, this would trigger a backend call or a client-side PDF generation.
    console.log(`Generating invoice for project: ${project.title} (ID: ${project.id})`);
    toast.success(`Invoice generated for "${project.title}"! (Simulated)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link to="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Link>
        </Button>
        <div className="flex gap-2">
          {project.status === 'completed' && (
            <Button variant="secondary" onClick={handleGenerateInvoice}>
              <ReceiptText className="mr-2 h-4 w-4" /> Generate Invoice {/* Changed FileInvoice to ReceiptText */}
            </Button>
          )}
          <Button onClick={() => {
            setEditingPayment(null); // Ensure we're adding, not editing
            setIsAddPaymentDialogOpen(true);
          }}>
            <DollarSign className="mr-2 h-4 w-4" /> Record Payment
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl">{project.title}</CardTitle>
              <Badge variant={getStatusBadgeVariant(project.status)}>
                {project.status} {isOverdue && '(Overdue)'}
              </Badge>
            </div>
            <CardDescription>
              Client: <Link to={`/clients/${client.id}`} className="text-primary hover:underline">{client.name}</Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Start Date: {format(new Date(project.start_date), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Due Date: {format(new Date(project.due_date), 'MMM dd, yyyy')}</span>
              </div>
            </div>
            {project.description && (
              <div className="space-y-1">
                <div className="flex items-center font-medium">
                  <FileText className="mr-2 h-4 w-4 text-muted-foreground" /> Description:
                </div>
                <p className="text-muted-foreground text-sm">{project.description}</p>
              </div>
            )}
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-muted-foreground text-sm">Total Amount</p>
                <p className="text-xl font-bold">{formatCurrency(project.total_amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Paid Amount</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(projectWithCalcs.paid_amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Pending Amount</p>
                <p className={cn("text-xl font-bold", projectWithCalcs.pending_amount > 0 ? "text-destructive" : "text-green-600")}>
                  {formatCurrency(projectWithCalcs.pending_amount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Project Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {project.notes ? (
              <p className="text-muted-foreground text-sm">{project.notes}</p>
            ) : (
              <p className="text-muted-foreground text-sm">No notes for this project.</p>
            )}
            {/* Future: Add an edit notes button/form here */}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {projectPayments.length > 0 ? (
            <div className="relative pl-8">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              {projectPayments.map((payment, index) => (
                <div key={payment.id} className="mb-6 relative">
                  <div className="absolute left-0 top-0 h-3 w-3 rounded-full bg-primary -translate-x-1/2 border border-background" />
                  <div className="ml-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditPayment(payment)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog open={paymentToDelete === payment.id} onOpenChange={(open) => setPaymentToDelete(open ? payment.id : null)}>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
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
                      </div>
                    </div>
                    <p className="text-lg font-semibold">{formatCurrency(payment.amount)}</p>
                    {payment.payment_method && (
                      <p className="text-sm text-muted-foreground">Method: {payment.payment_method}</p>
                    )}
                    {payment.reference_id && (
                      <p className="text-sm text-muted-foreground">Ref ID: {payment.reference_id}</p>
                    )}
                    {payment.notes && (
                      <p className="text-sm text-muted-foreground">Notes: {payment.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No payments recorded for this project yet.</p>
          )}
        </CardContent>
      </Card>

      <AddPaymentDialog
        open={isAddPaymentDialogOpen}
        onOpenChange={(open) => {
          setIsAddPaymentDialogOpen(open);
          if (!open) setEditingPayment(null); // Clear editing state when dialog closes
        }}
        projectId={project.id}
        clientId={project.client_id}
        editingPayment={editingPayment}
      />
    </div>
  );
};

export default ProjectDetailPage;