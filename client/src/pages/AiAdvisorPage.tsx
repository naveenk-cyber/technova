import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '@/lib/api';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  Check,
  Minus,
  AlertTriangle,
  Cpu,
  ImageOff,
  MoveHorizontal,
} from 'lucide-react';
import { Badge, Button, ErrorState, PriceDisplay, RatingStars } from '@/components/ui';

interface AdvisorProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  discount: number;
  stock: number;
  rating: number;
  reviewCount: number;
  image: string | null;
  category: { name: string; slug: string } | null;
}

interface AdvisorRecommendation {
  product: AdvisorProduct;
  reason: string;
  pros: string[];
  cons: string[];
}

interface AdvisorComparison {
  products: AdvisorProduct[];
  rows: { attribute: string; values: string[] }[];
}

interface AdvisorPayload {
  provider: 'gemini' | 'local';
  model: string | null;
  reply: string;
  recommendations: AdvisorRecommendation[];
  comparison: AdvisorComparison | null;
  followUpQuestions: string[];
  candidateCount: number;
  criteria: { budget: number | null; category: string | null; requirements: string[] };
  notice?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: AdvisorPayload;
}

const EXAMPLE_PROMPTS = [
  'Compare the MacBook Pro 16, Dell XPS 15 and Sony WH-1000XM5.',
  'Compare the laptops in your store.',
  'I am a college student with a budget of ₹65000. I need a laptop for Java, Python, Android Studio and occasional gaming.',
  'Which phone is best for photography under ₹30000?',
  'I need a laptop under ₹70000 with 16GB RAM suitable for programming.',
];

const formatPrice = (value: number) =>
  `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const isMissingValue = (value: string) => value === '—' || value.trim() === '';

function ProductThumb({ product }: { product: AdvisorProduct }) {
  const [failed, setFailed] = useState(false);
  if (!product.image || failed) {
    return (
      <div className="flex h-40 w-full items-center justify-center bg-muted text-muted-foreground/40">
        <ImageOff className="h-8 w-8" />
      </div>
    );
  }
  return (
    <img
      src={product.image}
      alt={product.name}
      className="h-40 w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function RecommendationCard({ recommendation }: { recommendation: AdvisorRecommendation }) {
  const { product, reason, pros, cons } = recommendation;
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <Link to={`/products/${product.slug}`} className="block">
        <ProductThumb product={product} />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{product.brand}</span>
          {product.stock === 0 ? (
            <Badge variant="secondary" size="sm">Out of stock</Badge>
          ) : product.stock <= 5 ? (
            <Badge variant="warning" size="sm">Only {product.stock} left</Badge>
          ) : (
            <Badge variant="success" size="sm">In stock</Badge>
          )}
        </div>
        <Link to={`/products/${product.slug}`} className="font-semibold text-foreground hover:text-primary">
          {product.name}
        </Link>
        <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="xs" />
        <PriceDisplay price={product.price} discount={product.discount} size="sm" />

        <div className="mt-1 rounded-xl bg-primary/5 p-3">
          <p className="text-xs leading-relaxed text-foreground">
            <span className="font-semibold text-primary">Why it fits: </span>
            {reason}
          </p>
        </div>

        {pros.length > 0 && (
          <ul className="space-y-1">
            {pros.map((item, index) => (
              <li key={index} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
        )}

        {cons.length > 0 && (
          <ul className="space-y-1">
            {cons.map((item, index) => (
              <li key={index} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Minus className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-destructive" />
                {item}
              </li>
            ))}
          </ul>
        )}

        <Link to={`/products/${product.slug}`} className="mt-auto pt-2 text-sm font-medium text-primary hover:underline">
          View product
        </Link>
      </div>
    </div>
  );
}

function ComparisonTable({ comparison }: { comparison: AdvisorComparison }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-border bg-muted/40 px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Side-by-side comparison</h3>
        <p className="text-xs text-muted-foreground">Every value below comes straight from the TECHNOVA catalog.</p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <caption className="sr-only">
            Comparison of {comparison.products.map((product) => product.name).join(', ')}
          </caption>
          <thead>
            <tr className="border-b border-border">
              <th
                scope="col"
                className="sticky left-0 z-10 w-36 border-r border-border bg-card px-4 py-3 text-left align-bottom text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Compare
              </th>
              {comparison.products.map((product) => (
                <th key={product.id} scope="col" className="min-w-[170px] px-4 py-3 align-top">
                  <Link to={`/products/${product.slug}`} className="font-semibold text-foreground hover:text-primary">
                    {product.name}
                  </Link>
                  <span className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{formatPrice(product.price)}</span>
                    {product.discount > 0 && (
                      <Badge variant="success" size="sm">
                        {product.discount}% off
                      </Badge>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.rows.map((row) => {
              const isBestFor = row.attribute === 'Best for';
              const isWatchOut = row.attribute === 'Watch out for';
              const isSummary = isBestFor || isWatchOut;
              const isPrice = row.attribute === 'Price';

              return (
                <tr key={row.attribute} className="border-t border-border">
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 border-r border-border bg-card px-4 py-3 text-left align-top text-xs font-medium uppercase tracking-wide ${
                      isBestFor ? 'text-success' : isWatchOut ? 'text-warning' : 'text-muted-foreground'
                    }`}
                  >
                    {row.attribute}
                  </th>
                  {row.values.map((value, index) => (
                    <td
                      key={index}
                      className={`px-4 py-3 align-top leading-relaxed ${
                        isSummary
                          ? 'text-foreground'
                          : isPrice
                            ? 'font-medium text-foreground'
                            : isMissingValue(value)
                              ? 'text-muted-foreground/40'
                              : 'text-muted-foreground'
                      } ${isBestFor ? 'bg-success/5' : isWatchOut ? 'bg-warning/5' : ''}`}
                    >
                      {isMissingValue(value) && !isSummary ? 'Not listed' : value}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="flex items-center gap-1.5 border-t border-border bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground lg:hidden">
        <MoveHorizontal className="h-3 w-3" />
        Scroll sideways to see every product.
      </footer>
    </section>
  );
}

function AssistantReply({ message, onFollowUp }: { message: ChatMessage; onFollowUp: (prompt: string) => void }) {
  const data = message.data;
  if (!data) {
    return (
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </div>
        <p className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm text-foreground">{message.content}</p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Bot className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {data.provider === 'gemini' ? (
            <Badge variant="primary" size="sm">
              <Sparkles className="h-3 w-3" /> AI-generated recommendation
            </Badge>
          ) : (
            <Badge variant="warning" size="sm">
              <AlertTriangle className="h-3 w-3" /> AI offline — catalog ranking
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            Based on {data.candidateCount} matching product{data.candidateCount === 1 ? '' : 's'} from the TECHNOVA catalog
          </span>
        </div>

        <p className="text-sm leading-relaxed text-foreground">{data.reply}</p>

        {data.notice && (
          <p className="flex items-start gap-2 rounded-xl bg-warning/10 px-3 py-2 text-xs text-warning">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            {data.notice}
          </p>
        )}

        {data.recommendations.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.recommendations.map((recommendation) => (
              <RecommendationCard key={recommendation.product.id} recommendation={recommendation} />
            ))}
          </div>
        )}

        {data.comparison && <ComparisonTable comparison={data.comparison} />}

        {data.followUpQuestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.followUpQuestions.map((question) => (
              <button
                key={question}
                onClick={() => onFollowUp(question)}
                className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                {question}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AiAdvisorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const lastRequest = useRef<{ message: string; history: { role: 'user' | 'assistant'; content: string }[] } | null>(null);
  const inFlight = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  const request = async (message: string, history: { role: 'user' | 'assistant'; content: string }[]) => {
    lastRequest.current = { message, history };
    inFlight.current = true;
    setLoading(true);
    setError('');

    try {
      const res = await fetchApi<AdvisorPayload>('/ai/advisor', {
        method: 'POST',
        body: JSON.stringify({ message, history }),
      });
      if (res.error) throw new Error(res.error);
      if (!res.data) throw new Error('The advisor returned an empty response');
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: res.data!.reply, data: res.data },
      ]);
    } catch (err: any) {
      setError(err.message || 'The advisor could not answer right now');
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  };

  const send = (text: string) => {
    const message = text.trim();
    // `inFlight` flips synchronously; the `loading` state would still read
    // false if two submits land in the same tick.
    if (!message || inFlight.current) return;
    const history = messages.slice(-4).map((entry) => ({
      role: entry.role,
      content: entry.role === 'assistant' ? entry.data?.reply ?? entry.content : entry.content,
    }));
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', content: message }]);
    setInput('');
    request(message, history);
  };

  const retry = () => {
    if (lastRequest.current && !inFlight.current) {
      request(lastRequest.current.message, lastRequest.current.history);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    send(input);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <Badge variant="primary">
          <Sparkles className="h-3.5 w-3.5" /> AI-powered
        </Badge>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">AI Tech Advisor</h1>
        <p className="max-w-2xl text-muted-foreground">
          Tell us your budget, what you need it for, and any must-haves — or ask to compare two or three products by
          name. The advisor searches the live TECHNOVA catalog and explains, in plain language, which products actually
          fit.
        </p>
      </header>

      <div className="mt-8 flex-1 space-y-8">
        {messages.length === 0 && !loading && !error && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-1 font-semibold text-foreground">Try one of these</h2>
            <p className="mb-4 text-sm text-muted-foreground">Click a question to ask the advisor.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => send(prompt)}
                  className="rounded-xl border border-border bg-background p-4 text-left text-sm text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  <Cpu className="mb-2 h-4 w-4 text-primary" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) =>
          message.role === 'user' ? (
            <div key={message.id} className="flex justify-end">
              <p className="max-w-2xl rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-primary-foreground">
                {message.content}
              </p>
            </div>
          ) : (
            <AssistantReply key={message.id} message={message} onFollowUp={send} />
          )
        )}

        {loading && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            Searching the TECHNOVA catalog and analyzing the matches…
          </div>
        )}

        {error && (
          <ErrorState title="The advisor could not answer" message={error} onRetry={retry} />
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="sticky bottom-4 mt-8 rounded-2xl border border-border bg-card p-3 shadow-lg">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                send(input);
              }
            }}
            rows={2}
            maxLength={500}
            placeholder="Ask about laptops, phones, accessories, budgets, or comparisons…"
            aria-label="Ask the AI Tech Advisor"
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <Button type="submit" loading={loading} disabled={!input.trim() || loading} leftIcon={<Send className="h-4 w-4" />}>
            Send
          </Button>
        </div>
        <p className="px-2 pt-1 text-[11px] text-muted-foreground">
          Press Enter to send, Shift+Enter for a new line. Recommendations are AI-generated from live catalog data — check
          the product page for final specifications.
        </p>
      </form>
    </div>
  );
}
