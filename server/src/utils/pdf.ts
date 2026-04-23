import PDFDocument from 'pdfkit';

export function generateEmployeePdf(rows: Array<Record<string, unknown>>) {
  const doc = new PDFDocument({ margin: 32, size: 'A4' });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk) => chunks.push(chunk));

  doc.fontSize(18).text('Employee Directory Export');
  doc.moveDown();

  rows.forEach((row, index) => {
    doc.fontSize(11).text(`${index + 1}. ${row.fullName} | ${row.title} | ${row.department} | ${row.status}`);
    doc.text(`Email: ${row.email} | Location: ${row.location} | Performance: ${row.performanceScore}`);
    doc.moveDown(0.5);
  });

  doc.end();

  return new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}