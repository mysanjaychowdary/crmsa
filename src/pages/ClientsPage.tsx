"use client";

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFreelancer, Client } from '@/context/FreelancerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Building2, Mail, DollarSign, CalendarDays } from 'lucide-react';
import { AddClientDialog } from '@/components/AddClientDialog';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

const ClientsPage: React.FC = () => {
  const { clients, payments, getPendingAmountForClient, loadingData } = useFreelancer();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);

  const filteredClients = useMemo(() => {
    return clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const getClientLastPaymentDate = (clientId: string) => {
    const clientPayments = payments.filter(p => p.client_id === clientId);
    if (clientPayments.length === 0) return 'N/A';
    const latestPayment = clientPayments.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())[0];
    return format(new Date(latestPayment.payment_date), 'MMM dd, yyyy');
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[150px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <Skeleton className="h-5 w-[250px]" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="flex-1 space-y-2 text-sm">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Button onClick={() => setIsAddClientDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>
      <p className="text-muted-foreground">Manage your clients here.</p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients by name, company, or email..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <Card key={client.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{client.name}</CardTitle>
                {client.company && (
                  <CardDescription className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" /> {client.company}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1 space-y-2 text-sm">
                {client.email && (
                  <p className="flex items-center gap-1 text-muted-foreground">
                    <Mail className="h-4 w-4" /> {client.email}
                  </p>
                )}
                <p className="flex items-center gap-1 font-medium">
                  <DollarSign className="h-4 w-4 text-destructive" /> Pending: <span className="text-destructive">{formatCurrency(getPendingAmountForClient(client.id))}</span>
                </p>
                <p className="flex items-center gap-1 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" /> Last Payment: {getClientLastPaymentDate(client.id)}
                </p>
              </CardContent>
              <CardFooter>
                <Link to={`/clients/${client.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Client
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full h-24 flex items-center justify-center text-muted-foreground">
            No clients found.
          </div>
        )}
      </div>

      <AddClientDialog
        open={isAddClientDialogOpen}
        onOpenChange={setIsAddClientDialogOpen}
      />
    </div>
  );
};

export default ClientsPage;