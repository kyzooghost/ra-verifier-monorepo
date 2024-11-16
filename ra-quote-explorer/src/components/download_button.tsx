"use client";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

export const DownloadButton = ({
  url,
  name,
  isAvailable = true,
}: { url?: string; name: string; isAvailable: boolean }) => {
  const handleDownload = async () => {
    if (!url) {
      return;
    }
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={!isAvailable}
      variant="outline"
      className="w-40"
    >
      {isAvailable ? (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download
        </>
      ) : (
        "raw quote unavailable"
      )}
    </Button>
  );
};
