import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Exports = () => {
  const exportHistory = [
    { 
      filename: "Project Gamma", 
      date: "2024-01-15", 
      size: "250MB", 
      format: "MP4", 
      status: "Completed",
    },
    { 
      filename: "Project Delta", 
      date: "2024-01-10", 
      size: "180MB", 
      format: "MOV", 
      status: "Completed",
    },
    { 
      filename: "Project Epsilon", 
      date: "2024-01-05", 
      size: "320MB", 
      format: "MP4", 
      status: "Failed",
    }
  ];

  // A simple play icon component using SVG
  const PlayIcon = (props) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      {...props}
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Exports</h1>
          <p className="text-white/60">Here are all the videos that you exported.</p>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-8">
          <Select defaultValue="date">
            <SelectTrigger className="w-32 bg-storiq-card-bg border-storiq-border text-white">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent className="bg-storiq-card-bg border-storiq-border">
              <SelectItem value="date" className="text-white hover:bg-storiq-purple/20">Date</SelectItem>
              <SelectItem value="name" className="text-white hover:bg-storiq-purple/20">Name</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="status">
            <SelectTrigger className="w-32 bg-storiq-card-bg border-storiq-border text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-storiq-card-bg border-storiq-border">
              <SelectItem value="status" className="text-white hover:bg-storiq-purple/20">Status</SelectItem>
              <SelectItem value="completed" className="text-white hover:bg-storiq-purple/20">Completed</SelectItem>
              <SelectItem value="failed" className="text-white hover:bg-storiq-purple/20">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="format">
            <SelectTrigger className="w-32 bg-storiq-card-bg border-storiq-border text-white">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent className="bg-storiq-card-bg border-storiq-border">
              <SelectItem value="format" className="text-white hover:bg-storiq-purple/20">Format</SelectItem>
              <SelectItem value="mp4" className="text-white hover:bg-storiq-purple/20">MP4</SelectItem>
              <SelectItem value="mov" className="text-white hover:bg-storiq-purple/20">MOV</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* In Progress Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">In Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-storiq-card-bg border border-storiq-border rounded-2xl overflow-hidden">
                <div className="relative h-48 w-full bg-slate-800 flex items-center justify-center">
                  {/* Striped background created with CSS */}
                  <div 
                    className="absolute inset-0" 
                    style={{
                      backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(0, 0, 0, 0.2) 10px, rgba(0, 0, 0, 0.2) 20px)'
                    }}
                  ></div>
                  
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 rounded-full h-16 w-16 flex items-center justify-center cursor-pointer">
                      <PlayIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-white text-xl font-bold mb-1">Project Alpha</h3>
                  <p className="text-white/60 text-sm mb-4">Exporting • 1080p • MP4</p>
                  
                  {/* Progress Bar */}
                  <div className="flex items-center gap-x-3 mb-4">
                    <div className="w-full bg-storiq-dark rounded-full h-2">
                      <div className="bg-storiq-purple h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                    <p className="text-storiq-purple text-sm font-medium whitespace-nowrap">50%</p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-storiq-border text-white hover:bg-storiq-purple hover:border-storiq-purple"
                    disabled
                  >
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export History */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Export History</h2>
          <div className="bg-storiq-card-bg border border-storiq-border rounded-2xl">
            {/* Table Header */}
            <div className="p-4 grid grid-cols-6 gap-4 text-white/60 font-semibold border-b border-storiq-border">
              <div>Filename</div>
              <div>Date</div>
              <div>Size</div>
              <div>Format</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            
            {/* Table Rows */}
            <div className="divide-y divide-storiq-border">
              {exportHistory.map((item, index) => (
                <div key={index} className="p-4 grid grid-cols-6 gap-4 text-white items-center">
                  <div className="font-medium">{item.filename}</div>
                  <div className="text-white/60">{item.date}</div>
                  <div className="text-white/60">{item.size}</div>
                  <div>
                    <span className="bg-storiq-purple/20 text-storiq-purple font-semibold px-2 py-1 rounded-md text-sm">
                      {item.format}
                    </span>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded-md text-sm font-medium ${
                      item.status === 'Completed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div>
                    <a href="#" className="text-white/60 text-sm underline hover:text-white transition-colors">
                      Download / Share / Delete
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Exports;
