import type { ApplicationStatus } from '../../types';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/applications';

// 신청 상태 표시 배지 (재사용)
export function ApplicationStatusBadge({
  status,
}: {
  status: ApplicationStatus;
}) {
  return (
    <span className={`status-badge ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
