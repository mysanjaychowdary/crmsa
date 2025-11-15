"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useFreelancer, PaymentMethod } from '@/context/FreelancerContext';
import { toast } from 'sonner';
import { PlusCircle, Banknote, Trash2, Edit } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

const paymentMethodSchema = z.object({
  name: z.string().min(2, { message: 'Method name must be at least 2 characters.' }),
  details: z.string().optional(),
  is_default: z.boolean().default(false),
});

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

export const PaymentMethodSettings: React.FC = () => {
  const { paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, loadingData } = useFreelancer();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<z.infer<typeof paymentMethodSchema> & { id: string } | null>(null);

  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      name: '',
      details: '',
      is_default: false,
    },
  });

  React.useEffect(() => {
    if (editingMethod) {
      form.reset(editingMethod);
    } else {
      form.reset({ name: '', details: '', is_default: false });
    }
  }, [editingMethod, form]);

  const onSubmit = async (values: PaymentMethodFormValues) => {
    try {
      if (editingMethod) {
        await updatePaymentMethod(editingMethod.id, values);
        toast.success('Payment method updated successfully!');
      } else {
        await addPaymentMethod(values as Omit<PaymentMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'>);
        toast.success('Payment method added successfully!');
      }
      setIsDialogOpen(false);
      setEditingMethod(null);
      form.reset();
    } catch (error) {
      // Error handled by context, just prevent dialog close on error
    }
  };

  const handleEdit = (method: z.infer<typeof paymentMethodSchema> & { id: string }) => {
    setEditingMethod(method);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        await deletePaymentMethod(id);
        toast.success('Payment method deleted.');
      } catch (error) {
        // Error handled by context
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      // First, set all others to not default
      for (const method of paymentMethods) {
        if (method.id !== id && method.is_default) {
          await updatePaymentMethod(method.id, { is_default: false });
        }
      }
      // Then, set the selected one to default
      await updatePaymentMethod(id, { is_default: true });
      toast.success('Default payment method updated.');
    } catch (error) {
      // Error handled by context
    }
  };

  if (loadingData) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-5 w-5" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Configure how you receive payments from clients.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingMethod(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMethod(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Method
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}</DialogTitle>
              <DialogDescription>
                {editingMethod ? 'Update the details for this payment method.' : 'Add a new way to receive payments.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Method Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Bank Transfer, PayPal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Details (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Account Number, PayPal Email" {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide any necessary details for this payment method.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_default"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Set as Default</FormLabel>
                        <FormDescription>
                          This method will be pre-selected for new payments.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">{editingMethod ? 'Save Changes' : 'Add Method'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {paymentMethods.length > 0 ? (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center space-x-3">
                  <Banknote className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{method.name}</p>
                    {method.details && <p className="text-sm text-muted-foreground">{method.details}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {method.is_default ? (
                    <Badge variant="secondary">Default</Badge>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleSetDefault(method.id)}>
                      Set Default
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(method)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(method.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No payment methods configured yet.</p>
        )}
      </CardContent>
    </Card>
  );
};