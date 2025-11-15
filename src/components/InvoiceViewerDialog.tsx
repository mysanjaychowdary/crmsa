"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { InvoiceTemplate } from './InvoiceTemplate'; // Import the new InvoiceTemplate
import { Project, Client, BusinessProfile } from '@/context/FreelancerContext'; // Import necessary types

interface InvoiceViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceUrl: string | null;
  project: Project | null; // Pass the full project object
  client: Client | null;   // Pass the full client object
  businessProfile: BusinessProfile | null; // Pass the business profile
}

export const InvoiceViewerDialog: React.FC<InvoiceViewerDialogProps> = ({
  open,
  onOpenChange,
  invoiceUrl,
  project,
  client,
  businessProfile,
}) => {
  const handleDownloadInvoice = () => {
    if (invoiceUrl && project) {
      // In a real application, you would fetch the actual PDF/file from a server.
      // For this simulation, we'll create a dummy blob and download it as a .pdf.
      const dummyPdfContent = `This is a simulated invoice for project: ${project.title}.\n\nInvoice Number: ${invoiceUrl.split('/').pop()?.replace('.pdf', '') || 'N/A'}\nInvoice Date: ${new Date().toLocaleDateString()}\n\nNote: This is a placeholder PDF. In a production environment, a proper PDF generation service would be used.`;
      
      // Changed type back to 'application/pdf' and extension to '.pdf'
      const blob = new Blob([dummyPdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${project.title.replace(/\s/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Invoice download started!');
    } else {
      toast.error('No invoice available to download.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[95vh] flex flex-col p-0"> {/* Adjusted max-w and removed padding */}
        <DialogHeader className="p-6 pb-0"> {/* Added padding to header */}
          <DialogTitle>Invoice for "{project?.title || 'N/A'}"</DialogTitle>
          <DialogDescription>
            Preview and download your generated invoice.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-6"> {/* Added padding to content area */}
          {project && client ? (
            <InvoiceTemplate
              project={project}
              client={client}
              businessProfile={businessProfile}
              invoiceNumber={invoiceUrl ? invoiceUrl.split('/').pop()?.replace('.pdf', '') || 'N/A' : 'N/A'}
              invoiceDate={new Date()}
            />
          ) : (
            <p className="text-center py-10 text-muted-foreground">No invoice data available.</p>
          )}
        </div>
        <DialogFooter className="mt-4 p-6 pt-0"> {/* Added padding to footer */}
          <Button onClick={handleDownloadInvoice} disabled={!invoiceUrl || !project}>
            <Download className="mr-2 h-4 w-4" /> Download Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};