// 🚀 1. 설문 제출용(POST) Google Apps Script 웹 앱 URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzxAGrMrWVa07Yjw90reowUB46A-u3fVO60OYgg6aZu79gR8E4gqHGtxM36qNxwHM-8/exec";

// 🚀 2. 설문 결과를 읽어오는용(GET) Google Apps Script 웹 앱 URL
// (Code.gs를 doGet 포함하여 재배포한 후 얻은 URL, 1번과 동일한 URL이어야 함)
const GOOGLE_SCRIPT_DATA_URL = "https://script.google.com/macros/s/AKfycbzxAGrMrWVa07Yjw90reowUB46A-u3fVO60OYgg6aZu79gR8E4gqHGtxM36qNxwHM-8/exec";


// --- 설문 제출 로직 (index.html 용) ---
const form = document.getElementById("coffeeForm");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault(); 

    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "제출 중...";

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Google Apps Script로 데이터 전송 (POST)
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
            window.location.href = `results.html?sensitivity=${data.sensitivity}`;
        } else {
            throw new Error(result.message || "알 수 없는 오류가 발생했습니다.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert(`제출 중 오류가 발생했습니다: ${error.message}\n\n(참고: Google Apps Script의 SPREADSHEET_ID와 SHEET_NAME을 확인하세요.)`);
        submitButton.disabled = false;
        submitButton.textContent = "제출하기";
    });
  });
}


// --- 결과 페이지 로직 (results.html 용) ---
if (window.location.pathname.includes("results.html")) {
  
  // URL에서 sensitivity 값 가져오기
  const getSensitivityFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("sensitivity"), 10) || 3; 
  };
  
  // 민감도로 프렌차이즈 추천하기
  const getFranchiseRecommendation = (sensitivity) => {
    if (sensitivity <= 2) {
      return {
        name: "스타벅스 (Starbucks)",
        description: "다양한 원두와 샷 추가 옵션으로 강도를 조절하기 좋습니다. 카페인에 강한 당신에게 진한 풍미를 추천합니다.",
        logo: "https://placehold.co/100x100/036635/FFFFFF?text=Starbucks"
      };
    } else if (sensitivity === 3) {
      return {
        name: "투썸플레이스 (A Twosome Place)",
        description: "균형 잡힌 블렌드로 누구나 부담 없이 즐길 수 있습니다. 부드러운 라떼나 아메리카노를 추천합니다.",
        logo: "https://placehold.co/100x100/000000/FFFFFF?text=Twosome"
      };
    } else { 
      return {
        name: "폴 바셋 (Paul Bassett)",
        description: "디카페인 메뉴가 훌륭하고 원두 본연의 부드러운 산미를 잘 살립니다. 카페인 걱정 없이 풍미를 즐겨보세요.",
        logo: "https://placehold.co/100x100/D9042B/FFFFFF?text=Paul+Bassett"
      };
    }
  };

  // 추천 내용을 HTML에 렌더링
  const renderRecommendation = () => {
    const sensitivity = getSensitivityFromURL();
    const recommendation = getFranchiseRecommendation(sensitivity);
    const container = document.getElementById("franchise-recommendation");
    
    if (container && recommendation) {
      container.innerHTML = `
        <h3>🎉 당신을 위한 프렌차이즈 추천</h3>
        <div class="recommend-content">
          <img src="${recommendation.logo}" alt="${recommendation.name} 로고">
          <div>
            <strong>${recommendation.name}</strong>
            <p>${recommendation.description}</p>
          </div>
        </div>
      `;
    }
  };

  // (새로 추가) 설문 결과를 가져와서 HTML에 렌더링
  const renderSurveyResults = async () => {
    const resultsContainer = document.getElementById("survey-results-summary");
    if (!resultsContainer) return;

    try {
      // Google Apps Script에서 데이터 가져오기 (GET)
      const response = await fetch(GOOGLE_SCRIPT_DATA_URL, { method: "GET" });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();

      if (result.status === "success" && result.data) {
        const data = result.data;
        const totalResponses = data.length;

        if (totalResponses === 0) {
           resultsContainer.innerHTML = `
            <h3>📊 설문 결과 요약</h3>
            <p>아직 집계된 데이터가 없습니다. 첫 번째 설문을 제출해주세요!</p>`;
           return;
        }

        // --- 데이터 통계 계산 ---
        const dailyAmountCounts = {};
        const sensitivitySum = data.reduce((sum, row) => sum + parseInt(row[1], 10), 0); // sensitivity = index 1
        const avgSensitivity = (sensitivitySum / totalResponses).toFixed(1);
        const favoriteCafeCounts = {};
        const brewTypeCounts = {};
        const beanTypeCounts = {};

        data.forEach(row => {
          // Code.gs의 doGet에서 타임스탬프를 제외했으므로
          // row[0]=dailyAmount, row[1]=sensitivity, row[2]=favoriteCafe, row[3]=brewType, row[4]=beanType
          dailyAmountCounts[row[0]] = (dailyAmountCounts[row[0]] || 0) + 1;
          favoriteCafeCounts[row[2]] = (favoriteCafeCounts[row[2]] || 0) + 1;
          brewTypeCounts[row[3]] = (brewTypeCounts[row[3]] || 0) + 1;
          beanTypeCounts[row[4]] = (beanTypeCounts[row[4]] || 0) + 1;
        });

        // 가장 많이 선택된 항목 찾기
        const getMostFrequent = (counts) => {
            if (Object.keys(counts).length === 0) return "N/A";
            return Object.entries(counts).sort(([,a],[,b]) => b-a)[0][0];
        };

        // --- HTML로 렌더링 ---
        resultsContainer.innerHTML = `
          <h3>📊 설문 결과 요약</h3>
          <div class="results-grid">
            <div class="result-item">
              <strong>총 응답 수</strong>
              <p>${totalResponses} 명</p>
            </div>
            <div class="result-item">
              <strong>평균 카페인 민감도</strong>
              <p>${avgSensitivity} / 5 점</p>
            </div>
            <div class="result-item">
              <strong>가장 많은 하루 커피량</strong>
              <p>${getMostFrequent(dailyAmountCounts)}</p>
            </div>
            <div class="result-item">
              <strong>가장 인기있는 카페</strong>
              <p>${getMostFrequent(favoriteCafeCounts)}</p>
            </div>
            <div class="result-item">
              <strong>선호 추출 방식</strong>
              <p>${getMostFrequent(brewTypeCounts)}</p>
            </div>
            <div class="result-item">
              <strong>선호 원두 타입</strong>
              <p>${getMostFrequent(beanTypeCounts)}</p>
            </div>
          </div>
        `;
      } else {
        throw new Error(result.message || "데이터 형식이 잘못되었습니다.");
      }
    } catch (error) {
      console.error("Failed to fetch survey results:", error);
      resultsContainer.innerHTML = `
        <h3>📊 설문 결과 요약</h3>
        <p style="color:red;">설문 결과를 불러오는 중 오류가 발생했습니다: ${error.message}</p>
        <p>Google Apps Script의 <strong>Code.gs</strong>가 올바르게 수정 및 <strong>재배포</strong> 되었는지, <strong>SPREADSHEET_ID</strong>와 <strong>SHEET_NAME</strong>이 올바른지 확인해주세요.</p>
      `;
    }
  };
  
  // HTML 문서 로딩이 완료되면 두 함수를 모두 실행
  window.addEventListener("DOMContentLoaded", () => {
    renderRecommendation(); // 1. 추천 렌더링
    renderSurveyResults();  // 2. 설문 결과 렌더링
  });
}


