import GoogleLoginButton from "./GoogleLoginButton";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="min-h-dvh bg-zinc-50 font-sans">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 py-10">
        <p className="text-sm font-semibold tracking-widest text-zinc-500">
          STARGATE
        </p>
        <h1 className="mt-3 text-center text-2xl font-semibold text-zinc-900">
          Owner sign-in
        </h1>
        <p className="mt-1 text-center text-zinc-600">
          One click, secured by Google.
        </p>
        <div className="mt-6 w-full">
          <GoogleLoginButton />
        </div>
      </div>
    </main>
  );
}
