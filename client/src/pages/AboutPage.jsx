import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">About OutbreakIQ</h1>
        <p className="mt-2 text-muted-foreground">
          Built for the <strong>Gemma 4 Good Hackathon</strong> to demonstrate responsible AI in public health.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mission</CardTitle>
          <CardDescription>Real-world impact in disease surveillance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            OutbreakIQ combines geospatial visualization with Gemma 4 language intelligence so health workers,
            researchers, and citizens can understand outbreak patterns faster and act with clearer prevention guidance.
          </p>
          <p>
            Every AI response is grounded in structured outbreak records from MongoDB — reducing hallucinations
            and surfacing uncertainty when data is incomplete.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tech Stack</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {['React', 'Vite', 'Tailwind', 'shadcn/ui', 'Leaflet', 'Recharts', 'Express', 'MongoDB', 'Gemma 4'].map(
            (t) => (
              <Badge key={t} variant="outline">
                {t}
              </Badge>
            )
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hackathon Justification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Social good:</strong> Supports faster awareness of dengue, malaria, cholera, Nipah, and COVID hotspots in India.
            </li>
            <li>
              <strong>Gemma at the core:</strong> Chat and prevention endpoints call Gemma via Ollama or Google AI Studio with outbreak context.
            </li>
            <li>
              <strong>Responsible AI:</strong> Prompts instruct the model to cite data limits and avoid inventing case counts.
            </li>
            <li>
              <strong>Production path:</strong> Monorepo deployable to Vercel (client) and Render (server) with environment-based configuration.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Sample data is illustrative for demonstration. Always consult official public health authorities
          (WHO, ICMR, state health departments) for medical decisions and outbreak response.
        </CardContent>
      </Card>
    </div>
  );
}
