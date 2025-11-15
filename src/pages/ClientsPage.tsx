"use client";

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFreelancer, Client } from '@/context/FreelancerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Building2, Mail, DollarSign, CalendarDays, Edit, Trash2 } from 'lucide-react';
import { ClientFormDialog } from '@/components/ClientFormDialog'; // Updated import
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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

const ClientsPage: React.FC = () => {
  const { clients, payments, getPendingAmountForClient, deleteClient, loadingData } = useFreelancer();
  const [searchTerm, setSearchTerm] = useState('');
  const [isClientFormDialogOpen, setIsClientFormDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

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

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsClientFormDialogOpen(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      await deleteClient(clientId);
      toast.success('Client deleted successfully!');
      setClientToDelete(null); // Close dialog
    } catch (error) {
      // Error handled by context
    }
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
        <Button onClick={() => { setEditingClient(null); setIsClientFormDialogOpen(true); }}>
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
              <CardFooter className="flex justify-between gap-2">
                <Link to={`/clients/${client.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View
                  </Button>
                </Link>
                <Button variant="outline" size="icon" onClick={() => handleEditClient(client)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog open={clientToDelete === client.id} onOpenChange={(open) => setClientToDelete(open ? client.id : null)}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the client and all associated projects and payments.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteClient(client.id)}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full h-24 flex items-center justify-center text-muted-foreground">
            No clients found.
          </div>
        )}
      </div>

      <ClientFormDialog
        open={isClientFormDialogOpen}
        onOpenChange={(open) => {
          setIsClientFormDialogOpen(open);
          if (!open) setEditingClient(null); // Clear editing client when dialog closes
        }}
        editingClient={editingClient}
      />
    </div>
  );
};

export default ClientsPage;