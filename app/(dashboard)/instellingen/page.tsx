"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Building2, Mail, Settings } from "lucide-react";

export default function InstellingenPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const form = useForm({
    defaultValues: {
      bedrijfsnaam: "",
      kvk_nummer: "",
      btw_nummer: "",
      adres: "",
      telefoon: "",
      email: "",
      website: "",
      iban: "",
      betalingsvoorwaarden: "",
      zoho_email: "",
      zoho_password: "",
    },
  });

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        form.reset(data);
        setLoadingSettings(false);
      })
      .catch(console.error);
  }, [form]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      toast({
        title: "Instellingen opgeslagen",
        description: "Je instellingen zijn succesvol bijgewerkt.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Er is een fout opgetreden bij het opslaan.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingSettings) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instellingen</h1>
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Instellingen</h1>
        <p className="text-muted-foreground">
          Beheer uw bedrijfsgegevens en systeeminstellingen
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="bedrijf" className="space-y-4">
            <TabsList>
              <TabsTrigger value="bedrijf">
                <Building2 className="mr-2 h-4 w-4" />
                Bedrijfsgegevens
              </TabsTrigger>
              <TabsTrigger value="zoho">
                <Mail className="mr-2 h-4 w-4" />
                Zoho Mail
              </TabsTrigger>
              <TabsTrigger value="systeem">
                <Settings className="mr-2 h-4 w-4" />
                Systeeminstellingen
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bedrijf">
              <Card>
                <CardHeader>
                  <CardTitle>Bedrijfsgegevens</CardTitle>
                  <CardDescription>
                    Deze gegevens verschijnen op je offertes en facturen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="bedrijfsnaam"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrijfsnaam</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="kvk_nummer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>KVK Nummer</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="btw_nummer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>BTW Nummer</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="iban"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IBAN</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="adres"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Adres</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telefoon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefoon</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="zoho">
              <Card>
                <CardHeader>
                  <CardTitle>Zoho Mail Configuratie</CardTitle>
                  <CardDescription>
                    Configureer je Zoho Mail account voor het versturen van offertes en facturen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="zoho_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zoho Email Adres</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="jouw@email.com" />
                        </FormControl>
                        <FormDescription>
                          Je volledige Zoho Mail emailadres
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="zoho_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zoho Wachtwoord of App Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormDescription>
                          Je Zoho Mail wachtwoord of een app-specific password
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-lg bg-blue-50 p-4 text-sm">
                    <h4 className="font-medium mb-2">ℹ️ Hoe configureer je Zoho Mail?</h4>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Log in op je Zoho Mail account</li>
                      <li>Ga naar Account Settings → Security</li>
                      <li>Schakel "Allow access to less secure apps" in (indien nodig)</li>
                      <li>Of maak een App-Specific Password aan voor extra beveiliging</li>
                      <li>Vul je email en wachtwoord/app-password hierboven in</li>
                      <li>Klik op "Opslaan" onderaan de pagina</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="systeem">
              <Card>
                <CardHeader>
                  <CardTitle>Systeeminstellingen</CardTitle>
                  <CardDescription>
                    Standaard instellingen voor offertes en facturen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="betalingsvoorwaarden"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Betalingsvoorwaarden</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} />
                        </FormControl>
                        <FormDescription>
                          Deze tekst verschijnt onderaan je facturen
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? "Opslaan..." : "Instellingen Opslaan"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
