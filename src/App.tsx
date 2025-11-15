import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ClientsPage from "./pages/ClientsPage";
import ProjectsPage from "./pages/ProjectsPage";
import PaymentsPage from "./pages/PaymentsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import ClientDetailPage from "./pages/ClientDetailPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import Login from "./pages/Login"; // Import the new Login page
import { FreelancerProvider } from "./context/FreelancerContext";
import { SessionContextProvider, useSession } from "./context/SessionContext"; // Import SessionContextProvider and useSession

const queryClient = new QueryClient();

// A wrapper component to protect routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Loading...</h1>
          <p className="text-xl text-gray-600">Checking authentication status</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Login />; // Redirect to login if not authenticated
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider> {/* Wrap the entire app with SessionContextProvider */}
          <FreelancerProvider>
            <Routes>
              <Route path="/login" element={<Login />} /> {/* Public login route */}
              <Route
                path="*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/clients" element={<ClientsPage />} />
                        <Route path="/clients/:clientId" element={<ClientDetailPage />} />
                        <Route path="/projects" element={<ProjectsPage />} />
                        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
                        <Route path="/payments" element={<PaymentsPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </FreelancerProvider>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;