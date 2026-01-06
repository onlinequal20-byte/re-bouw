"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Loader2 } from "lucide-react";

const priceSchema = z.object({
  categorie: z.string().min(1, "Categorie is verplicht"),
  omschrijving: z.string().min(1, "Omschrijving is verplicht"),
  prijsPerEenheid: z.string().min(1, "Prijs is verplicht"),
  eenheid: z.string().min(1, "Eenheid is verplicht"),
  materiaalKosten: z.string().optional(),
  actief: z.boolean().default(true),
});

type PriceFormValues = z.infer<typeof priceSchema>;

interface PriceDialogProps {
  price?: any;
  trigger?: React.ReactNode;
}

const CATEGORIES = [
  "Badkamer",
  "Keuken",
  "Stucwerk",
  "Schilderwerk",
  "Timmerwerk",
  "Aanbouw",
  "Vloeren",
  "Loodgieter",
  "Elektra",
  "Overig",
];

const UNITS = ["m²", "m", "stuk", "uur", "dag", "week", "m³", "kg", "set"];

export function PriceDialog({ price, trigger }: PriceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<PriceFormValues>({
    resolver: zodResolver(priceSchema),
    defaultValues: {
      categorie: price?.categorie || "",
      omschrijving: price?.omschrijving || "",
      prijsPerEenheid: price?.prijsPerEenheid?.toString() || "",
      eenheid: price?.eenheid || "",
      materiaalKosten: price?.materiaalKosten?.toString() || "0",
      actief: price?.actief ?? true,
    },
  });

  const onSubmit = async (data: PriceFormValues) => {
    setLoading(true);

    try {
      const payload = {
        ...data,
        prijsPerEenheid: parseFloat(data.prijsPerEenheid),
        materiaalKosten: parseFloat(data.materiaalKosten || "0"),
      };

      const url = "/api/prijslijst";
      const method = price ? "PUT" : "POST";
      const body = price ? { id: price.id, ...payload } : payload;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Er is een fout opgetreden");
      }

      toast({
        title: price ? "Prijs bijgewerkt" : "Prijs toegevoegd",
        description: price
          ? "De prijs is succesvol bijgewerkt."
          : "De nieuwe prijs is succesvol toegevoegd.",
      });

      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: error.message || "Er is een fout opgetreden.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe Prijs
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {price ? "Prijs Bewerken" : "Nieuwe Prijs Toevoegen"}
          </DialogTitle>
          <DialogDescription>
            {price
              ? "Wijzig de details van deze prijs."
              : "Voeg een nieuwe prijs toe aan de prijslijst."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categorie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categorie *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer categorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
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
                name="eenheid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eenheid *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer eenheid" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="omschrijving"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Omschrijving *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="bijv. Badkamer betegelen"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="prijsPerEenheid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prijs per Eenheid *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materiaalKosten"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Materiaalkosten</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="actief"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Actief</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Inactieve prijzen worden niet getoond bij het maken van
                      offertes
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Annuleren
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Bezig...
                  </>
                ) : price ? (
                  "Bijwerken"
                ) : (
                  "Toevoegen"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

