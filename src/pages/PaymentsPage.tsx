"use client";

import React from 'react';

const PaymentsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Payments</h1>
      <p className="text-muted-foreground">View and manage all payments.</p>
      {/* Payment ledger, filters, and export options will go here */}
    </div>
  );
};

export default PaymentsPage;