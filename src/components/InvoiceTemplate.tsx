"use client";

import React from 'react';
import { Project, Client, BusinessProfile } from '@/context/FreelancerContext';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { Globe, Phone, Mail, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvoiceTemplateProps {
  project: Project;
  client: Client;
  businessProfile: BusinessProfile | null;
  invoiceNumber: string;
  invoiceDate: Date;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  project,
  client,
  businessProfile,
  invoiceNumber,
  invoiceDate,
}) => {
  const businessLogo = "https://sanjuanimations.com/wp-content/uploads/2023/06/20230608_100023-1536x846.jpg";
  const defaultBusinessWebsite = "sanjuanimations.com";
  const defaultBusinessPhone = "+91 9492222539";
  const defaultBusinessEmail = "info@sanjuanimations.com";
  const defaultBusinessAddress = "Mainroad, Pedha Veedhi, valluru, Andhra Pradesh - 533308";

  const subTotal = project.total_amount;
  const tax = 0; // Assuming 0 tax for now as per image
  const grandTotal = subTotal + tax;

  return (
    <div className="relative p-8 bg-white text-foreground min-h-[800px] shadow-lg rounded-lg overflow-hidden">
      {/* Background gradient element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary to-orange-400 rounded-full opacity-10 -mt-20 -mr-20" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tl from-primary to-orange-400 rounded-full opacity-5 -mb-20 -ml-20" />

      {/* Header */}
      <div className="flex justify-between items-start mb-12 relative z-10">
        <div className="flex items-center">
          <img src={businessLogo} alt="Business Logo" className="h-12 w-auto object-contain mr-3" />
          <span className="text-2xl font-bold text-primary">{businessProfile?.business_name || "Your Business Name"}</span>
        </div>
        <div className="text-right">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">INVOICE</h1>
          <p className="text-sm text-muted-foreground">Number: {invoiceNumber}</p>
          <p className="text-sm text-muted-foreground">Date: {format(invoiceDate, 'MM/dd/yyyy')}</p>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-12 relative z-10">
        <h2 className="text-xl font-bold mb-2">BILL TO</h2>
        <p className="font-semibold">{client.name}</p>
        {client.company && <p className="text-muted-foreground">{client.company}</p>}
        {client.address && <p className="text-muted-foreground">{client.address}</p>}
        {/* Add more client details if needed, e.g., email, phone */}
      </div>

      {/* Items Table */}
      <div className="mb-12 relative z-10">
        <div className="grid grid-cols-4 font-bold text-white p-3 rounded-t-md bg-gradient-to-br from-primary to-orange-400">
          <div className="col-span-2">ITEM DESCRIPTION</div>
          <div className="text-center">QTY</div>
          <div className="text-right">PRICE</div>
          <div className="text-right">TOTAL</div>
        </div>
        <div className="grid grid-cols-4 py-3 border-b border-gray-200 text-sm">
          <div className="col-span-2">{project.title}</div>
          <div className="text-center">1</div>
          <div className="text-right">{formatCurrency(project.total_amount)}</div>
          <div className="text-right">{formatCurrency(project.total_amount)}</div>
        </div>
        {/* Add more items if needed */}
      </div>

      {/* Notes and Totals */}
      <div className="flex justify-between relative z-10">
        <div className="w-1/2 pr-4">
          <h3 className="text-lg font-bold mb-2">NOTES:</h3>
          <p className="text-sm text-muted-foreground">
            Website Content like Images & Matter Should Provide by the Customer
          </p>
          {project.notes && (
            <p className="text-sm text-muted-foreground mt-2">
              Project Specific Notes: {project.notes}
            </p>
          )}
        </div>
        <div className="w-1/2 pl-4 text-right space-y-2">
          <div className="flex justify-between">
            <span className="font-bold">SUB TOTAL</span>
            <span>{formatCurrency(subTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">TAX</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-primary pt-2 border-t border-gray-200 mt-2">
            <span>GRAND TOTAL</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Footer Contact Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-br from-primary to-orange-400 text-white p-4 flex flex-col items-center justify-center text-sm space-y-2">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
          <div className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            <span>{businessProfile?.business_name?.toLowerCase().replace(/\s/g, '') + '.com' || defaultBusinessWebsite}</span>
          </div>
          <div className="flex items-center gap-1">
            <Phone className="h-4 w-4" />
            <span>{businessProfile?.phone_number || defaultBusinessPhone}</span>
          </div>
          <div className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            <span>{businessProfile?.contact_email || defaultBusinessEmail}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <MapPin className="h-4 w-4" />
          <span>{businessProfile?.address || defaultBusinessAddress}</span>
        </div>
      </div>
    </div>
  );
};