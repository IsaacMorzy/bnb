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
import { authErrorMessage, signUp } from "@/lib/auth/mock";
import { firstError, validateSignUp, type FieldErrors } from "@/lib/auth/validate";

type Field = "name" | "email" | "password";

export default function SignUp() {
  const router = useRouter();
  const enterApp = useEnterApp();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", password: "" });
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
    const found = validateSignUp(values);
    setErrors(found);
    setAuthError(undefined);
    if (firstError(found)) return;

    setSubmitting(true);
    try {
      const email = values.email.trim();
      await signUp({ ...values, name: values.name.trim(), email });
      router.push({ pathname: "/verify", params: { email } });
    } catch (e) {
      setAuthError(authErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreen
      title={"Create\nyour account"}
      body="Join roam to save your stays, get personalized recommendations and access them across all your devices."
      footer={
        <AuthFooter
          prompt="Already have an account?"
          action="Sign in"
          disabled={busy}
          onPress={() => router.replace("/sign-in")}
        />
      }
    >
      <TextField
        icon="person"
        label="Full name"
        placeholder="e.g. Adrian Hajdin"
        value={values.name}
        onChangeText={edit("name")}
        invalid={!!errors.name}
        editable={!busy}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => emailRef.current?.focus()}
      />
      <TextField
        ref={emailRef}
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
        className="mt-3.5"
      />
      <TextField
        ref={passwordRef}
        icon="lock"
        label="Password"
        placeholder="At least 8 characters"
        secure
        value={values.password}
        onChangeText={edit("password")}
        invalid={!!errors.password}
        editable={!busy}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
        className="mt-3.5"
      />
      <FormError message={authError ?? firstError(errors)} />
      <Button title="Create account" trailingIcon="arrowRight" loading={submitting} disabled={socialBusy} onPress={submit} className="mt-6" />
      <OrDivider />
      <SocialButtons disabled={submitting} onBusyChange={setSocialBusy} onSuccess={enterApp} onError={setAuthError} />
    </AuthScreen>
  );
}
