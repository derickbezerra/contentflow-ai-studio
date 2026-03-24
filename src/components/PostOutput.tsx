import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PostOutputProps {
  hook: string;
  body: string;
  cta: string;
  handle?: string;
}

const PostOutput = ({ hook, body, cta, handle }: PostOutputProps) => {
  const fullText = `${hook}\n\n${body}\n\n${cta}`;

  const copyAll = () => {
    navigator.clipboard.writeText(fullText);
    toast.success("Post copiado!");
  };

  return (
    <div className="animate-fade-up space-y-4">
      {/* Instagram post card */}
      <div className="overflow-hidden rounded-2xl shadow-card">

        {/* Image area — gradient with punchline */}
        <div className="relative flex min-h-[220px] items-center justify-center bg-gradient-to-br from-[#1a2e23] to-[#3d6b52] px-8 py-10">
          {/* Decorative texture */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
          />
          <p className="relative text-center text-xl font-bold leading-tight text-white drop-shadow-sm">
            {hook}
          </p>
          {handle && (
            <p className="absolute bottom-3 right-4 text-[11px] font-medium text-white/40">@{handle}</p>
          )}
        </div>

        {/* Caption area */}
        <div className="bg-card px-5 py-4">
          <p className="text-sm leading-relaxed text-foreground">{body}</p>
          <p className="mt-3 text-sm font-semibold text-primary">{cta}</p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={copyAll}>
          <Copy className="h-3.5 w-3.5" /> Copiar post
        </Button>
      </div>
    </div>
  );
};

export default PostOutput;
