import React from "react";

export function getIconByName(name: string): string {
  const n = name.toLowerCase();

  if (n.includes("temple")) return "temple";
  if (n.includes("monastery") || n.includes("gumba") || n.includes("mahavihar")) return "monastery";
  if (n.includes("stupa")) return "stupa";
  if (n.includes("museum")) return "museum";
  if (n.includes("park") || n.includes("garden") || n.includes("hill") || n.includes("zoo")) return "nature";
  if (n.includes("square") || n.includes("bazaar") || n.includes("market") || n.includes("road")) return "market";
  if (n.includes("pond") || n.includes("pokhari") || n.includes("lake")) return "pond";

  return "default";
}

export function getIconUrlByName(name: string): string {
  const iconName = getIconByName(name);
  return `/${iconName}.svg`;
}

interface PlaceIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeName: string;
  alt?: string;
  width?: number;
  height?: number;
}

export function PlaceIcon({ placeName, alt, width = 40, height = 40, ...props }: PlaceIconProps) {
  const iconUrl = getIconUrlByName(placeName);
  return <img src={iconUrl} alt={alt ?? placeName} width={width} height={height} {...props} />;
}
