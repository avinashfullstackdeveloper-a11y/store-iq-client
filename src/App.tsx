import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Tools from "./pages/Tools";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./components/HeroSection";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/dashboard/Dashboard";
import Stats from "./pages/dashboard/Stats";
import Publish from "./pages/dashboard/Publish";
import Videos from "./pages/dashboard/Videos";
import Exports from "./pages/dashboard/Exports";
import Scripts from "./pages/dashboard/Scripts";
import Settings from "./pages/dashboard/Settings";
import CreateVideo from "./pages/dashboard/CreateVideo";
import SearchVideos from "./pages/dashboard/SearchVideos";
import VideoEditor from "./pages/dashboard/VideoEditor";

import { AuthProvider } from "./context/AuthContext";
import { LoaderProvider } from "./context/LoaderContext";

import TextToSpeech from "./pages/dashboard/Aitextmounting";
import AIToolsPage from "./pages/dashboard/AItools";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LoaderProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/stats" element={<Stats />} />
              <Route path="/dashboard/publish" element={<Publish />} />
              <Route path="/dashboard/videos" element={<Videos />} />
              <Route path="/dashboard/exports" element={<Exports />} />
              <Route path="/dashboard/scripts" element={<Scripts />} />
              <Route path="/dashboard/settings" element={<Settings />} />
              <Route path="/dashboard/create-video" element={<CreateVideo />} />
              <Route path="/dashboard/aitextmounting" element={<TextToSpeech/>} />
              <Route path="/dashboard/aitools" element={<AIToolsPage/>} />


              <Route
                path="/dashboard/search-videos"
                element={<SearchVideos />}
              />
              <Route path="/Home" element={<Home />} />{" "}
              {/* The path is "/Home" */}
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/dashboard/video-editor/*" element={<VideoEditor />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </LoaderProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
