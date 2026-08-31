export type Structure = "STACK" | "QUEUE";

export type Task = {
  id: string;
  text: string;
  createdAt: string;
  structure: Structure;
  position: number;
};

export function formatTimestamp(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
