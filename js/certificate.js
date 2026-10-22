// ③ 식집사 자격증 - 8문제 (나만 아는 내 식물 문제 3개 + 식물 상식 예/아니오 5개), 정답 수별 포인트 차등 지급

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

function buildQuiz() {
  const profile = loadProfile();
  const plantId = PLANT_FACTS[profile.plantId] ? profile.plantId : "basil";
  const plant = PLANTS[plantId];
  const call = getPlantCallName(profile);
  const facts = PLANT_FACTS[plantId];
  const ranges = Object.keys(GROWTH_PLANS).map((id) => GROWTH_PLANS[id].range);
  const uniqueRanges = ranges.filter((r, i) => ranges.indexOf(r) === i);

  const personal = [
    { type: "choice", text: "Q. 내가 키우는 " + plant.name + "의 이름은?", answer: call, options: choices(call, NAME_POOL.concat(call)) },
    {
      type: "choice",
      text: "Q. 내 " + call + "의 집, 과자봉지 화분은?",
      answer: profile.snackName,
      options: choices(profile.snackName, SNACK_POOL.concat(profile.snackName)),
    },
    {
      type: "choice",
      text: "Q. " + plant.name + " 수확까지 얼마나 걸릴까?",
      answer: GROWTH_PLANS[plantId].range,
      options: choices(GROWTH_PLANS[plantId].range, uniqueRanges),
    },
  ];
  const yesNo = QUIZ_QUESTIONS.map((q) => ({
    type: "yesno",
    text: q.text,
    answer: facts[q.key],
  }));
  return personal.slice(0, 2).concat(yesNo.slice(0, 3), personal.slice(2), yesNo.slice(3));
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
  if (points > 0) addPoints(points);
  const grade = scoreToGrade(correctCount);

  document.getElementById("quizResult").innerHTML =
    '<div class="cert-ribbon">발급 완료</div>' +
    '<div class="char-box medium cert-char">' + getCharacterSvg(profile.plantId) + '<span class="cert-crown">' + grade.emoji + "</span></div>" +
    '<div class="cert-title">' + grade.title + "</div>" +
    '<div class="cert-grade">' + grade.grade + "</div>" +
    '<div class="cert-desc">' + correctCount + " / " + quiz.length + " 문제 정답! 내 <b>" + escapeHtml(getPlantCallName(profile)) +
    "</b> 기준으로 채점했어요.<br/>" +
    (firstToday ? "획득 포인트: <b>" + points + "P</b>" : "오늘은 이미 포인트를 받았어요. 내일 또 도전해요!") + "</div>";
}
