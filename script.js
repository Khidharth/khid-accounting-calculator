const principal = document.getElementById("principal");
const rate = document.getElementById("rate");
const time = document.getElementById("time");

const calculateButton = document.getElementById("calculateInterest");
const result = document.getElementById("result");

calculateButton.addEventListener("click", function () {

    const P = Number(principal.value);
    const R = Number(rate.value);
    const T = Number(time.value);

    const interest = (P * R * T) / 100;
    const amount = P + interest;

    result.textContent =
        "Interest: ₦" + interest.toLocaleString() +
        " | Amount: ₦" + amount.toLocaleString();
});

const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        themeToggle.textContent = "☀️ Light Mode";
    } else {
        themeToggle.textContent = "🌙 Dark Mode";
    }

});
