"use client";

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFreelancer, ProjectStatus } from '@/context/FreelancerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Search } from 'lucide-react';
import { AddProjectDialog } from '@/components/AddProjectDialog';
import { format, isPast } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ProjectsPage: React.FC = () => {
  const { projects, clients, getProjectWithCalculations } = useFreelancer();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all');
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Unknown Client';
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const clientName = getClientName(project.client_id);
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === 'all' || project.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [projects, clients, searchTerm, filterStatus]);

  const getStatusBadgeVariant = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'proposal':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button onClick={() => setIsAddProjectDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>
      <p className="text-muted-foreground">Manage your projects here.</p>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by title or client..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={filterStatus}
          onValueChange={(value: ProjectStatus | 'all') => setFilterStatus(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Paid Amount</TableHead>
              <TableHead>Pending Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => {
                const projectWithCalcs = getProjectWithCalculations(project.id);
                const isOverdue = project.status === 'active' && isPast(new Date(project.due_date)) && (projectWithCalcs?.pending_amount || 0) > 0;
                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>{getClientName(project.client_id)}</TableCell>
                    <TableCell>${project.total_amount.toFixed(2)}</TableCell>
                    <TableCell>${projectWithCalcs?.paid_amount.toFixed(2) || '0.00'}</TableCell>
                    <TableCell className={isOverdue ? 'text-destructive font-semibold' : ''}>
                      ${projectWithCalcs?.pending_amount.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell>{format(new Date(project.due_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(project.status)}>
                        {project.status} {isOverdue && '(Overdue)'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/projects/${project.id}`}>
                        <Button variant="outline" size="sm">
                          View Project
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No projects found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddProjectDialog
        open={isAddProjectDialogOpen}
        onOpenChange={setIsAddProjectDialogOpen}
      />
    </div>
  );
};

export default ProjectsPage;