import React, { forwardRef } from 'react';

// Logos desde archivos PNG en /public
const LOGO_LEFT = '/logoacademyt.png';
const LOGO_RIGHT = '/DSlogoBlancoSinFondo.png';
const SEAL_IMG = '/logoacademyt.png';

const Certificate = forwardRef(function Certificate({ t, student, directorName, narrow = false }, ref) {
  const s = student || {};
  const sName = s.studentName?.trim() || t.defaultStudent;
  const cName = s.courseName?.trim() || t.defaultCourse;
  const hours = (s.hours?.trim() || t.placeholderHours).toUpperCase();
  const date = (s.certDate?.trim() || t.placeholderDate).toUpperCase();
  const teacher = s.teacherName?.trim() || t.defaultTeacher;

  return (
    <div id="certificate" ref={ref} className={narrow ? 'cert-narrow' : ''}>
      {/* Esquinas decorativas tipo abanico */}
      <svg className="corner-tr" viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hatch-tr" width="12" height="12" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width="12" height="12" fill="#141414" />
            <line x1="0" y1="0" x2="0" y2="12" stroke="#3a3a3a" strokeWidth="1" />
          </pattern>
        </defs>
        <polygon points="320,0 320,260 30,0" fill="url(#hatch-tr)" />
        <polygon points="320,0 320,150 190,0" fill="#141414" />
        <line x1="80" y1="0" x2="320" y2="222" stroke="#b3872f" strokeWidth="2" />
      </svg>
      <svg className="corner-bl" viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hatch-bl" width="12" height="12" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width="12" height="12" fill="#141414" />
            <line x1="0" y1="0" x2="0" y2="12" stroke="#3a3a3a" strokeWidth="1" />
          </pattern>
        </defs>
        <polygon points="320,0 320,260 30,0" fill="url(#hatch-bl)" />
        <polygon points="320,0 320,150 190,0" fill="#141414" />
        <line x1="80" y1="0" x2="320" y2="222" stroke="#b3872f" strokeWidth="2" />
      </svg>

      <div className="gold-frame" />

      <div className="content">
        {/* Header con logos */}
        <div className="header-row">
          <div className="logo-box left">
            <img src={LOGO_LEFT} alt="Logo" />
          </div>
          <div className="title-block">
            <p className="cert-title">{t.certTitle}</p>
            <div className="cert-subtitle">
              <span className="ln" />
              <span>{t.certSubtitle}</span>
              <span className="ln" />
            </div>
          </div>
          <div className="logo-box right">
            <img src={LOGO_RIGHT} alt="Digital Services Academy" />
          </div>
        </div>

        <p className="lead">{t.certLead}</p>
        <div className="student-name">{sName}</div>
        <div className="name-underline" />

        <p className="course-lead">{t.certCourseLead}</p>
        <p className="course-name">{cName}</p>

        {/* Fila de info */}
        <div className="info-row">
          <div className="info-item">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.6">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3.5 2" />
            </svg>
            <div className="info-text">
              <p className="info-label">{t.certInfoHoursLabel}</p>
              <p className="info-value">{hours}</p>
            </div>
          </div>
          <div className="info-sep" />
          <div className="info-item">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.6">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M8 3v4M16 3v4M3 10h18" />
            </svg>
            <div className="info-text">
              <p className="info-label">{t.certInfoDateLabel}</p>
              <p className="info-value">{date}</p>
            </div>
          </div>
        </div>

        <div className="thin-divider">
          <span className="ln" />
          <span className="dot" />
          <span className="ln" />
        </div>

        <p className="thanks" dangerouslySetInnerHTML={{ __html: t.certThanks }} />

        {/* Footer */}
        <div className="footer-row">
          <div className="sign-block">
            <div className="signature-script">&nbsp;</div>
            <div className="sign-line" />
            <div className="sign-name">{directorName}</div>
            <div className="sign-role" dangerouslySetInnerHTML={{ __html: t.certDirectorRole }} />
          </div>

          <div className="seal-wrap">
            <div className="seal">
              <img src={SEAL_IMG} alt="Sello" />
            </div>
            <div className="ribbon">
              <div className="tail" />
              <div className="tail right" />
            </div>
          </div>

          <div className="sign-block">
            <div className="signature-script">&nbsp;</div>
            <div className="sign-line" />
            <div className="sign-name">{teacher}</div>
            <div className="sign-role" dangerouslySetInnerHTML={{ __html: t.certTeacherRole }} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default Certificate;