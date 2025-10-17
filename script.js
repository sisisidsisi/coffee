// 🚀 Google Apps Script 웹 앱 URL 입력
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/library/d/1kPoMEKD-yMup3GWVDIyUC0dWRydlWGWuu4jzQRkpVb18dKi93WojLMRy/1";

// --------------------- 설문 전송 (기존 기능)
const form = document.getElementById("coffeeForm");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      alert("설문이 제출되었습니다! 감사합니다 ☕");
      form.reset();
    } catch (error) {
      alert("전송 중 오류가 발생했습니다. 다시 시도해주세요.");
      console.error(error);
    }
  });
}

// --------------------- 자동 커피 추천 기능 (결과 페이지용)

// (예시용 - 실제 구현 시 Google Sheets 데이터와 연결 가능)
const surveySummary = {
  coffeeAmount: "2~3잔",
  sensitivity: 3,
  brewType: "espresso",
  beanType: "mild",
};

// 추천 알고리즘 함수
function getCoffeeRecommendation(summary) {
  const { coffeeAmount, sensitivity, brewType, beanType } = summary;
  let style = "";
  let description = "";

  // 카페인 민감도 기반
  if (sensitivity <= 2) {
    style = "스트롱 에스프레소";
    description = "카페인에 강하신 편이네요. 진한 에스프레소나 리스뜨레또 타입이 잘 어울립니다.";
  } else if (sensitivity === 3) {
    style = "밸런스 라떼";
    description = "적당한 카페인과 부드러운 우유향이 어우러진 라떼 계열이 적합합니다.";
  } else {
    style = "디카페인 드립";
    description = "카페인에 민감하신 편이에요. 산미가 부드러운 디카페인 드립 커피를 추천드려요.";
  }

  // 추출 방식/원두 조합 보정
  if (brewType === "drip" && beanType === "mild") {
    style = "마일드 핸드드립";
    description = "은은한 향과 깔끔한 맛을 좋아하신다면, 부드러운 마일드 드립 커피가 좋습니다.";
  } else if (brewType === "espresso" && beanType === "dark") {
    style = "다크 에스프레소";
    description = "깊고 진한 풍미의 다크 에스프레소가 잘 어울립니다.";
  } else if (brewType === "coldbrew") {
    style = "콜드브루 블렌드";
    description = "차갑고 깔끔한 맛을 즐기신다면, 부드러운 콜드브루를 추천드립니다.";
  }

  // 커피 섭취량에 따른 톤 조정
  if (coffeeAmount === "4잔 이상") {
    description += " 하루 섭취량이 많으니, 저카페인 블렌드로 균형을 잡는 게 좋아요.";
  }

  return { style, description };
}

// 결과 표시 (results.html에서 실행)
const recommendationContainer = document.getElementById("coffee-recommendation");
if (recommendationContainer) {
  const { style, description } = getCoffeeRecommendation(surveySummary);
  recommendationContainer.innerHTML = `
    <h3>☕ 추천 커피 스타일</h3>
    <p><strong>${style}</strong></p>
    <p>${description}</p>
  `;
}


