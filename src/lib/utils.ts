import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export async function downloadImage(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  if (isMobile() && navigator.share) {
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (blob) {
        const file = new File([blob], filename, { type: "image/png" });
        const supported = !navigator.canShare || navigator.canShare({ files: [file] });
        if (supported) {
          await navigator.share({ files: [file] });
          return;
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      // qualquer outro erro → cai no download padrão
    }
  }
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
