import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { aiApi } from '@/services/api';
import { useOutbreaks } from '@/context/OutbreakContext';
import { cn } from '@/lib/utils';

const SUGGESTIONS = [
  'What are the symptoms of dengue?',
  'Which regions are high risk?',
  'How can malaria be prevented?',
  'Summarize the Nipah outbreak in Kerala',
];

export function AssistantPage() {
  const { outbreaks } = useOutbreaks();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hello! I am OutbreakIQ, powered by Gemma. Ask me about symptoms, high-risk regions, or prevention — I use current outbreak data to ground my answers.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [outbreakId, setOutbreakId] = useState('');
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setMessages((m) => [...m, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const res = await aiApi.chat(msg, outbreakId || undefined);
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: res.data.reply,
          provider: res.data.provider,
          fallback: res.data.fallback,
          contextCount: res.data.contextCount,
        },
      ]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', content: `Error: ${err.message}`, error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser.');
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">AI Chat Assistant</h1>
        <p className="text-muted-foreground">Gemma with outbreak-aware, summarized responses</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Context (optional)</CardTitle>
          <CardDescription>Focus answers on a specific outbreak record</CardDescription>
          <Select value={outbreakId || 'none'} onValueChange={(v) => setOutbreakId(v === 'none' ? '' : v)}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="All outbreaks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All outbreaks</SelectItem>
              {outbreaks.map((o) => (
                <SelectItem key={o._id} value={o._id}>
                  {o.disease} — {o.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                disabled={loading}
                className="rounded-full border bg-muted/50 px-3 py-1 text-xs hover:bg-muted disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mb-4 max-h-[50vh] space-y-4 overflow-y-auto rounded-lg border bg-muted/20 p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn('flex gap-3', m.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {m.role === 'assistant' && <Bot className="mt-1 h-5 w-5 shrink-0 text-primary" />}
                <div
                  className={cn(
                    'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : m.error
                        ? 'bg-red-100 text-red-900 dark:bg-red-950'
                        : 'bg-card border'
                  )}
                >
                  <p className="prose-ai whitespace-pre-wrap">{m.content}</p>
                  {m.role === 'assistant' && m.fallback && (
                    <Badge variant="outline" className="mt-2 gap-1 text-xs font-normal">
                      <Sparkles className="h-3 w-3" />
                      Grounded Response Mode
                    </Badge>
                  )}
                  {m.role === 'assistant' && m.contextCount != null && !m.error && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Based on {m.contextCount} relevant record{m.contextCount === 1 ? '' : 's'}
                    </p>
                  )}
                </div>
                {m.role === 'user' && <User className="mt-1 h-5 w-5 shrink-0" />}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing outbreak data…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2">
            <Textarea
              placeholder="Ask about symptoms, risks, or prevention…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              className="resize-none"
              disabled={loading}
            />
            <div className="flex flex-col gap-2">
              <Button size="icon" variant="outline" onClick={toggleVoice} aria-label="Voice input" disabled={loading}>
                {listening ? <MicOff className="h-4 w-4 text-health-high" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button size="icon" onClick={() => send()} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
