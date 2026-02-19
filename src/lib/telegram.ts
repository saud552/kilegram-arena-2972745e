// ============================================
// ملف: src/lib/telegram.ts
// الوظيفة: التفاعل مع Telegram WebApp API
// ============================================

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string;
          };
          start_param?: string;
        };
        switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
        openTelegramLink: (url: string) => void;
        showPopup: (params: { title?: string; message: string; buttons?: any[] }) => void;
        showAlert: (message: string) => void;
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        };
      };
    };
  }
}

// الحصول على كائن WebApp
export const tg = window.Telegram?.WebApp;

// تهيئة التطبيق المصغر
export const initTelegramApp = () => {
  if (!tg) return;
  tg.expand(); // توسيع التطبيق لملء الشاشة
  tg.ready(); // إعلام تيليجرام بأن التطبيق جاهز
};

// الحصول على بيانات المستخدم من تيليجرام
export const getUserData = () => {
  if (!tg?.initDataUnsafe?.user) return null;
  const user = tg.initDataUnsafe.user;
  return {
    id: user.id.toString(),
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username ? `@${user.username}` : `user_${user.id}`,
    photoUrl: user.photo_url,
    languageCode: user.language_code,
  };
};

// الحصول على معامل البدء (start_param) من الرابط العميق
export const getStartParam = () => {
  return tg?.initDataUnsafe?.start_param;
};

// دالة إرسال الدعوة - تغلق التطبيق وتفتح قائمة المحادثات
export const inviteFriend = (squadCode: string, botUsername: string = 'KilegramBot') => {
  if (!tg) return;
  
  // إنشاء نص الرسالة مع الرابط العميق
  const message = `انضم إلي في لعبة Kilegram! كود الفريق: ${squadCode}\nhttps://t.me/${botUsername}?start=${squadCode}`;
  
  // استخدام switchInlineQuery لإغلاق التطبيق وفتح قائمة المحادثات
  tg.switchInlineQuery(message, ["users", "groups"]);
};

// دالة عرض رسالة منبثقة
export const showPopup = (message: string, title?: string) => {
  if (!tg) {
    alert(message);
    return;
  }
  tg.showPopup({ title, message });
};

// دالة الاهتزاز (للتفاعلات)
export const hapticImpact = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(style);
  }
};

// دالة إغلاق التطبيق المصغر
export const closeApp = () => {
  if (tg) tg.close();
};

// دالة فتح رابط خارجي (مثلاً للشراء)
export const openLink = (url: string) => {
  if (tg) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, '_blank');
  }
};