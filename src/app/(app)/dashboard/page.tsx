import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { MapView } from "@/components/map-view";

export default function Dashboard() {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-headline text-2xl font-bold md:text-3xl">
          Live Incident Map
        </h1>
        <Link href="/report">
          <Button className="shrink-0">
            <Plus className="mr-2 h-4 w-4" /> Report Incident
          </Button>
        </Link>
      </div>
      <Card className="flex-1 -m-4 sm:-m-6">
        <CardContent className="h-[calc(100vh-100px)] p-0">
          <MapView />
        </CardContent>
      </Card>
    </>
  );
}
