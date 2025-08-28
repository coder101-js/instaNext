"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const router = useRouter();

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };
  
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock OTP verification
    toast({
      title: "Success!",
      description: "Your account has been created. Please log in.",
    });
    router.push("/login");
  };

  return (
    <Card className="w-full max-w-sm">
      {step === 1 && (
        <form onSubmit={handleDetailsSubmit}>
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-headline tracking-wider">InstaNext</CardTitle>
            <CardDescription>Create your account to continue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" placeholder="your_username" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="underline hover:text-primary">
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleOtpSubmit}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Verify Email</CardTitle>
            <CardDescription>Enter the OTP sent to your email.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">One-Time Password</Label>
              <Input id="otp" type="text" required maxLength={6} />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full">
              Verify
            </Button>
             <Button variant="link" size="sm" onClick={() => setStep(1)}>Back</Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
