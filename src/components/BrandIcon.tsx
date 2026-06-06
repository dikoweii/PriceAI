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

const iconByProductId: Record<string, string> = {
  "gmail-account": "/brand-icons/gmail.svg",
  "google-phone-verification": "/brand-icons/googlegemini.svg",
  "paypal-phone-verification": "/brand-icons/paypal.svg",
  "openai-phone-verification": "/brand-icons/chatgpt.svg",
  "cursor-account": "/brand-icons/cursor.svg",
  "windsurf-account": "/brand-icons/windsurf.svg",
  "perplexity-account": "/brand-icons/perplexity.svg",
  "suno-account": "/brand-icons/suno.svg",
  "apple-id-account": "/brand-icons/apple.png",
};

export function BrandIcon({
  platform,
  productId,
  className = "h-[18px] w-[18px]",
}: {
  platform: string;
  productId?: string;
  className?: string;
}) {
  const src = productId ? iconByProductId[productId] || iconByPlatform[platform] : iconByPlatform[platform];

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
