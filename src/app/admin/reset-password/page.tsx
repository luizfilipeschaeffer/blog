import { Suspense } from "react";
import ResetPasswordPage from "./reset-password-client";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-screen max-w-sm items-center justify-center px-4 text-sm text-muted-foreground">
          Carregando…
        </div>
      }
    >
      <ResetPasswordPage />
    </Suspense>
  );
}
