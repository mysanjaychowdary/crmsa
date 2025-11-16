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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit, Trash2, Key, Eye, EyeOff, Copy } from 'lucide-react';
import { useCampaignDashboard, Panel3Credential } from '@/context/CampaignDashboardContext';
import { toast } from 'sonner';
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

const panel3CredentialSchema = z.object({
  panel3_login_id: z.string().min(2, { message: 'Login ID must be at least 2 characters.' }),
  panel3_password_encrypted: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type Panel3CredentialFormValues = z.infer<typeof panel3CredentialSchema>;

export const Panel3CredentialManagement: React.FC = () => {
  const { panel3Credentials, addPanel3Credential, updatePanel3Credential, deletePanel3Credential } = useCampaignDashboard();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Panel3Credential | null>(null);
  const [credentialToDelete, setCredentialToDelete] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<string | null>(null); // Stores ID of credential to show password for

  const form = useForm<Panel3CredentialFormValues>({
    resolver: zodResolver(panel3CredentialSchema),
    defaultValues: {
      panel3_login_id: '',
      panel3_password_encrypted: '',
    },
  });

  React.useEffect(() => {
    if (editingCredential) {
      form.reset({
        panel3_login_id: editingCredential.panel3_login_id,
        panel3_password_encrypted: editingCredential.panel3_password_encrypted, // Pre-fill for editing
      });
    } else {
      form.reset({ panel3_login_id: '', panel3_password_encrypted: '' });
    }
  }, [editingCredential, form]);

  const onSubmit = async (values: Panel3CredentialFormValues) => {
    try {
      if (editingCredential) {
        await updatePanel3Credential(editingCredential.id, values);
        toast.success('Panel 3 credential updated successfully!');
      } else {
        await addPanel3Credential(values);
        toast.success('Panel 3 credential added successfully!');
      }
      setIsDialogOpen(false);
      setEditingCredential(null);
      form.reset();
    } catch (error) {
      // Error handled by context, just prevent dialog close on error
    }
  };

  const handleEdit = (credential: Panel3Credential) => {
    setEditingCredential(credential);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePanel3Credential(id);
      toast.success('Panel 3 credential deleted.');
      setCredentialToDelete(null);
    } catch (error) {
      // Error handled by context
    }
  };

  const handleCopyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    toast.info('Password copied to clipboard!');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Panel 3 Credential Management</CardTitle>
          <CardDescription>Securely manage login credentials for Panel 3 users.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingCredential(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCredential(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Credential
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingCredential ? 'Edit Panel 3 Credential' : 'Add New Panel 3 Credential'}</DialogTitle>
              <DialogDescription>
                {editingCredential ? 'Update the login details for this Panel 3 user.' : 'Enter login details for a Panel 3 user.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="panel3_login_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Panel 3 Login ID (Email)</FormLabel>
                      <FormControl>
                        <Input placeholder="panel3user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="panel3_password_encrypted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Panel 3 Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword === 'form' ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-1"
                            onClick={() => setShowPassword(showPassword === 'form' ? null : 'form')}
                          >
                            {showPassword === 'form' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">{editingCredential ? 'Save Changes' : 'Add Credential'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {panel3Credentials.length > 0 ? (
          <div className="space-y-4">
            {panel3Credentials.map((credential) => (
              <div key={credential.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center space-x-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{credential.panel3_login_id}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Password:</span>
                      <span className="font-mono">
                        {showPassword === credential.id ? credential.panel3_password_encrypted : '••••••••'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setShowPassword(showPassword === credential.id ? null : credential.id)}
                      >
                        {showPassword === credential.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyPassword(credential.panel3_password_encrypted)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(credential)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog open={credentialToDelete === credential.id} onOpenChange={(open) => setCredentialToDelete(open ? credential.id : null)}>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the Panel 3 credential and remove it from any associated campaign reports.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(credential.id)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No Panel 3 credentials configured yet.</p>
        )}
      </CardContent>
    </Card>
  );
};