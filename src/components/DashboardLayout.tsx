import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const sidebarItems = [
    { icon: "🏠", label: "Home", href: "/dashboard", active: true },
    { icon: "📤", label: "Publish", href: "/dashboard/publish" },
    { icon: "📊", label: "Stats", href: "/dashboard/stats" },
  ];

  const creationItems = [
    { icon: "🎥", label: "Videos", href: "/dashboard/videos" },
    { icon: "📥", label: "Exports", href: "/dashboard/exports" },
  ];

  const inspirationItems = [
    { icon: "📝", label: "Scripts", href: "/dashboard/scripts" },
  ];

  return (
    <div className="min-h-screen bg-storiq-dark flex">
      {/* Sidebar */}
      <div className="w-64 bg-storiq-dark border-r border-storiq-border flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <div className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm inline-block">
            STORIQ
          </div>
        </div>

        {/* Create New Video Button */}
        <div className="px-6 mb-8">
          <Button className="w-full bg-storiq-purple hover:bg-storiq-purple-light text-white rounded-full py-3">
            + Create New Video
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6">
          <div className="space-y-2 mb-8">
            {sidebarItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors",
                  item.active 
                    ? "bg-storiq-purple text-white" 
                    : "text-white/70 hover:text-white hover:bg-storiq-card-bg"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>

          {/* Creation Section */}
          <div className="mb-8">
            <h3 className="text-white/60 text-sm font-medium mb-3 px-4">Creation</h3>
            <div className="space-y-2">
              {creationItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-storiq-card-bg transition-colors"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Inspiration Section */}
          <div className="mb-8">
            <h3 className="text-white/60 text-sm font-medium mb-3 px-4">Inspiration</h3>
            <div className="space-y-2">
              {inspirationItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-storiq-card-bg transition-colors"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Account Settings */}
          <a
            href="/dashboard/settings"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-storiq-card-bg transition-colors mb-8"
          >
            <span className="text-lg">⚙️</span>
            <span>Account Settings</span>
          </a>
        </nav>

        {/* Premium Plans */}
        <div className="p-6 border-t border-storiq-border">
          <div className="mb-4">
            <h4 className="text-white font-medium mb-2">Premium Plans</h4>
            <p className="text-white/60 text-sm">
              Upgrade your free plan into Premium Plans
            </p>
          </div>
          <Button variant="outline" className="w-full border-storiq-purple text-storiq-purple hover:bg-storiq-purple hover:text-white">
            Upgrade Now
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;