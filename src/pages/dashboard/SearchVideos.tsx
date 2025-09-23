import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, Play, Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import axios from "axios";

const SearchVideos = () => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("how to create a startup");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [videoResults, setVideoResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const suggestedTags = [
    "how to create a startup",
    "how to go viral on TikTok", 
    "best AI tools",
    "create personal brand"
  ];

  const fetchYouTubeVideos = async () => {
    if (!searchTerm) return;
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/youtube/search", {
        query: searchTerm,
        from: "2024-01-01T00:00:00Z",
        to: new Date().toISOString(),
        order: "viewCount"
      });

      const mappedVideos = res.data.map((video: any) => ({
        id: video.id,
        thumbnail: video.snippet.thumbnails.medium.url,
        platform: "YouTube",
        title: video.snippet.title,
        subtitle: video.snippet.description,
        views: video.statistics.viewCount,
        likes: video.statistics.likeCount,
        comments: video.statistics.commentCount,
        author: video.snippet.channelTitle
      }));

      setVideoResults(mappedVideos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchYouTubeVideos();
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Search YouTube Videos</h1>
          <p className="text-white/60">Input a topic and hit "Search" to find viral YouTube videos</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-storiq-card-bg border-storiq-border text-white placeholder:text-white/40 h-12 text-lg"
                placeholder="Enter your search topic..."
              />
            </div>
            <Button 
              className="bg-storiq-purple hover:bg-storiq-purple-light text-white px-8 h-12"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>
        </div>

        {/* Suggested Tags */}
        <div className="flex flex-wrap gap-3 mb-8">
          {suggestedTags.map((tag, index) => (
            <button
              key={index}
              onClick={() => setSearchTerm(tag)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                tag === searchTerm
                  ? "bg-storiq-purple text-white"
                  : "bg-storiq-card-bg border border-storiq-border text-white hover:bg-storiq-purple/20"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
        <div className="mb-8">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center space-x-2 text-white hover:text-storiq-purple transition-colors mb-4"
          >
            <span className="font-medium">Advanced Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </button>

          {showAdvancedFilters && (
            <div className="bg-storiq-card-bg border border-storiq-border rounded-2xl p-6 space-y-6">
              {/* Filter Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sorting */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Sorting order</label>
                  <Select defaultValue="most-relevant">
                    <SelectTrigger className="bg-storiq-dark border-storiq-border text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-storiq-card-bg border-storiq-border">
                      <SelectItem value="most-relevant" className="text-white hover:bg-storiq-purple/20">Most relevant</SelectItem>
                      <SelectItem value="most-recent" className="text-white hover:bg-storiq-purple/20">Most recent</SelectItem>
                      <SelectItem value="most-popular" className="text-white hover:bg-storiq-purple/20">Most popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Hashtags */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Must include one of those hashtags</label>
                  <Select defaultValue="select-options">
                    <SelectTrigger className="bg-storiq-dark border-storiq-border text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-storiq-card-bg border-storiq-border">
                      <SelectItem value="select-options" className="text-white hover:bg-storiq-purple/20">Select options ...</SelectItem>
                      <SelectItem value="startup" className="text-white hover:bg-storiq-purple/20">#startup</SelectItem>
                      <SelectItem value="business" className="text-white hover:bg-storiq-purple/20">#business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Minimum likes */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Minimum number of likes</label>
                  <Input
                    type="number"
                    defaultValue="0"
                    className="bg-storiq-dark border-storiq-border text-white"
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Language</label>
                  <Select defaultValue="english">
                    <SelectTrigger className="bg-storiq-dark border-storiq-border text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-storiq-card-bg border-storiq-border">
                      <SelectItem value="english" className="text-white hover:bg-storiq-purple/20">English</SelectItem>
                      <SelectItem value="spanish" className="text-white hover:bg-storiq-purple/20">Spanish</SelectItem>
                      <SelectItem value="french" className="text-white hover:bg-storiq-purple/20">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Posting Time Slider */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Posting Time</label>
                <p className="text-white/60 text-sm mb-4">Filter videos by creation date</p>
                <div className="relative">
                  <Slider defaultValue={[25, 75]} max={100} step={1} className="w-full" />
                  <div className="flex justify-between mt-2 text-sm text-white/60">
                    <span>From: 2024/02/05</span>
                    <span>To: 2025/08/05</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Video Results */}
        {loading ? (
          <p className="text-white">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {videoResults.map((video) => (
              <div
                key={video.id}
                className="bg-storiq-card-bg border border-storiq-border rounded-2xl overflow-hidden hover:border-storiq-purple/50 transition-colors cursor-pointer"
                onClick={() => handleVideoClick(video)}
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-[3/4] bg-gradient-to-br from-orange-500/20 to-red-500/20">
                <img src={video.thumbnail} alt={video.title} className="absolute inset-0 w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-black/20"></div>
                  
                  {/* Platform Badge */}
                  <div className="absolute top-3 left-3 flex items-center space-x-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                    <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                      <span className="text-xs font-bold text-black">▶</span>
                    </div>
                    {/* <span className="text-white text-xs font-medium">{video.platform}</span> */}
                  </div>

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-1" fill="white" />
                    </div>
                  </div>

                  {/* Video Title */}
                  {/* {video.title && (
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2">
                        <p className="text-white text-sm font-bold leading-tight">{video.title}</p>
                        {video.subtitle && (
                          <p className="text-white/80 text-xs mt-1">{video.subtitle}</p>
                        )}
                      </div>
                    </div>
                  )} */}

                  {/* Author */}
                  {video.author && (
                    <div className="absolute bottom-16 left-3">
                      <p className="text-white text-xs font-medium">{video.author}</p>
                    </div>
                  )}
                </div>

                {/* Video Stats */}
                <div className="p-4">
                  <div className="flex items-center justify-between text-white/60 text-sm">
                    <div className="flex items-center space-x-1">
                      <Play className="w-4 h-4" />
                      <span>{video.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{video.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{video.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Playback Modal */}
        <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
          <DialogContent className="sm:max-w-[600px] bg-storiq-card-bg border-storiq-border text-white">
  <DialogHeader>
    <DialogTitle>{selectedVideo?.title}</DialogTitle>
    <DialogDescription>
      {selectedVideo?.platform} - {selectedVideo?.views} views
    </DialogDescription>
  </DialogHeader>

  {selectedVideo?.id && (
    <div className="relative aspect-video w-full rounded-lg overflow-hidden">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${selectedVideo.id}`}
        title={selectedVideo.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )}
</DialogContent>

        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default SearchVideos;
