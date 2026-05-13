import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <h1 className="font-display text-5xl sm:text-6xl font-bold mb-4">404</h1>
          <p className="font-editorial text-xl text-muted-foreground mb-6">
            Pagina non trovata
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
          >
            Torna alla Mappa
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
