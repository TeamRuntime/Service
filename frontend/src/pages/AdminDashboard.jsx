import { useMemo } from "react";
import CsvUploader from "../components/CsvUploader";
import KpiCards from "../components/KpiCards";
import ParticipantTable from "../components/ParticipantTable";
import PredictionPanel from "../components/PredictionPanel";
import RiskSummary from "../components/RiskSummary";
import { useParticipants } from "../hooks/useParticipants";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const {
    error,
    fileName,
    filteredParticipants,
    handleCsvUpload,
    participants,
    priorityParticipants,
    programFilter,
    programOptions,
    setProgramFilter,
  } = useParticipants();

  const kpis = useMemo(() => {
    const total = participants.length;
    const averageAttendanceRate =
      total === 0
        ? 0
        : Math.round(
            (participants.reduce(
              (sum, participant) => sum + participant.average_attendance_rate,
              0,
            ) /
              total) *
              10,
          ) / 10;
    const unpaidRiskCount = participants.filter(
      (participant) => participant.risk_level === "미지급위험",
    ).length;
    const managementCount = participants.filter((participant) =>
      ["미지급위험", "위험", "주의"].includes(participant.risk_level),
    ).length;

    return {
      total,
      programCount: new Set(
        participants.map((participant) => participant.program_key),
      ).size,
      averageAttendanceRate,
      unpaidRiskCount,
      managementCount,
    };
  }, [participants]);

  return (
    <main className="admin-dashboard">
      <nav className="dashboard-tabs">
        <button className="active" type="button">
          운영자 대시보드
        </button>
        <button type="button">참여자 알림 페이지</button>
      </nav>

      <section className="dashboard-header">
        <div>
          <p>미래내일 일경험 사업</p>
          <h1>운영자 대시보드</h1>
        </div>
        <div className="dashboard-date">
          <strong>2026.06.20</strong>
          <span>1~4주차</span>
        </div>
      </section>

      <CsvUploader
        fileName={fileName}
        participantCount={participants.length}
        onUpload={handleCsvUpload}
      />

      {error && <div className="error-banner">{error}</div>}

      <KpiCards kpis={kpis} />

      <RiskSummary
        participants={participants}
        programFilter={programFilter}
        programOptions={programOptions}
        setProgramFilter={setProgramFilter}
      />

      <ParticipantTable participants={filteredParticipants} />

      <PredictionPanel priorityParticipants={priorityParticipants} />
    </main>
  );
}
