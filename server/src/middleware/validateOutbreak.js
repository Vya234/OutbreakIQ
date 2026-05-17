import { SEVERITY } from '../models/Outbreak.js';

/**
 * Validate outbreak create/update payloads.
 */
export function validateOutbreakBody(req, _res, next) {
  const body = req.method === 'PUT' ? req.body : req.body;
  const errors = [];

  if (req.method === 'POST' || body.disease !== undefined) {
    if (!body.disease?.trim()) errors.push('disease is required');
  }
  if (req.method === 'POST' || body.location !== undefined) {
    if (!body.location?.trim()) errors.push('location is required');
  }
  if (req.method === 'POST' || body.latitude !== undefined) {
    const lat = Number(body.latitude);
    if (Number.isNaN(lat) || lat < -90 || lat > 90) errors.push('latitude must be between -90 and 90');
  }
  if (req.method === 'POST' || body.longitude !== undefined) {
    const lng = Number(body.longitude);
    if (Number.isNaN(lng) || lng < -180 || lng > 180) errors.push('longitude must be between -180 and 180');
  }
  if (req.method === 'POST' || body.cases !== undefined) {
    const cases = Number(body.cases);
    if (Number.isNaN(cases) || cases < 0) errors.push('cases must be a non-negative number');
  }
  if (req.method === 'POST' || body.severity !== undefined) {
    if (!SEVERITY.includes(String(body.severity).toLowerCase())) {
      errors.push(`severity must be one of: ${SEVERITY.join(', ')}`);
    }
  }
  if (req.method === 'POST' || body.reportedAt !== undefined) {
    const d = new Date(body.reportedAt);
    if (Number.isNaN(d.getTime())) errors.push('reportedAt must be a valid date');
  }

  if (errors.length) {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    err.errors = errors;
    return next(err);
  }

  if (body.severity) req.body.severity = String(body.severity).toLowerCase();
  next();
}
