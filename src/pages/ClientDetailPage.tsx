"use client";

import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFreelancer, Project, Payment } from '@/context/FreelancerContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Mail, Phone, MapPin, Tag, FileText, PlusCircle, CalendarDays, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

const ClientDetailPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { clients, projects, payments, getPendingAmountForClient, getProjectWithCalculations, loadingData } = useFreelancer();

  const client = useMemo(() => clients.find(c => c.id === clientId), [clients, clientId]);

  const clientProjects = useMemo(() => projects.filter(p => p.client_id === clientId), [projects, clientId]);

  const clientPayments = useMemo(() =>
    payments
      .filter(p => p.client_id === clientId)
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()),
    [payments, clientId]
  );

  const totalOutstanding = useMemo(() => getPendingAmountForClient(clientId || ''), [getPendingAmountForClient, clientId]);

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-1/3" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Skeleton className="h-5 w-2/3" />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-0.5 w-full" />
              <Skeleton className="h-6 w-1/4" />
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
          <CardContent>
            <div className="relative pl-8 space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="ml-4 space-y-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <h2 className="text-2xl font-bold mb-2">Client Not Found</h2>
        <p>The client you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link to="/clients">Back to Clients</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{client.name}</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Project
          </Button>
          <Button>
            <DollarSign className="mr-2 h-4 w-4" /> Record Payment
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground">Details and activities for {client.name}.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Last updated: {format(new Date(client.updated_at), 'MMM dd, yyyy HH:mm')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {client.company && (
              <div className="flex items-center text-sm">
                <span className="font-medium mr-2">Company:</span> {client.company}
              </div>
            )}
            {client.email && (
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> {client.email}
              </div>
            )}
            {client.phone && (
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" /> {client.phone}
              </div>
            )}
            {client.address && (
              <div className="flex items-start text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" /> {client.address}
              </div>
            )}
            {client.tags && client.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {client.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
            {client.notes && (
              <div className="space-y-1 text-sm">
                <div className="flex items-center font-medium">
                  <FileText className="mr-2 h-4 w-4 text-muted-foreground" /> Notes:
                </div>
                <p className="text-muted-foreground">{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total Outstanding Amount:</span>
              <span className="text-destructive">{formatCurrency(totalOutstanding)}</span>
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Projects ({clientProjects.length})</h3>
              {clientProjects.length > 0 ? (
                <div className="grid gap-2">
                  {clientProjects.map(project => {
                    const projectWithCalcs = getProjectWithCalculations(project.id);
                    return (
                      <Link to={`/projects/${project.id}`} key={project.id} className="block hover:bg-muted p-2 rounded-md transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-medium">{project.title}</span>
                            <span className="text-sm text-muted-foreground">Due: {format(new Date(project.due_date), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={project.status === 'active' ? 'default' : project.status === 'completed' ? 'secondary' : 'outline'}>
                              {project.status}
                            </Badge>
                            {projectWithCalcs && projectWithCalcs.pending_amount > 0 && (
                              <span className="text-sm text-destructive font-medium">
                                {formatCurrency(projectWithCalcs.pending_amount)} Pending
                              </span>
                            )}
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No projects associated with this client yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {clientPayments.length > 0 ? (
            <div className="relative pl-8">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              {clientPayments.map((payment, index) => (
                <div key={payment.id} className="mb-6 relative">
                  <div className="absolute left-0 top-0 h-3 w-3 rounded-full bg-primary -translate-x-1/2 border border-background" />
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-lg font-semibold">{formatCurrency(payment.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      For project: <Link to={`/projects/${payment.project_id}`} className="underline hover:text-primary">{projects.find(p => p.id === payment.project_id)?.title || 'Unknown Project'}</Link>
                    </p>
                    {payment.payment_method && (
                      <p className="text-xs text-muted-foreground">Method: {payment.payment_method}</p>
                    )}
                    {payment.reference_id && (
                      <p className="text-xs text-muted-foreground">Ref ID: {payment.reference_id}</p>
                    )}
                    {payment.notes && (
                      <p className="text-xs text-muted-foreground">Notes: {payment.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No payments recorded for this client yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDetailPage;