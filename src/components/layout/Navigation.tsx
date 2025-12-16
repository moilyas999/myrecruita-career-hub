import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Phone, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => {
            checkAdminStatus(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Find Jobs", path: "/jobs" },
    { name: "Submit CV", path: "/submit-cv" },
    { name: "Career Partner", path: "/career-partner" },
    { name: "Featured Talent", path: "/featured-talent" },
    { name: "Blog", path: "/blog" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isHomePage = location.pathname === "/";

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHomePage
          ? "bg-background shadow-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img 
              src="/lovable-uploads/4121491c-ffff-4dec-82a6-3b0fa454c578.png" 
              alt="MyRecruita - Expert Recruitment Agency" 
              className={`h-10 w-auto object-contain flex-shrink-0 transition-all ${
                isScrolled || !isHomePage ? "" : "brightness-0 invert"
              }`}
              style={{ minWidth: 'auto' }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md ${
                  isActive(item.path)
                    ? isScrolled || !isHomePage
                      ? "text-accent bg-accent/10"
                      : "text-accent"
                    : isScrolled || !isHomePage
                      ? "text-foreground hover:text-accent hover:bg-muted"
                      : "text-white hover:text-accent"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden xl:flex items-center space-x-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={`rounded-md ${
                      isScrolled || !isHomePage
                        ? ""
                        : "border-white/50 text-white hover:bg-white/10"
                    }`}
                  >
                    <User className="h-4 w-4 mr-2" />
                    My Account
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isAdmin ? (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/profile" className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          My Profile
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                asChild 
                variant="outline" 
                size="sm"
                className={`rounded-md ${
                  isScrolled || !isHomePage
                    ? ""
                    : "border-white/50 text-white hover:bg-white/10"
                }`}
              >
                <Link to="/auth">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}
            <Button 
              asChild 
              size="sm" 
              variant="accent"
              className="rounded-md"
            >
              <Link to="/post-job">
                Post a Job
              </Link>
            </Button>
            <a 
              href="tel:+442080584490" 
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                isScrolled || !isHomePage
                  ? "bg-accent text-accent-foreground hover:bg-accent/90"
                  : "border-2 border-accent bg-transparent text-accent hover:bg-accent hover:text-accent-foreground"
              }`}
              aria-label="Call us"
            >
              <Phone className="h-5 w-5" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center space-x-2">
            <a 
              href="tel:+442080584490" 
              className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-foreground"
              aria-label="Call us"
            >
              <Phone className="h-5 w-5" />
            </a>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className={isScrolled || !isHomePage ? "text-foreground" : "text-primary-foreground"}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="xl:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t border-border">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 text-base font-medium transition-colors duration-200 rounded-md ${
                    isActive(item.path)
                      ? "text-accent bg-accent/10"
                      : "text-foreground hover:text-accent hover:bg-muted"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Account Section */}
              <div className="border-t border-border mt-2 pt-2">
                {user ? (
                  <>
                    {isAdmin ? (
                      <Link
                        to="/admin"
                        className="block px-3 py-2 text-base font-medium text-foreground hover:text-accent hover:bg-muted rounded-md"
                        onClick={() => setIsOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 inline mr-2" />
                        Admin Dashboard
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/dashboard"
                          className="block px-3 py-2 text-base font-medium text-foreground hover:text-accent hover:bg-muted rounded-md"
                          onClick={() => setIsOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4 inline mr-2" />
                          Dashboard
                        </Link>
                        <Link
                          to="/dashboard/profile"
                          className="block px-3 py-2 text-base font-medium text-foreground hover:text-accent hover:bg-muted rounded-md"
                          onClick={() => setIsOpen(false)}
                        >
                          <User className="h-4 w-4 inline mr-2" />
                          My Profile
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-destructive hover:bg-muted rounded-md"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="block px-3 py-2 text-base font-medium text-foreground hover:text-accent hover:bg-muted rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4 inline mr-2" />
                    Login / Sign Up
                  </Link>
                )}
              </div>

              <div className="px-3 py-2">
                <Button asChild size="sm" variant="accent" className="w-full">
                  <Link to="/post-job" onClick={() => setIsOpen(false)}>
                    Post a Job
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
