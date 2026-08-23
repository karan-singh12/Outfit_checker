"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

interface Comment {
  id: string;
  user: string;
  text: string;
  time: string;
}

interface TrendingOutfit {
  id: string;
  title: string;
  brandStore: string;
  brandAvatar: string;
  image: string;
  likes: number;
  availableOn: string[];
  description: string;
  tags: string[];
  items: string[];
  comments: Comment[];
  isLikedByUser?: boolean;
  timePosted: string;
}

const INITIAL_OUTFITS: TrendingOutfit[] = [
  {
    id: "trending-1",
    title: "Summer Sunday Brunch",
    brandStore: "H&M New Arrivals",
    brandAvatar: "HM",
    image: "/images/look_brunch.png",
    likes: 245,
    availableOn: ["H&M", "Myntra"],
    description: "Keep it breezy and stylish with this perfect summer pairing of a floral dress, white sneakers, and a neutral leather tote.",
    tags: ["Summer", "Brunch", "H&M"],
    items: ["Floral Maxi Dress", "White Sneakers", "Leather Tote Bag"],
    timePosted: "2 hours ago",
    comments: [
      { id: "c1", user: "Alice", text: "Stunning! The floral dress is so pretty.", time: "1h ago" },
      { id: "c2", user: "David", text: "Are the sneakers true to size?", time: "45m ago" },
      { id: "c3", user: "Sophia", text: "Perfect styling!", time: "10m ago" }
    ]
  },
  {
    id: "trending-2",
    title: "Chic Date Night",
    brandStore: "Zara Club",
    brandAvatar: "ZR",
    image: "/images/look_date.png",
    likes: 312,
    availableOn: ["Zara"],
    description: "Sleek satin slip dress layered under a crisp oversized blazer. Finished with block heel pumps for that elegant night-out touch.",
    tags: ["DateNight", "Zara", "Elegant"],
    items: ["Satin Slip Dress", "Oversized Blazer", "Block Heel Pumps"],
    timePosted: "5 hours ago",
    comments: [
      { id: "c4", user: "Emma", text: "Love the oversized blazer look.", time: "4h ago" },
      { id: "c5", user: "Marc", text: "Where can I buy the slip dress?", time: "2h ago" }
    ]
  },
  {
    id: "trending-3",
    title: "Effortless Errands",
    brandStore: "Myntra Essentials",
    brandAvatar: "MY",
    image: "/images/look_errands.png",
    likes: 189,
    availableOn: ["Myntra", "Zara"],
    description: "White oxford shirt, black skinny jeans, and comfortable sneakers. Throw on sunglasses and you are ready to conquer the day.",
    tags: ["Errands", "Minimalist", "Comfy"],
    items: ["White Oxford Shirt", "Black Skinny Jeans", "White Sneakers", "Cat-Eye Sunglasses"],
    timePosted: "1 day ago",
    comments: [
      { id: "c6", user: "Alex", text: "So simple yet perfect.", time: "20h ago" },
      { id: "c7", user: "Luna", text: "Love the cat-eye sunglasses!", time: "15h ago" }
    ]
  },
  {
    id: "trending-4",
    title: "Modern Office Smart",
    brandStore: "Zara Formal",
    brandAvatar: "ZR",
    image: "/images/look_office.png",
    likes: 278,
    availableOn: ["Zara", "Myntra"],
    description: "Formal trench coat layered over a structured silk blouse and smart trousers. Professional yet highly fashionable.",
    tags: ["Office", "Workwear", "Formal"],
    items: ["Trench Coat", "Silk Blouse", "Leather Tote Bag"],
    timePosted: "2 days ago",
    comments: [
      { id: "c8", user: "Dan", text: "The trench coat is a masterpiece.", time: "1d ago" }
    ]
  },
  {
    id: "trending-5",
    title: "Cocktail Party Vibe",
    brandStore: "H&M Partywear",
    brandAvatar: "HM",
    image: "/images/look_party.png",
    likes: 423,
    availableOn: ["H&M", "Myntra"],
    description: "Get ready to shine at any party with this stunning slip dress and sparkly accessories.",
    tags: ["Party", "Glam", "Cocktail"],
    items: ["Satin Slip Dress", "Pearl Necklace", "Block Heel Pumps"],
    timePosted: "2 days ago",
    comments: [
      { id: "c9", user: "Joy", text: "Fabulous look!", time: "2d ago" },
      { id: "c10", user: "Sara", text: "Definitely buying this for my birthday!", time: "1d ago" }
    ]
  },
  {
    id: "trending-6",
    title: "Formal Winter Coat",
    brandStore: "Mango Premium",
    brandAvatar: "MG",
    image: "/images/look_formal.png",
    likes: 356,
    availableOn: ["Mango", "Myntra"],
    description: "Classic neutral styling featuring Mango wool-mix coat and elegant accessories.",
    tags: ["Formal", "Coat", "Winter"],
    items: ["Oversized Blazer", "Leather Tote Bag", "Cat-Eye Sunglasses"],
    timePosted: "3 days ago",
    comments: [
      { id: "c11", user: "Victor", text: "Very classy and professional.", time: "2d ago" },
      { id: "c12", user: "Bella", text: "Timeless styling.", time: "2d ago" }
    ]
  }
];

export default function TrendingPage() {
  const [outfits, setOutfits] = useState<TrendingOutfit[]>(INITIAL_OUTFITS);
  const [search, setSearch] = useState("");
  const [selectedOutfit, setSelectedOutfit] = useState<TrendingOutfit | null>(null);
  const [commentText, setCommentText] = useState("");
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Filter outfits by title, description, brand, or tags
  const filteredOutfits = useMemo(() => {
    return outfits.filter(outfit => {
      const query = search.toLowerCase();
      return (
        outfit.title.toLowerCase().includes(query) ||
        outfit.brandStore.toLowerCase().includes(query) ||
        outfit.description.toLowerCase().includes(query) ||
        outfit.tags.some(tag => tag.toLowerCase().includes(query))
      );
    });
  }, [outfits, search]);

  const handleLike = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Prevent modal opening when liking on grid
    
    setOutfits(prev =>
      prev.map(outfit => {
        if (outfit.id === id) {
          const liked = !outfit.isLikedByUser;
          const updated = {
            ...outfit,
            isLikedByUser: liked,
            likes: liked ? outfit.likes + 1 : outfit.likes - 1
          };
          // Sync selected outfit if it's the one open in modal
          if (selectedOutfit && selectedOutfit.id === id) {
            setSelectedOutfit(updated);
          }
          return updated;
        }
        return outfit;
      })
    );
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedOutfit) return;

    const newComment: Comment = {
      id: "comment-" + Date.now(),
      user: "You",
      text: commentText.trim(),
      time: "Just now"
    };

    setOutfits(prev =>
      prev.map(outfit => {
        if (outfit.id === selectedOutfit.id) {
          const updated = {
            ...outfit,
            comments: [...outfit.comments, newComment]
          };
          setSelectedOutfit(updated);
          return updated;
        }
        return outfit;
      })
    );

    setCommentText("");
  };

  const handleShare = (title: string) => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="page-wrapper" style={{ paddingTop: 28 }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-header-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div>
            <h1>Trending Brand Feed</h1>
            <p className="page-header-sub">Official brand partners showcasing outfits shoppable on our platform</p>
          </div>
        </div>
        <div className="trending-search" style={{ maxWidth: 300 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search brands or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Explore Grid Feed */}
      {filteredOutfits.length === 0 ? (
        <div className="empty-state" style={{ padding: "120px 40px" }}>
          <div className="empty-state-icon">🛍️</div>
          <h3 className="empty-state-title">No campaigns match your search</h3>
          <p className="empty-state-desc">Try search terms like Zara, H&M, Summer, or Formal.</p>
          <button type="button" className="btn btn-ghost" onClick={() => setSearch("")}>Reset Search</button>
        </div>
      ) : (
        <div className="trending-grid">
          {filteredOutfits.map(outfit => (
            <div
              key={outfit.id}
              className="trending-grid-card"
              onClick={() => setSelectedOutfit(outfit)}
            >
              <img src={outfit.image} alt={outfit.title} />
              
              {/* Instagram-style Hover Overlay */}
              <div className="trending-grid-overlay">
                <div className="trending-grid-brand">{outfit.brandStore}</div>
                <div className="trending-grid-avail">Available on {outfit.availableOn.join(" & ")}</div>
                
                <div className="trending-grid-stats" style={{ marginTop: 8 }}>
                  <span className="trending-grid-stat">
                    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    {outfit.likes}
                  </span>
                  <span className="trending-grid-stat">
                    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                    {outfit.comments.length}
                  </span>
                </div>
              </div>

              {/* Mobile Info view — rendered inline on touch devices, hidden on desktop */}
              <div className="trending-card-mobile-info">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div className="creator-profile">
                    <div className="creator-avatar" style={{ width: 28, height: 28, fontSize: 10, background: "var(--purple)", color: "#fff" }}>
                      {outfit.brandAvatar}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{outfit.brandStore}</h4>
                      <p style={{ fontSize: 9, color: "var(--muted)" }}>Brand Partner</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>{outfit.timePosted}</span>
                </div>
                
                <p style={{ fontSize: 12.5, color: "var(--text-soft)", margin: "4px 0 0" }}>{outfit.description}</p>
                
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                  {outfit.availableOn.map(s => (
                    <span key={s} className="brand-badge" style={{ padding: "2px 8px", fontSize: 10 }}>{s}</span>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, borderTop: "1px solid var(--card-border)", paddingTop: 10 }}>
                  <button
                    type="button"
                    className={`action-btn${outfit.isLikedByUser ? " liked" : ""}`}
                    onClick={(e) => handleLike(outfit.id, e)}
                    style={{ padding: 0, fontSize: 12 }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    {outfit.likes} Likes
                  </button>

                  <button
                    type="button"
                    className="action-btn"
                    onClick={(e) => { e.stopPropagation(); setSelectedOutfit(outfit); }}
                    style={{ padding: 0, fontSize: 12 }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                    {outfit.comments.length} Comments
                  </button>

                  <Link href="/studio" className="btn btn-gradient btn-sm" style={{ marginLeft: "auto", fontSize: 11, padding: "5px 10px" }} onClick={(e) => e.stopPropagation()}>
                    Try On Fit
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Instagram-Style Detail Modal */}
      {selectedOutfit && (
        <div className="post-detail-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedOutfit(null)}>
          <div className="post-detail-modal">
            
            {/* Left Column: Image Area */}
            <div className="post-detail-left">
              <img src={selectedOutfit.image} alt={selectedOutfit.title} />
            </div>

            {/* Right Column: Brand and Interactive Comments Info */}
            <div className="post-detail-right">
              {/* Profile Header */}
              <div className="post-detail-header">
                <div className="creator-profile">
                  <div className="creator-avatar" style={{ width: 34, height: 34, fontSize: 11 }}>
                    {selectedOutfit.brandAvatar}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                      {selectedOutfit.brandStore}
                      <span style={{ color: "var(--purple)", display: "inline-block" }} title="Verified Brand Partner">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </span>
                    </h3>
                    <p style={{ fontSize: 10, color: "var(--muted)" }}>Brand Partner</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOutfit(null)}
                  style={{ background: "transparent", border: "none", color: "var(--text-soft)", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  ×
                </button>
              </div>

              {/* Scrollable details and comments */}
              <div className="post-detail-body">
                <p className="post-detail-desc">{selectedOutfit.description}</p>
                
                {/* Available On Store badging */}
                <div style={{ marginTop: 4 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 6, letterSpacing: "0.05em" }}>Available On</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {selectedOutfit.availableOn.map(store => (
                      <span key={store} className="brand-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--pink)" }}>
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                        {store}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Items Tagging */}
                <div style={{ marginTop: 4 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 6, letterSpacing: "0.05em" }}>Featured Garments</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {selectedOutfit.items.map(item => (
                      <span key={item} className="badge badge-muted" style={{ padding: "4px 10px", fontSize: 11 }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dynamic Comments List */}
                <h4 className="detail-comments-title">Comments ({selectedOutfit.comments.length})</h4>
                <div className="detail-comments-list">
                  {selectedOutfit.comments.map(c => (
                    <div key={c.id} className="comment-bubble">
                      <span className="comment-user">{c.user}</span>
                      <span className="comment-text">{c.text}</span>
                      <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 4 }}>{c.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action area and Comment form */}
              <div className="post-detail-footer">
                <div className="detail-action-bar">
                  <button
                    type="button"
                    className={`action-btn${selectedOutfit.isLikedByUser ? " liked" : ""}`}
                    onClick={() => handleLike(selectedOutfit.id)}
                    style={{ paddingLeft: 0 }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    {selectedOutfit.likes} Likes
                  </button>

                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => handleShare(selectedOutfit.title)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                    Copy Link
                  </button>

                  <Link href="/studio" className="btn btn-gradient btn-sm" style={{ marginLeft: "auto" }}>
                    Try On Fit
                  </Link>
                </div>

                {/* Comment submitting input form */}
                <form className="detail-comment-form" onSubmit={handleAddComment}>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="chat-input"
                    style={{ fontSize: 13, padding: "8px 12px" }}
                  />
                  <button
                    type="submit"
                    className="btn btn-gradient btn-sm"
                    disabled={!commentText.trim()}
                    style={{ padding: "8px 16px" }}
                  >
                    Post
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Copy link Success Toast Notification */}
      {copiedNotification && (
        <div className="toast-notification">
          <span className="toast-icon">🔗</span>
          <span className="toast-text">Outfit link copied to clipboard!</span>
        </div>
      )}
    </div>
  );
}
