"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/",
      });

      console.log("SignIn result:", result);

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Fout bij inloggen",
          description: "Onjuiste email of wachtwoord.",
        });
      } else if (result?.ok) {
        // Force a hard navigation to ensure cookies are properly set
        window.location.href = "/";
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fout bij inloggen",
        description: "Er is een fout opgetreden. Probeer het opnieuw.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 flex flex-col items-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-bold">AMS Bouwers B.V.</CardTitle>
            <CardDescription className="mt-2">
              Log in om toegang te krijgen tot het dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nader@amsbouwers.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Wachtwoord</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Inloggen..." : "Inloggen"}
            </Button>
            <div className="text-sm text-center text-muted-foreground mt-4">
              <p>Standaard inloggegevens:</p>
              <p className="font-mono text-xs mt-1">
                nader@amsbouwers.nl / Sharifi_1967
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

