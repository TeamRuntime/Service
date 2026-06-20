import { useMemo, useState } from "react";
import {
  ALLOWANCE_RULES,
  allowanceAmount,
  attendanceBand,
  attendanceRate,
  paymentStatus,
} from "../utils/allowance";
import {
  classifyRisk,
  inferReason,
  recommendAction,
} from "../utils/riskConfig";
import { parseCsv } from "./useCsvParser";

const PROGRAM_PATTERN = /^(?<program_type>.+?)_(?<program_track>[A-E])$/;
const WEEK_COLUMN_PATTERN =
  /^week_(?<week>\d{2})_(?<category>job_training|work_experience)_(?<kind>attended|total)_hours$/;

function splitProgramName(programName) {
  const trimmed = (programName || "").trim();
  const match = trimmed.match(PROGRAM_PATTERN);

  if (!match?.groups) {
    throw new Error(`program_name 형식 오류: ${trimmed}`);
  }

  const { program_type: programType, program_track: programTrack } =
    match.groups;
  if (!["미래내일 일경험", "직무훈련"].includes(programType)) {
    throw new Error(`지원하지 않는 program_type: ${programType}`);
  }

  return {
    program_type: programType,
    program_track: programTrack,
    program_key: `${programType}_${programTrack}`,
  };
}

function toNumber(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return 0;
  }
  return Number(value);
}

function discoverWeeks(headers) {
  const weeks = new Set();
  headers.forEach((header) => {
    const match = header.match(WEEK_COLUMN_PATTERN);
    if (match?.groups) {
      weeks.add(Number(match.groups.week));
    }
  });
  return [...weeks].sort((a, b) => a - b);
}

function getHours(row, week, category, kind) {
  return toNumber(
    row[`week_${String(week).padStart(2, "0")}_${category}_${kind}_hours`],
  );
}

function sumHours(row, weeks, category) {
  return weeks.reduce(
    (totals, week) => ({
      attendedHours:
        totals.attendedHours + getHours(row, week, category, "attended"),
      totalHours: totals.totalHours + getHours(row, week, category, "total"),
    }),
    { attendedHours: 0, totalHours: 0 },
  );
}

function buildCategoryMetrics(row, weeks, category, prefix) {
  const { attendedHours, totalHours } = sumHours(row, weeks, category);
  const rate = attendanceRate(attendedHours, totalHours);
  const maxAmount = ALLOWANCE_RULES[category].maxAmount;

  return {
    [`${prefix}_attended_hours`]: attendedHours,
    [`${prefix}_total_hours`]: totalHours,
    [`${prefix}_attendance_rate`]: rate,
    [`${prefix}_attendance_band`]: attendanceBand(rate),
    [`${prefix}_payment_status`]: paymentStatus(rate),
    [`${prefix}_allowance`]: allowanceAmount(rate, maxAmount),
  };
}

function preprocessRows(rawRows) {
  if (rawRows.length === 0) {
    return [];
  }

  const requiredFields = ["program_name", "participant_name"];
  const missingField = requiredFields.find((field) => !(field in rawRows[0]));
  if (missingField) {
    throw new Error(`필수 컬럼이 없습니다: ${missingField}`);
  }

  const weeks = discoverWeeks(Object.keys(rawRows[0]));
  if (weeks.length === 0) {
    throw new Error("week_XX_* 출석 컬럼을 찾을 수 없습니다.");
  }

  return rawRows.map((row, index) => {
    const program = splitProgramName(row.program_name);
    const jobMetrics = buildCategoryMetrics(
      row,
      weeks,
      "job_training",
      "job_training",
    );
    const workMetrics = buildCategoryMetrics(
      row,
      weeks,
      "work_experience",
      "work_experience",
    );
    const averageAttendanceRate =
      Math.round(
        ((jobMetrics.job_training_attendance_rate +
          workMetrics.work_experience_attendance_rate) /
          2) *
          10,
      ) / 10;

    const participant = {
      index: index + 1,
      program_name: row.program_name.trim(),
      ...program,
      participant_name: row.participant_name.trim(),
      ...jobMetrics,
      ...workMetrics,
      average_attendance_rate: averageAttendanceRate,
      total_allowance:
        jobMetrics.job_training_allowance +
        workMetrics.work_experience_allowance,
    };

    return {
      ...participant,
      risk_level: classifyRisk(participant),
      ai_reason: inferReason(participant),
      recommended_action: recommendAction(participant),
    };
  });
}

export function useParticipants() {
  const [fileName, setFileName] = useState("");
  const [participants, setParticipants] = useState([]);
  const [programFilter, setProgramFilter] = useState("전체");
  const [error, setError] = useState("");

  async function handleCsvUpload(file) {
    if (!file) return;

    try {
      const text = await file.text();
      const rawRows = parseCsv(text);
      const processedRows = preprocessRows(rawRows);
      setParticipants(processedRows);
      setProgramFilter("전체");
      setFileName(file.name);
      setError("");
    } catch (caughtError) {
      setParticipants([]);
      setFileName("");
      setError(caughtError.message || "CSV 처리 중 오류가 발생했습니다.");
    }
  }

  const programOptions = useMemo(
    () => [
      "전체",
      ...new Set(participants.map((participant) => participant.program_key)),
    ],
    [participants],
  );

  const filteredParticipants = useMemo(() => {
    if (programFilter === "전체") {
      return participants;
    }
    return participants.filter(
      (participant) => participant.program_key === programFilter,
    );
  }, [participants, programFilter]);

  const priorityParticipants = useMemo(
    () =>
      [...participants]
        .filter((participant) => participant.risk_level !== "정상")
        .sort((a, b) => a.average_attendance_rate - b.average_attendance_rate)
        .slice(0, 5),
    [participants],
  );

  return {
    error,
    fileName,
    filteredParticipants,
    handleCsvUpload,
    participants,
    priorityParticipants,
    programFilter,
    programOptions,
    setProgramFilter,
  };
}
