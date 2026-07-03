import { Star } from "lucide-react";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";

const Stars = ({ value }: { value: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < value ? "fill-primary text-primary" : "text-muted-foreground/40"
        }`}
      />
    ))}
  </div>
);

const GoogleReviews = ({ benchId }: { benchId: number }) => {
  const { data: reviews = [], isLoading } = useGoogleReviews(benchId);

  // No section at all when Google has nothing for this bench.
  if (!isLoading && reviews.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Recensioni da Google
        </h2>
      </div>

      <div className="space-y-5">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border-b border-border pb-5 last:border-0 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-32 bg-muted rounded" />
                    <div className="h-3 w-24 bg-muted rounded" />
                    <div className="h-3 w-full bg-muted rounded" />
                  </div>
                </div>
              </div>
            ))
          : reviews.map((r) => (
              <article key={r.id} className="border-b border-border pb-5 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden bg-muted">
                    {r.author_photo_url ? (
                      <img
                        src={r.author_photo_url}
                        alt={r.author_name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{r.author_name.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="font-display font-bold text-sm">{r.author_name}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {r.relative_time}
                        </p>
                      </div>
                      {r.rating != null && <Stars value={r.rating} />}
                    </div>
                    {r.content && (
                      <p className="font-editorial text-base leading-relaxed mt-2 text-foreground/80">
                        {r.content}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
        <p className="text-[10px] text-muted-foreground italic">Powered by Google</p>
      </div>
    </section>
  );
};

export default GoogleReviews;
