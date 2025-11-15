"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFreelancer, Client } from '@/context/FreelancerContext';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Client name must be at least 2 characters.' }),
  company: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  tags: z.string().optional(),
  notes: z.string().optional(),
});

interface ClientFormDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  editingClient?: Client | null; // New prop for editing
}

export const ClientFormDialog: React.FC<ClientFormDialogProps> = ({ onOpenChange, open, editingClient }) => {
  const { addClient, updateClient } = useFreelancer();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      tags: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (editingClient) {
        form.reset({
          name: editingClient.name,
          company: editingClient.company || '',
          email: editingClient.email || '',
          phone: editingClient.phone || '',
          address: editingClient.address || '',
          tags: editingClient.tags?.join(', ') || '',
          notes: editingClient.notes || '',
        });
      } else {
        form.reset({
          name: '',
          company: '',
          email: '',
          phone: '',
          address: '',
          tags: '',
          notes: '',
        });
      }
    }
  }, [open, editingClient, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const clientData = {
        name: values.name,
        company: values.company || undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
        address: values.address || undefined,
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : undefined,
        notes: values.notes || undefined,
      };

      if (editingClient) {
        await updateClient(editingClient.id, clientData);
        toast.success('Client updated successfully!');
      } else {
        await addClient(clientData as Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>);
        toast.success('Client added successfully!');
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error handled by context, just prevent dialog close on error
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          <DialogDescription>
            {editingClient ? 'Update the details for this client.' : 'Fill in the details to add a new client to your roster.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Client Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Company Name (Optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="client@example.com (Optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="555-123-4567 (Optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, City, Country (Optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., web, design, marketing (Optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes (Optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="md:col-span-2 mt-4">
              <Button type="submit">{editingClient ? 'Save Changes' : 'Add Client'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};