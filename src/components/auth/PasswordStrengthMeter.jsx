import React from "react";
import { motion } from "framer-motion";

const PasswordStrengthMeter = ({ password }) => {
  if (!password) return null;

  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[@$!%*?&]/.test(pass)) score += 1;
    return score;
  };

  const score = calculateStrength(password);

  const getStrengthData = () => {
    if (score <= 2)
      return {
        label: "ضعيفة",
        textColor: "text-red-500",
        activeStep: 1,
        color: "bg-red-500",
      };
    if (score <= 4)
      return {
        label: "متوسطة",
        textColor: "text-yellow-500",
        activeStep: 2,
        color: "bg-yellow-500",
      };
    return {
      label: "قوية جداً",
      textColor: "text-green-500",
      activeStep: 3,
      color: "bg-green-500",
    };
  };

  const { label, textColor, activeStep, color } = getStrengthData();

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-2"
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-bold text-library-primary/60 dark:text-gray-400">
          قوة كلمة المرور:
        </span>
        <span className={`text-[10px] font-bold ${textColor}`}>{label}</span>
      </div>
      <div className="h-1.5 w-full bg-library-primary/10 dark:bg-gray-700 rounded-full flex gap-1">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`h-full flex-1 rounded-full transition-all duration-500 ${
              step <= activeStep ? color : "bg-transparent"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default PasswordStrengthMeter;
