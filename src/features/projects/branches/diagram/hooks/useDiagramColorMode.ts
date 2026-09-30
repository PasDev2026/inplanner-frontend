import { useTheme } from "next-themes"

export type DiagramColorMode = "light" | "dark"

export function useDiagramColorMode(): DiagramColorMode {
  const { resolvedTheme } = useTheme()
  return resolvedTheme === "dark" ? "dark" : "light"
}
