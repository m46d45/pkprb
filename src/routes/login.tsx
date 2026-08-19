import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-6">
      <div className="w-full max-w-sm space-y-5 rounded-xl border border-line bg-surface p-6">
        <div>
          <p className="font-display text-2xl">PKPRB</p>
          <p className="mt-1 text-sm text-muted">
            Masuk untuk menyimpan sesi kerja. Peta tetap dapat dipakai tanpa
            akun.
          </p>
        </div>
        {authEnabled ? (
          GROK_PROVIDERS.map((p) => (
            <Button
              key={p.providerId}
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => signIn(p.providerId, { callbackURL: "/" })}
            >
              Lanjut dengan {p.label}
            </Button>
          ))
        ) : (
          <p className="text-sm text-muted">Masuk dinonaktifkan.</p>
        )}
        <Link to="/" className="block text-center text-sm text-muted hover:text-ink">
          Kembali ke peta
        </Link>
      </div>
    </main>
  );
}
