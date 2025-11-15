"use client";

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useFreelancer, ProjectStatus, Project } from '@/context/FreelancerContext'; // Import Project type
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
import { PlusCircle, Search, Edit, Trash2 } from 'lucide-react'; // Import Edit and Trash2 icons
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
import { formatCurrency } from '@/lib/currency';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
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
import { toast } from 'sonner';

const ProjectsPage: React.FC = () => {
  const { projects, clients, getProjectWithCalculations, deleteProject, loadingData } = useFreelancer();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all');
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null); // New state for editing project
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null); // State for project to delete
  const navigate = useNavigate(); // Initialize useNavigate

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

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsAddProjectDialogOpen(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      toast.success('Project deleted successfully!');
      setProjectToDelete(null); // Close dialog
    } catch (error) {
      // Error handled by context
    }
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-5 w-2/3" />
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(8)].map((_, i) => (
                  <TableHead key={i}><Skeleton className="h-4 w-full" /></TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(8)].map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button onClick={() => { setEditingProject(null); setIsAddProjectDialogOpen(true); }}>
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
                  <TableRow key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>{getClientName(project.client_id)}</TableCell>
                    <TableCell>{formatCurrency(project.total_amount)}</TableCell>
                    <TableCell>{formatCurrency(projectWithCalcs?.paid_amount || 0)}</TableCell>
                    <TableCell className={isOverdue ? 'text-destructive font-semibold' : ''}>
                      {formatCurrency(projectWithCalcs?.pending_amount || 0)}
                    </TableCell>
                    <TableCell>{format(new Date(project.due_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(project.status)}>
                        {project.status} {isOverdue && '(Overdue)'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}> {/* Stop propagation for buttons */}
                      <Button variant="outline" size="icon" onClick={() => handleEditProject(project)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog open={projectToDelete === project.id} onOpenChange={(open) => setProjectToDelete(open ? project.id : null)}>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the project and all associated payments.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProject(project.id)}>Continue</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
        onOpenChange={(open) => {
          setIsAddProjectDialogOpen(open);
          if (!open) setEditingProject(null); // Clear editing project when dialog closes
        }}
        editingProject={editingProject}
      />
    </div>
  );
};

export default ProjectsPage;