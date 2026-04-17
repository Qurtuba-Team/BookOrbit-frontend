import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    agreeToTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen flex flex-row-reverse bg-library-paper dark:bg-dark-bg transition-colors duration-300">
      
      {/* Left Side (Form - Arabic Right) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 overflow-y-auto">
        <Link to="/" className="text-library-primary dark:text-library-paper hover:text-library-accent transition-colors flex items-center gap-2 mb-8 w-fit">
          <ArrowLeft size={20} /> العودة للأرشيف
        </Link>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-black text-library-primary dark:text-white mb-2">توثيق طالب جديد.</h2>
          <p className="text-library-primary/60 dark:text-gray-400 mb-8">عملية التوثيق تتم يدوياً لضمان بيئة جامعية آمنة.</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-library-primary dark:text-gray-300 mb-2">الاسم الرباعي (كما في البطاقة الجامعية)</label>
              <input 
                type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-dark-surface border border-library-primary/20 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-library-accent dark:text-white transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-library-primary dark:text-gray-300 mb-2">البريد الجامعي الرسمي</label>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-dark-surface border border-library-primary/20 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-library-accent dark:text-white transition-all text-left"
                  dir="ltr"
                  placeholder="name@student.edu.eg" required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-library-primary dark:text-gray-300 mb-2">رقم الهاتف النشط</label>
                <input 
                  type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-dark-surface border border-library-primary/20 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-library-accent dark:text-white transition-all"
                  dir="ltr" required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-library-primary dark:text-gray-300 mb-2">الرقم السري</label>
              <input 
                type="password" name="password" value={formData.password} onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-dark-surface border border-library-primary/20 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-library-accent dark:text-white transition-all"
                required
              />
            </div>

            <div className="flex items-start gap-3 mt-4">
              <input 
                type="checkbox" id="terms" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange}
                className="mt-1 w-4 h-4 text-library-primary border-library-primary/20 rounded focus:ring-library-accent" required
              />
              <label htmlFor="terms" className="text-sm text-library-primary/70 dark:text-gray-400">
                أقر بصحة بياناتي وأوافق على <a href="#" className="font-bold text-library-accent hover:underline">ميثاق شرف المنصة</a>، وأتعهد بالمحافظة على الكتب المعارة لي.
              </label>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-library-primary dark:bg-white text-library-paper dark:text-library-primary font-bold py-4 rounded-lg shadow-lg hover:shadow-xl hover:bg-library-accent dark:hover:bg-library-accent transition-all duration-300 mt-2"
            >
              إرسال طلب التوثيق
            </button>
          </form>
          
          <div className="mt-8 text-center text-library-primary/60 dark:text-gray-400">
            لديك حساب موثق؟ <Link to="/login" className="font-bold text-library-accent hover:underline">تسجيل الدخول</Link>
          </div>
        </motion.div>
      </div>

      {/* Right Side (Visual - Arabic Left) */}
      <div className="hidden lg:flex w-1/2 bg-library-primary dark:bg-[#050505] relative overflow-hidden items-center justify-center p-12 border-l border-library-accent/20">
        <div className="absolute inset-0 bg-texture opacity-50"></div>
        
        <div className="relative z-10 max-w-lg text-white">
          <h2 className="text-4xl font-black mb-8 leading-tight">بناء مجتمع<br/>جامعي موثوق.</h2>
          <div className="space-y-6 bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-library-accent shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg mb-1">توثيق يدوي صارم</h4>
                <p className="text-library-paper/60 text-sm leading-relaxed">تتم مراجعة البطاقات الجامعية للطلبة المسجلين لضمان بيئة خالية من الغرباء.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 shrink-0 flex items-center justify-center mt-1">
                <div className="w-3 h-3 bg-library-accent rounded-full"></div>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">نظام OTP المتبادل</h4>
                <p className="text-library-paper/60 text-sm leading-relaxed">تستلم رمزاً سرياً لتعطيه لزميلك عند استلام الكتاب كإثبات رسمي لعملية الإعارة.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
