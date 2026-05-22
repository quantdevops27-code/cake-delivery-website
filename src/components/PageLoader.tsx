import { Loader2 } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-[#6B3A3A] animate-spin" />
    </div>
  );
}
