"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { fetchGarmentFromUrl, saveLook } from "../../services/api";
import type { AvatarBodyProfile, AvatarType } from "../../components/AvatarSelector";
import { CategoryIcon, type Category } from "../closet/page";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { SkinProfile, SOUTH_ASIAN_SKIN_PROFILES } from "../../components/SkinToneSelector";
import RentBuyToggle from "../../components/RentBuyToggle";

/* ── Helper to convert base64 data URL back to File ── */
function dataURLtoFile(dataurl: string, filename: string) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/* ── Types ── */
type CatTab = "tops"|"bottoms"|"dresses"|"outerwear"|"footwear"|"bags"|"jewellery"|"eyewear"|"makeup";

interface WardrobeItem { id: string; name: string; image: string; color: string; category: CatTab; }

interface CurrentLook {
  top: WardrobeItem | null;
  bottom: WardrobeItem | null;
  dress: WardrobeItem | null;
  outerwear: WardrobeItem | null;
  shoes: WardrobeItem | null;
  bag: WardrobeItem | null;
  jewellery: WardrobeItem | null;
  eyewear: WardrobeItem | null;
  lipstick: string | null;
  eyeshadow: string | null;
}

/* ── Mock wardrobe items ── */
const WARDROBE: Record<Exclude<CatTab, "makeup">, WardrobeItem[]> = {
  tops:      [{ id:"t1",name:"White Oxford",image:"/images/white_oxford.png",color:"#f5f5f5",category:"tops" },{ id:"t2",name:"Graphic Tee",image:"/images/graphic_tee.png",color:"#1e3a5f",category:"tops" },{ id:"t3",name:"Silk Blouse",image:"/images/silk_blouse.png",color:"#fbbf24",category:"tops" }],
  bottoms:   [{ id:"b1",name:"Black Jeans",image:"/images/black_jeans.png",color:"#111",category:"bottoms" },{ id:"b2",name:"Velvet Skirt",image:"/images/velvet_skirt.png",color:"#7c3aed",category:"bottoms" },{ id:"b3",name:"Linen Trousers",image:"/images/black_jeans.png",color:"#d4a843",category:"bottoms" }],
  dresses:   [{ id:"d1",name:"Floral Maxi",image:"/images/floral_dress.png",color:"#f472b6",category:"dresses" },{ id:"d2",name:"Satin Slip",image:"/images/satin_dress.png",color:"#fbbf24",category:"dresses" },{ id:"d3",name:"Little Black Dress",image:"/images/little_black_dress.png",color:"#1a1a1a",category:"dresses" }],
  outerwear: [{ id:"o1",name:"Trench Coat",image:"/images/trench_coat.png",color:"#d97706",category:"outerwear" },{ id:"o2",name:"Blazer",image:"/images/blazer.png",color:"#374151",category:"outerwear" }],
  footwear:  [{ id:"f1",name:"White Sneakers",image:"/images/white_sneakers.png",color:"#fff",category:"footwear" },{ id:"f2",name:"Block Heels",image:"/images/heel_pumps.png",color:"#dc2626",category:"footwear" },{ id:"f3",name:"Chelsea Boots",image:"/images/heel_pumps.png",color:"#78350f",category:"footwear" }],
  bags:      [{ id:"bg1",name:"Leather Tote",image:"/images/leather_tote.png",color:"#92400e",category:"bags" },{ id:"bg2",name:"Mini Crossbody",image:"/images/leather_tote.png",color:"#000",category:"bags" }],
  jewellery: [{ id:"j1",name:"Pearl Necklace",image:"/images/pearl_necklace.png",color:"#fde68a",category:"jewellery" },{ id:"j2",name:"Gold Hoops",image:"/images/pearl_necklace.png",color:"#f59e0b",category:"jewellery" }],
  eyewear:   [{ id:"e1",name:"Cat-Eye Sunnies",image:"/images/sunglasses.png",color:"#000",category:"eyewear" },{ id:"e2",name:"Round Frames",image:"/images/sunglasses.png",color:"#92400e",category:"eyewear" }],
};

const CAT_TABS: { id: CatTab; label: string }[] = [
  { id:"tops",      label:"Tops"     },
  { id:"bottoms",   label:"Bottoms"  },
  { id:"dresses",   label:"Dresses"  },
  { id:"outerwear", label:"Outer"    },
  { id:"footwear",  label:"Shoes"    },
  { id:"bags",      label:"Bags"     },
  { id:"jewellery", label:"Jewels"   },
  { id:"eyewear",   label:"Eyewear"  },
  { id:"makeup",     label:"Makeup"   },
];

const LIPSTICK_COLORS = ["#dc143c","#c71585","#8b0000","#ff6b6b","#e75480","#b22222","#ff4500","#d2691e","#cd853f","#f4a460","#ff69b4","#db7093","#c0392b","#922b21","#76448a"];
const EYESHADOW_COLORS = ["#8b008b","#4b0082","#2c3e50","#1a237e","#006064","#004d40","#1b5e20","#33691e","#f57f17","#e65100","#bf360c","#795548","#9e9e9e","#000000","#ffffff"];

const LOOK_SLOTS: { key: keyof CurrentLook; label: string; cat: Category }[] = [
  { key:"top",       label:"Top",        cat:"tops"     },
  { key:"bottom",    label:"Bottom",      cat:"bottoms"  },
  { key:"dress",     label:"Dress",        cat:"dresses"  },
  { key:"outerwear", label:"Outerwear",    cat:"outerwear"},
  { key:"shoes",     label:"Shoes",        cat:"footwear" },
  { key:"bag",       label:"Bag",          cat:"bags"     },
  { key:"jewellery", label:"Jewellery",    cat:"jewellery"},
  { key:"eyewear",   label:"Eyewear",     cat:"eyewear"  },
];

const PROGRESS_MSGS = ["Analysing your look…","Fitting outfit to body…","Rendering fabric details…","Almost done…"];

export default function StudioPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CatTab>("tops");
  const [look, setLook] = useState<CurrentLook>({ top:null,bottom:null,dress:null,outerwear:null,shoes:null,bag:null,jewellery:null,eyewear:null,lipstick:null,eyeshadow:null });
  const [selectedItem, setSelectedItem] = useState<Record<string,string>>({});
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [progressPhase, setProgressPhase] = useState(0);

  // Digital twin (read-only here — edited on /profile)
  const [modelGender, setModelGender] = useState<"female"|"male">("female");
  const [modelAge, setModelAge] = useState("25");
  const [aiBaseImageUrl, setAiBaseImageUrl] = useState<string | null>(null);
  const [bodyProfile, setBodyProfile] = useState<AvatarBodyProfile>({ age: 25, heightCm: 170, weightKg: 65 });
  const [selectedSkinTone, setSelectedSkinTone] = useState<SkinProfile>(SOUTH_ASIAN_SKIN_PROFILES[1]);

  // Look saving states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveOccasion, setSaveOccasion] = useState<"casual"|"work"|"formal"|"party"|"date">("casual");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Link mode
  const [outfitUrl, setOutfitUrl] = useState("");
  const [garmentImageUrl, setGarmentImageUrl] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // On mount: Load persistent body twin & onboarding metrics
  useEffect(() => {
    // 1. Check persistent digital twin in localStorage
    const savedTwin = localStorage.getItem("tf_body_twin");
    if (savedTwin) {
      try {
        const twin = JSON.parse(savedTwin);
        if (twin.skinToneId) {
          const matchedTone = SOUTH_ASIAN_SKIN_PROFILES.find((p) => p.id === twin.skinToneId);
          if (matchedTone) setSelectedSkinTone(matchedTone);
        }
        if (twin.gender) setModelGender(twin.gender);
        if (twin.age) setModelAge(String(twin.age));
        if (twin.avatarUrl) setAiBaseImageUrl(twin.avatarUrl);
        if (twin.heightCm || twin.weightKg) {
          setBodyProfile((prev) => ({
            ...prev,
            heightCm: twin.heightCm || prev.heightCm,
            weightKg: twin.weightKg || prev.weightKg,
          }));
        }
      } catch (e) {
        console.error("Failed to parse persistent digital twin", e);
      }
    }

    const savedSelfie = sessionStorage.getItem("setup_selfie_data");
    if (savedSelfie) {
      if (savedSelfie.startsWith("data:")) {
        try {
          const file = dataURLtoFile(savedSelfie, "selfie.jpg");
          setSelfieFile(file);
          setSelfiePreview(savedSelfie);
        } catch (e) {
          console.error("Failed to parse saved selfie file", e);
        }
      } else {
        setAiBaseImageUrl(savedSelfie);
      }
    }

    const savedProfile = sessionStorage.getItem("setup_profile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setBodyProfile(profile);
        if (profile.age) setModelAge(String(profile.age));
      } catch (e) {
        console.error("Failed to parse saved profile metrics", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!selfieFile) { setSelfiePreview(null); return; }
    if (selfieFile instanceof File) {
      const url = URL.createObjectURL(selfieFile);
      setSelfiePreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selfieFile]);

  useEffect(() => {
    if (!isGenerating) { setProgressPhase(0); return; }
    const id = setInterval(() => {
      setProgressPhase((prev) => (prev + 1) % PROGRESS_MSGS.length);
    }, 3000);
    return () => clearInterval(id);
  }, [isGenerating]);

  const selectItem = (item: WardrobeItem) => {
    setSelectedItem((prev) => {
      const next = { ...prev, [item.category]: item.id };
      if (item.category === "dresses") {
        delete next["tops"];
        delete next["bottoms"];
      } else if (item.category === "tops" || item.category === "bottoms") {
        delete next["dresses"];
      }
      return next;
    });

    const catToSlot: Partial<Record<CatTab, keyof CurrentLook>> = {
      tops:"top", bottoms:"bottom", dresses:"dress", outerwear:"outerwear",
      footwear:"shoes", bags:"bag", jewellery:"jewellery", eyewear:"eyewear",
    };
    const slotKey = catToSlot[item.category];
    if (slotKey) {
      setLook((prev) => {
        const next = { ...prev, [slotKey]: item };
        if (item.category === "dresses") {
          next.top = null;
          next.bottom = null;
        } else if (item.category === "tops" || item.category === "bottoms") {
          next.dress = null;
        }
        return next;
      });
    }
  };

  const removeSlot = (key: keyof CurrentLook) => {
    setLook((prev) => ({ ...prev, [key]: null }));
    const slotDef = LOOK_SLOTS.find((s) => s.key === key);
    if (slotDef) setSelectedItem((prev) => { const n = { ...prev }; delete n[slotDef.cat]; return n; });
  };

  // Live parallax tilt — follows the cursor so the twin feels present, not a static cutout
  const stageRef = useRef<HTMLDivElement>(null);
  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--tilt-x", `${(-y * 8).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(x * 10).toFixed(2)}deg`);
  };
  const handleStageMouseLeave = () => {
    const el = stageRef.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  };

  const fetchGarment = useCallback(async () => {
    if (!outfitUrl.trim()) return;
    setFetchError(null); setGarmentImageUrl(null); setIsFetching(true);
    try {
      const r = await fetchGarmentFromUrl(outfitUrl.trim());
      setGarmentImageUrl(r.garmentImageUrl);
    } catch (e) { setFetchError(e instanceof Error ? e.message : "Failed"); }
    finally { setIsFetching(false); }
  }, [outfitUrl]);

  /* ── Virtual Try-On Handler ── */
  const handleGenerate = async () => {
    if (!selfieFile && !aiBaseImageUrl) { setGenError("Upload your photo or generate an AI model first."); return; }
    const activeOutfitItem = look.top || look.dress;
    if (!activeOutfitItem && !garmentImageUrl) { setGenError("Select or fetch a garment first."); return; }

    setGenError(null); setIsGenerating(true); setResultImage(null);
    try {
      let response;
      if (garmentImageUrl) {
        const form = new FormData();
        if (selfieFile) {
          form.append("selfie", selfieFile);
        } else {
          form.append("selfieUrl", aiBaseImageUrl!);
        }
        form.append("garmentUrl", garmentImageUrl);
        form.append("avatarType", modelGender);
        form.append("age", modelAge);
        form.append("heightCm", String(bodyProfile.heightCm));
        form.append("weightKg", String(bodyProfile.weightKg));
        form.append("garmentCategory", "upper_body");
        form.append("skinPrompt", selectedSkinTone.diffusionPrompt);

        const res = await fetch("/api/tryon", { method: "POST", body: form });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || `Server error ${res.status}`);
        }
        response = await res.json();
      } else {
        const outfitBlob = await fetch(activeOutfitItem!.image).then((r) => r.blob());
        const outfitFile = new File([outfitBlob], "outfit.jpg", { type: "image/jpeg" });
        
        const form = new FormData();
        if (selfieFile) {
          form.append("selfie", selfieFile);
        } else {
          form.append("selfieUrl", aiBaseImageUrl!);
        }
        form.append("outfit", outfitFile);
        form.append("avatarType", modelGender);
        form.append("age", modelAge);
        form.append("heightCm", String(bodyProfile.heightCm));
        form.append("weightKg", String(bodyProfile.weightKg));
        form.append("garmentCategory", look.dress ? "dresses" : "upper_body");
        form.append("skinPrompt", selectedSkinTone.diffusionPrompt);

        const res = await fetch("/api/tryon", { method: "POST", body: form });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || `Server error ${res.status}`);
        }
        response = await res.json();
      }
      setResultImage(response.resultImageUrl);
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveLook = async () => {
    if (!token) {
      setGenError("You must be logged in to save looks.");
      return;
    }
    if (!saveName.trim()) {
      setSaveError("Please enter a name for the look.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const pieces = LOOK_SLOTS.filter((s) => look[s.key] !== null).map((s) => s.cat);
    if (look.lipstick || look.eyeshadow) {
      pieces.push("makeup");
    }

    const gradients = [
      "#3d2f5c",
      "#27272a",
      "#3d2f5c",
      "#3d2f5c",
      "#27272a",
      "#27272a"
    ];
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
    const finalImage = resultImage || look.top?.image || look.dress?.image || "/images/look_brunch.png";

    try {
      await saveLook(token, {
        name: saveName.trim(),
        occasion: saveOccasion,
        image: finalImage,
        pieces,
        gradient: randomGradient
      });
      setShowSaveModal(false);
      setSaveName("");
      router.push("/looks");
    } catch (e: any) {
      setSaveError(e.message || "Failed to save look.");
    } finally {
      setIsSaving(false);
    }
  };

  const filledSlots = LOOK_SLOTS.filter((s) => look[s.key] !== null);
  const hasLook = filledSlots.length > 0 || look.lipstick || look.eyeshadow;

  const displayBaseImage = selfiePreview || aiBaseImageUrl || (modelGender === "male" ? "/images/male_avatar.png" : "/images/female_avatar.png");

  return (
    <>
    <div className="tf2-page" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", overflow: "hidden" }}>

      {/* ══ TOP BAR ═══════════════════════════════════════════════════ */}
      <div className="tf2-studio-top">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="tf2-serif" style={{ fontSize: 20, fontWeight: 600 }}>Threadflank</span>
          <span style={{ width: 1, height: 16, background: "var(--tf-hairline)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--tf-ink-soft)" }}>Studio</span>
        </div>

        {/* Twin chip — identity lives in Profile now, Studio is outfits only */}
        <Link href="/profile" className="tf2-twin-chip">
          <img
            src={displayBaseImage}
            alt="Your digital twin"
            onError={(e) => { (e.target as HTMLImageElement).src = modelGender === "male" ? "/images/male_avatar.png" : "/images/female_avatar.png"; }}
          />
          <span>{modelGender === "male" ? "Male" : "Female"} Twin · {modelAge}y — Edit in Profile</span>
        </Link>
      </div>

      {/* ══ BODY ══════════════════════════════════════════════════════ */}
      <div className="tf2-studio-shell">

      {/* ── LEFT — Categories & Item Picker ────────────────────────── */}
      <div className="tf2-studio-left tf2-glass">
        {/* Category tabs — bubble style */}
        <div className="tf2-bubble-row">
          {CAT_TABS.map((t) => (
            <button key={t.id} type="button" className={`tf2-bubble-item${activeTab === t.id ? " active" : ""}`}
              onClick={() => setActiveTab(t.id)}>
              <span className="tf2-bubble">
                <CategoryIcon id={t.id as Category} />
              </span>
              <span className="tf2-bubble-label">{t.label}</span>
            </button>
          ))}
        </div>
        <div className="tf2-studio-hairline" />

        {activeTab === "makeup" ? (
          /* ── Makeup panel ─────────────────────────────────────────── */
          <div className="makeup-panel">
            <div className="makeup-section">
              <p className="makeup-section-title">Lipstick</p>
              <div className="color-swatches">
                {LIPSTICK_COLORS.map((c) => (
                  <div key={c} className={`color-swatch${look.lipstick === c ? " active" : ""}`}
                    style={{ background: c }}
                    onClick={() => setLook((prev) => ({ ...prev, lipstick: prev.lipstick === c ? null : c }))} />
                ))}
              </div>
            </div>

            <div className="makeup-section">
              <p className="makeup-section-title">Eye Shadow</p>
              <div className="color-swatches">
                {EYESHADOW_COLORS.map((c) => (
                  <div key={c} className={`color-swatch${look.eyeshadow === c ? " active" : ""}`}
                    style={{ background: c }}
                    onClick={() => setLook((prev) => ({ ...prev, eyeshadow: prev.eyeshadow === c ? null : c }))} />
                ))}
              </div>
            </div>

            <div className="makeup-section">
              <p className="makeup-section-title">Blush Intensity</p>
              <div className="intensity-row">
                <span className="intensity-label">None</span>
                <input type="range" className="intensity-slider" min={0} max={100} defaultValue={0} />
                <span className="intensity-label">Heavy</span>
              </div>
            </div>

            <div className="makeup-section">
              <p className="makeup-section-title">Try from Link</p>
              <div style={{ display:"flex", gap:6, marginBottom: 8 }}>
                <input
                  type="url"
                  value={outfitUrl}
                  onChange={(e) => setOutfitUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchGarment()}
                  placeholder="Paste product URL…"
                  style={{ flex:1, padding:"10px 12px", background:"var(--tf-surface)", border:"1px solid var(--tf-hairline)", borderRadius:"10px", color:"var(--tf-ink)", fontSize:12, outline:"none" }}
                />
                <button type="button" className="tf2-btn tf2-btn-dark tf2-btn-sm" onClick={fetchGarment} disabled={isFetching || !outfitUrl.trim()}>
                  {isFetching ? <span className="spinner spinner-sm" /> : "Fetch"}
                </button>
              </div>
              {fetchError && <p style={{ fontSize:11, color:"#c0392b" }}>{fetchError}</p>}
              {garmentImageUrl && (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                  <img src={garmentImageUrl} alt="Fetched" style={{ width:"100%", borderRadius:"14px", border:"1px solid var(--tf-hairline)" }} />
                  <RentBuyToggle buyPrice={4990} />
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── Clothing / accessory items ─────────────────────────── */
          <div className="tf2-garment-grid">
            {(WARDROBE[activeTab as Exclude<CatTab, "makeup">] ?? []).length === 0 ? (
              <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"30px 10px" }}>
                <div style={{ display: "inline-flex", padding: 12, borderRadius: "50%", background: "var(--tf-ivory)", color: "var(--tf-ink-faint)", marginBottom: 10 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </div>
                <p style={{ fontSize:12, color:"var(--tf-ink-faint)" }}>No {activeTab} in wardrobe yet</p>
              </div>
            ) : (
              (WARDROBE[activeTab as Exclude<CatTab, "makeup">] ?? []).map((item) => {
                const isSelected = selectedItem[item.category] === item.id;
                return (
                  <div
                    key={item.id}
                    className={`tf2-garment-card${isSelected ? " selected" : ""}`}
                    onClick={() => selectItem(item)}
                  >
                    <img
                      className="tf2-garment-card-img"
                      src={item.image}
                      alt={item.name}
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <div className="tf2-garment-card-name" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, border: "1px solid var(--tf-hairline)", flexShrink: 0 }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ══ CENTER — Avatar Stage ════════════════════════════════════ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 0 }}>

        <div className="tf2-studio-stage tf2-glass">
          <span className="tf2-live-badge">
            <span className="tf2-live-dot" />
            Live twin
          </span>
          <div className="tf2-stage-glow" />

          {/* Loading overlay for AI try-on */}
          {isGenerating && (
            <div style={{ position: "absolute", inset: 0, zIndex: 100, background: "color-mix(in oklch, var(--tf-surface) 88%, transparent)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
              <div className="spinner spinner-lg" />
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--tf-ink)", margin: 0 }}>{PROGRESS_MSGS[progressPhase]}</p>
              <p style={{ fontSize: 12, color: "var(--tf-ink-faint)", margin: 0 }}>Usually 30–90 seconds</p>
            </div>
          )}

          <div
            ref={stageRef}
            className="avatar-tilt-wrap"
            onMouseMove={handleStageMouseMove}
            onMouseLeave={handleStageMouseLeave}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", position: "relative", zIndex: 1 }}
          >
            {resultImage ? (
              <img key={resultImage} src={resultImage} alt="AI try-on result" className="tf2-stage-img" />
            ) : (
              <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img
                  key={displayBaseImage}
                  src={displayBaseImage}
                  alt="Base digital twin model"
                  className="tf2-stage-img"
                />

                {/* Interactive Wardrobe Layering Labels */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                  {look.top && (
                    <div className="avatar-clothing-tag" style={{ top: "25%", left: "10%", pointerEvents: "auto" }}>
                      <span className="avatar-tag-dot" style={{ background: look.top.color }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>Top: {look.top.name}</span>
                    </div>
                  )}
                  {look.dress && (
                    <div className="avatar-clothing-tag" style={{ top: "35%", left: "10%", pointerEvents: "auto" }}>
                      <span className="avatar-tag-dot" style={{ background: look.dress.color }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>Dress: {look.dress.name}</span>
                    </div>
                  )}
                  {look.bottom && (
                    <div className="avatar-clothing-tag" style={{ top: "58%", right: "10%", pointerEvents: "auto" }}>
                      <span className="avatar-tag-dot" style={{ background: look.bottom.color }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>Bottom: {look.bottom.name}</span>
                    </div>
                  )}
                  {look.shoes && (
                    <div className="avatar-clothing-tag" style={{ bottom: "16%", left: "15%", pointerEvents: "auto" }}>
                      <span className="avatar-tag-dot" style={{ background: look.shoes.color }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>Shoes: {look.shoes.name}</span>
                    </div>
                  )}
                  {look.outerwear && (
                    <div className="avatar-clothing-tag" style={{ top: "22%", right: "10%", pointerEvents: "auto" }}>
                      <span className="avatar-tag-dot" style={{ background: look.outerwear.color }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>Outer: {look.outerwear.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {genError && (
          <div style={{ padding:"10px 16px", background:"#fdf0ee", border:"1px solid #f3c9c2", borderRadius: 12, color:"#b3341c", fontSize:12, display:"flex", gap:8, alignItems:"center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {genError}
          </div>
        )}

        {/* Center panel actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" className="tf2-btn tf2-btn-primary" style={{ flex:1 }} onClick={handleGenerate} disabled={isGenerating || (!selfieFile && !aiBaseImageUrl)}>
            {isGenerating
              ? <><span className="spinner spinner-sm" style={{ borderColor:"rgba(255,255,255,0.3)", borderTopColor:"#fff" }} /> Generating AI Look…</>
              : "Generate this look"}
          </button>

          {resultImage && (
            <>
              <button type="button" className="tf2-btn tf2-btn-ghost tf2-btn-sm" onClick={() => { const a = document.createElement("a"); a.href=resultImage; a.download="look.png"; a.click(); }}>Download</button>
              <button type="button" className="tf2-btn tf2-btn-ghost tf2-btn-sm" onClick={() => setResultImage(null)}>Reset</button>
            </>
          )}
        </div>
      </div>

      {/* ══ RIGHT — Look Builder ════════════════════════════════════════ */}
      <div className="tf2-studio-right tf2-glass">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--tf-ink)" }}>Current Look</span>
          {hasLook && (
            <button type="button" style={{ fontSize:11, color:"var(--tf-accent)", background:"none", border:"none", cursor:"pointer", fontWeight:600 }}
              onClick={() => { setLook({ top:null,bottom:null,dress:null,outerwear:null,shoes:null,bag:null,jewellery:null,eyewear:null,lipstick:null,eyeshadow:null }); setSelectedItem({}); }}>
              Clear all
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {LOOK_SLOTS.map((slot) => {
            const item = look[slot.key] as WardrobeItem | null;
            return (
              <div key={slot.key} className={`tf2-look-row${item ? "" : " empty"}`}>
                {item ? (
                  <>
                    <img className="tf2-look-thumb" src={item.image} alt={item.name} />
                    <span className="tf2-look-name">{item.name}</span>
                    <span className="tf2-look-cat">{slot.label}</span>
                    <button type="button" className="tf2-look-remove" onClick={() => removeSlot(slot.key)}>×</button>
                  </>
                ) : (
                  <>
                    <span className="tf2-look-thumb" />
                    <span style={{ fontSize: 12.5, color: "var(--tf-ink-faint)", flex: 1 }}>Add {slot.label.toLowerCase()}</span>
                  </>
                )}
              </div>
            );
          })}

          {/* Makeup slots */}
          {(look.lipstick || look.eyeshadow) && (
            <div style={{ borderTop:"1px solid var(--tf-hairline)", paddingTop:10, marginTop:4, display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontSize:10, fontWeight:700, color:"var(--tf-ink-faint)", textTransform:"uppercase", letterSpacing:"0.08em", margin: 0 }}>Makeup</p>
              {look.lipstick && (
                <div className="tf2-look-row">
                  <span className="tf2-look-thumb" style={{ background: look.lipstick }} />
                  <span className="tf2-look-name">Lipstick</span>
                  <button type="button" className="tf2-look-remove" onClick={() => setLook((p) => ({ ...p, lipstick:null }))}>×</button>
                </div>
              )}
              {look.eyeshadow && (
                <div className="tf2-look-row">
                  <span className="tf2-look-thumb" style={{ background: look.eyeshadow }} />
                  <span className="tf2-look-name">Eye shadow</span>
                  <button type="button" className="tf2-look-remove" onClick={() => setLook((p) => ({ ...p, eyeshadow:null }))}>×</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button type="button" className="tf2-btn tf2-btn-dark" style={{ width:"100%" }} disabled={!hasLook} onClick={() => { setSaveError(null); setShowSaveModal(true); }}>
            Save this look
          </button>
          <button type="button" className="tf2-btn tf2-btn-ghost" style={{ width:"100%" }} disabled={!resultImage}>
            Share
          </button>
        </div>
      </div>
      </div>
    </div>

    {/* ══ Save Look Modal ════════════════════════════════════ */}
    {showSaveModal && (
      <div className="tf2-page" style={{ position: "fixed", inset: 0, background: "oklch(23% 0.015 50 / 0.35)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
        <div className="tf2-card" style={{ maxWidth: "420px", width: "100%", padding: "28px", display: "flex", flexDirection: "column", gap: "20px", background: "var(--tf-surface)" }}>
          <div>
            <h3 className="tf2-serif" style={{ fontSize: "24px", fontWeight: "600", color: "var(--tf-ink)", marginBottom: "6px" }}>Save current look</h3>
            <p style={{ fontSize: "13px", color: "var(--tf-ink-soft)" }}>Give this outfit combo a name and select the occasion category.</p>
          </div>

          {saveError && (
            <div style={{ padding: "10px 14px", background: "#fdf0ee", border: "1px solid #f3c9c2", borderRadius: "10px", color: "#b3341c", fontSize: "12px" }}>
              {saveError}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--tf-ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Look Name</label>
            <input
              type="text"
              placeholder="e.g. Summer Brunch, Friday Party"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--tf-ivory)",
                border: "1px solid var(--tf-hairline)",
                borderRadius: "10px",
                color: "var(--tf-ink)",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--tf-ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Occasion</label>
            <select
              value={saveOccasion}
              onChange={(e) => setSaveOccasion(e.target.value as any)}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--tf-ivory)",
                border: "1px solid var(--tf-hairline)",
                borderRadius: "10px",
                color: "var(--tf-ink)",
                outline: "none",
              }}
            >
              <option value="casual">Casual</option>
              <option value="work">Work</option>
              <option value="formal">Formal</option>
              <option value="party">Party</option>
              <option value="date">Date Night</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              className="tf2-btn tf2-btn-ghost"
              style={{ flex: 1 }}
              onClick={() => { setShowSaveModal(false); setSaveName(""); setSaveError(null); }}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="tf2-btn tf2-btn-primary"
              style={{ flex: 1 }}
              onClick={handleSaveLook}
              disabled={isSaving || !saveName.trim()}
            >
              {isSaving ? "Saving..." : "Save Look"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
