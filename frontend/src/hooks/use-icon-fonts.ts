export function useIconFonts() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
    ...Ionicons.font,
  });

  return [loaded, error] as const; // Pulangkan sebagai array
}
