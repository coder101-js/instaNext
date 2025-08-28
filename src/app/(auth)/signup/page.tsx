"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, KeyboardEvent, ChangeEvent } from "react";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const router = useRouter();
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd send an OTP here.
    toast({
      title: "OTP Sent (Mock)",
      description: "For this demo, please use OTP: 123456",
    });
    setStep(2);
  };
  
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    // Mock OTP verification
    if (enteredOtp === "123456") {
      toast({
        title: "Success!",
        description: "Your account has been created. Please log in.",
      });
      router.push("/login");
    } else {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "The OTP you entered is incorrect. Please try again.",
      });
      setOtp(new Array(6).fill(""));
      inputRefs.current[0]?.focus();
    }
  };

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus on next input
    if (element.nextSibling && element.value) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleOtpKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && inputRefs.current[index - 1]) {
        inputRefs.current[index-1]!.focus();
    }
  }


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
        <form onSubmit={handleOtpSubmit} className="animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Verify Email</CardTitle>
            <CardDescription>Enter the OTP sent to your email.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">One-Time Password</Label>
              <div className="flex justify-center gap-2">
                {otp.map((data, index) => {
                  return (
                    <Input
                      key={index}
                      type="text"
                      maxLength={1}
                      className="w-12 h-12 text-center text-lg font-semibold"
                      value={data}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleOtpChange(e.target, index)}
                      onFocus={e => e.target.select()}
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleOtpKeyDown(e, index)}
                      ref={el => inputRefs.current[index] = el}
                    />
                  );
                })}
              </div>
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
