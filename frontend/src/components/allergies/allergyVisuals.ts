import { MaterialCommunityIcons } from "@expo/vector-icons";
import { THEME } from "../../theme/theme";

//Iconos por cada tipo de alergia
const ICON_MAP: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  gluten: "bread-slice-outline",
  crustaceans: "bug",
  molluscs: "snail",
  fish: "fish",
  eggs: "egg-outline",
  peanuts: "peanut-outline",
  nuts: "seed-outline",
  milk: "cup",
  soybeans: "sprout-outline",
  celery: "leaf",
  mustard: "bottle-tonic-outline",
  "sesame-seeds": "grain",
  lupin: "flower-outline",
  "sulphur-dioxide-and-sulphites": "flask-outline",
};

export function iconFor(key: string) {
  return ICON_MAP[key] ?? "alert-circle-outline";
}

export function tintFor(key: string) {
  return TINT_MAP[key] ?? { bg: THEME.mint, fg: THEME.primary };
}

//Colores suaves por iconKey
const TINT_MAP: Record<string, { bg: string; fg: string }> = {
  milk: { bg: "#E8F6EE", fg: "#22C55E" },
  nuts: { bg: "#FFF3E6", fg: "#F97316" },
  gluten: { bg: "#FFF7D6", fg: "#CA8A04" },
  crustaceans: { bg: "#E6F8FF", fg: "#06B6D4" },
  molluscs: { bg: "#E6F8FF", fg: "#06B6D4" },
  eggs: { bg: "#FFF3D6", fg: "#D97706" },
  fish: { bg: "#EAF2FF", fg: "#3B82F6" },
  peanuts: { bg: "#FFF3E6", fg: "#F97316" },
  soybeans: { bg: "#EAF7EF", fg: "#16A34A" },
  celery: { bg: "#EAF7EF", fg: "#16A34A" },
  mustard: { bg: "#FFF3D6", fg: "#D97706" },
  "sesame-seeds": { bg: "#FFF3D6", fg: "#D97706" },
  "sulphur-dioxide-and-sulphites": { bg: "#EEF2F6", fg: "#64748B" },
  lupin: { bg: "#F3ECFF", fg: "#7C3AED" },
};