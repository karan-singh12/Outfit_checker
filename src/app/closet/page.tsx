"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { fetchLooks, toggleLikeLook } from "../../services/api";

// ── Types ─────────────────────────────────────────────────────────────────
export type Category = "all"|"tops"|"bottoms"|"dresses"|"outerwear"|"footwear"|"bags"|"jewellery"|"eyewear"|"makeup";
type OccasionFilter = "all"|"casual"|"formal"|"party"|"work"|"date";
type ClosetTab = "items"|"looks"|"occasions";

interface WardrobeItem {
  id: string;
  name: string;
  category: Category;
  brand?: string;
  image: string;
  color?: string;
}

interface SavedLook {
  id: string;
  name: string;
  occasion: OccasionFilter;
  image: string;
  gradient: string;
  pieces: string[];
  date: string;
  liked: boolean;
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

// ── Occasion Icon ─────────────────────────────────────────────────────────
const OccasionIcon = ({ id, className = "filter-svg" }: { id: OccasionFilter; className?: string }) => {
  const s = { width: 14, height: 14 };
  switch (id) {
    case "casual":
      return <svg {...s} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
    case "work":
      return <svg {...s} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>;
    case "formal":
      return <svg {...s} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    case "party":
      return <svg {...s} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l-6 9z"/><line x1="12" y1="12" x2="12" y2="20"/><line x1="8" y1="20" x2="16" y2="20"/></svg>;
    case "date":
      return <svg {...s} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
    default:
      return <svg {...s} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
  }
};

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

const CATEGORY_GROUPS = ["Clothing", "Shoes & Bags", "Accessories", "Beauty"];

const MOCK_LOOKS: SavedLook[] = [
  { id:"1", name:"Weekend Brunch", occasion:"casual",  image:"/images/look_brunch.png",  gradient:"linear-gradient(135deg,#4a1942,#7c3aed)", pieces:["dresses","footwear","eyewear","makeup"], date:"Today",       liked:true  },
  { id:"2", name:"Office Ready",   occasion:"work",    image:"/images/look_office.png",  gradient:"linear-gradient(135deg,#1e3a5f,#374151)", pieces:["tops","bottoms","outerwear","footwear","bags"], date:"2 days ago",  liked:false },
  { id:"3", name:"Friday Night",   occasion:"party",   image:"/images/look_party.png",   gradient:"linear-gradient(135deg,#4a1942,#7c3aed)", pieces:["dresses","footwear","jewellery","makeup"],     date:"3 days ago",  liked:true  },
  { id:"4", name:"First Date",     occasion:"date",    image:"/images/look_date.png",    gradient:"linear-gradient(135deg,#881337,#db2777)", pieces:["dresses","footwear","bags","jewellery"],        date:"5 days ago",  liked:false },
  { id:"5", name:"Formal Event",   occasion:"formal",  image:"/images/look_formal.png",  gradient:"linear-gradient(135deg,#111827,#374151)", pieces:["dresses","footwear","jewellery","eyewear"],     date:"1 week ago",  liked:true  },
  { id:"6", name:"Sunday Errands", occasion:"casual",  image:"/images/look_errands.png", gradient:"linear-gradient(135deg,#7c2d12,#92400e)", pieces:["tops","bottoms","footwear","outerwear"],        date:"1 week ago",  liked:false },
];

const LOOK_FILTERS: { id: OccasionFilter; label: string }[] = [
  { id:"all",    label:"All Looks"  },
  { id:"casual", label:"Casual"    },
  { id:"work",   label:"Work"      },
  { id:"formal", label:"Formal"    },
  { id:"party",  label:"Party"     },
  { id:"date",   label:"Date Night"},
];

// ══════════════════════════════════════════════════════════════════════════
export default function ClosetPage() {
  const { user, loading: authLoading, token } = useAuth();
  const router = useRouter();

  // ── Tab state
  const [activeTab, setActiveTab] = useState<ClosetTab>("items");

  // ── Items (Wardrobe) state
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("tops");
  const [newImage, setNewImage] = useState("");
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ── Looks state
  const [lookFilter, setLookFilter] = useState<OccasionFilter>("all");
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [looksLoading, setLooksLoading] = useState(true);

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

  // ── Fetch looks
  useEffect(() => {
    async function loadLooks() {
      if (!token) { setLooks(MOCK_LOOKS); setLooksLoading(false); return; }
      try {
        const data = await fetchLooks(token);
        if (data && data.length > 0) {
          setLooks(data.map((l: any) => ({
            id: l.id, name: l.name, occasion: l.occasion as OccasionFilter,
            image: l.image.startsWith("/public") ? `http://127.0.0.1:3003${l.image}` : l.image,
            gradient: l.gradient || "linear-gradient(135deg,#1e3a5f,#374151)",
            pieces: l.pieces,
            date: new Date(l.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            liked: l.liked
          })));
        } else { setLooks(MOCK_LOOKS); }
      } catch { setLooks(MOCK_LOOKS); } finally { setLooksLoading(false); }
    }
    loadLooks();
  }, [token]);

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

  const countForCat = (cat: Category) => cat === "all" ? items.length : items.filter(i => i.category === cat).length;
  const filteredLooks = lookFilter === "all" ? looks : looks.filter(l => l.occasion === lookFilter);

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

  const toggleLike = async (id: string) => {
    const isMock = ["1","2","3","4","5","6"].includes(id);
    setLooks(prev => prev.map(l => l.id === id ? { ...l, liked: !l.liked } : l));
    if (isMock || !token) return;
    try { await toggleLikeLook(token, id); }
    catch { setLooks(prev => prev.map(l => l.id === id ? { ...l, liked: !l.liked } : l)); }
  };

  if (authLoading || !user) {
    return (
      <div className="page-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)" }}>
        <p style={{ color: "var(--text-soft)" }}>Loading your closet...</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ paddingTop: 24 }}>

      {/* ── Tab Switcher ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 12 }}>
        <div style={{ display: "flex", background: "var(--surface)", borderRadius: "var(--r-md)", padding: 4, gap: 2, border: "1px solid var(--border)" }}>
          {(["items", "looks", "occasions"] as ClosetTab[]).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "7px 18px",
                borderRadius: "var(--r-sm)",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: activeTab === tab ? 600 : 400,
                background: activeTab === tab ? "var(--accent)" : "transparent",
                color: activeTab === tab ? "#fff" : "var(--text-soft)",
                transition: "all 0.2s ease",
                textTransform: "capitalize",
              }}
            >
              {tab === "items" ? "Items" : tab === "looks" ? "Saved Looks" : "Occasions"}
            </button>
          ))}
        </div>

        {activeTab === "items" && (
          <button type="button" className="btn btn-gradient btn-sm" onClick={() => setShowModal(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Item
          </button>
        )}
        {activeTab === "looks" && (
          <Link href="/drape" className="btn btn-gradient btn-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Look
          </Link>
        )}
        {activeTab === "occasions" && (
          <Link href="/outfits" className="btn btn-gradient btn-sm">
            Plan Occasion
          </Link>
        )}
      </div>

      {/* ═══════════════════════════════ ITEMS TAB ════════════════════════════════ */}
      {activeTab === "items" && (
        <div className="wardrobe-layout">
          {/* Sidebar */}
          <aside className="wardrobe-sidebar">
            <button type="button" className={`sidebar-link${activeCategory === "all" ? " active" : ""}`} onClick={() => setActiveCategory("all")}>
              <span className="sidebar-icon" style={{ display: "flex", alignItems: "center" }}><CategoryIcon id="all" /></span>
              All Items
              <span className="sidebar-count">{items.length}</span>
            </button>
            {CATEGORY_GROUPS.map(group => (
              <div key={group}>
                <p className="sidebar-section-label">{group}</p>
                {CATEGORIES.filter(c => c.group === group).map(cat => (
                  <button key={cat.id} type="button" className={`sidebar-link${activeCategory === cat.id ? " active" : ""}`} onClick={() => setActiveCategory(cat.id as Category)}>
                    <span className="sidebar-icon" style={{ display: "flex", alignItems: "center" }}><CategoryIcon id={cat.id} /></span>
                    {cat.label}
                    <span className="sidebar-count">{countForCat(cat.id as Category)}</span>
                  </button>
                ))}
              </div>
            ))}
          </aside>

          {/* Main */}
          <div className="wardrobe-main">
            <div className="wardrobe-toolbar">
              <div className="wardrobe-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Search items, brands…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="mobile-filter-btn btn btn-ghost btn-sm"
                style={{
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: "var(--r-sm)",
                  flexShrink: 0
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                {activeCategory === "all" ? "Categories" : CATEGORIES.find(c => c.id === activeCategory)?.label || "Filtered"}
                {activeCategory !== "all" && (
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
                )}
              </button>
              <div className="badge badge-muted" style={{ padding: "8px 14px" }}>{filtered.length} item{filtered.length !== 1 ? "s" : ""}</div>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H5v10a2 2 0 002 2h10a2 2 0 002-2V10h1.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/></svg>
                </div>
                <h3 className="empty-state-title">{search ? "No items match your search" : "Your closet is empty"}</h3>
                <p className="empty-state-desc">Add your first clothing item to get started.</p>
                <button type="button" className="btn btn-gradient" onClick={() => setShowModal(true)}>Add First Item</button>
              </div>
            ) : (
              <div className="item-grid">
                <div className="item-card-add" onClick={() => setShowModal(true)}>
                  <div className="item-card-add-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </div>
                  <p className="item-card-add-title">Add New Item</p>
                  <p className="item-card-add-sub">Upload or paste a link</p>
                </div>
                {filtered.map(item => (
                  <div key={item.id} className="item-card">
                    <div className="item-card-thumb" style={{ background: `${item.color || "#3b82f6"}22` }}>
                      <img src={getFullImageUrl(item.image)} alt={item.name} />
                      <span className="item-cat-badge">{item.category}</span>
                      <div className="item-card-overlay" style={{ display: "flex", flexDirection: "column", gap: 8, padding: 8 }}>
                        <Link href="/studio" className="btn btn-gradient btn-sm" style={{ width: "100%", textAlign: "center" }}>Try On</Link>
                        <button type="button" onClick={() => deleteItem(item.id)} className="btn btn-ghost btn-sm" style={{ width: "100%", background: "rgba(220, 38, 38, 0.2)", color: "var(--danger)", border: "none" }}>Delete</button>
                      </div>
                    </div>
                    <div className="item-card-info">
                      <p className="item-card-name">{item.name}</p>
                      <p className="item-card-brand">{item.brand || "My Brand"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════ LOOKS TAB ════════════════════════════════ */}
      {activeTab === "looks" && (
        <div className="looks-page" style={{ paddingTop: 0 }}>
          <div className="looks-filters" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div className="looks-filters-desktop" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {LOOK_FILTERS.map(f => (
                <button key={f.id} type="button" className={`filter-chip${lookFilter === f.id ? " active" : ""}`} onClick={() => setLookFilter(f.id)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <OccasionIcon id={f.id} />
                  {f.label}
                  {f.id !== "all" && <span style={{ marginLeft: 4, opacity: 0.6 }}>{looks.filter(l => l.occasion === f.id).length}</span>}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="mobile-filter-btn btn btn-ghost btn-sm"
              style={{
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 600,
                borderRadius: "var(--r-sm)",
                flexShrink: 0
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              {lookFilter === "all" ? "Occasions" : LOOK_FILTERS.find(f => f.id === lookFilter)?.label || "Filtered"}
              {lookFilter !== "all" && (
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
              )}
            </button>
          </div>

          {looksLoading ? (
            <div className="empty-state"><p style={{ color: "var(--text-soft)" }}>Loading looks...</p></div>
          ) : filteredLooks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </div>
              <h3 className="empty-state-title">No {lookFilter === "all" ? "" : lookFilter + " "}looks yet</h3>
              <p className="empty-state-desc">Open Drape Studio and save a complete outfit as a look.</p>
              <Link href="/studio" className="btn btn-gradient" style={{ marginTop: 8 }}>Open Drape</Link>
            </div>
          ) : (
            <div className="looks-grid">
              {filteredLooks.map(look => (
                <div key={look.id} className="look-card">
                  <div className="look-card-thumb">
                    <img src={look.image} alt={look.name} className="look-card-image" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, zIndex: 1 }} />
                    <div className="look-card-gradient" style={{ zIndex: 2 }} />
                    <div className="look-card-tag" style={{ zIndex: 3 }}>
                      <span className="badge badge-purple" style={{ backdropFilter: "blur(8px)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <OccasionIcon id={look.occasion} /> {look.occasion}
                      </span>
                    </div>
                    <div className="look-card-overlay-actions" style={{ zIndex: 3 }}>
                      <Link href="/studio" className="btn btn-gradient btn-sm">Open in Drape</Link>
                    </div>
                  </div>
                  <div className="look-card-info">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <p className="look-card-name">{look.name}</p>
                      <button type="button" onClick={() => toggleLike(look.id)} aria-label={look.liked ? "Unlike" : "Like"} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                        {look.liked
                          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted)" }}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                        }
                      </button>
                    </div>
                    <div className="look-card-meta">
                      <span>{look.date}</span><span>·</span><span>{look.pieces.length} pieces</span>
                    </div>
                    <div className="look-card-pieces">
                      {look.pieces.map((p, i) => (
                        <div key={i} className="piece-dot" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <CategoryIcon id={p} className="piece-dot-svg" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════ OCCASIONS TAB ════════════════════════════ */}
      {activeTab === "occasions" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 20, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              <path d="M9 16l2 2 4-4"/>
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>Occasion Planner</h3>
            <p style={{ color: "var(--text-soft)", fontSize: 14, maxWidth: 320, lineHeight: 1.6 }}>
              Tell us about your event and we'll pick the best outfit combinations from your closet.
            </p>
          </div>
          <Link href="/outfits" className="btn btn-gradient" style={{ padding: "12px 28px" }}>
            Plan an Occasion
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      )}

      {/* ── Add Item Modal ── */}
      {showModal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Add to Closet</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <label className="upload-zone" style={{ marginBottom: 20, minHeight: 120, cursor: "pointer" }}>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
              {uploading ? (
                <p style={{ fontSize: 13, color: "var(--text-soft)" }}>Uploading image...</p>
              ) : newImage ? (
                <img src={getFullImageUrl(newImage)} alt="Preview" style={{ maxHeight: 100, borderRadius: "var(--r-xs)" }} />
              ) : (
                <>
                  <div className="upload-zone-icon" style={{ width: 44, height: 44 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <p className="upload-zone-title" style={{ fontSize: 14 }}>Upload garment image</p>
                  <p className="upload-zone-sub">or click to browse files</p>
                </>
              )}
            </label>
            {uploadError && <p style={{ color: "var(--danger)", fontSize: 12, marginBottom: 10 }}>{uploadError}</p>}
            <div className="form-group">
              <label className="form-label">Item Name</label>
              <input className="form-input" placeholder="e.g. Black Blazer" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Brand (optional)</label>
              <input className="form-input" placeholder="e.g. Zara" value={newBrand} onChange={e => setNewBrand(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <div className="cat-chip-row">
                {CATEGORIES.filter(c => c.id !== "all").map(cat => (
                  <button key={cat.id} type="button" className={`cat-chip${newCategory === cat.id ? " active" : ""}`} onClick={() => setNewCategory(cat.id as Category)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <CategoryIcon id={cat.id} /> {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button type="button" className="btn btn-gradient" style={{ flex: 2 }} onClick={addItem} disabled={!newName.trim() || uploading}>Add to Closet</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Right-Side Filter Slider Drawer ── */}
      <div
        className={`closet-drawer-backdrop${mobileFilterOpen ? " open" : ""}`}
        onClick={() => setMobileFilterOpen(false)}
      />
      <div className={`closet-right-drawer${mobileFilterOpen ? " open" : ""}`}>
        {/* Drawer Header */}
        <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text)" }}>Closet Filters</h3>
            <p style={{ fontSize: 11, color: "var(--text-soft)", margin: "2px 0 0" }}>
              {activeTab === "items" ? `${filtered.length} items available` : `${filteredLooks.length} looks available`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMobileFilterOpen(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-soft)",
              cursor: "pointer",
              padding: 6,
              display: "flex",
              alignItems: "center"
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px" }}>
          {activeTab === "items" ? (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", marginBottom: 10 }}>
                Categories
              </p>
              <button
                type="button"
                className={`sidebar-link${activeCategory === "all" ? " active" : ""}`}
                onClick={() => { setActiveCategory("all"); setMobileFilterOpen(false); }}
                style={{ width: "100%", marginBottom: 6 }}
              >
                <span className="sidebar-icon" style={{ display: "flex", alignItems: "center" }}><CategoryIcon id="all" /></span>
                All Items
                <span className="sidebar-count">{items.length}</span>
              </button>

              {CATEGORY_GROUPS.map(group => (
                <div key={group} style={{ marginTop: 14 }}>
                  <p className="sidebar-section-label" style={{ marginBottom: 6 }}>{group}</p>
                  {CATEGORIES.filter(c => c.group === group).map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`sidebar-link${activeCategory === cat.id ? " active" : ""}`}
                      onClick={() => { setActiveCategory(cat.id as Category); setMobileFilterOpen(false); }}
                      style={{ width: "100%", marginBottom: 4 }}
                    >
                      <span className="sidebar-icon" style={{ display: "flex", alignItems: "center" }}><CategoryIcon id={cat.id} /></span>
                      {cat.label}
                      <span className="sidebar-count">{countForCat(cat.id as Category)}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", marginBottom: 12 }}>
                Filter By Occasion
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {LOOK_FILTERS.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    className={`sidebar-link${lookFilter === f.id ? " active" : ""}`}
                    onClick={() => { setLookFilter(f.id); setMobileFilterOpen(false); }}
                    style={{ width: "100%" }}
                  >
                    <span className="sidebar-icon" style={{ display: "flex", alignItems: "center" }}><OccasionIcon id={f.id} /></span>
                    {f.label}
                    {f.id !== "all" && <span className="sidebar-count">{looks.filter(l => l.occasion === f.id).length}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              if (activeTab === "items") setActiveCategory("all");
              else setLookFilter("all");
              setMobileFilterOpen(false);
            }}
            style={{ flex: 1 }}
          >
            Reset
          </button>
          <button
            type="button"
            className="btn btn-gradient btn-sm"
            onClick={() => setMobileFilterOpen(false)}
            style={{ flex: 2 }}
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}
