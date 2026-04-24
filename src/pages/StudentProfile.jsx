import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  ShieldCheck, 
  Camera, 
  ShieldAlert,
  Loader2,
  Lock,
  ChevronLeft,
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { identityApi } from "../services/api";
import Navbar from "../components/common/Navbar";

const ProfileField = ({ icon: Icon, label, value, color = "indigo" }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50/80 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 group hover:border-indigo-500/30 transition-all">
    <div className={`w-9 h-9 rounded-xl bg-${color}-500/10 flex items-center justify-center text-${color}-500`}>
      <Icon size={16} />
    </div>
    <div className="flex-grow min-w-0">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-library-primary dark:text-gray-200 truncate">{value || "غير مسجل"}</p>
    </div>
  </div>
);

const StudentProfile = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("info"); // info | security

  const handleVerifyEmail = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      await identityApi.sendEmailConfirmation(user.email);
      toast.success("تم إرسال رابط التفعيل لبريدك الجامعي");
    } catch (error) {
      toast.error(error.message || "فشل إرسال رابط التفعيل");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-library-paper dark:bg-[#08080a] pt-20 lg:pt-24 pb-12" dir="rtl">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-2xl bg-white/70 dark:bg-[#121214]/70 border border-white dark:border-white/5 p-5 sm:p-6 shadow-sm">
          <div>
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black bg-library-accent/10 text-library-accent border border-library-accent/20 mb-3">
              <Sparkles size={12} />
              الهوية الرقمية
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-library-primary dark:text-white tracking-tight flex items-center gap-2.5">
              الملف الشخصي
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mt-2">إدارة بياناتك الأكاديمية وإعدادات الأمان بطريقة احترافية.</p>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => setActiveSection("info")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all border ${activeSection === 'info' ? 'bg-library-primary text-white border-library-primary shadow-md' : 'bg-white dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/5'}`}
            >
              البيانات الشخصية
            </button>
            <button 
              onClick={() => setActiveSection("security")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all border ${activeSection === 'security' ? 'bg-library-primary text-white border-library-primary shadow-md' : 'bg-white dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/5'}`}
            >
              الأمان والخصوصية
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Identity Card */}
          <div className="lg:col-span-5 space-y-5">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-[#121214]/80 backdrop-blur-xl rounded-2xl p-6 border border-white dark:border-white/5 shadow-sm text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-library-primary via-indigo-500 to-library-accent" />
              
              <div className="relative w-24 h-24 mx-auto mb-4 group">
                <div className="w-full h-full rounded-[2rem] overflow-hidden bg-gray-100 dark:bg-white/5 border-2 border-white dark:border-white/10 shadow-xl">
                  {user?.image ? (
                    <img src={user.image} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-library-primary/10 text-4xl font-black">
                      {user?.fullName?.charAt(0)}
                    </div>
                  )}
                </div>
                <button className="absolute -bottom-1 -left-1 w-8 h-8 rounded-xl bg-white dark:bg-library-primary text-library-primary dark:text-white shadow-lg flex items-center justify-center border border-gray-100 dark:border-white/10 hover:scale-110 transition-transform">
                  <Camera size={14} />
                </button>
              </div>

              <h2 className="text-xl font-black text-library-primary dark:text-white mb-1">{user?.fullName}</h2>
              <p className="text-[11px] font-bold text-library-accent uppercase tracking-widest mb-4">{user?.role || "طالب جامعي"}</p>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black border bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {user?.status === "active" ? "حساب موثق" : user?.status === "approved" ? "بانتظار التفعيل" : "بانتظار التوثيق"}
              </div>
              
              {user?.role?.toLowerCase() !== 'admin' && (
                <div className="flex items-center justify-center gap-4 py-3 border-t border-gray-50 dark:border-white/5 mt-4">
                  <div className="text-center">
                    <p className="text-[14px] font-black text-library-primary dark:text-white">12</p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase">كتاب مستعار</p>
                  </div>
                  <div className="w-px h-6 bg-gray-100 dark:bg-white/5" />
                  <div className="text-center">
                    <p className="text-[14px] font-black text-library-primary dark:text-white">5</p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase">كتبي الخاصة</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Email Verification Status */}
            {user?.status === "pending" && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-600 mb-1">البريد غير مؤكد</h4>
                  <p className="text-[10px] text-amber-600/70 font-bold mb-3 leading-relaxed">يرجى توثيق بريدك الجامعي لتتمكن من تفعيل حسابك.</p>
                  <button 
                    onClick={handleVerifyEmail}
                    disabled={loading}
                    className="px-3 py-2 rounded-lg bg-amber-500 text-white text-xs font-black shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={10} className="animate-spin" /> : <Mail size={10} />}
                    إرسال رابط التفعيل
                  </button>
                </div>
              </motion.div>
            )}

            {user?.status === "approved" && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 flex gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 flex-shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-indigo-600 mb-1">بانتظار مراجعة الإدارة</h4>
                  <p className="text-[10px] text-indigo-600/70 font-bold leading-relaxed">لقد قمت بتأكيد بريدك الإلكتروني بنجاح. حسابك الآن قيد المراجعة من قبل إدارة المكتبة لتفعيل الصلاحيات الكاملة.</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {activeSection === "info" ? (
                <motion.div 
                  key="info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white/60 dark:bg-[#121214]/60 backdrop-blur-xl rounded-2xl p-6 border border-white dark:border-white/5 shadow-sm">
                    <h3 className="text-base font-black text-library-primary dark:text-white mb-5 flex items-center gap-2">
                      <ShieldCheck className="text-indigo-500" size={16} />
                      معلومات الحساب
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ProfileField icon={User} label="الاسم الكامل" value={user?.fullName} />
                      <ProfileField icon={Mail} label="البريد الإلكتروني" value={user?.email} />
                      {user?.role?.toLowerCase() !== 'admin' ? (
                        <>
                          <ProfileField icon={Phone} label="رقم الهاتف" value={user?.phoneNumber} />
                          <ProfileField icon={GraduationCap} label="التخصص الأكاديمي" value={user?.major} />
                        </>
                      ) : (
                        <>
                          <ProfileField icon={ShieldCheck} label="الصلاحية" value="مدير النظام" color="amber" />
                          <ProfileField icon={Lock} label="الحالة" value="نشط" color="emerald" />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/60 dark:bg-[#121214]/60 backdrop-blur-xl rounded-2xl p-6 border border-white dark:border-white/5 shadow-sm">
                    <h3 className="text-base font-black text-library-primary dark:text-white mb-5">النشاط الأخير</h3>
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-400 font-bold italic">لا يوجد نشاط مسجل مؤخراً.</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white/60 dark:bg-[#121214]/60 backdrop-blur-xl rounded-2xl p-6 border border-white dark:border-white/5 shadow-sm">
                    <h3 className="text-base font-black text-library-primary dark:text-white mb-5 flex items-center gap-2">
                      <Lock className="text-rose-500" size={16} />
                      كلمة المرور
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                      <div>
                        <p className="text-sm font-black text-rose-600 mb-1">تحديث كلمة المرور</p>
                        <p className="text-[10px] text-rose-600/60 font-bold">ننصح بتغيير كلمة المرور بشكل دوري لضمان أمان حسابك.</p>
                      </div>
                      <button className="px-5 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all">
                        تغيير الآن
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/60 dark:bg-[#121214]/60 backdrop-blur-xl rounded-2xl p-6 border border-white dark:border-white/5 shadow-sm">
                    <h3 className="text-sm font-black text-rose-500 mb-5">منطقة الخطر</h3>
                    <button 
                      onClick={logout}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-rose-500/20 text-rose-500 text-sm font-black hover:bg-rose-500 hover:text-white transition-all group"
                    >
                      تسجيل الخروج من الحساب
                      <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
