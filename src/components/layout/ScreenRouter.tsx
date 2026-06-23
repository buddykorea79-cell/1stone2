import { useApp } from '../../store/AppContext';
import { canAccess } from '../../utils/roles';
import { CitizenMain } from '../citizen/CitizenMain';
import { MyApplications } from '../citizen/MyApplications';
import { MyNotifications } from '../citizen/MyNotifications';
import { DelegatedApplication } from '../delegation/DelegatedApplication';
import { AuditLogList } from '../delegation/AuditLogList';
import { StaffApplications } from '../staff/StaffApplications';
import { WelfareProgramManager } from '../staff/WelfareProgramManager';
import { HouseholdManagement } from '../household/HouseholdManagement';
import { MonthlyBatchPage } from '../batch/MonthlyBatchPage';
import { BatchResultsPage } from '../batch/BatchResultsPage';
import { AgencyDashboard } from '../dashboard/AgencyDashboard';
import { GlobalDashboard } from '../dashboard/GlobalDashboard';
import { RagPlaceholder } from '../rag/RagPlaceholder';
import { MockSqlQueryPage } from '../sql/MockSqlQueryPage';
import { AdminPanel } from '../admin/AdminPanel';

// 현재 화면(screen)에 맞는 컴포넌트를 렌더링한다.
export function ScreenRouter() {
  const { screen, role } = useApp();

  // 권한 없는 화면 접근 차단
  if (!canAccess(role, screen)) {
    return (
      <div className="card empty-state">
        현재 역할에서는 접근할 수 없는 화면입니다. 메뉴에서 다른 화면을 선택하세요.
      </div>
    );
  }

  switch (screen) {
    case 'main':
      return <CitizenMain />;
    case 'myApplications':
      return <MyApplications />;
    case 'myNotifications':
      return <MyNotifications />;
    case 'delegated':
      return <DelegatedApplication />;
    case 'auditLog':
      return <AuditLogList />;
    case 'staffApplications':
      return <StaffApplications />;
    case 'welfarePrograms':
      return <WelfareProgramManager />;
    case 'household':
      return <HouseholdManagement />;
    case 'batch':
      return <MonthlyBatchPage />;
    case 'batchResults':
      return <BatchResultsPage />;
    case 'agencyDashboard':
      return <AgencyDashboard />;
    case 'globalDashboard':
      return <GlobalDashboard />;
    case 'rag':
      return <RagPlaceholder />;
    case 'sql':
      return <MockSqlQueryPage />;
    case 'admin':
      return <AdminPanel />;
    default:
      return <CitizenMain />;
  }
}
