import { Suspense } from "react";
import ResetPasswordForm from "../../components/volunteers/ResetPasswordForm";

export default function Page() {
  return (
    <Suspense fallback={<p>Chargement...</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
