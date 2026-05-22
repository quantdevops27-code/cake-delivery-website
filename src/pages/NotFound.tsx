import { Link } from "react-router";
import { Home, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20">
      <div className="text-center">
        <SearchX className="h-16 w-16 text-[#6B3A3A]/20 mx-auto mb-4" />
        <h1 className="font-display text-4xl font-semibold text-[#6B3A3A] mb-2">
          404
        </h1>
        <p className="text-[#1A1A1A]/60 mb-6">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button
          asChild
          className="bg-[#6B3A3A] hover:bg-[#6B3A3A]/90 text-white rounded-full"
        >
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
