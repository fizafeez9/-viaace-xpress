import { Stack } from "expo-router";
import { RiderProvider } from "@/src/context/RiderContext";

export default function RiderLayout() {
  return (
    <RiderProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </RiderProvider>
  );
}
