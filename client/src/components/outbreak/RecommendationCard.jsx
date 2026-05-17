import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { aiApi } from '@/services/api';
import { formatDate, severityLabel } from '@/lib/utils';

export function RecommendationCard({ outbreak }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.recommendations({ outbreakId: outbreak._id });
      setText(res.data.recommendations);
      setProvider(res.data.provider);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{outbreak.disease}</CardTitle>
            <CardDescription>{outbreak.location}</CardDescription>
          </div>
          <Badge variant={outbreak.severity}>{severityLabel(outbreak.severity)}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {outbreak.cases.toLocaleString()} cases · {formatDate(outbreak.reportedAt)}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {outbreak.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{outbreak.description}</p>
        )}
        <Button size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate AI Recommendations
        </Button>
        {error && <p className="text-sm text-health-high">{error}</p>}
        {text && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="prose-ai text-sm">{text}</p>
            {provider && (
              <p className="mt-2 text-xs text-muted-foreground">Powered by: {provider}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
