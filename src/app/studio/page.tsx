"use client";
import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { generateOutfitTryOn, fetchGarmentFromUrl, tryOnFromUrl, saveLook } from "../../services/api";
import type { AvatarBodyProfile, AvatarType } from "../../components/AvatarSelector";
import { CategoryIcon } from "../wardrobe/page";
import dynamic from "next/dynamic";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

// Dynamically import 3D components (client-only)
const AvatarViewer3D = dynamic(
  () => import("../../components/AvatarViewer3D").then(m => ({ default: m.AvatarViewer3D })),
  { ssr: false, loading: () => <div className="avatar-3d-loading"><div className="rpm-spinner" /><p>Loading 3D…</p></div> }
);
const ReadyPlayerMeCreator = dynamic(
  () => import("../../components/ReadyPlayerMeCreator").then(m => ({ default: m.ReadyPlayerMeCreator })),
  { ssr: false }
);

/* ── Types ─────────────────────────────────────────────────────────────────── */
type CatTab = "tops"|"bottoms"|"dresses"|"outerwear"|"footwear"|"bags"|"jewellery"|"eyewear"|"makeup";
type GarmentCat = "upper_body"|"lower_body"|"dresses";

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

/* ── Mock wardrobe items per category with high-quality generated images ──── */
const WARDROBE: Record<CatTab, WardrobeItem[]> = {
  tops:      [{ id:"t1",name:"White Oxford",image:"/images/white_oxford.png",color:"#f5f5f5",category:"tops" },{ id:"t2",name:"Graphic Tee",image:"/images/graphic_tee.png",color:"#1e3a5f",category:"tops" },{ id:"t3",name:"Silk Blouse",image:"/images/silk_blouse.png",color:"#fbbf24",category:"tops" }],
  bottoms:   [{ id:"b1",name:"Black Jeans",image:"/images/black_jeans.png",color:"#111",category:"bottoms" },{ id:"b2",name:"Velvet Skirt",image:"/images/velvet_skirt.png",color:"#7c3aed",category:"bottoms" },{ id:"b3",name:"Linen Trousers",image:"/images/black_jeans.png",color:"#d4a843",category:"bottoms" }],
  dresses:   [{ id:"d1",name:"Floral Maxi",image:"/images/floral_dress.png",color:"#f472b6",category:"dresses" },{ id:"d2",name:"Satin Slip",image:"/images/satin_dress.png",color:"#fbbf24",category:"dresses" },{ id:"d3",name:"Little Black Dress",image:"/images/little_black_dress.png",color:"#1a1a1a",category:"dresses" }],
  outerwear: [{ id:"o1",name:"Trench Coat",image:"/images/trench_coat.png",color:"#d97706",category:"outerwear" },{ id:"o2",name:"Blazer",image:"/images/blazer.png",color:"#374151",category:"outerwear" }],
  footwear:  [{ id:"f1",name:"White Sneakers",image:"/images/white_sneakers.png",color:"#fff",category:"footwear" },{ id:"f2",name:"Block Heels",image:"/images/heel_pumps.png",color:"#dc2626",category:"footwear" },{ id:"f3",name:"Chelsea Boots",image:"/images/heel_pumps.png",color:"#78350f",category:"footwear" }],
  bags:      [{ id:"bg1",name:"Leather Tote",image:"/images/leather_tote.png",color:"#92400e",category:"bags" },{ id:"bg2",name:"Mini Crossbody",image:"/images/leather_tote.png",color:"#000",category:"bags" }],
  jewellery: [{ id:"j1",name:"Pearl Necklace",image:"/images/pearl_necklace.png",color:"#fde68a",category:"jewellery" },{ id:"j2",name:"Gold Hoops",image:"/images/pearl_necklace.png",color:"#f59e0b",category:"jewellery" }],
  eyewear:   [{ id:"e1",name:"Cat-Eye Sunnies",image:"/images/sunglasses.png",color:"#000",category:"eyewear" },{ id:"e2",name:"Round Frames",image:"/images/sunglasses.png",color:"#92400e",category:"eyewear" }],
  makeup:    [],
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

const LOOK_SLOTS: { key: keyof CurrentLook; label: string; cat: CatTab }[] = [
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
  const [view, setView] = useState<"front"|"back"|"side">("front");
  const [avatarGender, setAvatarGender] = useState<"man"|"woman">("man");
  const [avatarUrl, setAvatarUrl]       = useState<string | null>(null);
  const [showRPM, setShowRPM]           = useState(false);

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

  useEffect(() => {
    if (!selfieFile) { setSelfiePreview(null); return; }
    const url = URL.createObjectURL(selfieFile);
    setSelfiePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [selfieFile]);

  useEffect(() => {
    if (!isGenerating) { setProgressPhase(0); return; }
    let i = 0;
    const id = setInterval(() => { i = (i+1) % PROGRESS_MSGS.length; setProgressPhase(i); }, 3000);
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

  const fetchGarment = useCallback(async () => {
    if (!outfitUrl.trim()) return;
    setFetchError(null); setGarmentImageUrl(null); setIsFetching(true);
    try {
      const r = await fetchGarmentFromUrl(outfitUrl.trim());
      setGarmentImageUrl(r.garmentImageUrl);
    } catch (e) { setFetchError(e instanceof Error ? e.message : "Failed"); }
    finally { setIsFetching(false); }
  }, [outfitUrl]);

  const handleGenerate = async () => {
    if (!selfieFile) { setGenError("Upload your photo first in the Upload section."); return; }
    const activeOutfitItem = look.top || look.dress;
    if (!activeOutfitItem && !garmentImageUrl) { setGenError("Select or fetch a garment first."); return; }

    setGenError(null); setIsGenerating(true); setResultImage(null);
    try {
      let response;
      if (garmentImageUrl) {
        response = await tryOnFromUrl({ selfieFile, garmentUrl: garmentImageUrl, garmentCategory: "upper_body" });
      } else {
        const outfitBlob = await fetch(selfiePreview!).then((r) => r.blob());
        const outfitFile = new File([outfitBlob], "outfit.jpg", { type: "image/jpeg" });
        response = await generateOutfitTryOn({
          avatarType: "female", bodyProfile: { age:25, heightCm:170, weightKg:65 },
          selfieFile, outfitFile, garmentCategory: look.dress ? "dresses" : "upper_body",
        });
      }
      setResultImage(response.resultImageUrl);
    } catch (e) { setGenError(e instanceof Error ? e.message : "Generation failed"); }
    finally { setIsGenerating(false); }
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
      "linear-gradient(135deg,#f472b6,#7c3aed)",
      "linear-gradient(135deg,#1e3a5f,#374151)",
      "linear-gradient(135deg,#4a1942,#7c3aed)",
      "linear-gradient(135deg,#881337,#db2777)",
      "linear-gradient(135deg,#111827,#374151)",
      "linear-gradient(135deg,#7c2d12,#92400e)"
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

  return (
    <>
    <div className="studio-page">

      {/* ══ LEFT — Item Picker ══════════════════════════════════════════ */}
      <div className="studio-left">
        <div className="studio-left-header">
          <p className="studio-left-title">Your Wardrobe</p>
          {/* Category tabs */}
          <div className="cat-tabs">
            {CAT_TABS.map((t) => (
              <button key={t.id} type="button" className={`cat-tab${activeTab === t.id ? " active" : ""}`}
                onClick={() => setActiveTab(t.id)}>
                <span className="cat-tab-icon" style={{ display: "flex", alignItems: "center" }}>
                  <CategoryIcon id={t.id} />
                </span>
                <span className="cat-tab-label">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Makeup panel ─────────────────────────────────────────── */}
        {activeTab === "makeup" ? (
          <div className="makeup-panel">
            <div className="makeup-section">
              <p className="makeup-section-title">💋 Lipstick</p>
              <div className="color-swatches">
                {LIPSTICK_COLORS.map((c) => (
                  <div key={c} className={`color-swatch${look.lipstick === c ? " active" : ""}`}
                    style={{ background: c }}
                    onClick={() => setLook((prev) => ({ ...prev, lipstick: prev.lipstick === c ? null : c }))} />
                ))}
              </div>
            </div>

            <div className="makeup-section">
              <p className="makeup-section-title">👁️ Eye Shadow</p>
              <div className="color-swatches">
                {EYESHADOW_COLORS.map((c) => (
                  <div key={c} className={`color-swatch${look.eyeshadow === c ? " active" : ""}`}
                    style={{ background: c }}
                    onClick={() => setLook((prev) => ({ ...prev, eyeshadow: prev.eyeshadow === c ? null : c }))} />
                ))}
              </div>
            </div>

            <div className="makeup-section">
              <p className="makeup-section-title">🌸 Blush Intensity</p>
              <div className="intensity-row">
                <span className="intensity-label">None</span>
                <input type="range" className="intensity-slider" min={0} max={100} defaultValue={0} />
                <span className="intensity-label">Heavy</span>
              </div>
            </div>

            <div className="makeup-section">
              <p className="makeup-section-title">🔗 Try from Link</p>
              <div style={{ display:"flex", gap:6, marginBottom: 8 }}>
                <input
                  type="url"
                  value={outfitUrl}
                  onChange={(e) => setOutfitUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchGarment()}
                  placeholder="Paste product URL…"
                  style={{ flex:1, padding:"8px 10px", background:"var(--bg-soft)", border:"1px solid var(--card-border)", borderRadius:"var(--r-sm)", color:"var(--text)", fontSize:12, outline:"none" }}
                />
                <button type="button" className="btn btn-gradient btn-sm" onClick={fetchGarment} disabled={isFetching || !outfitUrl.trim()}>
                  {isFetching ? <span className="spinner spinner-sm" /> : "Fetch"}
                </button>
              </div>
              {fetchError && <p style={{ fontSize:11, color:"var(--danger)" }}>{fetchError}</p>}
              {garmentImageUrl && <img src={garmentImageUrl} alt="Fetched" style={{ width:"100%", borderRadius:"var(--r-md)", border:"1px solid var(--card-border)", marginTop:8 }} />}
            </div>
          </div>
        ) : (
          /* ── Clothing / accessory items ─────────────────────────── */
          <div className="studio-item-list">
            {(WARDROBE[activeTab] ?? []).length === 0 ? (
              <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"30px 10px" }}>
                <div style={{ fontSize:36, marginBottom:10 }}>🛍️</div>
                <p style={{ fontSize:12, color:"var(--muted)" }}>No {activeTab} in wardrobe yet</p>
              </div>
            ) : (
              (WARDROBE[activeTab] ?? []).map((item) => {
                const isSelected = selectedItem[item.category] === item.id;
                const catEmojis: Record<string, string> = {
                  tops: "👕", bottoms: "👖", dresses: "👗", outerwear: "🧥",
                  footwear: "👟", bags: "👜", jewellery: "📿", eyewear: "🕶️"
                };
                return (
                  <div
                    key={item.id}
                    className={`studio-item-card${isSelected ? " selected" : ""}`}
                    onClick={() => selectItem(item)}
                  >
                    <div className="studio-item-image-wrapper" style={{ background: `${item.color}15` }}>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="item-placeholder-icon">
                        {catEmojis[item.category] || "👕"}
                      </span>
                      {isSelected && <span className="studio-item-check">✓</span>}
                    </div>
                    <div className="studio-item-meta">
                      <p className="studio-item-name" title={item.name}>{item.name}</p>
                      <span className="studio-item-color-dot" style={{ background: item.color }} />
                    </div>
                  </div>
                );
              })
            )}

            {/* Upload selfie mini-zone */}
            {activeTab === "tops" && (
              <label className="studio-upload-btn">
                <input type="file" accept="image/*" style={{ display:"none" }} onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)} />
                {selfiePreview ? (
                  <img src={selfiePreview} alt="you" style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", border:"2px solid var(--purple)", flexShrink:0 }} />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, color:"var(--purple)" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                )}
                <span style={{ color:"var(--purple)", fontWeight:600 }}>
                  {selfiePreview ? "Photo uploaded" : "Upload your selfie for AI try-on"}
                </span>
                {selfiePreview && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginLeft:"auto" }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </label>
            )}
          </div>
        )}
      </div>

      {/* ══ CENTER — Avatar Stage ═══════════════════════════════════════ */}
      <div className="studio-center">
        {/* View switcher */}
        <div className="studio-center-toolbar">
          {(["front","back","side"] as const).map((v) => (
            <button key={v} type="button" className={`view-btn${view === v ? " active" : ""}`}
              onClick={() => setView(v)}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading overlay */}
        {isGenerating && (
          <div className="studio-loading">
            <div className="spinner spinner-lg" />
            <p className="studio-loading-title">{PROGRESS_MSGS[progressPhase]}</p>
            <p className="studio-loading-sub">Usually 30–90 seconds</p>
          </div>
        )}

        {/* Avatar Stage — 3D Canvas */}
        <div className="studio-avatar-stage">
          <div className="avatar-container" style={{ position:"relative" }}>

            {/* Clothing label tags */}
            {!resultImage && (
              <>
                {look.top && (
                  <div className="avatar-clothing-tag" style={{ top:"20%", left:"4%", zIndex:20 }}>
                    <span className="avatar-tag-dot" style={{ background:look.top.color }} />
                    <span style={{ fontSize:10, fontWeight:700, color:"#fff" }}>{look.top.name}</span>
                  </div>
                )}
                {look.dress && (
                  <div className="avatar-clothing-tag" style={{ top:"32%", left:"4%", zIndex:20 }}>
                    <span className="avatar-tag-dot" style={{ background:look.dress.color }} />
                    <span style={{ fontSize:10, fontWeight:700, color:"#fff" }}>{look.dress.name}</span>
                  </div>
                )}
                {look.bottom && (
                  <div className="avatar-clothing-tag" style={{ top:"60%", right:"4%", zIndex:20 }}>
                    <span className="avatar-tag-dot" style={{ background:look.bottom.color }} />
                    <span style={{ fontSize:10, fontWeight:700, color:"#fff" }}>{look.bottom.name}</span>
                  </div>
                )}
                {look.shoes && (
                  <div className="avatar-clothing-tag" style={{ bottom:"14%", right:"4%", zIndex:20 }}>
                    <span className="avatar-tag-dot" style={{ background:look.shoes.color }} />
                    <span style={{ fontSize:10, fontWeight:700, color:"#fff" }}>{look.shoes.name}</span>
                  </div>
                )}
                {look.outerwear && (
                  <div className="avatar-clothing-tag" style={{ top:"18%", right:"4%", zIndex:20 }}>
                    <span className="avatar-tag-dot" style={{ background:look.outerwear.color }} />
                    <span style={{ fontSize:10, fontWeight:700, color:"#fff" }}>{look.outerwear.name}</span>
                  </div>
                )}
              </>
            )}

            {resultImage ? (
              <img src={resultImage} alt="AI try-on result" className="avatar-result-img" />
            ) : (
              /* ── 3D Canvas ── */
              <div style={{ position:"absolute", inset:0 }}>
                <AvatarViewer3D
                  avatarUrl={avatarUrl}
                  gender={avatarGender}
                  clothingColors={{
                    top:       look.top?.color       ?? null,
                    bottom:    look.bottom?.color    ?? null,
                    dress:     look.dress?.color     ?? null,
                    outerwear: look.outerwear?.color ?? null,
                    shoes:     look.shoes?.color     ?? null,
                  }}
                />
              </div>
            )}

            {/* ── Gender selector (bottom-center) ── */}
            {!resultImage && (
              <div className="avatar-gender-selector" style={{ zIndex:20 }}>
                <button id="gender-man-btn" className={`gender-btn${avatarGender==="man"?" active":""}`}
                  onClick={() => setAvatarGender("man")}>
                  <span className="gender-circle" style={{
                    background:  avatarGender==="man" ? "#10b981" : "transparent",
                    borderColor: avatarGender==="man" ? "#10b981" : "rgba(255,255,255,0.25)"
                  }} />
                  <span>MAN</span>
                </button>
                <button id="gender-woman-btn" className={`gender-btn${avatarGender==="woman"?" active":""}`}
                  onClick={() => setAvatarGender("woman")}>
                  <span className="gender-circle" style={{
                    background:  avatarGender==="woman" ? "rgba(255,220,230,0.8)" : "transparent",
                    borderColor: avatarGender==="woman" ? "#f472b6" : "rgba(255,255,255,0.25)"
                  }} />
                  <span>WOMAN</span>
                </button>
              </div>
            )}

            {/* Ready Player Me avatar creation is disabled due to network resolution limits */}

          </div>
        </div>

        {/* Error */}
        {genError && (
          <div style={{ padding:"10px 20px", background:"rgba(239,68,68,0.1)", borderTop:"1px solid rgba(239,68,68,0.2)", color:"var(--danger)", fontSize:12, display:"flex", gap:8, alignItems:"center" }}>
            ⚠ {genError}
          </div>
        )}

        {/* Bottom toolbar */}
        <div className="studio-center-bottom">
          <button type="button" className="btn-icon" title="Undo" onClick={() => {}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
          </button>

          <button type="button" className="btn btn-gradient" style={{ flex:1 }} onClick={handleGenerate} disabled={isGenerating || !selfieFile}>
            {isGenerating
              ? <><span className="spinner spinner-sm" style={{ borderColor:"rgba(255,255,255,0.25)", borderTopColor:"#fff" }} /> Generating…</>
              : "Generate AI Look"}
          </button>

          {resultImage && (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { const a = document.createElement("a"); a.href=resultImage; a.download="look.png"; a.click(); }}>Download</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setResultImage(null)}>Reset</button>
            </>
          )}
        </div>
      </div>

      {/* ══ RIGHT — Look Builder ════════════════════════════════════════ */}
      <div className="studio-right">
        <div className="studio-right-header">
          <span className="studio-right-title">Current Look</span>
          {hasLook && (
            <button type="button" style={{ fontSize:11, color:"var(--danger)", background:"none", border:"none", cursor:"pointer", fontWeight:600 }}
              onClick={() => { setLook({ top:null,bottom:null,dress:null,outerwear:null,shoes:null,bag:null,jewellery:null,eyewear:null,lipstick:null,eyeshadow:null }); setSelectedItem({}); }}>
              Clear All
            </button>
          )}
        </div>

        <div className="look-slots">
          {LOOK_SLOTS.map((slot) => {
            const item = look[slot.key] as WardrobeItem | null;
            return (
              <div key={slot.key} className={`look-slot${item ? " filled" : ""}`}>
                <span className="look-slot-icon" style={{ display: "flex", alignItems: "center" }}>
                  <CategoryIcon id={slot.cat} />
                </span>
                <span className="look-slot-label">{item ? item.name : slot.label}</span>
                {item ? (
                  <>
                    <div className="look-slot-thumb" style={{ background:`${item.color}33`, padding: 0 }}>
                      <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} />
                    </div>
                    <button type="button" className="look-slot-remove" onClick={() => removeSlot(slot.key)}>×</button>
                  </>
                ) : (
                  <span style={{ fontSize:11, color:"var(--muted)", marginLeft:"auto" }}>—</span>
                )}
              </div>
            );
          })}

          {/* Makeup slots */}
          {(look.lipstick || look.eyeshadow) && (
            <div style={{ borderTop:"1px solid var(--card-border)", paddingTop:10, marginTop:4 }}>
              <p style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Makeup</p>
              {look.lipstick && (
                <div className="look-slot filled">
                  <span className="look-slot-icon">💋</span>
                  <span className="look-slot-label">Lipstick</span>
                  <div className="look-slot-thumb" style={{ background:look.lipstick, border:`2px solid ${look.lipstick}` }} />
                  <button type="button" className="look-slot-remove" onClick={() => setLook((p) => ({ ...p, lipstick:null }))}>×</button>
                </div>
              )}
              {look.eyeshadow && (
                <div className="look-slot filled">
                  <span className="look-slot-icon">👁️</span>
                  <span className="look-slot-label">Eye Shadow</span>
                  <div className="look-slot-thumb" style={{ background:look.eyeshadow }} />
                  <button type="button" className="look-slot-remove" onClick={() => setLook((p) => ({ ...p, eyeshadow:null }))}>×</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="studio-right-actions">
          <button type="button" className="btn btn-gradient" style={{ width:"100%" }} disabled={!hasLook} onClick={() => { setSaveError(null); setShowSaveModal(true); }}>
            Save This Look
          </button>
          <button type="button" className="btn btn-ghost" style={{ width:"100%" }} disabled={!resultImage}>
            Share
          </button>
        </div>
      </div>
    </div>

    {/* ══ Save Look Modal ════════════════════════════════════ */}
    {showSaveModal && (
      <div className="post-detail-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
        <div className="setup-card" style={{ maxWidth: "420px", width: "100%", padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text)", marginBottom: "6px" }}>Save Current Look</h3>
            <p style={{ fontSize: "13px", color: "var(--text-soft)" }}>Give this outfit combo a name and select the occasion category.</p>
          </div>

          {saveError && (
            <div style={{ padding: "10px 14px", background: "var(--danger-bg)", border: "1px solid var(--danger)", borderRadius: "var(--r-xs)", color: "var(--danger)", fontSize: "12px" }}>
              {saveError}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Look Name</label>
            <input
              type="text"
              placeholder="e.g. Summer Brunch, Friday Party"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--card-border)",
                borderRadius: "var(--r-xs)",
                color: "var(--text)",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Occasion</label>
            <select
              value={saveOccasion}
              onChange={(e) => setSaveOccasion(e.target.value as any)}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--card-border)",
                borderRadius: "var(--r-xs)",
                color: "var(--text)",
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
              className="btn btn-ghost"
              style={{ flex: 1, padding: "10px" }}
              onClick={() => { setShowSaveModal(false); setSaveName(""); setSaveError(null); }}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-gradient"
              style={{ flex: 1, padding: "10px" }}
              onClick={handleSaveLook}
              disabled={isSaving || !saveName.trim()}
            >
              {isSaving ? "Saving..." : "Save Look"}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ══ Ready Player Me Modal ════════════════════════════════════ */}
    {showRPM && (
      <ReadyPlayerMeCreator
        onAvatarCreated={(url) => {
          setAvatarUrl(url);
          setShowRPM(false);
        }}
        onClose={() => setShowRPM(false)}
      />
    )}
    </>
  );
}
