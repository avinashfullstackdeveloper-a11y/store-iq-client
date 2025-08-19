import Header from "@/components/Header";

const Tools = () => {
  const tools = [
    { number: "01", name: "AI Script Generator" },
    { number: "02", name: "AI Hook Generator" },
    { number: "03", name: "AI Face Video Creation" },
    { number: "04", name: "AI Auto Mode" },
    { number: "05", name: "Posting Calendar" },
    { number: "06", name: "Voice Clone" },
    { number: "07", name: "Script Templates" },
    { number: "08", name: "Repurpose Tool" },
    { number: "09", name: "Social Media Scheduling" },
    { number: "10", name: "AI Characters" },
    { number: "11", name: "Timeline Editor" },
    { number: "12", name: "Clip Highlighter" },
    { number: "13", name: "Brand Kit Integration" },
    { number: "14", name: "AI Visual Library" },
    { number: "15", name: "Emotion Tone Analyzer" },
    { number: "16", name: "Export Panels" },
    { number: "17", name: "Affiliate Program + API Access" },
    { number: "18", name: "Multi - Tone AI Voice Styles" },
    { number: "19", name: "Smart Storyboard Generator" },
    { number: "20", name: "Media Matching Engine" },
    { number: "21", name: "Auto-Resize for Platform" },
    { number: "22", name: "Interactive Video Previews" },
    { number: "23", name: "Instant Talking Avatar" },
    { number: "24", name: "AI Camera Movement Simulations" },
    { number: "25", name: "AI - Powered B-Roll Inserter" },
    { number: "26", name: "Podcast to video Tool" },
    { number: "27", name: "AI Subtitle Styler" },
    { number: "28", name: "Video Length Trimmer" },
    { number: "29", name: "Ghibli AI Video Generator" },
    { number: "30", name: "Lyric Video Maker" }
  ];

  return (
    <div className="min-h-screen bg-storiq-dark">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            FREE AI TOOLS
          </h1>
          <p className="text-xl text-white/60 mb-8 max-w-3xl mx-auto">
            STORIQ's powerful AI workspace makes content creation effortless. From text, 
            audio, or visuals — turn any idea into polished, ready-to-publish content!
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <div 
                key={index}
                className="bg-storiq-card-bg border border-storiq-border rounded-2xl p-8 hover:bg-storiq-dark-lighter transition-colors cursor-pointer group"
              >
                <div className="text-sm text-white/40 mb-3 font-mono">
                  {tool.number}
                </div>
                <h3 className="text-xl font-semibold text-white group-hover:text-storiq-purple-light transition-colors">
                  {tool.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tools;