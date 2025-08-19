import { Button } from "@/components/ui/button";

const TestimonialSection = () => {
  return (
    <section className="py-20 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-storiq-card-bg border border-storiq-border rounded-2xl p-8 md:p-12 relative">
          <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-12">
            
            {/* Testimonials Text */}
            <div className="flex-1">
              <div className="text-sm text-white/60 mb-2 transform -rotate-90 origin-left absolute left-4 top-1/2">
                Testimonials
              </div>
              
              <div className="ml-8 md:ml-0">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Meera Rajput
                </h3>
                
                <blockquote className="text-lg text-white/80 mb-6 italic">
                  "The AI tools are spot-on. From script generation to export, every step feels effortless and saves me hours each week."
                </blockquote>
              </div>
            </div>
            
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-storiq-purple/30 to-storiq-blue/30">
                <div className="w-full h-full bg-gradient-to-b from-transparent to-black/40 flex items-end p-4">
                  <div className="w-full h-full bg-gradient-to-br from-orange-400/60 to-red-500/60 rounded-lg"></div>
                </div>
              </div>
            </div>
            
            {/* Navigation Arrow */}
            <div className="flex-shrink-0">
              <Button variant="gradient" size="icon" className="rounded-xl w-12 h-12">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;