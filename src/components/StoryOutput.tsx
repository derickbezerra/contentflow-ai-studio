import { Copy, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface StoryOutputProps {
  script: string;
}

const StoryOutput = ({ script }: StoryOutputProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    toast.success("Roteiro copiado!");
  };

  // Split on [pausa] to highlight pause markers
  const parts = script.split(/(\[pausa\])/gi);

  return (
    <div className="animate-fade-up space-y-4">
      <div className="rounded-xl bg-card p-6 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <Video className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Roteiro para Story</span>
          <span className="ml-auto text-xs text-muted-foreground">Leia olhando para a câmera</span>
        </div>

        <p className="text-base leading-8 text-foreground">
          {parts.map((part, i) =>
            /\[pausa\]/i.test(part) ? (
              <span
                key={i}
                className="mx-1 inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary"
              >
                pausa
              </span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </p>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="h-3.5 w-3.5" /> Copiar roteiro
        </Button>
      </div>
    </div>
  );
};

export default StoryOutput;
