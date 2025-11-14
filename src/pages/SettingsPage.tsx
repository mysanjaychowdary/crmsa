"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PaymentMethodSettings } from '@/components/PaymentMethodSettings'; // Import the new component

const businessProfileSchema = z.object({
  businessName: z.string().min(2, { message: 'Business name must be at least 2 characters.' }).optional(),
  contactEmail: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
});

type BusinessProfileFormValues = z.infer<typeof businessProfileSchema>;

const SettingsPage: React.FC = () => {
  const form = useForm<BusinessProfileFormValues>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      businessName: 'Freelancer App',
      contactEmail: 'contact@example.com',
      phoneNumber: '555-123-4567',
      address: '123 Business Rd, Suite 100, City, Country',
    },
  });

  const onSubmit = (values: BusinessProfileFormValues) => {
    // In a real application, you would send this data to a backend API
    console.log('Business Profile updated:', values);
    toast.success('Business profile updated successfully!');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-muted-foreground">Configure your business profile and preferences.</p>

      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>Manage your basic business information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Business Name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the name that will appear on invoices and reports.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      The primary email for client communication.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., +1 (555) 123-4567" {...field} />
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
                      <Textarea placeholder="Your business address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <PaymentMethodSettings /> {/* Replaced placeholder with the new component */}

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage your email and in-app notification settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Notification preferences will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;