import React from 'react';
import Certificate from './Certificate';

const PAGE_W = 1200;
const PAGE_H = 1889;
const CERT_DESIGN_W = 1525;
const CERT_DESIGN_H = 1200;
const SLOT_H = PAGE_H / 2;
const SCALE = SLOT_H / CERT_DESIGN_H;
const SLOT_W = CERT_DESIGN_W * SCALE;

export default function OficioSheet({ t, students, directorName }) {
  const list = students || [];
  const slots = [0, 1].map(i => list[i]);

  return (
    <div className="oficio-page">
      {slots.map((st, i) => (
        <div
          key={i}
          className="oficio-cert-slot"
          style={{ width: Math.round(SLOT_W), height: SLOT_H }}
        >
          <div
            className="oficio-cert-inner"
            style={{
              width: CERT_DESIGN_W,
              height: CERT_DESIGN_H,
              transform: `scale(${SCALE})`,
              transformOrigin: 'top left'
            }}
          >
            {st ? (
              <Certificate t={t} student={st} directorName={directorName} narrow />
            ) : (
              <div className="oficio-empty" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
