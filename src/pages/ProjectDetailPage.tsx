"use client";

import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFreelancer, ProjectStatus, Payment, Project } from '@/context/FreelancerContext'; // Import Project type
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, CalendarDays, FileText, PlusCircle, ArrowLeft, CheckCircle, XCircle, Hourglass, Info, Edit, Trash2, ReceiptText } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AddPaymentDialog } from '@/components/AddPaymentDialog';
import { AddProjectDialog } from '@/components/AddProjectDialog'; // Import AddProjectDialog
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
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { InvoiceViewerDialog } from '@/components/InvoiceViewerDialog'; // Import InvoiceViewerDialog

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, clients, payments, getProjectWithCalculations, deletePayment, deleteProject, businessProfile, loadingData } = useFreelancer(); // Get businessProfile
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false); // State for editing project
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null); // State for project to delete
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null); // State for simulated invoice URL
  const [isInvoiceViewerOpen, setIsInvoiceViewerOpen] = useState(false); // State for invoice viewer dialog

  const project = useMemo(() => projects.find(p => p.id === projectId), [projects, projectId]);
  const client = useMemo(() => clients.find(c => c.id === project?.client_id), [clients, project]);
  const projectWithCalcs = useMemo(() => getProjectWithCalculations(projectId || ''), [getProjectWithCalculations, projectId]);

  const projectPayments = useMemo(() =>
    payments
      .filter(p => p.project_id === projectId)
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()),
    [payments, projectId]
  );

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-0.5 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
            <CardContent><Skeleton className="h-24 w-full" /></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
          <CardContent>
            <div className="relative pl-8 space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="ml-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await deletePayment(paymentId);
      toast.success('Payment deleted successfully!');
      setPaymentToDelete(null); // Close dialog
    } catch (error) {
      // Error handled by context
    }
  };

  const handleEditProject = () => {
    setIsEditProjectDialogOpen(true);
  };

  const handleDeleteProject = async () => {
    if (project) {
      try {
        await deleteProject(project.id);
        toast.success('Project deleted successfully!');
        navigate('/projects'); // Redirect to projects page after deletion
      } catch (error) {
        // Error handled by context
      }
    }
  };

  const handleGenerateInvoice = () => {
    // Simulate invoice generation
    const dummyInvoiceId = `INV-${project.id.substring(0, 8).toUpperCase()}-${new Date().getFullYear()}`;
    const dummyInvoiceUrl = `https://example.com/invoices/${dummyInvoiceId}.pdf`; // Placeholder URL
    setInvoiceUrl(dummyInvoiceUrl);
    toast.success(`Invoice for "${project.title}" generated!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2"> {/* Grouping left-aligned buttons */}
          <Button variant="outline" asChild>
            <Link to="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
            </Link>
          </Button>
          <Button variant="outline" size="icon" onClick={handleEditProject}>
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog open={projectToDelete === project.id} onOpenChange={(open) => setProjectToDelete(open ? project.id : null)}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon"> {/* Changed to outline, icon color will be set below */}
                <Trash2 className="h-4 w-4 text-destructive" /> {/* Added text-destructive for icon color */}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the project and all associated payments.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteProject()}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="flex gap-2"> {/* Grouping right-aligned buttons */}
          {project.status === 'completed' && (
            invoiceUrl ? (
              <Button variant="secondary" onClick={() => setIsInvoiceViewerOpen(true)}>
                <ReceiptText className="mr-2 h-4 w-4" /> View Invoice
              </Button>
            ) : (
              <Button variant="secondary" onClick={handleGenerateInvoice}>
                <ReceiptText className="mr-2 h-4 w-4" /> Generate Invoice
              </Button>
            )
          )}
          <Button onClick={() => {
            setEditingPayment(null);
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
          if (!open) setEditingPayment(null);
        }}
        projectId={project.id}
        clientId={project.client_id}
        editingPayment={editingPayment}
      />

      <AddProjectDialog
        open={isEditProjectDialogOpen}
        onOpenChange={(open) => setIsEditProjectDialogOpen(open)}
        editingProject={project}
      />

      {project && client && (
        <InvoiceViewerDialog
          open={isInvoiceViewerOpen}
          onOpenChange={setIsInvoiceViewerOpen}
          invoiceUrl={invoiceUrl}
          project={project}
          client={client}
          businessProfile={businessProfile}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;