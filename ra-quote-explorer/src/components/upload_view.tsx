import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { QuoteUpload } from "@/components/quote_upload";

export function UploadView() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          TEE Attestation Explorer
        </h1>
        <p className="mt-5 text-xl text-gray-500">
          Verify and analyze Intel SGX and TD attestation reports with precision
        </p>
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Submit Attestation Report</CardTitle>
          <CardDescription>
            Upload your attestation quote as a binary file or hex text
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuoteUpload />
        </CardContent>
      </Card>
    </div>
  );
}
