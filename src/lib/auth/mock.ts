// Stand-in for Clerk until it's set up. Each function mirrors a step of Clerk's
// email-code flow, so the screens keep working when these are swapped out.
// Test values: code 424242 verifies, taken@example.com is already registered,
// and the password "wrong-password" fails sign-in.

export class AuthError extends Error {}

export type Provider = "google" | "apple";

const delay = () => new Promise((resolve) => setTimeout(resolve, 800));

export async function signUp({ email }: { name: string; email: string; password: string }) {
  await delay();
  if (email.trim().toLowerCase() === "taken@example.com") throw new AuthError("That email is already in use.");
}

export async function verifyEmail({ code }: { email: string; code: string }) {
  await delay();
  if (code !== "424242") throw new AuthError("That code isn't right. Check your email and try again.");
}

export async function resendCode(_: { email: string }) {
  await delay();
}

export async function signIn({ password }: { email: string; password: string }) {
  await delay();
  if (password === "wrong-password") throw new AuthError("Email or password is incorrect.");
}

export async function signInWithProvider(_: Provider) {
  await delay();
}

/** The message to show a guest for any thrown value. */
export function authErrorMessage(error: unknown) {
  return error instanceof AuthError ? error.message : "Something went wrong. Please try again.";
}
