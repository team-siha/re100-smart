// ③ 식집사 자격증 - 문제 은행(40개쯤)에서 매일 8문제를 랜덤으로 (어제 문제와는 1~2개만 겹쳐요), 정답 수별 포인트 차등 지급

requireProfile();
renderTabbar("mission");

const NAME_POOL = ["씩씩이", "초록이", "쑥쑥이", "몽글이", "새싹이", "푸릇이", "싱싱이", "뽀송이", "아람이", "잎새"];
const SNACK_POOL = ["양파링", "포카칩", "꽃게랑", "포스틱", "허니버터칩", "자갈치", "감자깡", "콘초", "바나나킥"];

let quizIndex = 0;
let correctCount = 0;
let quiz = [];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 정답 하나 + 오답 두 개
function choices(correct, pool) {
  return shuffle([correct].concat(shuffle(pool.filter((v) => v !== correct)).slice(0, 2)));
}

const QUIZ_SIZE = 8;

// 누구에게나 같은 상식 문제 (예/아니요)
const COMMON_YESNO = [
  // 화분 만드는 법·키우는 방법처럼 팀이 정할 내용은 문제로 내지 않아요
  ["Q. 물은 많이 줄수록 식물에게 무조건 좋다.", false],
  ["Q. 비타민C는 물에 녹는 수용성 비타민이다.", true],
  ["Q. 비타민A는 물에 녹는 수용성 비타민이다.", false],
  ["Q. 베타카로틴은 몸속에서 비타민A로 바뀔 수 있다.", true],
  ["Q. 식물의 초록색을 내는 색소는 클로로필이다.", true],
  ["Q. 안토시아닌은 pH에 따라 붉은색, 푸른색, 보라색으로 색이 달라진다.", true],
  ["Q. 클로로필이 사람에게 주는 건강 효능은 이미 충분히 입증되었다.", false],
  ["Q. 상추는 겉잎부터 하나씩 따 먹으면 계속 수확할 수 있다.", true],
  ["Q. 비타민C는 콜라겐 합성과 철분 흡수를 돕는다.", true],
  ["Q. 비타민K는 뼈 건강 유지에 도움을 준다.", true],
  ["Q. 와파린 같은 항응고제를 먹는 사람은 비타민K가 많은 채소를 먹는 양을 일정하게 유지하는 게 좋다.", true],
  ["Q. 청경채는 꿀풀과에 속하는 허브다.", false],
  ["Q. 바질과 민트는 같은 꿀풀과 허브다.", true],
  ["Q. 로메인은 잎이 짧고 동글동글하다.", false],
  ["Q. 다 먹은 과자봉지를 화분으로 쓰면 쓰레기를 줄일 수 있다.", true],
];

// 누구에게나 같은 상식 문제 (보기 고르기)
const COMMON_CHOICE = [
  ["Q. 적상추 잎이 붉거나 보랏빛을 띠게 하는 색소는?", "안토시아닌", ["클로로필", "베타카로틴"]],
  ["Q. 민트를 먹으면 시원하게 느껴지게 하는 성분은?", "멘톨", ["리날룰", "안토시아닌"]],
  ["Q. 바질의 향을 만드는 성분이 아닌 것은?", "칼슘", ["유제놀", "리날룰"]],
  ["Q. 다음 중 꿀풀과 허브가 아닌 것은?", "청상추", ["바질", "민트"]],
  ["Q. 수확까지 가장 빨리 자라는 작물은?", "청경채", ["로메인", "민트"]],
  ["Q. 잎이 위로 차곡차곡 겹쳐 자라는 반결구형 작물은?", "로메인", ["청경채", "바질"]],
  ["Q. 뼈와 치아를 이루는 데 필요한 영양소는?", "칼슘", ["멘톨", "클로로필"]],
  ["Q. 청경채가 속한 채소 가족은?", "십자화과", ["꿀풀과", "국화과"]],
];

// 문제 은행: 내 식물 맞춤 문제 + 상식 문제 (id로 날마다 겹치는 문제를 셀 수 있어요)
function buildPool() {
  const profile = loadProfile();
  const plantId = PLANT_FACTS[profile.plantId] ? profile.plantId : "basil";
  const plant = PLANTS[plantId];
  const call = getPlantCallName(profile);
  const facts = PLANT_FACTS[plantId];
  const ranges = Object.keys(GROWTH_PLANS).map((id) => GROWTH_PLANS[id].range);
  const uniqueRanges = ranges.filter((r, i) => ranges.indexOf(r) === i);
  const plantNames = Object.keys(PLANTS).map((id) => PLANTS[id].name);
  const plantTypes = Object.keys(PLANTS).map((id) => PLANTS[id].type);

  const pool = [
    { id: "my-name", type: "choice", text: "Q. 내가 키우는 " + plant.name + "의 이름은?", answer: call, options: choices(call, NAME_POOL.concat(call)) },
    {
      id: "my-snack", type: "choice", text: "Q. 내 " + call + "의 집, 과자봉지 화분은?",
      answer: profile.snackName, options: choices(profile.snackName, SNACK_POOL.concat(profile.snackName)),
    },
    {
      id: "my-harvest", type: "choice", text: "Q. " + plant.name + " 수확까지 얼마나 걸릴까?",
      answer: GROWTH_PLANS[plantId].range, options: choices(GROWTH_PLANS[plantId].range, uniqueRanges),
    },
    { id: "my-kind", type: "choice", text: "Q. 내 " + call + "의 작물 종류는?", answer: plant.name, options: choices(plant.name, plantNames) },
    { id: "my-type", type: "choice", text: "Q. 식물 MBTI로 본 내 " + call + "의 유형은?", answer: plant.type, options: choices(plant.type, plantTypes) },
  ];
  QUIZ_QUESTIONS.forEach((q) => pool.push({ id: "fact-" + q.key, type: "yesno", text: q.text, answer: facts[q.key] }));
  COMMON_YESNO.forEach(([text, answer], i) => pool.push({ id: "yn-" + i, type: "yesno", text, answer }));
  COMMON_CHOICE.forEach(([text, answer, wrong], i) =>
    pool.push({ id: "ch-" + i, type: "choice", text, answer, options: shuffle([answer].concat(wrong)) })
  );
  return pool;
}

// 오늘의 8문제: 같은 날은 같은 문제, 다음 날엔 어제 문제 중 1~2개만 다시 나와요
function buildQuiz() {
  const profile = loadProfile();
  const pool = buildPool();
  const byId = {};
  pool.forEach((q) => (byId[q.id] = q));
  const today = todayKey();
  const saved = profile.quizSet;

  let ids;
  if (saved && saved.day === today && saved.ids.every((id) => byId[id])) {
    ids = saved.ids;
  } else {
    const prev = saved ? saved.ids.filter((id) => byId[id]) : [];
    const keepCount = Math.min(prev.length, 1 + Math.floor(Math.random() * 2));
    const keep = shuffle(prev).slice(0, keepCount);
    const fresh = shuffle(pool.map((q) => q.id).filter((id) => !prev.includes(id))).slice(0, QUIZ_SIZE - keep.length);
    ids = shuffle(keep.concat(fresh));
    profile.quizSet = { day: today, ids: ids };
    saveProfile(profile);
  }
  return ids.map((id) => byId[id]);
}

renderCharacterInto("certChar", loadProfile().plantId);

document.getElementById("startQuizBtn").addEventListener("click", () => {
  quiz = buildQuiz();
  quizIndex = 0;
  correctCount = 0;
  document.getElementById("step-intro").style.display = "none";
  document.getElementById("step-quiz").style.display = "block";
  renderQuestion();
});

function renderQuestion() {
  const q = quiz[quizIndex];
  document.getElementById("quizCount").textContent = quizIndex + 1 + " / " + quiz.length;
  document.getElementById("quizFill").style.width = ((quizIndex + 1) / quiz.length) * 100 + "%";
  document.getElementById("quizQuestionText").textContent = q.text;

  const box = document.getElementById("quizAnswers");
  box.innerHTML = "";
  box.className = "quiz-answers " + q.type;
  const opts = q.type === "yesno" ? [{ label: "예", value: true }, { label: "아니요", value: false }] : q.options.map((o) => ({ label: o, value: o }));
  opts.forEach((o, i) => {
    const b = document.createElement("button");
    b.className = "btn" + (q.type === "yesno" && i === 1 ? " secondary" : q.type === "choice" ? " ghost" : "");
    b.textContent = o.label;
    b.addEventListener("click", () => answerQuiz(o.value));
    box.appendChild(b);
  });
}

function answerQuiz(value) {
  if (value === quiz[quizIndex].answer) correctCount += 1;
  quizIndex += 1;
  if (quizIndex < quiz.length) renderQuestion();
  else showQuizResult();
}

function showQuizResult() {
  const profile = loadProfile();
  document.getElementById("step-quiz").style.display = "none";
  document.getElementById("step-quiz-result").style.display = "block";

  // 포인트는 하루 첫 시험만 (같은 문제를 계속 풀어서 모으지 않게)
  const firstToday = profile.quizRewardDay !== todayKey();
  const points = firstToday ? scoreToPoints(correctCount) : 0;
  if (firstToday) {
    profile.quizRewardDay = todayKey();
    saveProfile(profile);
  }
  // 포인트는 미션 보상함에 쌓여요 → '미션'에서 [포인트 받기]
  const label = "식집사 자격증 (" + correctCount + "/" + quiz.length + ")";
  if (points > 0) grantReward("quiz-" + todayKey(), label, points);
  const grade = scoreToGrade(correctCount);

  document.getElementById("quizResult").innerHTML =
    '<div class="cert-ribbon">발급 완료</div>' +
    '<div class="char-box medium cert-char">' + getCharacterSvg(profile.plantId) + '<span class="cert-crown">' + grade.emoji + "</span></div>" +
    '<div class="cert-title">' + grade.title + "</div>" +
    '<div class="cert-grade">' + grade.grade + "</div>" +
    '<div class="cert-desc">' + correctCount + " / " + quiz.length + " 문제 정답! 내 <b>" + escapeHtml(getPlantCallName(profile)) +
    "</b> 기준으로 채점했어요.<br/>" +
    (!firstToday
      ? "오늘은 이미 보상을 받았어요. 내일 또 도전해요!"
      : points > 0
        ? "보상 <b>+" + points + "P</b> 도착! 🎁 '미션'에서 [포인트 받기]를 눌러주세요"
        : "아쉽게 보상은 없어요. 내일 또 도전해요!") + "</div>" +
    (firstToday && points > 0 ? '<a class="btn" href="missions.html" style="margin-top:12px;">🎁 포인트 받으러 가기</a>' : "");
}
