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

interface InvoiceViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceUrl: string | null;
  projectName: string;
}

export const InvoiceViewerDialog: React.FC<InvoiceViewerDialogProps> = ({
  open,
  onOpenChange,
  invoiceUrl,
  projectName,
}) => {
  const handleDownloadInvoice = () => {
    if (invoiceUrl) {
      // In a real application, you would fetch the actual PDF/file
      // For this simulation, we'll create a dummy blob and download it.
      const dummyPdfContent = `This is a simulated invoice for project: ${projectName}.\n\nInvoice URL: ${invoiceUrl}\n\nDate: ${new Date().toLocaleDateString()}`;
      const blob = new Blob([dummyPdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${projectName.replace(/\s/g, '-')}.pdf`;
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Invoice for "{projectName}"</DialogTitle>
          <DialogDescription>
            Preview and download your generated invoice.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-4 border rounded-md bg-muted/20 text-muted-foreground text-sm">
          {invoiceUrl ? (
            <div className="space-y-2">
              <p className="font-semibold">Simulated Invoice Content:</p>
              <p>This is a placeholder for your invoice. In a real application, a PDF viewer or detailed invoice layout would appear here.</p>
              <p>Project: <span className="font-medium">{projectName}</span></p>
              <p>Invoice ID: <span className="font-medium">{invoiceUrl.split('/').pop()}</span></p>
              <p>Date: <span className="font-medium">{new Date().toLocaleDateString()}</span></p>
              <p className="text-xs text-gray-500 mt-4">
                (The actual invoice content would be rendered here, possibly from an iframe or a custom component.)
              </p>
            </div>
          ) : (
            <p className="text-center py-10">No invoice content available.</p>
          )}
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={handleDownloadInvoice} disabled={!invoiceUrl}>
            <Download className="mr-2 h-4 w-4" /> Download Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};