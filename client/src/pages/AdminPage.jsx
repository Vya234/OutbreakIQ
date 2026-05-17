import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { outbreakApi } from '@/services/api';
import { useOutbreaks } from '@/context/OutbreakContext';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { formatDate, severityLabel } from '@/lib/utils';

const emptyForm = {
  disease: '',
  location: '',
  latitude: '',
  longitude: '',
  cases: '',
  severity: 'medium',
  reportedAt: new Date().toISOString().slice(0, 10),
  description: '',
};

export function AdminPage() {
  const { outbreaks, loading, error, refresh } = useOutbreaks();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const startEdit = (o) => {
    setEditingId(o._id);
    setForm({
      disease: o.disease,
      location: o.location,
      latitude: String(o.latitude),
      longitude: String(o.longitude),
      cases: String(o.cases),
      severity: o.severity,
      reportedAt: new Date(o.reportedAt).toISOString().slice(0, 10),
      description: o.description || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    const payload = {
      ...form,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      cases: Number(form.cases),
      reportedAt: new Date(form.reportedAt).toISOString(),
    };

    try {
      if (editingId) {
        await outbreakApi.update(editingId, payload);
      } else {
        await outbreakApi.create(payload);
      }
      reset();
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this outbreak record?')) return;
    try {
      await outbreakApi.remove(id);
      if (editingId === id) reset();
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Admin — Data Management</h1>
        <p className="text-muted-foreground">Add, edit, or delete outbreak records</p>
      </div>

      <ErrorAlert message={error} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editingId ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {editingId ? 'Edit Outbreak' : 'Add Outbreak'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Disease *</Label>
              <Input value={form.disease} onChange={(e) => set('disease', e.target.value)} required />
            </div>
            <div>
              <Label>Location *</Label>
              <Input value={form.location} onChange={(e) => set('location', e.target.value)} required />
            </div>
            <div>
              <Label>Latitude *</Label>
              <Input type="number" step="any" value={form.latitude} onChange={(e) => set('latitude', e.target.value)} required />
            </div>
            <div>
              <Label>Longitude *</Label>
              <Input type="number" step="any" value={form.longitude} onChange={(e) => set('longitude', e.target.value)} required />
            </div>
            <div>
              <Label>Cases *</Label>
              <Input type="number" min="0" value={form.cases} onChange={(e) => set('cases', e.target.value)} required />
            </div>
            <div>
              <Label>Severity *</Label>
              <Select value={form.severity} onValueChange={(v) => set('severity', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Report date *</Label>
              <Input type="date" value={form.reportedAt} onChange={(e) => set('reportedAt', e.target.value)} required />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} />
            </div>
            {formError && <p className="text-sm text-health-high sm:col-span-2">{formError}</p>}
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={submitting}>
                {editingId ? 'Update' : 'Create'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={reset}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Records ({outbreaks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !outbreaks.length ? (
            <EmptyState title="No outbreaks" message="Add your first record above." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Disease</th>
                    <th className="pb-2 pr-4">Location</th>
                    <th className="pb-2 pr-4">Cases</th>
                    <th className="pb-2 pr-4">Severity</th>
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {outbreaks.map((o) => (
                    <tr key={o._id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{o.disease}</td>
                      <td className="py-3 pr-4">{o.location}</td>
                      <td className="py-3 pr-4">{o.cases.toLocaleString()}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={o.severity}>{severityLabel(o.severity)}</Badge>
                      </td>
                      <td className="py-3 pr-4">{formatDate(o.reportedAt)}</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => startEdit(o)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => remove(o._id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
