import { getRiskClass, RISK_ORDER } from "../utils/riskConfig";

export default function RiskSummary({
  participants,
  programFilter,
  programOptions,
  setProgramFilter,
}) {
  const riskSummary = RISK_ORDER.map((riskLevel) => ({
    riskLevel,
    count: participants.filter(
      (participant) => participant.risk_level === riskLevel,
    ).length,
  }));

  return (
    <section className="risk-section">
      <div className="section-title">
        <h2>전체 위험도 현황</h2>
        <select
          value={programFilter}
          onChange={(event) => setProgramFilter(event.target.value)}
        >
          {programOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="risk-grid">
        {riskSummary.map(({ riskLevel, count }) => (
          <article
            className={`risk-card ${getRiskClass(riskLevel)}`}
            key={riskLevel}
          >
            <strong>{count}</strong>
            <span>{riskLevel}</span>
            <p>
              {participants.length
                ? Math.round((count / participants.length) * 100)
                : 0}
              %
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
