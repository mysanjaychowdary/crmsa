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
import { PlusCircle, Edit, Trash2, HardDrive } from 'lucide-react';
import { useCampaignDashboard, Panel } from '@/context/CampaignDashboardContext';
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

const panelSchema = z.object({
  name: z.string().min(2, { message: 'Panel name must be at least 2 characters.' }),
  description: z.string().optional(),
  requires_panel3_credentials: z.boolean().default(false),
});

type PanelFormValues = z.infer<typeof panelSchema>;

export const PanelManagement: React.FC = () => {
  const { panels, addPanel, updatePanel, deletePanel } = useCampaignDashboard();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState<Panel | null>(null);
  const [panelToDelete, setPanelToDelete] = useState<string | null>(null);

  const form = useForm<PanelFormValues>({
    resolver: zodResolver(panelSchema),
    defaultValues: {
      name: '',
      description: '',
      requires_panel3_credentials: false,
    },
  });

  React.useEffect(() => {
    if (editingPanel) {
      form.reset(editingPanel);
    } else {
      form.reset({ name: '', description: '', requires_panel3_credentials: false });
    }
  }, [editingPanel, form]);

  const onSubmit = async (values: PanelFormValues) => {
    try {
      if (editingPanel) {
        await updatePanel(editingPanel.id, values);
        toast.success('Panel updated successfully!');
      } else {
        await addPanel(values);
        toast.success('Panel added successfully!');
      }
      setIsDialogOpen(false);
      setEditingPanel(null);
      form.reset();
    } catch (error) {
      // Error handled by context, just prevent dialog close on error
    }
  };

  const handleEdit = (panel: Panel) => {
    setEditingPanel(panel);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePanel(id);
      toast.success('Panel deleted.');
      setPanelToDelete(null);
    } catch (error) {
      // Error handled by context
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Panel Management</CardTitle>
          <CardDescription>Add, edit, or remove panels for your campaign dashboard.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingPanel(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPanel(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Panel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingPanel ? 'Edit Panel' : 'Add New Panel'}</DialogTitle>
              <DialogDescription>
                {editingPanel ? 'Update the details for this panel.' : 'Define a new panel for your campaigns.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Panel Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Panel 1, Panel 2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Purpose of this panel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requires_panel3_credentials"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Requires Panel 3 Credentials</FormLabel>
                        <FormDescription>
                          Enable if campaigns on this panel need Panel 3 login details. (e.g., Panel 2)
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
                  <Button type="submit">{editingPanel ? 'Save Changes' : 'Add Panel'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {panels.length > 0 ? (
          <div className="space-y-4">
            {panels.map((panel) => (
              <div key={panel.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center space-x-3">
                  <HardDrive className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{panel.name}</p>
                    {panel.description && <p className="text-sm text-muted-foreground">{panel.description}</p>}
                    {panel.requires_panel3_credentials && (
                      <p className="text-xs text-primary">Requires Panel 3 Credentials</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(panel)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog open={panelToDelete === panel.id} onOpenChange={(open) => setPanelToDelete(open ? panel.id : null)}>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the panel and all associated panel users and campaign reports.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(panel.id)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No panels configured yet.</p>
        )}
      </CardContent>
    </Card>
  );
};