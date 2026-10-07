import { AuthStub } from "@/components/auth/auth-stub";

export default function SignIn() {
  return <AuthStub title="Welcome back" switchLabel="New to roam? Create an account" switchHref="/sign-up" />;
}
