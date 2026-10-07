import { useRouter } from "expo-router";

/** Leaves the auth flow for home, clearing the forms from history. */
export function useEnterApp() {
  const router = useRouter();
  return () => {
    if (router.canDismiss()) router.dismissAll();
    router.replace("/home");
  };
}
