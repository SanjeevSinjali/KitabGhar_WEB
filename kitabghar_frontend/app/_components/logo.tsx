import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <Image
        src="/kitabghar_logo.png"
        alt="KitabGhar logo"
        width={52}
        height={52}
        className="rounded-xl object-contain"
      />
      <div>
        <h1 className="text-lg font-bold text-slate-900">KitabGhar</h1>
        <p className="text-xs text-slate-500">Buy and sell unwanted books</p>
      </div>
    </Link>
  );
}