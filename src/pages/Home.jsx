import React, { useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import {
  BookMarked,
  ArrowUpLeft,
  Library,
  Lock,
  Send,
  Mail,
  MapPin,
  Shield,
  Repeat,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

// ─── Spring Reveal Component ────────────────────────────────────────────────
const SpringReveal = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-8% 0px -8% 0px" });

  return (
    <div
      ref={ref}
      className={`spring-reveal ${isInView ? "visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};

// ─── Stats Counter ──────────────────────────────────────────────────────────
const StatItem = ({ number, label, delay = 0 }) => (
  <SpringReveal delay={delay} className="text-center">
    <p className="text-3xl md:text-4xl font-black text-library-accent mb-1">{number}</p>
    <p className="text-xs md:text-sm font-bold text-library-primary/40 dark:text-library-paper/40 uppercase tracking-wider">
      {label}
    </p>
  </SpringReveal>
);

// ─── Feature Card ───────────────────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, desc, delay = 0 }) => (
  <SpringReveal delay={delay}>
    <div className="group p-8 rounded-2xl bg-white dark:bg-dark-surface border border-library-primary/[0.06] dark:border-white/[0.06] card-lift">
      <div className="w-12 h-12 rounded-xl bg-library-accent/10 flex items-center justify-center mb-5 group-hover:bg-library-accent/20 transition-colors">
        <Icon size={22} className="text-library-accent" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-black text-library-primary dark:text-library-paper mb-3">
        {title}
      </h3>
      <p className="text-sm text-library-primary/50 dark:text-gray-400 leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  </SpringReveal>
);

// ─── Marquee Ticker ─────────────────────────────────────────────────────────
const MarqueeTicker = () => {
  const items = [
    "هندسة", "طب", "صيدلة", "حاسبات", "علوم", "إدارة أعمال",
    "إعلام", "حقوق", "فنون", "تربية", "آداب", "تجارة",
  ];

  return (
    <div className="w-full overflow-hidden py-6 border-y border-library-primary/[0.06] dark:border-white/[0.06]">
      <div className="flex animate-ticker whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="inline-block mx-6 text-sm font-bold text-library-primary/15 dark:text-library-paper/10 uppercase tracking-[0.3em]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── 3D Book Graphic ────────────────────────────────────────────────────────
const BookGraphic = () => (
  <div className="perspective-container">
    <div className="book-wrapper animate-ultimate-float">
      <div className="book-3d">
        <div className="book-spine"></div>
        <div className="book-block-page">
          <div className="flex flex-col h-full relative z-10">
            <div className="border-b border-library-primary/10 pb-2 md:pb-4 mb-2 md:mb-4">
              <h5 className="text-[8px] md:text-[10px] font-black text-library-primary mb-1 italic">
                الأرشيف الجامعي
              </h5>
              <div className="h-0.5 w-6 md:w-8 bg-library-accent rounded-full accent-line"></div>
            </div>
            <p className="text-[7px] md:text-[9px] font-medium leading-relaxed md:leading-loose text-library-primary opacity-60">
              المعرفة هي الأمانة التي تزداد بالمشاركة. نحن نؤمن بأن كل طالب
              يمتلك مفتاحاً لنجاح زميل آخر. نظامنا صُمم ليكون جسراً آمناً يربط
              بين جامعات مصر...
            </p>
            <div className="mt-auto pt-2 flex justify-between items-center text-[7px] md:text-[8px] font-bold opacity-30 uppercase tracking-tighter">
              <span>Cairo Ed.</span>
              <span>P. 018</span>
            </div>
          </div>
        </div>

        <div className="book-cover-pivot">
          <div className="cover-front flex flex-col justify-between p-5 md:p-8">
            <div className="text-library-accent text-[8px] md:text-[10px] font-bold tracking-[0.3em] uppercase mb-2 opacity-70">
              Tabaadol
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="w-8 md:w-10 h-0.5 bg-library-accent mb-4 md:mb-6 rounded-full accent-line"></div>
              <h2 className="text-xl md:text-3xl font-black text-library-paper leading-[1.1] tracking-tighter mb-2 md:mb-4">
                تاريخ <br />
                <span className="text-library-accent">العمارة</span>
              </h2>
              <p className="text-library-paper/40 font-bold text-[7px] md:text-[9px] tracking-widest uppercase">
                Academic Reserve
              </p>
            </div>
            <div className="flex justify-between items-end opacity-40">
              <BookMarked size={20} className="text-white md:w-6 md:h-6" />
              <div className="text-[7px] md:text-[9px] font-bold text-white tracking-widest">
                VOL. IV
              </div>
            </div>
          </div>

          <div className="cover-back-page">
            <div className="w-full h-full border border-library-primary/5 p-4 md:p-6 flex flex-col justify-center text-center">
              <Library
                size={20}
                className="text-library-accent/40 mx-auto mb-2 md:mb-4"
              />
              <h5 className="text-[8px] md:text-[10px] font-bold text-library-primary mb-1 md:mb-2 italic">
                ميثاق الأمان
              </h5>
              <p className="text-[7px] md:text-[9px] leading-relaxed text-library-primary/50 font-medium">
                "هذا الكتاب عهدة أمانة. حافظ عليه ليعود يوماً ما لرفوف الأرشيف."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Contact Section ────────────────────────────────────────────────────────
const ContactSection = () => (
  <section className="py-24 md:py-32 bg-library-primary dark:bg-[#04060a] relative overflow-hidden">
    {/* Subtle radial glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-library-accent/[0.03] rounded-full blur-[120px] pointer-events-none" />

    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
        {/* Left - Info */}
        <SpringReveal className="pt-4">
          <p className="text-library-accent text-[10px] font-bold uppercase tracking-[0.4em] mb-5">
            Get In Touch
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-5 leading-tight">
            تواصل معنا.
          </h2>
          <p className="text-base md:text-lg text-white/40 mb-12 max-w-md font-medium leading-relaxed">
            هل لديك استفسار أو اقتراح لتطوير الأرشيف؟ فريقنا دائماً هنا
            للاستماع لطلابنا.
          </p>

          <div className="space-y-5">
            {[
              { icon: Mail, label: "البريد الإلكتروني", value: "support@tabaadol.edu" },
              { icon: MapPin, label: "الموقع", value: "الجامعات المصرية، القاهرة" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-5 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-library-accent/20 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-library-accent/10 border border-library-accent/15 flex items-center justify-center text-library-accent flex-shrink-0">
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-white font-bold text-sm">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </SpringReveal>

        {/* Right - Form */}
        <SpringReveal delay={0.15}>
          <form className="space-y-4 p-7 md:p-9 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" placeholder="الاسم" className="contact-input" />
              <input type="email" placeholder="البريد الإلكتروني" className="contact-input" />
            </div>
            <input type="text" placeholder="الموضوع" className="contact-input" />
            <textarea
              placeholder="رسالتك..."
              rows="5"
              className="contact-input resize-none"
            ></textarea>
            <button
              type="submit"
              className="w-full py-4 bg-library-accent text-library-primary font-black rounded-xl flex items-center justify-center gap-3 hover:bg-library-accent/90 transition-all group text-sm active:scale-[0.98]"
            >
              إرسال الرسالة
              <Send
                size={15}
                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            </button>
          </form>
        </SpringReveal>
      </div>
    </div>
  </section>
);

// ─── Main Home Component ────────────────────────────────────────────────────
const Home = () => {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 0.3], [0, 60]);

  const books = [
    { title: "الفيزياء الجامعية", author: "سيرواي", cat: "علوم" },
    { title: "الاقتصاد الجزئي", author: "مانكيو", cat: "إدارة" },
    { title: "هياكل البيانات", author: "سيدجويك", cat: "حاسبات" },
    { title: "علم الأدوية", author: "ليبينكوت", cat: "طب" },
  ];

  const features = [
    {
      icon: Shield,
      title: "أمان أكاديمي",
      desc: "كل حساب يخضع لمراجعة يدوية ضمان بيئة أكاديمية نقية وخالية من الهويات المجهولة.",
    },
    {
      icon: Repeat,
      title: "التسليم الذكي (OTP)",
      desc: "رمز الـ OTP لا يتم تبادله إلا عند اللقاء الفعلي داخل الجامعة لضمان استلام الكتاب وتوثيقه.",
    },
    {
      icon: GraduationCap,
      title: "شبكة جامعية",
      desc: "ربط طلاب من كافة الجامعات المصرية في منصة واحدة لتبادل المعرفة والمراجع بسلاسة.",
    },
  ];

  return (
    <div className="bg-texture min-h-screen relative selection:bg-library-accent/30 overflow-hidden">
      <Navbar />

      <main className="relative z-10 pt-24">
        {/* ════════════════════ HERO SECTION ════════════════════ */}
        <section className="relative min-h-[85vh] lg:min-h-[80vh] flex items-center pt-20 pb-12 md:pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Text */}
            <motion.div
              style={{ y: yHero }}
              className="flex flex-col items-center lg:items-start z-10 text-center lg:text-right"
            >
              <SpringReveal className="mb-6 md:mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-library-accent/8 text-library-accent font-bold text-[10px] uppercase tracking-[0.2em] border border-library-accent/15 rounded-full">
                  <Sparkles size={11} />
                  Premier University Network
                </div>
              </SpringReveal>

              <SpringReveal delay={0.08} className="mb-5 md:mb-7">
                <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-library-primary dark:text-library-paper tracking-tight leading-[1.1]">
                  المعرفة لا تُمتلك،
                </h1>
                <div className="flex items-center justify-center lg:justify-start gap-4 md:gap-5 mt-2">
                  <div className="h-1 w-10 md:w-14 bg-library-accent rounded-full accent-line"></div>
                  <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-library-accent italic tracking-tight leading-[1.1]">
                    بل تُمرر.
                  </h1>
                </div>
              </SpringReveal>

              <SpringReveal
                delay={0.16}
                className="text-base md:text-lg text-library-primary/60 dark:text-gray-400 max-w-md mb-8 md:mb-10 border-r-4 border-library-accent/40 pr-5 leading-relaxed font-medium"
              >
                أرشيف رقمي يربط طلاب الجامعات في مصر. استعر الكتب التي تحتاجها
                مجاناً، وأودع مراجعك القديمة في مجتمعك الأكاديمي بأمان تام.
              </SpringReveal>

              <SpringReveal delay={0.24}>
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-3 text-library-paper bg-library-primary dark:bg-library-paper dark:text-library-primary px-8 py-4 rounded-full font-bold text-base shadow-xl shadow-library-primary/10 dark:shadow-black/20 hover:shadow-2xl hover:shadow-library-accent/15 transition-all duration-400 hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  ابدأ الآن
                  <ArrowUpLeft
                    size={18}
                    className="transform group-hover:-translate-y-0.5 group-hover:-translate-x-0.5 transition-transform"
                  />
                </Link>
              </SpringReveal>
            </motion.div>

            {/* Book */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="relative z-10 flex justify-center py-8 md:py-0"
            >
              <div className="scale-75 sm:scale-90 md:scale-100">
                <BookGraphic />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ════════════════════ STATS BAR ════════════════════ */}
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-3 gap-6 md:gap-12">
              <StatItem number="+1200" label="كتاب متاح" delay={0} />
              <StatItem number="+8" label="جامعات" delay={0.1} />
              <StatItem number="+3500" label="طالب مسجل" delay={0.2} />
            </div>
          </div>
        </section>

        {/* ════════════════════ MARQUEE ════════════════════ */}
        <MarqueeTicker />

        {/* ════════════════════ FEATURES ════════════════════ */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <SpringReveal className="text-center mb-14 md:mb-20">
              <p className="text-library-accent text-[10px] font-bold uppercase tracking-[0.4em] mb-4">
                لماذا Tabaadol؟
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-library-primary dark:text-library-paper mb-4 tracking-tight">
                بُنيت للطلاب، بأيدي الطلاب.
              </h2>
              <p className="text-library-primary/50 dark:text-gray-400 text-base md:text-lg max-w-lg mx-auto font-medium">
                كل تفصيلة صُممت لتوفير تجربة أكاديمية آمنة وسلسة.
              </p>
            </SpringReveal>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {features.map((feature, i) => (
                <FeatureCard key={i} {...feature} delay={i * 0.1} />
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════ STICKY STORY ════════════════════ */}
        <section className="relative py-20 md:py-32 bg-library-primary text-library-paper dark:bg-[#04060a]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 md:gap-24">
              {/* Sticky Visual */}
              <div className="relative">
                <SpringReveal className="lg:sticky lg:top-40">
                  <div className="w-full aspect-square bg-white/[0.03] rounded-3xl border border-white/[0.06] flex flex-col items-center justify-center p-10 md:p-16">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-library-accent/10 flex items-center justify-center mb-6 md:mb-8 border border-library-accent/20">
                      <Lock
                        className="text-library-accent w-8 h-8 md:w-10 md:h-10"
                        strokeWidth={1}
                      />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-3 text-center">
                      أمان أكاديمي
                    </h3>
                    <p className="text-library-paper/40 text-center text-sm md:text-base leading-relaxed max-w-xs font-medium">
                      نظام مغلق يضمن أن كل مستخدم هو طالب جامعي فعلي تم التحقق
                      من هويته لضمان سلامة التبادل.
                    </p>
                  </div>
                </SpringReveal>
              </div>

              {/* Story Steps */}
              <div className="flex flex-col justify-center space-y-24 md:space-y-40 py-10 md:py-20">
                <SpringReveal className="text-center lg:text-right">
                  <div className="inline-block px-4 py-1.5 bg-library-accent/10 text-library-accent font-bold mb-6 text-[10px] tracking-widest border border-library-accent/15 rounded">
                    01. التوثيق
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black mb-5 leading-tight">
                    بوابة الحرم الجامعي.
                  </h2>
                  <p className="text-base md:text-lg text-library-paper/40 leading-relaxed font-medium max-w-lg mx-auto lg:mr-0 lg:ml-0">
                    نحن نؤمن بالأمان قبل المعرفة.{" "}
                    <span className="text-library-accent font-bold">
                      كل حساب يخضع لمراجعة يدوية
                    </span>
                    ، لضمان بيئة أكاديمية نقية وخالية من الهويات المجهولة.
                  </p>
                </SpringReveal>

                <SpringReveal delay={0.1} className="text-center lg:text-right">
                  <div className="inline-block px-4 py-1.5 bg-library-accent/10 text-library-accent font-bold mb-6 text-[10px] tracking-widest border border-library-accent/15 rounded">
                    02. التبادل
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black mb-5 leading-tight">
                    التسليم الذكي (OTP).
                  </h2>
                  <p className="text-base md:text-lg text-library-paper/40 leading-relaxed font-medium max-w-lg mx-auto lg:mr-0 lg:ml-0">
                    نظام حماية متبادل. رمز الـ{" "}
                    <span className="text-library-accent font-bold">OTP</span>{" "}
                    لا يتم تبادله إلا عند اللقاء الفعلي داخل الجامعة، لضمان
                    استلام الكتاب وتوثيقه.
                  </p>
                </SpringReveal>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════ DIGITAL SHELF ════════════════════ */}
        <section className="py-20 md:py-32 bg-library-paper dark:bg-dark-bg overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {/* Header */}
            <SpringReveal className="flex flex-col md:flex-row justify-between items-center md:items-end mb-14 md:mb-20 pb-10 border-b border-library-primary/[0.06] dark:border-white/[0.06] gap-6 text-center md:text-right">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-library-primary dark:text-library-paper mb-3 tracking-tight">
                  الأرشيف الرقمي.
                </h2>
                <p className="text-library-primary/50 dark:text-gray-400 text-base md:text-lg font-medium">
                  تصفح عينة من المراجع المتوفرة حالياً لزملائك.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-library-primary/[0.04] dark:bg-white/[0.04] text-library-primary dark:text-white font-bold rounded-xl hover:bg-library-accent hover:text-white transition-all text-sm"
              >
                تصفح الأرشيف <Lock size={14} />
              </Link>
            </SpringReveal>

            {/* Book Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {books.map((book, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.6,
                    delay: idx * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group cursor-pointer"
                >
                  <Link
                    to="/login"
                    className="block w-full aspect-[3/4] bg-library-primary dark:bg-dark-surface rounded-2xl relative overflow-hidden flex flex-col justify-between p-7 md:p-8 card-lift"
                  >
                    <div className="text-library-paper/20 text-[10px] font-black uppercase tracking-[0.4em] relative z-10">
                      {book.cat}
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-lg md:text-xl font-black text-library-paper mb-1 leading-tight">
                        {book.title}
                      </h3>
                      <p className="text-library-accent font-bold text-xs tracking-wider">
                        {book.author}
                      </p>
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center z-20 backdrop-blur-[2px]">
                      <span className="bg-library-accent text-library-primary px-6 py-3 rounded-full text-xs font-black shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
                        سجّل الدخول للتصفح
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════ CONTACT ════════════════════ */}
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
