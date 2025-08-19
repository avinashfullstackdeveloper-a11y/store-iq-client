import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-8 relative">
      {/* Background gradient orbs */}
      <div className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-br from-storiq-purple/30 to-storiq-blue/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-br from-storiq-blue/20 to-storiq-purple/20 rounded-full blur-3xl"></div>
      
      {/* Hero Images Grid */}
      <div className="grid grid-cols-3 gap-4 mb-12 max-w-2xl">
        <div className="aspect-square bg-gradient-to-br from-storiq-blue/20 to-storiq-purple/20 rounded-lg overflow-hidden">
          <div className="w-full h-full bg-gradient-to-b from-transparent via-black/20 to-black/60 flex items-end p-4">
            <div className="text-xs text-white/80">Creative Content</div>
          </div>
        </div>
        <div className="aspect-square bg-gradient-to-br from-storiq-purple/20 to-black/40 rounded-lg overflow-hidden">
          <div className="w-full h-full bg-gradient-to-b from-transparent via-black/20 to-black/60 flex items-end p-4">
            <div className="text-xs text-white/80">AI Generated</div>
          </div>
        </div>
        <div className="aspect-square bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg overflow-hidden">
          <div className="w-full h-full bg-gradient-to-b from-transparent via-black/20 to-black/60 flex items-end p-4">
            <div className="text-xs text-white/80">Video Content</div>
          </div>
        </div>
      </div>
      
      {/* Main Heading */}
      <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 max-w-4xl leading-tight">
        The AI workspace for next-gen creators
      </h1>
      
      {/* Subheading */}
      <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl">
        STORIQ helps modern creators streamline content creation, planning, and 
        publishing like never before.
      </p>
      
      {/* CTA Button */}
      <Button variant="gradient" size="lg" className="text-lg px-8 py-6 rounded-full">
        Explore 
        <span className="ml-2 bg-white/20 rounded-full p-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </Button>
    </section>
  );
};

export default HeroSection;