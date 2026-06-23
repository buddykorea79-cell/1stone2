// ============================================================
// 알림(notifications) 유틸
// ⚠️ 실제 문자/이메일/카카오 발송은 하지 않는다. localStorage 기반.
// ============================================================

import type { Notification } from '../types';
import { getNotifications, setNotifications } from './storage';
import { nowString } from './date';

let notiSeq = 0;
function nextId(): string {
  notiSeq++;
  return `NOTI_${Date.now()}_${notiSeq}`;
}

// 알림 추가 후 전체 목록 반환
export function addNotification(
  citizenId: string,
  title: string,
  message: string
): Notification[] {
  const list = getNotifications();
  const noti: Notification = {
    notificationId: nextId(),
    citizenId,
    title,
    message,
    read: false,
    createdAt: nowString(),
  };
  const updated = [noti, ...list];
  setNotifications(updated);
  return updated;
}

// 특정 국민의 알림 목록
export function getNotificationsByCitizen(
  list: Notification[],
  citizenId: string
): Notification[] {
  return list.filter((n) => n.citizenId === citizenId);
}

// 알림 읽음 처리 후 전체 목록 반환
export function markNotificationAsRead(
  list: Notification[],
  notificationId: string
): Notification[] {
  const updated = list.map((n) =>
    n.notificationId === notificationId ? { ...n, read: true } : n
  );
  setNotifications(updated);
  return updated;
}
