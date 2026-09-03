"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface TaggedProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
}

export interface Comment {
  id: string;
  user: string;
  avatarBg?: string;
  text: string;
  time: string;
  likes?: number;
}

export interface TrendingOutfit {
  id: string;
  title: string;
  brandStore: string;
  brandHandle: string;
  brandAvatar: string;
  brandAvatarBg: string;
  isVerified: boolean;
  location: string;
  image: string;
  likes: number;
  availableOn: string[];
  description: string;
  tags: string[];
  timePosted: string;
  taggedProducts: TaggedProduct[];
  comments: Comment[];
  isLikedByUser?: boolean;
  isSaved?: boolean;
}

const BRAND_STORIES = [
  { id: "all", name: "All Brands", logo: "ALL", bg: "linear-gradient(135deg, #00c98d, #0ea5e9)", active: true },
  { id: "zara", name: "Zara", handle: "@zara_official", logo: "ZR", bg: "linear-gradient(135deg, #18181b, #3f3f46)" },
  { id: "hm", name: "H&M Studio", handle: "@hm_edition", logo: "HM", bg: "linear-gradient(135deg, #e11d48, #f43f5e)" },
  { id: "mango", name: "Mango", handle: "@mangostudio", logo: "MG", bg: "linear-gradient(135deg, #d97706, #f59e0b)" },
  { id: "sunita", name: "Sunita S.", handle: "@sunitashekhawat_official", logo: "SS", bg: "linear-gradient(135deg, #854d0e, #ca8a04)" },
  { id: "urbanic", name: "Urbanic", handle: "@urbanic_official", logo: "UB", bg: "linear-gradient(135deg, #7c3aed, #a855f7)" },
  { id: "massimo", name: "Massimo D.", handle: "@massimodutti", logo: "MD", bg: "linear-gradient(135deg, #0f172a, #334155)" },
];

const CATEGORIES = [
  "All",
  "New In",
  "Streetwear",
  "Minimalist",
  "Office Chic",
  "Partywear",
  "Summer Casual",
  "Luxury Tailoring",
];

const INITIAL_OUTFITS: TrendingOutfit[] = [
  {
    id: "trending-1",
    title: "Summer Riviera Chiffon & Minimalist Leather",
    brandStore: "Zara Official",
    brandHandle: "@zara_official",
    brandAvatar: "ZR",
    brandAvatarBg: "linear-gradient(135deg, #18181b, #3f3f46)",
    isVerified: true,
    location: "Portofino, Italy • Spring/Summer '26 Drop",
    image: "/images/look_brunch.png",
    likes: 1420,
    availableOn: ["Zara", "Myntra"],
    description: "Breezy editorial pairing for sunlit brunch gatherings. Features fluid floral draping balanced with structured accessories and clean sneakers.",
    tags: ["Summer", "Brunch", "Zara", "Minimalist"],
    timePosted: "2 hours ago",
    taggedProducts: [
      { id: "p1", name: "Floral Chiffon Maxi Dress", brand: "Zara", price: 2990, image: "/images/floral_dress.png", category: "Dresses" },
      { id: "p2", name: "Minimalist Leather Sneakers", brand: "H&M", price: 3290, image: "/images/white_sneakers.png", category: "Footwear" },
      { id: "p3", name: "Structured Leather Tote Bag", brand: "Mango", price: 4490, image: "/images/leather_tote.png", category: "Bags" },
    ],
    comments: [
      { id: "c1", user: "ananya_style", text: "The floral drape on this dress is extraordinary!", time: "1h ago", likes: 14 },
      { id: "c2", user: "dev.kapoor", text: "Are the white sneakers true to size?", time: "45m ago", likes: 3 },
      { id: "c3", user: "sophia_mode", text: "Perfect color contrast with the neutral bag.", time: "10m ago", likes: 8 },
    ],
  },
  {
    id: "trending-2",
    title: "Midnight Silk Slip & Oversized Tailored Blazer",
    brandStore: "Mango Studio",
    brandHandle: "@mangostudio",
    brandAvatar: "MG",
    brandAvatarBg: "linear-gradient(135deg, #d97706, #f59e0b)",
    isVerified: true,
    location: "Milan Fashion Week • Evening Capsule",
    image: "/images/look_date.png",
    likes: 2150,
    availableOn: ["Mango", "Zara"],
    description: "Sleek heavy satin slip dress layered beneath a structured wool-blend oversized blazer. Finished with block heel pumps for high-fashion date night.",
    tags: ["DateNight", "Mango", "Tailored", "Silk"],
    timePosted: "4 hours ago",
    taggedProducts: [
      { id: "p4", name: "Heavy Silk Satin Slip Dress", brand: "Mango", price: 3490, image: "/images/satin_dress.png", category: "Dresses" },
      { id: "p5", name: "Oversized Wool-Blend Blazer", brand: "Zara", price: 4990, image: "/images/blazer.png", category: "Outerwear" },
      { id: "p6", name: "Block Heel Ankle Pumps", brand: "H&M", price: 3190, image: "/images/heel_pumps.png", category: "Footwear" },
    ],
    comments: [
      { id: "c4", user: "emma_nordic", text: "The sharp shoulder on the blazer elevates the whole silhouette.", time: "3h ago", likes: 21 },
      { id: "c5", user: "marcus_co", text: "Can we try this on in the 3D studio?", time: "2h ago", likes: 5 },
    ],
  },
  {
    id: "trending-3",
    title: "Effortless Oxford Shirt & Clean Black Denim",
    brandStore: "H&M Edition",
    brandHandle: "@hm_edition",
    brandAvatar: "HM",
    brandAvatarBg: "linear-gradient(135deg, #e11d48, #f43f5e)",
    isVerified: true,
    location: "Paris, France • Street Style Edit",
    image: "/images/look_errands.png",
    likes: 980,
    availableOn: ["H&M", "Myntra"],
    description: "Crisp oversized cotton oxford button-down styled with black skinny jeans and sleek cat-eye eyewear. The definition of modern off-duty luxury.",
    tags: ["Streetwear", "Minimalist", "Comfy", "HM"],
    timePosted: "1 day ago",
    taggedProducts: [
      { id: "p7", name: "Crisp Cotton Oxford Shirt", brand: "H&M", price: 1890, image: "/images/white_oxford.png", category: "Tops" },
      { id: "p8", name: "High-Rise Black Skinny Jeans", brand: "Zara", price: 2790, image: "/images/black_jeans.png", category: "Bottoms" },
      { id: "p9", name: "Cat-Eye UV Protection Sunglasses", brand: "Mango", price: 1490, image: "/images/sunglasses.png", category: "Accessories" },
    ],
    comments: [
      { id: "c6", user: "alex_v", text: "So crisp and effortless. A wardrobe staple.", time: "20h ago", likes: 9 },
      { id: "c7", user: "luna.fashions", text: "Adding the shirt directly to my try-on queue!", time: "15h ago", likes: 4 },
    ],
  },
  {
    id: "trending-4",
    title: "Double-Breasted Wool Trench & Pearl Adornments",
    brandStore: "Sunita Shekhawat Gallery",
    brandHandle: "@sunitashekhawat_official",
    brandAvatar: "SS",
    brandAvatarBg: "linear-gradient(135deg, #854d0e, #ca8a04)",
    isVerified: true,
    location: "London Mayfair • Haute Couture Capsule",
    image: "/images/look_office.png",
    likes: 3410,
    availableOn: ["Sunita Shekhawat", "Myntra"],
    description: "A timeless heritage trench layered over fine textured silk and embellished with handcrafted pearl jewelry. Engineered for the modern executive.",
    tags: ["Office", "Luxury", "Trench", "SunitaShekhawat"],
    timePosted: "2 days ago",
    taggedProducts: [
      { id: "p10", name: "Double-Breasted Wool Trench Coat", brand: "Sunita Shekhawat", price: 8990, image: "/images/trench_coat.png", category: "Outerwear" },
      { id: "p11", name: "Textured Silk Work Blouse", brand: "Zara", price: 2890, image: "/images/silk_blouse.png", category: "Tops" },
      { id: "p12", name: "Handcrafted Pearl Chain Necklace", brand: "Sunita Shekhawat", price: 12490, image: "/images/pearl_necklace.png", category: "Jewelry" },
    ],
    comments: [
      { id: "c8", user: "dan_invest", text: "Masterpiece outerwear craftsmanship.", time: "1d ago", likes: 32 },
    ],
  },
  {
    id: "trending-5",
    title: "Velvet Pleated Glamour & Metallic Accents",
    brandStore: "Urbanic Atelier",
    brandHandle: "@urbanic_official",
    brandAvatar: "UB",
    brandAvatarBg: "linear-gradient(135deg, #7c3aed, #a855f7)",
    isVerified: true,
    location: "Manhattan, New York • After Hours Gala",
    image: "/images/look_party.png",
    likes: 4890,
    availableOn: ["Urbanic", "H&M"],
    description: "Deep noir velvet paired with shimmering metallic accessories. Crafted to command attention in low-light evening cocktail galas.",
    tags: ["Partywear", "Glam", "Cocktail", "Urbanic"],
    timePosted: "2 days ago",
    taggedProducts: [
      { id: "p13", name: "Velvet Pleated Midi Skirt", brand: "Urbanic", price: 2290, image: "/images/velvet_skirt.png", category: "Bottoms" },
      { id: "p14", name: "Classic Little Black Dress", brand: "Mango", price: 3890, image: "/images/little_black_dress.png", category: "Dresses" },
      { id: "p15", name: "Pointed Stiletto Heel Pumps", brand: "Zara", price: 3490, image: "/images/heel_pumps.png", category: "Footwear" },
    ],
    comments: [
      { id: "c9", user: "joy_vibes", text: "Absolutely stunning cocktail outfit!", time: "2d ago", likes: 18 },
      { id: "c10", user: "sara_k", text: "Just tried this on with my AI avatar - fit looks unreal!", time: "1d ago", likes: 25 },
    ],
  },
  {
    id: "trending-6",
    title: "Tailored Camel Coat & Signature Leather Accents",
    brandStore: "Massimo Dutti",
    brandHandle: "@massimodutti",
    brandAvatar: "MD",
    brandAvatarBg: "linear-gradient(135deg, #0f172a, #334155)",
    isVerified: true,
    location: "Copenhagen, Denmark • Winter Editorial",
    image: "/images/look_formal.png",
    likes: 2730,
    availableOn: ["Massimo Dutti", "Myntra"],
    description: "Neutral luxury styling featuring wool cashmere camel tailoring, rich leather goods, and refined tortoiseshell frames.",
    tags: ["Formal", "MassimoDutti", "Coat", "Minimalist"],
    timePosted: "3 days ago",
    taggedProducts: [
      { id: "p16", name: "Oversized Camel Wool Blazer", brand: "Massimo Dutti", price: 6990, image: "/images/blazer.png", category: "Outerwear" },
      { id: "p17", name: "Structured Leather Tote", brand: "Zara", price: 4490, image: "/images/leather_tote.png", category: "Bags" },
      { id: "p18", name: "Vintage Tortoiseshell Sunglasses", brand: "H&M", price: 1690, image: "/images/sunglasses.png", category: "Accessories" },
    ],
    comments: [
      { id: "c11", user: "victor_h", text: "Quiet luxury done to perfection.", time: "2d ago", likes: 12 },
    ],
  },
];

export default function TrendingPage() {
  const router = useRouter();
  const [outfits, setOutfits] = useState<TrendingOutfit[]>(INITIAL_OUTFITS);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrandStory, setSelectedBrandStory] = useState("all");
  const [viewMode, setViewMode] = useState<"feed" | "grid">("feed");
  const [selectedOutfit, setSelectedOutfit] = useState<TrendingOutfit | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openTagsOutfitId, setOpenTagsOutfitId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filter outfits based on Search, Category, and Brand Story
  const filteredOutfits = useMemo(() => {
    return outfits.filter((outfit) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        outfit.title.toLowerCase().includes(query) ||
        outfit.brandStore.toLowerCase().includes(query) ||
        outfit.description.toLowerCase().includes(query) ||
        outfit.tags.some((t) => t.toLowerCase().includes(query)) ||
        outfit.taggedProducts.some((p) => p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query));

      const matchesCategory =
        selectedCategory === "All" ||
        outfit.tags.some((t) => t.toLowerCase() === selectedCategory.toLowerCase()) ||
        outfit.title.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchesBrandStory =
        selectedBrandStory === "all" ||
        outfit.brandStore.toLowerCase().includes(selectedBrandStory) ||
        outfit.brandHandle.toLowerCase().includes(selectedBrandStory);

      return matchesSearch && matchesCategory && matchesBrandStory;
    });
  }, [outfits, search, selectedCategory, selectedBrandStory]);

  const handleLike = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOutfits((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const liked = !item.isLikedByUser;
          const updated = {
            ...item,
            isLikedByUser: liked,
            likes: liked ? item.likes + 1 : item.likes - 1,
          };
          if (selectedOutfit?.id === id) setSelectedOutfit(updated);
          return updated;
        }
        return item;
      })
    );
  };

  const handleSave = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOutfits((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const saved = !item.isSaved;
          showToast(saved ? "Look saved to your Wardrobe collection!" : "Removed from saved collection");
          const updated = { ...item, isSaved: saved };
          if (selectedOutfit?.id === id) setSelectedOutfit(updated);
          return updated;
        }
        return item;
      })
    );
  };

  const handleShare = (title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast(`Link for "${title}" copied to clipboard!`);
    } else {
      showToast("Look shared!");
    }
  };

  const handleAddComment = (outfitId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[outfitId]?.trim();
    if (!text) return;

    const newComment: Comment = {
      id: "c-" + Date.now(),
      user: "You",
      text,
      time: "Just now",
      likes: 0,
    };

    setOutfits((prev) =>
      prev.map((item) => {
        if (item.id === outfitId) {
          const updated = { ...item, comments: [newComment, ...item.comments] };
          if (selectedOutfit?.id === outfitId) setSelectedOutfit(updated);
          return updated;
        }
        return item;
      })
    );

    setCommentInputs((prev) => ({ ...prev, [outfitId]: "" }));
    showToast("Comment posted!");
  };

  const handleTryOnOutfit = (outfit: TrendingOutfit, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Navigate to studio with selected outfit context
    router.push("/studio");
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="page-wrapper ig-trending-page">
      {/* ── Page Controls Bar ── */}
      <div className="ig-page-header">
        <div className="ig-header-controls" style={{ width: "100%", justifyContent: "space-between" }}>
          {/* Search Box */}
          <div className="ig-search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search looks, brands, items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ig-search-input"
            />
            {search && (
              <button onClick={() => setSearch("")} className="ig-search-clear">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>

          {/* View Mode Toggle Switch */}
          <div className="ig-view-toggle">
            <button
              type="button"
              className={`ig-toggle-btn ${viewMode === "feed" ? "active" : ""}`}
              onClick={() => setViewMode("feed")}
              aria-label="Feed View"
              title="Feed View"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              <span>Feed</span>
            </button>
            <button
              type="button"
              className={`ig-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid View"
              title="Grid View"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Brand Stories Highlights Bar ── */}
      <div className="ig-stories-container">
        <div className="ig-stories-scroll">
          {BRAND_STORIES.map((story) => (
            <button
              key={story.id}
              type="button"
              className={`ig-story-item ${selectedBrandStory === story.id ? "selected" : ""}`}
              onClick={() => setSelectedBrandStory(story.id)}
            >
              <div className="ig-story-ring">
                <div className="ig-story-avatar" style={{ background: story.bg }}>
                  {story.logo}
                </div>
              </div>
              <span className="ig-story-name">{story.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Category Filter Pills ── */}
      <div className="ig-categories-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`ig-category-pill ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Main Feed / Grid Content ── */}
      {filteredOutfits.length === 0 ? (
        <div className="ig-empty-state">
          <div className="ig-empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </div>
          <h3 className="ig-empty-title">No matching fashion looks found</h3>
          <p className="ig-empty-desc">Try clearing your search query or selecting a different brand story.</p>
          <button
            type="button"
            className="ss-btn-primary"
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
              setSelectedBrandStory("all");
            }}
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === "feed" ? (
        /* ══════════════════════════════════════════════════════════════════
           INSTAGRAM-STYLE VERTICAL FEED CARDS
           ══════════════════════════════════════════════════════════════════ */
        <div className="ig-feed-container">
          {filteredOutfits.map((outfit) => {
            const areTagsOpen = openTagsOutfitId === outfit.id;
            return (
              <article key={outfit.id} className="ig-feed-card">
                {/* ── Post Header ── */}
                <div className="ig-post-header">
                  <div className="ig-post-brand-info">
                    <div className="ig-brand-avatar" style={{ background: outfit.brandAvatarBg }}>
                      {outfit.brandAvatar}
                    </div>
                    <div>
                      <div className="ig-brand-title-wrap">
                        <span className="ig-brand-name">{outfit.brandStore}</span>
                        {outfit.isVerified && (
                          <span className="ig-verified-badge" title="Verified Brand Partner">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#00c98d">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <span className="ig-post-location">{outfit.location}</span>
                    </div>
                  </div>

                  <div className="ig-post-header-actions">
                    <span className="ig-post-time">{outfit.timePosted}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedOutfit(outfit)}
                      className="ig-post-more-btn"
                      aria-label="View post options"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* ── Post Media Image ── */}
                <div className="ig-post-media-wrap" onDoubleClick={() => handleLike(outfit.id)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={outfit.image}
                    alt={outfit.title}
                    className="ig-post-image"
                    loading="lazy"
                  />

                  {/* Floating Tag Products Indicator */}
                  <button
                    type="button"
                    className={`ig-shop-tag-pill ${areTagsOpen ? "active" : ""}`}
                    onClick={() => setOpenTagsOutfitId(areTagsOpen ? null : outfit.id)}
                    aria-label="View tagged products in this outfit"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                      <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                    <span>{outfit.taggedProducts.length} items</span>
                  </button>

                  {/* Available Store Badges Overlay */}
                  <div className="ig-post-store-badges">
                    {outfit.availableOn.map((store) => (
                      <span key={store} className="ig-store-badge">
                        {store}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ── Tagged Shoppable Products Drawer ── */}
                {areTagsOpen && (
                  <div className="ig-tagged-products-drawer">
                    <div className="ig-drawer-header">
                      <span className="ig-drawer-title">Products in this look</span>
                      <button
                        type="button"
                        onClick={() => setOpenTagsOutfitId(null)}
                        className="ig-drawer-close"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="ig-tagged-products-list">
                      {outfit.taggedProducts.map((product) => (
                        <div key={product.id} className="ig-tagged-product-card">
                          <div className="ig-tagged-img-wrap">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={product.image} alt={product.name} />
                          </div>
                          <div className="ig-tagged-info">
                            <span className="ig-tagged-brand">{product.brand}</span>
                            <h4 className="ig-tagged-name">{product.name}</h4>
                            <span className="ig-tagged-price">{formatPrice(product.price)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => router.push("/studio")}
                            className="ig-tagged-try-btn"
                          >
                            Try On
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Action Bar ── */}
                <div className="ig-action-bar">
                  <div className="ig-action-group-left">
                    {/* Like Button */}
                    <button
                      type="button"
                      onClick={(e) => handleLike(outfit.id, e)}
                      className={`ig-action-icon-btn ${outfit.isLikedByUser ? "liked" : ""}`}
                      aria-label="Like post"
                    >
                      {outfit.isLikedByUser ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      )}
                    </button>

                    {/* Comment Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedOutfit(outfit)}
                      className="ig-action-icon-btn"
                      aria-label="View comments"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                      </svg>
                    </button>

                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={(e) => handleShare(outfit.title, e)}
                      className="ig-action-icon-btn"
                      aria-label="Share post"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </div>

                  <div className="ig-action-group-right">
                    {/* Save to Wardrobe Bookmark Button */}
                    <button
                      type="button"
                      onClick={(e) => handleSave(outfit.id, e)}
                      className={`ig-action-icon-btn ${outfit.isSaved ? "saved" : ""}`}
                      aria-label="Save to wardrobe"
                      title="Save to Wardrobe"
                    >
                      {outfit.isSaved ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--purple)" stroke="var(--purple)" strokeWidth="2">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                      )}
                    </button>

                    {/* Direct Try On In Studio CTA Button */}
                    <button
                      type="button"
                      onClick={(e) => handleTryOnOutfit(outfit, e)}
                      className="ig-tryon-primary-btn"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      <span>Try On Look</span>
                    </button>
                  </div>
                </div>

                {/* ── Likes & Caption Details ── */}
                <div className="ig-post-details">
                  <div className="ig-likes-count">
                    Liked by <span className="font-bold">vogue_fashion</span> and{" "}
                    <span className="font-bold">{outfit.likes.toLocaleString()} others</span>
                  </div>

                  <div className="ig-caption-wrap">
                    <span className="ig-caption-author">{outfit.brandStore}</span>
                    <span className="ig-caption-text">{outfit.description}</span>
                  </div>

                  {/* Hashtags */}
                  <div className="ig-hashtags-wrap">
                    {outfit.tags.map((t) => (
                      <span key={t} className="ig-hashtag">
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Comments Preview */}
                  {outfit.comments.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedOutfit(outfit)}
                      className="ig-view-comments-btn"
                    >
                      View all {outfit.comments.length} comments
                    </button>
                  )}

                  {/* Inline Quick Comment Input */}
                  <form className="ig-inline-comment-form" onSubmit={(e) => handleAddComment(outfit.id, e)}>
                    <input
                      type="text"
                      placeholder="Add a comment for this look..."
                      value={commentInputs[outfit.id] || ""}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [outfit.id]: e.target.value })}
                      className="ig-inline-comment-input"
                    />
                    {commentInputs[outfit.id]?.trim() && (
                      <button type="submit" className="ig-inline-comment-post-btn">
                        Post
                      </button>
                    )}
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════
           INSTAGRAM-STYLE 3-COLUMN EXPLORE GRID
           ══════════════════════════════════════════════════════════════════ */
        <div className="ig-explore-grid">
          {filteredOutfits.map((outfit) => (
            <div
              key={outfit.id}
              className="ig-explore-card"
              onClick={() => setSelectedOutfit(outfit)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={outfit.image} alt={outfit.title} className="ig-explore-img" loading="lazy" />

              <div className="ig-explore-overlay">
                <div className="ig-explore-brand">{outfit.brandStore}</div>
                <div className="ig-explore-title">{outfit.title}</div>

                <div className="ig-explore-stats">
                  <span className="ig-explore-stat">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                    </svg>
                    {outfit.likes}
                  </span>
                  <span className="ig-explore-stat">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                    {outfit.comments.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleTryOnOutfit(outfit, e)}
                  className="ig-explore-try-btn"
                >
                  Try On Look
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
         FULL PRODUCT DETAIL / COMMENTS MODAL
         ══════════════════════════════════════════════════════════════════ */}
      {selectedOutfit && (
        <div className="ig-modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedOutfit(null)}>
          <div className="ig-modal-container">
            {/* Close Modal Button */}
            <button
              type="button"
              onClick={() => setSelectedOutfit(null)}
              className="ig-modal-close-btn"
              aria-label="Close dialog"
            >
              ✕
            </button>

            {/* Left Image Column */}
            <div className="ig-modal-media-col">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedOutfit.image} alt={selectedOutfit.title} />
            </div>

            {/* Right Details Column */}
            <div className="ig-modal-details-col">
              {/* Header */}
              <div className="ig-modal-header">
                <div className="ig-modal-brand-info">
                  <div className="ig-brand-avatar" style={{ background: selectedOutfit.brandAvatarBg }}>
                    {selectedOutfit.brandAvatar}
                  </div>
                  <div>
                    <div className="ig-brand-title-wrap">
                      <span className="ig-brand-name">{selectedOutfit.brandStore}</span>
                      {selectedOutfit.isVerified && (
                        <span className="ig-verified-badge">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#00c98d">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <span className="ig-post-location">{selectedOutfit.location}</span>
                  </div>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="ig-modal-body">
                <p className="ig-modal-caption">{selectedOutfit.description}</p>

                {/* Shoppable Tagged Items */}
                <div className="ig-modal-section">
                  <h4 className="ig-modal-section-title">
                    Shoppable Garments ({selectedOutfit.taggedProducts.length})
                  </h4>
                  <div className="ig-modal-products-grid">
                    {selectedOutfit.taggedProducts.map((item) => (
                      <div key={item.id} className="ig-modal-product-item">
                        <div className="ig-modal-item-img">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="ig-modal-item-info">
                          <span className="ig-modal-item-brand">{item.brand}</span>
                          <h5 className="ig-modal-item-title">{item.name}</h5>
                          <span className="ig-modal-item-price">{formatPrice(item.price)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => router.push("/studio")}
                          className="ss-btn-primary"
                          style={{ fontSize: 11, padding: "5px 10px" }}
                        >
                          Try
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comments Section */}
                <div className="ig-modal-section">
                  <h4 className="ig-modal-section-title">
                    Comments ({selectedOutfit.comments.length})
                  </h4>
                  <div className="ig-modal-comments-list">
                    {selectedOutfit.comments.map((c) => (
                      <div key={c.id} className="ig-comment-row">
                        <div className="ig-comment-avatar">
                          {c.user[0].toUpperCase()}
                        </div>
                        <div className="ig-comment-content">
                          <div className="ig-comment-user-line">
                            <span className="ig-comment-user">{c.user}</span>
                            <span className="ig-comment-time">{c.time}</span>
                          </div>
                          <p className="ig-comment-text">{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="ig-modal-footer">
                <div className="ig-action-bar" style={{ padding: 0 }}>
                  <div className="ig-action-group-left">
                    <button
                      type="button"
                      onClick={() => handleLike(selectedOutfit.id)}
                      className={`ig-action-icon-btn ${selectedOutfit.isLikedByUser ? "liked" : ""}`}
                    >
                      {selectedOutfit.isLikedByUser ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare(selectedOutfit.title)}
                      className="ig-action-icon-btn"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTryOnOutfit(selectedOutfit)}
                    className="ig-tryon-primary-btn"
                  >
                    Try On in Studio
                  </button>
                </div>

                {/* Comment Form */}
                <form className="ig-inline-comment-form" onSubmit={(e) => handleAddComment(selectedOutfit.id, e)} style={{ marginTop: 12 }}>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentInputs[selectedOutfit.id] || ""}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [selectedOutfit.id]: e.target.value })}
                    className="ig-inline-comment-input"
                  />
                  {commentInputs[selectedOutfit.id]?.trim() && (
                    <button type="submit" className="ig-inline-comment-post-btn">
                      Post
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="ig-toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--purple)" }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
