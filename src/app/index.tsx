import { Redirect } from "expo-router";

// Once Clerk lands, this chooses between onboarding and home from the session.
export default function Index() {
  return <Redirect href="/onboarding" />;
}
