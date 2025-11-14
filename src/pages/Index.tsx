// This page is now replaced by the Dashboard component.
// The root route '/' will render the Dashboard directly.

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard'); // Redirect to dashboard
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Loading...</h1>
        <p className="text-xl text-gray-600">
          Redirecting to Dashboard
        </p>
      </div>
    </div>
  );
};

export default Index;