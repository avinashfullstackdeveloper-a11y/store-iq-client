import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const About = () => {
  const whyCreatorsLove = [
    "Lightning-Fast Editing",
    "AI That Gets You", 
    "Effortless Creativity",
    "Built For Growth"
  ];

  const ethicsFeatures = [
    {
      icon: "🔒",
      title: "Data Privacy",
      description: "Your content stays yours. No AI training on personal data."
    },
    {
      icon: "🏷️", 
      title: "No Watermarks",
      description: "All outputs are watermark-free and copyright friendly."
    },
    {
      icon: "👑",
      title: "Creative Ownership", 
      description: "You retain full ownership of everything you create with us."
    }
  ];

  const faqs = [
    "How can Storiq transform my content creation game?",
    "Can I cancel my subscription at any time?",
    "What kind of content can I create with Storiq?",
    "Can I cancel my subscription at any time?",
    "How can Storiq transform my content creation game?",
    "What kind of content can I create with Storiq?",
    "How can Storiq transform my content creation game?",
    "Can I cancel my subscription at any time?"
  ];

  return (
    <div className="min-h-screen bg-storiq-dark">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            We're not just a tool —<br />
            we're your co-creator.
          </h1>
          <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
            AI should amplify your creativity, not replace it. Here's how we make that happen.
          </p>
          <Button variant="gradient" size="lg" className="rounded-full px-8">
            Feel the Magic
          </Button>
        </div>
      </section>

      {/* Why Creators Love STORIQ */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Why creators love STORIQ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {whyCreatorsLove.map((feature, index) => (
              <div 
                key={index}
                className="bg-storiq-card-bg border border-storiq-border rounded-2xl p-8 hover:bg-storiq-dark-lighter transition-colors"
              >
                <h3 className="text-2xl font-bold text-white">
                  {feature}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emotion-Driven Creation */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Emotion-Driven Creation
              </h2>
              <p className="text-white/60 mb-6">
                Move beyond cut-and-dry edits — think how AI feels that resonates. Our AI understands the power of emotionally-driven content. Together, impactful creation.
              </p>
              <ul className="space-y-4 text-white/80">
                <li className="flex items-start">
                  <span className="text-storiq-purple mr-3">•</span>
                  AI reads nuance, too. Irony, structure, and comedic pacing are all understood.
                </li>
                <li className="flex items-start">
                  <span className="text-storiq-purple mr-3">•</span>
                  Audio clarity is never sacrificed. Your audience stays fluffy, emotional information.
                </li>
                <li className="flex items-start">
                  <span className="text-storiq-purple mr-3">•</span>
                  Realize visually storytelling based on the mood and ambience of your narrative.
                </li>
              </ul>
            </div>
            <div className="bg-storiq-card-bg border border-storiq-border rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white text-center">
                Emotion Driven Creation
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Creators */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-6">
            Built for Creators, Not Corporates
          </h2>
          <p className="text-xl text-white/60 text-center mb-12">
            Our philosophy is human-centered, for efficiency-centric. So let's be on human, and keep you human.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-storiq-card-bg border border-storiq-border rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">
                Creator-first philosophy
              </h3>
            </div>
            <div className="space-y-6 text-white/80">
              <div className="flex items-start">
                <span className="text-storiq-purple mr-3">•</span>
                <span>No forced workflow or standardization.</span>
              </div>
              <div className="flex items-start">
                <span className="text-storiq-purple mr-3">•</span>
                <span>Functions are tools are designed specifically for the hobby, freely, not talent.</span>
              </div>
              <div className="flex items-start">
                <span className="text-storiq-purple mr-3">•</span>
                <span>We build features based on a direct feedback loop from our creator community.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI With Ethics */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            AI With Ethics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ethicsFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-storiq-card-bg border border-storiq-border rounded-2xl p-8 text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((question, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-storiq-card-bg border border-storiq-border rounded-xl px-6"
              >
                <AccordionTrigger className="text-left">
                  {question}
                </AccordionTrigger>
                <AccordionContent>
                  This is a placeholder answer for the FAQ question. In a real implementation, 
                  you would provide detailed answers for each question.
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
};

export default About;