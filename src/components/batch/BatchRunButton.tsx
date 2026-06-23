// 배치 실행 버튼 (실행 로직은 상위에서 주입)
export function BatchRunButton({
  onRun,
  running,
}: {
  onRun: () => void;
  running: boolean;
}) {
  return (
    <button
      className="primary-button big"
      onClick={onRun}
      disabled={running}
    >
      {running ? '배치 처리 중…' : '월 1회 배치 처리 실행'}
    </button>
  );
}
