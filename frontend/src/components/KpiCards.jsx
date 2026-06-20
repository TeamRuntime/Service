import { formatPercent } from "../utils/format";

export default function KpiCards({ kpis }) {
  return (
    <section className="kpi-grid">
      <article>
        <span>전체 참여자</span>
        <strong>{kpis.total}명</strong>
        <p>{kpis.programCount}개 프로그램</p>
      </article>
      <article>
        <span>평균 출석률</span>
        <strong>{formatPercent(kpis.averageAttendanceRate)}</strong>
        <p>직무훈련/일경험 평균</p>
      </article>
      <article>
        <span>수당 미지급 위험</span>
        <strong>{kpis.unpaidRiskCount}명</strong>
        <p>즉시 조치 필요</p>
      </article>
      <article>
        <span>우선 관리 대상</span>
        <strong>{kpis.managementCount}명</strong>
        <p>주의 이상 대상</p>
      </article>
    </section>
  );
}
