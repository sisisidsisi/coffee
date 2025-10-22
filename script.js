// 🚀 1. 여기에 Google Apps Script로 배포한 웹 앱 URL을 붙여넣으세요.
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzLhLfZm1vWznc1FWdomXk3HuUsaVaYdn2OsFmToVlUhvpbTUfdYqyCQWEcfB36px-r/exec";

// --- 설문 제출 및 결과 페이지 이동 로직 ---
const form = document.getElementById("coffeeForm");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // 폼의 기본 제출 동작을 막습니다.

    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "제출 중...";

    // 폼 데이터를 자바스크립트 객체로 변환합니다.
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Google Apps Script로 데이터 전송
    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      // CORS 에러를 방지하기 위해 일반 텍스트로 전송합니다. Apps Script에서 JSON으로 파싱합니다.
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
    })
      .then((response) => {
        // 응답이 올바르지 않으면 에러를 발생시킵니다.
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((result) => {
        // Apps Script로부터 성공 응답을 받으면 결과 페이지로 이동합니다.
        if (result.status === "success") {
          window.location.href = "results.html";
        } else {
          // 실패 시 에러 메시지를 표시합니다.
          throw new Error(result.message || "알 수 없는 오류가 발생했습니다.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(`제출 중 오류가 발생했습니다: ${error.message}`);
        submitButton.disabled = false;
        submitButton.textContent = "제출하기";
      });
  });
}
