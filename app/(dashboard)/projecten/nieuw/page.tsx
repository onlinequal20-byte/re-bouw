"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const projectSchema = z.object({
  naam: z.string().min(1, "Projectnaam is verplicht"),
  locatie: z.string().optional(),
  klantId: z.string().min(1, "Klant is verplicht"),
  status: z.string().default("Actief"),
  notities: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function NieuwProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [klanten, setKlanten] = useState<any[]>([]);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      naam: "",
      locatie: "",
      klantId: "",
      status: "Actief",
      notities: "",
    },
  });

  useEffect(() => {
    fetch("/api/klanten")
      .then(res => res.json())
      .then(data => setKlanten(data))
      .catch(console.error);
  }, []);

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/projecten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const project = await response.json();

      toast({
        title: "Project aangemaakt",
        description: `Project ${project.projectNummer} is succesvol aangemaakt.`,
      });

      router.push(`/projecten/${project.id}`);
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Er is een fout opgetreden bij het aanmaken van het project.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projecten">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nieuw Project</h1>
          <p className="text-muted-foreground">
            Maak een nieuw project aan
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Projectgegevens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="klantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Klant *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecteer een klant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {klanten.map(klant => (
                            <SelectItem key={klant.id} value={klant.id}>
                              {klant.naam}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="naam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Projectnaam *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Badkamerrenovatie" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locatie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Locatie</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Straatnaam 123, Amsterdam" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Actief">Actief</SelectItem>
                          <SelectItem value="Afgerond">Afgerond</SelectItem>
                          <SelectItem value="Geannuleerd">Geannuleerd</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notities</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notities"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea {...field} rows={4} placeholder="Extra opmerkingen over het project..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Opslaan..." : "Project Aanmaken"}
            </Button>
            <Link href="/projecten">
              <Button type="button" variant="outline">
                Annuleren
              </Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
