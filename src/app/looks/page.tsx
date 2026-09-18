"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { fetchLooks, toggleLikeLook } from "../../services/api";

// ── Types ─────────────────────────────────────────────────────────────────
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

const MOCK_LOOKS: SavedLook[] = [
  { id:"1", name:"Weekend Brunch", occasion:"casual",  image:"/images/look_brunch.png",  gradient:"#3d2f5c", pieces:["dresses","footwear","eyewear","makeup"], date:"Today",       liked:true  },
  { id:"2", name:"Office Ready",   occasion:"work",    image:"/images/look_office.png",  gradient:"#27272a", pieces:["tops","bottoms","outerwear","footwear","bags"], date:"2 days ago",  liked:false },
  { id:"3", name:"Friday Night",   occasion:"party",   image:"/images/look_party.png",   gradient:"#3d2f5c", pieces:["dresses","footwear","jewellery","makeup"],     date:"3 days ago",  liked:true  },
  { id:"4", name:"First Date",     occasion:"date",    image:"/images/look_date.png",    gradient:"#3d2f5c", pieces:["dresses","footwear","bags","jewellery"],        date:"5 days ago",  liked:false },
  { id:"5", name:"Formal Event",   occasion:"formal",  image:"/images/look_formal.png",  gradient:"#27272a", pieces:["dresses","footwear","jewellery","eyewear"],     date:"1 week ago",  liked:true  },
  { id:"6", name:"Sunday Errands", occasion:"casual",  image:"/images/look_errands.png", gradient:"#27272a", pieces:["tops","bottoms","footwear","outerwear"],        date:"1 week ago",  liked:false },
];

const LOOK_FILTERS: { id: OccasionFilter; label: string }[] = [
  { id:"all",    label:"All Looks"  },
  { id:"casual", label:"Casual"    },
  { id:"work",   label:"Work"      },
  { id:"formal", label:"Formal"    },
  { id:"party",  label:"Party"     },
  { id:"date",   label:"Date Night"},
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
export default function LooksPage() {
  const { user, loading: authLoading, token } = useAuth();
  const router = useRouter();

  const [lookFilter, setLookFilter] = useState<OccasionFilter>("all");
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [looksLoading, setLooksLoading] = useState(true);

  // ── Auth guard
  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("tf_token") : null;
    if (!authLoading && !t) router.push("/login");
  }, [user, authLoading, router]);

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
            gradient: l.gradient || "#27272a",
            pieces: l.pieces,
            date: new Date(l.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            liked: l.liked
          })));
        } else { setLooks(MOCK_LOOKS); }
      } catch { setLooks(MOCK_LOOKS); } finally { setLooksLoading(false); }
    }
    loadLooks();
  }, [token]);

  const filteredLooks = lookFilter === "all" ? looks : looks.filter(l => l.occasion === lookFilter);

  const toggleLike = async (id: string) => {
    const isMock = ["1","2","3","4","5","6"].includes(id);
    setLooks(prev => prev.map(l => l.id === id ? { ...l, liked: !l.liked } : l));
    if (isMock || !token) return;
    try { await toggleLikeLook(token, id); }
    catch { setLooks(prev => prev.map(l => l.id === id ? { ...l, liked: !l.liked } : l)); }
  };

  if (authLoading || !user) {
    return (
      <div className="tf2-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)" }}>
        <p style={{ color: "var(--tf-ink-soft)" }}>Loading your looks...</p>
      </div>
    );
  }

  return (
    <div className="tf2-page" style={{ padding: "28px 56px 64px", minHeight: "calc(100vh - 64px)" }}>

      {/* ── Compact toolbar (no oversized title — just the switcher + controls) ── */}
      <div className="tf2-closet-header">
        <ClosetSectionNav active="looks" />

        <Link href="/studio" className="tf2-btn tf2-btn-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create look
        </Link>
      </div>

      <div className="tf2-bubble-row" style={{ marginBottom: 28 }}>
        {LOOK_FILTERS.map(f => (
          <button key={f.id} type="button" className={`tf2-chip${lookFilter === f.id ? " active" : ""}`} onClick={() => setLookFilter(f.id)}>
            {f.label}
            {f.id !== "all" && ` · ${looks.filter(l => l.occasion === f.id).length}`}
          </button>
        ))}
      </div>

      {looksLoading ? (
        <p style={{ color: "var(--tf-ink-soft)", textAlign: "center", padding: 60 }}>Loading looks...</p>
      ) : filteredLooks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <h3 className="tf2-serif" style={{ fontSize: 22, fontWeight: 600, marginBottom: 8, color: "var(--tf-ink)" }}>No {lookFilter === "all" ? "" : lookFilter + " "}looks yet</h3>
          <p style={{ color: "var(--tf-ink-soft)", fontSize: 14, marginBottom: 20 }}>Open the Studio and save a complete outfit as a look.</p>
          <Link href="/studio" className="tf2-btn tf2-btn-primary">Open Studio</Link>
        </div>
      ) : (
        <div className="tf2-look-grid">
          {filteredLooks.map(look => (
            <div key={look.id} className="tf2-look-card">
              <img src={look.image} alt={look.name} />
              <button
                type="button"
                onClick={() => toggleLike(look.id)}
                aria-label={look.liked ? "Unlike" : "Like"}
                style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", background: "color-mix(in oklch, var(--tf-surface) 75%, transparent)", backdropFilter: "blur(8px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {look.liked
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="#b3341c" stroke="#b3341c" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--tf-ink-soft)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                }
              </button>
              <div className="tf2-look-card-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <strong>{look.name}</strong>
                  <span>{look.pieces.length} pieces · {look.date}</span>
                </div>
                <Link href="/studio" className="tf2-btn tf2-btn-dark tf2-btn-sm">Open</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
