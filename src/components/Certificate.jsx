import React, { forwardRef } from 'react';

// Logos desde archivos PNG en /public
const LOGO_LEFT = '/logoacademyt.png';
const LOGO_RIGHT = '/DSlogoBlancoSinFondo.png';
const SEAL_IMG = '/logoacademyt.png';

const Certificate = forwardRef(function Certificate({ t, student, directorName }, ref) {
  const s = student || {};
  const sName = s.studentName?.trim() || t.defaultStudent;
  const cName = s.courseName?.trim() || t.defaultCourse;
  const hours = (s.hours?.trim() || t.placeholderHours).toUpperCase();
  const date = (s.certDate?.trim() || t.placeholderDate).toUpperCase();
  const teacher = s.teacherName?.trim() || t.defaultTeacher;

  return (
    <div id="certificate" ref={ref}>
      {/* Corner decorations */}
      <svg className="corner-tr" viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg">
        <polygon points="300,0 300,220 90,0" fill="#ececec" />
        <polygon points="300,0 300,130 160,0" fill="#1a1a1a" />
        <line x1="100" y1="0" x2="300" y2="200" stroke="#b3872f" strokeWidth="2" />
      </svg>
      <svg className="corner-bl" viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg">
        <polygon points="300,0 300,220 90,0" fill="#ececec" />
        <polygon points="300,0 300,130 160,0" fill="#1a1a1a" />
        <line x1="100" y1="0" x2="300" y2="200" stroke="#b3872f" strokeWidth="2" />
      </svg>

      <div className="gold-frame" />

      <div className="content">
        {/* Header with logos */}
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

        {/* Info row */}
        <div className="info-row">
          <div className="info-item">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.6">
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
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.6">
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
