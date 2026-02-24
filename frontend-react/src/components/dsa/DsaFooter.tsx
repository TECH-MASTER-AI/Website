import { Link } from "react-router-dom";
import { Code2, Github } from "lucide-react";

export function DsaFooter() {
  return (
    <footer className="border-t bg-muted/30 py-6 mt-auto">
      <div className="container px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link to="/dsa/problems" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <Code2 className="h-4 w-4" />
          DSA Practice
        </Link>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Back to TechMaster
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground"
          >
            <Github className="h-4 w-4" />
            Source
          </a>
        </div>
      </div>
    </footer>
  );
}
