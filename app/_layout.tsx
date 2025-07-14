import { Stack, useRootNavigationState, useRouter } from "expo-router";
import React, { useEffect } from "react";

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const navigatorReady = rootNavigationState?.key != null;

  const isAuth = false;

  useEffect(() => {
    if (!navigatorReady) return;

    if (!isAuth) {
      console.log("Redirecting to /auth...");
      router.replace("/auth");
    }
  }, [navigatorReady, isAuth, router]);

  if (!navigatorReady) return null;

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
