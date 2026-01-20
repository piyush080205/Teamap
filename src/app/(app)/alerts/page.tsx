import { incidents } from "@/lib/data";
import { IncidentCard } from "@/components/incident-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListFilter } from "lucide-react";

export default function AlertsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold">Nearby Alerts</h1>
        <div className="flex items-center gap-2">
          <ListFilter className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
          <Select defaultValue="distance">
            <SelectTrigger className="w-full sm:w-[180px] bg-card">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="time">Most Recent</SelectItem>
              <SelectItem value="severity">Severity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {incidents.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}
        {incidents.map((incident) => (
          <IncidentCard key={`${incident.id}-2`} incident={{...incident, id: `${incident.id}-2`}} />
        ))}
      </div>
    </div>
  );
}
