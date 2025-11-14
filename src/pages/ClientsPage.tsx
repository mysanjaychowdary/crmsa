"use client";

import React from 'react';

const ClientsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Clients</h1>
      <p className="text-muted-foreground">Manage your clients here.</p>
      {/* Client list, search, filters, and "View Client" button will go here */}
    </div>
  );
};

export default ClientsPage;