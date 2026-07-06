export const PRIVACY_LEVEL_MAP: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  0: { label: "Público", variant: "default" },
  1: { label: "Solo mi área", variant: "secondary" },
  2: { label: "Solo mi sede", variant: "outline" },
  3: { label: "Solo mencionados", variant: "secondary" },
  4: { label: "Privado", variant: "destructive" },
};

export const PRIVACY_LEVEL_OPTIONS: { value: string; label: string }[] = [
  { value: "0", label: "Público" },
  { value: "1", label: "Solo mi área" },
  { value: "2", label: "Solo mi sede" },
  { value: "3", label: "Solo mencionados" },
  { value: "4", label: "Privado" },
];
