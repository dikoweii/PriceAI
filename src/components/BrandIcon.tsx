import { Layers3 } from "lucide-react";
import Image from "next/image";

const iconByPlatform: Record<string, string> = {
  ChatGPT: "/brand-icons/chatgpt.svg",
  Claude: "/brand-icons/claude.svg",
  Gemini: "/brand-icons/gemini.svg",
  Grok: "/brand-icons/grok.svg",
  Google: "/brand-icons/google.svg",
  "API/CDK": "/brand-icons/chatgpt.svg",
  邮箱: "/brand-icons/gmail.svg",
};

export function BrandIcon({
  platform,
  className = "h-[18px] w-[18px]",
}: {
  platform: string;
  className?: string;
}) {
  const src = iconByPlatform[platform];

  if (src) {
    return (
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        width={24}
        height={24}
        className={`${className} shrink-0 object-contain`}
      />
    );
  }

  return <Layers3 className={`${className} shrink-0 text-[#5a6061]`} />;
}
