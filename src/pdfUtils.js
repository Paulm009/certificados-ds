import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import Certificate from './components/Certificate';
import OficioSheet from './components/OficioSheet';

const CERT_W = 1889;
const CERT_H = 1200;

const OFICIO_PAGE_W = 1200;
const OFICIO_PAGE_H = 1889;
const OFICIO_PDF_W = 215.9;
const OFICIO_PDF_H = 339.85;

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
 * Output: oficio-size landscape (340mm×216mm) at high DPI for direct printing.
 */
function canvasToPdfBlob(canvas) {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [339.85, 215.9]
  });

  const pageW = pdf.internal.pageSize.getWidth();   // 339.85 mm
  const pageH = pdf.internal.pageSize.getHeight();  // 215.9 mm

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
 * Render a full oficio sheet (2 certificates stacked) to a canvas at high
 * resolution, preserving the scaled certificate design (logos included).
 */
async function renderOficioToCanvas(pageElement) {
  await ensureAssetsLoaded();
  const dataUrl = await toPng(pageElement, {
    width: OFICIO_PAGE_W,
    height: OFICIO_PAGE_H,
    pixelRatio: 2,
    backgroundColor: '#ffffff'
  });

  const image = new Image();
  image.src = dataUrl;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error('No se pudo procesar la imagen de la hoja oficio.'));
  });

  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  canvas.getContext('2d').drawImage(image, 0, 0);
  return canvas;
}

/**
 * Convert a rendered oficio canvas into a PDF blob.
 * Output: oficio size portrait (215.9mm × 339.85mm) for direct printing.
 */
function oficioCanvasToPdfBlob(canvas) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [OFICIO_PDF_W, OFICIO_PDF_H]
  });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH);
  return pdf.output('blob');
}

function createHost() {
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;top:-9999px;left:-9999px;z-index:-1;';
  document.body.appendChild(host);
  return host;
}

/**
 * Generate a single oficio PDF containing 2 certificates (top and bottom),
 * using the same React components as the preview so the design is preserved.
 */
export async function generateOficioPDF(pair, directorName, translations) {
  const t = translations;
  const host = createHost();
  const root = createRoot(host);

  try {
    flushSync(() => root.render(
      React.createElement(OficioSheet, { t, students: pair, directorName })
    ));
    const pageEl = host.querySelector('.oficio-page');
    const canvas = await renderOficioToCanvas(pageEl);
    const blob = oficioCanvasToPdfBlob(canvas);

    const name1 = safeFileName(pair?.[0]?.studentName, 'estudiante');
    const name2 = safeFileName(pair?.[1]?.studentName, 'estudiante');
    saveAs(blob, `${t.pdfPrefix}_oficio_${name1}_${name2}.pdf`);
  } finally {
    root.unmount();
    document.body.removeChild(host);
  }
}

/**
 * Generate a single PDF with all certificates grouped 2 per oficio page
 * (students are paired in order: 1&2, 3&4, ...). An odd last student gets
 * its own page. Used by the Excel bulk upload flow.
 */
export async function generateAllOficioPDFs(students, directorName, translations) {
  const t = translations;
  const host = createHost();
  const root = createRoot(host);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [OFICIO_PDF_W, OFICIO_PDF_H]
  });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  try {
    for (let i = 0; i < students.length; i += 2) {
      const pair = [students[i], students[i + 1]];
      flushSync(() => root.render(
        React.createElement(OficioSheet, { t, students: pair, directorName })
      ));

      const pageEl = host.querySelector('.oficio-page');
      const canvas = await renderOficioToCanvas(pageEl);
      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH);
    }
  } finally {
    root.unmount();
    document.body.removeChild(host);
  }

  const blob = pdf.output('blob');
  saveAs(blob, `${t.pdfPrefix}s_2por_hoja.pdf`);
}
