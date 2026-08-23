"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

type Category = "all"|"tops"|"bottoms"|"dresses"|"outerwear"|"footwear"|"bags"|"jewellery"|"eyewear"|"makeup";

interface WardrobeItem {
  id: string;
  name: string;
  brand: string;
  category: Category;
  image: string;
  color: string;
  tags: string[];
}

// ── Category SVG Icon Component ──────────────────────────────────────────
export const CategoryIcon = ({ id, className = "sidebar-svg" }: { id: Category; className?: string }) => {
  switch (id) {
    case "tops":
      return (
        <svg className={className} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a2 2 0 0 0 .99 1.47L7 12v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9l3.15-1.37a2 2 0 0 0 .99-1.47l.58-3.47a2 2 0 0 0-1.34-2.23z" />
        </svg>
      );
    case "bottoms":
      return (
        <svg className={className} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2v20h5V12h2v10h5V2z" />
        </svg>
      );
    case "dresses":
    case "all":
      return (
        <svg className={className} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
          <path d="M12 4v4" />
          <path d="M4 18l8-10 8 10" />
          <path d="M2 20h20" />
        </svg>
      );
    case "outerwear":
      return (
        <svg className={className} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 3v18h14V3H5z" />
          <path d="M12 3v18" />
          <path d="M5 7h14" />
        </svg>
      );
    case "footwear":
      return (
        <svg className={className} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17h18a2 2 0 0 0 2-2v-2a6 6 0 0 0-6-6h-3L7 11l-4 1v5z" />
          <path d="M3 17v2a2 2 0 0 0 2 2h14" />
        </svg>
      );
    case "bags":
      return (
        <svg className={className} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 21V9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" />
          <path d="M9 7V4a3 3 0 0 1 6 0v3" />
        </svg>
      );
    case "jewellery":
      return (
        <svg className={className} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="7" />
          <path d="M12 2v3" />
          <path d="M12 19v3" />
          <path d="M2 12h3" />
          <path d="M19 12h3" />
        </svg>
      );
    case "eyewear":
      return (
        <svg className={className} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="12" r="3" />
          <path d="M9 12h6" />
          <path d="M3 12h1" />
          <path d="M20 12h1" />
          <path d="M6 9h12" />
        </svg>
      );
    case "makeup":
      return (
        <svg className={className} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="12" width="6" height="10" rx="1" />
          <path d="M12 2v10" />
          <path d="M10 5h4" />
        </svg>
      );
    default:
      return null;
  }
};

// ── Mock wardrobe data with generated image paths ────────────────────────────
const MOCK_ITEMS: WardrobeItem[] = [
  { id:"1", name:"White Oxford Shirt", brand:"Zara", category:"tops", image:"/images/white_oxford.png", color:"#f5f5f5", tags:["Formal","Work"] },
  { id:"2", name:"Floral Maxi Dress", brand:"H&M", category:"dresses", image:"/images/floral_dress.png", color:"#f472b6", tags:["Casual","Summer"] },
  { id:"3", name:"Black Skinny Jeans", brand:"Levi's", category:"bottoms", image:"/images/black_jeans.png", color:"#1a1a2e", tags:["Casual"] },
  { id:"4", name:"Oversized Blazer", brand:"Mango", category:"outerwear", image:"/images/blazer.png", color:"#6b7280", tags:["Formal","Work"] },
  { id:"5", name:"White Sneakers", brand:"Nike", category:"footwear", image:"/images/white_sneakers.png", color:"#ffffff", tags:["Casual","Sport"] },
  { id:"6", name:"Block Heel Pumps", brand:"Steve Madden", category:"footwear", image:"/images/heel_pumps.png", color:"#dc2626", tags:["Formal","Party"] },
  { id:"7", name:"Leather Tote Bag", brand:"Charles & Keith", category:"bags", image:"/images/leather_tote.png", color:"#92400e", tags:["Work"] },
  { id:"8", name:"Pearl Necklace", brand:"Accessorize", category:"jewellery", image:"/images/pearl_necklace.png", color:"#fde68a", tags:["Party","Formal"] },
  { id:"9", name:"Cat-Eye Sunglasses", brand:"Ray-Ban", category:"eyewear", image:"/images/sunglasses.png", color:"#000000", tags:["Casual","Summer"] },
  { id:"10", name:"Velvet Midi Skirt", brand:"Myntra", category:"bottoms", image:"/images/velvet_skirt.png", color:"#7c3aed", tags:["Party","Casual"] },
  { id:"11", name:"Satin Slip Dress", brand:"ASOS", category:"dresses", image:"/images/satin_dress.png", color:"#fbbf24", tags:["Party","Date"] },
  { id:"12", name:"Trench Coat", brand:"Marks & Spencer", category:"outerwear", image:"/images/trench_coat.png", color:"#d97706", tags:["Work","Rainy"] },
];

const CATEGORIES: { id: Category; label: string; group?: string }[] = [
  { id:"all", label:"All Items" },
  { id:"tops", label:"Tops & Shirts", group:"Clothing" },
  { id:"bottoms", label:"Bottoms", group:"Clothing" },
  { id:"dresses", label:"Dresses", group:"Clothing" },
  { id:"outerwear", label:"Outerwear", group:"Clothing" },
  { id:"footwear", label:"Footwear", group:"Shoes & Bags" },
  { id:"bags", label:"Bags", group:"Shoes & Bags" },
  { id:"jewellery", label:"Jewellery", group:"Accessories" },
  { id:"eyewear", label:"Eyewear", group:"Accessories" },
  { id:"makeup", label:"Makeup & Beauty", group:"Beauty" },
];

export default function WardrobePage() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("tops");
  const [items, setItems] = useState<WardrobeItem[]>(MOCK_ITEMS);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchCat = activeCategory === "all" || item.category === activeCategory;
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.brand.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, activeCategory, search]);

  const countForCat = (cat: Category) =>
    cat === "all" ? items.length : items.filter((i) => i.category === cat).length;

  const addItem = () => {
    if (!newName.trim()) return;
    const defaultImages: Record<Category, string> = {
      all:"/images/floral_dress.png",
      tops:"/images/white_oxford.png",
      bottoms:"/images/black_jeans.png",
      dresses:"/images/floral_dress.png",
      outerwear:"/images/trench_coat.png",
      footwear:"/images/white_sneakers.png",
      bags:"/images/leather_tote.png",
      jewellery:"/images/pearl_necklace.png",
      eyewear:"/images/sunglasses.png",
      makeup:"/images/lipstick.png",
    };
    setItems((prev) => [...prev, {
      id: String(Date.now()),
      name: newName.trim(),
      brand: newBrand.trim() || "My Item",
      category: newCategory,
      image: defaultImages[newCategory] || "/images/white_oxford.png",
      color: "#3b82f6",
      tags: [],
    }]);
    setNewName(""); setNewBrand(""); setNewCategory("tops");
    setShowModal(false);
  };

  const groups = ["Clothing", "Shoes & Bags", "Accessories", "Beauty"];

  return (
    <div className="page-wrapper" style={{ paddingTop: 28 }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-header-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CategoryIcon id="all" className="header-svg" />
          </div>
          <div>
            <h1>My Wardrobe</h1>
            <p className="page-header-sub">{items.length} items · Try them on in the Studio</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/studio" className="btn btn-ghost btn-sm">Open Studio</Link>
          <button type="button" className="btn btn-gradient btn-sm" onClick={() => setShowModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Item
          </button>
        </div>
      </div>

      <div className="wardrobe-layout">
        {/* Sidebar */}
        <aside className="wardrobe-sidebar">
          <button
            type="button"
            className={`sidebar-link${activeCategory === "all" ? " active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            <span className="sidebar-icon" style={{ display: "flex", alignItems: "center" }}>
              <CategoryIcon id="all" />
            </span>
            All Items
            <span className="sidebar-count">{items.length}</span>
          </button>

          {groups.map((group) => (
            <div key={group}>
              <p className="sidebar-section-label">{group}</p>
              {CATEGORIES.filter((c) => c.group === group).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`sidebar-link${activeCategory === cat.id ? " active" : ""}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span className="sidebar-icon" style={{ display: "flex", alignItems: "center" }}>
                    <CategoryIcon id={cat.id} />
                  </span>
                  {cat.label}
                  <span className="sidebar-count">{countForCat(cat.id)}</span>
                </button>
              ))}
            </div>
          ))}
        </aside>


        {/* Main */}
        <div className="wardrobe-main">
          {/* Toolbar */}
          <div className="wardrobe-toolbar">
            <div className="wardrobe-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search items, brands…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="badge badge-muted" style={{ padding: "8px 14px" }}>
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🪣</div>
              <h3 className="empty-state-title">
                {search ? "No items match your search" : "This category is empty"}
              </h3>
              <p className="empty-state-desc">Add your first item by clicking Add Item above.</p>
              <button type="button" className="btn btn-gradient" onClick={() => setShowModal(true)}>Add First Item</button>
            </div>
          ) : (
            <div className="item-grid">
              {/* Add card */}
              <div className="item-card-add" onClick={() => setShowModal(true)}>
                <div className="item-card-add-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <p className="item-card-add-title">Add New Item</p>
                <p className="item-card-add-sub">Upload or paste a link</p>
              </div>

              {filtered.map((item) => (
                <div key={item.id} className="item-card">
                  <div className="item-card-thumb" style={{ background: `${item.color}22` }}>
                    <img src={item.image} alt={item.name} />
                    <span className="item-cat-badge">{item.category}</span>
                    <div className="item-card-overlay">
                      <Link href="/studio" className="btn btn-gradient btn-sm">Try On</Link>
                    </div>
                  </div>
                  <div className="item-card-info">
                    <p className="item-card-name">{item.name}</p>
                    <p className="item-card-brand">{item.brand}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Add to Wardrobe</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="upload-zone" style={{ marginBottom: 20, minHeight: 120 }}>
              <input type="file" accept="image/*" />
              <div className="upload-zone-icon" style={{ width: 44, height: 44 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <p className="upload-zone-title" style={{ fontSize: 14 }}>Upload garment image</p>
              <p className="upload-zone-sub">or paste a product URL below</p>
            </div>

            <div className="form-group">
              <label className="form-label">Item Name</label>
              <input className="form-input" placeholder="e.g. Black Blazer" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Brand (optional)</label>
              <input className="form-input" placeholder="e.g. Zara" value={newBrand} onChange={(e) => setNewBrand(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <div className="cat-chip-row">
                {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`cat-chip${newCategory === cat.id ? " active" : ""}`}
                    onClick={() => setNewCategory(cat.id)}
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <CategoryIcon id={cat.id} /> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button type="button" className="btn btn-gradient" style={{ flex: 2 }} onClick={addItem} disabled={!newName.trim()}>
                Add to Wardrobe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
