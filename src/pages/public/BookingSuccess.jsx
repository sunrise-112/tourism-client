import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const BookingSuccess = ({ onDashboard, onHome }) => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .bs-check-path{stroke:#fff;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;fill:none;stroke-dasharray:30;stroke-dashoffset:30;animation:bsDrawCheck 0.55s ease 0.6s forwards}
        @keyframes bsDrawCheck{to{stroke-dashoffset:0}}
        .bs-card{animation:bsFadeUp 0.55s ease both;background:#fff;border:1px solid #f1f0eb;border-radius:14px;overflow:hidden}
        @keyframes bsFadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .bs-a1{animation-delay:0.05s}.bs-a2{animation-delay:0.12s}.bs-a3{animation-delay:0.19s}.bs-a4{animation-delay:0.26s}
        .bs-step-icon{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .bs-btn{display:inline-flex;align-items:center;gap:8px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;padding:11px 22px;border-radius:10px;cursor:pointer;border:none;transition:opacity 0.15s}
        .bs-btn-amber{background:#F59E0B;color:#fff}.bs-btn-amber:hover{opacity:0.88}
        .bs-btn-ghost{background:transparent;border:1px solid #e5e3dc;color:#888780}.bs-btn-ghost:hover{background:#f9f8f4}
      `}</style>

      <div
        className='min-h-screen py-8 px-5'
        style={{ background: "#f5f4ef", fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className='max-w-2xl mx-auto flex flex-col gap-3.5'>
          {/* ── Hero card ── */}
          <div
            className='bs-card bs-a1 relative text-center'
            style={{
              background: "linear-gradient(135deg,#1C1107,#2e1d0c)",
              border: "none",
              padding: "40px 36px 36px",
            }}
          >
            <div
              className='absolute top-0 right-0 pointer-events-none'
              style={{
                width: 260,
                height: 200,
                background:
                  "radial-gradient(circle at top right,rgba(245,158,11,0.18),transparent 65%)",
              }}
            />
            <div
              className='absolute top-0'
              style={{
                left: "20%",
                right: "20%",
                height: 1,
                background:
                  "linear-gradient(90deg,transparent,#F59E0B66,transparent)",
              }}
            />

            <div className='flex justify-center mb-5'>
              <div
                className='flex items-center justify-center rounded-full'
                style={{
                  width: 64,
                  height: 64,
                  border: "1px solid rgba(245,158,11,0.25)",
                  position: "relative",
                }}
              >
                <div
                  className='absolute inset-1.5 rounded-full'
                  style={{ border: "1px solid rgba(245,158,11,0.4)" }}
                />
                <div
                  className='flex items-center justify-center rounded-full'
                  style={{
                    width: 42,
                    height: 42,
                    background: "linear-gradient(135deg,#F59E0B,#EA580C)",
                    boxShadow: "0 0 20px rgba(245,158,11,0.35)",
                  }}
                >
                  <svg width='20' height='20' viewBox='0 0 24 24'>
                    <path className='bs-check-path' d='M5 13l4 4L19 7' />
                  </svg>
                </div>
              </div>
            </div>

            <span
              className='inline-flex items-center gap-1.5 mb-3.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase'
              style={{ background: "#FAEEDA", color: "#633806" }}
            >
              <span
                className='w-1.5 h-1.5 rounded-full'
                style={{ background: "#F59E0B", display: "inline-block" }}
              />
              Booking Confirmed
            </span>
            <h1
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 30,
                fontWeight: 700,
                color: "#f5e6cf",
                lineHeight: 1.2,
                marginBottom: 10,
              }}
            >
              You're all set — <em style={{ color: "#F59E0B" }}>thank you!</em>
            </h1>
            <p
              style={{
                fontSize: 13.5,
                fontWeight: 300,
                color: "#a07848",
                lineHeight: 1.65,
                maxWidth: 400,
                margin: "0 auto",
              }}
            >
              Your booking has been received successfully. Here's everything
              that happens next.
            </p>
          </div>

          {/* ── 3 step cards ── */}
          <div className='grid grid-cols-3 gap-3.5'>
            {[
              {
                cls: "bs-a2",
                bg: "#FAEEDA",
                stroke: "#854F0B",
                label: "Step 1",
                labelColor: "#854F0B",
                title: "Verifying your booking",
                desc: "Our team is reviewing your details and will begin processing shortly.",
                icon: (
                  <path
                    d='M11 3a8 8 0 100 16A8 8 0 0011 3zM21 21l-4.35-4.35'
                    stroke='#854F0B'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    fill='none'
                  />
                ),
                vb: "0 0 24 24",
              },
              {
                cls: "bs-a3",
                bg: "#EAF3DE",
                stroke: "#3B6D11",
                label: "Step 2",
                labelColor: "#3B6D11",
                title: "We'll be in touch",
                desc: "Expect a confirmation call or email from our team as soon as processed.",
                icon: (
                  <path
                    d='M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.14 2.18 2 2 0 012.12 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.46-.46a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z'
                    stroke='#3B6D11'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    fill='none'
                  />
                ),
                vb: "0 0 24 24",
              },
              {
                cls: "bs-a4",
                bg: "#E6F1FB",
                stroke: "#185FA5",
                label: "Step 3",
                labelColor: "#185FA5",
                title: "Track anytime",
                desc: "Access your dashboard at any time to check your booking status in real time.",
                icon: (
                  <>
                    <rect
                      x='3'
                      y='3'
                      width='18'
                      height='18'
                      rx='2'
                      stroke='#185FA5'
                      strokeWidth='2'
                      strokeLinecap='round'
                      fill='none'
                    />
                    <path
                      d='M3 9h18M9 21V9'
                      stroke='#185FA5'
                      strokeWidth='2'
                      strokeLinecap='round'
                      fill='none'
                    />
                  </>
                ),
                vb: "0 0 24 24",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`bs-card ${s.cls}`}
                style={{ padding: "20px 18px" }}
              >
                <div
                  className='bs-step-icon mb-3.5'
                  style={{ background: s.bg }}
                >
                  <svg width='16' height='16' viewBox={s.vb}>
                    {s.icon}
                  </svg>
                </div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#1c1c1a",
                    marginBottom: 6,
                  }}
                >
                  {s.title}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 300,
                    color: "#888780",
                    lineHeight: 1.6,
                  }}
                >
                  {s.desc}
                </p>
                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: "1px solid #f1f0eb",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: s.labelColor,
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── New user banner ── */}
          <div className='bs-card bs-a4' style={{ padding: 0 }}>
            <div
              style={{
                height: 3,
                background: "linear-gradient(90deg,#F59E0B,#FB923C,#EF4444)",
              }}
            />
            <div
              className='flex gap-3 items-start'
              style={{ background: "#FAEEDA", padding: "14px 16px" }}
            >
              <div
                className='flex items-center justify-center rounded-full shrink-0'
                style={{
                  width: 32,
                  height: 32,
                  background: "#FAC775",
                  marginTop: 1,
                }}
              >
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#854F0B'
                  strokeWidth='2.2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <circle cx='12' cy='12' r='10' />
                  <path d='M12 8v4m0 4h.01' />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#412402",
                    marginBottom: 4,
                  }}
                >
                  First time here?
                </p>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 300,
                    color: "#633806",
                    lineHeight: 1.65,
                  }}
                >
                  A new account will be created automatically for you. Your
                  login credentials will be sent to the email used during
                  booking — use them to sign in to your dashboard and track your
                  reservation anytime.
                </p>
              </div>
            </div>
          </div>

          {/* ── CTA row ── */}
          <div
            className='bs-card bs-a4 flex items-center justify-between flex-wrap gap-4'
            style={{ padding: "20px 24px" }}
          >
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#1c1c1a",
                  marginBottom: 2,
                }}
              >
                Ready to check in?
              </p>
              <p style={{ fontSize: 12, fontWeight: 300, color: "#888780" }}>
                Your dashboard is just a click away.
              </p>
            </div>
            <div className='flex gap-2.5 flex-wrap'>
              <button className='bs-btn bs-btn-ghost' onClick={onHome}>
                Return home
              </button>
              <button className='bs-btn bs-btn-amber' onClick={onDashboard}>
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2.2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <rect x='3' y='3' width='18' height='18' rx='2' />
                  <path d='M3 9h18M9 21V9' />
                </svg>
                <Link to={"/customer/dashboard"}> Go to Dashboard</Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingSuccess;
