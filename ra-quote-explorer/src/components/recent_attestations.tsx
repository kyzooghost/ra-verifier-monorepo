import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TimeDisplay } from './time_display'

export function RecentAttestations({
  items,
}: { items: { checksum: string; created_at: string }[] }) {
  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Recent Attestations</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Checksum</TableHead>
              <TableHead>Submit Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono">
                  <Link href={`/reports/${item.checksum}`}>
                    {item.checksum}
                  </Link>
                </TableCell>
                <TableCell><TimeDisplay isoString={item.created_at} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
