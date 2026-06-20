export const RISK_ORDER = ["미지급위험", "위험", "주의", "관리필요", "정상"];

export function classifyRisk(participant) {
  const jobRate = participant.job_training_attendance_rate;
  const workRate = participant.work_experience_attendance_rate;
  const averageRate = participant.average_attendance_rate;

  if (jobRate < 50 || workRate < 50) return "미지급위험";
  if (averageRate < 60) return "위험";
  if (averageRate < 70) return "주의";
  if (averageRate < 90) return "관리필요";
  return "정상";
}

export function inferReason(participant) {
  const jobRate = participant.job_training_attendance_rate;
  const workRate = participant.work_experience_attendance_rate;

  if (jobRate < 50 || workRate < 50) {
    return "출석률이 지급 기준 하한선 아래로 내려가 수당 미지급 가능성이 큽니다.";
  }
  if (workRate + 8 < jobRate) {
    return "직무훈련보다 일경험 출석률이 낮아 현장 적응 또는 근무시간 부담 가능성이 있습니다.";
  }
  if (jobRate + 8 < workRate) {
    return "일경험보다 직무훈련 출석률이 낮아 교육 일정 충돌 또는 훈련 몰입도 저하 가능성이 있습니다.";
  }
  if (participant.average_attendance_rate < 70) {
    return "두 영역 모두 출석률이 낮아 참여 지속성 관리가 필요합니다.";
  }
  return "현재 출석 흐름은 안정적이며 큰 위험 신호는 낮습니다.";
}

export function recommendAction(participant) {
  if (participant.risk_level === "미지급위험") {
    return "즉시 전화 상담 후 수당 기준과 다음 출석 가능 일정을 재안내하세요.";
  }
  if (participant.risk_level === "위험") {
    return "결석 사유를 확인하고 이번 주 출석 회복 목표를 안내하세요.";
  }
  if (participant.risk_level === "주의") {
    return "개별 안내 메시지로 70% 이상 구간 진입 가능성을 알려주세요.";
  }
  if (participant.risk_level === "관리필요") {
    return "현재 지급 구간을 유지하도록 출석 리마인드를 발송하세요.";
  }
  return "우수 참여 상태를 유지하도록 격려 메시지를 발송하세요.";
}

export function getRiskClass(riskLevel) {
  return {
    미지급위험: "danger",
    위험: "warning",
    주의: "caution",
    관리필요: "care",
    정상: "good",
  }[riskLevel];
}
