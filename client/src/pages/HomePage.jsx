import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Map, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCards } from '@/components/outbreak/StatsCards';
import { OutbreakMap } from '@/components/outbreak/OutbreakMap';

export function HomePage() {
  return (
    <div className="space-y-10 animate-fade-in">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-accent/10 px-6 py-14 md:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">AI-Powered Public Health Intelligence</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            OutbreakIQ
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            AI-powered GIS disease outbreak assistant. Visualize hotspots, ask natural-language questions,
            and get Gemma-generated prevention guidance grounded in live outbreak data.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/map">
                Explore Map <Map className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/assistant">
                Ask AI <Brain className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <StatsCards />

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            icon: Map,
            title: 'Interactive Disease Map',
            desc: 'Color-coded Leaflet markers by severity across India with rich popups.',
          },
          {
            icon: Brain,
            title: 'Gemma AI Assistant',
            desc: 'Chat with outbreak context — symptoms, risk regions, and prevention steps.',
          },
          {
            icon: Shield,
            title: 'Prevention Insights',
            desc: 'Per-outbreak recommendations: symptoms, actions, and risk assessment.',
          },
        ].map(({ icon: Icon, title, desc }) => (
          <Card key={title}>
            <CardHeader>
              <Icon className="mb-2 h-8 w-8 text-primary" />
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Live Outbreak Preview</h2>
          <Button variant="ghost" asChild>
            <Link to="/dashboard">
              Full dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <OutbreakMap height="420px" />
      </section>
    </div>
  );
}
