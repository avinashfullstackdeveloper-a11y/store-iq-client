import React, { useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import VideoGenerator from "./create-video/VideoGenerator";
import PromptGenerator from "./create-video/PromptGenerator";
import ImageGenerator from "./create-video/ImageGenerator";
import { Video, Image, Sparkles } from "lucide-react";

const tabIconClass =
  "w-4 h-4 mr-2 transition-transform duration-200 group-data-[state=active]:scale-110";

const CreateVideo = () => {
  const tabsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tabsList = tabsListRef.current;
    if (!tabsList) return;

    const triggers = Array.from(
      tabsList.querySelectorAll('[role="tab"]')
    ) as HTMLElement[];

    function updateSlider() {
      const active = triggers.find(
        (el) => el.getAttribute("aria-selected") === "true"
      );
      if (active && tabsList) {
        const idx = triggers.indexOf(active);
        let offset = 0;
        for (let i = 0; i < idx; i++) {
          offset += triggers[i].offsetWidth + 16; // 16px gap-4
        }
        tabsList.style.setProperty("--tab-slider-x", `${offset}px`);
        tabsList.style.setProperty(
          "--tab-slider-width",
          `${active.offsetWidth}px`
        );
      }
    }

    triggers.forEach((el) => el.addEventListener("click", updateSlider));
    // Also update on mount and on resize
    updateSlider();
    window.addEventListener("resize", updateSlider);

    return () => {
      triggers.forEach((el) => el.removeEventListener("click", updateSlider));
      window.removeEventListener("resize", updateSlider);
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="w-full min-h-screen">
        <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto mt-8">
          <Tabs defaultValue="video" className="w-full">
            <TabsList
              ref={tabsListRef}
              className="relative mb-8 bg-white/90 border border-gray-200 rounded-2xl p-2 flex gap-4 shadow-lg w-full max-w-2xl mx-auto backdrop-blur"
            >
              <TabsTrigger
                value="video"
                className="group flex-1 justify-center flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500
                  data-[state=active]:text-white data-[state=active]:shadow-lg
                  data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-500
                  hover:bg-blue-50 hover:text-blue-700"
              >
                <Video className={tabIconClass} />
                Video Generator
              </TabsTrigger>
              <TabsTrigger
                value="prompt"
                className="group flex-1 justify-center flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500
                  data-[state=active]:text-white data-[state=active]:shadow-lg
                  data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-500
                  hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
              >
                <Sparkles className={tabIconClass} />
                Prompt Generator
              </TabsTrigger>
              <TabsTrigger
                value="image"
                className="group flex-1 justify-center flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500
                  data-[state=active]:text-white data-[state=active]:shadow-lg
                  data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-500
                  hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
              >
                <Image className={tabIconClass} />
                Image Generator
              </TabsTrigger>
              {/* Animated slider indicator */}
              <div
                className="absolute left-0 top-0 h-full transition-transform duration-300 ease-in-out z-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 pointer-events-none"
                style={{
                  width: "var(--tab-slider-width, 0px)",
                  transform: "translateX(var(--tab-slider-x, 0px))",
                }}
                aria-hidden="true"
              />
            </TabsList>

            <div className="w-full">
              <TabsContent value="video" className="mt-0">
                <VideoGenerator />
              </TabsContent>
              <TabsContent value="prompt" className="mt-0">
                <PromptGenerator />
              </TabsContent>
              <TabsContent value="image" className="mt-0">
                <ImageGenerator />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateVideo;
