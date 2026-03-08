import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import fallbackLogo from "@/assets/logo.png";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  sale_price: number | null;
  regular_price: number;
  image_url?: string;
}

const Header = () => {
  const { itemCount, openCart } = useCart();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { label: "হোম", href: "/" },
    { label: "সকল পণ্য", href: "/products" },
    { label: "About Us", href: "/about" },
    { label: "অর্ডার ট্র্যাক", href: "/track-order" },
  ];

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, sale_price, regular_price")
        .eq("is_active", true)
        .ilike("name", `%${query.trim()}%`)
        .limit(8);

      if (data && data.length > 0) {
        // Fetch first image for each product
        const ids = data.map((p) => p.id);
        const { data: images } = await supabase
          .from("product_images")
          .select("product_id, image_url")
          .in("product_id", ids)
          .order("display_order")
        
        const imageMap: Record<string, string> = {};
        images?.forEach((img) => {
          if (!imageMap[img.product_id]) imageMap[img.product_id] = img.image_url;
        });

        setResults(data.map((p) => ({ ...p, image_url: imageMap[p.id] })));
      } else {
        setResults([]);
      }
      setShowResults(true);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        searchRef.current && !searchRef.current.contains(e.target as Node) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (slug: string) => {
    setQuery("");
    setShowResults(false);
    setMobileOpen(false);
    navigate(`/product/${slug}`);
  };

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.includes("#")) {
      const [path, hash] = href.split("#");
      if (window.location.pathname === path || path === "/") {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }
    }
    navigate(href);
  };

  const SearchDropdown = () => {
    if (!showResults) return null;
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
        {searching ? (
          <div className="p-4 text-center text-sm text-muted-foreground">খুঁজছি...</div>
        ) : results.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">কোনো পণ্য পাওয়া যায়নি</div>
        ) : (
          results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r.slug)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/60 transition-colors text-left"
            >
              {r.image_url ? (
                <img src={r.image_url} alt="" className="w-10 h-10 rounded-md object-cover shrink-0 border border-border" />
              ) : (
                <div className="w-10 h-10 rounded-md bg-secondary shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                <p className="text-xs text-primary font-semibold">
                  ৳{r.sale_price ?? r.regular_price}
                  {r.sale_price && r.sale_price < r.regular_price && (
                    <span className="text-muted-foreground line-through ml-1.5">৳{r.regular_price}</span>
                  )}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container flex items-center justify-between h-16 gap-4">
        <Link to="/" className="shrink-0 flex items-center gap-2">
          <img src={logo} alt="রাফছা স্টোর" className="h-10 w-auto" />
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-md relative" ref={searchRef}>
          <Input
            placeholder="পণ্য খুঁজুন..."
            className="pr-10 bg-secondary/50 border-border focus-visible:ring-primary"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setShowResults(true)}
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <SearchDropdown />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button key={link.href} onClick={() => handleNavClick(link.href)} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              {link.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={openCart} className="relative p-2 hover:bg-secondary rounded-lg transition-colors">
            <ShoppingCart className="h-5 w-5 text-foreground" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-lg">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {user ? (
                <>
                  <DropdownMenuItem asChild><Link to="/profile">আমার প্রোফাইল</Link></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>লগআউট</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild><Link to="/login">লগইন</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/register">রেজিস্ট্রেশন</Link></DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="md:hidden rounded-lg" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-3 animate-fade-in-up">
          <div className="relative" ref={mobileSearchRef}>
            <Input
              placeholder="পণ্য খুঁজুন..."
              className="pr-10 bg-secondary/50"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim().length >= 2 && setShowResults(true)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <SearchDropdown />
          </div>
          {navLinks.map((link) => (
            <button key={link.href} onClick={() => handleNavClick(link.href)} className="block py-2 text-sm font-medium text-foreground/80 hover:text-primary text-left w-full">
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
