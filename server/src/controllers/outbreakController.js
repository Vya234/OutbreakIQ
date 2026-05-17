import { buildOutbreakFilter } from '../services/outbreakContextService.js';
import { generateOutbreakReport } from '../services/pdfService.js';
import { outbreakRepo } from '../services/outbreakRepository.js';

export async function listOutbreaks(req, res) {
  const filter = buildOutbreakFilter(req.query);
  const outbreaks = await outbreakRepo.find(filter, { reportedAt: -1 });
  res.json({ success: true, count: outbreaks.length, data: outbreaks });
}

export async function getOutbreak(req, res) {
  const outbreak = await outbreakRepo.findById(req.params.id);
  if (!outbreak) {
    const err = new Error('Outbreak not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: outbreak });
}

export async function createOutbreak(req, res) {
  const outbreak = await outbreakRepo.create({
    ...req.body,
    latitude: Number(req.body.latitude),
    longitude: Number(req.body.longitude),
    cases: Number(req.body.cases),
    reportedAt: new Date(req.body.reportedAt),
  });
  res.status(201).json({ success: true, data: outbreak });
}

export async function updateOutbreak(req, res) {
  const updates = { ...req.body };
  if (updates.latitude !== undefined) updates.latitude = Number(updates.latitude);
  if (updates.longitude !== undefined) updates.longitude = Number(updates.longitude);
  if (updates.cases !== undefined) updates.cases = Number(updates.cases);
  if (updates.reportedAt) updates.reportedAt = new Date(updates.reportedAt);

  const outbreak = await outbreakRepo.findByIdAndUpdate(req.params.id, updates);

  if (!outbreak) {
    const err = new Error('Outbreak not found');
    err.statusCode = 404;
    throw err;
  }

  res.json({ success: true, data: outbreak });
}

export async function deleteOutbreak(req, res) {
  const outbreak = await outbreakRepo.findByIdAndDelete(req.params.id);
  if (!outbreak) {
    const err = new Error('Outbreak not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, message: 'Outbreak deleted' });
}

export async function getStats(req, res) {
  const outbreaks = await outbreakRepo.find({});
  const totalCases = outbreaks.reduce((s, o) => s + o.cases, 0);
  const highRisk = [...new Set(outbreaks.filter((o) => o.severity === 'high').map((o) => o.location))];

  const diseaseCounts = {};
  outbreaks.forEach((o) => {
    diseaseCounts[o.disease] = (diseaseCounts[o.disease] || 0) + o.cases;
  });

  const mostCommon = Object.entries(diseaseCounts).sort((a, b) => b[1] - a[1])[0];

  const byDisease = Object.entries(diseaseCounts).map(([disease, cases]) => ({ disease, cases }));

  const byTime = {};
  outbreaks.forEach((o) => {
    const key = new Date(o.reportedAt).toISOString().slice(0, 7);
    byTime[key] = (byTime[key] || 0) + o.cases;
  });
  const timeline = Object.entries(byTime)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, cases]) => ({ month, cases }));

  const severityDist = { low: 0, medium: 0, high: 0 };
  outbreaks.forEach((o) => {
    severityDist[o.severity] = (severityDist[o.severity] || 0) + 1;
  });

  res.json({
    success: true,
    data: {
      totalOutbreaks: outbreaks.length,
      totalCases,
      highRiskRegions: highRisk.length,
      highRiskList: highRisk,
      mostCommonDisease: mostCommon ? mostCommon[0] : 'N/A',
      byDisease,
      timeline,
      severityDist,
    },
  });
}

export async function downloadReport(req, res) {
  const filter = buildOutbreakFilter(req.query);
  const outbreaks = await outbreakRepo.find(filter, { reportedAt: -1 });

  if (!outbreaks.length) {
    return res.status(404).json({ success: false, message: 'No outbreaks to export' });
  }

  const pdf = await generateOutbreakReport(outbreaks);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=outbreakiq-report.pdf');
  res.send(pdf);
}
