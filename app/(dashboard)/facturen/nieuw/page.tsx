"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

const factuurSchema = z.object({
  klantId: z.string().min(1, "Klant is verplicht"),
  projectNaam: z.string().min(1, "Projectnaam is verplicht"),
  projectLocatie: z.string().optional(),
  datum: z.string(),
  vervaldatum: z.string(),
  btwPercentage: z.coerce.number(),
  status: z.string(),
  betaaldBedrag: z.coerce.number().min(0),
  notities: z.string().optional(),
  items: z.array(
    z.object({
      omschrijving: z.string().min(1, "Omschrijving is verplicht"),
      aantal: z.coerce.number().positive("Aantal moet positief zijn"),
      eenheid: z.string().min(1, "Eenheid is verplicht"),
      prijsPerEenheid: z.coerce.number().positive("Prijs moet positief zijn"),
      totaal: z.coerce.number(),
    })
  ).min(1, "Minimaal 1 item is verplicht"),
});

type FactuurFormData = z.infer<typeof factuurSchema>;

export default function NieuweFactuurPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [klanten, setKlanten] = useState<any[]>([]);
  const [prijslijst, setPrijslijst] = useState<any[]>([]);

  const form = useForm<FactuurFormData>({
    resolver: zodResolver(factuurSchema),
    defaultValues: {
      klantId: "",
      projectNaam: "",
      projectLocatie: "",
      datum: new Date().toISOString().split('T')[0],
      vervaldatum: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      btwPercentage: 21,
      status: "Onbetaald",
      betaaldBedrag: 0,
      notities: "",
      items: [{ omschrijving: "", aantal: 1, eenheid: "stuks", prijsPerEenheid: 0, totaal: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    fetch("/api/klanten")
      .then(res => res.json())
      .then(data => setKlanten(data))
      .catch(console.error);
    
    fetch("/api/prijslijst")
      .then(res => res.json())
      .then(data => setPrijslijst(data))
      .catch(console.error);
  }, []);

  const calculateItemTotal = (index: number) => {
    const aantal = form.watch(`items.${index}.aantal`);
    const prijs = form.watch(`items.${index}.prijsPerEenheid`);
    const totaal = aantal * prijs;
    form.setValue(`items.${index}.totaal`, totaal);
  };

  const addPriceListItem = (prijsItem: any, index: number) => {
    form.setValue(`items.${index}.omschrijving`, prijsItem.omschrijving);
    form.setValue(`items.${index}.eenheid`, prijsItem.eenheid);
    form.setValue(`items.${index}.prijsPerEenheid`, prijsItem.prijsPerEenheid);
    calculateItemTotal(index);
  };

  const onSubmit = async (data: FactuurFormData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/facturen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create factuur");
      }

      const factuur = await response.json();

      toast({
        title: "Factuur aangemaakt",
        description: `Factuur ${factuur.factuurNummer} is succesvol aangemaakt.`,
      });

      router.push(`/facturen/${factuur.id}`);
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Er is een fout opgetreden bij het aanmaken van de factuur.",
      });
    } finally {
      setLoading(false);
    }
  };

  const items = form.watch("items");
  const subtotaal = items.reduce((sum, item) => sum + (item.totaal || 0), 0);
  const btwPercentage = form.watch("btwPercentage");
  const btwBedrag = subtotaal * (btwPercentage / 100);
  const totaal = subtotaal + btwBedrag;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/facturen">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nieuwe Factuur</h1>
          <p className="text-muted-foreground">
            Maak een nieuwe factuur aan voor een klant
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Algemene Gegevens</CardTitle>
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
                  name="projectNaam"
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
                  name="projectLocatie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Projectlocatie</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Straatnaam 123, Amsterdam" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="datum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Datum *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vervaldatum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vervaldatum *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="btwPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BTW *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="21">21%</SelectItem>
                          <SelectItem value="9">9%</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Onbetaald">Onbetaald</SelectItem>
                          <SelectItem value="Betaald">Betaald</SelectItem>
                          <SelectItem value="Gedeeltelijk betaald">Gedeeltelijk betaald</SelectItem>
                          <SelectItem value="Achterstallig">Achterstallig</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="betaaldBedrag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Betaald bedrag</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>Voeg items toe aan de factuur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.omschrijving`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Omschrijving *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Of selecteer uit prijslijst:" />
                          </FormControl>
                          <Select onValueChange={(value) => {
                            const item = prijslijst.find(p => p.id === value);
                            if (item) addPriceListItem(item, index);
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecteer uit prijslijst" />
                            </SelectTrigger>
                            <SelectContent>
                              {prijslijst.map(item => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.categorie} - {item.omschrijving} (€{item.prijsPerEenheid}/{item.eenheid})
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
                      name={`items.${index}.aantal`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aantal *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                calculateItemTotal(index);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.eenheid`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Eenheid *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="stuks">stuks</SelectItem>
                              <SelectItem value="m²">m²</SelectItem>
                              <SelectItem value="uur">uur</SelectItem>
                              <SelectItem value="project">project</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.prijsPerEenheid`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prijs per eenheid *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                calculateItemTotal(index);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.totaal`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Totaal</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ omschrijving: "", aantal: 1, eenheid: "stuks", prijsPerEenheid: 0, totaal: 0 })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Item toevoegen
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Berekening</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotaal:</span>
                  <span className="font-medium">€ {subtotaal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>BTW ({btwPercentage}%):</span>
                  <span className="font-medium">€ {btwBedrag.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Totaal:</span>
                  <span>€ {totaal.toFixed(2)}</span>
                </div>
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
                      <Textarea {...field} rows={4} placeholder="Extra opmerkingen..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Opslaan..." : "Factuur Aanmaken"}
            </Button>
            <Link href="/facturen">
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
