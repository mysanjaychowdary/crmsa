"use client";

import React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-muted-foreground">Configure your business profile and preferences.</p>
      {/* Business profile, payment methods, notification templates will go here */}
    </div>
  );
};

export default SettingsPage;