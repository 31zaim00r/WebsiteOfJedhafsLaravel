import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Index from "./pages/Index";
import PoemsPage from "./pages/PoemsPage";
import PoemDetailPage from "./pages/PoemDetailPage";
import AddPoemPage from "./pages/AddPoemPage";
import MyPoemsPage from "./pages/MyPoemsPage";
import OccasionsPage from "./pages/OccasionsPage";
import AdminPage from "./pages/AdminPage";
import UsersManagementPage from "./pages/UsersManagementPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/poems" element={<PoemsPage />} />
            <Route path="/poem/:id" element={<PoemDetailPage />} />
            <Route path="/add-poem" element={<AddPoemPage />} />
            <Route path="/my-poems" element={<MyPoemsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/occasions" element={<OccasionsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/users" element={<UsersManagementPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
