import DashboardLayout from "@/components/DashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Stats = () => {
  const stats = [
    {
      title: "Views",
      value: "12,345",
      change: "+15%",
      changeType: "positive",
      comparison: "vs last month"
    },
    {
      title: "Watch time",
      value: "234h 56m",
      change: "+15%",
      changeType: "positive",
      comparison: "vs last month"
    },
    {
      title: "Engagement rate",
      value: "4.5%",
      change: "-9%",
      changeType: "negative",
      comparison: "vs last month"
    },
    {
      title: "Click-through rate",
      value: "2.1%",
      change: "+16%",
      changeType: "positive",
      comparison: "vs last month"
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Performance Stats</h1>
          <p className="text-white/60">Your posts activity from the last 30 days.</p>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-8">
          <Select defaultValue="all-videos">
            <SelectTrigger className="w-48 bg-storiq-card-bg border-storiq-border text-white">
              <SelectValue placeholder="All videos" />
            </SelectTrigger>
            <SelectContent className="bg-storiq-card-bg border-storiq-border">
              <SelectItem value="all-videos" className="text-white hover:bg-storiq-purple/20">All videos</SelectItem>
              <SelectItem value="published" className="text-white hover:bg-storiq-purple/20">Published</SelectItem>
              <SelectItem value="drafts" className="text-white hover:bg-storiq-purple/20">Drafts</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="last-30-days">
            <SelectTrigger className="w-48 bg-storiq-card-bg border-storiq-border text-white">
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="bg-storiq-card-bg border-storiq-border">
              <SelectItem value="last-30-days" className="text-white hover:bg-storiq-purple/20">Last 30 days</SelectItem>
              <SelectItem value="last-7-days" className="text-white hover:bg-storiq-purple/20">Last 7 days</SelectItem>
              <SelectItem value="last-90-days" className="text-white hover:bg-storiq-purple/20">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-storiq-card-bg border border-storiq-border rounded-2xl p-6">
              <h3 className="text-white/60 text-sm mb-2">{stat.title}</h3>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm px-2 py-1 rounded ${
                  stat.changeType === 'positive' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {stat.change}
                </span>
                <span className="text-white/50 text-sm">{stat.comparison}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-storiq-card-bg border border-storiq-border rounded-2xl p-6">
          <h3 className="text-white text-xl font-bold mb-6">Overall Statistics</h3>
          
          {/* Chart placeholder - would be replaced with actual chart component */}
          <div className="h-80 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white/40">
                <svg width="400" height="200" viewBox="0 0 400 200" className="text-storiq-purple">
                  <path 
                    d="M 50 150 Q 100 100 150 120 T 250 80 T 350 100" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    fill="none"
                  />
                  <path 
                    d="M 50 120 Q 100 140 150 130 T 250 110 T 350 140" 
                    stroke="#ef4444" 
                    strokeWidth="3" 
                    fill="none"
                  />
                </svg>
              </div>
            </div>
            
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-white/40 text-sm">
              <span>250</span>
              <span>200</span>
              <span>150</span>
              <span>100</span>
              <span>50</span>
              <span>0</span>
            </div>
            
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-12 right-0 flex justify-between text-white/40 text-sm">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-white/60 text-sm">Video Generated</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-storiq-purple rounded-full"></div>
              <span className="text-white/60 text-sm">Video Download</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Stats;