"use client";

import type React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useDebounce } from "use-debounce";
import {
  Upload,
  ImageIcon,
  Download,
  RefreshCw,
  Loader,
  Plus,
  GitCompareArrows,
  Stars,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { CarouselPlugin } from "@/components/carosal";

const PRESET_COLORS = [
  "transparent",
  "#FF4136", // Red
  "#FF6B6B", // Pink
  "#B10DC9", // Purple
  "#6B5B95", // Dark Purple
  "#4A90E2", // Blue
  "#39CCCC", // Cyan
  "#2ECC40", // Green
  "#FFDC00", // Yellow
  "#FF851B", // Orange
  "#FFFFFF", // White
  "#AAAAAA", // Gray
  "#111111", // Black
];

const SAMPLE_BACKGROUNDS = [
  "/backgrounds/1.jpg",
  "/backgrounds/2.jpg",
  "/backgrounds/3.jpg",
  "/backgrounds/4.jpg",
  "/backgrounds/5.jpg",
  "/backgrounds/6.jpg",
  "/backgrounds/7.jpg",
];

export default function BGRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bgColor, setBgColor] = useState("transparent");
  const [blurAmount, setBlurAmount] = useState(0);
  const [isBlurMode, setIsBlurMode] = useState(false);
  const [showBgDialog, setShowBgDialog] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [compareValue, setCompareValue] = useState(100);
  const [isComparing, setIsComparing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [debouncedCompareValue] = useDebounce(compareValue, 200);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
        const objectURL = URL.createObjectURL(selectedFile);
        setImageUrl(objectURL);
        setResult(null);
        setBlurAmount(0);
        setIsComparing(false);
        handleRemoveBackground(selectedFile);
      }
    },
    []
  );

  const handleRemoveBackground = useCallback(
    async (file: File) => {
      if (!file) return;

      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("https://rembg.sj1.xyz/remove-bg/file/", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to remove background");
        }

        const blob = await response.blob();
        setResult(URL.createObjectURL(blob));
      } catch (error) {
        console.error("Error removing background:", error);
      } finally {
        setLoading(false);
      }
    },
    [file]
  );

  const handleBgImageSelect = (url: string) => {
    setBgImage(url);
    setIsBlurMode(false);
  };

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImage(reader.result as string);
        setShowBgDialog(false);
        setIsBlurMode(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderImage = useCallback(() => {
    if (!result || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.src = src;
      });
    };

    const draw = async () => {
      try {
        const fgImage = await loadImage(result);
        canvas.width = fgImage.width;
        canvas.height = fgImage.height;

        if (isBlurMode && preview) {
          const blurBg = await loadImage(preview);
          ctx.filter = `blur(${blurAmount}px)`;
          ctx.drawImage(blurBg, 0, 0, canvas.width, canvas.height);
          ctx.filter = "none";
        } else if (bgImage) {
          const bgImg = await loadImage(bgImage);
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(fgImage, 0, 0, canvas.width, canvas.height);

        if (isComparing) {
          const originalImg = await loadImage(preview!);
          const width = (debouncedCompareValue / 100) * canvas.width;

          ctx.drawImage(
            originalImg,
            width,
            0,
            canvas.width - width,
            canvas.height,
            width,
            0,
            canvas.width - width,
            canvas.height
          );

          ctx.strokeStyle = "white";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(width, 0);
          ctx.lineTo(width, canvas.height);
          ctx.stroke();

          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.arc(width, canvas.height / 2, 10, 0, 2 * Math.PI);
          ctx.fill();

          ctx.fillStyle = "black";
          ctx.beginPath();
          ctx.moveTo(width - 5, canvas.height / 2);
          ctx.lineTo(width - 10, canvas.height / 2 - 5);
          ctx.lineTo(width - 10, canvas.height / 2 + 5);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(width + 5, canvas.height / 2);
          ctx.lineTo(width + 10, canvas.height / 2 - 5);
          ctx.lineTo(width + 10, canvas.height / 2 + 5);
          ctx.fill();
        }
      } catch (error) {
        console.error("Error rendering image:", error);
      }
    };

    draw();
  }, [
    result,
    bgColor,
    bgImage,
    isBlurMode,
    blurAmount,
    preview,
    isComparing,
    debouncedCompareValue,
  ]);

  useEffect(() => {
    renderImage();
  }, [renderImage, debouncedCompareValue]);

  const handleCompareChange = useCallback((value: number[]) => {
    setCompareValue(value[0]);
  }, []);

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isComparing || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;

      setCompareValue(percentage);

      const handleMouseMove = (e: MouseEvent) => {
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setCompareValue(percentage);
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [isComparing]
  );

  const handleDownload = useCallback(async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "removed_background.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleReset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setLoading(false);
    setBgColor("transparent");
    setBlurAmount(0);
    setIsBlurMode(false);
    setBgImage(null);
    setCompareValue(100);
    setIsComparing(false);
  }, []);

  return (
    <div className="min-h-screen relative  flex flex-col">
      <nav className="backdrop-blur-md shadow-sm  py-4 px-10 ">
        <div className=" mx-auto  ">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <ImageIcon className="h-8 w-8 text-primary" />
              <Link href={"/"} className="text-2xl font-semibold text-gray-900">
                BGRemover
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-10">
              <Link href="https://textbehindphoto.soorajrao.in?ref=bg-remove-header">
                <Button>
                  Try Text-Behind-Photo <Stars />
                </Button>
              </Link>
              <a
                className=" text-sm"
                href="https://soorajrao.in?ref=bg-remove-header"
              >
                Developed by
                <Button variant="link">Sooraj</Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex mt-20   gap-x-10  w-full justify-evenly items-center  ">
        {!preview ? (
          <div className=" flex flex-col items-center justify-center ">
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-10 left-10 h-72 w-72 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
              <div className="absolute bottom-10 right-10 h-80 w-80 bg-pink-400/30 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            </div>

            <div className="relative w-screen  mt-32 -ml-20  backdrop-blur-md rounded-2xl  text-center ">
              <h1 className="text-5xl font-extrabold text-gray-900">
                <span className="bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                  Remove Image Background
                </span>
              </h1>
              <p className="mt-4 text-lg text-gray-700">
                100% Automatically and Free
              </p>

              <div className="mt-8">
                <label className="cursor-pointer inline-block">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  <div className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-105">
                    <Upload className="w-5 h-5 text-white" />
                    <span>Upload Image</span>
                  </div>
                </label>
              </div>
            </div>
            <p className=" absolute top-60 h-40 rotate-45 left-52 shadow-[0px_0px_100px_100px_pink]"></p>
            <p className=" absolute bottom-60 h-40 rotate-45 right-52 shadow-[0px_0px_100px_100px_pink]"></p>
            <img
              className="absolute  left-10 bottom-10 h-64 w-96 object-cover rounded-2xl shadow-lg"
              src="/hero/1.png"
              alt="Before & After 1"
            />
            <img
              className="absolute  right-10 top-20 h-56 w-96 object-cover rounded-lg shadow-lg"
              src="/hero/2.png"
              alt="Before & After 2"
            />
          </div>
        ) : (
          <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative ">
                {loading && (
                  <div>
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-200 animate-pulse  text-white">
                      <p className="flex gap-x-2 bg-black/50 p-2 rounded-lg">
                        Processing image
                        <Loader className="animate-spin" />
                      </p>
                    </div>
                  </div>
                )}

                <canvas
                  ref={canvasRef}
                  className="max-h-[30rem]  border w-full scale-90 overflow-hidden object-cover"
                  onMouseDown={handleCanvasMouseDown}
                />
              </div>

              {result && (
                <div className="p-4 border mt-4">
                  <div className="flex items-center justify-center  gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsComparing(!isComparing)}
                      className="flex-1 w-fit"
                    >
                      <GitCompareArrows />
                      {isComparing ? "Exit Compare" : "Compare"}
                    </Button>
                    {isComparing && (
                      <div className="flex-1">
                        <Slider
                          value={[compareValue]}
                          onValueChange={handleCompareChange}
                          min={0}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <h2
                  className={`text-2xl  font-semibold ${
                    !result && " h-7 rounded-md animate-pulse bg-gray-200"
                  }`}
                >
                  {result ? "Image Settings" : ""}
                </h2>

                <>
                  <div className="space-y-4 bg-white/10 backdrop-blur-md  rounded-lg">
                    <div className="flex items-center justify-between">
                      {!result ? (
                        <p className=" h-7 rounded-md w-full animate-pulse bg-gray-200"></p>
                      ) : (
                        <>
                          <Label className="">Blur Background:</Label>
                          <Switch
                            checked={isBlurMode}
                            onCheckedChange={(checked: boolean) => {
                              setIsBlurMode(checked);
                              if (checked) {
                                setBgImage(null);
                                setBgColor("transparent");
                              }
                            }}
                          />
                        </>
                      )}
                    </div>

                    {isBlurMode ? (
                      <div>
                        <Label className="">Blur Amount</Label>
                        <Slider
                          min={0}
                          max={20}
                          step={0.1}
                          value={[blurAmount]}
                          onValueChange={(value: number[]) =>
                            setBlurAmount(value[0])
                          }
                          className="mt-2"
                        />
                      </div>
                    ) : (
                      <>
                        {!result ? (
                          <p className=" h-7 rounded-md w-full animate-pulse bg-gray-200"></p>
                        ) : (
                          <div className="flex items-center justify-between">
                            <Label className="">Change Background</Label>
                            <Switch
                              checked={showBgDialog}
                              onCheckedChange={(checked: boolean) => {
                                setShowBgDialog(checked);
                                if (checked) {
                                  setIsBlurMode(false);
                                } else {
                                  setBgColor("white");
                                }
                              }}
                            />
                          </div>
                        )}

                        <div
                          className={`    overflow-hidden duration-500   ${
                            showBgDialog ? "h-80 " : "h-0 "
                          }`}
                        >
                          <Tabs defaultValue="photo">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="photo">Photo</TabsTrigger>
                              <TabsTrigger value="color">Color</TabsTrigger>
                            </TabsList>
                            <TabsContent value="photo" className="space-y-4">
                              <div className="grid grid-cols-5 gap-4">
                                <label className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400">
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleCustomBgUpload}
                                    accept="image/*"
                                  />
                                  <Plus className="w-8 h-8 text-gray-400" />
                                </label>
                                {SAMPLE_BACKGROUNDS.map((bg, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleBgImageSelect(bg)}
                                    className="relative  aspect-square  rounded-lg overflow-hidden border-2 hover:border-primary"
                                  >
                                    <img
                                      src={bg || "/placeholder.svg"}
                                      alt={`Background ${index + 1}`}
                                      className="object-cover "
                                    />
                                  </button>
                                ))}
                              </div>
                            </TabsContent>
                            <TabsContent
                              value="color"
                              className="grid grid-cols-6 gap-2"
                            >
                              {PRESET_COLORS.map((color) => (
                                <button
                                  key={color}
                                  onClick={() => {
                                    setBgColor(color);
                                    setBgImage(null);
                                  }}
                                  className="aspect-square text-xs rounded-lg border-2 hover:border-primary"
                                  style={{
                                    background:
                                      color === "transparent"
                                        ? "repeating-codepoint-pattern(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee) 0 0/20px 20px"
                                        : color,
                                  }}
                                >
                                  {color === "transparent" && "transparent"}
                                </button>
                              ))}
                            </TabsContent>
                          </Tabs>
                        </div>
                      </>
                    )}
                  </div>
                  {result && (
                    <Button onClick={handleDownload} className="w-full">
                      <Download className="mr-2" />
                      Download Image
                    </Button>
                  )}
                </>

                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="mr-2" />
                  Upload new
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
