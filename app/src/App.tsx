import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "./components/AppSideBar";
import { SettingsProvider } from "./contexts/settingContexts";
import Chat from "./pages/Chat";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider defaultOpen={true}>
            {/* 🔑 SINGLE LAYOUT OWNER */}
           

<div className="flex h-screen w-screen overflow-hidden bg-background">
  <AppSidebar />


  <SidebarInset className="overflow-hidden">
    <Routes>
      <Route path="/" element={<Chat />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  </SidebarInset>
</div>

          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
