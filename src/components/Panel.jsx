import React, { useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { generatePDF, generateOficioPDF, generateAllOficioPDFs } from '../pdfUtils';
import { makeEmptyStudent } from '../App';

export default function Panel({
  lang, t, student, students, currentIndex,
  updateStudent, setAllStudents,
  certificateRef, certificateEl, directorName
}) {
  const fileInputRef = useRef(null);
  const [excelFile, setExcelFile] = React.useState(null);
  const [excelCount, setExcelCount] = React.useState(0);
  const [status, setStatus] = React.useState('');
  const [statusType, setStatusType] = React.useState('');
  const [showOficio, setShowOficio] = React.useState(false);
  const [oficioStudents, setOficioStudents] = React.useState([makeEmptyStudent(), makeEmptyStudent()]);

  const s = student || {};

  const handleFieldChange = (field) => (e) => {
    updateStudent(field, e.target.value);
  };

  const setStatusMsg = (msg, type) => {
    setStatus(msg);
    setStatusType(type);
    if (type === 'ok' || type === 'err') {
      setTimeout(() => { setStatus(''); setStatusType(''); }, 4000);
    }
  };

  // Download Excel template
  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const data = [
      ['Nombre del Estudiante', 'Nombre del Curso', 'Carga Horaria', 'Fecha', 'Nombre del Docente'],
      ['María Fernanda Rojas', 'Seguridad en Aplicaciones Web', '40 horas académicas', '25 de mayo de 2024', 'Lic. Carlos Mendoza'],
      ['Juan Pérez López', 'Inteligencia Artificial', '60 horas académicas', '10 de junio de 2024', 'Dra. Ana Torres'],
      ['Laura Gómez Díaz', 'Transformación Digital', '30 horas académicas', '15 de julio de 2024', 'Ing. Roberto Silva'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    // Set column widths
    ws['!cols'] = [
      { wch: 30 }, { wch: 35 }, { wch: 22 }, { wch: 22 }, { wch: 28 }
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes');
    XLSX.writeFile(wb, 'plantilla_certificados.xlsx');
  };

  // Handle Excel upload
  const handleExcelUpload = useCallback((file) => {
    if (!file) return;
    setExcelFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (rows.length < 2) {
          setStatusMsg(t.uploadError, 'err');
          return;
        }

        const header = rows[0].map(h => String(h || '').toLowerCase().trim());
        const idxName = header.findIndex(h => h.includes('nombre') && h.includes('estudiante'));
        const idxCourse = header.findIndex(h => h.includes('curso'));
        const idxHours = header.findIndex(h => h.includes('carga') || h.includes('horaria') || h.includes('horas'));
        const idxDate = header.findIndex(h => h.includes('fecha'));
        const idxTeacher = header.findIndex(h => h.includes('docente') || h.includes('profesor'));

        if (idxName === -1 || idxCourse === -1) {
          setStatusMsg(t.uploadError, 'err');
          return;
        }

        const parsed = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !row[idxName]) continue;
          parsed.push({
            studentName: String(row[idxName] || '').trim(),
            courseName: String(row[idxCourse] || '').trim(),
            hours: idxHours >= 0 ? String(row[idxHours] || '').trim() : '',
            certDate: idxDate >= 0 ? String(row[idxDate] || '').trim() : '',
            teacherName: idxTeacher >= 0 ? String(row[idxTeacher] || '').trim() : '',
          });
        }

        if (parsed.length === 0) {
          setStatusMsg(t.uploadError, 'err');
          return;
        }

        setExcelCount(parsed.length);
        setAllStudents(parsed);
        setStatusMsg(`${parsed.length} ${t.uploadStudents}`, 'ok');
      } catch (err) {
        console.error(err);
        setStatusMsg(t.uploadError, 'err');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [setAllStudents, t]);

  const clearExcel = () => {
    setExcelFile(null);
    setExcelCount(0);
    setAllStudents([makeEmptyStudent()]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      handleExcelUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDownloadOne = async () => {
    const el = certificateEl();
    if (!el) return;
    setStatusMsg(t.statusGenerating, '');
    try {
      await generatePDF(el, s.studentName || 'estudiante', t);
      setStatusMsg(t.statusOk, 'ok');
    } catch (err) {
      console.error(err);
      setStatusMsg(t.statusErr, 'err');
    }
  };

  const handleDownloadAll = async () => {
    setStatusMsg(t.statusGeneratingAll, '');
    try {
      await generateAllOficioPDFs(students, directorName, t);
      setStatusMsg(t.statusAllOk, 'ok');
    } catch (err) {
      console.error(err);
      setStatusMsg(t.statusErr, 'err');
    }
  };

  const openOficio = () => {
    setOficioStudents([
      { ...s },
      makeEmptyStudent()
    ]);
    setShowOficio(true);
  };

  const updateOficioStudent = (idx, field, value) => {
    setOficioStudents(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleGenerateOficio = async () => {
    const filled = oficioStudents.every(st => st.studentName?.trim() && st.courseName?.trim());
    if (!filled) {
      setStatusMsg(t.uploadError, 'err');
      return;
    }
    setStatusMsg(t.statusGenerating, '');
    try {
      await generateOficioPDF(oficioStudents, directorName, t);
      setStatusMsg(t.statusOficioOk, 'ok');
      setShowOficio(false);
    } catch (err) {
      console.error(err);
      setStatusMsg(t.statusErr, 'err');
    }
  };

  const ready = s.studentName?.trim() && s.courseName?.trim();

  return (
    <div className="panel">
      <div className="brand">
        <div className="mark">C</div>
        <span>Digital Services Academy</span>
      </div>
      <div className="panel-head">
        <h1>{t.panelTitle}</h1>
        <p className="sub">{t.panelSub}</p>
      </div>

      <div className="divider" />

      {/* Excel Upload Section */}
      <div className="section-head">
        <span className="sec-index">📂</span>
        <span className="sec-title">{t.uploadTitle}</span>
      </div>
      <div className="excel-section">
        <div
          className="excel-upload-area"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="excel-icon">📁</div>
          <p>{t.uploadDrop}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={(e) => handleExcelUpload(e.target.files[0])}
          />
        </div>
        {excelFile ? (
          <>
            <div className="excel-file-name">
              ✅ {excelFile.name}
              <button onClick={clearExcel}>✕ {t.uploadClear}</button>
            </div>
            <div className="excel-summary">
              📊 {excelCount} {t.uploadStudents}
            </div>
          </>
        ) : (
          <div className="excel-actions">
            <button className="btn-secondary" onClick={downloadTemplate}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {t.uploadDownloadTemplate}
            </button>
          </div>
        )}
      </div>

      <div className="divider" />

      <div className="section-head">
        <span className="sec-index">01</span>
        <span className="sec-title">{t.sec01Title}</span>
      </div>
      <div className="field">
        <label>{t.lblStudentName}</label>
        <input
          type="text"
          value={s.studentName || ''}
          onChange={handleFieldChange('studentName')}
          placeholder={t.placeholderStudent}
          autoComplete="off"
        />
      </div>
      <div className="field">
        <label>{t.lblCourseName}</label>
        <input
          type="text"
          value={s.courseName || ''}
          onChange={handleFieldChange('courseName')}
          placeholder={t.placeholderCourse}
          autoComplete="off"
        />
      </div>
      <div className="row2">
        <div className="field">
          <label>{t.lblHours}</label>
          <input
            type="text"
            value={s.hours || ''}
            onChange={handleFieldChange('hours')}
            placeholder={t.placeholderHours}
            autoComplete="off"
          />
        </div>
        <div className="field">
          <label>{t.lblDate}</label>
          <input
            type="text"
            value={s.certDate || ''}
            onChange={handleFieldChange('certDate')}
            placeholder={t.placeholderDate}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="divider" />

      <div className="section-head">
        <span className="sec-index">02</span>
        <span className="sec-title">{t.sec02Title}</span>
      </div>
      <div className="field">
        <label>{t.lblDirector}</label>
        <input type="text" value={directorName} disabled style={{ opacity: 0.6 }} />
      </div>
      <div className="field">
        <label>{t.lblTeacher}</label>
        <input
          type="text"
          value={s.teacherName || ''}
          onChange={handleFieldChange('teacherName')}
          placeholder={t.placeholderTeacher}
          autoComplete="off"
        />
      </div>

      <div className="actions">
        <button className="btn-secondary" onClick={openOficio}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M8 3v4M16 3v4M3 10h18" />
          </svg>
          <span>{t.btnOficio2}</span>
        </button>

        <button className="btn-primary" onClick={handleDownloadOne} disabled={!ready}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>{t.btnDownloadOne}</span>
        </button>

        {students.length > 1 && (
          <button className="btn-primary" onClick={handleDownloadAll}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>{t.btnDownloadAll}</span>
          </button>
        )}

        <div className={`status ${statusType}`}>{status}</div>
      </div>

      {showOficio && (
        <div className="modal-overlay" onClick={() => setShowOficio(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{t.oficioModalTitle}</h2>
              <button className="modal-close" onClick={() => setShowOficio(false)}>✕</button>
            </div>

            <div className="oficio-grid">
              {[0, 1].map(idx => {
                const st = oficioStudents[idx] || makeEmptyStudent();
                return (
                  <div className="oficio-form" key={idx}>
                    <div className="oficio-form-title">
                      <span className="sec-index">{idx === 0 ? '01' : '02'}</span>
                      {idx === 0 ? t.oficioStudentTop : t.oficioStudentBottom}
                    </div>
                    <div className="field">
                      <label>{t.lblStudentName}</label>
                      <input
                        type="text"
                        value={st.studentName || ''}
                        onChange={(e) => updateOficioStudent(idx, 'studentName', e.target.value)}
                        placeholder={t.placeholderStudent}
                        autoComplete="off"
                      />
                    </div>
                    <div className="field">
                      <label>{t.lblCourseName}</label>
                      <input
                        type="text"
                        value={st.courseName || ''}
                        onChange={(e) => updateOficioStudent(idx, 'courseName', e.target.value)}
                        placeholder={t.placeholderCourse}
                        autoComplete="off"
                      />
                    </div>
                    <div className="row2">
                      <div className="field">
                        <label>{t.lblHours}</label>
                        <input
                          type="text"
                          value={st.hours || ''}
                          onChange={(e) => updateOficioStudent(idx, 'hours', e.target.value)}
                          placeholder={t.placeholderHours}
                          autoComplete="off"
                        />
                      </div>
                      <div className="field">
                        <label>{t.lblDate}</label>
                        <input
                          type="text"
                          value={st.certDate || ''}
                          onChange={(e) => updateOficioStudent(idx, 'certDate', e.target.value)}
                          placeholder={t.placeholderDate}
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <div className="field">
                      <label>{t.lblTeacher}</label>
                      <input
                        type="text"
                        value={st.teacherName || ''}
                        onChange={(e) => updateOficioStudent(idx, 'teacherName', e.target.value)}
                        placeholder={t.placeholderTeacher}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowOficio(false)}>{t.btnCancel}</button>
              <button className="btn-primary" onClick={handleGenerateOficio}>{t.btnGenerateOficio}</button>
            </div>
            <div className={`status ${statusType}`}>{status}</div>
          </div>
        </div>
      )}
    </div>
  );
}
