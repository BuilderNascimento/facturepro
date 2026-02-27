import type { InvoicePdfData } from './invoice-template';
import { getInvoiceHtml } from './invoice-template';

export async function generateInvoicePdfBuffer(data: InvoicePdfData): Promise<Buffer> {
  const html = getInvoiceHtml(data);

  if (process.env.VERCEL) {
    const chromium = await import('@sparticuz/chromium');
    const puppeteer = await import('puppeteer-core');
    const browser = await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: chromium.default.defaultViewport,
      executablePath: await chromium.default.executablePath(),
      headless: true,
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
        printBackground: true,
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  try {
    const puppeteer = await import('puppeteer-core');
    const browser = await puppeteer.default.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
        printBackground: true,
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    throw new Error('Échec de la génération PDF: ' + err.message);
  }
}
