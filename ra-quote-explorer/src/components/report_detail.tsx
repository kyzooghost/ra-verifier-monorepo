import {
  Cpu,
  Lock,
  Calendar,
  Shield,
  ShieldOff,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { DownloadButton } from "@/components/download_button";
import { cn } from "@/lib/utils";
import { type TDXQuote } from "@/types";
import { TimeDisplay } from './time_display'

const DcapVerificationStatus = ({ isVerified }: { isVerified: boolean }) => {
  return (
    <Alert
      variant={isVerified ? "default" : "destructive"}
      className={cn("mb-8", isVerified ? "bg-green-50" : "bg-yellow-50")}
    >
      <div className="flex items-center gap-3">
        {isVerified ? (
          <Shield className="h-5 w-5 text-green-500" />
        ) : (
          <ShieldOff className="h-5 w-5 text-red-500" />
        )}
        <div>
          <AlertTitle className="text-base font-semibold">
            {isVerified ? "VERIFIED" : "UNVERIFIED"}
          </AlertTitle>
          <AlertDescription className="text-sm mt-1">
            {isVerified
              ? "Quote has passed TEE environment DCAP verification and is safe to use."
              : "Quote failed DCAP verification. Please check TEE environment configuration."}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export function ReportDetail({ report }: { report: TDXQuote }) {
  return (
    <>
      <DcapVerificationStatus isVerified={report.verified} />

      <Card className="mb-8 relative">
        <CardHeader>
          <CardTitle>Report Overview</CardTitle>
          <CardDescription>
            Key information about the analyzed report
          </CardDescription>
          <div className="md:absolute top-4 right-6">
            <DownloadButton
              url={`/raw/${report.checksum}`}
              name={`${report.checksum}.bin`}
              isAvailable={!!report.can_download}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Shield className="mr-2 h-5 w-5 text-blue-500" />
              <span>Version: {report.header.version}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-green-500" />
              <span>AK Type: {report.header.ak_type}</span>
            </div>
            <div className="flex items-center">
              <Cpu className="mr-2 h-5 w-5 text-purple-500" />
              <span>TEE Type: {report.header.tee_type}</span>
            </div>
            <div className="flex items-center">
              <Lock className="mr-2 h-5 w-5 text-red-500" />
              <span>Uploaded At: <TimeDisplay isoString={report.uploaded_at} /></span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Body Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attribute</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(report.body).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell className="font-mono">{key}</TableCell>
                  <TableCell className="font-mono break-all">{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {report.cert_data ? (
        <Card>
          <CardHeader>
            <CardTitle>Certificate Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="font-mono break-all max-w-full overflow-x-scroll">{report.cert_data}</pre>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
