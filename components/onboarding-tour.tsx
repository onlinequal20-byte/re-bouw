"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Settings,
  DollarSign,
  FolderOpen,
  Calendar,
  Wallet,
  TrendingUp,
  ScrollText,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  BookOpen,
} from "lucide-react";

const tourSteps = [
  {
    icon: Sparkles,
    title: "Welkom bij Re-Bouw!",
    description:
      "Welkom! Dit is jouw persoonlijke dashboard om offertes, facturen en klanten te beheren. We laten je in een paar stappen zien hoe alles werkt.",
    tip: "Deze rondleiding kun je altijd opnieuw bekijken via het menu.",
  },
  {
    icon: Settings,
    title: "1. Instellingen invullen",
    description:
      "Begin hier! Vul je bedrijfsgegevens in: naam, adres, IBAN, BTW-nummer en e-mail instellingen. Dit is nodig zodat je offertes en facturen er professioneel uitzien.",
    tip: "Ga naar Instellingen in het menu links.",
  },
  {
    icon: Users,
    title: "2. Klanten toevoegen",
    description:
      "Voeg je klanten toe met hun naam, e-mail, telefoon en adres. Je hebt minstens één klant nodig om een offerte te maken.",
    tip: "Klik op Klanten → Nieuwe klant.",
  },
  {
    icon: DollarSign,
    title: "3. Prijslijst opzetten",
    description:
      "Stel je prijzen in per categorie. Als je een offerte maakt, kun je items uit deze lijst kiezen — dat scheelt veel tijd!",
    tip: "Ga naar Prijzen om je prijslijst te beheren.",
  },
  {
    icon: FileText,
    title: "4. Offerte maken & versturen",
    description:
      "Maak een offerte, kies een klant, voeg werkregels toe en verstuur per e-mail. De klant ontvangt de offerte + Algemene Voorwaarden als PDF.",
    tip: "Offertes → Nieuwe offerte.",
  },
  {
    icon: Receipt,
    title: "5. Factuur aanmaken",
    description:
      "Zodra een offerte is geaccepteerd, kun je met één klik een factuur maken. Of maak handmatig een nieuwe factuur aan.",
    tip: "Je kunt ook herinneringen sturen bij late betaling.",
  },
  {
    icon: FolderOpen,
    title: "6. Projecten & Planning",
    description:
      "Organiseer je werk in projecten en plan afspraken in de kalender. Koppel klanten, offertes en facturen aan een project.",
    tip: "Gebruik Projecten en Planning in het menu.",
  },
  {
    icon: Wallet,
    title: "7. Kosten bijhouden",
    description:
      "Registreer je bedrijfskosten en upload foto's van bonnetjes. Handig voor je administratie!",
    tip: "Ga naar Kosten om bonnen toe te voegen.",
  },
  {
    icon: TrendingUp,
    title: "8. Financieel overzicht",
    description:
      "Bekijk je omzet, openstaande facturen en BTW-overzicht. Download BTW-rapporten als PDF of CSV.",
    tip: "Ga naar Financieel voor het totaaloverzicht.",
  },
  {
    icon: ScrollText,
    title: "9. Algemene Voorwaarden",
    description:
      "Bewerk je Algemene Voorwaarden. Deze worden automatisch als PDF bijgevoegd bij elke offerte en factuur die je verstuurt.",
    tip: "Ga naar Voorwaarden om ze aan te passen.",
  },
  {
    icon: LayoutDashboard,
    title: "Klaar om te beginnen!",
    description:
      "Je bent helemaal klaar! Begin met het invullen van je Instellingen, dan een klant toevoegen, en je eerste offerte maken. Succes!",
    tip: "Tip: klik op 'Rondleiding' in het menu om deze tour opnieuw te zien.",
  },
];

const STORAGE_KEY = "rebouw-onboarding-seen";

export function OnboardingTour({ forceOpen = false }: { forceOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setCurrentStep(0);
      setIsOpen(true);
      return;
    }
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    setCurrentStep(0);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  const next = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      close();
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const Icon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === tourSteps.length - 1;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="rounded-2xl border border-white/60 bg-white/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="px-6 pt-8 pb-6">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-medium text-gray-400">
                {currentStep + 1} / {tourSteps.length}
              </span>
            </div>

            {/* Icon */}
            <div className="mb-5">
              <div
                className={`inline-flex rounded-xl p-3 ${
                  isFirst || isLast
                    ? "bg-blue-50"
                    : "bg-amber-50"
                }`}
              >
                <Icon
                  className={`h-7 w-7 ${
                    isFirst || isLast
                      ? "text-blue-600"
                      : "text-amber-600"
                  }`}
                />
              </div>
            </div>

            {/* Text */}
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {step.title}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              {step.description}
            </p>

            {/* Tip */}
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
              <p className="text-xs text-gray-500 flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-500" />
                {step.tip}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-gray-50/50">
            <div>
              {!isFirst && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prev}
                  className="text-gray-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Vorige
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isLast && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={close}
                  className="text-gray-400"
                >
                  Overslaan
                </Button>
              )}
              <Button size="sm" onClick={next}>
                {isLast ? "Aan de slag!" : "Volgende"}
                {!isLast && <ArrowRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-1 pb-4">
            {tourSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? "w-6 bg-blue-500"
                    : i < currentStep
                    ? "w-1.5 bg-blue-300"
                    : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TourTriggerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-400 hover:bg-white/8 hover:text-gray-200 transition-all duration-200 w-full"
    >
      <BookOpen className="h-5 w-5" />
      Rondleiding
    </button>
  );
}
