"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateImageCaption } from "@/ai/flows/generate-image-caption";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CreatePostPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleGenerateCaption = async () => {
    if (!imageDataUri) {
      toast({
        variant: "destructive",
        title: "No image selected",
        description: "Please upload an image first.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateImageCaption({ photoDataUri: imageDataUri });
      setCaption(result.caption);
      toast({
        title: "Caption Generated!",
        description: "AI has suggested a caption for your post.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate caption.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    // Mock sharing
     toast({
        title: "Post Shared!",
        description: "Your post is now live (on this mock app).",
      });
     router.push("/");
  }

  return (
    <div className="container mx-auto max-w-3xl p-4 sm:p-8 flex items-center justify-center min-h-full">
      <Card className="w-full">
        <CardHeader>
            <CardTitle className="text-3xl font-bold font-headline">Create New Post</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 bg-secondary/50 h-[300px] md:h-[400px]">
            {imagePreview ? (
              <div className="relative w-full h-full">
                <Image src={imagePreview} alt="Image preview" fill objectFit="contain" />
              </div>
            ) : (
                <div className="text-center text-muted-foreground">
                    <Upload className="mx-auto h-12 w-12" />
                    <p className="mt-2">Upload a photo</p>
                    <Label htmlFor="file-upload" className="mt-4 inline-block cursor-pointer text-primary font-semibold hover:underline">
                        Select from computer
                    </Label>
                    <Input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                </div>
            )}
          </div>
          <div className="space-y-4 flex flex-col">
            <Textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="flex-grow h-48"
            />
            <Button onClick={handleGenerateCaption} disabled={isGenerating || !imagePreview}>
              <Sparkles className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate AI Caption"}
            </Button>
            <Button onClick={handleShare} disabled={!imagePreview || !caption}>Share Post</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
