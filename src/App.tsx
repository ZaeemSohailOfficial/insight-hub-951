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
import LinkedInPanel from "@/pages/LinkedInPanel";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<ClientPanel />} />
              <Route path="/employees" element={<EmployeePanel />} />
              <Route path="/personal" element={<PersonalPanel />} />
              <Route path="/linkedin" element={<LinkedInPanel />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
