import { useColorScheme as useNativewindColorScheme } from "nativewind";

export function useColorScheme() {
  const { setColorScheme, toggleColorScheme } = useNativewindColorScheme();
  return {
    colorScheme: "light",
    isDarkColorScheme: "light",
    setColorScheme,
    toggleColorScheme,
  };
}
