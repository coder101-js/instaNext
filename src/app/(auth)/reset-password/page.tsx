
"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";


function ResetPasswordFormComponent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
      });
      return;
    }
    if (!token) {
        toast({
            variant: "destructive",
            title: "Invalid or missing reset token.",
        });
        return;
    }

    setIsResetting(true);
    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reset password.");
      }
      
      toast({
        title: "Password Reset Successful",
        description: "You can now log in with your new password.",
      });
      router.push("/login");

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsResetting(false);
    }
  };
  
  if (!token) {
      return (
           <Card className="w-full max-w-sm">
               <CardHeader>
                   <CardTitle>Invalid Token</CardTitle>
                   <CardDescription>
                       The password reset link is invalid or has expired. Please request a new one.
                   </CardDescription>
               </CardHeader>
           </Card>
      )
  }

  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isResetting}>
            {isResetting ? "Resetting..." : "Reset Password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function ResetPasswordPageSkeleton() {
    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
              <CardDescription><Skeleton className="h-4 w-full" /></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password"><Skeleton className="h-4 w-24" /></Label>
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm-password"><Skeleton className="h-4 w-32" /></Label>
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<ResetPasswordPageSkeleton />}>
            <ResetPasswordFormComponent />
        </Suspense>
    )
}
