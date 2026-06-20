// frontend/src/components/PredictionPanel.jsx
import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 환경변수에서 API 키 로드 (Vite 환경 기준)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function PredictionPanel({ participant }) {
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAiPrediction = async () => {
      if (!API_KEY) {
        setError("API 키가 설정되지 않았습니다.");
        setLoading(false);
        return;
      }

      try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 가명 처리 (보안)
        const safeName = `참여자_${participant.id}`;

        const prompt = `
          당신은 직업훈련 사업 운영을 돕는 AI 어시스턴트입니다. 
          아래 참여자 데이터를 분석하여 반드시 유효한 JSON 형식으로만 응답하세요. Markdown이나 추가 설명은 넣지 마세요.

          [데이터]
          - 식별자: ${safeName}
          - 현재 출석률: ${participant.attendanceRate}%
          - 위험도: ${participant.riskScore}점
          - 예상 지급액: ${participant.expectedAllowance}원
          - 최근 2주 추세: ${participant.trend}%p

          [응답 JSON 구조]
          {
            "analysis": "최근 추세와 미지급 가능성에 대한 2문장 이내의 분석",
            "scenario": "다음 2주간 출석 시 도달 가능한 목표 구간 및 회복 예상 금액 (예: 예상 지급액 93,750원 회복 가능)",
            "action": "운영자가 취해야 할 즉각적인 행동 추천 (예: 즉시 연락 + 수당 기준 안내)"
          }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // JSON 파싱 (Gemini가 마크다운 코드블록을 반환할 경우를 대비한 정제)
        const cleanJson = responseText
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        const parsedData = JSON.parse(cleanJson);

        setAiData(parsedData);
      } catch (err) {
        console.error("AI 시나리오 생성 실패:", err);
        setError("AI 분석을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchAiPrediction();
  }, [participant]);

  if (loading)
    return (
      <div className="p-6 bg-gray-50 rounded-lg animate-pulse">
        AI 분석 시나리오를 생성 중입니다...
      </div>
    );
  if (error)
    return <div className="p-6 text-red-500 bg-red-50 rounded-lg">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6 pb-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          참여자 요약: {participant.name}
        </h3>
        <div className="flex gap-4 text-sm text-gray-600">
          <p>
            현재 출석률:{" "}
            <span className="font-semibold text-gray-900">
              {participant.attendanceRate}%
            </span>
          </p>
          <p>
            위험도:{" "}
            <span className="font-semibold text-red-500">
              {participant.riskScore}점
            </span>
          </p>
          <p>
            예상 지급액:{" "}
            <span className="font-semibold text-gray-900">
              {participant.expectedAllowance.toLocaleString()}원
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-bold text-blue-800 mb-1 flex items-center gap-2">
            📊 AI 분석
          </h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {aiData?.analysis}
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-bold text-green-800 mb-1 flex items-center gap-2">
            📈 AI 회복 시나리오
          </h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {aiData?.scenario}
          </p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
          <h4 className="font-bold text-orange-800 mb-1 flex items-center gap-2">
            🚨 AI 추천 조치
          </h4>
          <p className="text-gray-700 font-medium text-sm">{aiData?.action}</p>
        </div>
      </div>
    </div>
  );
}
