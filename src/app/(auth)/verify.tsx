import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { AuthFooter } from "@/components/auth/auth-footer";
import { AuthScreen } from "@/components/auth/auth-screen";
import { CodeInput } from "@/components/auth/code-input";
import { FormError } from "@/components/auth/form-error";
import { useEnterApp } from "@/components/auth/use-enter-app";
import { Alert, Button } from "@/components/ui";
import { authErrorMessage, resendCode, verifyEmail } from "@/lib/auth/mock";
import { validateCode } from "@/lib/auth/validate";

const RESEND_SECONDS = 30;

export default function Verify() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const enterApp = useEnterApp();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [wait, setWait] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  if (!email) return <Redirect href="/sign-up" />;

  const submit = async (value = code) => {
    const found = validateCode(value).code;
    setError(found);
    setResent(false);
    if (found) return;

    setSubmitting(true);
    try {
      await verifyEmail({ email, code: value });
      enterApp();
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const onChange = (next: string) => {
    setCode(next);
    setError(undefined);
    if (next.length === 6) submit(next);
  };

  const resend = async () => {
    setResending(true);
    setError(undefined);
    try {
      await resendCode({ email });
      setResent(true);
      setWait(RESEND_SECONDS);
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthScreen
      title={"Check your\nemail"}
      body={`We sent a 6-digit code to ${email}. Enter it below to finish creating your account.`}
      footer={
        <AuthFooter
          prompt="Didn't get a code?"
          action={wait > 0 ? `Resend in 0:${String(wait).padStart(2, "0")}` : "Resend"}
          disabled={wait > 0 || resending || submitting}
          onPress={resend}
        />
      }
    >
      <CodeInput value={code} onChange={onChange} invalid={!!error} editable={!submitting} />
      {resent && !error && <Alert tone="success" message={`We sent a new code to ${email}.`} className="mt-6" />}
      <FormError message={error} />
      <Button title="Verify" trailingIcon="arrowRight" loading={submitting} onPress={() => submit()} className="mt-6" />
    </AuthScreen>
  );
}
