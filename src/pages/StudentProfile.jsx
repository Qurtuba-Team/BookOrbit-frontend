import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { 
  User, 
  Mail,
  Phone, 
  GraduationCap, 
  ShieldCheck, 
  Camera, 
  Lock,
  ChevronLeft,
  BadgeCheck,
  Save,
  PencilLine,
  X,
  Loader2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/common/Navbar";
import { studentsApi } from "../services/api";

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
  const { user, logout, refreshProfile } = useAuth();
  const [activeSection, setActiveSection] = useState("info"); // info | security
  const profileCompletion = user?.phoneNumber && user?.major ? 92 : 72;
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    major: "",
  });

  useEffect(() => {
    setForm({
      fullName: user?.fullName || user?.Name || "",
      phoneNumber: user?.phoneNumber || user?.PhoneNumber || "",
      major: user?.major || user?.Major || "",
    });
  }, [user]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user?.studentId) {
      toast.error("تعذر تحديد حساب الطالب.");
      return;
    }
    if (!form.fullName.trim()) {
      toast.error("الاسم الكامل مطلوب");
      return;
    }
    if (form.phoneNumber && !/^\+?[0-9\s\-()]{8,20}$/.test(form.phoneNumber.trim())) {
      toast.error("صيغة رقم الهاتف غير صحيحة");
      return;
    }
    setSaving(true);
    const t = toast.loading("جاري حفظ البيانات...");
    try {
      const data = new FormData();
      data.append("Name", form.fullName.trim());
      data.append("PhoneNumber", form.phoneNumber.trim());
      data.append("Major", form.major.trim());
      await studentsApi.update(user.studentId, data);
      await refreshProfile?.();
      setEditing(false);
      toast.success("تم تحديث البيانات بنجاح", { id: t });
    } catch (err) {
      toast.error(err?.message || "تعذر تحديث البيانات", { id: t });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-library-paper dark:bg-[#08080a] pt-20 lg:pt-24 pb-12" dir="rtl">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl bg-white/75 dark:bg-[#121214]/75 border border-white dark:border-white/5 p-5 sm:p-7 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-library-primary dark:text-white tracking-tight flex items-center gap-2.5">
                الملف الشخصي
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mt-2">إدارة بياناتك الأكاديمية وإعدادات الأمان بطريقة احترافية.</p>
            </div>

          </div>

          <div className="flex gap-2 mt-5 flex-wrap">
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
          <div className="lg:col-span-4 space-y-5">
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

              <h2 className="text-xl font-black text-library-primary dark:text-white mb-1">{user?.fullName || "مستخدم"}</h2>
              <p className="text-[11px] font-bold text-library-accent uppercase tracking-widest mb-4">{user?.role || "طالب جامعي"}</p>

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

            <div className="bg-white/70 dark:bg-[#121214]/70 rounded-2xl p-4 border border-white dark:border-white/5 shadow-sm">
              <h3 className="text-sm font-black text-library-primary dark:text-white mb-3">مؤشرات سريعة</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between rounded-xl px-3 py-2 bg-gray-50 dark:bg-white/5">
                  <p className="text-xs font-black text-gray-500">إكمال البيانات</p>
                  <p className="text-xs font-black text-library-primary dark:text-white">{profileCompletion}%</p>
                </div>
                <div className="flex items-center justify-between rounded-xl px-3 py-2 bg-gray-50 dark:bg-white/5">
                  <p className="text-xs font-black text-gray-500">آخر تسجيل دخول</p>
                  <p className="text-xs font-black text-library-primary dark:text-white">اليوم</p>
                </div>
                <div className="flex items-center justify-between rounded-xl px-3 py-2 bg-gray-50 dark:bg-white/5">
                  <p className="text-xs font-black text-gray-500">الأمان</p>
                  <p className="text-xs font-black text-emerald-600">ممتاز</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-8">
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
                    <div className="mb-4 rounded-xl p-3 bg-library-accent/5 border border-library-accent/15">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black text-library-accent">نسبة اكتمال الملف</p>
                        <p className="text-[10px] font-black text-library-primary dark:text-white">{profileCompletion}%</p>
                      </div>
                      <div className="h-2 rounded-full bg-library-accent/15 overflow-hidden">
                        <div className="h-full bg-library-accent rounded-full transition-all duration-500" style={{ width: `${profileCompletion}%` }} />
                      </div>
                    </div>
                    {!isAdmin && (
                      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
                        {!editing ? (
                          <button
                            type="button"
                            onClick={() => setEditing(true)}
                            className="inline-flex items-center gap-2 rounded-xl border border-library-primary/15 bg-library-primary/5 px-4 py-2 text-xs font-black text-library-primary transition-all hover:border-library-accent/35 hover:text-library-accent dark:border-white/10 dark:bg-white/5 dark:text-white"
                          >
                            <PencilLine size={14} />
                            تعديل البيانات
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditing(false);
                                setForm({
                                  fullName: user?.fullName || user?.Name || "",
                                  phoneNumber: user?.phoneNumber || user?.PhoneNumber || "",
                                  major: user?.major || user?.Major || "",
                                });
                              }}
                              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-black text-gray-600 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
                            >
                              <X size={14} />
                              إلغاء
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveProfile}
                              disabled={saving}
                              className="inline-flex items-center gap-2 rounded-xl bg-library-primary px-4 py-2 text-xs font-black text-white shadow-md transition-all hover:bg-library-accent disabled:opacity-70 dark:bg-white dark:text-library-primary dark:hover:bg-library-accent dark:hover:text-white"
                            >
                              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                              {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {!editing || isAdmin ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ProfileField icon={User} label="الاسم الكامل" value={user?.fullName} />
                        <ProfileField icon={Mail} label="البريد الإلكتروني" value={user?.email} />
                        {!isAdmin ? (
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
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-[11px] font-black text-library-primary/60 dark:text-gray-300">الاسم الكامل</label>
                          <input
                            name="fullName"
                            value={form.fullName}
                            onChange={handleEditChange}
                            className="w-full rounded-xl border border-library-primary/10 bg-white px-4 py-3 text-sm font-bold text-library-primary outline-none transition-all focus:border-library-accent/40 focus:ring-2 focus:ring-library-accent/20 dark:border-white/10 dark:bg-dark-surface dark:text-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-library-primary/60 dark:text-gray-300">رقم الهاتف</label>
                          <input
                            name="phoneNumber"
                            value={form.phoneNumber}
                            onChange={handleEditChange}
                            placeholder="مثال: 01012345678"
                            className="w-full rounded-xl border border-library-primary/10 bg-white px-4 py-3 text-sm font-bold text-library-primary outline-none transition-all focus:border-library-accent/40 focus:ring-2 focus:ring-library-accent/20 dark:border-white/10 dark:bg-dark-surface dark:text-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-library-primary/60 dark:text-gray-300">التخصص الأكاديمي</label>
                          <input
                            name="major"
                            value={form.major}
                            onChange={handleEditChange}
                            placeholder="مثال: هندسة برمجيات"
                            className="w-full rounded-xl border border-library-primary/10 bg-white px-4 py-3 text-sm font-bold text-library-primary outline-none transition-all focus:border-library-accent/40 focus:ring-2 focus:ring-library-accent/20 dark:border-white/10 dark:bg-dark-surface dark:text-white"
                          />
                        </div>
                        <div className="md:col-span-2 rounded-xl border border-library-accent/20 bg-library-accent/5 px-3 py-2">
                          <p className="text-[11px] font-bold text-library-primary/70 dark:text-gray-300">
                            البريد الإلكتروني لا يمكن تعديله من هذه الصفحة.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="bg-white/60 dark:bg-[#121214]/60 backdrop-blur-xl rounded-2xl p-6 border border-white dark:border-white/5 shadow-sm">
                    <h3 className="text-base font-black text-library-primary dark:text-white mb-5">النشاط الأخير</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-white/5 p-3 bg-gray-50/60 dark:bg-white/[0.03]">
                        <div className="flex items-center gap-2">
                          <BadgeCheck size={14} className="text-emerald-500" />
                          <p className="text-sm font-black text-library-primary dark:text-white">تحديث بيانات الحساب</p>
                        </div>
                        <span className="text-[11px] font-black text-gray-400">اليوم</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-white/5 p-3 bg-gray-50/60 dark:bg-white/[0.03]">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={14} className="text-amber-500" />
                          <p className="text-sm font-black text-library-primary dark:text-white">مراجعة تفضيلات الأمان</p>
                        </div>
                        <span className="text-[11px] font-black text-gray-400">اليوم</span>
                      </div>
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
                      <Link to="/change-password" className="px-5 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all inline-flex items-center justify-center">
                        تغيير الآن
                      </Link>
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
