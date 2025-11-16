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
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Edit, Trash2, User, Mail, HardDrive } from 'lucide-react';
import { useCampaignDashboard, PanelUser } from '@/context/CampaignDashboardContext';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const panelUserSchema = z.object({
  panel_id: z.string().min(1, { message: 'Panel is required.' }),
  username: z.string().min(2, { message: 'Username must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  is_active: z.boolean().default(true),
});

type PanelUserFormValues = z.infer<typeof panelUserSchema>;

export const PanelUserManagement: React.FC = () => {
  const { panels, panelUsers, addPanelUser, updatePanelUser, deletePanelUser, getPanelName } = useCampaignDashboard();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPanelUser, setEditingPanelUser] = useState<PanelUser | null>(null);
  const [panelUserToDelete, setPanelUserToDelete] = useState<string | null>(null);

  const form = useForm<PanelUserFormValues>({
    resolver: zodResolver(panelUserSchema),
    defaultValues: {
      panel_id: '',
      username: '',
      email: '',
      is_active: true,
    },
  });

  React.useEffect(() => {
    if (editingPanelUser) {
      form.reset(editingPanelUser);
    } else {
      form.reset({ panel_id: '', username: '', email: '', is_active: true });
    }
  }, [editingPanelUser, form]);

  const onSubmit = async (values: PanelUserFormValues) => {
    try {
      if (editingPanelUser) {
        await updatePanelUser(editingPanelUser.id, values);
        toast.success('Panel user updated successfully!');
      } else {
        await addPanelUser(values);
        toast.success('Panel user added successfully!');
      }
      setIsDialogOpen(false);
      setEditingPanelUser(null);
      form.reset();
    } catch (error) {
      // Error handled by context, just prevent dialog close on error
    }
  };

  const handleEdit = (panelUser: PanelUser) => {
    setEditingPanelUser(panelUser);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePanelUser(id);
      toast.success('Panel user deleted.');
      setPanelUserToDelete(null);
    } catch (error) {
      // Error handled by context
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Panel User Management</CardTitle>
          <CardDescription>Manage users assigned to specific panels.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingPanelUser(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPanelUser(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Panel User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingPanelUser ? 'Edit Panel User' : 'Add New Panel User'}</DialogTitle>
              <DialogDescription>
                {editingPanelUser ? 'Update the details for this panel user.' : 'Assign a new user to a panel.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="panel_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Panel</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a panel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {panels.map((panel) => (
                            <SelectItem key={panel.id} value={panel.id}>
                              {panel.name}
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
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., john.doe" {...field} />
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
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Set whether this user is currently active.
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
                  <Button type="submit">{editingPanelUser ? 'Save Changes' : 'Add Panel User'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {panelUsers.length > 0 ? (
          <div className="space-y-4">
            {panelUsers.map((panelUser) => (
              <div key={panelUser.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{panelUser.username} {panelUser.is_active ? '' : '(Inactive)'}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {panelUser.email}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <HardDrive className="h-3 w-3" /> {getPanelName(panelUser.panel_id)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(panelUser)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog open={panelUserToDelete === panelUser.id} onOpenChange={(open) => setPanelUserToDelete(open ? panelUser.id : null)}>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the panel user and disassociate them from any campaign reports.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(panelUser.id)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No panel users configured yet.</p>
        )}
      </CardContent>
    </Card>
  );
};