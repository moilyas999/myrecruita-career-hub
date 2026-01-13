
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Navigation from "./components/layout/Navigation";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/ScrollToTop";
import UpdateIndicator from "./components/ui/update-indicator";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import SubmitCV from "./pages/SubmitCV";
import CareerPartner from "./pages/CareerPartner";
import FeaturedTalent from "./pages/FeaturedTalent";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Employers from "./pages/Employers";
import ThankYou from "./pages/ThankYou";
import PostJob from "./pages/PostJob";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MyApplications from "./pages/MyApplications";
import MyProfile from "./pages/MyProfile";
import CompleteProfile from "./pages/CompleteProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds - data considered fresh
      gcTime: 300000, // 5 minutes - garbage collection time
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      refetchOnReconnect: true, // Refetch when network reconnects
      retry: 2, // Retry failed requests twice
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <UpdateIndicator />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Admin routes without main layout */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Auth page with main layout */}
            <Route path="/auth" element={
              <div className="min-h-screen flex flex-col">
                <Navigation />
                <main className="flex-1">
                  <Auth />
                </main>
                <Footer />
              </div>
            } />
            
            {/* Main site routes with layout */}
            <Route path="/*" element={
              <div className="min-h-screen flex flex-col">
                <Navigation />
                <main className="flex-1">
                  <Routes>
                    {/* User dashboard routes - now with header/footer */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/applications" element={<MyApplications />} />
                    <Route path="/dashboard/profile" element={<MyProfile />} />
                    <Route path="/complete-profile" element={<CompleteProfile />} />
                    
                    {/* Main site routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/explore-roles" element={<Jobs />} />
                    <Route path="/roles/:referenceId" element={<JobDetail />} />
                    <Route path="/jobs/:jobId" element={<JobDetail />} />
                    <Route path="/submit-cv" element={<SubmitCV />} />
                    <Route path="/career-partner" element={<CareerPartner />} />
                    <Route path="/featured-talent" element={<FeaturedTalent />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/employers" element={<Employers />} />
                    <Route path="/post-job" element={<PostJob />} />
                    <Route path="/thank-you" element={<ThankYou />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
