import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic
  };

  return (
    <div className="min-h-screen flex bg-library-paper dark:bg-dark-bg transition-colors duration-300">
      
      {/* Right Side (Form) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <Link to="/" className="text-library-primary dark:text-library-paper hover:text-library-accent transition-colors flex items-center gap-2 mb-12 w-fit">
          <ArrowRight size={20} /> العودة للأرشيف
        </Link>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-md w-full mx-auto">
          <h2 className="text-4xl font-black text-library-primary dark:text-white mb-2">مرحباً بعودتك.</h2>
          <p className="text-library-primary/60 dark:text-gray-400 mb-10">سجل دخولك لمتابعة كتبك المستعارة أو لإضافة مراجع جديدة للمكتبة.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-library-primary dark:text-gray-300 mb-2">البريد الجامعي</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-dark-surface border border-library-primary/20 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-library-accent dark:text-white transition-all"
                placeholder="student@university.edu"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-bold text-library-primary dark:text-gray-300">كلمة المرور</label>
                <a href="#" className="text-sm font-bold text-library-accent hover:text-library-primary dark:hover:text-white transition-colors">نسيت الرمز؟</a>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-dark-surface border border-library-primary/20 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-library-accent dark:text-white transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-library-primary dark:bg-white text-library-paper dark:text-library-primary font-bold py-4 rounded-lg shadow-lg hover:shadow-xl hover:bg-library-accent dark:hover:bg-library-accent transition-all duration-300"
            >
              دخول للأرشيف
            </button>
          </form>
          
          <div className="mt-8 text-center text-library-primary/60 dark:text-gray-400">
            طالب جديد؟ <Link to="/register" className="font-bold text-library-accent hover:underline">وثق حسابك الآن</Link>
          </div>
        </motion.div>
      </div>

      {/* Left Side (Visual) */}
      <div className="hidden lg:flex w-1/2 bg-library-primary dark:bg-[#050505] relative overflow-hidden items-center justify-center p-12 border-r border-library-accent/20">
        <div className="absolute inset-0 bg-texture opacity-50"></div>
        
        <div className="relative z-10 max-w-lg text-center">
          <BookOpen size={64} className="text-library-accent mx-auto mb-8" strokeWidth={1} />
          <h2 className="text-3xl md:text-4xl font-black text-library-paper mb-6 leading-relaxed">
            "المكتبة هي المستشفى الوحيد للروح."
          </h2>
          <div className="w-16 h-1 bg-library-accent mx-auto mb-6"></div>
          <p className="text-library-paper/60 font-medium">شارك في بناء أكبر مكتبة جامعية تعاونية.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
