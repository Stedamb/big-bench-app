import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Cookies = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container max-w-2xl py-8 lg:py-12 flex-1">
        <div className="text-center mb-8">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
            Legale
          </p>
          <h1 className="font-display text-4xl font-bold">Cookie Policy</h1>
          <div className="editorial-rule-double my-4" />
        </div>

        <div className="prose prose-sm max-w-none space-y-4 text-sm text-muted-foreground">
          <p>
            BigBenchApp utilizza esclusivamente cookie tecnici e di sessione, necessari per
            l'autenticazione e per ricordare le tue preferenze (es. tema chiaro/scuro).
          </p>
          <p>
            Non utilizziamo cookie di profilazione o di terze parti a scopo pubblicitario.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cookies;
