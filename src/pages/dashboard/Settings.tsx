import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";
import { DateTime, Info } from "luxon";

// Cookie helpers
function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/";
}
function getCookie(name: string) {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r
  }, "");
}

const Settings = () => {
  const { user, logout, updateTimezone } = useAuth();
  const navigate = useNavigate();
  // Use IANA timezone, default to user's or system's
  const [timezone, setTimezone] = useState(
    user?.timezone || DateTime.local().zoneName
  );
  const [updatingTimezone, setUpdatingTimezone] = useState(false);
  const [currentTime, setCurrentTime] = useState(
    DateTime.now().setZone(timezone)
  );

  // Persist timezone to cookie when it changes (in case setTimezone is called elsewhere)
  useEffect(() => {
    setCookie("selectedTimezone", timezone);
  }, [timezone]);

  // Static list of common IANA timezones
  const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Toronto",
    "America/Vancouver",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Madrid",
    "Europe/Rome",
    "Europe/Moscow",
    "Asia/Kolkata",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Asia/Singapore",
    "Asia/Hong_Kong",
    "Asia/Bangkok",
    "Asia/Dubai",
    "Australia/Sydney",
    "Australia/Melbourne",
    "Pacific/Auckland",
    "Pacific/Honolulu",
    "Africa/Johannesburg",
    "Africa/Cairo",
    "America/Sao_Paulo",
    "America/Bogota",
    "America/Mexico_City",
    "Europe/Istanbul",
    "Europe/Warsaw",
    "Europe/Zurich",
    "Asia/Seoul",
    "Asia/Jakarta",
    "Asia/Kuala_Lumpur",
    "Asia/Manila",
    "Asia/Taipei",
    "Asia/Riyadh",
    "Asia/Ho_Chi_Minh",
    "Asia/Baku",
    "Asia/Yangon",
    "Asia/Kathmandu",
    "Asia/Colombo",
    "Asia/Karachi",
    "Asia/Tashkent",
    "Asia/Almaty",
    "Asia/Novosibirsk",
    "Asia/Vladivostok",
    "Asia/Sakhalin",
    "Asia/Magadan",
    "Asia/Kamchatka",
    "Pacific/Guam",
    "Pacific/Fiji",
    "Pacific/Tongatapu",
  ];

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(DateTime.now().setZone(timezone));
    }, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleTimezoneChange = async (value: string) => {
    setUpdatingTimezone(true);
    setTimezone(value);
    setCookie("selectedTimezone", value);
    await updateTimezone(value);
    setUpdatingTimezone(false);
  };

  // Sidebar navigation items for the settings page
  const sidebarItems = [
    "Your Timezone",
    "Your affiliate code",
    "Integrations",
    "Channel Manager",
    "AI Settings",
    "Api Key",
    "Password Management",
    "Account",
  ];

  const [activeTab, setActiveTab] = useState(sidebarItems[0]);
  
  // Password management form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || "Failed to update password.");
      } else {
        setPasswordSuccess("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setPasswordError("Network error. Please try again.");
    }
    setPasswordLoading(false);
  };

  // Example hashtags for AI Settings
  const hashtags = ["ai", "tech", "startup", "product"];

  return (
    <DashboardLayout>
      <div className="p-8 bg-[#111111] min-h-screen">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Your account settings
          </h1>
          <p className="text-white/60">Manage your account settings</p>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar for Settings Navigation */}
          <aside className="w-80 flex-shrink-0">
            <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-4 sticky top-8">
              <div className="space-y-2">
                {sidebarItems.map((label, index) => (
                  <button
                    key={index}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-base font-medium ${
                      activeTab === label
                        ? "bg-[#6E42E1] text-white"
                        : "text-white/70 hover:text-white hover:bg-[#6E42E1]/20"
                    }`}
                    onClick={() => setActiveTab(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 space-y-12">
            {/* Your Timezone Section */}
            {activeTab === "Your Timezone" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-white text-lg font-medium mb-3">
                    Your Timezone
                  </h3>
                  <Select
                    value={timezone}
                    onValueChange={handleTimezoneChange}
                    disabled={updatingTimezone}
                  >
                    <SelectTrigger className="w-96 bg-[#1E1E1E] border-[#2A2A2A] text-white h-12">
                      <SelectValue placeholder="Select a timezone" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E1E1E] border-[#2A2A2A] text-white">
                      {timezones.map((tz) => (
                        <SelectItem
                          key={tz}
                          value={tz}
                          className="focus:bg-[#6E42E1]/50 focus:text-white"
                        >
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Live clock for selected timezone */}
                <div className="mt-4 flex items-center space-x-2">
                  <span className="text-white font-mono text-lg">
                    {currentTime.toFormat("cccc, dd LLL yyyy HH:mm:ss")}
                  </span>
                  <span className="text-white/60 text-sm">({timezone})</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Switch
                    defaultChecked
                    id="email-notifications"
                    className="data-[state=checked]:bg-[#6E42E1]"
                  />
                  <label
                    htmlFor="email-notifications"
                    className="text-white font-medium"
                  >
                    Enable email notifications
                  </label>
                </div>
              </div>
            )}

            {/* Your Affiliate Code Section */}
            {activeTab === "Your affiliate code" && (
              <div>
                <h3 className="text-white text-lg font-medium mb-3">
                  Your affiliate code
                </h3>
                <Input
                  defaultValue="your_custom_code"
                  className="w-96 bg-[#1E1E1E] border-[#2A2A2A] text-white placeholder:text-white/40 h-12"
                />
                <p className="text-white/60 text-sm mt-2 max-w-md">
                  Enter your affiliate code here so we can automatically add it
                  to the video you share - get it here
                </p>
                <Button className="bg-[#6E42E1] hover:bg-[#7d55e6] text-white mt-4 px-6">
                  Save
                </Button>
              </div>
            )}

            {/* Integrations Section */}
            {activeTab === "Integrations" && (
              <div>
                <h3 className="text-white text-lg font-medium mb-2">
                  Integrations
                </h3>
                <p className="text-white/60 mb-3">
                  Connected Social Accounts (unlimited)
                </p>
                <p className="text-white mb-3 font-medium">
                  No connected accounts
                </p>
                <p className="text-white/60 text-sm mb-4">
                  Make sure you're connected on the account your want to add
                  before clicking on one of the following buttons.
                </p>
                <div className="flex space-x-4">
                  <Button className="bg-black hover:bg-gray-800 text-white font-bold">
                    Add TikTok
                  </Button>
                  <Button className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-bold hover:opacity-90">
                    Add Instagram
                  </Button>
                  <Button className="bg-red-600 hover:bg-red-700 text-white font-bold">
                    Add Youtube
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#2A2A2A] bg-[#1E1E1E] text-white hover:bg-[#6E42E1] hover:text-white hover:border-[#6E42E1]"
                  >
                    Add others
                  </Button>
                </div>
              </div>
            )}

            {/* Channel Manager Section */}
            {activeTab === "Channel Manager" && (
              <div>
                <h3 className="text-white text-lg font-medium mb-3">
                  Channel Manager
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  Channels makes you able to schedule content on multiple social
                  media accounts from one place.
                </p>
                <div className="flex space-x-4">
                  <Input
                    placeholder="Enter channel name"
                    className="flex-1 bg-[#1E1E1E] border-[#2A2A2A] text-white placeholder:text-white/40 h-12"
                  />
                  <Button className="bg-[#6E42E1] hover:bg-[#7d55e6] text-white px-5">
                    Create Channel
                  </Button>
                </div>
              </div>
            )}

            {/* AI Settings Section */}
            {activeTab === "AI Settings" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-white text-lg font-medium mb-3">
                    AI Settings
                  </h3>
                  <p className="text-white/60 text-sm mb-4">
                    Share 3 to 5 #hashtags you're the most into.
                  </p>
                  {/* Combined hashtag input container */}
                  <div className="flex items-center w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-2.5">
                    <div className="flex flex-wrap gap-2">
                      {hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-[#6E42E1] text-white px-3 py-1 rounded-md text-sm flex items-center"
                        >
                          <span>{tag}</span>
                          <button className="ml-2 text-white/80 hover:text-white text-xs">
                            X
                          </button>
                        </span>
                      ))}
                    </div>
                    <button className="ml-auto pl-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white/60"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-white font-medium text-sm mb-3">
                    Tell us a few words about who you are and what you are into.
                  </p>
                  <Textarea
                    placeholder="Write in natural language so we can better personalize content for you."
                    className="bg-[#1E1E1E] border-[#2A2A2A] text-white placeholder:text-white/40 min-h-[120px]"
                  />
                </div>
              </div>
            )}
            {/* Password Management Section */}
            {activeTab === "Password Management" && (
              <div className="space-y-6">
                <h3 className="text-white text-lg font-medium mb-3">
                  Password Management
                </h3>
                <form
                  className="space-y-4 max-w-md"
                  onSubmit={handlePasswordUpdate}
                  autoComplete="off"
                >
                  <div>
                    <label className="block text-white/80 mb-1" htmlFor="current-password">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrent ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-[#1E1E1E] border-[#2A2A2A] text-white h-12 pr-10"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
                        tabIndex={-1}
                        onClick={() => setShowCurrent((v) => !v)}
                        aria-label={showCurrent ? "Hide password" : "Show password"}
                      >
                        {showCurrent ? (
                          // Eye-off SVG
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.22 1.125-4.575m1.875-2.25A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.402 3.22-1.125 4.575m-1.875 2.25A9.956 9.956 0 0112 21c-2.21 0-4.267-.715-5.925-1.925M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                          </svg>
                        ) : (
                          // Eye SVG
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/80 mb-1" htmlFor="new-password">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#1E1E1E] border-[#2A2A2A] text-white h-12 pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
                        tabIndex={-1}
                        onClick={() => setShowNew((v) => !v)}
                        aria-label={showNew ? "Hide password" : "Show password"}
                      >
                        {showNew ? (
                          // Eye-off SVG
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.22 1.125-4.575m1.875-2.25A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.402 3.22-1.125 4.575m-1.875 2.25A9.956 9.956 0 0112 21c-2.21 0-4.267-.715-5.925-1.925M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                          </svg>
                        ) : (
                          // Eye SVG
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/80 mb-1" htmlFor="confirm-password">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#1E1E1E] border-[#2A2A2A] text-white h-12 pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
                        tabIndex={-1}
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                      >
                        {showConfirm ? (
                          // Eye-off SVG
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.22 1.125-4.575m1.875-2.25A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.402 3.22-1.125 4.575m-1.875 2.25A9.956 9.956 0 0112 21c-2.21 0-4.267-.715-5.925-1.925M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                          </svg>
                        ) : (
                          // Eye SVG
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {passwordError && (
                    <div className="text-red-500 text-sm">{passwordError}</div>
                  )}
                  {passwordSuccess && (
                    <div className="text-green-500 text-sm">{passwordSuccess}</div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-[#6E42E1] hover:bg-[#7d55e6] text-white"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </div>
            )}
          {/* Account Section */}
          {activeTab === "Account" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-white text-lg font-medium mb-3">
                  Account Details
                </h3>
                <div className="mb-4">
                  {user?.username && (
                    <>
                      <span className="block text-sm text-white/60 mb-1">
                        Username
                      </span>
                      <span className="block text-base font-medium text-white bg-[#2A2A2A] px-2 py-1 rounded">
                        {user.username}
                      </span>
                    </>
                  )}
                  <span className="block text-sm text-white/60 mb-1 mt-3">
                    Email
                  </span>
                  <span className="block text-base font-medium text-white bg-[#6E42E1] px-2 py-1 rounded">
                    {user?.email || "Not available"}
                  </span>
                </div>
              </div>
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          )}
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
