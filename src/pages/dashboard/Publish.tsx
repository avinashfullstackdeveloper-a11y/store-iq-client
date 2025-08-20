import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";

const Publish = () => {
  const scheduledItems = [
    { time: "2:00 PM", placeholder: "Place your next video here (2:00 PM)" },
    { time: "5:00 PM", placeholder: "Place your next video here (5:00 PM)" },
    { time: "8:00 PM", placeholder: "Place your next video here (8:00 PM)" }
  ];

  const tomorrowItems = [
    { time: "10:00 AM", placeholder: "Place your next video here (10:00 AM)" },
    { time: "3:00 PM", placeholder: "Place your next video here (3:00 PM)" }
  ];

  const dayAfterItems = [
    { time: "9:00 AM", placeholder: "Place your next video here (9:00 AM)" }
  ];

  const tabs = ["Scheduled", "Past Publications"];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Posting Queue</h1>
          <p className="text-white/60">Your content published while you sleep</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                index === 0
                  ? "bg-storiq-purple text-white"
                  : "text-white/60 hover:text-white hover:bg-storiq-card-bg"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Social Connect Banner */}
        <div className="bg-storiq-card-bg border border-storiq-border rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">🔗</div>
            <div>
              <h3 className="text-white font-medium">Connect Social Accounts to enable scheduling (TikTok, YouTube, Instagram)</h3>
              <p className="text-white/60 text-sm">To use scheduling feature, connect social accounts</p>
            </div>
          </div>
          <Button className="bg-storiq-purple hover:bg-storiq-purple-light text-white rounded-lg">
            Connect Now
          </Button>
        </div>

        {/* Queue Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Your Posting Queue</h2>
            <p className="text-white/60">Your content published while you sleep</p>
          </div>
          <Button variant="outline" className="border-storiq-border text-white hover:bg-storiq-purple hover:border-storiq-purple">
            Edit Queue
          </Button>
        </div>

        {/* Today */}
        <div className="mb-8">
          <h3 className="text-white text-lg font-medium mb-4">Today | August 6, 2025</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scheduledItems.map((item, index) => (
              <div
                key={index}
                className="bg-storiq-card-bg border border-storiq-border rounded-xl p-6 min-h-[120px] flex items-center justify-center border-dashed"
              >
                <p className="text-white/60 text-center">{item.placeholder}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tomorrow */}
        <div className="mb-8">
          <h3 className="text-white text-lg font-medium mb-4">Tomorrow | August 7, 2025</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tomorrowItems.map((item, index) => (
              <div
                key={index}
                className="bg-storiq-card-bg border border-storiq-border rounded-xl p-6 min-h-[120px] flex items-center justify-center border-dashed"
              >
                <p className="text-white/60 text-center">{item.placeholder}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Day After */}
        <div>
          <h3 className="text-white text-lg font-medium mb-4">Day After | August 8, 2025</h3>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {dayAfterItems.map((item, index) => (
              <div
                key={index}
                className="bg-storiq-card-bg border border-storiq-border rounded-xl p-6 min-h-[120px] flex items-center justify-center border-dashed max-w-md"
              >
                <p className="text-white/60 text-center">{item.placeholder}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Publish;