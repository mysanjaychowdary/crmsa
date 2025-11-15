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
import { useFreelancer, Payment } from '@/context/FreelancerContext';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
  client_id: z.string().min(1, { message: 'Client is required.' }),
  project_id: z.string().min(1, { message: 'Project is required.' }),
  amount: z.preprocess(
    (val) => Number(val),
    z.number().min(0.01, { message: 'Amount must be a positive number.' })
  ),
  payment_date: z.date({ required_error: 'Payment date is required.' }),
  payment_method: z.string().optional(),
  reference_id: z.string().optional(),
  notes: z.string().optional(),
});

interface AddPaymentDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  projectId?: string;
  clientId?: string;
  editingPayment?: Payment | null;
}

export const AddPaymentDialog: React.FC<AddPaymentDialogProps> = ({ onOpenChange, open, projectId, clientId, editingPayment }) => {
  const { addPayment, updatePayment, clients, projects } = useFreelancer();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: clientId || '',
      project_id: projectId || '',
      amount: 0,
      payment_date: new Date(),
      payment_method: '',
      reference_id: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (editingPayment) {
        form.reset({
          client_id: editingPayment.client_id,
          project_id: editingPayment.project_id,
          amount: editingPayment.amount,
          payment_date: new Date(editingPayment.payment_date),
          payment_method: editingPayment.payment_method || '',
          reference_id: editingPayment.reference_id || '',
          notes: editingPayment.notes || '',
        });
      } else {
        form.reset({
          client_id: clientId || '',
          project_id: projectId || '',
          amount: 0,
          payment_date: new Date(),
          payment_method: '',
          reference_id: '',
          notes: '',
        });
      }
    }
  }, [open, clientId, projectId, editingPayment, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (editingPayment) {
        await updatePayment(editingPayment.id, {
          project_id: values.project_id,
          client_id: values.client_id,
          amount: values.amount,
          payment_date: format(values.payment_date, 'yyyy-MM-dd'),
          payment_method: values.payment_method || undefined,
          reference_id: values.reference_id || undefined,
          notes: values.notes || undefined,
        });
        toast.success('Payment updated successfully!');
      } else {
        await addPayment({
          project_id: values.project_id,
          client_id: values.client_id,
          amount: values.amount,
          payment_date: format(values.payment_date, 'yyyy-MM-dd'),
          payment_method: values.payment_method || undefined,
          reference_id: values.reference_id || undefined,
          notes: values.notes || undefined,
        });
        toast.success('Payment recorded successfully!');
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error handled by context, just prevent dialog close on error
    }
  };

  const selectedClientId = form.watch('client_id');
  const projectsForSelectedClient = projects.filter(p => p.client_id === selectedClientId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{editingPayment ? 'Edit Payment' : 'Record New Payment'}</DialogTitle>
          <DialogDescription>
            {editingPayment ? 'Update the details for this payment.' : 'Enter the details for the payment received.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!clientId && !editingPayment}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!projectId && !editingPayment || projectsForSelectedClient.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projectsForSelectedClient.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 500.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Payment Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <Input placeholder="Bank Transfer, PayPal, Credit Card (Optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reference_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference ID</FormLabel>
                  <FormControl>
                    <Input placeholder="INV-2023-001 (Optional)" {...field} />
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
            <DialogFooter className="md:col-span-2">
              <Button type="submit">{editingPayment ? 'Save Changes' : 'Record Payment'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};