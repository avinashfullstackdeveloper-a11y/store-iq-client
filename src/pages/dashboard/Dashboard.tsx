import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const quickOptions = [
    {
      title: "Search Viral Videos",
      description: "YouTube",
      image: "/api/placeholder/300/150",
      color: "from-red-500/20 to-red-600/20"
    },
    {
      title: "Generate Scripts",
      description: "VIDEO SCRIPT",
      image: "/api/placeholder/300/150",
      color: "from-orange-500/20 to-orange-600/20"
    },
    {
      title: "Setup Auto Mode",
      description: "",
      image: "/api/placeholder/300/150",
      color: "from-blue-500/20 to-blue-600/20"
    }
  ];

  const tools = [
    {
      title: "New Tool",
      subtitle: "Video Podcast Generator",
      image: "/api/placeholder/400/250",
      buttonText: "Try Now"
    },
    {
      title: "Vew UGC Ad",
      subtitle: "New UGC Ad Generator",
      image: "/api/placeholder/400/250",
      buttonText: "Try Now"
    },
    {
      title: "New Tool",
      subtitle: "Video Podcast Generator",
      image: "/api/placeholder/400/250",
      buttonText: "Try Now"
    },
    {
      title: "New Tool",
      subtitle: "Video Podcast Generator",
      image: "/api/placeholder/400/250",
      buttonText: "Try Now"
    },
    {
      title: "New Tool",
      subtitle: "Video Podcast Generator",
      image: "/api/placeholder/400/250",
      buttonText: "Try Now"
    },
    {
      title: "New Tool",
      subtitle: "Video Podcast Generator",
      image: "/api/placeholder/400/250",
      buttonText: "Try Now"
    }
  ];

  const tabs = ["Home", "Creation", "Inspiration"];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Start Creating!</h1>
          <p className="text-white/60">Choose how you want to get started</p>
        </div>

        {/* Quick Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickOptions.map((option, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${option.color} border border-storiq-border p-6 min-h-[200px] flex flex-col justify-end cursor-pointer hover:scale-105 transition-transform`}
            >
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="relative z-10">
                <h3 className="text-white text-xl font-bold mb-1">{option.title}</h3>
                {option.description && (
                  <p className="text-white/80 text-sm">{option.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                index === 0
                  ? "bg-storiq-purple text-white"
                  : "text-white/60 hover:text-white hover:bg-storiq-card-bg"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="bg-storiq-card-bg border border-storiq-border rounded-2xl overflow-hidden hover:border-storiq-purple/50 transition-colors"
            >
              <div className="h-48 bg-gradient-to-br from-storiq-blue/20 to-storiq-purple/20 relative">
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
              <div className="p-6">
                <h3 className="text-white text-xl font-bold mb-1">{tool.title}</h3>
                <p className="text-white/60 text-sm mb-4">{tool.subtitle}</p>
                <Button 
                  variant="outline" 
                  className="w-auto border-storiq-border text-white hover:bg-storiq-purple hover:border-storiq-purple"
                >
                  {tool.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;