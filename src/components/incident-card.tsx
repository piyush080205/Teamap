import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Incident } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Check, HelpCircle, ShieldAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

const severityVariantMap = {
  Critical: "destructive",
  Warning: "default",
  Info: "secondary",
} as const;

export function IncidentCard({ incident }: { incident: Incident }) {
  const timeAgo = formatDistanceToNow(new Date(incident.timestamp), {
    addSuffix: true,
  });

  return (
    <Card className="flex flex-col bg-card hover:bg-muted/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="font-headline text-lg">{incident.type}</CardTitle>
          <Badge
            variant={severityVariantMap[incident.severity]}
            className="shrink-0"
          >
            {incident.severity}
          </Badge>
        </div>
        <CardDescription>{incident.address}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-foreground/80 line-clamp-3">
          {incident.description}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={incident.user.avatarUrl} alt={incident.user.name} />
              <AvatarFallback>{incident.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{incident.user.name}</span>
          </div>
          <span>{timeAgo}</span>
        </div>
        <div className="w-full space-y-2 pt-4 border-t">
          <p className="text-xs font-semibold text-muted-foreground">
            IS THIS ACCURATE?
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm">
              <Check className="mr-1.5 h-4 w-4" /> Confirm
            </Button>
            <Button variant="outline" size="sm">
              <HelpCircle className="mr-1.5 h-4 w-4" /> Unsure
            </Button>
            <Button variant="outline" size="sm" className="hover:bg-destructive/10 hover:text-destructive">
              <X className="mr-1.5 h-4 w-4" /> False
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
