"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  MapPin,
  User,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────
interface Project {
  id: string;
  projectNummer: string;
  naam: string;
  locatie: string | null;
  klant: { naam: string };
}

interface PlanningItem {
  id: string;
  titel: string;
  startDatum: string;
  eindDatum: string;
  projectId: string | null;
  project: Project | null;
  notities: string | null;
  kleurCode: string;
}

interface FormData {
  titel: string;
  startDatum: string;
  eindDatum: string;
  projectId: string;
  notities: string;
  kleurCode: string;
}

const KLEUREN = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#22c55e", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

const UREN_START = 7;
const UREN_EIND = 19;
const UUR_HOOGTE = 60; // px per hour

const DAGEN_NL = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];
const MAANDEN_NL = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

// ─── Helpers ─────────────────────────────────────────────────────────
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDatum(date: Date): string {
  return `${date.getDate()} ${MAANDEN_NL[date.getMonth()]}`;
}

function toLocalISOString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// ─── Component ───────────────────────────────────────────────────────
export default function PlanningPage() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [items, setItems] = useState<PlanningItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PlanningItem | null>(null);
  const [formData, setFormData] = useState<FormData>({
    titel: "",
    startDatum: "",
    eindDatum: "",
    projectId: "",
    notities: "",
    kleurCode: "#3b82f6",
  });

  // Drag state
  const [dragging, setDragging] = useState<{
    itemId: string;
    type: "move" | "resize";
    startX: number;
    startY: number;
    origStart: Date;
    origEnd: Date;
    origDayIndex: number;
  } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const weekEnd = addDays(weekStart, 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: UREN_EIND - UREN_START }, (_, i) => UREN_START + i);

  // ─── Fetch ──────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    const res = await fetch(
      `/api/planning?start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`
    );
    if (res.ok) {
      setItems(await res.json());
    }
  }, [weekStart, weekEnd]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetch("/api/projecten")
      .then((r) => r.json())
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // ─── CRUD ───────────────────────────────────────────────────────
  const openCreate = (dayIndex: number, hour: number) => {
    const day = days[dayIndex];
    const start = new Date(day);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(day);
    end.setHours(hour + 1, 0, 0, 0);

    setEditingItem(null);
    setFormData({
      titel: "",
      startDatum: toLocalISOString(start),
      eindDatum: toLocalISOString(end),
      projectId: "",
      notities: "",
      kleurCode: "#3b82f6",
    });
    setDialogOpen(true);
  };

  const openEdit = (item: PlanningItem) => {
    setEditingItem(item);
    setFormData({
      titel: item.titel,
      startDatum: toLocalISOString(new Date(item.startDatum)),
      eindDatum: toLocalISOString(new Date(item.eindDatum)),
      projectId: item.projectId || "",
      notities: item.notities || "",
      kleurCode: item.kleurCode,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      titel: formData.titel,
      startDatum: new Date(formData.startDatum).toISOString(),
      eindDatum: new Date(formData.eindDatum).toISOString(),
      projectId: formData.projectId || null,
      notities: formData.notities || null,
      kleurCode: formData.kleurCode,
    };

    if (editingItem) {
      await fetch(`/api/planning/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/planning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setDialogOpen(false);
    fetchItems();
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    await fetch(`/api/planning/${editingItem.id}`, { method: "DELETE" });
    setDialogOpen(false);
    fetchItems();
  };

  // When project changes, auto-fill titel
  const handleProjectChange = (projectId: string) => {
    setFormData((prev) => {
      const project = projects.find((p) => p.id === projectId);
      return {
        ...prev,
        projectId,
        titel: project ? `${project.projectNummer} - ${project.naam}` : prev.titel,
      };
    });
  };

  // ─── Drag & Drop ───────────────────────────────────────────────
  const handleMouseDown = (
    e: React.MouseEvent,
    item: PlanningItem,
    type: "move" | "resize"
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const startDate = new Date(item.startDatum);
    const dayIndex = days.findIndex((d) => isSameDay(d, startDate));

    setDragging({
      itemId: item.id,
      type,
      startX: e.clientX,
      startY: e.clientY,
      origStart: startDate,
      origEnd: new Date(item.eindDatum),
      origDayIndex: dayIndex >= 0 ? dayIndex : 0,
    });
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!gridRef.current || !dragging) return;

      const dayWidth = gridRef.current.clientWidth / 7;
      const deltaX = e.clientX - dragging.startX;
      const deltaY = e.clientY - dragging.startY;
      const dayShift = Math.round(deltaX / dayWidth);
      const hourShift = deltaY / UUR_HOOGTE;

      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== dragging.itemId) return item;

          if (dragging.type === "move") {
            const msShift = dayShift * 86400000 + hourShift * 3600000;
            const newStart = new Date(dragging.origStart.getTime() + msShift);
            const newEnd = new Date(dragging.origEnd.getTime() + msShift);
            // Snap to 15 min
            newStart.setMinutes(Math.round(newStart.getMinutes() / 15) * 15, 0, 0);
            newEnd.setMinutes(Math.round(newEnd.getMinutes() / 15) * 15, 0, 0);
            return { ...item, startDatum: newStart.toISOString(), eindDatum: newEnd.toISOString() };
          } else {
            // resize: only change end
            const msShift = hourShift * 3600000;
            const newEnd = new Date(dragging.origEnd.getTime() + msShift);
            newEnd.setMinutes(Math.round(newEnd.getMinutes() / 15) * 15, 0, 0);
            // Minimum 15 min
            if (newEnd.getTime() - dragging.origStart.getTime() < 900000) return item;
            return { ...item, eindDatum: newEnd.toISOString() };
          }
        })
      );
    };

    const handleMouseUp = async () => {
      if (!dragging) return;
      const item = items.find((i) => i.id === dragging.itemId);
      if (item) {
        await fetch(`/api/planning/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startDatum: new Date(item.startDatum).toISOString(),
            eindDatum: new Date(item.eindDatum).toISOString(),
          }),
        });
        fetchItems();
      }
      setDragging(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, items, fetchItems]);

  // ─── Render helpers ─────────────────────────────────────────────
  const getItemsForDay = (dayIndex: number) => {
    const day = days[dayIndex];
    return items.filter((item) => {
      const start = new Date(item.startDatum);
      const end = new Date(item.eindDatum);
      return start < addDays(day, 1) && end > day;
    });
  };

  const getItemStyle = (item: PlanningItem, dayIndex: number) => {
    const day = days[dayIndex];
    const dayStart = new Date(day);
    dayStart.setHours(UREN_START, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(UREN_EIND, 0, 0, 0);

    const itemStart = new Date(item.startDatum);
    const itemEnd = new Date(item.eindDatum);

    const effectiveStart = itemStart < dayStart ? dayStart : itemStart;
    const effectiveEnd = itemEnd > dayEnd ? dayEnd : itemEnd;

    const topHours = (effectiveStart.getTime() - dayStart.getTime()) / 3600000;
    const durationHours = (effectiveEnd.getTime() - effectiveStart.getTime()) / 3600000;

    return {
      top: `${topHours * UUR_HOOGTE}px`,
      height: `${Math.max(durationHours * UUR_HOOGTE - 2, 20)}px`,
    };
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planning</h1>
          <p className="text-muted-foreground">
            {formatDatum(weekStart)} - {formatDatum(addDays(weekStart, 6))}{" "}
            {weekStart.getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setWeekStart(getWeekStart(new Date()))}
          >
            Vandaag
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekStart(addDays(weekStart, 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={() => {
            const now = new Date();
            now.setMinutes(0, 0, 0);
            const end = new Date(now);
            end.setHours(now.getHours() + 1);
            setEditingItem(null);
            setFormData({
              titel: "",
              startDatum: toLocalISOString(now),
              eindDatum: toLocalISOString(end),
              projectId: "",
              notities: "",
              kleurCode: "#3b82f6",
            });
            setDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nieuw
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden bg-white">
        {/* Day headers */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
          <div className="p-2 text-xs text-muted-foreground" />
          {days.map((day, i) => (
            <div
              key={i}
              className={`p-2 text-center border-l ${
                isToday(day) ? "bg-primary/5" : ""
              }`}
            >
              <div className="text-xs text-muted-foreground">
                {DAGEN_NL[i]}
              </div>
              <div
                className={`text-lg font-semibold ${
                  isToday(day)
                    ? "bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                    : ""
                }`}
              >
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] overflow-y-auto max-h-[calc(100vh-250px)]">
          {/* Hour labels */}
          <div className="relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="border-b text-xs text-muted-foreground text-right pr-2 flex items-start justify-end"
                style={{ height: `${UUR_HOOGTE}px` }}
              >
                {String(hour).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div ref={gridRef} className="col-span-7 grid grid-cols-7">
            {days.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`relative border-l ${
                  isToday(day) ? "bg-primary/5" : ""
                }`}
              >
                {/* Hour lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="border-b cursor-pointer group/slot transition-all"
                    style={{ height: `${UUR_HOOGTE}px` }}
                    onClick={() => openCreate(dayIndex, hour)}
                  >
                    <div className="h-full w-full flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-all duration-300">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/40 backdrop-blur-md border border-white/50 shadow-[0_2px_12px_rgba(0,0,0,0.06)] text-xs text-muted-foreground/70">
                        <Plus className="h-3 w-3" />
                        Toevoegen
                      </div>
                    </div>
                  </div>
                ))}

                {/* Items */}
                {getItemsForDay(dayIndex).map((item) => (
                  <div
                    key={`${item.id}-${dayIndex}`}
                    className={`absolute left-1.5 right-1.5 rounded-xl px-2.5 py-1.5 overflow-hidden cursor-grab active:cursor-grabbing z-10
                      backdrop-blur-xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)]
                      transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] hover:scale-[1.02]
                      ${dragging?.itemId === item.id ? "opacity-80 shadow-[0_12px_40px_rgba(0,0,0,0.15)] scale-[1.03]" : ""}`}
                    style={{
                      ...getItemStyle(item, dayIndex),
                      backgroundColor: item.kleurCode + "18",
                      borderLeft: `3px solid ${item.kleurCode}`,
                      background: `linear-gradient(135deg, ${item.kleurCode}15 0%, ${item.kleurCode}08 50%, rgba(255,255,255,0.4) 100%)`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!dragging) openEdit(item);
                    }}
                    onMouseDown={(e) => handleMouseDown(e, item, "move")}
                  >
                    <div className="text-xs font-semibold truncate" style={{ color: item.kleurCode }}>
                      {item.titel}
                    </div>
                    {item.project?.klant && (
                      <div className="text-[10px] text-muted-foreground/80 truncate flex items-center gap-0.5">
                        <User className="h-2.5 w-2.5" />
                        {item.project.klant.naam}
                      </div>
                    )}
                    {item.project?.locatie && (
                      <div className="text-[10px] text-muted-foreground/80 truncate flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5" />
                        {item.project.locatie}
                      </div>
                    )}
                    {/* Resize handle */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize hover:bg-white/30 rounded-b-xl transition-colors"
                      onMouseDown={(e) => handleMouseDown(e, item, "resize")}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Afspraak bewerken" : "Nieuwe afspraak"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Project selector */}
            <div className="space-y-2">
              <Label>Project (optioneel)</Label>
              <Select
                value={formData.projectId}
                onValueChange={handleProjectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kies een project..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Geen project</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.projectNummer} - {p.naam}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Titel */}
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input
                value={formData.titel}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, titel: e.target.value }))
                }
                placeholder="Bijv. Badkamer renovatie"
              />
            </div>

            {/* Date/Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start</Label>
                <Input
                  type="datetime-local"
                  value={formData.startDatum}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDatum: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Eind</Label>
                <Input
                  type="datetime-local"
                  value={formData.eindDatum}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      eindDatum: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Kleur</Label>
              <div className="flex gap-2">
                {KLEUREN.map((kleur) => (
                  <button
                    key={kleur}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      formData.kleurCode === kleur
                        ? "border-gray-900 scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: kleur }}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, kleurCode: kleur }))
                    }
                  />
                ))}
              </div>
            </div>

            {/* Notities */}
            <div className="space-y-2">
              <Label>Notities</Label>
              <Textarea
                value={formData.notities}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notities: e.target.value }))
                }
                placeholder="Extra informatie..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-between">
            {editingItem && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Verwijderen
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuleren
              </Button>
              <Button onClick={handleSave} disabled={!formData.titel || !formData.startDatum || !formData.eindDatum}>
                {editingItem ? "Opslaan" : "Toevoegen"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
