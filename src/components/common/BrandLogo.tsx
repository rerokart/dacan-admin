import Image from "next/image";

// Full Rerokart logo (R mark + wordmark). Black in light mode, white in dark mode.
// Source artwork is 1411 x 375; height follows the width.
export default function BrandLogo({
  width = 150,
  className = "",
  priority = false,
}: {
  width?: number;
  className?: string;
  priority?: boolean;
}) {
  const height = Math.round((width * 375) / 1411);
  return (
    <span className={`inline-block ${className}`}>
      <Image
        className="dark:hidden"
        src="/brand/logo-full-black.svg"
        alt="Rerokart"
        width={width}
        height={height}
        priority={priority}
      />
      <Image
        className="hidden dark:block"
        src="/brand/logo-full-white.svg"
        alt="Rerokart"
        width={width}
        height={height}
        priority={priority}
      />
    </span>
  );
}
