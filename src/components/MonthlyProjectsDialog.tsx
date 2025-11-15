"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Project, ProjectStatus, useFreelancer } from '@/context/FreelancerContext';
import { formatCurrency } from '@/lib/currency';
import { format, isPast } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MonthlyProjectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  projects: Project[];
}

export const MonthlyProjectsDialog: React.FC<MonthlyProjectsDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  projects,
}) => {
  const { getProjectWithCalculations } = useFreelancer();

  const getStatusBadgeVariant = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
      case 'proposal': // Proposal can also be a secondary state
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto py-4">
          {projects.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => {
                    const projectWithCalcs = getProjectWithCalculations(project.id);
                    const isOverdue = project.status === 'active' && project.due_date && isPast(new Date(project.due_date)) && (projectWithCalcs?.pending_amount || 0) > 0;
                    return (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                          <Link to={`/projects/${project.id}`} className="text-primary hover:underline">
                            {project.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {/* Assuming client name can be fetched or passed, for now, placeholder */}
                          {project.client_id} {/* This would ideally be client.name */}
                        </TableCell>
                        <TableCell>{formatCurrency(project.total_amount)}</TableCell>
                        <TableCell>{formatCurrency(projectWithCalcs?.paid_amount || 0)}</TableCell>
                        <TableCell className={cn(isOverdue && 'text-destructive font-semibold')}>
                          {formatCurrency(projectWithCalcs?.pending_amount || 0)}
                        </TableCell>
                        <TableCell>{project.due_date ? format(new Date(project.due_date), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(project.status)}>
                            {project.status} {isOverdue && '(Overdue)'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No projects found for this report.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};