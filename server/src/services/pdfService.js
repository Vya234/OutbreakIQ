import PDFDocument from 'pdfkit';

/**
 * Generate a PDF outbreak report buffer for download.
 */
export function generateOutbreakReport(outbreaks) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(22).fillColor('#1e40af').text('OutbreakIQ — Outbreak Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#64748b').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1.5);

    const totalCases = outbreaks.reduce((s, o) => s + o.cases, 0);
    doc.fontSize(12).fillColor('#0f172a').text(`Total outbreaks: ${outbreaks.length}  |  Total cases: ${totalCases}`);
    doc.moveDown(1);

    outbreaks.forEach((o, i) => {
      if (i > 0) doc.moveDown(0.5);
      doc.fontSize(14).fillColor('#1e3a8a').text(`${o.disease} — ${o.location}`);
      doc.fontSize(10).fillColor('#334155');
      doc.text(`Severity: ${o.severity.toUpperCase()}  |  Cases: ${o.cases}  |  Reported: ${new Date(o.reportedAt).toLocaleDateString()}`);
      doc.text(`Coordinates: ${o.latitude}, ${o.longitude}`);
      if (o.description) doc.text(o.description, { width: 500 });
      doc.moveDown(0.3);
      doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    });

    doc.end();
  });
}
