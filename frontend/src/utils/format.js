export function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`;
}

export function formatWon(value) {
  if (Number(value) === 0) {
    return "미지급";
  }
  return `${Number(value).toLocaleString("ko-KR")}원`;
}

export function getRateClass(rate) {
  if (rate < 50) return "danger";
  if (rate < 70) return "warning";
  if (rate < 90) return "care";
  return "good";
}
