import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { resetMockData } from '../../utils/bootstrap';

// 시스템 관리자: mock 데이터 초기화
export function AdminPanel() {
  const {
    reload,
    setSelectedCitizenId,
    residents,
    households,
    applications,
    programs,
  } = useApp();
  const [done, setDone] = useState('');

  const handleReset = () => {
    if (
      !window.confirm(
        'localStorage 의 모든 mock 데이터를 삭제하고 초기 데이터를 다시 생성합니다. 진행할까요?'
      )
    )
      return;
    resetMockData();
    reload();
    // 선택 국민 재설정
    setTimeout(() => {
      const list = JSON.parse(localStorage.getItem('residents') ?? '[]');
      if (list[0]) setSelectedCitizenId(list[0].citizenId);
    }, 0);
    setDone('mock 데이터를 초기화했습니다.');
  };

  return (
    <section>
      <h2>데이터 관리 (시스템 관리자)</h2>
      <div className="card">
        <h4>현재 데이터 현황</h4>
        <ul>
          <li>복지사업: {programs.length}건</li>
          <li>주민: {residents.length}명</li>
          <li>세대: {households.length}세대</li>
          <li>신청: {applications.length}건</li>
        </ul>
      </div>
      <div className="card">
        <h4>mock 데이터 초기화</h4>
        <p className="muted">
          모든 localStorage 데이터를 지우고 초기 mock 데이터를 다시 생성합니다.
        </p>
        <button className="secondary-button danger" onClick={handleReset}>
          mock 데이터 초기화
        </button>
        {done && <div className="toast-success">{done}</div>}
      </div>
    </section>
  );
}
