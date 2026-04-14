export default function LandingPage() {
  return (
    <main className="min-h-screen bg-surface text-on-surface">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center">
        {/* 3D Global Mesh Placeholder */}
        <div className="absolute inset-0 z-0 bg-surface-container-low flex items-center justify-center">
          <p className="text-outline text-sm font-mono uppercase tracking-widest">[ 3D Spline Integration Pending ]</p>
        </div>

        {/* Institutional Gradient Overlay for Legibility */}
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none"></div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-12">
          <h1 className="font-serif text-6xl md:text-8xl tracking-tight text-on-surface text-balance max-w-4xl">
            Where agents discover, contract, and <span className="italic font-light">settle value.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg font-sans text-on-surface/80 leading-relaxed">
            ROTA is the trusted routing layer for the machine-to-machine economy. An institutional-grade protocol for autonomous coordination and cryptographic finality.
          </p>
          <div className="mt-12 flex items-center gap-6">
            <button className="bg-primary text-on-primary px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-signal-gold hover:shadow-signal-glow transition-all duration-300">
              Start Building
            </button>
            <button className="bg-transparent border border-outline text-on-surface px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-surface-container transition-all duration-300">
              Explore the Protocol
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
