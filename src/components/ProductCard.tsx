"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface ProductItem {
  id: string | number;
  title: string;
  price?: number;
  description?: string;
  category?: string;
  image: string;
  rating?: {
    rate: number;
    count: number;
  };
  brand?: string;
  link?: string;
  store?: string;
}

interface ProductCardProps {
  product: ProductItem;
  onTryOn?: (product: ProductItem) => void;
  onAddToWardrobe?: (product: ProductItem) => void;
}

export default function ProductCard({
  product,
  onTryOn,
  onAddToWardrobe,
}: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { id, title, price, description = "", category, image, rating, brand, link, store } = product;

  const formattedPrice = price
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(price * (price < 100 ? 83 : 1))
    : null;

  const MAX_CHARACTERS = 90;
  const shouldTruncate = description.length > MAX_CHARACTERS;
  const displayedDescription = isExpanded
    ? description
    : shouldTruncate
    ? `${description.slice(0, MAX_CHARACTERS)}...`
    : description;

  return (
    <article className="ss-product-card">
      <div className="ss-product-image-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={title}
          className="ss-product-image"
          loading="lazy"
        />
        {category && (
          <span className="ss-product-badge">
            {category}
          </span>
        )}
        {store && (
          <span className="ss-product-store-badge">
            {store}
          </span>
        )}
      </div>

      <div className="ss-product-body">
        <div>
          {rating && (
            <div className="ss-product-rating">
              <div className="ss-product-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`ss-star ${i < Math.round(rating.rate) ? "active" : ""}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="ss-product-rating-count">({rating.count})</span>
            </div>
          )}

          {brand && <div className="ss-product-brand">{brand}</div>}

          <h3 className="ss-product-title" title={title}>
            {title}
          </h3>

          {description && (
            <p className="ss-product-desc">
              {displayedDescription}
              {shouldTruncate && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="ss-product-readmore"
                >
                  {isExpanded ? " Less" : " More"}
                </button>
              )}
            </p>
          )}
        </div>

        <div className="ss-product-footer">
          {formattedPrice && (
            <div className="ss-product-price">
              {formattedPrice}
            </div>
          )}

          <div className="ss-product-actions">
            {onTryOn && (
              <button
                type="button"
                onClick={() => onTryOn(product)}
                className="ss-btn-primary"
              >
                Try On
              </button>
            )}
            {onAddToWardrobe && (
              <button
                type="button"
                onClick={() => onAddToWardrobe(product)}
                className="ss-btn-secondary"
                title="Save to Wardrobe"
              >
                +
              </button>
            )}
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="ss-btn-link"
              >
                View ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
