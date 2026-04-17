import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { BookMarked, ArrowUpLeft, Library, Lock, Send, Mail, Phone, MapPin, Globe, MessageSquare } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

// --- Spring Reveal Component ---
const SpringReveal = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-5% 0px -5% 0px" });
  
  return (
    <div
      ref={ref}
      className={`spring-reveal ${isInView ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};

// --- Contact Form Section ---
const ContactSection = () => {
  return (
    <section className="py-32 bg-library-primary dark:bg-[#04060a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <SpringReveal className="pt-8">
            <p className="text-library-accent text-xs font-bold uppercase tracking-[0.4em] mb-6">Get In Touch</p>
            <h2 className="text-4xl font-black text-white mb-6">تواصل معنا.</h2>
            <p className="text-lg text-white/50 mb-16 max-w-md font-medium leading-relaxed">
              هل لديك استفسار أو اقتراح لتطوير الأرشيف؟ فريقنا دائماً هنا للاستماع لطلابنا.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 rounded-2xl bg-library-accent/10 border border-library-accent/20 flex items-center justify-center text-library-accent"><Mail size={20} /></div>
                 <div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">البريد الإلكتروني</p>
                    <p className="text-white font-bold">support@tabaadol.edu</p>
                 </div>
              </div>
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 rounded-2xl bg-library-accent/10 border border-library-accent/20 flex items-center justify-center text-library-accent"><MapPin size={20} /></div>
                 <div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">الموقع</p>
                    <p className="text-white font-bold">الجامعات المصرية، القاهرة</p>
                 </div>
              </div>
            </div>
          </SpringReveal>

          <SpringReveal delay={0.2} className="bg-white/5 backdrop-blur-sm p-10 rounded-3xl border border-white/10">
             <form className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                   <input type="text" placeholder="الاسم" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 outline-none text-white placeholder-white/30 focus:border-library-accent/50 transition-colors text-sm" />
                   <input type="email" placeholder="البريد الإلكتروني" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 outline-none text-white placeholder-white/30 focus:border-library-accent/50 transition-colors text-sm" />
                </div>
                <input type="text" placeholder="الموضوع" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 outline-none text-white placeholder-white/30 focus:border-library-accent/50 transition-colors text-sm" />
                <textarea placeholder="رسالتك..." rows="5" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 outline-none text-white placeholder-white/30 focus:border-library-accent/50 transition-colors resize-none text-sm"></textarea>
                <button type="submit" className="w-full py-4 bg-library-accent text-library-primary font-black rounded-xl flex items-center justify-center gap-3 hover:bg-white transition-all group text-sm">
                   إرسال الرسالة <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
             </form>
          </SpringReveal>
        </div>
      </div>
    </section>
  );
};

// --- Balanced 3D Book (Fixed Animation) ---
const BookGraphic = () => (
  <div className="perspective-container">
    <div className="book-wrapper animate-ultimate-float">
      <div className="book-3d">
        <div className="book-spine"></div>
        <div className="book-block-page">
          <div className="flex flex-col h-full relative z-10">
            <div className="border-b border-library-primary/10 pb-2 md:pb-4 mb-2 md:mb-4">
              <h5 className="text-[8px] md:text-[10px] font-black text-library-primary mb-1 italic">الأرشيف الجامعي</h5>
              <div className="h-0.5 w-6 md:w-8 bg-library-accent"></div>
            </div>
            <p className="text-[7px] md:text-[9px] font-medium leading-relaxed md:leading-loose text-library-primary opacity-60">
              المعرفة هي الأمانة التي تزداد بالمشاركة. نحن نؤمن بأن كل طالب يمتلك مفتاحاً لنجاح زميل آخر. نظامنا صُمم ليكون جسراً آمناً يربط بين جامعات مصر...
            </p>
            <div className="mt-auto pt-2 flex justify-between items-center text-[7px] md:text-[8px] font-bold opacity-30 uppercase tracking-tighter">
              <span>Cairo Ed.</span>
              <span>P. 018</span>
            </div>
          </div>
        </div>
        
        <div className="book-cover-pivot">
          <div className="cover-front flex flex-col justify-between p-5 md:p-8">
            <div className="text-library-accent text-[8px] md:text-[10px] font-bold tracking-[0.3em] uppercase mb-2">Tabaadol</div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="w-8 md:w-10 h-0.5 bg-library-accent mb-4 md:mb-6 shadow-[0_0_15px_rgba(199,163,95,0.6)]"></div>
              <h2 className="text-xl md:text-3xl font-black text-library-paper leading-[1.1] tracking-tighter mb-2 md:mb-4">
                تاريخ <br/> <span className="text-library-accent">العمارة</span>
              </h2>
              <p className="text-library-paper/40 font-bold text-[7px] md:text-[9px] tracking-widest uppercase">Academic Reserve</p>
            </div>
            <div className="flex justify-between items-end opacity-40">
              <BookMarked size={20} className="text-white md:w-6 md:h-6" />
              <div className="text-[7px] md:text-[9px] font-bold text-white tracking-widest">VOL. IV</div>
            </div>
          </div>
          
          <div className="cover-back-page">
             <div className="w-full h-full border border-library-primary/5 p-4 md:p-6 flex flex-col justify-center text-center">
                <Library size={20} className="text-library-accent/40 mx-auto mb-2 md:mb-4" />
                <h5 className="text-[8px] md:text-[10px] font-bold text-library-primary mb-1 md:mb-2 italic">ميثاق الأمان</h5>
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

const Home = () => {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div className="bg-texture min-h-screen relative selection:bg-library-accent/30 overflow-hidden">
      <Navbar />

      <main className="relative z-10 pt-24">
        
        {/* === HERO SECTION === */}
        <section className="relative min-h-[85vh] lg:min-h-[80vh] flex items-center pt-24 pb-12 md:pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-12 md:gap-24 items-center">
            
            <motion.div style={{ y: yHero }} className="flex flex-col items-center lg:items-start z-10 text-center lg:text-right">
              <SpringReveal className="inline-flex items-center gap-2 px-3 py-1 bg-library-accent/10 text-library-accent font-bold text-[10px] uppercase tracking-widest mb-6 md:mb-10 border border-library-accent/20 rounded-full">
                Premier University Network
              </SpringReveal>
              
              <SpringReveal delay={0.1} className="mb-6 md:mb-8">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-library-primary dark:text-library-paper mb-2 tracking-tighter leading-tight">
                  المعرفة لا تُمتلك،
                </h1>
                <div className="flex items-center justify-center lg:justify-start gap-4 md:gap-6 mt-1">
                  <div className="h-1 md:h-1.5 w-12 md:w-16 bg-library-accent shadow-[0_0_15px_rgba(199,163,95,0.4)]"></div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-library-primary/20 dark:text-library-paper/20 italic tracking-tighter leading-tight">
                    بل تُمرر.
                  </h1>
                </div>
              </SpringReveal>

              <SpringReveal delay={0.2} className="text-base md:text-lg text-library-primary/70 dark:text-gray-400 max-w-md mb-10 md:mb-12 border-b-4 md:border-b-0 md:border-r-4 border-library-accent/50 pb-4 md:pb-0 md:pr-6 leading-relaxed font-medium">
                أرشيف رقمي يربط طلاب الجامعات في مصر. استعر الكتب التي تحتاجها مجاناً، وأودع مراجعك القديمة في مجتمعك الأكاديمي بأمان تام.
              </SpringReveal>
              
              <SpringReveal delay={0.3} className="w-full sm:w-auto">
                <Link to="/register" className="group flex items-center justify-center gap-4 text-library-paper bg-library-primary dark:bg-library-paper dark:text-library-primary px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 active:scale-95">
                  ابدأ الآن <ArrowUpLeft size={20} className="transform group-hover:-translate-y-1 group-hover:-translate-x-1 transition-transform" />
                </Link>
              </SpringReveal>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative z-10 flex justify-center py-8 md:py-0"
            >
              <div className="scale-75 sm:scale-90 md:scale-100">
                <BookGraphic />
              </div>
            </motion.div>
            
          </div>
        </section>

        {/* === STICKY SCROLL STORYTELLING === */}
        <section className="relative py-20 md:py-40 bg-library-primary text-library-paper dark:bg-[#04060a]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 md:gap-32">
              
              <div className="relative lg:h-[500px]">
                <SpringReveal className="lg:sticky lg:top-40 w-full aspect-square bg-library-paper/5 rounded-3xl border border-library-paper/10 flex flex-col items-center justify-center p-10 md:p-16 backdrop-blur-sm">
                   <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-library-accent/20 flex items-center justify-center mb-6 md:mb-8 border border-library-accent/30">
                      <Lock className="text-library-accent w-8 h-8 md:w-10 md:h-10" strokeWidth={1} />
                   </div>
                   <h3 className="text-2xl md:text-3xl font-black text-white mb-4">أمان أكاديمي</h3>
                   <p className="text-library-paper/50 text-center text-base md:text-lg leading-relaxed max-w-xs">
                     نظام مغلق يضمن أن كل مستخدم هو طالب جامعي فعلي تم التحقق من هويته لضمان سلامة التبادل.
                   </p>
                </SpringReveal>
              </div>

              <div className="flex flex-col justify-center space-y-32 md:space-y-72 py-10 md:py-32">
                <SpringReveal className="text-center lg:text-right">
                  <div className="inline-block px-4 py-1.5 bg-library-accent/10 text-library-accent font-bold mb-6 md:mb-8 text-[10px] tracking-widest border border-library-accent/20 rounded-sm">01. التوثيق</div>
                  <h2 className="text-3xl md:text-4xl font-black mb-6 md:mb-8 leading-tight">بوابة الحرم الجامعي.</h2>
                  <p className="text-lg md:text-xl text-library-paper/50 leading-relaxed font-light max-w-lg mx-auto lg:mr-0 lg:ml-0">
                    نحن نؤمن بالأمان قبل المعرفة. <span className="text-library-accent font-bold">كل حساب يخضع لمراجعة يدوية</span>، لضمان بيئة أكاديمية نقية وخالية من الهويات المجهولة.
                  </p>
                </SpringReveal>
                
                <SpringReveal className="text-center lg:text-right">
                  <div className="inline-block px-4 py-1.5 bg-library-accent/10 text-library-accent font-bold mb-6 md:mb-8 text-[10px] tracking-widest border border-library-accent/20 rounded-sm">02. التبادل</div>
                  <h2 className="text-3xl md:text-4xl font-black mb-6 md:mb-8 leading-tight">التسليم الذكي (OTP).</h2>
                  <p className="text-lg md:text-xl text-library-paper/50 leading-relaxed font-light max-w-lg mx-auto lg:mr-0 lg:ml-0">
                    نظام حماية متبادل. رمز الـ <span className="text-library-accent font-bold">OTP</span> لا يتم تبادله إلا عند اللقاء الفعلي داخل الجامعة، لضمان استلام الكتاب وتوثيقه.
                  </p>
                </SpringReveal>
              </div>
            </div>
          </div>
        </section>

        {/* === THE DIGITAL SHELF === */}
        <section className="py-20 md:py-40 bg-library-paper dark:bg-dark-bg overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <SpringReveal className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 md:mb-24 border-b border-library-primary/10 dark:border-white/10 pb-12 gap-8 md:gap-10 text-center md:text-right">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-library-primary dark:text-library-paper mb-4 italic">الأرشيف الرقمي.</h2>
                <p className="text-library-primary/60 dark:text-gray-400 text-lg md:text-xl font-medium">تصفح عينة من المراجع المتوفرة حالياً لزملائك.</p>
              </div>
              <Link to="/login" className="w-full md:w-auto px-6 py-3 bg-library-primary/5 dark:bg-white/5 text-library-primary dark:text-white font-bold rounded-xl hover:bg-library-accent hover:text-white transition-all text-sm flex items-center justify-center gap-3">
                تصفح الأرشيف <Lock size={16} />
              </Link>
            </SpringReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {[
                { title: 'الفيزياء الجامعية', author: 'سيرواي', cat: 'علوم' },
                { title: 'الاقتصاد الجزئي', author: 'مانكيو', cat: 'إدارة' },
                { title: 'هياكل البيانات', author: 'سيدجويك', cat: 'حاسبات' },
                { title: 'علم الأدوية', author: 'ليبينكوت', cat: 'طب' },
              ].map((book, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, rotateY: -15, scale: 0.9, filter: 'blur(8px)' }}
                  whileInView={{ opacity: 1, rotateY: 0, scale: 1, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="group cursor-pointer"
                  style={{ perspective: '800px' }}
                >
                  <Link to="/login" className="block w-full aspect-[3/4] bg-library-primary dark:bg-dark-surface rounded-3xl relative overflow-hidden flex flex-col justify-between p-8 shadow-xl transition-shadow duration-500 group-hover:shadow-[0_20px_60px_rgba(199,163,95,0.2)]">
                    <div className="text-library-paper/30 text-[10px] font-black uppercase tracking-[0.4em] relative z-10">{book.cat}</div>
                    <div className="relative z-10">
                      <h3 className="text-xl md:text-2xl font-black text-library-paper mb-1 leading-tight">{book.title}</h3>
                      <p className="text-library-accent font-bold text-xs tracking-widest">{book.author}</p>
                    </div>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                      <span className="bg-library-accent text-white px-8 py-4 rounded-full text-xs md:text-sm font-black shadow-lg">
                         سجّل الدخول للتصفح
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <ContactSection />

      </main>

      <Footer />
    </div>
  );
};

export default Home;
