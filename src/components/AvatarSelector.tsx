"use client";

import { useState } from "react";
import TacticalCharacter from "./TacticalCharacter";
import CharacterModel from "./CharacterModel";

export type AvatarType = "male" | "female";

export type AvatarBodyProfile = {
  age: number;
  heightCm: number;
  weightKg: number;
};

type AvatarSelectorProps = {
  selected: AvatarType;
  onSelect: (value: AvatarType) => void;
  bodyProfile: AvatarBodyProfile;
  onBodyProfileChange: (next: AvatarBodyProfile) => void;
};

const avatarCards: { type: AvatarType; title: string; description: string }[] = [
  {
    type: "male",
    title: "Male Operator",
    description: "Tactical build with armored street-style silhouette.",
  },
  {
    type: "female",
    title: "Female Operator",
    description: "Athletic battle-style profile with sharp modern outfit cuts.",
  },
];

export default function AvatarSelector({
  selected,
  onSelect,
  bodyProfile,
  onBodyProfileChange,
}: AvatarSelectorProps) {
  const [use3D, setUse3D] = useState(true);

  const setField = <K extends keyof AvatarBodyProfile>(key: K, value: AvatarBodyProfile[K]) => {
    onBodyProfileChange({ ...bodyProfile, [key]: value });
  };

  return (
    <section className="panel">
      <h2>Choose Character Base</h2>
      <p className="panel-subtitle">
        Select gender, then set age and body metrics so the generated avatar can match your build.
      </p>

      <div className="avatar-grid">
        {avatarCards.map((avatar) => {
          const active = avatar.type === selected;
          return (
            <button
              key={avatar.type}
              type="button"
              className={`avatar-card ${active ? "active" : ""}`}
              onClick={() => onSelect(avatar.type)}
            >
              <div className={`avatar-thumb avatar-thumb--character ${avatar.type}`}>
                {use3D ? (
                  <CharacterModel
                    url={avatar.type === "male" ? "/models/soldier.glb" : "/models/michelle.glb"}
                    mode="thumb"
                    onLoadError={() => setUse3D(false)}
                  />
                ) : (
                  <TacticalCharacter variant={avatar.type} className="avatar-character-svg" />
                )}
              </div>
              <div>
                <h3>{avatar.title}</h3>
                <p>{avatar.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="body-profile-grid">
        <label className="body-field">
          <span>Age (years)</span>
          <input
            type="number"
            min={13}
            max={99}
            inputMode="numeric"
            value={bodyProfile.age || ""}
            onChange={(e) =>
              setField("age", e.target.value === "" ? 0 : Number.parseInt(e.target.value, 10) || 0)
            }
          />
          <small>Shapes younger vs mature body proportions</small>
        </label>
        <label className="body-field">
          <span>Height (cm)</span>
          <input
            type="number"
            min={120}
            max={220}
            inputMode="decimal"
            value={bodyProfile.heightCm || ""}
            onChange={(e) =>
              setField(
                "heightCm",
                e.target.value === "" ? 0 : Number.parseFloat(e.target.value) || 0
              )
            }
          />
          <small>Affects limb length and silhouette</small>
        </label>
        <label className="body-field">
          <span>Weight (kg)</span>
          <input
            type="number"
            min={35}
            max={200}
            inputMode="decimal"
            step={0.1}
            value={bodyProfile.weightKg || ""}
            onChange={(e) =>
              setField(
                "weightKg",
                e.target.value === "" ? 0 : Number.parseFloat(e.target.value) || 0
              )
            }
          />
          <small>Influences body mass and stance feel</small>
        </label>
      </div>
    </section>
  );
}
