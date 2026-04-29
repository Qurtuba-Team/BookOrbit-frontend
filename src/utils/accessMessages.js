import toast from "react-hot-toast";

const resolveUserStatus = (user) => {
  const raw = String(user?.status ?? user?.state ?? "").toLowerCase();
  if (raw === "0" || raw === "pending" || raw === "unconfirmed") return "pending";
  if (raw === "1" || raw === "approved") return "approved";
  if (raw === "2" || raw === "active") return "active";
  if (raw === "3" || raw === "rejected") return "rejected";
  if (raw === "4" || raw === "banned" || raw === "blocked") return "banned";
  return raw || "unknown";
};

export const getVerificationAccessMessage = (user) => {
  const status = resolveUserStatus(user);
  if (status === "pending") {
    return "حسابك ما زال قيد المراجعة من الإدارة، لذلك هذه الصفحة غير متاحة حالياً.";
  }
  if (status === "approved") {
    return "حسابك معتمد مبدئياً لكنه غير موثق بالكامل بعد. انتظر التفعيل النهائي لفتح هذه الصفحة.";
  }
  if (status === "rejected") {
    return "تم رفض طلب حسابك حالياً. تواصل مع الإدارة لمعرفة الخطوات التالية.";
  }
  if (status === "banned") {
    return "حسابك محظور حالياً، لذلك لا يمكنك الوصول إلى هذه الصفحة.";
  }
  return "لا يمكنك الوصول إلى هذه الصفحة حالياً بسبب حالة الحساب.";
};

export const getReadableAccessError = (error, user, fallbackMessage) => {
  if (error?.status === 403) return getVerificationAccessMessage(user);
  return error?.message || fallbackMessage;
};

const recentToastByMessage = new Map();
const ACCESS_TOAST_COOLDOWN_MS = 2500;

export const showReadableAccessErrorToast = (error, user, fallbackMessage, options = {}) => {
  const message = getReadableAccessError(error, user, fallbackMessage);
  const now = Date.now();
  const lastShownAt = recentToastByMessage.get(message) || 0;
  if (now - lastShownAt < ACCESS_TOAST_COOLDOWN_MS) return;
  recentToastByMessage.set(message, now);
  toast.error(message, options);
};
