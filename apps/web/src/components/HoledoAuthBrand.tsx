import Image from "next/image";
import Link from "next/link";

export function HoledoAuthBrand() {
  return (
    <Link href="/" className="mb-7 flex items-center gap-3">
      <span className="flex h-11 w-14 items-center rounded bg-[#384677] px-2">
        <Image
          src="/assets/branding/holedo-icon.png"
          alt="Holedo"
          width={52}
          height={32}
          className="h-auto w-full"
          priority
        />
      </span>
      <span className="text-2xl font-bold text-[#272e41] dark:text-white">
        Tasks
      </span>
    </Link>
  );
}
