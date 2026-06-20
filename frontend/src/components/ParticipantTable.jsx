import { formatPercent, formatWon, getRateClass } from "../utils/format";
import { getRiskClass } from "../utils/riskConfig";

export default function ParticipantTable({ participants }) {
  return (
    <section className="table-section">
      <div className="section-title">
        <h2>참여자 목록</h2>
        <span>{participants.length}명</span>
      </div>

      <div className="participant-table-wrap">
        <table className="participant-table">
          <thead>
            <tr>
              <th>index</th>
              <th>이름</th>
              <th>프로그램</th>
              <th>직무출석</th>
              <th>일경험출석</th>
              <th>평균출석</th>
              <th>직무수당</th>
              <th>일경험수당</th>
              <th>총수당</th>
              <th>등급</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant) => (
              <tr key={`${participant.index}-${participant.participant_name}`}>
                <td>{participant.index}</td>
                <td className="name-cell">{participant.participant_name}</td>
                <td>{participant.program_key}</td>
                <td
                  className={getRateClass(
                    participant.job_training_attendance_rate,
                  )}
                >
                  {formatPercent(participant.job_training_attendance_rate)}
                </td>
                <td
                  className={getRateClass(
                    participant.work_experience_attendance_rate,
                  )}
                >
                  {formatPercent(participant.work_experience_attendance_rate)}
                </td>
                <td
                  className={getRateClass(participant.average_attendance_rate)}
                >
                  {formatPercent(participant.average_attendance_rate)}
                </td>
                <td>{formatWon(participant.job_training_allowance)}</td>
                <td>{formatWon(participant.work_experience_allowance)}</td>
                <td>{formatWon(participant.total_allowance)}</td>
                <td>
                  <span
                    className={`risk-pill ${getRiskClass(participant.risk_level)}`}
                  >
                    {participant.risk_level}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
