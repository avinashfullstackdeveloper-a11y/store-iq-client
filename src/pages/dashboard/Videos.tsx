import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";

const Videos = () => {
  const videos = [
    { title: "Natures", subtitle: "Video Podcast Generator", image: "/api/placeholder/400/250" },
    { title: "Building City", subtitle: "Video Podcast Generator", image: "/api/placeholder/400/250" },
    { title: "Plants", subtitle: "Video Podcast Generator", image: "/api/placeholder/400/250" },
    { title: "Tech", subtitle: "Video Podcast Generator", image: "/api/placeholder/400/250" },
    { title: "Park", subtitle: "Video Podcast Generator", image: "/api/placeholder/400/250" },
    { title: "Sky", subtitle: "Video Podcast Generator", image: "/api/placeholder/400/250" },
    { title: "Wallpapper", subtitle: "Video Podcast Generator", image: "/api/placeholder/400/250" },
    { title: "Plant", subtitle: "Video Podcast Generator", image: "/api/placeholder/400/250" },
    { title: "Food", subtitle: "Video Podcast Generator", image: "/api/placeholder/400/250" }
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Videos</h1>
          <p className="text-white/60">Here are all the videos that you created.</p>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <div
              key={index}
              className="bg-storiq-card-bg border border-storiq-border rounded-2xl overflow-hidden hover:border-storiq-purple/50 transition-colors"
            >
              <div className="h-48 bg-gradient-to-br from-storiq-blue/20 to-storiq-purple/20 relative">
                <div className="absolute inset-0 bg-black/20"></div>
                {/* Video thumbnail would go here */}
              </div>
              <div className="p-6">
                <h3 className="text-white text-xl font-bold mb-1">{video.title}</h3>
                <p className="text-white/60 text-sm mb-4">{video.subtitle}</p>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-storiq-border text-white hover:bg-storiq-purple hover:border-storiq-purple"
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-storiq-border text-white hover:bg-storiq-purple hover:border-storiq-purple"
                  >
                    Preview
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Videos;