import { ofetch } from "ofetch";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const response = await ofetch(
      `${process.env.API_PREFIX}/api/attestations/verify`,
      {
        method: "POST",
        body: formData,
      },
    );

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
