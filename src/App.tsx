import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Landing from "./pages/Landing.tsx";
import History from "./pages/History.tsx";
import NotFound from "./pages/NotFound.tsx";
import Admin from "./pages/Admin.tsx";
import Terms from "./pages/Terms.tsx";
import Privacy from "./pages/Privacy.tsx";
import Contact from "./pages/Contact.tsx";
import BrandProfile from "./pages/BrandProfile.tsx";
import Calendar from "./pages/Calendar.tsx";
import ComplianceAnalyzer from "./pages/ComplianceAnalyzer.tsx";
import VerticalLanding from "./pages/VerticalLanding.tsx";
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/app" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="/termos" element={<Terms />} />
      <Route path="/privacidade" element={<Privacy />} />
      <Route path="/contato" element={<Contact />} />
      <Route path="/perfil" element={<ProtectedRoute><BrandProfile /></ProtectedRoute>} />
      <Route path="/calendario" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
      <Route path="/compliance" element={<ProtectedRoute><ComplianceAnalyzer /></ProtectedRoute>} />
      <Route path="/para-medicos" element={<VerticalLanding />} />
      <Route path="/para-dentistas" element={<VerticalLanding />} />
      <Route path="/para-psicologos" element={<VerticalLanding />} />
      <Route path="/para-nutricionistas" element={<VerticalLanding />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
