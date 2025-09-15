import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client"; // Import supabase client
// import CreateVideo from './create-new-video'; 




// --- Main Dashboard Component ---

const Dashboard = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // --- IMPORTANT ---
        // Replace 'videos' with the actual name of your Supabase table.
        const { data: fetchedData, error: fetchError } = await supabase
          .from('video_projects')
          .select('*');

        if (fetchError) {
          throw fetchError;
        }

        setData(fetchedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once on mount


  // Data for the quick options cards, updated with images and styles to match the screenshot
  const quickOptions = [
    {
      superTitle: "YouTube",
      title: "Search Viral Videos",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute top-6 right-6 text-gray-400 group-hover:text-white transition-colors"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      ),
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3",
      href: "/dashboard/search-videos"
    },
    {
      superTitle: "VIDEO SCRIPT",
      title: "Generate Scripts",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
    },
    {
      superTitle: "",
      title: "Setup Auto Mode",
      image: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3",
    }
  ];

  // Data for the tools grid, updated with varied, realistic images and corrected text
  const tools = [
    {
      title: "New Tool",
      subtitle: "Video Podcast Generator",
      image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
      buttonText: "Try Now"
    },
    {
      title: "New UGC Ad", // Corrected typo from "Vew"
      subtitle: "New UGC Ad Generator",
      image: "https://images.unsplash.com/photo-1611262588024-d12430b98920?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3",
      buttonText: "Try Now"
    },
    {
      title: "New Tool",
      subtitle: "Video Podcast Generator",
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3",
    buttonText: "Try Now"
    },
    {
      title: "New Tool",
      subtitle: "Video Podcast Generator",
      image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
      buttonText: "Try Now"
    },
    {
      title: "New Tool",
      subtitle: "Video Podcast Generator",
      image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=2041&auto=format&fit=crop&ixlib=rb-4.0.3",
      buttonText: "Try Now"
    },
    {
      title: "New Tool",
      subtitle: "Video Podcast Generator",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
      buttonText: "Try Now"
    }
  ];

  const tabs = ["Home", "Creation", "Inspiration"];
  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <DashboardLayout>
      <div className="p-8 bg-[#121212] min-h-screen">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Start Creating!</h1>
          <p className="text-gray-400">Choose how you want to get started</p>
        </div>

        {/* --- Display Fetched Data --- */}
        <div className="mb-8 p-4 rounded-lg bg-[#1C1C1C] border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-2">Data from Supabase</h2>
          {loading && <p className="text-gray-400">Loading...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {data && (
            <pre className="text-sm text-green-400 bg-black p-3 rounded-md overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>

        {/* Quick Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {quickOptions.map((option, index) => (
            <a
              key={index}
              href={option.href || "#"}
              className="relative overflow-hidden rounded-2xl bg-[#1C1C1C] border border-gray-800/80 p-6 min-h-[180px] flex flex-col justify-end group cursor-pointer transition-all duration-300 hover:border-violet-700/60 hover:shadow-lg hover:shadow-violet-700/20"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-300"
                style={{backgroundImage: `url(${option.image})`}}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              {option.icon}
              <div className="relative z-10">
                {option.superTitle && (
                  <p className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-1">{option.superTitle}</p>
                )}
                <h3 className="text-white text-xl font-bold">{option.title}</h3>
              </div>
            </a>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeTab === index
                  ? "bg-violet-700 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60"
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
              className="bg-[#1C1C1C] border border-gray-800/80 rounded-2xl overflow-hidden group transition-all duration-300 hover:border-violet-700/50 hover:transform hover:-translate-y-1"
            >
              <div className="overflow-hidden h-40">
                <img src={tool.image} alt={tool.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-6">
                <h3 className="text-white text-lg font-bold mb-1">{tool.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{tool.subtitle}</p>
                <Button 
                  variant="outline" 
                  className="w-auto px-5 py-2 bg-transparent border border-gray-700 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 hover:border-violet-700 transition-colors"
                  onClick={() => navigate('/dashboard/create-video')} // Add onClick handler
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