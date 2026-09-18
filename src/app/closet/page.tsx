"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

// ── Types ─────────────────────────────────────────────────────────────────
export type Category = "all"|"tops"|"bottoms"|"dresses"|"outerwear"|"footwear"|"bags"|"jewellery"|"eyewear"|"makeup";

interface WardrobeItem {
  id: string;
  name: string;
  category: Category;
  brand?: string;
  image: string;
  color?: string;
}

// ── Category Icon ────────────────────────────────────────────────────────
export function CategoryIcon({ id, className = "cat-svg" }: { id: string; className?: string }) {
  const s = { width: 14, height: 14 };
  switch (id) {
    case "tops":
      return <svg {...s} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H5v10a2 2 0 002 2h10a2 2 0 002-2V10h1.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/></svg>;
    case "bottoms":
      return <svg {...s} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h12l1 9H5L6 2z"/><path d="M5 11l2 11h4l1-6 1 6h4l2-11"/></svg>;
    case "dresses":
      return <svg {...s} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l-3 6H6l3 5-4 9h14l-4-9 3-5h-3L12 2z"/></svg>;
    case "outerwear":
      return <svg {...s} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/></svg>;
    case "footwear":
      return <svg {...s} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l2-8h14l2 8H3z"/><path d="M7 17v2h10v-2"/></svg>;
    case "bags":
      return <svg {...s} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>;
    case "jewellery":
      return <svg {...s} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>;
    case "eyewear":
      return <svg {...s} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="12" r="4"/><circle cx="17" cy="12" r="4"/><path d="M11 12h2M1 12h2M21 12h2"/></svg>;
    case "makeup":
      return <svg {...s} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c4.97 0 9-2.24 9-5v-3H3v3c0 2.76 4.03 5 9 5z"/><path d="M21 14V9a9 9 0 00-18 0v5"/></svg>;
    default:
      return <svg {...s} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
  }
}

// ── Constants ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id:"all",       label:"All Items" },
  { id:"tops",      label:"Tops & Shirts",   group:"Clothing" },
  { id:"bottoms",   label:"Bottoms",          group:"Clothing" },
  { id:"dresses",   label:"Dresses",          group:"Clothing" },
  { id:"outerwear", label:"Outerwear",         group:"Clothing" },
  { id:"footwear",  label:"Footwear",          group:"Shoes & Bags" },
  { id:"bags",      label:"Bags",              group:"Shoes & Bags" },
  { id:"jewellery", label:"Jewellery",         group:"Accessories" },
  { id:"eyewear",   label:"Eyewear",           group:"Accessories" },
  { id:"makeup",    label:"Makeup & Beauty",   group:"Beauty" },
];

// ── Wardrobe / Looks section switcher — shared visual language, real routes ──
function ClosetSectionNav({ active }: { active: "items" | "looks" }) {
  return (
    <div className="tf2-segmented">
      <Link href="/closet" className={`tf2-segment${active === "items" ? " active" : ""}`}>Wardrobe</Link>
      <Link href="/looks" className={`tf2-segment${active === "looks" ? " active" : ""}`}>Saved Looks</Link>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
export default function ClosetPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("tops");
  const [newImage, setNewImage] = useState("");
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ── Auth guard
  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("tf_token") : null;
    if (!authLoading && !t) router.push("/login");
  }, [user, authLoading, router]);

  // ── Fetch wardrobe items
  const fetchWardrobeItems = async () => {
    const t = localStorage.getItem("tf_token");
    if (!t) return;
    try {
      const res = await fetch("http://127.0.0.1:3003/api/wardrobe", {
        headers: { Authorization: `Bearer ${t}` }
      });
      const json = await res.json();
      if (json.success && json.data) setItems(json.data);
    } catch (err) { console.error("Error fetching wardrobe:", err); }
  };

  useEffect(() => { if (user) fetchWardrobeItems(); }, [user]);

  // ── Helpers
  const getFullImageUrl = (p: string) => {
    if (!p) return "/images/white_oxford.png";
    if (p.startsWith("http") || p.startsWith("/images/")) return p;
    return `http://127.0.0.1:3003${p}`;
  };

  const filtered = useMemo(() =>
    items.filter(item => {
      const matchCat = activeCategory === "all" || item.category === activeCategory;
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || (item.brand?.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    }), [items, activeCategory, search]);

  // ── Add wardrobe item
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadError(null);
    const t = localStorage.getItem("tf_token");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("http://127.0.0.1:3003/api/uploads", { method: "POST", headers: { Authorization: `Bearer ${t}` }, body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed");
      setNewImage(json.data.url);
    } catch (err: any) { setUploadError(err.message || "Upload failed"); }
    finally { setUploading(false); }
  };

  const addItem = async () => {
    if (!newName.trim()) return;
    const t = localStorage.getItem("tf_token");
    if (!t) return;
    const defaults: Record<Category, string> = {
      all:"/images/floral_dress.png", tops:"/images/white_oxford.png", bottoms:"/images/black_jeans.png",
      dresses:"/images/floral_dress.png", outerwear:"/images/trench_coat.png", footwear:"/images/white_sneakers.png",
      bags:"/images/leather_tote.png", jewellery:"/images/pearl_necklace.png", eyewear:"/images/sunglasses.png",
      makeup:"/images/lipstick.png",
    };
    try {
      const res = await fetch("http://127.0.0.1:3003/api/wardrobe", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify({ name: newName.trim(), brand: newBrand.trim() || "My Item", category: newCategory, image: newImage || defaults[newCategory], color: "#3b82f6", tags: [] })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setItems(prev => [json.data, ...prev]);
        setNewName(""); setNewBrand(""); setNewCategory("tops"); setNewImage(""); setShowModal(false);
      }
    } catch (err) { console.error("Error adding item:", err); }
  };

  const deleteItem = async (id: string) => {
    const t = localStorage.getItem("tf_token");
    if (!t) return;
    try {
      const res = await fetch(`http://127.0.0.1:3003/api/wardrobe/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${t}` } });
      const json = await res.json();
      if (json.success) setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) { console.error("Error deleting item:", err); }
  };

  if (authLoading || !user) {
    return (
      <div className="tf2-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)" }}>
        <p style={{ color: "var(--tf-ink-soft)" }}>Loading your closet...</p>
      </div>
    );
  }

  return (
    <div className="tf2-page" style={{ padding: "28px 56px 64px", minHeight: "calc(100vh - 64px)" }}>

      {/* ── Compact toolbar (no oversized title — just the switcher + controls) ── */}
      <div className="tf2-closet-header">
        <ClosetSectionNav active="items" />

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button type="button" className="tf2-btn tf2-btn-primary" onClick={() => setShowModal(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add item
          </button>
        </div>
      </div>

      {/* Search + filter chips */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 999, background: "var(--tf-surface)", border: "1px solid var(--tf-hairline)", flex: "1 1 240px", maxWidth: 320 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--tf-ink-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search items, brands…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, color: "var(--tf-ink)", flex: 1, fontFamily: "inherit" }}
          />
        </div>
        <span style={{ fontSize: 12.5, color: "var(--tf-ink-faint)", fontWeight: 600 }}>{filtered.length} item{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="tf2-bubble-row" style={{ marginBottom: 28 }}>
        <button type="button" className={`tf2-chip${activeCategory === "all" ? " active" : ""}`} onClick={() => setActiveCategory("all")}>
          All · {items.length}
        </button>
        {CATEGORIES.filter(c => c.id !== "all").map(cat => (
          <button key={cat.id} type="button" className={`tf2-chip${activeCategory === cat.id ? " active" : ""}`} onClick={() => setActiveCategory(cat.id as Category)}>
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ display: "inline-flex", padding: 16, borderRadius: "50%", background: "var(--tf-surface)", border: "1px solid var(--tf-hairline)", color: "var(--tf-ink-faint)", marginBottom: 16 }}>
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H5v10a2 2 0 002 2h10a2 2 0 002-2V10h1.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/></svg>
          </div>
          <h3 className="tf2-serif" style={{ fontSize: 22, fontWeight: 600, marginBottom: 8, color: "var(--tf-ink)" }}>{search ? "No items match your search" : "Your closet is empty"}</h3>
          <p style={{ color: "var(--tf-ink-soft)", fontSize: 14, marginBottom: 20 }}>Add your first clothing item to get started.</p>
          <button type="button" className="tf2-btn tf2-btn-primary" onClick={() => setShowModal(true)}>Add first item</button>
        </div>
      ) : (
        <div className="tf2-item-grid">
          {filtered.map(item => (
            <div key={item.id} className="tf2-item-card">
              <div className="tf2-item-photo">
                <img src={getFullImageUrl(item.image)} alt={item.name} />
                <div style={{ position: "absolute", inset: 0, background: "oklch(23% 0.015 50 / 0)", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 8, padding: 10, opacity: 0, transition: "all 0.2s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "color-mix(in oklch, var(--tf-ink) 45%, transparent)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "0"; e.currentTarget.style.background = "oklch(23% 0.015 50 / 0)"; }}
                >
                  <Link href="/studio" className="tf2-btn tf2-btn-primary tf2-btn-sm" style={{ width: "100%" }}>Try on</Link>
                  <button type="button" onClick={() => deleteItem(item.id)} className="tf2-btn tf2-btn-sm" style={{ width: "100%", background: "color-mix(in oklch, var(--tf-surface) 90%, transparent)", color: "var(--danger)" }}>Delete</button>
                </div>
              </div>
              <span className="tf2-item-name">{item.name}</span>
              <span className="tf2-item-cat">{item.brand || item.category}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Item Modal ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "oklch(23% 0.015 50 / 0.35)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="tf2-card" style={{ background: "var(--tf-surface)", padding: 28, width: "100%", maxWidth: 440 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 className="tf2-serif" style={{ fontSize: 22, fontWeight: 600, margin: 0, color: "var(--tf-ink)" }}>Add to closet</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 20, color: "var(--tf-ink-faint)", cursor: "pointer" }}>×</button>
            </div>
            <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 18, minHeight: 120, cursor: "pointer", border: "1.5px dashed var(--tf-hairline)", borderRadius: 16, padding: 16 }}>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
              {uploading ? (
                <p style={{ fontSize: 13, color: "var(--tf-ink-soft)" }}>Uploading image...</p>
              ) : newImage ? (
                <img src={getFullImageUrl(newImage)} alt="Preview" style={{ maxHeight: 100, borderRadius: 10 }} />
              ) : (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--tf-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--tf-ink)", margin: 0 }}>Upload garment image</p>
                  <p style={{ fontSize: 11.5, color: "var(--tf-ink-faint)", margin: 0 }}>or click to browse files</p>
                </>
              )}
            </label>
            {uploadError && <p style={{ color: "#b3341c", fontSize: 12, marginBottom: 10 }}>{uploadError}</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--tf-ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Item Name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Black Blazer" style={{ padding: "10px 14px", background: "var(--tf-ivory)", border: "1px solid var(--tf-hairline)", borderRadius: 10, color: "var(--tf-ink)", outline: "none" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--tf-ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Brand (optional)</label>
              <input value={newBrand} onChange={e => setNewBrand(e.target.value)} placeholder="e.g. Zara" style={{ padding: "10px 14px", background: "var(--tf-ivory)", border: "1px solid var(--tf-hairline)", borderRadius: 10, color: "var(--tf-ink)", outline: "none" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 22 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--tf-ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CATEGORIES.filter(c => c.id !== "all").map(cat => (
                  <button key={cat.id} type="button" className={`tf2-chip${newCategory === cat.id ? " active" : ""}`} onClick={() => setNewCategory(cat.id as Category)}>{cat.label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="tf2-btn tf2-btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button type="button" className="tf2-btn tf2-btn-primary" style={{ flex: 2 }} onClick={addItem} disabled={!newName.trim() || uploading}>Add to closet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
