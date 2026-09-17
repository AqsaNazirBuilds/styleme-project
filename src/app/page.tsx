import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sparkles, Shirt, MessageCircle, Calendar, BarChart3, Layers } from "lucide-react";

const HOW_IT_WORKS = [
  { step: "01", title: "Discover your style", desc: "A short quiz on colors, occasions, and the looks you gravitate toward." },
  { step: "02", title: "Build your digital wardrobe", desc: "Photograph what you own and tag it once — category, color, season, occasion." },
  { step: "03", title: "Create & save outfits", desc: "Combine pieces into complete looks, with a compatibility score for each one." },
  { step: "04", title: "Ask your AI stylist", desc: "Get advice on what to wear, styled around what's actually in your closet." },
  { step: "05", title: "Plan your looks", desc: "Schedule outfits on a calendar so mornings stop being a decision." },
  { step: "06", title: "Track your style", desc: "See what you wear most, what's neglected, and how your wardrobe evolves." },
];

const TESTIMONIALS = [
  {
    quote: "I stopped buying clothes I already own three of. Seeing everything laid out changed how I shop.",
    name: "Amara K.",
    role: "Graduate student",
  },
  {
    quote: "Style Me has replaced my Sunday-night outfit panic. It actually uses what's in my closet.",
    name: "Priya D.",
    role: "Marketing coordinator",
  },
  {
    quote: "The packing assistant alone was worth it — I over-pack for every trip, and now I don't.",
    name: "Farah S.",
    role: "Product designer",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-background">
            {/* Top nav */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-heading text-xl">StyleMe</span>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Log in
            </Link>
            <Button size="sm" render={<Link href="/register" />} nativeButton={false}>
              Sign up
            </Button>
          </nav>
        </div>
      </header>
      {/* Hero */}

      <section className="relative overflow-hidden px-6 pt-28 pb-24">
        <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
          <div>
            <h1 className="mb-6 max-w-lg text-5xl leading-tight sm:text-6xl">
              Your wardrobe, styled your way.
            </h1>
            <p className="mb-8 max-w-md text-lg text-muted-foreground">
              Organize your closet, discover new outfits, and let your personal AI stylist help you decide what to wear.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" render={<Link href="/register" />} nativeButton={false}>
                Start Styling
              </Button>
              <Button size="lg" variant="outline" render={<Link href="#how-it-works" />} nativeButton={false}>
                Explore Features
              </Button>
            </div>
          </div>

          <div className="relative mx-auto h-80 w-full max-w-sm overflow-hidden rounded-lg sm:h-96">
            {/* Photo by Thom Bradley on Unsplash — unsplash.com/license */}
            <Image
              src="https://images.unsplash.com/photo-1603400521630-9f2de124b33b?w=800&q=80&auto=format&fit=crop"
              alt="Clothing rack with neutral toned garments"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4 flex flex-col gap-1 rounded-md bg-card/95 p-3 shadow-md backdrop-blur-sm">
              <span className="text-xs text-muted-foreground">Style Match</span>
              <span className="text-2xl text-primary">94%</span>
            </div>
          </div>
        </div>
      </section>

      {/* How StyleMe Works */}
      <section id="how-it-works" className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 max-w-md text-3xl">How StyleMe works</h2>
          <p className="mb-14 max-w-md text-muted-foreground">
            Every part of the app connects back to your wardrobe — nothing here is a standalone tool.
          </p>

          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="border-t border-border pt-4">
                <p className="mb-2 text-sm text-muted-foreground">{item.step}</p>
                <h3 className="mb-2 text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Digital Wardrobe */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-14 lg:grid-cols-2">
          <div className="order-2 lg:order-1 relative h-64 overflow-hidden rounded-lg sm:h-80">
            {/* Photo by Lisa Anna on Unsplash — unsplash.com/license */}
            <Image
              src="https://images.unsplash.com/photo-1722604532227-4b76797218aa?w=800&q=80&auto=format&fit=crop"
              alt="A well-organized walk-in closet full of clothes"
              fill
              className="object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <Shirt className="mb-4 size-8 text-primary" />
            <h2 className="mb-3 text-3xl">Your digital wardrobe</h2>
            <p className="mb-4 text-muted-foreground">
              Photograph what you own once. Tag category, color, season, and occasion — StyleMe remembers it every time it recommends a look.
            </p>
            <p className="text-sm text-muted-foreground">
              Search, filter, and favorite items in seconds instead of digging through your closet.
            </p>
          </div>
        </div>
      </section>

      {/* AI Stylist */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-14 lg:grid-cols-2">
          <div>
            <Sparkles className="mb-4 size-8 text-primary" />
            <h2 className="mb-3 text-3xl">An AI stylist that knows your closet</h2>
            <p className="mb-4 text-muted-foreground">
              Ask what to wear to a wedding, an interview, or a weekend trip — StyleMe answers using pieces you actually own, not generic advice.
            </p>
            <p className="text-sm text-muted-foreground">
              Style Me generates a complete outfit in one tap, with a compatibility score and the reasoning behind it.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="self-start max-w-[80%] rounded-md border border-border bg-card px-4 py-2.5 text-sm">
              What should I wear to a dinner tonight?
            </div>
            <div className="self-end max-w-[85%] rounded-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
              Try your black midi dress with the gold hoops and heeled sandals — elegant, and it matches the occasion you set.
            </div>
          </div>
        </div>
      </section>

      {/* Outfit Planner */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-14 lg:grid-cols-2">
          <div className="order-2 lg:order-1 rounded-md border border-border bg-card p-5">
            <div className="mb-3 flex justify-between text-xs text-muted-foreground">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex aspect-square items-center justify-center rounded-sm border border-border text-xs text-muted-foreground"
                >
                  {i === 1 || i === 3 ? (
                    <div className="size-3/4 rounded-sm bg-accent" />
                  ) : (
                    i + 6
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <Calendar className="mb-4 size-8 text-primary" />
            <h2 className="mb-3 text-3xl">Plan your looks ahead</h2>
            <p className="mb-4 text-muted-foreground">
              Schedule outfits for the week so mornings stop being a decision. Add a wedding, a trip, or a big meeting and let the calendar remember what you planned to wear.
            </p>
          </div>
        </div>
      </section>

      {/* Style Analytics */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-14 lg:grid-cols-2">
          <div>
            <BarChart3 className="mb-4 size-8 text-primary" />
            <h2 className="mb-3 text-3xl">See your style, quantified</h2>
            <p className="mb-4 text-muted-foreground">
              Which colors you actually wear, which pieces sit unused, how your outfit choices shift by season — all calculated from your real wardrobe.
            </p>
          </div>
          <div className="flex items-end gap-3 rounded-md border border-border bg-card p-5">
            {[40, 70, 55, 90, 65].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm bg-primary" style={{ height: `${h}px` }} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-14 text-3xl">People building better wardrobes</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="flex flex-col gap-4">
                <p className="text-sm text-foreground">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl">Ready to see your wardrobe differently?</h2>
          <p className="mb-8 text-muted-foreground">
            Free to start. Your first outfit recommendation is a few minutes away.
          </p>
          <Button size="lg" render={<Link href="/register" />} nativeButton={false}>
            Start Styling
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <p className="font-heading text-base text-foreground">StyleMe</p>
          <div className="flex gap-6">
            <Link href="/register" className="hover:text-foreground">Sign up</Link>
            <Link href="/login" className="hover:text-foreground">Log in</Link>
          </div>
          <p>© 2026 StyleMe</p>
        </div>
      </footer>
    </div>
  );
}