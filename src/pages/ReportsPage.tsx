"use client";

import React from 'react';

const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>
      <p className="text-muted-foreground">Generate various financial reports.</p>
      {/* Monthly income, pending receivables, aging reports will go here */}
    </div>
  );
};

export default ReportsPage;