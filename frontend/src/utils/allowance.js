export const ALLOWANCE_RULES = {
  job_training: {
    label: "직무훈련",
    maxAmount: 150000,
  },
  work_experience: {
    label: "일경험",
    maxAmount: 300000,
  },
};

export function attendanceRate(attendedHours, totalHours) {
  if (totalHours <= 0) {
    return 0;
  }
  return Math.round((attendedHours / totalHours) * 1000) / 10;
}

export function attendanceBand(rate) {
  if (rate >= 90) return "90% 이상";
  if (rate >= 70) return "70~90%";
  if (rate >= 60) return "60~70%";
  if (rate >= 50) return "50~60%";
  return "50% 미만";
}

export function allowanceAmount(rate, maxAmount) {
  if (rate >= 90) return maxAmount;
  if (rate >= 70) return Math.trunc(maxAmount * 0.875);
  if (rate >= 60) return Math.trunc(maxAmount * 0.75);
  if (rate >= 50) return Math.trunc(maxAmount * 0.625);
  return 0;
}

export function paymentStatus(rate) {
  return rate < 50 ? "미지급" : "지급";
}
