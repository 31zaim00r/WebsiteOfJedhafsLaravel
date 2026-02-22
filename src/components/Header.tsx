import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, User, LogOut, Plus, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import logo from "@/assets/logo.png";

const navLinks = [
  { title: "الرئيسية", href: "/" },
  { title: "المناسبات", href: "/occasions" },
  { title: "القصائد", href: "/poems" },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/poems?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const openAuthModal = (mode: "login" | "register") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logo}
                alt="شعار موكب عزاء جدحفص"
                className="w-12 h-12 rounded-full border-2 border-primary glow-gold object-cover"
              />
              <div className="hidden md:block">
                <h1 className="text-primary font-bold text-lg">موكب عزاء جدحفص</h1>
                <p className="text-muted-foreground text-xs">منصة القصائد</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.title}
                  to={link.href}
                  className="px-4 py-2 text-sm text-foreground/80 hover:text-primary transition-colors relative group"
                >
                  <span className="relative z-10">{link.title}</span>
                  <span className="absolute inset-0 bg-primary/10 rounded-md scale-0 group-hover:scale-100 transition-transform" />
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-foreground/80 hover:text-primary"
              >
                <Search className="w-5 h-5" />
              </Button>

              {user ? (
                <>
                  {/* Add Poem Button */}
                  {(isAdmin || user.can_upload) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden md:flex items-center gap-1 text-primary"
                      onClick={() => navigate("/add-poem")}
                    >
                      <Plus className="w-4 h-4" />
                      إضافة قصيدة
                    </Button>
                  )}

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 text-foreground/80 hover:text-primary px-2 transition-all hover:bg-primary/5">
                        <div className="hidden md:flex flex-col items-end mr-1">
                          <span className="text-sm font-medium leading-none text-foreground">{user.user_metadata?.name}</span>
                          <span className="text-[10px] text-muted-foreground">{isAdmin ? "مسؤول" : "عضو"}</span>
                        </div>
                        <div className="bg-primary/10 p-1.5 rounded-full border border-primary/20 group-hover:bg-primary/20 transition-colors">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        الملف الشخصي
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/my-poems")}>
                        قصائدي
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate("/admin")}>
                            <Settings className="w-4 h-4 ml-2" />
                            لوحة التحكم
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut} className="text-destructive">
                        <LogOut className="w-4 h-4 ml-2" />
                        تسجيل الخروج
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openAuthModal("login")}>
                    دخول
                  </Button>
                  <Button size="sm" onClick={() => openAuthModal("register")}>
                    تسجيل
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden text-foreground/80 hover:text-primary"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <form onSubmit={handleSearch} className="py-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="ابحث عن قصيدة أو شاعر..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 bg-secondary rounded-lg"
                    />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                    >
                      <Search className="w-5 h-5" />
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-full right-0 left-0 bg-background border-b border-border shadow-xl"
            >
              <nav className="container mx-auto px-4 py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.title}
                    to={link.href}
                    className="block py-3 text-foreground/80 hover:text-primary transition-colors border-b border-border/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.title}
                  </Link>
                ))}
                {user ? (
                  <>
                    {(isAdmin || user.can_upload) && (
                      <Link
                        to="/add-poem"
                        className="block py-3 text-primary font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        إضافة قصيدة
                      </Link>
                    )}
                    <Link
                      to="/my-poems"
                      className="block py-3 text-foreground/80 hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      قصائدي
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block py-3 text-foreground/80 hover:text-primary transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        لوحة التحكم
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-right py-3 text-destructive"
                    >
                      تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        openAuthModal("login");
                        setIsMenuOpen(false);
                      }}
                    >
                      دخول
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        openAuthModal("register");
                        setIsMenuOpen(false);
                      }}
                    >
                      تسجيل
                    </Button>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </>
  );
};
