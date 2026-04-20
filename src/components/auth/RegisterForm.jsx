import React, { useState } from "react";
import { Camera, Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { identityApi } from "../../services/api";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

const RegisterForm = ({ switchMode, onSuccess }) => {
  const { register } = useAuth();

  const [registerData, setRegisterData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    registerConfirmPassword: "",
    telegramUserId: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] =
    useState(false);

  const validateEmail = (email) => {
    const universityEmailRegex = /^[^\s@]+@(std\.mans\.edu\.eg|mans\.edu\.eg)$/;
    return universityEmailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^01[0125][0-9]{8}$/;
    return phoneRegex.test(phone);
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "email":
      case "UniversityMailAddress":
        if (!value) {
          error = "البريد الجامعي مطلوب";
        } else if (!validateEmail(value)) {
          error =
            "يجب استخدام البريد الجامعي (@std.mans.edu.eg أو @mans.edu.eg)";
        }
        break;
      case "password":
      case "Password":
        if (!value) {
          error = "كلمة المرور مطلوبة";
        } else if (!validatePassword(value)) {
          error =
            "يجب أن تحتوي على 6 أحرف على الأقل، حرف كبير، حرف صغير، رقم، ورمز خاص";
        }
        break;
      case "name":
      case "Name":
        if (!value || value.trim().length < 4) {
          error = "الاسم يجب أن يكون 4 أحرف على الأقل";
        }
        break;
      case "phone":
      case "PhoneNumber":
        if (!value) {
          error = "رقم الهاتف مطلوب";
        } else if (!validatePhone(value)) {
          error =
            "رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 010 أو 011 أو 012 أو 015";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalVal = type === "checkbox" ? checked : value;

    if (name === "phone" && typeof value === "string") {
      // فقط السماح بالأرقام
      finalVal = value.replace(/\D/g, "");
    } else if (name === "telegramUserId" && finalVal && !finalVal.startsWith("@")) {
      finalVal = "@" + finalVal;
    }

    setRegisterData((p) => ({ ...p, [name]: finalVal }));

    if (["email", "password", "name", "phone", "registerConfirmPassword"].includes(name)) {
      const errorKey =
        name === "email"
          ? "UniversityMailAddress"
          : name === "password"
            ? "Password"
            : name === "registerConfirmPassword"
              ? "registerConfirmPassword"
              : name.charAt(0).toUpperCase() + name.slice(1);

      let validationError = validateField(name, finalVal);
      if (name === "registerConfirmPassword" && finalVal !== registerData.password) {
        validationError = "كلمتا المرور غير متطابقتين";
      } else if (name === "password" && registerData.registerConfirmPassword && finalVal !== registerData.registerConfirmPassword) {
        setErrors((p) => ({ ...p, registerConfirmPassword: "كلمتا المرور غير متطابقتين" }));
      } else if (name === "password" && registerData.registerConfirmPassword && finalVal === registerData.registerConfirmPassword) {
         setErrors((p) => {
          const newErrors = { ...p };
          delete newErrors.registerConfirmPassword;
          return newErrors;
        });
      }
      setErrors((p) => ({
        ...p,
        [errorKey]: validationError,
      }));

      if (validationError === "") {
        setErrors((p) => {
          const newErrors = { ...p };
          delete newErrors[errorKey];
          return newErrors;
        });
      }
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("الرجاء اختيار ملف صورة صالح");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن يكون أقل من 5MB");
        return;
      }
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
      setErrors((p) => ({ ...p, PersonalPhoto: "" }));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const newErrors = {};
    if (!registerData.name || registerData.name.trim().length < 4) {
      newErrors.Name = "الاسم يجب أن يكون 4 أحرف على الأقل";
    }
    if (!registerData.email || !validateEmail(registerData.email)) {
      newErrors.UniversityMailAddress =
        "يجب استخدام البريد الجامعي (@std.mans.edu.eg أو @mans.edu.eg)";
    }
    if (!registerData.password || !validatePassword(registerData.password)) {
      newErrors.Password =
        "يجب أن تحتوي على 6 أحرف على الأقل، حرف كبير، حرف صغير، رقم، ورمز خاص";
    }
    if (registerData.password !== registerData.registerConfirmPassword) {
      newErrors.registerConfirmPassword = "كلمتا المرور غير متطابقتين";
    }
    if (!registerData.phone || !validatePhone(registerData.phone)) {
      newErrors.PhoneNumber =
        "رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 010 أو 011 أو 012 أو 015";
    }
    if (!registerData.agreeToTerms) {
      newErrors.agreeToTerms = "يجب الموافقة على ميثاق الشرف";
    }
    if (!photo) {
      newErrors.PersonalPhoto = "الصورة الشخصية مطلوبة";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      toast.error(Object.values(newErrors)[0]);
      return;
    }

    const formData = new FormData();
    formData.append("Name", registerData.name.trim());
    formData.append("PhoneNumber", registerData.phone.trim());
    formData.append(
      "TelegramUserId",
      registerData.telegramUserId?.trim() || "",
    );
    if (photo) {
      formData.append("PersonalPhoto", photo);
    }
    formData.append("UniversityMailAddress", registerData.email.trim());
    formData.append("Password", registerData.password);

    try {
      const result = await register(formData);

      if (result.success && result.userId) {
        try {
          await identityApi.sendEmailConfirmation(registerData.email);
          toast.success("تم تسجيل بياناتك بنجاح! افحص بريدك الجامعي.");
          onSuccess(registerData.email);
        } catch (emailError) {
          console.error("Email confirmation error:", emailError);
          toast.success("تم التسجيل بنجاح! سيتم إرسال بريد التأكيد لاحقاً.");
          onSuccess(registerData.email);
        } finally {
          setIsLoading(false);
        }
      } else if (!result.success) {
        throw {
          status: result.status,
          detail: result.error,
          errors: result.errors,
        };
      }
    } catch (err) {
      setIsLoading(false);

      const statusCode = err.status || 500;
      const serverMessage = err.detail || err.message || "حدث خطأ غير متوقع";
      const fieldErrors = err.errors;

      console.error("Registration error:", err);

      if (statusCode === 409) {
        const lowerMsg = serverMessage?.toLowerCase() || "";
        const isEmailConflict =
          lowerMsg.includes("email") ||
          lowerMsg.includes("بريد") ||
          lowerMsg.includes("mail");
        const isPhoneConflict =
          lowerMsg.includes("phone") || lowerMsg.includes("هاتف");

        if (isEmailConflict && !isPhoneConflict) {
          setErrors((prev) => ({
            ...prev,
            UniversityMailAddress: "هذا البريد الجامعي مُسجَّل بالفعل في المنصة",
          }));
        } else if (isPhoneConflict && !isEmailConflict) {
          setErrors((prev) => ({
            ...prev,
            PhoneNumber: "رقم الهاتف مُسجَّل بالفعل في المنصة",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            UniversityMailAddress: "هذا البريد الجامعي مُسجَّل بالفعل في المنصة",
            PhoneNumber: "رقم الهاتف مُسجَّل بالفعل في المنصة",
          }));
        }

        toast.error(serverMessage || "هذا الحساب موجود بالفعل، جرب تسجيل الدخول");
      } else if (statusCode === 400 && fieldErrors) {
        const fieldMapping = {
          UniversityMailAddress: "UniversityMailAddress",
          Email: "UniversityMailAddress",
          PhoneNumber: "PhoneNumber",
          Phone: "PhoneNumber",
          Name: "Name",
          Password: "Password",
          PersonalPhoto: "PersonalPhoto",
        };

        const mappedErrors = {};
        Object.keys(fieldErrors).forEach((key) => {
          const errorKey = fieldMapping[key] || key;
          const messages = Array.isArray(fieldErrors[key])
            ? fieldErrors[key]
            : [fieldErrors[key]];
          mappedErrors[errorKey] = messages[0];
        });

        setErrors((prev) => ({ ...prev, ...mappedErrors }));
        toast.error("يرجى مراجعة البيانات المدخلة");
      } else {
        toast.error(serverMessage || "حدث خطأ غير متوقع أثناء التسجيل");
      }
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-white dark:bg-dark-surface border border-library-primary/10 dark:border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-library-accent/50 focus:border-library-accent shadow-sm focus:shadow-md focus:shadow-library-accent/10 dark:text-white transition-all text-sm";

  const getInputClass = (name) =>
    `w-full px-4 py-3 bg-white dark:bg-dark-surface border ${
      errors[name]
        ? "border-red-500/50 focus:ring-red-500/30 focus:border-red-500/50 animate-shake"
        : "border-library-primary/10 dark:border-white/[0.08] focus:ring-library-accent/50 focus:border-library-accent shadow-sm focus:shadow-md focus:shadow-library-accent/10"
    } rounded-xl focus:outline-none focus:ring-2 dark:text-white transition-all text-sm`;

  return (
    <>
      <h2 className="text-3xl font-black text-library-primary dark:text-white mb-2">
        توثيق طالب جديد.
      </h2>
      <p className="text-library-primary/50 dark:text-gray-400 mb-6 text-sm font-medium">
        عملية التوثيق تتم يدوياً لضمان بيئة جامعية آمنة.
      </p>
      <form onSubmit={handleRegisterSubmit} className="space-y-4">
        <div className="flex flex-col items-center justify-center mb-2">
          <label
            className={`relative w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden group ${
              errors.PersonalPhoto
                ? "border-red-500/50 bg-red-500/5"
                : "bg-library-primary/5 dark:bg-white/5 border-library-primary/20 dark:border-white/20 hover:border-library-accent"
            }`}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera size={24} className="text-library-primary/40 dark:text-gray-500 mb-1" />
                <span className="text-[10px] text-library-primary/50 dark:text-gray-400 font-bold text-center leading-tight">
                  صورة
                  <br />
                  شخصية
                </span>
              </>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              disabled={isLoading}
            />
          </label>
          {errors.PersonalPhoto && (
            <p className="text-red-500 text-[11px] font-bold mt-1.5">
              {errors.PersonalPhoto}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-1.5">
            الاسم الرباعي
          </label>
          <input
            type="text"
            name="name"
            value={registerData.name}
            onChange={handleRegisterChange}
            className={getInputClass("Name")}
            required
            disabled={isLoading}
          />
          {errors.Name && (
            <p className="text-red-500 text-[11px] font-bold mt-1.5">
              {errors.Name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-1.5">
            البريد الجامعي
          </label>
          <input
            type="email"
            name="email"
            value={registerData.email}
            onChange={handleRegisterChange}
            className={getInputClass("UniversityMailAddress")}
            dir="ltr"
            placeholder="example@std.mans.edu.eg"
            required
            disabled={isLoading}
          />
          {errors.UniversityMailAddress && (
            <p className="text-red-500 text-[11px] font-bold mt-1.5">
              {errors.UniversityMailAddress}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-1.5">
              الرقم السري
            </label>
            <div className="relative">
              <input
                type={showRegisterPassword ? "text" : "password"}
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                className={`${getInputClass("Password")} pl-10`}
                dir="ltr"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-library-primary/60 dark:text-library-paper/60 hover:text-library-primary dark:hover:text-library-paper transition-colors ease-in-out"
              >
                {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.Password && (
              <p className="text-red-500 text-[11px] font-bold mt-1.5">
                {errors.Password}
              </p>
            )}
            <PasswordStrengthMeter password={registerData.password} />
          </div>
          <div>
            <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-1.5">
              تأكيد الرقم السري
            </label>
            <div className="relative">
              <input
                type={showRegisterConfirmPassword ? "text" : "password"}
                name="registerConfirmPassword"
                value={registerData.registerConfirmPassword}
                onChange={handleRegisterChange}
                className={`${getInputClass("registerConfirmPassword")} pl-10`}
                dir="ltr"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() =>
                  setShowRegisterConfirmPassword(!showRegisterConfirmPassword)
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 text-library-primary/60 dark:text-library-paper/60 hover:text-library-primary dark:hover:text-library-paper transition-colors ease-in-out"
              >
                {showRegisterConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.registerConfirmPassword && (
              <p className="text-red-500 text-[11px] font-bold mt-1.5">
                {errors.registerConfirmPassword}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-1.5">
              رقم الهاتف
            </label>
            <input
              type="tel"
              name="phone"
              value={registerData.phone}
              onChange={handleRegisterChange}
              className={getInputClass("PhoneNumber")}
              dir="ltr"
              placeholder="01012345678"
              required
              disabled={isLoading}
              maxLength={11}
              inputMode="numeric"
            />
            {errors.PhoneNumber && (
              <p className="text-red-500 text-[11px] font-bold mt-1.5">
                {errors.PhoneNumber}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-1.5">
              يوزر تليجرام (اختياري)
            </label>
            <input
              type="text"
              name="telegramUserId"
              value={registerData.telegramUserId}
              onChange={handleRegisterChange}
              className={inputClass}
              dir="ltr"
              placeholder="@username"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex items-start gap-3 pt-1">
          <input
            type="checkbox"
            id={`terms-${Math.random()}`} // unique id
            name="agreeToTerms"
            checked={registerData.agreeToTerms}
            onChange={handleRegisterChange}
            className="mt-1 w-4 h-4 accent-library-accent flex-shrink-0"
            required
            disabled={isLoading}
          />
          <label
            htmlFor="terms"
            className="text-[11px] text-library-primary/60 dark:text-gray-400 leading-relaxed"
          >
            أقر بصحة بياناتي وأوافق على{" "}
            <span className="font-bold text-library-accent">ميثاق شرف المنصة</span>
            ، وأتعهد بالمحافظة على الكتب المعارة لي.
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-red-500 text-[11px] font-bold">
            {errors.agreeToTerms}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-library-primary dark:bg-white text-library-paper dark:text-library-primary font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> جاري الإرسال...
            </>
          ) : (
            <>
              <UserPlus size={16} /> إرسال طلب التوثيق
            </>
          )}
        </button>
      </form>
      {switchMode && (
        <p className="mt-6 text-center text-library-primary/40 dark:text-gray-500 text-sm pb-8">
          لديك حساب موثق؟{" "}
          <button
            onClick={switchMode}
            className="font-bold text-library-accent hover:underline"
          >
            تسجيل الدخول
          </button>
        </p>
      )}
    </>
  );
};

export default RegisterForm;
