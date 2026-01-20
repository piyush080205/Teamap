import { ReportIncidentForm } from "@/components/report-incident-form";
import { Card, CardContent } from "@/components/ui/card";

export default function ReportPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold">Report an Incident</h1>
        <p className="text-muted-foreground">
          Your report helps keep the community safe. Please provide as much
          detail as possible.
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <ReportIncidentForm />
        </CardContent>
      </Card>
    </>
  );
}
