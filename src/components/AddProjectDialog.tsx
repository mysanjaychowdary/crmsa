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
import { useFreelancer, Project, ProjectStatus } from '@/context/FreelancerContext'; // Import Project type and ProjectStatus
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
  title: z.string().min(2, { message: 'Project title must be at least 2 characters.' }),
  description: z.string().optional(),
  total_amount: z.preprocess(
    (val) => Number(val),
    z.number().min(0.01, { message: 'Total amount must be a positive number.' })
  ),
  start_date: z.date({ required_error: 'Start date is required.' }),
  due_date: z.date({ required_error: 'Due date is required.' }),
  status: z.nativeEnum(ProjectStatus).optional(), // Add status field for editing
});

interface AddProjectDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  editingProject?: Project | null; // New prop for editing
}

export const AddProjectDialog: React.FC<AddProjectDialogProps> = ({ onOpenChange, open, editingProject }) => {
  const { addProject, updateProject, clients } = useFreelancer();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: '',
      title: '',
      description: '',
      total_amount: 0,
      start_date: undefined,
      due_date: undefined,
      status: 'active', // Default status for new projects
    },
  });

  useEffect(() => {
    if (open) {
      if (editingProject) {
        form.reset({
          client_id: editingProject.client_id,
          title: editingProject.title,
          description: editingProject.description || '',
          total_amount: editingProject.total_amount,
          start_date: new Date(editingProject.start_date),
          due_date: new Date(editingProject.due_date),
          status: editingProject.status,
        });
      } else {
        form.reset({
          client_id: '',
          title: '',
          description: '',
          total_amount: 0,
          start_date: undefined,
          due_date: undefined,
          status: 'active',
        });
      }
    }
  }, [open, editingProject, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const projectData = {
        client_id: values.client_id,
        title: values.title,
        description: values.description || undefined,
        total_amount: values.total_amount,
        start_date: format(values.start_date, 'yyyy-MM-dd'),
        due_date: format(values.due_date, 'yyyy-MM-dd'),
        status: values.status || 'active', // Ensure status is always set
      };

      if (editingProject) {
        await updateProject(editingProject.id, projectData);
        toast.success('Project updated successfully!');
      } else {
        await addProject(projectData as Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>); // Type assertion
        toast.success('Project added successfully!');
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
          <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          <DialogDescription>
            {editingProject ? 'Update the details for this project.' : 'Fill in the details to add a new project.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 py-4">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
              name="title"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Website Redesign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="total_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 1000.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
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
              name="due_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
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
            {editingProject && ( // Only show status field when editing
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ProjectStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief description of the project (Optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="md:col-span-2 mt-4">
              <Button type="submit">{editingProject ? 'Save Changes' : 'Add Project'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};