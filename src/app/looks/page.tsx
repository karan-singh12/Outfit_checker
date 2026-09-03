"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { CategoryIcon } from "../wardrobe/page";
import { useAuth } from "../../context/AuthContext";
import { fetchLooks, toggleLikeLook } from "../../services/api";

type OccasionFilter = "all"|"casual"|"formal"|"party"|"work"|"date";

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

// ── Occasion SVG Icon Component ──────────────────────────────────────────
const OccasionIcon = ({ id, className = "filter-svg" }: { id: OccasionFilter; className?: string }) => {
  switch (id) {
    case "casual":
      return (
        <svg className={className} viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      );
    case "work":
      return (
        <svg className={className} viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case "formal":
      return (
        <svg className={className} viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "party":
      return (
        <svg className={className} viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12l-6 9z" /><line x1="12" y1="12" x2="12" y2="20" /><line x1="8" y1="20" x2="16" y2="20" />
        </svg>
      );
    case "date":
      return (
        <svg className={className} viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case "all":
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
  }
};

const MOCK_LOOKS: SavedLook[] = [
  { id:"1", name:"Weekend Brunch", occasion:"casual", image:"/images/look_brunch.png", gradient:"from-pink-900 to-purple-900", pieces:["dresses","footwear","eyewear","makeup"], date:"Today", liked:true },
  { id:"2", name:"Office Ready", occasion:"work", image:"/images/look_office.png", gradient:"linear-gradient(135deg,#1e3a5f,#374151)", pieces:["tops","bottoms","outerwear","footwear","bags"], date:"2 days ago", liked:false },
  { id:"3", name:"Friday Night Out", occasion:"party", image:"/images/look_party.png", gradient:"linear-gradient(135deg,#4a1942,#7c3aed)", pieces:["dresses","footwear","jewellery","makeup"], date:"3 days ago", liked:true },
  { id:"4", name:"First Date", occasion:"date", image:"/images/look_date.png", gradient:"linear-gradient(135deg,#881337,#db2777)", pieces:["dresses","footwear","bags","jewellery","makeup"], date:"5 days ago", liked:false },
  { id:"5", name:"Formal Event", occasion:"formal", image:"/images/look_formal.png", gradient:"linear-gradient(135deg,#111827,#374151)", pieces:["dresses","footwear","jewellery","eyewear"], date:"1 week ago", liked:true },
  { id:"6", name:"Sunday Errands", occasion:"casual", image:"/images/look_errands.png", gradient:"linear-gradient(135deg,#7c2d12,#92400e)", pieces:["tops","bottoms","footwear","outerwear"], date:"1 week ago", liked:false },
];

const FILTERS: { id: OccasionFilter; label: string }[] = [
  { id:"all",    label:"All Looks" },
  { id:"casual", label:"Casual" },
  { id:"work",   label:"Work" },
  { id:"formal", label:"Formal" },
  { id:"party",  label:"Party" },
  { id:"date",   label:"Date Night" },
];

export default function LooksPage() {
  const { token } = useAuth();
  const [filter, setFilter] = useState<OccasionFilter>("all");
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLooks() {
      if (!token) {
        setLooks(MOCK_LOOKS);
        setLoading(false);
        return;
      }
      try {
        const data = await fetchLooks(token);
        if (data && data.length > 0) {
          const mapped = data.map((l) => ({
            id: l.id,
            name: l.name,
            occasion: l.occasion as OccasionFilter,
            image: l.image.startsWith("/public") ? `http://127.0.0.1:3003${l.image}` : l.image,
            gradient: l.gradient || "linear-gradient(135deg,#1e3a5f,#374151)",
            pieces: l.pieces,
            date: new Date(l.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            liked: l.liked
          }));
          setLooks(mapped);
        } else {
          setLooks(MOCK_LOOKS);
        }
      } catch (err) {
        console.error("Error loading looks from api", err);
        setLooks(MOCK_LOOKS);
      } finally {
        setLoading(false);
      }
    }
    loadLooks();
  }, [token]);

  const filtered = filter === "all" ? looks : looks.filter((l) => l.occasion === filter);

  const toggleLike = async (id: string) => {
    const isMock = ["1","2","3","4","5","6"].includes(id);
    setLooks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, liked: !l.liked } : l))
    );

    if (isMock || !token) return;

    try {
      await toggleLikeLook(token, id);
    } catch (err) {
      console.error("Failed to toggle like in database", err);
      setLooks((prev) =>
        prev.map((l) => (l.id === id ? { ...l, liked: !l.liked } : l))
      );
    }
  };

  return (
    <div className="looks-page">
      {/* Action Toolbar */}
      <div className="looks-header" style={{ justifyContent: "flex-end", marginBottom: 16 }}>
        <Link href="/studio" className="btn btn-gradient">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create New Look
        </Link>
      </div>

      {/* Filters */}
      <div className="looks-filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`filter-chip${filter === f.id ? " active" : ""}`}
            onClick={() => setFilter(f.id)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <OccasionIcon id={f.id} />
            {f.label}
            {f.id !== "all" && (
              <span style={{ marginLeft:4, opacity:0.6 }}>
                {looks.filter((l) => l.occasion === f.id).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <h3 className="empty-state-title">No {filter} looks yet</h3>
          <p className="empty-state-desc">Go to the Studio and save a complete outfit as a look.</p>
          <Link href="/studio" className="btn btn-gradient" style={{ marginTop:8 }}>Open Studio</Link>
        </div>
      ) : (
        <div className="looks-grid">
          {filtered.map((look) => (
            <div key={look.id} className="look-card">
              {/* Thumbnail */}
              <div className="look-card-thumb">
                <img src={look.image} alt={look.name} className="look-card-image" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, zIndex: 1 }} />
                <div className="look-card-gradient" style={{ zIndex: 2 }} />

                {/* Occasion tag */}
                <div className="look-card-tag" style={{ zIndex: 3 }}>
                  <span className="badge badge-purple" style={{ backdropFilter:"blur(8px)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <OccasionIcon id={look.occasion} /> {look.occasion}
                  </span>
                </div>

                {/* Hover actions */}
                <div className="look-card-overlay-actions" style={{ zIndex: 3 }}>
                  <Link href="/studio" className="btn btn-gradient btn-sm">Open in Studio</Link>
                </div>
              </div>

              {/* Info */}
              <div className="look-card-info">
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                  <p className="look-card-name">{look.name}</p>
                  <button
                    type="button"
                    onClick={() => toggleLike(look.id)}
                    aria-label={look.liked ? "Unlike look" : "Like look"}
                    style={{ background:"none", border:"none", cursor:"pointer", display: "flex", alignItems: "center", padding: 0 }}
                  >
                    {look.liked ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted)" }}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    )}
                  </button>
                </div>

                <div className="look-card-meta">
                  <span>{look.date}</span>
                  <span>·</span>
                  <span>{look.pieces.length} pieces</span>
                </div>

                <div className="look-card-pieces">
                  {look.pieces.map((p, i) => (
                    <div key={i} className="piece-dot" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CategoryIcon id={p as any} className="piece-dot-svg" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
