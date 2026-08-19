import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number, digits = 1) {
  return n.toLocaleString("id-ID", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

export function formatInt(n: number) {
  return Math.round(n).toLocaleString("id-ID");
}
