import { ofetch } from "ofetch";
import { File } from "formdata-node";

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hex = searchParams.get("hex")!;
    const data = hexToUint8Array(hex);
    const blob = new Blob([data], { type: "application/octet-stream" });
    const file = new File([blob], "quote.bin", {
      type: "application/octet-stream",
    });
    const formData = new FormData();
    formData.append("file", file);

    const response = await ofetch(
      `${process.env.API_PREFIX}/api/attestations/verify`,
      {
        method: "POST",
        body: formData,
      },
    );
    if (response.success && response.checksum) {
      return new Response("", {
        status: 301,
        headers: { location: `/reports/${response.checksum}` },
      });
    }
  } catch (_) {}
  return new Response("Bad Request", { status: 400 });
}
