import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container max-w-2xl py-8 lg:py-12 flex-1">
        <div className="text-center mb-8">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
            Legale
          </p>
          <h1 className="font-display text-4xl font-bold">Privacy Policy</h1>
          <div className="editorial-rule-double my-4" />
        </div>

        <div className="prose prose-sm max-w-none space-y-4 text-sm text-muted-foreground">
          <p>
            BigBenchApp raccoglie l'indirizzo email al momento della registrazione e, su base
            volontaria, nome, username, bio, avatar e fotografie caricate nel Guestbook.
          </p>
          <p>
            I dati sono conservati tramite Supabase e usati esclusivamente per far funzionare le
            funzionalità dell'app (profilo, panchine visitate, guestbook). Non vengono venduti o
            condivisi con terze parti per finalità di marketing.
          </p>
          <p>
            Puoi richiedere la cancellazione del tuo account e dei dati associati in qualsiasi
            momento contattandoci.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
