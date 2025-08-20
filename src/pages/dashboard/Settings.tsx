import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Settings = () => {
  const sidebarItems = [
    { label: "Your Timezone", active: true },
    { label: "Your affiliate code", active: false },
    { label: "Integrations", active: false },
    { label: "No connected accounts", active: false },
    { label: "Channel Manager", active: false },
    { label: "AI Settings", active: false },
    { label: "Api Key", active: false },
    { label: "Password Management", active: false }
  ];

  const hashtags = ["ai", "tech", "startup", "product"];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your account settings</h1>
          <p className="text-white/60">Manage your account settings</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80 bg-storiq-card-bg border border-storiq-border rounded-2xl p-6">
            <div className="space-y-2">
              {sidebarItems.map((item, index) => (
                <button
                  key={index}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? "bg-storiq-purple text-white"
                      : "text-white/70 hover:text-white hover:bg-storiq-purple/20"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Timezone */}
            <div>
              <h3 className="text-white text-lg font-medium mb-4">Your Timezone</h3>
              <Select defaultValue="asia-calcutta">
                <SelectTrigger className="w-64 bg-storiq-card-bg border-storiq-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-storiq-card-bg border-storiq-border">
                  <SelectItem value="asia-calcutta" className="text-white hover:bg-storiq-purple/20">Asia/Calcutta</SelectItem>
                  <SelectItem value="utc" className="text-white hover:bg-storiq-purple/20">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center space-x-4">
              <Switch defaultChecked className="data-[state=checked]:bg-storiq-purple" />
              <span className="text-white">Enable email notifications</span>
            </div>

            {/* Affiliate Code */}
            <div>
              <h3 className="text-white text-lg font-medium mb-4">Your affiliate code</h3>
              <Input
                placeholder="your_custom_code"
                className="w-80 bg-storiq-card-bg border-storiq-border text-white placeholder:text-white/40"
              />
              <p className="text-white/60 text-sm mt-2">
                Enter your affiliate code here so we can automatically add it to the video you share - get it here
              </p>
              <Button className="bg-storiq-purple hover:bg-storiq-purple-light text-white mt-4">
                Save
              </Button>
            </div>

            {/* Integrations */}
            <div>
              <h3 className="text-white text-lg font-medium mb-4">Integrations</h3>
              <p className="text-white/60 mb-4">Connected Social Accounts (unlimited)</p>
              <p className="text-white mb-4">No connected accounts</p>
              <p className="text-white/60 text-sm mb-4">
                Make sure you're connected on the account your want to add before clicking on one of the following buttons.
              </p>
              <div className="flex space-x-4">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  📱 Add TikTok
                </Button>
                <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                  📷 Add Instagram
                </Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  📺 Add Youtube
                </Button>
                <Button variant="outline" className="border-storiq-border text-white hover:bg-storiq-purple">
                  📹 Add others
                </Button>
              </div>
            </div>

            {/* Channel Manager */}
            <div>
              <h3 className="text-white text-lg font-medium mb-4">Channel Manager</h3>
              <p className="text-white/60 text-sm mb-4">
                Channels makes you able to schedule content on multiple social media accounts from one place.
              </p>
              <div className="flex space-x-4">
                <Input
                  placeholder="Enter channel name"
                  className="flex-1 bg-storiq-card-bg border-storiq-border text-white placeholder:text-white/40"
                />
                <Button className="bg-storiq-purple hover:bg-storiq-purple-light text-white">
                  Create Channel
                </Button>
              </div>
            </div>

            {/* AI Settings */}
            <div>
              <h3 className="text-white text-lg font-medium mb-4">AI Settings</h3>
              <p className="text-white/60 text-sm mb-4">Share 3 to 5 #hashtags you're the most into.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-storiq-purple text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>#{tag}</span>
                    <button className="text-white/80 hover:text-white">×</button>
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <Input
                  placeholder="Add hashtag"
                  className="flex-1 bg-storiq-card-bg border-storiq-border text-white placeholder:text-white/40"
                />
                <Button size="sm" variant="outline" className="border-storiq-border text-white hover:bg-storiq-purple">
                  🔍
                </Button>
              </div>
              <p className="text-white text-sm mb-4">Tell us a few words about who you are and what you are into.</p>
              <Textarea
                placeholder="Write in natural language so we can better personalize content for you."
                className="bg-storiq-card-bg border-storiq-border text-white placeholder:text-white/40 min-h-[100px]"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;