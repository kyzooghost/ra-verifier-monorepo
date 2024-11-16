"use client";

import { useState } from "react";
import { AlertCircle, Upload } from "lucide-react";
import { ofetch } from "ofetch";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

function hexToUint8Array(hex: string) {
  hex = hex.trim();
  if (!hex) {
    throw new Error("Invalid hex string");
  }
  if (hex.startsWith("0x")) {
    hex = hex.substring(2);
  }
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }

  const array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    if (isNaN(byte)) {
      throw new Error("Invalid hex string");
    }
    array[i / 2] = byte;
  }
  return array;
}

async function uploadUint8Array(data: Uint8Array) {
  const blob = new Blob([data], { type: "application/octet-stream" });
  const file = new File([blob], "quote.bin", {
    type: "application/octet-stream",
  });
  const formData = new FormData();
  formData.append("file", file);

  // return await ofetch("https://ra-quote-explorer.vercel.app/api/upload", {
  return await ofetch("/api/upload", {
    method: "POST",
    body: formData,
    headers: {
      'Referer': '',
    }
  });
}

async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  // return await ofetch("https://ra-quote-explorer.vercel.app/api/upload", {
  return await ofetch("/api/upload", {
    method: "POST",
    body: formData,
  });
}

export function QuoteUpload() {
  const [hex, setHex] = useState("");
  const [hasError, setHasError] = useState(false);
  const router = useRouter();
  return (
    <form>
      <Tabs defaultValue="hex" className="">
        <TabsList>
          <TabsTrigger value="hex" onClick={() => setHasError(false)}>
            Hex Quote
          </TabsTrigger>
          <TabsTrigger value="file" onClick={() => setHasError(false)}>
            Upload the Quote File
          </TabsTrigger>
        </TabsList>
        <TabsContent value="hex">
          <Card>
            <CardHeader>
              <CardTitle>Hex Quote</CardTitle>
              <CardDescription>
                You can paste the hex text of the attestation quote here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {hasError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>The quote is invalid.</AlertDescription>
                </Alert>
              ) : null}

              <div className="space-y-1">
                <Textarea
                  rows={10}
                  className="font-mono"
                  onChange={(e) => setHex(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={async (evt) => {
                  evt.preventDefault();
                  try {
                    const data = hexToUint8Array(hex);
                    const { success, checksum } = await uploadUint8Array(data);
                    if (success) {
                      router.push(`/reports/${checksum}`);
                    } else {
                      setHasError(true);
                    }
                  } catch (error) {
                    console.error(error);
                  }
                }}
              >
                Verify
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="file">
          <Card>
            <CardHeader>
              <CardTitle>Upload the Quote File</CardTitle>
              <CardDescription>
                You can upload the attestation quote file here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {hasError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>The quote is invalid.</AlertDescription>
                </Alert>
              ) : null}
              <div className="space-y-1">
                <input
                  type="file"
                  id="attestation-file"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const { success, checksum } = await uploadFile(file);
                        if (success) {
                          router.push(`/reports/${checksum}`);
                        } else {
                          setHasError(true);
                        }
                      } catch (error) {
                        console.error(error);
                      }
                    }
                  }}
                />
                <Button asChild>
                  <label htmlFor="attestation-file">
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Attestation Quote
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
