import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { identityApi } from "../services/api";

const EmailVerified = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [countdown, setCountdown] = useState(5);

  const verifiedRef = React.useRef(false);
  const timerRef = React.useRef(null);

  useEffect(() => {
    if (verifiedRef.current) return;

    const email = params.get("email")?.trim();
    // بعض البواك تبعت encodedToken بدل token.
    const tokenParam = params.get("token") || params.get("encodedToken");
    // استرجاع التوكن مع استبدال المسافات بعلامة + (لأن المتصفح قد يحول + إلى مسافة)
    const token = tokenParam?.replace(/ /g, "+");

    if (!email || !token) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      verifiedRef.current = true;
      try {
        await identityApi.confirmEmail(email, token);
        setStatus("success");
        // Start countdown for auto-redirect
        timerRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              timerRef.current = null;
              // Signal other tabs that verification was successful
              localStorage.setItem("email_verified_signal", Date.now().toString());
              navigate("/login", { replace: true });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err) {
        console.error("Verification failed details:", {
          status: err.status,
          message: err.message,
          detail: err.detail
        });
        setStatus("error");
      }
    };

    verify();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [params, navigate]);

  return (
    <div className="min-h-screen bg-library-paper dark:bg-dark-bg flex items-center justify-center p-6 relative overflow-hidden" dir="rtl">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-library-accent/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-library-primary/10 rounded-full blur-[120px] animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-dark-surface/80 backdrop-blur-xl border border-library-primary/10 dark:border-white/5 rounded-2xl p-8 shadow-2xl relative z-10 text-center"
      >
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8"
            >
              <div className="w-20 h-20 bg-library-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-8 relative">
                <Loader2 size={40} className="text-library-accent animate-spin" />
                <div className="absolute inset-0 bg-library-accent/20 blur-xl rounded-full animate-pulse" />
              </div>
              <h2 className="text-2xl font-black text-library-primary dark:text-white mb-4">
                جاري توثيق حسابك...
              </h2>
              <p className="text-library-primary/60 dark:text-gray-400 font-medium">
                انتظر لحظة، نقوم بالتأكد من صحة البيانات المرسلة.
              </p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4"
            >
              <div className="w-24 h-24 bg-emerald-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/20 relative">
                <ShieldCheck size={48} className="text-emerald-500" />
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1.2, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 border-2 border-emerald-500 rounded-[2rem]"
                />
              </div>
              
              <h2 className="text-2xl font-black text-library-primary dark:text-white mb-2">
                تم التفعيل بنجاح!
              </h2>
              <p className="text-library-primary/60 dark:text-gray-400 font-medium mb-10 leading-relaxed">
                تهانينا، بريدك الجامعي أصبح موثقاً الآن. <br />
                يمكنك الآن الوصول لكامل خدمات المنصة.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => navigate("/login", { replace: true })}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group"
                >
                  تسجيل الدخول الآن
                  <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                
                <p className="text-[11px] text-library-primary/40 dark:text-gray-500 font-bold">
                  سيتم تحويلك تلقائياً خلال {countdown} ثوانٍ...
                </p>
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4"
            >
              <div className="w-24 h-24 bg-red-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-500/20">
                <XCircle size={48} className="text-red-500" />
              </div>
              
              <h2 className="text-2xl font-black text-library-primary dark:text-white mb-4">
                رابط غير صالح!
              </h2>
              <p className="text-library-primary/60 dark:text-gray-400 font-medium mb-10 leading-relaxed">
                عذراً، يبدو أن الرابط المستخدم منتهي الصلاحية أو غير صحيح. حاول إعادة طلب رابط تفعيل جديد.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => navigate("/login", { replace: true })}
                  className="w-full bg-library-primary dark:bg-white text-library-paper dark:text-library-primary font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={18} />
                  العودة للرئيسية
                </button>
                
                <p className="text-[11px] text-library-primary/40 dark:text-gray-500 font-bold">
                  إذا كنت تواجه مشكلة، تواصل مع الدعم الفني.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 right-0 text-center opacity-20 dark:opacity-10">
        <p className="text-library-primary dark:text-white font-black tracking-widest text-xl">
          BOOKORBIT
        </p>
      </div>
    </div>
  );
};

export default EmailVerified;
