
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import VideoGenerator from "./create-video/VideoGenerator";
import PromptGenerator from "./create-video/PromptGenerator";
import ImageGenerator from "./create-video/ImageGenerator";
import { Video, Image, Sparkles } from "lucide-react";

const tabIconClass =
  "w-4 h-4 mr-2 transition-transform duration-200 group-data-[state=active]:scale-110";

const CreateVideo = () => {
  return (
    <DashboardLayout>
      <div className="p-0 w-full min-h-screen flex justify-center">
        <div className="w-full max-w-5xl">
        <Tabs defaultValue="video" className="w-full">
          <TabsList
            className="mb-6 bg-muted/60 rounded-xl p-1 flex gap-2 shadow-sm w-full"
          >
            <TabsTrigger
              value="video"
              className="group flex-1 justify-center flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200
                data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                data-[state=active]:shadow-md
                data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground
                hover:bg-accent hover:text-accent-foreground"
            >
              <Video className={tabIconClass} />
              Video Generator
            </TabsTrigger>
            <TabsTrigger
              value="prompt"
              className="group flex-1 justify-center flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200
                data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                data-[state=active]:shadow-md
                data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground
                hover:bg-accent hover:text-accent-foreground"
            >
              <Sparkles className={tabIconClass} />
              Prompt Generator
            </TabsTrigger>
            <TabsTrigger
              value="image"
              className="group flex-1 justify-center flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200
                data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                data-[state=active]:shadow-md
                data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground
                hover:bg-accent hover:text-accent-foreground"
            >
              <Image className={tabIconClass} />
              Image Generator
            </TabsTrigger>
          </TabsList>
          <TabsContent value="video">
            <VideoGenerator />
          </TabsContent>
          <TabsContent value="prompt">
            <PromptGenerator />
          </TabsContent>
          <TabsContent value="image">
            <ImageGenerator />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateVideo;