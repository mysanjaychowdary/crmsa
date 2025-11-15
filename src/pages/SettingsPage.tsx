"use client";

import React, { useEffect } from 'react';
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
import { PaymentMethodSettings } from '@/components/PaymentMethodSettings';
import { useFreelancer } from '@/context/FreelancerContext'; // Import useFreelancer
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

const businessProfileSchema = z.object({
  businessName: z.string().min(2, { message: 'Business name must be at least 2 characters.' }).optional().or(z.literal('')),
  contactEmail: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  whatsappInstanceId: z.string().optional(), // New field for WhatsApp Instance ID
  whatsappAccessToken: z.string().optional(), // New field for WhatsApp Access Token
});

type BusinessProfileFormValues = z.infer<typeof businessProfileSchema>;

const SettingsPage: React.FC = () => {
  const { businessProfile, addBusinessProfile, updateBusinessProfile, loadingData } = useFreelancer(); // Get businessProfile and functions

  const form = useForm<BusinessProfileFormValues>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      businessName: '',
      contactEmail: '',
      phoneNumber: '',
      address: '',
      whatsappInstanceId: '',
      whatsappAccessToken: '',
    },
  });

  useEffect(() => {
    if (businessProfile) {
      form.reset({
        businessName: businessProfile.business_name || '',
        contactEmail: businessProfile.contact_email || '',
        phoneNumber: businessProfile.phone_number || '',
        address: businessProfile.address || '',
        whatsappInstanceId: businessProfile.whatsapp_instance_id || '',
        whatsappAccessToken: businessProfile.whatsapp_access_token || '',
      });
    } else {
      form.reset({
        businessName: '',
        contactEmail: '',
        phoneNumber: '',
        address: '',
        whatsappInstanceId: '',
        whatsappAccessToken: '',
      });
    }
  }, [businessProfile, form]);

  const onSubmit = async (values: BusinessProfileFormValues) => {
    try {
      const profileData = {
        business_name: values.businessName || null,
        contact_email: values.contactEmail || null,
        phone_number: values.phoneNumber || null,
        address: values.address || null,
        whatsapp_instance_id: values.whatsappInstanceId || null,
        whatsapp_access_token: values.whatsappAccessToken || null,
      };

      if (businessProfile) {
        await updateBusinessProfile(businessProfile.id, profileData);
        toast.success('Business profile updated successfully!');
      } else {
        await addBusinessProfile(profileData);
        toast.success('Business profile created successfully!');
      }
    } catch (error) {
      console.error('Error updating business profile:', error);
      toast.error('Failed to update business profile.');
    }
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-5 w-2/3" />

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-8">
            {[...Array(6)].map((_, i) => ( // Increased skeleton count for new fields
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-2/3" />
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

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <Separator />
              <CardTitle>WhatsApp API Settings</CardTitle>
              <CardDescription>Configure your WhatsApp API for sending OTPs.</CardDescription>
              <FormField
                control={form.control}
                name="whatsappInstanceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Instance ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 609ACF283XXXX" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your instance ID from the WhatsApp API provider.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whatsappAccessToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Access Token</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="e.g., 649134e3b51b9" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your access token for the WhatsApp API. Keep this secure.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <PaymentMethodSettings />

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