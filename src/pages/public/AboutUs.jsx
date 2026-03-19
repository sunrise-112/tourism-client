// ─── AboutUs.jsx ──────────────────────────────────────────────
import { Link } from "react-router-dom";

const STATS = [
  { value: "120+", label: "Destinations" },
  { value: "8K+", label: "Happy Travelers" },
  { value: "4.9★", label: "Average Rating" },
  { value: "12yr", label: "Experience" },
];

const TEAM = [
  {
    name: "Youssef El Amrani",
    role: "Founder & Lead Guide",
    bio: "Born in the Atlas Mountains, Youssef has spent 15 years crafting immersive Moroccan journeys that go far beyond the tourist trail.",
    initials: "YA",
  },
  {
    name: "Fatima Benali",
    role: "Head of Operations",
    bio: "Fatima ensures every tour runs flawlessly — from hotel bookings to border crossings. She speaks five languages and knows every riad in Fez.",
    initials: "FB",
  },
  {
    name: "Karim Tazi",
    role: "Desert & Trekking Expert",
    bio: "Karim grew up in Merzouga and has led hundreds of desert expeditions. His knowledge of the Sahara is second to none.",
    initials: "KT",
  },
];

const VALUES = [
  {
    icon: "fa-heart",
    title: "Authentic Experiences",
    desc: "We go beyond the postcard. Every itinerary is designed to connect you with real people, real culture, and real Morocco.",
  },
  {
    icon: "fa-leaf",
    title: "Responsible Tourism",
    desc: "We partner with local communities, minimize environmental impact, and ensure tourism benefits the people who call Morocco home.",
  },
  {
    icon: "fa-shield-alt",
    title: "Safety First",
    desc: "All our guides are licensed and trained in first aid. Your safety and comfort are our absolute top priority on every trip.",
  },
  {
    icon: "fa-star",
    title: "Exceptional Quality",
    desc: "From hand-picked riads to private desert camps — we obsess over every detail so you can focus on the adventure.",
  },
];

const AboutUs = () => (
  <div
    className='min-h-screen bg-stone-50'
    style={{ fontFamily: "'DM Sans', sans-serif" }}
  >
    {/* ── HERO ──────────────────────────────────────────── */}
    <div className='relative bg-[#1C1107] overflow-hidden'>
      <div
        className='absolute inset-0 opacity-[0.04]'
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className='absolute top-0 right-0 w-[500px] h-[400px] bg-amber-600/15 rounded-full blur-[100px] pointer-events-none' />
      <div className='absolute bottom-0 left-0 w-[400px] h-[300px] bg-orange-800/15 rounded-full blur-[80px] pointer-events-none' />

      <div className='relative z-10 max-w-5xl mx-auto px-6 py-24 md:py-32 text-center'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-4'>
          Our Story
        </p>
        <h1
          className='text-5xl md:text-7xl font-black text-white leading-tight mb-6'
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          We Live &<br />
          <span
            className='text-transparent bg-clip-text'
            style={{
              backgroundImage: "linear-gradient(135deg, #F59E0B, #FB923C)",
            }}
          >
            Breathe Morocco
          </span>
        </h1>
        <p className='text-stone-400 text-lg max-w-2xl mx-auto leading-relaxed'>
          Founded by a team of passionate Moroccan locals, we've been crafting
          unforgettable journeys through our homeland for over a decade — one
          traveler at a time.
        </p>
      </div>
    </div>

    {/* ── STATS ─────────────────────────────────────────── */}
    <div className='bg-amber-500'>
      <div className='max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-amber-400/40'>
        {STATS.map((s) => (
          <div key={s.label} className='text-center px-4'>
            <p className='text-3xl font-black text-amber-900'>{s.value}</p>
            <p className='text-sm text-amber-800/70 font-medium mt-1 uppercase tracking-wider'>
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* ── MISSION ───────────────────────────────────────── */}
    <div className='max-w-6xl mx-auto px-6 py-20'>
      <div className='grid md:grid-cols-2 gap-12 items-center'>
        <div>
          <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-3'>
            Our Mission
          </p>
          <h2
            className='text-3xl md:text-4xl font-black text-stone-800 mb-6 leading-tight'
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            More Than a Tour —<br />A Transformation
          </h2>
          <p className='text-stone-500 leading-relaxed mb-4 text-[15px]'>
            We believe travel should change you. Not just your Instagram feed —
            but your perspective, your empathy, your understanding of what it
            means to be human. Morocco has that power like few places on earth.
          </p>
          <p className='text-stone-500 leading-relaxed text-[15px]'>
            That's why we go deeper. We take you to the family-run argan
            cooperative in the Souss Valley, the 900-year-old madrasa in Fez,
            the Berber shepherd's fire in the High Atlas. The Morocco that isn't
            in the guidebooks.
          </p>
          <Link
            to='/tours'
            className='inline-flex items-center gap-2 mt-8 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 transition-colors px-6 py-3 rounded-xl shadow-md shadow-amber-200'
          >
            Explore Our Tours <i className='fa fa-arrow-right text-xs' />
          </Link>
        </div>

        {/* Visual card stack */}
        <div className='relative h-80 md:h-96'>
          <div className='absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-50 rounded-3xl' />
          <div className='absolute top-6 left-6 right-6 bottom-6 bg-white rounded-2xl border border-stone-100 shadow-lg overflow-hidden'>
            <img
              src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Jamaa_el_Fna_at_dusk.jpg/1280px-Jamaa_el_Fna_at_dusk.jpg'
              alt='Morocco'
              className='w-full h-full object-cover opacity-90'
            />
          </div>
          <div className='absolute -bottom-4 -right-4 bg-amber-400 rounded-2xl px-5 py-3 shadow-lg'>
            <p className='text-amber-900 font-black text-2xl'>12+</p>
            <p className='text-amber-800 text-xs font-semibold'>
              Years of excellence
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* ── VALUES ────────────────────────────────────────── */}
    <div className='bg-white py-20'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='text-center mb-12'>
          <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-3'>
            What Drives Us
          </p>
          <h2
            className='text-3xl md:text-4xl font-black text-stone-800'
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Our Core Values
          </h2>
        </div>
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {VALUES.map((v) => (
            <div
              key={v.title}
              className='bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:shadow-lg hover:shadow-stone-200/60 hover:-translate-y-1 transition-all duration-200'
            >
              <div className='w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mb-4'>
                <i className={`fa ${v.icon} text-amber-500`} />
              </div>
              <h3 className='font-black text-stone-800 mb-2'>{v.title}</h3>
              <p className='text-sm text-stone-400 leading-relaxed'>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ── TEAM ──────────────────────────────────────────── */}
    <div className='max-w-6xl mx-auto px-6 py-20'>
      <div className='text-center mb-12'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-3'>
          The People Behind the Magic
        </p>
        <h2
          className='text-3xl md:text-4xl font-black text-stone-800'
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Meet Our Team
        </h2>
      </div>
      <div className='grid md:grid-cols-3 gap-8'>
        {TEAM.map((member) => (
          <div
            key={member.name}
            className='bg-white rounded-2xl border border-stone-100 p-7 text-center hover:shadow-xl hover:shadow-stone-200/60 hover:-translate-y-1 transition-all duration-200'
          >
            <div className='w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-2xl mx-auto mb-5 shadow-lg shadow-amber-200'>
              {member.initials}
            </div>
            <h3 className='font-black text-stone-800 text-lg mb-1'>
              {member.name}
            </h3>
            <p className='text-xs font-bold uppercase tracking-widest text-amber-500 mb-4'>
              {member.role}
            </p>
            <p className='text-sm text-stone-400 leading-relaxed'>
              {member.bio}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* ── CTA ───────────────────────────────────────────── */}
    <div className='max-w-6xl mx-auto px-6 pb-20'>
      <div className='relative bg-[#1C1107] rounded-3xl overflow-hidden p-14 text-center'>
        <div
          className='absolute inset-0 opacity-[0.04]'
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-amber-500/20 rounded-full blur-[70px] pointer-events-none' />
        <div className='relative z-10'>
          <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-4'>
            Ready to explore?
          </p>
          <h2
            className='text-4xl font-black text-white mb-4'
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Let's Plan Your Journey
          </h2>
          <p className='text-stone-400 text-lg mb-8 max-w-xl mx-auto'>
            Our team is ready to craft your perfect Moroccan adventure.
          </p>
          <div className='flex items-center justify-center gap-4 flex-wrap'>
            <Link
              to='/tours'
              className='flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 transition-colors px-8 py-3.5 rounded-xl'
            >
              Browse Tours <i className='fa fa-arrow-right' />
            </Link>
            <Link
              to='/contact'
              className='flex items-center gap-2 text-sm font-semibold text-stone-300 hover:text-white border border-white/15 hover:border-white/30 px-8 py-3.5 rounded-xl transition-all'
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AboutUs;
