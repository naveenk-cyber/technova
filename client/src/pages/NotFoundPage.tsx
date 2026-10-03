import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-8xl font-bold text-primary">404</h1>
      <p className="mt-4 text-xl text-muted-foreground">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="mt-8">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
