// 🚀 1. 설문 제출용 Google Apps Script 웹 앱 URL을 붙여넣으세요.
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwKa1UJRqVGHjWG7y1rPE6QGP5xIzg4d0HM3gG7wfiw46ou6BSbGtjvOsfqVwwB8-zR/exec";

// 🚀 2. 설문 결과를 읽어오는 용도의 Google Apps Script 웹 앱 URL을 붙여넣으세요.
// (새로 배포해야 합니다. 아래 Code.gs의 doGet 함수를 참고하세요.)
const GOOGLE_SCRIPT_DATA_URL = "https://script.google.com/macros/s/AKfycbwKa1UJRqVGHjWG7y1rPE6QGP5xIzg4d0HM3gG7wfiw46ou6BSbGtjvOsfqVwwB8-zR/exec"; // 설문 제출 URL과 동일해도 되지만, doGet을 위해 재배포 필요.

// --- 설문 제출 로직 (index.html 용) ---
const form = document.getElementById("coffeeForm");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // 폼의 기본 제출 동작을 막습니다.

    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "제출 중...";

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Google Apps Script로 데이터 전송
    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(result => {
        if (result.status === "success") {
            // 성공 시, sensitivity 값을 쿼리 파라미터로 담아 결과 페이지로 이동합니다.
            window.location.href = `results.html?sensitivity=${data.sensitivity}`;
        } else {
            throw new Error(result.message || "알 수 없는 오류가 발생했습니다.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert(`제출 중 오류가 발생했습니다: ${error.message}`);
        submitButton.disabled = false;
        submitButton.textContent = "제출하기";
    });
  });
}


// --- 결과 페이지 로직 (results.html 용) ---
if (window.location.pathname.includes("results.html")) {
  
  // URL의 쿼리 파라미터에서 sensitivity 값을 가져오는 함수
  const getSensitivityFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    // sensitivity 값을 정수(숫자)로 변환하여 반환합니다. 값이 없으면 중간값 3을 기본으로 사용합니다.
    return parseInt(params.get("sensitivity"), 10) || 3; 
  };
  
  // 카페인 민감도에 따라 프렌차이즈 정보를 반환하는 함수
  const getFranchiseRecommendation = (sensitivity) => {
    // 민감도 1~2: 카페인에 둔감
    if (sensitivity <= 2) {
      return {
        name: "스타벅스 (Starbucks)",
        description: "다양한 원두와 에스프레소 샷 추가 옵션이 있어 취향에 맞게 강도를 조절하기 좋습니다. 카페인에 강한 당신에게 진한 풍미의 커피를 추천합니다.",
        logo: "https://placehold.co/100x100/036635/FFFFFF?text=Starbucks"
      };
    // 민감도 3: 보통
    } else if (sensitivity === 3) {
      return {
        name: "투썸플레이스 (A Twosome Place)",
        description: "균형 잡힌 맛의 원두 블렌드를 사용하여 누구나 부담 없이 즐길 수 있는 커피를 제공합니다. 부드러운 라떼나 아메리카노로 기분 좋은 하루를 시작해보세요.",
        logo: "https://placehold.co/100x100/000000/FFFFFF?text=Twosome"
      };
    // 민감도 4~5: 카페인에 민감
    } else { 
      return {
        name: "폴 바셋 (Paul Bassett)",
        description: "디카페인 메뉴가 훌륭하고, 원두 본연의 부드러운 산미를 잘 살리는 것으로 유명합니다. 카페인 걱정 없이 스페셜티 커피의 풍미를 즐겨보세요.",
        logo: "https://placehold.co/100x100/D9042B/FFFFFF?text=Paul+Bassett"
      };
    }
  };

  // 추천 내용을 HTML 페이지에 그려주는 함수
  const renderRecommendation = () => {
    const sensitivity = getSensitivityFromURL();
    const recommendation = getFranchiseRecommendation(sensitivity);
    const container = document.getElementById("franchise-recommendation");
    
    if (container && recommendation) {
      const contentHTML = `
        <h3>🎉 당신을 위한 프렌차이즈 추천</h3>
        <div class="recommend-content">
          <img src="${recommendation.logo}" alt="${recommendation.name} 로고">
          <div>
            <strong>${recommendation.name}</strong>
            <p>${recommendation.description}</p>
          </div>
        </div>
      `;
      container.innerHTML = contentHTML;
    }
  };

  // 설문 결과를 가져와서 HTML에 렌더링하는 함수
  const renderSurveyResults = async () => {
    const resultsContainer = document.getElementById("survey-results-summary");
    if (!resultsContainer) return;

    try {
      const response = await fetch(GOOGLE_SCRIPT_DATA_URL, {
        method: "GET",
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data.status === "success" && data.data) {
        // 데이터 처리 및 요약 (예시)
        const totalResponses = data.data.length;

        // 각 질문별 통계 계산 (간단한 예시)
        const dailyAmountCounts = {};
        const sensitivitySum = data.data.reduce((sum, row) => sum + parseInt(row[1], 10), 0); // sensitivity는 두 번째 열 (인덱스 1)
        const avgSensitivity = (sensitivitySum / totalResponses).toFixed(1);
        const favoriteCafeCounts = {};
        const brewTypeCounts = {};
        const beanTypeCounts = {};

        data.data.forEach(row => {
          // row[0] = dailyAmount, row[1] = sensitivity, row[2] = favoriteCafe, row[3] = brewType, row[4] = beanType
          dailyAmountCounts[row[0]] = (dailyAmountCounts[row[0]] || 0) + 1;
          favoriteCafeCounts[row[2]] = (favoriteCafeCounts[row[2]] || 0) + 1;
          brewTypeCounts[row[3]] = (brewTypeCounts[row[3]] || 0) + 1;
          beanTypeCounts[row[4]] = (beanTypeCounts[row[4]] || 0) + 1;
        });

        // 가장 많이 선택된 옵션 찾기 헬퍼 함수
        const getMostFrequent = (counts) => {
            if (Object.keys(counts).length === 0) return "N/A";
            return Object.entries(counts).sort(([,a],[,b]) => b-a)[0][0];
        };

        const mostDailyAmount = getMostFrequent(dailyAmountCounts);
        const mostFavoriteCafe = getMostFrequent(favoriteCafeCounts);
        const mostBrewType = getMostFrequent(brewTypeCounts);
        const mostBeanType = getMostFrequent(beanTypeCounts);

        // 설문 결과를 HTML로 구성
        resultsContainer.innerHTML = `
          <h3>📊 설문 결과 요약</h3>
          <div class="results-grid">
            <div class="result-item">
              <strong>총 응답 수</strong>
              <p>${totalResponses}명</p>
            </div>
            <div class="result-item">
              <strong>평균 카페인 민감도</strong>
              <p>${avgSensitivity}점 (5점 만점)</p>
            </div>
            <div class="result-item">
              <strong>가장 많은 하루 커피량</strong>
              <p>${mostDailyAmount}</p>
            </div>
            <div class="result-item">
              <strong>가장 많이 언급된 카페</strong>
              <p>${mostFavoriteCafe}</p>
            </div>
            <div class="result-item">
              <strong>가장 선호하는 추출 방식</strong>
              <p>${mostBrewType}</p>
            </div>
            <div class="result-item">
              <strong>가장 선호하는 원두 타입</strong>
              <p>${mostBeanType}</p>
            </div>
          </div>
        `;
      } else {
        resultsContainer.innerHTML = `<p>설문 결과를 불러오는 데 실패했습니다: ${data.message || '알 수 없는 오류'}</p>`;
      }

    } catch (error) {
      console.error("Failed to fetch survey results:", error);
      resultsContainer.innerHTML = `<p>설문 결과를 불러오는 중 오류가 발생했습니다: ${error.message}</p>`;
    }
  };
  
  // HTML 문서 로딩이 완료되면 추천 및 결과 요약 함수를 실행합니다.
  window.addEventListener("DOMContentLoaded", () => {
    renderRecommendation(); // 추천 먼저 렌더링
    renderSurveyResults();  // 그 다음 설문 결과 요약 렌더링
  });
}
