const TIME_ZONE = "Asia/Kolkata";

export function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: TIME_ZONE,
  });
}

export function formatDateTime(date: Date | null | undefined): string {
  if (!date) return "";
  const time = new Date(date).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  });
  return `${formatDate(date)} - ${time}`;
}

export function formatToday(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: TIME_ZONE,
  });
}

export function parsePage(value: string | string[] | undefined): number {
  const page = parseInt(Array.isArray(value) ? value[0] : value || "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}
