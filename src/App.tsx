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
import { FreelancerProvider } from "./context/FreelancerContext";
import { SessionContextProvider, ProtectedRoute } from "./context/SessionContext"; // Import SessionContextProvider and ProtectedRoute
import Login from "./pages/Login"; // Import Login page
import Index from "./pages/Index"; // Import Index page

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider> {/* Wrap with SessionContextProvider */}
          <FreelancerProvider>
            <Routes>
              <Route path="/login" element={<Login />} /> {/* Login route */}
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} /> {/* Protected Index route */}
              <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
              <Route path="/clients" element={<ProtectedRoute><Layout><ClientsPage /></Layout></ProtectedRoute>} />
              <Route path="/clients/:clientId" element={<ProtectedRoute><Layout><ClientDetailPage /></Layout></ProtectedRoute>} />
              <Route path="/projects" element={<ProtectedRoute><Layout><ProjectsPage /></Layout></ProtectedRoute>} />
              <Route path="/projects/:projectId" element={<ProtectedRoute><Layout><ProjectDetailPage /></Layout></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><Layout><PaymentsPage /></Layout></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Layout><ReportsPage /></Layout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </FreelancerProvider>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;