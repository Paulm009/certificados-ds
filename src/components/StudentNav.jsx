import React from 'react';

export default function StudentNav({ t, currentIndex, total, studentName, onPrev, onNext }) {
  return (
    <div className="student-nav">
      <span>
        {t.studentNav} <strong>{currentIndex + 1}</strong> {t.studentNavOf} {total}
        {studentName ? ` — ${studentName}` : ''}
      </span>
      <button onClick={onPrev} disabled={currentIndex === 0}>← Anterior</button>
      <button onClick={onNext} disabled={currentIndex >= total - 1}>Siguiente →</button>
    </div>
  );
}
