import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import Certificate from './components/Certificate';

const CERT_W = 1650;
const CERT_H = 1275;

/**
 * Ensure fonts and images referenced by the certificate are fully loaded
 * before capturing, so the rendered PDF matches the on-screen design.
 */
async function ensureAssetsLoaded() {
  try {
    await document.fonts.ready;
  } catch (e) {
    // Ignore font readiness failures; fall back to system fonts.
  }
  const imgs = Array.from(document.images);
  await Promise.all(imgs.map(img => (
    img.complete
      ? Promise.resolve()
      : new Promise(resolve => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        })
  )));
}

/**
 * Render a certificate element to a canvas at high resolution using the
 * browser's native rendering engine (SVG foreignObject), preserving the
 * full CSS design (logos, filters, fonts, layout).
 */
async function renderCertToCanvas(certElement) {
  await ensureAssetsLoaded();
  const dataUrl = await toPng(certElement, {
    width: CERT_W,
    height: CERT_H,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    style: {
      transform: 'none',
      transformOrigin: 'top left'
    }
  });

  const image = new Image();
  image.src = dataUrl;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error('No se pudo procesar la imagen del certificado.'));
  });

  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  canvas.getContext('2d').drawImage(image, 0, 0);
  return canvas;
}

/**
 * Convert a rendered canvas into a PDF blob.
 * Output: letter-size landscape (11"×8.5") at high DPI for direct printing.
 */
function canvasToPdfBlob(canvas) {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'letter'
  });

  const pageW = pdf.internal.pageSize.getWidth();   // 792
  const pageH = pdf.internal.pageSize.getHeight();  // 612

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH);

  return pdf.output('blob');
}

function safeFileName(name, fallback) {
  return String(name || fallback)
    .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s]/g, '')
    .replace(/\s+/g, '_') || fallback;
}

/**
 * Generate a single PDF for the currently displayed certificate.
 */
export async function generatePDF(certElement, studentName, translations) {
  const canvas = await renderCertToCanvas(certElement);
  const blob = canvasToPdfBlob(canvas);
  const safeName = safeFileName(studentName, translations.pdfPrefix);
  saveAs(blob, `${translations.pdfPrefix}_${safeName}.pdf`);
}

/**
 * Generate all PDFs for multiple students and download them as a single ZIP.
 * Each certificate is rendered with the same React component used in the
 * preview, so the design (logos included) is preserved in every file.
 */
export async function generateAllPDFs(students, directorName, translations) {
  const t = translations;
  const zip = new JSZip();

  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;top:-9999px;left:-9999px;z-index:-1;';
  document.body.appendChild(host);
  const root = createRoot(host);

  try {
    for (let i = 0; i < students.length; i++) {
      flushSync(() => root.render(
        React.createElement(Certificate, {
          t,
          student: students[i],
          directorName
        })
      ));

      const certEl = host.querySelector('#certificate');
      const canvas = await renderCertToCanvas(certEl);
      const blob = canvasToPdfBlob(canvas);

      const safeName = safeFileName(students[i].studentName, 'estudiante');
      const fileName = `${t.pdfPrefix}_${String(i + 1).padStart(3, '0')}_${safeName}.pdf`;
      zip.file(fileName, blob);
    }
  } finally {
    root.unmount();
    document.body.removeChild(host);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${t.pdfPrefix}s.zip`);
}
