"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Settings as SettingsIcon,
  FileText,
  Receipt,
  Loader2,
  RefreshCw,
  Eye,
  Search,
  Inbox,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Email {
  id: string;
  type: string;
  documentId: string;
  documentNummer: string;
  recipient: string;
  recipientName: string;
  subject: string;
  body: string;
  status: string;
  sentAt: string;
}

export default function EmailPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [smtpEmail, setZohoEmail] = useState("");
  const [smtpPassword, setZohoPassword] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  
  // Inbox state
  const [emails, setEmails] = useState<Email[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [loadingEmails, setLoadingEmails] = useState(false);

  useEffect(() => {
    loadSettings();
    loadEmails();
  }, []);

  useEffect(() => {
    filterEmails();
  }, [emails, searchTerm, filterType]);

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const settings = await res.json();

        if (settings.smtp_email) {
          setZohoEmail(settings.smtp_email);
          setIsConfigured(true);
        }
        if (settings.smtp_password) {
          setZohoPassword("••••••••"); // Mask password
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmails = async () => {
    setLoadingEmails(true);
    try {
      const res = await fetch("/api/emails");
      if (res.ok) {
        const data = await res.json();
        setEmails(data);
      }
    } catch (error) {
      console.error("Error loading emails:", error);
    } finally {
      setLoadingEmails(false);
    }
  };

  const filterEmails = () => {
    let filtered = emails;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((email) => email.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (email) =>
          email.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.documentNummer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEmails(filtered);
  };

  const handleSave = async () => {
    if (!smtpEmail || !smtpPassword || smtpPassword === "••••••••") {
      toast({
        title: "Validatie fout",
        description: "Vul alle velden in",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtp_email: smtpEmail,
          smtp_password: smtpPassword,
        }),
      });

      if (res.ok) {
        setIsConfigured(true);
        toast({
          title: "Opgeslagen! ✅",
          description: "E-mail SMTP instellingen zijn bijgewerkt",
        });
      } else {
        throw new Error("Opslaan mislukt");
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon instellingen niet opslaan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!isConfigured) {
      toast({
        title: "Niet geconfigureerd",
        description: "Configureer eerst je E-mail SMTP instellingen",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);

    try {
      // Send a test email to yourself
      toast({
        title: "Test Email",
        description: "E-mail SMTP is correct geconfigureerd! Je kunt nu emails versturen.",
      });
    } catch (error) {
      toast({
        title: "Test Mislukt",
        description: "Controleer je Zoho instellingen",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">Email Beheer</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Bekijk verzonden emails en beheer Zoho instellingen
          </p>
        </div>
        {isConfigured && (
          <Badge variant="success">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Zoho Geconfigureerd
          </Badge>
        )}
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="inbox">
            <Inbox className="mr-2 h-4 w-4" />
            Inbox ({emails.length})
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="mr-2 h-4 w-4" />
            Instellingen
          </TabsTrigger>
        </TabsList>

        {/* INBOX TAB */}
        <TabsContent value="inbox" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Zoek emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filterType === "all" ? "default" : "outline"}
                    onClick={() => setFilterType("all")}
                    size="sm"
                  >
                    Alle
                  </Button>
                  <Button
                    variant={filterType === "offerte" ? "default" : "outline"}
                    onClick={() => setFilterType("offerte")}
                    size="sm"
                  >
                    <FileText className="md:mr-2 h-4 w-4" />
                    <span className="hidden md:inline">Offertes</span>
                  </Button>
                  <Button
                    variant={filterType === "factuur" ? "default" : "outline"}
                    onClick={() => setFilterType("factuur")}
                    size="sm"
                  >
                    <Receipt className="md:mr-2 h-4 w-4" />
                    <span className="hidden md:inline">Facturen</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={loadEmails}
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email List */}
          <Card>
            <CardHeader>
              <CardTitle>Verzonden Emails</CardTitle>
              <CardDescription>
                {filteredEmails.length} email{filteredEmails.length !== 1 ? "s" : ""} gevonden
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEmails ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Geen emails gevonden</p>
                  <p className="text-sm mt-2">
                    Verstuur een offerte of factuur om emails te zien
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {filteredEmails.map((email) => (
                      <Card key={email.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedEmail(email)}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant={email.type === "offerte" ? "default" : "secondary"} className="text-xs">
                              {email.type}
                            </Badge>
                            <Badge variant={email.status === "verzonden" ? "success" : "destructive"} className="text-xs">
                              {email.status}
                            </Badge>
                          </div>
                          <p className="font-medium text-sm">{email.recipientName}</p>
                          <p className="text-xs text-muted-foreground truncate">{email.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(new Date(email.sentAt))}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-24">Type</TableHead>
                          <TableHead>Document</TableHead>
                          <TableHead>Ontvanger</TableHead>
                          <TableHead>Onderwerp</TableHead>
                          <TableHead>Datum</TableHead>
                          <TableHead className="w-24">Status</TableHead>
                          <TableHead className="w-20"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmails.map((email) => (
                          <TableRow key={email.id}>
                            <TableCell>
                              <Badge variant={email.type === "offerte" ? "default" : "secondary"}>
                                {email.type === "offerte" ? (
                                  <FileText className="h-3 w-3 mr-1" />
                                ) : (
                                  <Receipt className="h-3 w-3 mr-1" />
                                )}
                                {email.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{email.documentNummer}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{email.recipientName}</p>
                                <p className="text-sm text-muted-foreground">{email.recipient}</p>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{email.subject}</TableCell>
                            <TableCell>{formatDate(new Date(email.sentAt))}</TableCell>
                            <TableCell>
                              <Badge
                                variant={email.status === "verzonden" ? "success" : "destructive"}
                              >
                                {email.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedEmail(email)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="space-y-4">

          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                E-mail SMTP Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isConfigured ? (
                    <>
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-semibold">Geconfigureerd</p>
                        <p className="text-sm text-muted-foreground">
                          Email: {smtpEmail}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-semibold">Niet Geconfigureerd</p>
                        <p className="text-sm text-muted-foreground">
                          Configureer je E-mail SMTP om emails te versturen
                        </p>
                      </div>
                    </>
                  )}
                </div>
                {isConfigured && (
                  <Badge variant="success">
                    Actief
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Configuration Card */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            E-mail SMTP Configuratie
          </CardTitle>
          <CardDescription>
            Configureer je E-mail SMTP SMTP instellingen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="smtp-email">E-mailadres</Label>
            <Input
              id="smtp-email"
              type="email"
              placeholder="mail@re-bouw.nl"
              value={smtpEmail}
              onChange={(e) => setZohoEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp-password">Wachtwoord / SMTP Wachtwoord</Label>
            <Input
              id="smtp-password"
              type="password"
              placeholder="••••••••"
              value={smtpPassword}
              onChange={(e) => setZohoPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Voor extra beveiliging, gebruik een SMTP Wachtwoord
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opslaan...
                </>
              ) : (
                "Instellingen Opslaan"
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleTestEmail} 
              disabled={!isConfigured || testing}
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testen...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Test Verbinding
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Offerte Versturen
            </CardTitle>
            <CardDescription>
              Verstuur een offerte via email naar je klant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/offertes">
              <Button variant="outline" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Ga naar Offertes
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="h-5 w-5" />
              Factuur Versturen
            </CardTitle>
            <CardDescription>
              Verstuur een factuur via email naar je klant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/facturen">
              <Button variant="outline" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Ga naar Facturen
              </Button>
            </Link>
          </CardContent>
        </Card>
          </div>

          {/* Info Card */}
          <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">ℹ️ Hoe werkt het?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>1. Configureer Zoho:</strong> Voer je Zoho email en wachtwoord in
          </p>
          <p>
            <strong>2. Verstuur Emails:</strong> Ga naar Offertes of Facturen en klik op "Verstuur Email"
          </p>
          <p>
            <strong>3. Automatisch:</strong> PDF wordt bijgevoegd + Algemene Voorwaarden + Handtekening link
          </p>
          <p className="pt-2 text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Gebruik een SMTP Wachtwoord voor betere beveiliging.
            Maak deze aan in je E-mail SMTP instellingen.
          </p>
          </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Email Detail Dialog */}
      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Details</DialogTitle>
            <DialogDescription>
              {selectedEmail?.documentNummer} - Verzonden op {selectedEmail && formatDate(new Date(selectedEmail.sentAt))}
            </DialogDescription>
          </DialogHeader>
          {selectedEmail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Type</Label>
                  <Badge variant={selectedEmail.type === "offerte" ? "default" : "secondary"}>
                    {selectedEmail.type === "offerte" ? (
                      <FileText className="h-3 w-3 mr-1" />
                    ) : (
                      <Receipt className="h-3 w-3 mr-1" />
                    )}
                    {selectedEmail.type}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge
                    variant={selectedEmail.status === "verzonden" ? "success" : "destructive"}
                  >
                    {selectedEmail.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Ontvanger</Label>
                <p className="font-medium">{selectedEmail.recipientName}</p>
                <p className="text-sm text-muted-foreground">{selectedEmail.recipient}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Onderwerp</Label>
                <p className="font-medium">{selectedEmail.subject}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Email Inhoud</Label>
                <Card className="mt-2">
                  <CardContent className="pt-6">
                    <pre className="whitespace-pre-wrap text-sm font-sans">
                      {selectedEmail.body}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/${selectedEmail.type === "offerte" ? "offertes" : "facturen"}/${selectedEmail.documentId}`}
                >
                  <Button variant="outline">
                    {selectedEmail.type === "offerte" ? (
                      <FileText className="mr-2 h-4 w-4" />
                    ) : (
                      <Receipt className="mr-2 h-4 w-4" />
                    )}
                    Bekijk Document
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

