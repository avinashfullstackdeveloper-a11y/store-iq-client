import DashboardLayout from "@/components/DashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const VIDEO_TYPE_OPTIONS = [
  { value: "all-videos", label: "All videos" },
  { value: "published", label: "Published" },
  { value: "drafts", label: "Drafts" },
];

const DATE_RANGE_OPTIONS = [
  { value: "last-30-days", label: "Last 30 days" },
  { value: "last-7-days", label: "Last 7 days" },
  { value: "last-90-days", label: "Last 90 days" },
];

const Stats = () => {
  const [videoType, setVideoType] = useState("all-videos");
  const [dateRange, setDateRange] = useState("last-30-days");
  type Stat = {
    title: string;
    value: string | number;
    change: string;
    changeType: "positive" | "negative";
    comparison: string;
  };
  type TimeseriesPoint = {
    label: string;
    generated: number;
    download: number;
  };

  const [stats, setStats] = useState<Stat[]>([]);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stats and timeseries when filters change
  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const summaryRes = await fetch(
          `/api/stats/summary?videoType=${videoType}&dateRange=${dateRange}`
        );
        const timeseriesRes = await fetch(
          `/api/stats/timeseries?videoType=${videoType}&dateRange=${dateRange}`
        );
        if (!summaryRes.ok || !timeseriesRes.ok) {
          throw new Error("Failed to fetch stats");
        }
        const summaryData = await summaryRes.json();
        const timeseriesData = await timeseriesRes.json();
        if (!ignore) {
          setStats(summaryData.stats || []);
          setTimeseries(timeseriesData.data || []);
        }
      } catch (e) {
        if (!ignore) setError(e instanceof Error ? e.message : "Error loading stats");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchData();
    return () => {
      ignore = true;
    };
  }, [videoType, dateRange]);

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Performance Stats</h1>
          <p className="text-white/60">Your posts activity from the last 30 days.</p>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-8">
          <Select value={videoType} onValueChange={setVideoType}>
            <SelectTrigger className="w-48 bg-storiq-card-bg border-storiq-border text-white">
              <SelectValue placeholder="All videos" />
            </SelectTrigger>
            <SelectContent className="bg-storiq-card-bg border-storiq-border">
              {VIDEO_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-storiq-purple/20">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48 bg-storiq-card-bg border-storiq-border text-white">
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="bg-storiq-card-bg border-storiq-border">
              {DATE_RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-storiq-purple/20">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-storiq-card-bg border border-storiq-border rounded-2xl p-6 flex flex-col space-y-4">
                  <Skeleton className="h-4 w-1/3 bg-white/10" />
                  <Skeleton className="h-8 w-2/3 bg-white/20" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-16 bg-white/10" />
                    <Skeleton className="h-4 w-12 bg-white/10" />
                  </div>
                </div>
              ))}
            </>
          ) : error ? (
            <div className="col-span-4 flex justify-center items-center h-32">
              <span className="text-red-400">{error}</span>
            </div>
          ) : stats.length === 0 ? (
            <div className="col-span-4 flex justify-center items-center h-32">
              <span className="text-white/60">No stats available.</span>
            </div>
          ) : (
            stats.map((stat, index) => (
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
            ))
          )}
        </div>

        {/* Chart */}
        <div className="bg-storiq-card-bg border border-storiq-border rounded-2xl p-6">
          <h3 className="text-white text-xl font-bold mb-6">Overall Statistics</h3>
          <div className="h-80 relative pr-4 pb-8 flex items-center justify-center">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Skeleton className="w-full h-64 bg-white/10 rounded-xl" />
              </div>
            ) : error ? (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-red-400">{error}</span>
              </div>
            ) : timeseries.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white/60">No chart data available.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timeseries}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGenerated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#FFFFFF" strokeOpacity={0.1} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#a1a1aa", fontSize: 14 }}
                    axisLine={false}
                    tickLine={false}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis
                    tick={{ fill: "#a1a1aa", fontSize: 14 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#232336",
                      border: "1px solid #3b3b4f",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    labelStyle={{ color: "#a1a1aa" }}
                    cursor={{ stroke: "#a1a1aa", strokeOpacity: 0.2 }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ color: "#a1a1aa", fontSize: 14, marginBottom: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="generated"
                    name="Video Generated"
                    stroke="#ef4444"
                    fill="url(#colorGenerated)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#ef4444", stroke: "#1c1c24", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="download"
                    name="Video Download"
                    stroke="#3b82f6"
                    fill="url(#colorDownload)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#3b82f6", stroke: "#1c1c24", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Stats;