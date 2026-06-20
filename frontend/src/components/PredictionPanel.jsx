export default function PredictionPanel({ priorityParticipants }) {
  return (
    <section className="recommend-section">
      <article>
        <h2>원인과 해결방법 추천</h2>
        {priorityParticipants.length === 0 ? (
          <p className="empty-text">
            CSV를 업로드하면 우선 관리 대상의 원인과 조치가 표시됩니다.
          </p>
        ) : (
          <div className="recommend-list">
            {priorityParticipants.map((participant) => (
              <div
                className="recommend-card"
                key={`recommend-${participant.index}`}
              >
                <strong>
                  {participant.participant_name} · {participant.program_key}
                </strong>
                <p>{participant.ai_reason}</p>
                <span>{participant.recommended_action}</span>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
