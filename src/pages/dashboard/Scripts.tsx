import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

const Scripts = () => {
  const scriptStyles = [
    "General", "Fun facts", "News", "Educational", "How to", "Listicle", 
    "Motivational", "Personal", "Horror", "Life Hack", "Fantasy", "Business"
  ];

  const additionalStyles = ["Philosophy"];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Generate Video Scripts</h1>
          <p className="text-white/60">Tell us about what you want to talk about and we will generate video scripts for you</p>
        </div>

        <div className="max-w-4xl">
          {/* Script Style Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Pick up your script style</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {scriptStyles.map((style, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    index === 0
                      ? "bg-storiq-purple text-white"
                      : "bg-storiq-card-bg border border-storiq-border text-white hover:bg-storiq-purple/20"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {additionalStyles.map((style, index) => (
                <button
                  key={index}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-storiq-card-bg border border-storiq-border text-white hover:bg-storiq-purple/20 transition-colors"
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Tell us more */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Tell us a bit more</h3>
            <Textarea
              placeholder="Type Here"
              className="bg-storiq-card-bg border-storiq-border text-white placeholder:text-white/40 min-h-[200px] resize-none"
            />
          </div>

          {/* Media Content Upload */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Add media content</h3>
            <div className="bg-storiq-card-bg border-2 border-dashed border-storiq-border rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">☁️</div>
              <p className="text-white/60 mb-2">Click to upload or</p>
              <p className="text-white/60">drag and drop</p>
            </div>
          </div>

          {/* Target Duration */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Target Duration</h3>
            <p className="text-white/60 mb-4">Estimation of your video length: 22s (~51 Words)</p>
            <div className="relative">
              <Slider
                defaultValue={[22]}
                max={60}
                step={1}
                className="w-full"
              />
              <div className="absolute -top-8 right-0 bg-storiq-purple text-white px-3 py-1 rounded text-sm">
                22 s
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button className="bg-storiq-purple hover:bg-storiq-purple-light text-white px-8 py-3 rounded-xl">
            Generate Video Scripts
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Scripts;