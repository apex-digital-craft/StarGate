export default function ShopNotFound() {
  return (
    <main className="min-h-dvh bg-zinc-50 font-sans">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 py-10 text-center">
        <p className="text-5xl font-bold text-zinc-300">?</p>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
          Shop not found
        </h1>
        <p className="mt-2 text-zinc-600">
          This QR link doesn&apos;t match any shop. Ask the staff for a fresh
          scan.
        </p>
      </div>
    </main>
  );
}
