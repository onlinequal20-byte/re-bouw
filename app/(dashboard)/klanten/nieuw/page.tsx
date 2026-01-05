"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const klantSchema = z.object({
  naam: z.string().min(1, "Naam is verplicht"),
  email: z.string().email("Ongeldig emailadres").optional().or(z.literal("")),
  telefoon: z.string().optional(),
  adres: z.string().optional(),
  postcode: z.string().optional(),
  plaats: z.string().optional(),
  kvkNummer: z.string().optional(),
  notities: z.string().optional(),
});

type KlantFormData = z.infer<typeof klantSchema>;

export default function NieuweKlantPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<KlantFormData>({
    resolver: zodResolver(klantSchema),
    defaultValues: {
      naam: "",
      email: "",
      telefoon: "",
      adres: "",
      postcode: "",
      plaats: "",
      kvkNummer: "",
      notities: "",
    },
  });

  const onSubmit = async (data: KlantFormData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/klanten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create klant");
      }

      toast({
        title: "Klant aangemaakt",
        description: "De klant is succesvol aangemaakt.",
      });

      router.push("/klanten");
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Er is een fout opgetreden bij het aanmaken van de klant.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/klanten">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nieuwe Klant</h1>
          <p className="text-muted-foreground">
            Voeg een nieuwe klant toe aan het systeem
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Klantgegevens</CardTitle>
          <CardDescription>
            Vul de gegevens van de nieuwe klant in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="naam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Naam *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Jan Jansen" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kvkNummer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>KVK Nummer</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="12345678" />
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
                        <Input {...field} type="email" placeholder="jan@voorbeeld.nl" />
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
                        <Input {...field} placeholder="0612345678" />
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
                        <Input {...field} placeholder="Straatnaam 123" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postcode</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="1234 AB" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plaats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plaats</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Amsterdam" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notities"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Notities</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Extra informatie over de klant..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Opslaan..." : "Klant Aanmaken"}
                </Button>
                <Link href="/klanten">
                  <Button type="button" variant="outline">
                    Annuleren
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
