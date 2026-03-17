import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/store/AppContext";
import Layout from "@/components/Layout";
import ClientPanel from "@/pages/ClientPanel";
import EmployeePanel from "@/pages/EmployeePanel";
import PersonalPanel from "@/pages/PersonalPanel";
import InvoicePanel from "@/pages/InvoicePanel";
import TaskPanel from "@/pages/TaskPanel";
import LinkedInPanel from "@/pages/LinkedInPanel";
import LoginPage from "@/pages/LoginPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => {
  const [isAuth, setIsAuth] = useState(() => localStorage.getItem('app_auth') === 'true');

  if (!isAuth) {
    return (
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LoginPage onLogin={() => setIsAuth(true)} />
      </TooltipProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppProvider>
          <BrowserRouter>
            <Layout onLogout={() => { localStorage.removeItem('app_auth'); setIsAuth(false); }}>
              <Routes>
                <Route path="/" element={<ClientPanel />} />
                <Route path="/employees" element={<EmployeePanel />} />
                <Route path="/personal" element={<PersonalPanel />} />
                <Route path="/invoices" element={<InvoicePanel />} />
                <Route path="/tasks" element={<TaskPanel />} />
                <Route path="/linkedin" element={<LinkedInPanel />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
