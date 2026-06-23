import { useApp } from '../../store/AppContext';
import {
  getNotificationsByCitizen,
  markNotificationAsRead,
} from '../../utils/notifications';

// 내 알림 화면 (읽지 않은 수 + 목록 + 읽음 처리)
export function MyNotifications() {
  const { notifications, selectedCitizenId, reload } = useApp();
  const mine = getNotificationsByCitizen(notifications, selectedCitizenId);
  const unread = mine.filter((n) => !n.read).length;

  const onRead = (id: string) => {
    markNotificationAsRead(notifications, id);
    reload();
  };

  return (
    <section>
      <h2>내 알림</h2>
      <p className="muted">읽지 않은 알림 {unread}건</p>
      {mine.length === 0 ? (
        <div className="card empty-state">알림이 없습니다.</div>
      ) : (
        <div className="noti-list">
          {mine.map((n) => (
            <div
              key={n.notificationId}
              className={`card noti-item ${n.read ? 'read' : 'unread'}`}
            >
              <div className="noti-body">
                <strong>{n.title}</strong>
                <p>{n.message}</p>
                <span className="muted">{n.createdAt}</span>
              </div>
              {!n.read && (
                <button
                  className="secondary-button"
                  onClick={() => onRead(n.notificationId)}
                >
                  읽음 처리
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
