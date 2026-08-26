import { useFonts } from 'expo-font';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

export function useIconFonts() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
    ...Ionicons.font,
  });

  return { loaded, error };
}
