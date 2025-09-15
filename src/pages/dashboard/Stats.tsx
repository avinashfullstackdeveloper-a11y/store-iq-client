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
      // As per the image, this should be +16%
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
                <span className={`text-sm font-semibold px-2 py-1 rounded ${
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
          
          {/* Chart implemented with SVG to match the provided image. */}
          {/* In a real application, you would use a charting library like Recharts or Chart.js */}
          <div className="h-80 relative pr-4 pb-8">
            <svg width="100%" height="100%" viewBox="0 0 1150 250">
              <defs>
                <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="red-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="250" x2="1150" y2="250" stroke="#FFFFFF" strokeOpacity="0.1" />
              <line x1="0" y1="187.5" x2="1150" y2="187.5" stroke="#FFFFFF" strokeOpacity="0.1" />
              <line x1="0" y1="125" x2="1150" y2="125" stroke="#FFFFFF" strokeOpacity="0.1" />
              <line x1="0" y1="62.5" x2="1150" y2="62.5" stroke="#FFFFFF" strokeOpacity="0.1" />

              {/* Red Line (Video Generated) - Area and Stroke */}
              <path d="M 50 230 C 100 200, 100 190, 150 190 S 200 175, 250 165 S 300 170, 350 170 S 400 220, 450 210 S 500 180, 550 190 S 600 160, 650 170 S 700 140, 750 150 S 800 170, 850 160 S 900 130, 950 140 S 1000 190, 1050 180 S 1100 160, 1150 165 V 250 H 50 Z" fill="url(#red-gradient)" />
              <path d="M 50 230 C 100 200, 100 190, 150 190 S 200 175, 250 165 S 300 170, 350 170 S 400 220, 450 210 S 500 180, 550 190 S 600 160, 650 170 S 700 140, 750 150 S 800 170, 850 160 S 900 130, 950 140 S 1000 190, 1050 180 S 1100 160, 1150 165" fill="none" stroke="#ef4444" strokeWidth="2"/>

              {/* Blue Line (Video Download) - Area and Stroke */}
              <path d="M 50 80 C 100 90, 100 120, 150 110 S 200 65, 250 75 S 300 110, 350 100 S 400 160, 450 150 S 500 110, 550 120 S 600 65, 650 75 S 700 150, 750 140 S 800 90, 850 100 S 900 180, 950 170 S 1000 150, 1050 160 S 1100 220, 1150 210 V 250 H 50 Z" fill="url(#blue-gradient)" />
              <path d="M 50 80 C 100 90, 100 120, 150 110 S 200 65, 250 75 S 300 110, 350 100 S 400 160, 450 150 S 500 110, 550 120 S 600 65, 650 75 S 700 150, 750 140 S 800 90, 850 100 S 900 180, 950 170 S 1000 150, 1050 160 S 1100 220, 1150 210" fill="none" stroke="#3b82f6" strokeWidth="2"/>

              {/* Highlight line and circles for July */}
              <line x1="650" y1="0" x2="650" y2="250" stroke="#FFFFFF" strokeOpacity="0.2"/>
              <circle cx="650" cy="170" r="5" fill="#ef4444" stroke="#1c1c24" strokeWidth="2" />
              <circle cx="650" cy="75" r="5" fill="#3b82f6" stroke="#1c1c24" strokeWidth="2" />
            </svg>

            {/* Y-axis labels */}
            <div className="absolute left-0 -top-1 h-full flex flex-col justify-between text-white/40 text-sm py-8">
              <span>250</span>
              <span>200</span>
              <span>150</span>
              <span>100</span>
              <span>50</span>
              <span>0</span>
            </div>
            
            {/* X-axis labels */}
            <div className="absolute -bottom-1 left-0 right-0 flex justify-around text-white/40 text-sm pl-4 pr-8">
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
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-white/60 text-sm">Video Download</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Stats;