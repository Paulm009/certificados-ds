import React, { useState, useCallback, useRef } from 'react';
import Panel from './components/Panel';
import Certificate from './components/Certificate';
import StudentNav from './components/StudentNav';
import { translations } from './translations';

const CERT_W = 1889;
const CERT_H = 1200;
const DIRECTOR_NAME = 'Ing. Paul Martinez';

export default function App() {
  const [lang, setLang] = useState('es');
  const [zoom, setZoom] = useState(1);
  const [students, setStudents] = useState([makeEmptyStudent()]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const certificateRef = useRef(null);
  const certWrapRef = useRef(null);
  const stageViewRef = useRef(null);
  const fitRef = useRef(1);

  const t = translations[lang];
  const student = students[currentIndex] || makeEmptyStudent();

  const updateStudent = useCallback((field, value) => {
    setStudents(prev => {
      const next = [...prev];
      next[currentIndex] = { ...next[currentIndex], [field]: value };
      return next;
    });
  }, [currentIndex]);

  const setAllStudents = useCallback((newStudents) => {
    setStudents(newStudents);
    setCurrentIndex(0);
  }, []);

  // Zoom logic
  const computeFit = useCallback(() => {
    const el = stageViewRef.current;
    if (!el) return 1;
    const pad = 40;
    const w = Math.max(0, el.clientWidth - pad);
    const h = Math.max(0, el.clientHeight - pad);
    return Math.max(0.05, Math.min(1, w / CERT_W, h / CERT_H));
  }, []);

  const applyScale = useCallback((z) => {
    const cert = certificateRef.current;
    const wrap = certWrapRef.current;
    if (!cert || !wrap) return;
    const fit = computeFit();
    fitRef.current = fit;
    const s = fit * z;
    cert.style.transform = `scale(${s})`;
    cert.style.transformOrigin = 'top left';
    wrap.style.width = (CERT_W * s) + 'px';
    wrap.style.height = (CERT_H * s) + 'px';
    setZoom(z);
  }, [computeFit]);

  // Initialize fit on mount
  React.useEffect(() => {
    const handler = () => applyScale(zoom);
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []); // eslint-disable-line

  const handleFit = () => applyScale(1);

  return (
    <div className="app">
      <Panel
        lang={lang}
        t={t}
        student={student}
        students={students}
        currentIndex={currentIndex}
        updateStudent={updateStudent}
        setAllStudents={setAllStudents}
        certificateRef={certificateRef}
        certificateEl={() => certificateRef.current}
        directorName={DIRECTOR_NAME}
      />
      <div className="stage">
        <div className="stage-toolbar">
          <div className="toolbar-hint">
            <span className="live-dot" />
            <span>{t.liveLabel}</span>
          </div>
          <div className="toolbar-zoom">
            <button
              className={`btn-lang ${lang === 'es' ? 'active' : ''}`}
              onClick={() => setLang('es')}
            >ES</button>
            <button
              className={`btn-lang ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLang('en')}
            >EN</button>
            <button onClick={() => applyScale(Math.max(0.5, zoom - 0.25))}>&minus;</button>
            <span className="zoom-value">{Math.round(zoom * 100)}%</span>
            <button onClick={() => applyScale(Math.min(2.5, zoom + 0.25))}>+</button>
            <button className="btn-fit" onClick={handleFit}>{t.fitLabel}</button>
          </div>
        </div>
        {students.length > 1 && (
          <StudentNav
            t={t}
            currentIndex={currentIndex}
            total={students.length}
            studentName={student.studentName}
            onPrev={() => setCurrentIndex(i => Math.max(0, i - 1))}
            onNext={() => setCurrentIndex(i => Math.min(students.length - 1, i + 1))}
          />
        )}
        <div className="stage-view" ref={stageViewRef}>
          <div className="cert-wrap" ref={certWrapRef}>
            <Certificate
              ref={certificateRef}
              t={t}
              student={student}
              directorName={DIRECTOR_NAME}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function makeEmptyStudent() {
  return {
    studentName: '',
    courseName: '',
    hours: '',
    certDate: '',
    teacherName: ''
  };
}

export { makeEmptyStudent, CERT_W, CERT_H, DIRECTOR_NAME };
