import Link from "next/link";

export default function NotFoundStatePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-white">Code not found</h1>
      <p className="mt-3 max-w-sm text-white/60">
        Double-check the code on your invitation or scan the QR again.
      </p>
      <Link href="/join" className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black">
        Enter code manually
      </Link>
    </div>
  );
}
