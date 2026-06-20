import argparse
import csv
import re
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = PROJECT_ROOT / "data" / "raw" / "participants.csv"
DEFAULT_OUTPUT = PROJECT_ROOT / "data" / "output" / "preprocessed_participants.csv"

PROGRAM_PATTERN = re.compile(r"^(?P<program_type>.+?)_(?P<program_track>[A-E])$")
WEEK_COLUMN_PATTERN = re.compile(
    r"^week_(?P<week>\d{2})_(?P<category>job_training|work_experience)_(?P<kind>attended|total)_hours$"
)

VALID_PROGRAM_TYPES = {"미래내일 일경험", "직무훈련"}

ALLOWANCE_RULES = {
    "job_training": {
        "label": "직무훈련",
        "max_amount": 150_000,
    },
    "work_experience": {
        "label": "일경험",
        "max_amount": 300_000,
    },
}


def split_program_name(program_name):
    """
    program_name 예시:
    - 미래내일 일경험_A
    - 직무훈련_B

    반환:
    - program_type: 미래내일 일경험 / 직무훈련
    - program_track: A / B / C / D / E
    - program_key: 미래내일 일경험_A 같은 원본 분류값
    """
    program_name = (program_name or "").strip()
    match = PROGRAM_PATTERN.match(program_name)

    if not match:
        raise ValueError(f"program_name 형식 오류: {program_name}")

    program_type = match.group("program_type").strip()
    program_track = match.group("program_track").strip()

    if program_type not in VALID_PROGRAM_TYPES:
        raise ValueError(f"지원하지 않는 program_type: {program_type}")

    return program_type, program_track, f"{program_type}_{program_track}"


def to_number(value):
    if value is None or str(value).strip() == "":
        return 0.0
    return float(value)


def discover_weeks(fieldnames):
    weeks = set()
    for field in fieldnames:
        match = WEEK_COLUMN_PATTERN.match(field)
        if match:
            weeks.add(int(match.group("week")))
    return sorted(weeks)


def attendance_rate(attended_hours, total_hours):
    if total_hours <= 0:
        return 0.0
    return round(attended_hours / total_hours * 100, 1)


def attendance_band(rate):
    if rate >= 90:
        return "90% 이상"
    if rate >= 70:
        return "70~90%"
    if rate >= 60:
        return "60~70%"
    if rate >= 50:
        return "50~60%"
    return "50% 미만"


def allowance_amount(rate, max_amount):
    if rate >= 90:
        return max_amount
    if rate >= 70:
        return int(max_amount * 0.875)
    if rate >= 60:
        return int(max_amount * 0.75)
    if rate >= 50:
        return int(max_amount * 0.625)
    return 0

