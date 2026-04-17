import React from 'react';
import { Link } from 'react-router-dom';
import { Library, Globe, Mail, MessageSquare } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0a1526] pt-20 pb-10 border-t border-library-accent/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
         <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div>
               <div className="flex items-center gap-3 mb-6">
                  <Library size={28} className="text-library-accent" strokeWidth={1.5} />
                  <span className="text-xl font-black tracking-tighter text-white">تبادل TABAADOL</span>
               </div>
               <p className="text-gray-400 max-w-sm font-medium leading-relaxed text-sm">
                 أول منصة مصرية متخصصة في تبادل المراجع والكتب بين طلاب الجامعات في بيئة أكاديمية آمنة وموثقة.
               </p>
            </div>
            <div className="flex flex-col items-end gap-6">
               <p className="text-white/30 text-xs font-bold uppercase tracking-widest">تابعنا</p>
               <div className="flex gap-5">
                  <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-library-accent hover:border-library-accent/30 transition-all"><MessageSquare size={18} /></a>
                  <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-library-accent hover:border-library-accent/30 transition-all"><Globe size={18} /></a>
                  <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-library-accent hover:border-library-accent/30 transition-all"><Mail size={18} /></a>
               </div>
            </div>
         </div>
         
         <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">
              © 2024 Tabaadol Platform. All rights reserved.
            </p>
            <div className="flex gap-8">
               <Link to="/" className="text-gray-600 text-[10px] font-bold uppercase hover:text-library-accent transition-colors">Privacy Policy</Link>
               <Link to="/" className="text-gray-600 text-[10px] font-bold uppercase hover:text-library-accent transition-colors">Terms of Service</Link>
            </div>
         </div>
      </div>
    </footer>
  );
};

export default Footer;
