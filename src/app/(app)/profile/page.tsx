"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user } = useUser();

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Profile</CardTitle>
        <CardDescription>Your account details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border">
            {user?.photoURL && (
              <AvatarImage
                src={user.photoURL}
                alt={user.displayName || "User avatar"}
              />
            )}
            <AvatarFallback className="text-2xl">
              {getInitials(user?.displayName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">
              {user?.displayName || "Anonymous User"}
            </h2>
            <p className="text-muted-foreground">{user?.email}</p>
            <p className="text-muted-foreground">{user?.phoneNumber}</p>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">User ID</h3>
          <p className="text-sm font-mono bg-muted/50 p-2 rounded-md">
            {user?.uid}
          </p>
        </div>
        <Button>Edit Profile</Button>
      </CardContent>
    </Card>
  );
}
