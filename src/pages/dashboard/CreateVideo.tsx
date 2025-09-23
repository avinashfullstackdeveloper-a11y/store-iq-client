
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import VideoGenerator from "./create-video/VideoGenerator";
import PromptGenerator from "./create-video/PromptGenerator";
import ImageGenerator from "./create-video/ImageGenerator";

const CreateVideo = () => {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <Tabs defaultValue="video" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="video">Video Generator</TabsTrigger>
            <TabsTrigger value="prompt">Prompt Generator</TabsTrigger>
            <TabsTrigger value="image">Image Generator</TabsTrigger>
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
    </DashboardLayout>
  );
};

export default CreateVideo;