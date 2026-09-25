"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as fabric from "fabric";
import {
  AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowLeft, ArrowUp, Bold,
  Check, ChevronDown, Circle, Copy, Download, Eye, FileDown, FileText,
  Frame, Heart, Image as ImageIcon, Italic, Layers3, Link2, Mail, Maximize2,
  Minus, MoreHorizontal, Move, Palette, PanelRight, Plus, QrCode, Redo2,
  RotateCcw, Save, Search, Share2, Sparkles, Square, Star, Trash2, Type,
  Underline, Undo2, Upload, UserCircle, Users, X, ZoomIn, ZoomOut, Scissors, Leaf, Ribbon
} from "lucide-react";
import { createInvitationAction } from "@/lib/actions/invitationActions";
import { invitationTemplates, TemplatePreview, type TemplateDef } from "./InvitationFlow";

type ToolId =
  | "templates" | "text" | "media" | "elements" | "background"
  | "event" | "guests" | "layers";

type EventInfo = {
  title: string;
  host: string;
  venue: string;
  address: string;
  date: string;
  time: string;
  subtitle: string;
  guestName: string;
};

type InvitationStudioProps = {
  template?: TemplateDef | null;
  onBack?: () => void;
};

type DesignObject = fabric.Object & {
  dataKey?: string;
  role?: string;
};

const CANVAS_W = 540;
const CANVAS_H = 760;

const FONT_OPTIONS = [
  { group: "Elegant", values: ["Cormorant Garamond", "Playfair Display", "DM Serif Display", "Libre Baskerville", "Lora", "Georgia"] },
  { group: "Modern", values: ["Montserrat", "Poppins", "Inter", "Manrope"] },
  { group: "Script", values: ["Great Vibes", "Allura", "Parisienne", "Alex Brush"] },
  { group: "Luxury", values: ["Cinzel", "Cormorant"] },
];

const TEXT_COLORS = ["#171717", "#3b302b", "#6b4a42", "#8b5e66", "#9f8159", "#5d6475", "#ffffff", "#111827", "#cda434"];

const BACKGROUNDS = [
  { name: "Ivory", value: "#f8f4ee" },
  { name: "Blush", value: "#fbf3f4" },
  { name: "Sand", value: "#f2eadf" },
  { name: "Mist", value: "#f2f5f7" },
  { name: "Sage", value: "#edf3ee" },
  { name: "Lavender", value: "#f3f1f8" },
  { name: "Midnight", value: "#141620" },
  { name: "Ink", value: "#111315" },
];

// ELEMENTE VEKTORIALE ELEGANTE PROFESIONALE PËR FTESA
const ELEMENTS = [
  { 
    id: "botanical_leaf", 
    label: "Gjethe Botanike", 
    icon: Leaf, 
    color: "#839c81",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5,1.9C15.3,1.9,13.2,3,12,4.8C10.8,3,8.7,1.9,6.5,1.9C3.1,1.9,0.3,4.6,0.3,8c0,4.3,4.4,7.8,11.2,13.8L12,22.3l0.5-0.5C19.3,15.8,23.7,12.3,23.7,8C23.7,4.6,20.9,1.9,17.5,1.9z"/></svg>`
  },
  { 
    id: "vintage_frame", 
    label: "Kornizë Klasike", 
    icon: Frame, 
    color: "#b08a52",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="5" width="90" height="140" rx="10"/><rect x="9" y="9" width="82" height="132" rx="6"/><path d="M50 15 L50 25 M15 75 L25 75 M50 135 L50 125 M85 75 L75 75"/></svg>`
  },
  { 
    id: "elegant_divider", 
    label: "Ndarës Elegant", 
    icon: Minus, 
    color: "#cda434",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 20"><path d="M10,10 L80,10" stroke="currentColor" stroke-width="1"/><path d="M120,10 L190,10" stroke="currentColor" stroke-width="1"/><polygon points="100,5 105,10 100,15 95,10" fill="currentColor"/></svg>`
  },
  { 
    id: "flourish", 
    label: "Ornamet", 
    icon: Sparkles, 
    color: "#a78662",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 30" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10,20 C10,10 20,5 25,15 C30,25 40,20 40,10"/></svg>`
  },
  { 
    id: "ribbon", 
    label: "Fjongo", 
    icon: Ribbon, 
    color: "#d4b3b3",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40" fill="currentColor"><path d="M10,20 L30,10 L70,10 L90,20 L70,30 L30,30 Z"/><path d="M30,10 L25,35 L10,20 Z" fill-opacity="0.7"/><path d="M70,10 L75,35 L90,20 Z" fill-opacity="0.7"/></svg>`
  },
  { 
    id: "heart", 
    label: "Zemër", 
    icon: Heart, 
    color: "#b86a78",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
  },
];

export default function InvitationStudio({ template: initialTemplate, onBack }: InvitationStudioProps) {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const historyLockRef = useRef(false);

  const [activeTemplate, setActiveTemplate] = useState<TemplateDef | null>(initialTemplate || null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<ToolId>("event");
  const [selected, setSelected] = useState<DesignObject | null>(null);
  const [zoom, setZoom] = useState(70);
  const [saving, setSaving] = useState(false);
  const [savedState, setSavedState] = useState<"saved" | "dirty">("saved");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [myInvitationsOpen, setMyInvitationsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [photoAdded, setPhotoAdded] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  
  const [event, setEvent] = useState<EventInfo>({
    title: initialTemplate?.demoData?.title || "Blerimi & Era",
    host: initialTemplate?.demoData?.title || "Familja Gashi",
    venue: initialTemplate?.demoData?.venue || "Garden 5, Prishtinë",
    address: "Rr. e Lirisë, Prishtinë",
    date: initialTemplate?.demoData?.date || "05 Maj 2026",
    time: "19:00",
    subtitle: initialTemplate?.demoData?.subtitle || "KEMI KËNAQËSINË T'JU FTOJMË",
    guestName: "",
  });

  const selectedText = selected && ["i-text", "text", "textbox"].includes(selected.type || "") ? selected as fabric.IText : null;
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/invitation/abc123` : "https://hallevo.com/invitation/abc123";

  const pushHistory = useCallback((c: fabric.Canvas) => {
    if (historyLockRef.current) return;
    try {
      const json = JSON.stringify(c.toJSON(["dataKey", "role"]));
      const next = historyRef.current.slice(0, historyIndexRef.current + 1);
      next.push(json);
      if (next.length > 60) next.shift();
      historyRef.current = next;
      historyIndexRef.current = next.length - 1;
      setSavedState("dirty");
    } catch {}
  }, []);

  const syncEventToCanvas = useCallback((nextEvent: EventInfo) => {
    const c = canvasRef.current;
    if (!c) return;
    c.getObjects().forEach((obj) => {
      const o = obj as DesignObject;
      if (!o.dataKey) return;
      const value = nextEvent[o.dataKey as keyof EventInfo];
      if (typeof value === "string" && "text" in o) {
        (o as fabric.IText).set("text", value);
      }
    });
    c.renderAll();
    setSavedState("dirty");
  }, []);

  const updateEvent = (key: keyof EventInfo, value: string) => {
    setEvent((prev) => {
      const next = { ...prev, [key]: value };
      syncEventToCanvas(next);
      return next;
    });
  };

  const addTextObject = useCallback((text: string, options: Partial<fabric.IText> = {}, dataKey?: keyof EventInfo) => {
    const c = canvasRef.current;
    if (!c) return;
    const obj = new fabric.IText(text, {
      left: CANVAS_W / 2,
      top: CANVAS_H / 2,
      originX: "center",
      originY: "center",
      fontFamily: "Cormorant Garamond",
      fontSize: 32,
      fill: activeTemplate?.textColor || "#3b302b",
      textAlign: "center",
      ...options,
    }) as DesignObject;
    if (dataKey) obj.dataKey = dataKey;
    c.add(obj);
    c.setActiveObject(obj);
    c.renderAll();
    setSelected(obj);
    setActiveTool("text");
    pushHistory(c);
  }, [pushHistory, activeTemplate]);

  // LOGJIKA E RE PËR TË VIZATUAR SAKTË TEMPLATE-IN SIPAS STILIT TË FAQES SË PARË
  const buildInitialDesign = useCallback((c: fabric.Canvas, templateToLoad: TemplateDef | null, currentAddress: string) => {
    c.clear();
    c.setDimensions({ width: CANVAS_W, height: CANVAS_H });
    c.backgroundColor = templateToLoad?.bgColor || "#f8f4ee";

    const style = templateToLoad?.styleType || 'editorial';
    const borderColor = templateToLoad?.borderColor || "#b89b72";
    const textColor = templateToLoad?.textColor || "#3b302b";
    const accentColor = templateToLoad?.accentColor || "#9f8159";

    const fonts = (templateToLoad?.fontPair || "Cormorant Garamond + Montserrat").split(' + ');
    const fontPrimary = fonts[0] || "Cormorant Garamond";
    const fontSecondary = fonts[1] || "Montserrat";

    const addTxt = (text: string, top: number, size: number, family: string, weight: string | number, spacing: number, key?: string) => {
        const t = new fabric.IText(text, {
            left: CANVAS_W / 2, top,
            originX: "center", originY: "center",
            fontFamily: family, fontSize: size, fontWeight: weight,
            charSpacing: spacing, fill: textColor, textAlign: "center",
            selectable: true
        }) as DesignObject;
        if (key) t.dataKey = key;
        c.add(t);
        return t;
    };

    if (style === "garden") {
        // Rrathët
        const c1 = new fabric.Circle({ left: 30, top: 30, originX: 'center', originY: 'center', radius: 110, fill: "transparent", stroke: accentColor, strokeWidth: 1, opacity: 0.4, selectable: true });
        const c2 = new fabric.Circle({ left: CANVAS_W - 30, top: CANVAS_H - 30, originX: 'center', originY: 'center', radius: 140, fill: "transparent", stroke: accentColor, strokeWidth: 1, opacity: 0.4, selectable: true });
        // Kornizat me origin në qendër që të mos dalin të prera
        const b1 = new fabric.Rect({ left: CANVAS_W/2, top: CANVAS_H/2, originX: 'center', originY: 'center', width: CANVAS_W - 40, height: CANVAS_H - 40, fill: "transparent", stroke: borderColor, strokeWidth: 1.5, rx: 12, ry: 12, selectable: true });
        const b2 = new fabric.Rect({ left: CANVAS_W/2, top: CANVAS_H/2, originX: 'center', originY: 'center', width: CANVAS_W - 60, height: CANVAS_H - 60, fill: "transparent", stroke: borderColor, strokeWidth: 0.5, rx: 8, ry: 8, selectable: true });
        // Ndarësit
        const l1 = new fabric.Line([CANVAS_W/2 - 40, 160, CANVAS_W/2 + 40, 160], { stroke: borderColor, strokeWidth: 1, originX: 'center', originY: 'center', selectable: true });
        const l2 = new fabric.Line([CANVAS_W/2 - 40, 480, CANVAS_W/2 + 40, 480], { stroke: borderColor, strokeWidth: 1, originX: 'center', originY: 'center', selectable: true });
        
        c.add(c1, c2, b1, b2, l1, l2);
        
        addTxt(templateToLoad?.demoData?.subtitle || "NJË DITË. NJË DASHURI.", 130, 11, fontSecondary, "600", 200, "subtitle");
        addTxt(templateToLoad?.demoData?.title || "Drin & Blerta", 280, 56, fontPrimary, "normal", 0, "title");
        addTxt(templateToLoad?.demoData?.date || "20 Korrik 2026 · 20:00", 520, 12, fontSecondary, "600", 80, "date");
        addTxt(templateToLoad?.demoData?.venue || "Garden 5 · Prishtinë", 560, 11, fontSecondary, "normal", 0, "venue");
        const addr = addTxt(currentAddress, 590, 9, fontSecondary, "normal", 0, "address");
        addr.set({ opacity: 0.6 });
    }
    else if (style === "luxury" || style === "editorial") {
        const b1 = new fabric.Rect({ left: CANVAS_W/2, top: CANVAS_H/2, originX: 'center', originY: 'center', width: CANVAS_W - 50, height: CANVAS_H - 50, fill: "transparent", stroke: borderColor, strokeWidth: 1.5, selectable: true });
        const b2 = new fabric.Rect({ left: CANVAS_W/2, top: CANVAS_H/2, originX: 'center', originY: 'center', width: CANVAS_W - 70, height: CANVAS_H - 70, fill: "transparent", stroke: borderColor, strokeWidth: 0.5, opacity: 0.6, selectable: true });
        c.add(b1, b2);

        if (style === "luxury") addTxt("♛", 110, 28, "serif", "normal", 0);
        else addTxt("✦", 110, 20, "serif", "normal", 0);

        addTxt(templateToLoad?.demoData?.subtitle || "SAVE THE DATE", 160, 10, fontSecondary, "bold", 250, "subtitle");
        addTxt(templateToLoad?.demoData?.title || "Lirim & Vlora", 300, 52, fontPrimary, "normal", 0, "title");
        
        const l1 = new fabric.Line([CANVAS_W/2 - 30, 420, CANVAS_W/2 + 30, 420], { stroke: borderColor, strokeWidth: 1, originX: 'center', originY: 'center', selectable: true });
        c.add(l1);

        addTxt(templateToLoad?.demoData?.date || "25 Shtator 2026", 470, 12, fontSecondary, "500", 100, "date");
        addTxt(templateToLoad?.demoData?.venue || "Sirius Hotel", 510, 11, fontSecondary, "normal", 0, "venue");
        const addr = addTxt(currentAddress, 540, 9, fontSecondary, "normal", 0, "address");
        addr.set({ opacity: 0.6 });
    }
    else if (style === "midnight") {
        const b1 = new fabric.Rect({ left: CANVAS_W/2, top: CANVAS_H/2, originX: 'center', originY: 'center', width: CANVAS_W - 40, height: CANVAS_H - 40, fill: "transparent", stroke: borderColor, strokeWidth: 1, selectable: true, rx: 16, ry: 16 });
        const l1 = new fabric.Line([CANVAS_W/2 - 80, 170, CANVAS_W/2 + 80, 170], { stroke: accentColor, strokeWidth: 1, opacity: 0.5, originX: 'center', originY: 'center', selectable: true });
        c.add(b1, l1);

        addTxt("✧", 110, 24, "serif", "normal", 0);
        addTxt(templateToLoad?.demoData?.subtitle || "NËN DRITËN E YJEVE", 140, 10, fontSecondary, "600", 150, "subtitle");
        addTxt(templateToLoad?.demoData?.title || "Krenar & Hana", 320, 58, fontPrimary, "normal", 0, "title");
        
        addTxt(templateToLoad?.demoData?.date || "12 Gusht 2026", 500, 12, fontSecondary, "500", 80, "date");
        addTxt(templateToLoad?.demoData?.venue || "Emerald Terrace", 540, 11, fontSecondary, "normal", 0, "venue");
        const addr = addTxt(currentAddress, 570, 9, fontSecondary, "normal", 0, "address");
        addr.set({ opacity: 0.6 });
    }
    else if (style === "celebration") {
        addTxt("✧", 120, 24, "serif", "normal", 0).set({ fill: accentColor });
        addTxt(templateToLoad?.demoData?.subtitle || "LET'S CELEBRATE", 160, 11, fontSecondary, "600", 250, "subtitle");
        addTxt(templateToLoad?.demoData?.title || "Era's 21st", 320, 68, fontPrimary, "normal", 0, "title");
        
        const l1 = new fabric.Line([0, 320, CANVAS_W/2, 320], { stroke: borderColor, strokeWidth: 1.5, originX: 'center', originY: 'center', selectable: true });
        const l2 = new fabric.Line([CANVAS_W/2, 0, CANVAS_W/2, 320], { stroke: borderColor, strokeWidth: 1.5, originX: 'center', originY: 'center', selectable: true });
        c.add(l1, l2);

        addTxt(templateToLoad?.demoData?.date || "10 Korrik 2026 · 21:00", 480, 12, fontSecondary, "600", 50, "date");
        addTxt(templateToLoad?.demoData?.venue || "Duplex Club", 520, 11, fontSecondary, "normal", 0, "venue");
        const addr = addTxt(currentAddress, 550, 9, fontSecondary, "normal", 0, "address");
        addr.set({ opacity: 0.6 });
    }
    else {
        // Fallback klasik universal
        const b1 = new fabric.Rect({ left: CANVAS_W/2, top: CANVAS_H/2, originX: 'center', originY: 'center', width: CANVAS_W - 60, height: CANVAS_H - 60, fill: "transparent", stroke: borderColor, strokeWidth: 1.5, rx: 8, ry: 8, selectable: true });
        c.add(b1);

        addTxt(templateToLoad?.demoData?.subtitle || "Ftesë", 150, 11, fontSecondary, "600", 100, "subtitle");
        addTxt(templateToLoad?.demoData?.title || "Emri", 280, 50, fontPrimary, "normal", 0, "title");
        addTxt(templateToLoad?.demoData?.date || "Data", 450, 12, fontSecondary, "500", 50, "date");
        addTxt(templateToLoad?.demoData?.venue || "Vendi", 490, 11, fontSecondary, "normal", 0, "venue");
        const addr = addTxt(currentAddress, 520, 9, fontSecondary, "normal", 0, "address");
        addr.set({ opacity: 0.6 });
    }

    c.renderAll();
    setSelected(null);
    setPhotoAdded(false);
    setTimeout(() => pushHistory(c), 80);
  }, [pushHistory]);

  const applyNewTemplate = (newTemplate: TemplateDef) => {
    setActiveTemplate(newTemplate);
    setEvent(prev => ({
       ...prev,
       title: newTemplate.demoData.title,
       subtitle: newTemplate.demoData.subtitle,
       date: newTemplate.demoData.date,
       venue: newTemplate.demoData.venue
    }));
    if (canvasRef.current) {
       buildInitialDesign(canvasRef.current, newTemplate, event.address);
    }
  };

  useEffect(() => {
    if (!canvasEl.current || canvasRef.current) return;

    const c = new fabric.Canvas(canvasEl.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      preserveObjectStacking: true,
      selection: true,
      uniformScaling: false,
    });

    canvasRef.current = c;
    setCanvas(c);
    buildInitialDesign(c, activeTemplate, event.address);

    const onSelected = (e: any) => {
      const obj = (e.selected?.[0] || null) as DesignObject | null;
      setSelected(obj);
      if (obj?.type === "i-text" || obj?.type === "textbox" || obj?.type === "text") setActiveTool("text");
    };
    const onCleared = () => setSelected(null);
    const onModified = () => pushHistory(c);
    const onAdded = () => pushHistory(c);
    const onRemoved = () => pushHistory(c);

    c.on("selection:created", onSelected);
    c.on("selection:updated", onSelected);
    c.on("selection:cleared", onCleared);
    c.on("object:modified", onModified);
    c.on("object:added", onAdded);
    c.on("object:removed", onRemoved);

    return () => {
      c.dispose();
      canvasRef.current = null;
    };
  }, [buildInitialDesign, pushHistory, activeTemplate, event.address]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selected && selected.selectable !== false) {
          c.remove(selected);
          c.discardActiveObject();
          setSelected(null);
          c.renderAll();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const handleUndo = () => {
    const c = canvasRef.current;
    if (!c || historyIndexRef.current <= 0) return;
    historyLockRef.current = true;
    const nextIndex = historyIndexRef.current - 1;
    historyIndexRef.current = nextIndex;
    c.loadFromJSON(JSON.parse(historyRef.current[nextIndex])).then(() => {
      c.renderAll();
      setSelected(null);
      historyLockRef.current = false;
    });
  };

  const handleRedo = () => {
    const c = canvasRef.current;
    if (!c || historyIndexRef.current >= historyRef.current.length - 1) return;
    historyLockRef.current = true;
    const nextIndex = historyIndexRef.current + 1;
    historyIndexRef.current = nextIndex;
    c.loadFromJSON(JSON.parse(historyRef.current[nextIndex])).then(() => {
      c.renderAll();
      setSelected(null);
      historyLockRef.current = false;
    });
  };

  const duplicateSelected = () => {
    const c = canvasRef.current;
    if (!c || !selected) return;
    selected.clone().then((clone: DesignObject) => {
      clone.set({ left: (selected.left || 0) + 18, top: (selected.top || 0) + 18 });
      clone.dataKey = undefined;
      c.add(clone);
      c.setActiveObject(clone);
      c.renderAll();
      setSelected(clone);
    });
  };

  const deleteSelected = () => {
    const c = canvasRef.current;
    if (!c || !selected || selected.selectable === false) return;
    c.remove(selected);
    c.discardActiveObject();
    c.renderAll();
    setSelected(null);
  };

  const bringForward = () => {
    const c = canvasRef.current;
    if (!c || !selected) return;
    c.bringObjectForward(selected);
    c.renderAll();
    pushHistory(c);
  };

  const sendBackward = () => {
    const c = canvasRef.current;
    if (!c || !selected) return;
    c.sendObjectBackwards(selected);
    c.renderAll();
    pushHistory(c);
  };

  const updateSelected = (key: string, value: any) => {
    const c = canvasRef.current;
    if (!c || !selected) return;
    selected.set(key as any, value);
    c.renderAll();
    setSavedState("dirty");
  };

  const addTextPreset = (preset: "heading" | "subheading" | "body" | "guest") => {
    if (preset === "heading") addTextObject("Emri i Eventit", { fontSize: 40, fontFamily: "Cormorant Garamond", fontWeight: "600" });
    if (preset === "subheading") addTextObject("ME KËNAQËSI JU FTOJMË", { fontSize: 11, fontFamily: "Montserrat", fontWeight: "600", charSpacing: 120 });
    if (preset === "body") addTextObject("Shto tekstin tënd këtu", { fontSize: 16, fontFamily: "Montserrat" });
    if (preset === "guest") addTextObject("I/e dashur {{guest_name}}", { fontSize: 22, fontFamily: "Cormorant Garamond" });
  };

  const addElement = async (item: typeof ELEMENTS[0]) => {
    const c = canvasRef.current;
    if (!c) return;
    try {
      const { objects, options } = await fabric.loadSVGFromString(item.svg);
      const obj = fabric.util.groupSVGElements(objects, options);
      obj.set({
        left: CANVAS_W / 2,
        top: CANVAS_H / 2,
        originX: 'center',
        originY: 'center',
        scaleX: 1.5,
        scaleY: 1.5,
        fill: item.color,
      });
      c.add(obj);
      c.setActiveObject(obj);
      c.renderAll();
      setSelected(obj as DesignObject);
      pushHistory(c);
    } catch (err) {
      console.error("Gabim gjatë ngarkimit të elementit SVG:", err);
    }
  };

  const uploadPhoto = async (file: File) => {
    if (!canvasRef.current) return;
    if (!file.type.startsWith("image/")) return;
    const existingPhoto = canvasRef.current.getObjects().find(o => (o as DesignObject).role === "personal-photo");
    if (existingPhoto) canvasRef.current.remove(existingPhoto);
    if (file.size > 8 * 1024 * 1024) {
      alert("Fotoja duhet të jetë më e vogël se 8 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const img = await fabric.FabricImage.fromURL(String(reader.result));
        img.scaleToWidth(210);
        img.set({ left: CANVAS_W / 2, top: 575, originX: "center", originY: "center" });
        (img as DesignObject).role = "personal-photo";
        canvasRef.current?.add(img);
        canvasRef.current?.setActiveObject(img);
        canvasRef.current?.renderAll();
        setSelected(img as DesignObject);
        setPhotoAdded(true);
        setActiveTool("media");
      } catch {}
    };
    reader.readAsDataURL(file);
  };

  const changeBackground = (value: string) => {
    const c = canvasRef.current;
    if (!c) return;
    c.backgroundColor = value;
    c.renderAll();
    pushHistory(c);
  };

  const openPreview = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.discardActiveObject();
    c.renderAll();
    setPreviewImage(c.toDataURL({ format: "png", quality: 1, multiplier: 2 }));
    setPreviewOpen(true);
  };

  const saveInvitation = async () => {
    const c = canvasRef.current;
    if (!c) return;
    setSaving(true);
    try {
      c.discardActiveObject();
      c.renderAll();
      const result = await createInvitationAction({
        event_type: event.title,
        canvas_data: c.toJSON(["dataKey", "role"]),
      });
      if (!result.success) {
        alert(result.error || "Ftesa nuk u ruajt.");
        return;
      }
      setSavedState("saved");
    } catch {
      alert("Ndodhi një gabim gjatë ruajtjes.");
    } finally {
      setSaving(false);
    }
  };

  const shareInvitation = async () => {
    const url = shareUrl;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text: "Shiko ftesën time në HALLEVO.", url });
        return;
      } catch {}
    }
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const downloadPng = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.discardActiveObject();
    c.renderAll();
    const link = document.createElement("a");
    link.href = c.toDataURL({ format: "png", quality: 1, multiplier: 3 });
    link.download = "hallevo-ftesa.png";
    link.click();
  };

  const setTextColor = (color: string) => updateSelected("fill", color);

  const inspector = useMemo(() => {
    if (!selected) return null;
    return {
      left: Math.round(selected.left || 0),
      top: Math.round(selected.top || 0),
      angle: Math.round(selected.angle || 0),
      scale: Math.round(((selected.scaleX || 1) + (selected.scaleY || 1)) * 50),
    };
  }, [selected]);

  const toolTitle: Record<ToolId, string> = {
    templates: "Template",
    text: "Tekst",
    media: "Foto",
    elements: "Elemente",
    background: "Sfondi",
    event: "Detajet",
    guests: "Mysafirët",
    layers: "Shtresat",
  };

  const ToolButton = ({ id, icon: Icon, label }: { id: ToolId; icon: any; label: string }) => (
    <button
      onClick={() => { setActiveTool(id); setMobilePanelOpen(true); }}
      className={`group flex w-full flex-col items-center gap-1 rounded-xl px-2 py-2 text-[9px] font-semibold transition ${activeTool === id ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}
    >
      <Icon size={18} strokeWidth={activeTool === id ? 2.2 : 1.7} />
      <span>{label}</span>
    </button>
  );

  const renderToolPanel = (mobile = false) => (
    <div className={mobile ? "h-full overflow-y-auto" : "h-full overflow-y-auto"}>
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-400">Studio</p>
            <h2 className="mt-0.5 text-sm font-bold text-slate-900">{toolTitle[activeTool]}</h2>
          </div>
          {mobile && <button onClick={() => setMobilePanelOpen(false)} className="rounded-full bg-slate-100 p-2"><X size={16} /></button>}
        </div>
      </div>

      <div className="space-y-5 p-4">
        {activeTool === "templates" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-500">Ndryshimi i template-it do të përditësojë dizajnin pa e humbur informacionin tënd ekzistues.</div>
            <div className="grid grid-cols-2 gap-3">
              {invitationTemplates.map(tpl => (
                <button key={tpl.id} onClick={() => applyNewTemplate(tpl)} className="group text-left flex flex-col gap-1">
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 shadow-sm transition-all hover:border-indigo-400 aspect-[4/5] bg-white">
                    <div className="absolute inset-0 pointer-events-none w-full h-full transform origin-top-left" style={{ scale: '0.85' }}>
                       <TemplatePreview template={tpl} />
                    </div>
                  </div>
                  <div className="px-1">
                     <p className="text-[11px] font-bold text-slate-800 truncate">{tpl.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTool === "text" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                ["heading", "Titull", "Aa"],
                ["subheading", "Nëntitull", "Aa"],
                ["body", "Tekst", "T"],
                ["guest", "Mysafiri", "A"],
              ].map(([id, label, mark]) => (
                <button key={id} onClick={() => addTextPreset(id as any)} className="rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className="text-lg font-serif">{mark}</span>
                  <span className="mt-1 block text-[10px] font-bold">{label}</span>
                </button>
              ))}
            </div>

            {selectedText && (
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-slate-500">Font</label>
                  <select value={String(selectedText.fontFamily || "Montserrat")} onChange={(e) => updateSelected("fontFamily", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none">
                    {FONT_OPTIONS.map(group => (
                      <optgroup key={group.group} label={group.group}>
                        {group.values.map(font => <option key={font} value={font}>{font}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-[1fr_82px] gap-2">
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <label className="block text-[9px] font-bold text-slate-400">Madhësia</label>
                    <input type="number" min="6" max="160" value={Math.round(Number(selectedText.fontSize || 16))} onChange={(e) => updateSelected("fontSize", Number(e.target.value))} className="mt-1 w-full text-xs font-semibold outline-none" />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <label className="block text-[9px] font-bold text-slate-400">Spacing</label>
                    <input type="number" value={Math.round(Number(selectedText.charSpacing || 0))} onChange={(e) => updateSelected("charSpacing", Number(e.target.value))} className="mt-1 w-full text-xs font-semibold outline-none" />
                  </div>
                </div>

                <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button onClick={() => updateSelected("fontWeight", selectedText.fontWeight === "bold" ? "normal" : "bold")} className={`flex-1 rounded-lg p-2 ${selectedText.fontWeight === "bold" ? "bg-white shadow-sm" : ""}`}><Bold size={15} className="mx-auto" /></button>
                  <button onClick={() => updateSelected("fontStyle", selectedText.fontStyle === "italic" ? "normal" : "italic")} className={`flex-1 rounded-lg p-2 ${selectedText.fontStyle === "italic" ? "bg-white shadow-sm" : ""}`}><Italic size={15} className="mx-auto" /></button>
                  <button onClick={() => updateSelected("underline", !selectedText.underline)} className={`flex-1 rounded-lg p-2 ${selectedText.underline ? "bg-white shadow-sm" : ""}`}><Underline size={15} className="mx-auto" /></button>
                  <button onClick={() => updateSelected("textAlign", "left")} className="flex-1 rounded-lg p-2"><AlignLeft size={15} className="mx-auto" /></button>
                  <button onClick={() => updateSelected("textAlign", "center")} className="flex-1 rounded-lg p-2"><AlignCenter size={15} className="mx-auto" /></button>
                  <button onClick={() => updateSelected("textAlign", "right")} className="flex-1 rounded-lg p-2"><AlignRight size={15} className="mx-auto" /></button>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-bold text-slate-500">Ngjyra</label>
                  <div className="grid grid-cols-8 gap-1.5">
                    {TEXT_COLORS.map(color => (
                      <button key={color} onClick={() => setTextColor(color)} className="h-7 rounded-full border border-slate-200 shadow-sm" style={{ background: color }} aria-label={color} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTool === "media" && (
          <div className="space-y-3">
            <label className={`flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed p-6 text-center transition ${photoAdded ? "border-slate-200 bg-slate-50" : "border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50"}`}>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-indigo-600 shadow-sm"><Upload size={20} /></div>
              <b className="mt-3 text-xs">Ngarko 1 foto personale</b>
              <span className="mt-1 text-[10px] leading-4 text-slate-400">{photoAdded ? "Ke 1 foto. Zgjidh një tjetër për ta zëvendësuar." : "JPG, PNG · maksimumi 8 MB"}</span>
              <input className="hidden" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
            </label>
            {photoAdded && <button onClick={() => { const photo = canvasRef.current?.getObjects().find(o => (o as DesignObject).role === "personal-photo"); if (photo) { canvasRef.current?.remove(photo); canvasRef.current?.renderAll(); setPhotoAdded(false); } }} className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600">Hiqe foton</button>}
          </div>
        )}

        {activeTool === "elements" && (
          <div className="grid grid-cols-3 gap-2">
            {ELEMENTS.map(item => {
              const Icon = item.icon;
              return <button key={item.id} onClick={() => addElement(item)} className="rounded-2xl border border-slate-200 bg-white p-3 hover:shadow-md transition">
                <Icon size={20} className="mx-auto" style={{ color: item.color }} />
                <span className="mt-2 block text-[9px] font-bold text-slate-600">{item.label}</span>
              </button>;
            })}
          </div>
        )}

        {activeTool === "background" && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-[10px] font-bold text-slate-500">Paleta</label>
              <div className="grid grid-cols-4 gap-2">
                {BACKGROUNDS.map(bg => (
                  <button key={bg.value} onClick={() => changeBackground(bg.value)} title={bg.name} className="aspect-square rounded-xl border border-slate-200 shadow-sm transition hover:scale-105" style={{ background: bg.value }} />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-bold">Atmosferë</p>
              <p className="mt-1 text-[10px] leading-4 text-slate-400">Në versionin final shtohet background library me gradient, paper texture, floral pattern dhe dark luxury.</p>
            </div>
          </div>
        )}

        {activeTool === "event" && (
          <div className="space-y-3">
            {[
              ["title", "Emri i eventit", "p.sh. Arben & Sara"],
              ["host", "Pritësit", "p.sh. Familja Gashi"],
              ["subtitle", "Nëntitulli / Mesazhi", "p.sh. Kemi kënaqësinë t'ju ftojmë"],
              ["venue", "Biznesi / Venue", "p.sh. Hotel Emerald"],
              ["address", "Adresa", "p.sh. Prishtinë, Kosovë"],
              ["date", "Data", "15 Qershor 2026"],
              ["time", "Ora", "19:00"],
            ].map(([key, label, placeholder]) => (
              <label key={key} className="block">
                <span className="mb-1.5 ml-1 block text-[10px] font-bold text-slate-500">{label}</span>
                <input value={event[key as keyof EventInfo]} onChange={(e) => updateEvent(key as keyof EventInfo, e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs font-medium outline-none transition focus:border-slate-500" />
              </label>
            ))}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3 text-[10px] leading-4 text-indigo-700">
              Të dhënat e eventit lidhen me elementet e ftesës përmes fushave dinamike. Kjo lejon që i njëjti dizajn të përdoret për shumë mysafirë.
            </div>
          </div>
        )}

        {activeTool === "guests" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100"><Users size={17} /></div><div><p className="text-xs font-bold">Lista e mysafirëve</p><p className="text-[10px] text-slate-400">Personalizim + RSVP</p></div></div>
              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-semibold text-slate-500">Preview</p>
                <p className="mt-1 font-serif text-lg text-slate-800">I/e dashur {"{{guest_name}}"}</p>
              </div>
            </div>
            <button className="w-full rounded-xl bg-slate-950 px-3 py-3 text-xs font-bold text-white transition hover:bg-slate-800">Menaxho mysafirët</button>
            <p className="text-[10px] leading-4 text-slate-400">Paneli i plotë i mysafirëve dhe RSVP duhet të lidhet me modulin Guests të HALLEVO, jo të krijojë databazë paralele.</p>
          </div>
        )}

        {activeTool === "layers" && (
          <div className="space-y-2">
            {canvas?.getObjects().slice().reverse().map((obj, index) => {
              const o = obj as DesignObject;
              const label = o.dataKey || o.role || (o.type === "i-text" ? "Tekst" : o.type || "Element");
              return (
                <button key={`${label}-${index}`} onClick={() => { canvas?.setActiveObject(obj); canvas?.renderAll(); setSelected(o); }} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${selected === o ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                  <Layers3 size={14} className="text-slate-400" />
                  <span className="truncate text-[10px] font-semibold">{label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#e9ebef] text-slate-900">
      <div className="flex min-h-screen flex-col overflow-hidden bg-[#f5f6f8]">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <button onClick={onBack} className="rounded-xl p-2 hover:bg-slate-100 transition"><ArrowLeft size={18} /></button>
            <div className="hidden h-7 w-px bg-slate-200 sm:block" />
            <div className="min-w-0 flex items-center gap-2">
              <img src="/logo.png" alt="HALLEVO" className="h-6 w-auto hidden sm:block" />
              <div>
                 <p className="truncate text-xs font-bold">Invitation Studio</p>
                 <p className="truncate text-[9px] text-slate-400">{activeTemplate?.name || "Blank invitation"} · {savedState === "saved" ? "Ruajtur" : "Ndryshime pa ruajtur"}</p>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 md:flex">
            <button onClick={handleUndo} className="rounded-lg p-2 text-slate-500 hover:bg-white disabled:opacity-30 transition"><Undo2 size={16} /></button>
            <button onClick={handleRedo} className="rounded-lg p-2 text-slate-500 hover:bg-white disabled:opacity-30 transition"><Redo2 size={16} /></button>
            <div className="mx-1 h-5 w-px bg-slate-200" />
            <button onClick={() => setZoom(z => Math.max(40, z - 10))} className="rounded-lg p-2 text-slate-500 hover:bg-white transition"><ZoomOut size={15} /></button>
            <span className="w-9 text-center text-[10px] font-bold">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(130, z + 10))} className="rounded-lg p-2 text-slate-500 hover:bg-white transition"><ZoomIn size={15} /></button>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={openPreview} className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold sm:flex sm:items-center sm:gap-1.5 hover:bg-slate-50 transition"><Eye size={14} /> Preview</button>
            <button onClick={() => setMyInvitationsOpen(true)} className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold lg:block hover:bg-slate-50 transition">Ftesat e mia</button>
            <button onClick={() => currentUser ? setShareOpen(true) : setRegisterOpen(true)} className="rounded-xl bg-slate-950 px-3 py-2 text-[10px] font-bold text-white shadow-sm hover:bg-slate-800 transition"><Share2 size={14} className="mr-1 inline" /> Ndaj</button>
            <button onClick={saveInvitation} disabled={saving} className="rounded-xl bg-indigo-600 px-3 py-2 text-[10px] font-bold text-white shadow-sm disabled:opacity-50 hover:bg-indigo-700 transition"><Save size={14} className="mr-1 inline" /> {saving ? "..." : "Ruaj"}</button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-[76px] shrink-0 border-r border-slate-200 bg-white p-2 lg:block z-10 shadow-[10px_0_20px_-10px_rgba(0,0,0,0.02)]">
            <div className="space-y-1.5">
              <ToolButton id="templates" icon={Sparkles} label="Template" />
              <ToolButton id="text" icon={Type} label="Tekst" />
              <ToolButton id="media" icon={ImageIcon} label="Foto" />
              <ToolButton id="elements" icon={Sparkles} label="Elemente" />
              <ToolButton id="background" icon={Palette} label="Sfondi" />
              <ToolButton id="event" icon={FileText} label="Detajet" />
              <ToolButton id="guests" icon={Users} label="Mysafirët" />
              <ToolButton id="layers" icon={Layers3} label="Shtresat" />
            </div>
          </aside>

          <aside className="hidden w-[300px] shrink-0 border-r border-slate-200 bg-white lg:block z-10 shadow-[10px_0_20px_-10px_rgba(0,0,0,0.02)]">
            {renderToolPanel(false)}
          </aside>

          {/* RREGULLIMI PËR HEQJEN E SCROLLBARS */}
          <section className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#e9ebef] p-3 sm:p-6">
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(#c7cbd2 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <div 
                className="shadow-[0_30px_80px_rgba(15,23,42,.18)] rounded-[8px] bg-white transition-transform duration-200"
                style={{ 
                   width: CANVAS_W, 
                   height: CANVAS_H, 
                   transform: `scale(${zoom / 100})`,
                   transformOrigin: "center center"
                }}
              >
                <canvas ref={canvasEl} />
              </div>
            </div>

            {selected && (
              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl transition-all">
                <button onClick={duplicateSelected} className="rounded-xl p-2 hover:bg-slate-100 transition" title="Dubliko"><Copy size={15} /></button>
                <button onClick={bringForward} className="rounded-xl p-2 hover:bg-slate-100 transition" title="Sill përpara"><ArrowUp size={15} /></button>
                <button onClick={sendBackward} className="rounded-xl p-2 hover:bg-slate-100 transition" title="Dërgo prapa"><ArrowDown size={15} /></button>
                <button onClick={deleteSelected} className="rounded-xl p-2 text-red-500 hover:bg-red-50 transition" title="Fshi"><Trash2 size={15} /></button>
              </div>
            )}

            <div className="absolute right-4 top-4 z-20 hidden items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-lg sm:flex">
              <button onClick={openPreview} className="rounded-lg p-2 hover:bg-slate-100 transition" title="Preview"><Eye size={15} /></button>
              <button onClick={downloadPng} className="rounded-lg p-2 hover:bg-slate-100 transition" title="Download"><Download size={15} /></button>
              <button onClick={() => setFullscreen(true)} className="rounded-lg p-2 hover:bg-slate-100 transition" title="Fullscreen"><Maximize2 size={15} /></button>
            </div>
          </section>

          <aside className="hidden w-[315px] shrink-0 border-l border-slate-200 bg-white xl:block z-10 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.02)]">
            <div className="border-b border-slate-200 px-4 py-4">
              <div className="flex items-center justify-between">
                <div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-slate-400">Inspector</p><h2 className="mt-1 text-sm font-bold">Properties</h2></div>
                <PanelRight size={17} className="text-slate-400" />
              </div>
            </div>

            {selectedText ? (
              <div className="space-y-4 p-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">Teksti</p>
                  <textarea value={selectedText.text || ""} onChange={(e) => updateSelected("text", e.target.value)} className="mt-2 min-h-[80px] w-full resize-none bg-transparent text-sm font-medium outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-slate-200 p-3"><p className="text-[9px] text-slate-400">X</p><p className="mt-1 text-xs font-bold">{inspector?.left}</p></div>
                  <div className="rounded-xl border border-slate-200 p-3"><p className="text-[9px] text-slate-400">Y</p><p className="mt-1 text-xs font-bold">{inspector?.top}</p></div>
                </div>
                <button onClick={() => setActiveTool("text")} className="w-full rounded-xl bg-slate-950 py-3 text-[10px] font-bold text-white transition hover:bg-slate-800">Hap formatimin e tekstit</button>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold">Asgjë nuk është zgjedhur</p><p className="mt-1 text-[10px] leading-4 text-slate-400">Zgjidh një element në canvas për të parë properties dhe kontrollet.</p></div>
                <button onClick={openPreview} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-[10px] font-bold transition hover:bg-slate-50"><Eye size={14} /> Preview i plotë</button>
              </div>
            )}
          </aside>
        </div>

        <nav className="flex h-[70px] shrink-0 items-center justify-around border-t border-slate-200 bg-white px-1 lg:hidden">
          {[
            ["event", "Detajet", FileText],
            ["text", "Tekst", Type],
            ["elements", "Elemente", Sparkles],
            ["media", "Foto", ImageIcon],
            ["background", "Sfondi", Palette],
            ["guests", "Mysafirët", Users],
          ].map(([id, label, Icon]: any) => (
            <button key={id} onClick={() => { setActiveTool(id); setMobilePanelOpen(true); }} className={`flex min-w-[52px] flex-col items-center gap-1 rounded-xl py-1.5 text-[9px] font-semibold ${activeTool === id ? "text-indigo-600" : "text-slate-500"}`}>
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {mobilePanelOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-[2px] lg:hidden animate-in fade-in" onClick={() => setMobilePanelOpen(false)}>
            <div className="absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-hidden rounded-t-[28px] bg-white shadow-2xl animate-in slide-in-from-bottom" onClick={(e) => e.stopPropagation()}>
              {renderToolPanel(true)}
            </div>
          </div>
        )}

        {/* MODALI I FTESAVE TË MIA BRENDA STUDIO */}
        {myInvitationsOpen && (
          <div className="fixed inset-0 z-[70] bg-slate-950/40 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-lg bg-white shadow-2xl h-full animate-in slide-in-from-right duration-300">
              <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                 <h2 className="text-sm font-bold">Ftesat e mia</h2>
                 <button onClick={() => setMyInvitationsOpen(false)} className="rounded-full bg-slate-100 p-2 hover:bg-slate-200 transition">
                    <X size={16}/>
                 </button>
              </div>
              <div className="p-5 h-[calc(100vh-64px)] overflow-y-auto">
                 <div className="rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between hover:border-indigo-200 transition cursor-pointer">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-xl bg-slate-50 border flex items-center justify-center font-bold text-lg">🎉</div>
                       <div>
                         <p className="text-xs font-bold">{event.title}</p>
                         <p className="mt-1 text-[10px] text-slate-400">{event.date} · {event.venue}</p>
                       </div>
                    </div>
                    <MoreHorizontal size={18} className="text-slate-400" />
                 </div>
              </div>
            </div>
          </div>
        )}

        {registerOpen && (
          <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-0 sm:items-center sm:p-5 animate-in fade-in">
            <div className="w-full max-w-md rounded-t-[28px] bg-white p-6 shadow-2xl sm:rounded-3xl animate-in slide-in-from-bottom sm:zoom-in-95">
              <div className="flex items-start justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-indigo-600">Hapi i fundit</p><h2 className="mt-1 text-xl font-bold">Ruaj dhe publiko ftesën</h2><p className="mt-1 text-xs text-slate-400">Krijo llogarinë pa humbur dizajnin.</p></div><button onClick={() => setRegisterOpen(false)} className="rounded-full bg-slate-100 p-2 hover:bg-slate-200"><X size={17}/></button></div>
              <form className="mt-5 space-y-3" onSubmit={(e) => { e.preventDefault(); const data = new FormData(e.currentTarget); const user = { name: `${data.get("emri")} ${data.get("mbiemri")}`, email: String(data.get("email")) }; localStorage.setItem("hallevo_user", JSON.stringify(user)); setCurrentUser(user); setRegisterOpen(false); setShareOpen(true); }}>
                {[
                  ["emri", "Emri", "Arta"],
                  ["mbiemri", "Mbiemri", "Reshopi"],
                  ["email", "Email", "arta@email.com"],
                  ["password", "Fjalëkalim", "••••••••"],
                  ["confirm", "Konfirmo fjalëkalimin", "••••••••"],
                ].map(([name, label, placeholder]) => <label key={name} className="block"><span className="mb-1 block text-[10px] font-bold text-slate-500">{label}</span><input name={name} required type={name === "email" ? "email" : name === "password" || name === "confirm" ? "password" : "text"} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-xs outline-none focus:border-slate-500" /></label>)}
                <button className="mt-2 w-full rounded-xl bg-slate-950 py-3.5 text-xs font-bold text-white transition hover:bg-slate-800">Krijo llogari & publiko</button>
              </form>
            </div>
          </div>
        )}

        {shareOpen && (
          <div className="fixed inset-0 z-[80] bg-slate-950/40 backdrop-blur-sm animate-in fade-in">
            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-lg rounded-t-[28px] bg-white p-6 sm:inset-y-0 sm:right-0 sm:left-auto sm:rounded-none animate-in slide-in-from-bottom sm:slide-in-from-right">
              <div className="flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-indigo-600">Publikuar</p><h2 className="mt-1 text-lg font-bold">Ndaj ftesën</h2></div><button onClick={() => setShareOpen(false)} className="rounded-full bg-slate-100 p-2 hover:bg-slate-200"><X size={17}/></button></div>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="truncate text-xs font-semibold">{shareUrl}</p><button onClick={shareInvitation} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold shadow-sm transition hover:border-indigo-200 hover:text-indigo-700">{copied ? <Check size={15} className="text-emerald-600"/> : <Link2 size={15}/>} {copied ? "Linku u kopjua" : "Kopjo / Share"}</button></div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a href={`https://wa.me/?text=${encodeURIComponent(`Shiko ftesën time: ${shareUrl}`)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-xs font-bold transition hover:bg-emerald-50 hover:text-emerald-700"><Share2 size={15}/> WhatsApp</a>
                <a href={`mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(`Shiko ftesën: ${shareUrl}`)}`} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-xs font-bold transition hover:bg-blue-50 hover:text-blue-700"><Mail size={15}/> Email</a>
                <button onClick={downloadPng} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-xs font-bold transition hover:bg-slate-50"><Download size={15}/> PNG</button>
                <button onClick={() => alert("PDF export duhet të lidhet me renderer-in e printimit.")} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-xs font-bold transition hover:bg-slate-50"><FileDown size={15}/> PDF</button>
              </div>
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-center"><QrCode className="mx-auto text-slate-500" size={48}/><p className="mt-2 text-[10px] text-slate-400">QR Code i ftesës duhet të gjenerohet nga URL-ja reale e publikimit.</p></div>
            </div>
          </div>
        )}

        {previewOpen && (
          <div className="fixed inset-0 z-[90] flex flex-col bg-[#0f1115] animate-in fade-in">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4 text-white">
              <div className="flex items-center gap-2"><Eye size={17}/><span className="text-sm font-bold">Preview</span></div>
              <button onClick={() => setPreviewOpen(false)} className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition"><X size={17}/></button>
            </div>
            <div className="flex flex-1 items-center justify-center overflow-auto p-5">
              {previewImage && <img src={previewImage} alt="Preview i ftesës" className="max-h-[80vh] max-w-[92vw] rounded-lg shadow-2xl" />}
            </div>
            <div className="flex shrink-0 justify-center gap-2 border-t border-white/10 p-4">
              <button onClick={downloadPng} className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 transition hover:bg-slate-200"><Download size={14} className="mr-1 inline"/> PNG</button>
              <button onClick={() => setFullscreen(true)} className="rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/20"><Maximize2 size={14} className="mr-1 inline"/> Fullscreen</button>
            </div>
          </div>
        )}

        {fullscreen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black p-4 animate-in fade-in">
            <button onClick={() => setFullscreen(false)} className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"><X size={20}/></button>
            {previewImage && <img src={previewImage} alt="Ftesa fullscreen" className="max-h-[92vh] max-w-[92vw] object-contain animate-in zoom-in-95" />}
          </div>
        )}
      </div>
    </main>
  );
}