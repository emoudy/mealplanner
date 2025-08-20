// Date formatting utilities
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  
  return dateObj.toLocaleDateString("en-US", { ...defaultOptions, ...options });
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(dateObj);
}

// Number formatting utilities
export function formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
  return num.toLocaleString("en-US", options);
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return formatNumber(amount / 100, {
    style: "currency",
    currency,
  });
}

export function formatPercentage(value: number, decimals = 0): string {
  return formatNumber(value, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Time formatting utilities
export function formatCookTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

export function formatServings(servings: number): string {
  return servings === 1 ? "1 serving" : `${servings} servings`;
}

// Text formatting utilities
export function truncateText(text: string, maxLength: number, suffix = "..."): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function titleCase(text: string): string {
  return text
    .split(" ")
    .map(word => capitalizeFirst(word))
    .join(" ");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Recipe formatting utilities
export function formatIngredientList(ingredients: string[]): string {
  return ingredients.map(ingredient => `• ${ingredient}`).join("\n");
}

export function formatInstructionList(instructions: string[]): string {
  return instructions
    .map((instruction, index) => `${index + 1}. ${instruction}`)
    .join("\n");
}

// File size formatting
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

// URL formatting
export function ensureHttps(url: string): string {
  if (!url) return url;
  if (url.startsWith("http://")) return url.replace("http://", "https://");
  if (!url.startsWith("https://")) return `https://${url}`;
  return url;
}