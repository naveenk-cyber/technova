import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface InfoSection {
  heading: string;
  body: string;
}

export interface InfoPageContent {
  title: string;
  intro: string;
  sections: InfoSection[];
}

interface StaticPageProps {
  content: InfoPageContent;
  /** Rendered when the requested slug is not in the content map. */
  fallbackTitle?: string;
}

/**
 * Renders the support/company pages linked from the footer. Content lives in
 * one map so every footer link resolves to a real page instead of a 404.
 */
export function StaticPage({ content, fallbackTitle = 'Page not available' }: StaticPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{content.title}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{content.title}</h1>
        <p className="mt-2 text-muted-foreground">{content.intro}</p>
      </div>

      <div className="space-y-6">
        {content.sections.map((section) => (
          <section key={section.heading} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-2">{section.heading}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>

      {!content.sections.length && (
        <p className="text-sm text-muted-foreground">{fallbackTitle}</p>
      )}
    </div>
  );
}