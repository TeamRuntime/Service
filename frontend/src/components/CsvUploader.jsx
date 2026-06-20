export default function CsvUploader({ fileName, participantCount, onUpload }) {
  return (
    <label className="upload-bar">
      <input
        accept=".csv,text/csv"
        type="file"
        onChange={(event) => onUpload(event.target.files?.[0])}
      />
      <span>
        {fileName
          ? `${fileName} 업로드 완료 · ${participantCount}명`
          : "CSV 파일 업로드"}
      </span>
      <strong>파일 선택</strong>
    </label>
  );
}
