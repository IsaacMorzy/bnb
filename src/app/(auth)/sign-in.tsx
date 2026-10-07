import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { type TextInput } from "react-native";

import { AuthFooter } from "@/components/auth/auth-footer";
import { AuthScreen } from "@/components/auth/auth-screen";
import { FormError } from "@/components/auth/form-error";
import { OrDivider } from "@/components/auth/or-divider";
import { SocialButtons } from "@/components/auth/social-buttons";
import { useEnterApp } from "@/components/auth/use-enter-app";
import { Button, TextField } from "@/components/ui";
import { authErrorMessage, signIn } from "@/lib/auth/mock";
import { firstError, validateSignIn, type FieldErrors } from "@/lib/auth/validate";

type Field = "email" | "password";

export default function SignIn() {
  const router = useRouter();
  const enterApp = useEnterApp();
  const passwordRef = useRef<TextInput>(null);

  const [values, setValues] = useState<Record<Field, string>>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const [authError, setAuthError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [socialBusy, setSocialBusy] = useState(false);
  const busy = submitting || socialBusy;

  const edit = (field: Field) => (text: string) => {
    setValues((v) => ({ ...v, [field]: text }));
    setErrors((e) => ({ ...e, [field]: undefined }));
    setAuthError(undefined);
  };

  const submit = async () => {
    const found = validateSignIn(values);
    setErrors(found);
    setAuthError(undefined);
    if (firstError(found)) return;

    setSubmitting(true);
    try {
      await signIn({ email: values.email.trim(), password: values.password });
      enterApp();
    } catch (e) {
      setAuthError(authErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreen
      title={"Welcome\nback"}
      body="Sign in to see your saved stays and pick up where you left off."
      footer={
        <AuthFooter
          prompt="New to roam?"
          action="Create an account"
          disabled={busy}
          onPress={() => router.replace("/sign-up")}
        />
      }
    >
      <TextField
        icon="mail"
        label="Email address"
        placeholder="you@example.com"
        value={values.email}
        onChangeText={edit("email")}
        invalid={!!errors.email}
        editable={!busy}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        ref={passwordRef}
        icon="lock"
        label="Password"
        placeholder="Your password"
        secure
        value={values.password}
        onChangeText={edit("password")}
        invalid={!!errors.password}
        editable={!busy}
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
        className="mt-3.5"
      />
      <FormError message={authError ?? firstError(errors)} />
      <Button title="Sign in" trailingIcon="arrowRight" loading={submitting} disabled={socialBusy} onPress={submit} className="mt-6" />
      <OrDivider />
      <SocialButtons disabled={submitting} onBusyChange={setSocialBusy} onSuccess={enterApp} onError={setAuthError} />
    </AuthScreen>
  );
}
