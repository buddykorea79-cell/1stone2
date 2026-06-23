// ============================================================
// 간단 다국어 (주요 메뉴/버튼 라벨만 전환)
// 전체 완전 번역이 아니라 핵심 라벨 위주.
// ============================================================

import type { AccessibilitySettings } from '../types';

type Lang = AccessibilitySettings['language'];

const DICT: Record<string, Record<Lang, string>> = {
  appName: {
    ko: '복지 ONE-GOV',
    en: 'Welfare ONE-GOV',
    zh: '福利 ONE-GOV',
    vi: 'Welfare ONE-GOV',
  },
  search: { ko: '복지 찾기', en: 'Find Welfare', zh: '查找福利', vi: 'Tìm phúc lợi' },
  recommend: { ko: '추천받기', en: 'Recommend', zh: '推荐', vi: 'Gợi ý' },
  apply: { ko: '신청하기', en: 'Apply', zh: '申请', vi: 'Đăng ký' },
  myApplications: {
    ko: '내 신청 현황',
    en: 'My Applications',
    zh: '我的申请',
    vi: 'Đơn của tôi',
  },
  notifications: { ko: '내 알림', en: 'Notifications', zh: '通知', vi: 'Thông báo' },
  role: { ko: '역할', en: 'Role', zh: '角色', vi: 'Vai trò' },
  citizen: { ko: '시연 국민', en: 'Demo Citizen', zh: '演示市民', vi: 'Công dân demo' },
  largeText: { ko: '글자 크게', en: 'Large Text', zh: '大字体', vi: 'Chữ to' },
  highContrast: { ko: '고대비', en: 'High Contrast', zh: '高对比', vi: 'Tương phản' },
  easyMode: { ko: '쉬운 말', en: 'Easy Words', zh: '简单语言', vi: 'Dễ hiểu' },
};

export function t(key: string, lang: Lang): string {
  const entry = DICT[key];
  if (!entry) return key;
  return entry[lang] ?? entry.ko;
}
