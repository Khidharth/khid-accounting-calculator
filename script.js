/* =========================================================
   KHID MULTIPURPOSE CALCULATOR
   ACCOUNTING + FINANCE + MATHEMATICS + STATISTICS + ECONOMICS
========================================================= */


/* =========================================================
   DARK MODE
========================================================= */

const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {

    // Load saved theme
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = "☀️ Light Mode";
    }

    themeToggle.addEventListener("click", function () {

        document.body.classList.toggle("dark-mode");

        const isDark =
            document.body.classList.contains("dark-mode");

        if (isDark) {
            themeToggle.textContent = "☀️ Light Mode";
            localStorage.setItem("theme", "dark");
        } else {
            themeToggle.textContent = "🌙 Dark Mode";
            localStorage.setItem("theme", "light");
        }

    });

}


/* =========================================================
   MAIN ELEMENTS
========================================================= */

const categorySelect = document.getElementById("categorySelect");
const calculatorSelect = document.getElementById("calculatorSelect");
const calculatorForm = document.getElementById("calculatorForm");
const calculatorTitle = document.getElementById("calculatorTitle");
const calculateButton = document.getElementById("calculateButton");
const result = document.getElementById("result");


/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function money(value) {

    return "₦" + Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

}


function number(value) {

    return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
    });

}


function percent(value) {

    return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
    }) + "%";

}


function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function getNumber(id) {

    const element = document.getElementById(id);

    if (!element) {
        return NaN;
    }

    return Number(element.value);

}


function getText(id) {

    const element = document.getElementById(id);

    if (!element) {
        return "";
    }

    return element.value.trim();

}


function getArray(id) {

    const value = getText(id);

    return value
        .split(",")
        .map(item => Number(item.trim()))
        .filter(item => !Number.isNaN(item));

}


function validateNumbers(values) {

    return values.every(value => Number.isFinite(value));

}


function average(values) {

    return values.reduce((sum, value) => sum + value, 0) / values.length;

}


function sum(values) {

    return values.reduce((total, value) => total + value, 0);

}


function factorial(n) {

    if (n < 0 || !Number.isInteger(n)) {
        return NaN;
    }

    let result = 1;

    for (let i = 2; i <= n; i++) {
        result *= i;
    }

    return result;

}


function combinations(n, r) {

    if (
        n < 0 ||
        r < 0 ||
        r > n ||
        !Number.isInteger(n) ||
        !Number.isInteger(r)
    ) {
        return NaN;
    }

    return factorial(n) / (factorial(r) * factorial(n - r));

}


function resultTemplate(formula, working, answer, interpretation = "") {

    return `

        <div class="result-section">

            <h4>Formula</h4>

            <div class="formula-box">
                ${formula}
            </div>

        </div>

        <div class="result-section">

            <h4>Working</h4>

            <div class="working-box">
                ${working}
            </div>

        </div>

        <div class="result-section">

            <h4>Answer</h4>

            <p>
                <strong>${answer}</strong>
            </p>

        </div>

        ${
            interpretation
                ? `
                <div class="result-section">

                    <h4>Interpretation</h4>

                    <div class="interpretation-box">
                        ${interpretation}
                    </div>

                </div>
                `
                : ""
        }

    `;

}


function errorMessage(message) {

    return `
        <div class="error-message">
            ${message}
        </div>
    `;

}


/* =========================================================
   INTERPRETATION HELPERS
========================================================= */

function interpretCorrelation(r) {

    const abs = Math.abs(r);

    let strength;

    if (abs >= 0.8) {
        strength = "Strong";
    } else if (abs >= 0.5) {
        strength = "Moderate";
    } else if (abs > 0) {
        strength = "Weak";
    } else {
        strength = "No";
    }

    if (r > 0) {
        return `${strength} positive correlation. As one variable increases, the other tends to increase.`;
    }

    if (r < 0) {
        return `${strength} negative correlation. As one variable increases, the other tends to decrease.`;
    }

    return "No linear correlation between the variables.";

}


function interpretPED(value) {

    const abs = Math.abs(value);

    if (!Number.isFinite(value)) {
        return "Perfectly elastic.";
    }

    if (abs > 1) {
        return "Elastic demand. Quantity demanded changes proportionately more than price.";
    }

    if (abs < 1) {
        return "Inelastic demand. Quantity demanded changes proportionately less than price.";
    }

    return "Unit elastic demand. The percentage change in quantity demanded equals the percentage change in price.";

}


function interpretPES(value) {

    const abs = Math.abs(value);

    if (!Number.isFinite(value)) {
        return "Perfectly elastic supply.";
    }

    if (abs > 1) {
        return "Elastic supply. Quantity supplied changes proportionately more than price.";
    }

    if (abs < 1) {
        return "Inelastic supply. Quantity supplied changes proportionately less than price.";
    }

    return "Unit elastic supply.";

}


function interpretIncomeElasticity(value) {

    if (value < 0) {
        return "Inferior good. Demand decreases as consumer income increases.";
    }

    if (value === 0) {
        return "Income-inelastic demand with no response to income in this calculation.";
    }

    if (value < 1) {
        return "Normal necessity good. Demand increases with income, but proportionately less than income.";
    }

    if (value === 1) {
        return "Unit income elasticity. Demand changes proportionately with income.";
    }

    return "Normal luxury good. Demand increases proportionately more than income.";

}


function interpretCrossElasticity(value) {

    if (value > 0) {
        return "Substitute goods. An increase in the price of one good is associated with an increase in demand for the other.";
    }

    if (value < 0) {
        return "Complementary goods. An increase in the price of one good is associated with a decrease in demand for the other.";
    }

    return "The goods are approximately unrelated based on the calculated cross elasticity.";

}


function interpretSkewness(value) {

    if (value > 0) {
        return "Positively skewed (right-skewed). The distribution has a longer tail toward the right.";
    }

    if (value < 0) {
        return "Negatively skewed (left-skewed). The distribution has a longer tail toward the left.";
    }

    return "Approximately symmetrical.";

}


function interpretKurtosis(beta2) {

    if (beta2 > 3) {
        return "Leptokurtic. The distribution is more peaked/heavy-tailed than the normal distribution.";
    }

    if (beta2 < 3) {
        return "Platykurtic. The distribution is less peaked/flatter than the normal distribution.";
    }

    return "Mesokurtic. The distribution has kurtosis equal to that of the normal distribution.";
}


/* =========================================================
   CALCULATOR DEFINITIONS
========================================================= */

const calculators = {


/* =========================================================
   ACCOUNTING
========================================================= */

accounting: {


    "straight-line-depreciation": {

        title: "Straight-Line Depreciation",

        fields: [
            ["cost", "Asset Cost (₦)", "number"],
            ["residual", "Residual Value (₦)", "number"],
            ["life", "Useful Life (Years)", "number"]
        ],

        formula: "Annual Depreciation = (Cost − Residual Value) ÷ Useful Life",

        calculate(v) {

            const depreciation =
                (v.cost - v.residual) / v.life;

            const monthly =
                depreciation / 12;

            return resultTemplate(
                "(Cost − Residual Value) ÷ Useful Life",

                `(${money(v.cost)} − ${money(v.residual)}) ÷ ${v.life}<br><br>
                 Annual depreciation = ${money(depreciation)}<br>
                 Monthly depreciation = ${money(monthly)}`,

                `Annual Depreciation = ${money(depreciation)}<br>
                 Monthly Depreciation = ${money(monthly)}`
            );

        }

    },


    "reducing-balance": {

        title: "Reducing-Balance Depreciation",

        fields: [
            ["cost", "Asset Cost (₦)", "number"],
            ["rate", "Depreciation Rate (%)", "number"],
            ["years", "Number of Years", "number"]
        ],

        formula: "Depreciation = Opening Book Value × Depreciation Rate",

        calculate(v) {

            let bookValue = v.cost;
            let rows = "";

            for (let year = 1; year <= v.years; year++) {

                const depreciation =
                    bookValue * (v.rate / 100);

                const closing =
                    bookValue - depreciation;

                rows += `
                    Year ${year}:<br>
                    Opening = ${money(bookValue)}<br>
                    Depreciation = ${money(depreciation)}<br>
                    Closing = ${money(closing)}<br><br>
                `;

                bookValue = closing;

            }

            return resultTemplate(
                "Depreciation = Opening Book Value × Rate",

                rows,

                `Closing Book Value = ${money(bookValue)}`
            );

        }

    },


    "book-value": {

        title: "Book Value",

        fields: [
            ["cost", "Asset Cost (₦)", "number"],
            ["accumulated", "Accumulated Depreciation (₦)", "number"]
        ],

        formula: "Book Value = Cost − Accumulated Depreciation",

        calculate(v) {

            const bookValue =
                v.cost - v.accumulated;

            return resultTemplate(
                "Book Value = Cost − Accumulated Depreciation",

                `${money(v.cost)} − ${money(v.accumulated)}
                 = ${money(bookValue)}`,

                `Book Value = ${money(bookValue)}`
            );

        }

    },


    "gross-profit": {

        title: "Gross Profit",

        fields: [
            ["sales", "Sales (₦)", "number"],
            ["cogs", "Cost of Goods Sold (₦)", "number"]
        ],

        formula: "Gross Profit = Sales − COGS",

        calculate(v) {

            const profit =
                v.sales - v.cogs;

            return resultTemplate(
                "Gross Profit = Sales − COGS",

                `${money(v.sales)} − ${money(v.cogs)}
                 = ${money(profit)}`,

                `Gross Profit = ${money(profit)}`
            );

        }

    },


    "gross-profit-margin": {

        title: "Gross Profit Margin",

        fields: [
            ["sales", "Sales (₦)", "number"],
            ["cogs", "Cost of Goods Sold (₦)", "number"]
        ],

        formula: "Gross Profit Margin = (Gross Profit ÷ Sales) × 100",

        calculate(v) {

            const grossProfit =
                v.sales - v.cogs;

            const margin =
                (grossProfit / v.sales) * 100;

            return resultTemplate(
                "(Gross Profit ÷ Sales) × 100",

                `Gross Profit = ${money(v.sales)} − ${money(v.cogs)}
                 = ${money(grossProfit)}<br><br>
                 (${money(grossProfit)} ÷ ${money(v.sales)}) × 100`,

                `Gross Profit Margin = ${percent(margin)}`
            );

        }

    },


    "net-profit": {

        title: "Net Profit",

        fields: [
            ["sales", "Sales (₦)", "number"],
            ["cogs", "COGS (₦)", "number"],
            ["expenses", "Operating Expenses (₦)", "number"]
        ],

        formula: "Net Profit = Sales − COGS − Expenses",

        calculate(v) {

            const profit =
                v.sales - v.cogs - v.expenses;

            return resultTemplate(
                "Net Profit = Sales − COGS − Expenses",

                `${money(v.sales)} − ${money(v.cogs)} − ${money(v.expenses)}
                 = ${money(profit)}`,

                `Net Profit = ${money(profit)}`
            );

        }

    },


    "net-profit-margin": {

        title: "Net Profit Margin",

        fields: [
            ["sales", "Sales (₦)", "number"],
            ["cogs", "COGS (₦)", "number"],
            ["expenses", "Operating Expenses (₦)", "number"]
        ],

        formula: "Net Profit Margin = (Net Profit ÷ Sales) × 100",

        calculate(v) {

            const profit =
                v.sales - v.cogs - v.expenses;

            const margin =
                (profit / v.sales) * 100;

            return resultTemplate(
                "(Net Profit ÷ Sales) × 100",

                `Net Profit = ${money(profit)}<br><br>
                 (${money(profit)} ÷ ${money(v.sales)}) × 100`,

                `Net Profit Margin = ${percent(margin)}`
            );

        }

    },


    "markup": {

        title: "Markup",

        fields: [
            ["cost", "Cost (₦)", "number"],
            ["selling", "Selling Price (₦)", "number"]
        ],

        formula: "Markup % = ((Selling Price − Cost) ÷ Cost) × 100",

        calculate(v) {

            const markup =
                ((v.selling - v.cost) / v.cost) * 100;

            return resultTemplate(
                "((Selling Price − Cost) ÷ Cost) × 100",

                `((${money(v.selling)} − ${money(v.cost)}) ÷ ${money(v.cost)}) × 100`,

                `Markup = ${percent(markup)}`
            );

        }

    },


    "break-even": {

        title: "Break-Even Point",

        fields: [
            ["fixed", "Fixed Costs (₦)", "number"],
            ["selling", "Selling Price per Unit (₦)", "number"],
            ["variable", "Variable Cost per Unit (₦)", "number"]
        ],

        formula: "Break-Even Units = Fixed Costs ÷ (Selling Price − Variable Cost)",

        calculate(v) {

            const contribution =
                v.selling - v.variable;

            const units =
                v.fixed / contribution;

            return resultTemplate(
                "Fixed Costs ÷ (Selling Price − Variable Cost)",

                `Contribution per unit =
                 ${money(v.selling)} − ${money(v.variable)}
                 = ${money(contribution)}<br><br>

                 ${money(v.fixed)} ÷ ${money(contribution)}
                 = ${number(units)} units`,

                `Break-Even Point = ${number(units)} units`
            );

        }

    },


    "vat": {

        title: "VAT Calculation",

        fields: [
            ["amount", "Amount (₦)", "number"],
            ["rate", "VAT Rate (%)", "number"]
        ],

        formula: "VAT = Amount × VAT Rate",

        calculate(v) {

            const vat =
                v.amount * (v.rate / 100);

            const total =
                v.amount + vat;

            return resultTemplate(
                "VAT = Amount × VAT Rate",

                `${money(v.amount)} × ${v.rate}% =
                 ${money(vat)}<br><br>

                 Total including VAT =
                 ${money(v.amount)} + ${money(vat)}`,

                `VAT = ${money(vat)}<br>
                 Total = ${money(total)}`
            );

        }

    },


    "bad-debt": {

        title: "Bad Debt",

        fields: [
            ["receivable", "Customer Receivable (₦)", "number"],
            ["baddebt", "Bad Debt (₦)", "number"]
        ],

        formula: "Remaining Receivable = Receivable − Bad Debt",

        calculate(v) {

            const remaining =
                v.receivable - v.baddebt;

            return resultTemplate(
                "Remaining Receivable = Receivable − Bad Debt",

                `${money(v.receivable)} − ${money(v.baddebt)}
                 = ${money(remaining)}`,

                `Remaining Receivable = ${money(remaining)}`,

                `The amount classified as bad debt is removed from the recoverable receivable balance.`
            );

        }

    },


    "cogs": {

        title: "Cost of Goods Sold",

        fields: [
            ["opening", "Opening Inventory (₦)", "number"],
            ["purchases", "Purchases (₦)", "number"],
            ["closing", "Closing Inventory (₦)", "number"]
        ],

        formula: "COGS = Opening Inventory + Purchases − Closing Inventory",

        calculate(v) {

            const cogs =
                v.opening + v.purchases - v.closing;

            return resultTemplate(
                "Opening Inventory + Purchases − Closing Inventory",

                `${money(v.opening)} + ${money(v.purchases)}
                 − ${money(v.closing)}
                 = ${money(cogs)}`,

                `COGS = ${money(cogs)}`
            );

        }

    }

},


/* =========================================================
   FINANCE
========================================================= */

finance: {


    "simple-interest": {

        title: "Simple Interest",

        fields: [
            ["principal", "Principal (₦)", "number"],
            ["rate", "Interest Rate (%)", "number"],
            ["time", "Time (Years)", "number"]
        ],

        formula: "I = PRT ÷ 100",

        calculate(v) {

            const interest =
                (v.principal * v.rate * v.time) / 100;

            const amount =
                v.principal + interest;

            return resultTemplate(
                "I = PRT ÷ 100",

                `(${money(v.principal)} × ${v.rate} × ${v.time}) ÷ 100
                 = ${money(interest)}<br><br>
                 Amount = ${money(v.principal)} + ${money(interest)}`,

                `Interest = ${money(interest)}<br>
                 Total Amount = ${money(amount)}`
            );

        }

    },


    "compound-interest": {

        title: "Compound Interest",

        fields: [
            ["principal", "Principal (₦)", "number"],
            ["rate", "Interest Rate (%)", "number"],
            ["time", "Time (Years)", "number"]
        ],

        extraFields() {

            return `
                <div class="input-group">

                    <label for="compoundingMethod">
                        Compounding Method
                    </label>

                    <select id="compoundingMethod">

                        <option value="annually">
                            Annually
                        </option>

                        <option value="semi-annually">
                            Semi-Annually
                        </option>

                        <option value="quarterly">
                            Quarterly
                        </option>

                        <option value="monthly">
                            Monthly
                        </option>

                        <option value="daily">
                            Daily
                        </option>

                        <option value="continuous">
                            Continuously / Exponential
                        </option>

                    </select>

                </div>
            `;

        },

        calculate(v) {

            const method =
                document.getElementById("compoundingMethod").value;

            let amount;
            let formula;
            let methodName;

            if (method === "annually") {

                amount =
                    v.principal *
                    Math.pow(
                        1 + v.rate / 100,
                        v.time
                    );

                formula =
                    "A = P(1 + R)^t";

                methodName = "Annually";

            }

            else if (method === "semi-annually") {

                const n = 2;

                amount =
                    v.principal *
                    Math.pow(
                        1 + (v.rate / 100) / n,
                        n * v.time
                    );

                formula =
                    "A = P(1 + R/n)^(nt), n = 2";

                methodName = "Semi-Annually";

            }

            else if (method === "quarterly") {

                const n = 4;

                amount =
                    v.principal *
                    Math.pow(
                        1 + (v.rate / 100) / n,
                        n * v.time
                    );

                formula =
                    "A = P(1 + R/n)^(nt), n = 4";

                methodName = "Quarterly";

            }

            else if (method === "monthly") {

                const n = 12;

                amount =
                    v.principal *
                    Math.pow(
                        1 + (v.rate / 100) / n,
                        n * v.time
                    );

                formula =
                    "A = P(1 + R/n)^(nt), n = 12";

                methodName = "Monthly";

            }

            else if (method === "daily") {

                const n = 365;

                amount =
                    v.principal *
                    Math.pow(
                        1 + (v.rate / 100) / n,
                        n * v.time
                    );

                formula =
                    "A = P(1 + R/n)^(nt), n = 365";

                methodName = "Daily";

            }

            else {

                const r =
                    v.rate / 100;

                amount =
                    v.principal *
                    Math.exp(r * v.time);

                formula =
                    "A = Pe^(rt)";

                methodName =
                    "Continuously (Exponential)";

            }

            const interest =
                amount - v.principal;

            return resultTemplate(
                formula,

                `<strong>Method:</strong> ${methodName}<br><br>
                 Principal = ${money(v.principal)}<br>
                 Rate = ${v.rate}%<br>
                 Time = ${v.time} years<br><br>
                 Amount = ${money(amount)}<br>
                 Interest = ${money(interest)}`,

                `Compound Interest = ${money(interest)}<br>
                 Total Amount = ${money(amount)}`
            );

        }

    },


    "present-value": {

        title: "Present Value",

        fields: [
            ["future", "Future Value (₦)", "number"],
            ["rate", "Interest Rate (%)", "number"],
            ["time", "Time (Years)", "number"]
        ],

        formula: "PV = FV ÷ (1 + r)^t",

        calculate(v) {

            const pv =
                v.future /
                Math.pow(
                    1 + v.rate / 100,
                    v.time
                );

            return resultTemplate(
                "PV = FV ÷ (1 + r)^t",

                `${money(v.future)} ÷
                 (1 + ${v.rate}/100)^${v.time}
                 = ${money(pv)}`,

                `Present Value = ${money(pv)}`
            );

        }

    },


    "future-value": {

        title: "Future Value",

        fields: [
            ["present", "Present Value (₦)", "number"],
            ["rate", "Interest Rate (%)", "number"],
            ["time", "Time (Years)", "number"]
        ],

        formula: "FV = PV(1 + r)^t",

        calculate(v) {

            const fv =
                v.present *
                Math.pow(
                    1 + v.rate / 100,
                    v.time
                );

            return resultTemplate(
                "FV = PV(1 + r)^t",

                `${money(v.present)} ×
                 (1 + ${v.rate}/100)^${v.time}
                 = ${money(fv)}`,

                `Future Value = ${money(fv)}`
            );

        }

    },


    "annuity": {

        title: "Future Value of an Annuity",

        fields: [
            ["payment", "Periodic Payment (₦)", "number"],
            ["rate", "Interest Rate per Period (%)", "number"],
            ["periods", "Number of Periods", "number"]
        ],

        formula: "FV = PMT × [((1 + r)^n − 1) ÷ r]",

        calculate(v) {

            const r = v.rate / 100;

            const fv =
                r === 0
                    ? v.payment * v.periods
                    : v.payment *
                      ((Math.pow(1 + r, v.periods) - 1) / r);

            return resultTemplate(
                "FV = PMT × [((1 + r)^n − 1) ÷ r]",

                `${money(v.payment)} ×
                 [((1 + ${v.rate}/100)^${v.periods} − 1)
                 ÷ ${v.rate}/100]
                 = ${money(fv)}`,

                `Future Value = ${money(fv)}`
            );

        }

    },


    "payment": {

        title: "Loan Payment / Installment",

        fields: [
            ["principal", "Loan Amount (₦)", "number"],
            ["rate", "Annual Interest Rate (%)", "number"],
            ["years", "Loan Term (Years)", "number"]
        ],

        formula: "PMT = P × [r(1+r)^n] ÷ [(1+r)^n − 1]",

        calculate(v) {

            const n =
                v.years * 12;

            const r =
                v.rate / 100 / 12;

            let payment;

            if (r === 0) {

                payment =
                    v.principal / n;

            } else {

                payment =
                    v.principal *
                    (
                        r *
                        Math.pow(1 + r, n)
                    ) /
                    (
                        Math.pow(1 + r, n) - 1
                    );

            }

            const total =
                payment * n;

            const interest =
                total - v.principal;

            return resultTemplate(
                "PMT = P × [r(1+r)^n] ÷ [(1+r)^n − 1]",

                `Monthly rate = ${percent(r * 100)}<br>
                 Number of payments = ${n}<br><br>
                 Monthly payment = ${money(payment)}<br>
                 Total repayment = ${money(total)}<br>
                 Total interest = ${money(interest)}`,

                `Monthly Payment = ${money(payment)}`
            );

        }

    },


    "sinking-fund": {

        title: "Sinking Fund",

        fields: [
            ["future", "Required Future Amount (₦)", "number"],
            ["rate", "Interest Rate per Period (%)", "number"],
            ["periods", "Number of Periods", "number"]
        ],

        formula: "PMT = FV × r ÷ [(1+r)^n − 1]",

        calculate(v) {

            const r =
                v.rate / 100;

            let payment;

            if (r === 0) {

                payment =
                    v.future / v.periods;

            } else {

                payment =
                    v.future *
                    r /
                    (
                        Math.pow(1 + r, v.periods) - 1
                    );

            }

            return resultTemplate(
                "PMT = FV × r ÷ [(1+r)^n − 1]",

                `${money(v.future)} × ${v.rate}/100 ÷
                 [(1 + ${v.rate}/100)^${v.periods} − 1]
                 = ${money(payment)}`,

                `Required Periodic Deposit = ${money(payment)}`
            );

        }

    },


    "loan-amortization": {

        title: "Loan Amortization",

        fields: [
            ["principal", "Loan Amount (₦)", "number"],
            ["rate", "Annual Interest Rate (%)", "number"],
            ["years", "Loan Term (Years)", "number"]
        ],

        formula: "Interest = Opening Balance × Periodic Interest Rate",

        calculate(v) {

            const n =
                v.years * 12;

            const r =
                v.rate / 100 / 12;

            let payment;

            if (r === 0) {

                payment =
                    v.principal / n;

            } else {

                payment =
                    v.principal *
                    (
                        r *
                        Math.pow(1 + r, n)
                    ) /
                    (
                        Math.pow(1 + r, n) - 1
                    );

            }

            let balance =
                v.principal;

            let rows = "";

            const displayMonths =
                Math.min(n, 12);

            for (let month = 1; month <= displayMonths; month++) {

                const interest =
                    balance * r;

                const principalPaid =
                    payment - interest;

                const closing =
                    balance - principalPaid;

                rows += `
                    Month ${month}:<br>
                    Opening = ${money(balance)}<br>
                    Interest = ${money(interest)}<br>
                    Principal = ${money(principalPaid)}<br>
                    Payment = ${money(payment)}<br>
                    Closing = ${money(closing)}<br><br>
                `;

                balance = closing;

            }

            return resultTemplate(
                "Interest = Opening Balance × Periodic Interest Rate",

                `<strong>Monthly Payment:</strong>
                 ${money(payment)}<br><br>
                 First ${displayMonths} month(s):<br><br>
                 ${rows}`,

                `Monthly Payment = ${money(payment)}`,

                `The amortization schedule separates each payment into interest and principal.`
            );

        }

    }

},


/* =========================================================
   MATHEMATICS
========================================================= */

mathematics: {


    "quadratic-equation": {

        title: "Quadratic Equation",

        fields: [
            ["a", "Coefficient a", "number"],
            ["b", "Coefficient b", "number"],
            ["c", "Constant c", "number"]
        ],

        formula: "x = [−b ± √(b² − 4ac)] ÷ 2a",

        calculate(v) {

            const discriminant =
                Math.pow(v.b, 2) -
                4 * v.a * v.c;

            if (discriminant < 0) {

                return resultTemplate(
                    "x = [−b ± √(b² − 4ac)] ÷ 2a",

                    `D = (${v.b})² − 4(${v.a})(${v.c})
                     = ${number(discriminant)}`,

                    "No real roots",

                    "The discriminant is negative, so the equation has complex roots rather than real roots."
                );

            }

            const x1 =
                (-v.b + Math.sqrt(discriminant)) /
                (2 * v.a);

            const x2 =
                (-v.b - Math.sqrt(discriminant)) /
                (2 * v.a);

            const interpretation =
                discriminant === 0
                    ? "The equation has one repeated real root."
                    : "The equation has two distinct real roots.";

            return resultTemplate(
                "x = [−b ± √(b² − 4ac)] ÷ 2a",

                `Discriminant = ${number(discriminant)}<br><br>
                 x₁ = ${number(x1)}<br>
                 x₂ = ${number(x2)}`,

                `x₁ = ${number(x1)}<br>
                 x₂ = ${number(x2)}`,

                interpretation
            );

        }

    },


    "simple-equation": {

        title: "Simple Linear Equation",

        fields: [
            ["a", "Coefficient a", "number"],
            ["b", "Constant b", "number"]
        ],

        formula: "ax + b = 0  →  x = −b/a",

        calculate(v) {

            const x =
                -v.b / v.a;

            return resultTemplate(
                "x = −b ÷ a",

                `x = −(${v.b}) ÷ ${v.a}
                 = ${number(x)}`,

                `x = ${number(x)}`
            );

        }

    },


    "simultaneous-equations": {

        title: "Simultaneous Equations",

        fields: [
            ["a1", "a₁", "number"],
            ["b1", "b₁", "number"],
            ["c1", "c₁", "number"],
            ["a2", "a₂", "number"],
            ["b2", "b₂", "number"],
            ["c2", "c₂", "number"]
        ],

        formula: "For a₁x + b₁y = c₁ and a₂x + b₂y = c₂, solve using elimination or substitution.",

        calculate(v) {

            const determinant =
                v.a1 * v.b2 -
                v.a2 * v.b1;

            if (determinant === 0) {

                return errorMessage(
                    "The equations do not have a unique solution."
                );

            }

            const x =
                (
                    v.c1 * v.b2 -
                    v.c2 * v.b1
                ) / determinant;

            const y =
                (
                    v.a1 * v.c2 -
                    v.a2 * v.c1
                ) / determinant;

            return resultTemplate(
                "x = (c₁b₂ − c₂b₁) ÷ (a₁b₂ − a₂b₁)",

                `Determinant = ${number(determinant)}<br><br>
                 x = ${number(x)}<br>
                 y = ${number(y)}`,

                `x = ${number(x)}<br>
                 y = ${number(y)}`
            );

        }

    },


    "indices": {

        title: "Indices / Exponents",

        fields: [
            ["base", "Base", "number"],
            ["exponent", "Exponent", "number"]
        ],

        formula: "aⁿ = a × a × ... × a",

        calculate(v) {

            const answer =
                Math.pow(v.base, v.exponent);

            return resultTemplate(
                "aⁿ = a × a × ... × a",

                `${v.base}^${v.exponent}
                 = ${number(answer)}`,

                `Answer = ${number(answer)}`
            );

        }

    },


    "logarithm": {

        title: "Logarithm",

        fields: [
            ["value", "Value", "number"],
            ["base", "Base", "number"]
        ],

        formula: "log_b(x) = ln(x) ÷ ln(b)",

        calculate(v) {

            const answer =
                Math.log(v.value) /
                Math.log(v.base);

            return resultTemplate(
                "log_b(x) = ln(x) ÷ ln(b)",

                `ln(${v.value}) ÷ ln(${v.base})
                 = ${number(answer)}`,

                `log₍${v.base}₎(${v.value}) = ${number(answer)}`
            );

        }

    },


    "percentage-change": {

        title: "Percentage Change",

        fields: [
            ["oldValue", "Original Value", "number"],
            ["newValue", "New Value", "number"]
        ],

        formula: "Percentage Change = [(New − Original) ÷ Original] × 100",

        calculate(v) {

            const change =
                ((v.newValue - v.oldValue) / v.oldValue) * 100;

            const type =
                change > 0
                    ? "increase"
                    : change < 0
                        ? "decrease"
                        : "no change";

            return resultTemplate(
                "[(New − Original) ÷ Original] × 100",

                `[( ${v.newValue} − ${v.oldValue} )
                 ÷ ${v.oldValue}] × 100
                 = ${percent(change)}`,

                `Percentage Change = ${percent(change)}`,

                `This represents a ${Math.abs(change).toFixed(2)}% ${type}.`
            );

        }

    },


    "permutation": {

        title: "Permutation",

        fields: [
            ["n", "Total Objects (n)", "number"],
            ["r", "Objects Selected (r)", "number"]
        ],

        formula: "nPr = n! ÷ (n − r)!",

        calculate(v) {

            const answer =
                factorial(v.n) /
                factorial(v.n - v.r);

            return resultTemplate(
                "nPr = n! ÷ (n − r)!",

                `${v.n}P${v.r}
                 = ${v.n}! ÷ (${v.n} − ${v.r})!
                 = ${number(answer)}`,

                `Permutation = ${number(answer)}`
            );

        }

    },


    "combination": {

        title: "Combination",

        fields: [
            ["n", "Total Objects (n)", "number"],
            ["r", "Objects Selected (r)", "number"]
        ],

        formula: "nCr = n! ÷ [r!(n − r)!]",

        calculate(v) {

            const answer =
                combinations(v.n, v.r);

            return resultTemplate(
                "nCr = n! ÷ [r!(n − r)!]",

                `${v.n}C${v.r}
                 = ${number(answer)}`,

                `Combination = ${number(answer)}`
            );

        }

    },


    "distance": {

        title: "Distance Between Two Points",

        fields: [
            ["x1", "x₁", "number"],
            ["y1", "y₁", "number"],
            ["x2", "x₂", "number"],
            ["y2", "y₂", "number"]
        ],

        formula: "d = √[(x₂ − x₁)² + (y₂ − y₁)²]",

        calculate(v) {

            const d =
                Math.sqrt(
                    Math.pow(v.x2 - v.x1, 2) +
                    Math.pow(v.y2 - v.y1, 2)
                );

            return resultTemplate(
                "d = √[(x₂ − x₁)² + (y₂ − y₁)²]",

                `d = √[(${v.x2} − ${v.x1})² +
                 (${v.y2} − ${v.y1})²]
                 = ${number(d)}`,

                `Distance = ${number(d)}`
            );

        }

    },


    "midpoint": {

        title: "Midpoint",

        fields: [
            ["x1", "x₁", "number"],
            ["y1", "y₁", "number"],
            ["x2", "x₂", "number"],
            ["y2", "y₂", "number"]
        ],

        formula: "M = ((x₁ + x₂) ÷ 2, (y₁ + y₂) ÷ 2)",

        calculate(v) {

            const x =
                (v.x1 + v.x2) / 2;

            const y =
                (v.y1 + v.y2) / 2;

            return resultTemplate(
                "M = ((x₁ + x₂) ÷ 2, (y₁ + y₂) ÷ 2)",

                `x-coordinate = (${v.x1} + ${v.x2}) ÷ 2
                 = ${number(x)}<br><br>

                 y-coordinate = (${v.y1} + ${v.y2}) ÷ 2
                 = ${number(y)}`,

                `Midpoint = (${number(x)}, ${number(y)})`
            );

        }

    },


    "gradient": {

        title: "Gradient of a Straight Line",

        fields: [
            ["x1", "x₁", "number"],
            ["y1", "y₁", "number"],
            ["x2", "x₂", "number"],
            ["y2", "y₂", "number"]
        ],

        formula: "m = (y₂ − y₁) ÷ (x₂ − x₁)",

        calculate(v) {

            if (v.x2 === v.x1) {

                return resultTemplate(
                    "m = (y₂ − y₁) ÷ (x₂ − x₁)",

                    "The denominator is zero.",

                    "Undefined gradient",

                    "The line is vertical."
                );

            }

            const m =
                (v.y2 - v.y1) /
                (v.x2 - v.x1);

            return resultTemplate(
                "m = (y₂ − y₁) ÷ (x₂ − x₁)",

                `(${v.y2} − ${v.y1}) ÷
                 (${v.x2} − ${v.x1})
                 = ${number(m)}`,

                `Gradient = ${number(m)}`,

                m > 0
                    ? "The line has a positive slope."
                    : m < 0
                        ? "The line has a negative slope."
                        : "The line is horizontal."
            );

        }

    },


    "circle-area": {

        title: "Area of a Circle",

        fields: [
            ["radius", "Radius", "number"]
        ],

        formula: "A = πr²",

        calculate(v) {

            const area =
                Math.PI * Math.pow(v.radius, 2);

            return resultTemplate(
                "A = πr²",

                `π × ${v.radius}²
                 = ${number(area)}`,

                `Area = ${number(area)} square units`
            );

        }

    },


    "trigonometry": {

        title: "Trigonometric Ratio",

        fields: [
            ["angle", "Angle (Degrees)", "number"]
        ],

        extraFields() {

            return `
                <div class="input-group">

                    <label for="trigFunction">
                        Trigonometric Function
                    </label>

                    <select id="trigFunction">

                        <option value="sin">Sine</option>
                        <option value="cos">Cosine</option>
                        <option value="tan">Tangent</option>

                    </select>

                </div>
            `;

        },

        formula: "sin θ = opposite/hypotenuse; cos θ = adjacent/hypotenuse; tan θ = opposite/adjacent",

        calculate(v) {

            const fn =
                document.getElementById("trigFunction").value;

            const radians =
                v.angle * Math.PI / 180;

            let answer;

            if (fn === "sin") {
                answer = Math.sin(radians);
            }

            else if (fn === "cos") {
                answer = Math.cos(radians);
            }

            else {
                answer = Math.tan(radians);
            }

            return resultTemplate(
                "Trigonometric ratios",

                `${fn}(${v.angle}°)
                 = ${number(answer)}`,

                `${fn}(${v.angle}°) = ${number(answer)}`
            );

        }

    },


    "differentiation-power": {

        title: "Differentiation — Power Rule",

        fields: [
            ["coefficient", "Coefficient", "number"],
            ["power", "Power", "number"]
        ],

        formula: "d/dx (axⁿ) = anxⁿ⁻¹",

        calculate(v) {

            const newCoefficient =
                v.coefficient * v.power;

            const newPower =
                v.power - 1;

            return resultTemplate(
                "d/dx (axⁿ) = anxⁿ⁻¹",

                `d/dx (${v.coefficient}x^${v.power})
                 = ${newCoefficient}x^${newPower}`,

                `Derivative = ${newCoefficient}x^${newPower}`
            );

        }

    },


    "integration-power": {

        title: "Integration — Power Rule",

        fields: [
            ["coefficient", "Coefficient", "number"],
            ["power", "Power", "number"]
        ],

        formula: "∫ axⁿ dx = [a/(n+1)]xⁿ⁺¹ + C",

        calculate(v) {

            if (v.power === -1) {

                return resultTemplate(
                    "∫ ax⁻¹ dx = a ln|x| + C",

                    `∫ ${v.coefficient}x⁻¹ dx`,

                    `${v.coefficient} ln|x| + C`
                );

            }

            const newPower =
                v.power + 1;

            const newCoefficient =
                v.coefficient / newPower;

            return resultTemplate(
                "∫ axⁿ dx = [a/(n+1)]xⁿ⁺¹ + C",

                `∫ ${v.coefficient}x^${v.power} dx
                 = ${newCoefficient}x^${newPower} + C`,

                `${newCoefficient}x^${newPower} + C`
            );

        }

    }

},


/* =========================================================
   STATISTICS
========================================================= */

statistics: {


    "mean": {

        title: "Arithmetic Mean",

        fields: [
            ["data", "Data Values (comma separated)", "text"]
        ],

        formula: "Mean = Σx ÷ n",

        calculate(v) {

            const data =
                getArray("data");

            if (data.length === 0) {
                return errorMessage("Enter valid numerical data.");
            }

            const total =
                sum(data);

            const mean =
                total / data.length;

            return resultTemplate(
                "Mean = Σx ÷ n",

                `Σx = ${number(total)}<br>
                 n = ${data.length}<br><br>
                 Mean = ${number(total)} ÷ ${data.length}`,

                `Mean = ${number(mean)}`
            );

        }

    },


    "weighted-mean": {

        title: "Weighted Mean",

        fields: [
            ["values", "Values (comma separated)", "text"],
            ["weights", "Weights (comma separated)", "text"]
        ],

        formula: "Weighted Mean = Σwx ÷ Σw",

        calculate(v) {

            const values =
                getArray("values");

            const weights =
                getArray("weights");

            if (
                values.length === 0 ||
                values.length !== weights.length
            ) {
                return errorMessage(
                    "Enter the same number of values and weights."
                );
            }

            let weightedTotal = 0;
            let weightTotal = 0;

            for (let i = 0; i < values.length; i++) {

                weightedTotal +=
                    values[i] * weights[i];

                weightTotal +=
                    weights[i];

            }

            const mean =
                weightedTotal / weightTotal;

            return resultTemplate(
                "Weighted Mean = Σwx ÷ Σw",

                `Σwx = ${number(weightedTotal)}<br>
                 Σw = ${number(weightTotal)}<br><br>
                 ${number(weightedTotal)} ÷ ${number(weightTotal)}`,

                `Weighted Mean = ${number(mean)}`
            );

        }

    },


    "median": {

        title: "Median",

        fields: [
            ["data", "Data Values (comma separated)", "text"]
        ],

        formula: "Median = Middle value after arranging data in ascending order",

        calculate(v) {

            const data =
                getArray("data").sort((a, b) => a - b);

            if (data.length === 0) {
                return errorMessage("Enter valid numerical data.");
            }

            const n =
                data.length;

            let median;

            if (n % 2 === 1) {

                median =
                    data[Math.floor(n / 2)];

            } else {

                median =
                    (
                        data[n / 2 - 1] +
                        data[n / 2]
                    ) / 2;

            }

            return resultTemplate(
                "Median = middle value after arranging the data",

                `Ordered data:<br>
                 ${data.join(", ")}<br><br>
                 Number of observations = ${n}`,

                `Median = ${number(median)}`
            );

        }

    },


    "mode": {

        title: "Mode",

        fields: [
            ["data", "Data Values (comma separated)", "text"]
        ],

        formula: "Mode = Value occurring most frequently",

        calculate(v) {

            const data =
                getArray("data");

            if (data.length === 0) {
                return errorMessage("Enter valid numerical data.");
            }

            const frequencies = {};

            data.forEach(value => {

                frequencies[value] =
                    (frequencies[value] || 0) + 1;

            });

            const maxFrequency =
                Math.max(...Object.values(frequencies));

            const modes =
                Object.keys(frequencies)
                    .filter(key => frequencies[key] === maxFrequency);

            if (maxFrequency === 1) {

                return resultTemplate(
                    "Mode = Value occurring most frequently",

                    "Every value occurs only once.",

                    "No mode",

                    "There is no repeated value in the dataset."
                );

            }

            return resultTemplate(
                "Mode = Value occurring most frequently",

                `Highest frequency = ${maxFrequency}`,

                `Mode = ${modes.join(", ")}`,

                modes.length > 1
                    ? "The dataset is multimodal."
                    : "The dataset has one mode."
            );

        }

    },


    "range": {

        title: "Range",

        fields: [
            ["data", "Data Values (comma separated)", "text"]
        ],

        formula: "Range = Maximum − Minimum",

        calculate(v) {

            const data =
                getArray("data");

            const maximum =
                Math.max(...data);

            const minimum =
                Math.min(...data);

            const range =
                maximum - minimum;

            return resultTemplate(
                "Range = Maximum − Minimum",

                `${maximum} − ${minimum}
                 = ${range}`,

                `Range = ${number(range)}`
            );

        }

    },


    "variance": {

        title: "Variance",

        fields: [
            ["data", "Data Values (comma separated)", "text"]
        ],

        formula: "Population Variance σ² = Σ(x − μ)² ÷ N",

        calculate(v) {

            const data =
                getArray("data");

            const mean =
                average(data);

            const squaredDifferences =
                data.map(x =>
                    Math.pow(x - mean, 2)
                );

            const variance =
                average(squaredDifferences);

            return resultTemplate(
                "σ² = Σ(x − μ)² ÷ N",

                `Mean = ${number(mean)}<br><br>
                 Squared deviations:<br>
                 ${squaredDifferences.map(number).join(", ")}<br><br>
                 Variance = ${number(variance)}`,

                `Variance = ${number(variance)}`
            );

        }

    },


    "standard-deviation": {

        title: "Standard Deviation",

        fields: [
            ["data", "Data Values (comma separated)", "text"]
        ],

        formula: "σ = √[Σ(x − μ)² ÷ N]",

        calculate(v) {

            const data =
                getArray("data");

            const mean =
                average(data);

            const variance =
                average(
                    data.map(
                        x => Math.pow(x - mean, 2)
                    )
                );

            const sd =
                Math.sqrt(variance);

            return resultTemplate(
                "σ = √[Σ(x − μ)² ÷ N]",

                `Mean = ${number(mean)}<br>
                 Variance = ${number(variance)}<br><br>
                 √${number(variance)}
                 = ${number(sd)}`,

                `Standard Deviation = ${number(sd)}`,

                "A larger standard deviation indicates greater spread around the mean."
            );

        }

    },


    "coefficient-variation": {

        title: "Coefficient of Variation",

        fields: [
            ["data", "Data Values (comma separated)", "text"]
        ],

        formula: "CV = (Standard Deviation ÷ Mean) × 100",

        calculate(v) {

            const data =
                getArray("data");

            const mean =
                average(data);

            const sd =
                Math.sqrt(
                    average(
                        data.map(
                            x => Math.pow(x - mean, 2)
                        )
                    )
                );

            const cv =
                (sd / mean) * 100;

            return resultTemplate(
                "CV = (SD ÷ Mean) × 100",

                `Mean = ${number(mean)}<br>
                 SD = ${number(sd)}<br><br>
                 (${number(sd)} ÷ ${number(mean)}) × 100`,

                `Coefficient of Variation = ${percent(cv)}`,

                "CV expresses relative variability. A lower CV indicates less variability relative to the mean."
            );

        }

    },


    "skewness": {

        title: "Skewness",

        fields: [
            ["data", "Data Values (comma separated)", "text"]
        ],

        extraFields() {

            return `
                <div class="input-group">

                    <label for="skewMethod">
                        Method
                    </label>

                    <select id="skewMethod">

                        <option value="pearson">
                            Pearson's Skewness
                        </option>

                        <option value="bowley">
                            Bowley's Skewness
                        </option>

                    </select>

                </div>
            `;

        },

        formula: "Pearson Skewness = 3(Mean − Median) ÷ SD",

        calculate(v) {

            const data =
                getArray("data").sort((a, b) => a - b);

            const method =
                document.getElementById("skewMethod").value;

            let coefficient;
            let formula;
            let working;

            if (method === "pearson") {

                const mean =
                    average(data);

                const n =
                    data.length;

                const median =
                    n % 2 === 1
                        ? data[Math.floor(n / 2)]
                        : (
                            data[n / 2 - 1] +
                            data[n / 2]
                        ) / 2;

                const sd =
                    Math.sqrt(
                        average(
                            data.map(
                                x => Math.pow(x - mean, 2)
                            )
                        )
                    );

                coefficient =
                    sd === 0
                        ? 0
                        : 3 * (mean - median) / sd;

                formula =
                    "Pearson Skewness = 3(Mean − Median) ÷ SD";

                working =
                    `Mean = ${number(mean)}<br>
                     Median = ${number(median)}<br>
                     SD = ${number(sd)}<br><br>
                     Skewness = ${number(coefficient)}`;

            } else {

                const n =
                    data.length;

                const median =
                    n % 2 === 1
                        ? data[Math.floor(n / 2)]
                        : (
                            data[n / 2 - 1] +
                            data[n / 2]
                        ) / 2;

                const lower =
                    data.slice(0, Math.floor(n / 2));

                const upper =
                    n % 2 === 1
                        ? data.slice(Math.floor(n / 2) + 1)
                        : data.slice(n / 2);

                const q1 =
                    average(lower);

                const q3 =
                    average(upper);

                coefficient =
                    (q3 + q1 - 2 * median) /
                    (q3 - q1);

                formula =
                    "Bowley's Skewness = (Q3 + Q1 − 2Median) ÷ (Q3 − Q1)";

                working =
                    `Q1 = ${number(q1)}<br>
                     Median = ${number(median)}<br>
                     Q3 = ${number(q3)}<br><br>
                     Skewness = ${number(coefficient)}`;

            }

            return resultTemplate(
                formula,

                working,

                `Skewness = ${number(coefficient)}`,

                interpretSkewness(coefficient)
            );

        }

    },


    "kurtosis": {

        title: "Kurtosis",

        fields: [
            ["data", "Data Values (comma separated)", "text"]
        ],

        formula: "β₂ = μ₄ ÷ μ₂²",

        calculate(v) {

            const data =
                getArray("data");

            const mean =
                average(data);

            const deviations =
                data.map(x => x - mean);

            const mu2 =
                average(
                    deviations.map(
                        x => Math.pow(x, 2)
                    )
                );

            const mu4 =
                average(
                    deviations.map(
                        x => Math.pow(x, 4)
                    )
                );

            if (mu2 === 0) {

                return errorMessage(
                    "Kurtosis cannot be calculated when all observations are identical."
                );

            }

            const beta2 =
                mu4 / Math.pow(mu2, 2);

            const excess =
                beta2 - 3;

            return resultTemplate(
                "β₂ = μ₄ ÷ μ₂²",

                `Mean = ${number(mean)}<br>
                 μ₂ = ${number(mu2)}<br>
                 μ₄ = ${number(mu4)}<br><br>
                 β₂ = ${number(beta2)}<br>
                 Excess Kurtosis = ${number(excess)}`,

                `Kurtosis = ${number(beta2)}<br>
                 Excess Kurtosis = ${number(excess)}`,

                interpretKurtosis(beta2)
            );

        }

    },


    "correlation": {

        title: "Pearson Correlation",

        fields: [
            ["xdata", "X Values (comma separated)", "text"],
            ["ydata", "Y Values (comma separated)", "text"]
        ],

        formula: "r = [nΣxy − (Σx)(Σy)] ÷ √{[nΣx² − (Σx)²][nΣy² − (Σy)²]}",

        calculate(v) {

            const x =
                getArray("xdata");

            const y =
                getArray("ydata");

            if (
                x.length === 0 ||
                x.length !== y.length
            ) {
                return errorMessage(
                    "X and Y must contain the same number of observations."
                );
            }

            const n =
                x.length;

            const sumX =
                sum(x);

            const sumY =
                sum(y);

            const sumXY =
                sum(
                    x.map(
                        (value, i) => value * y[i]
                    )
                );

            const sumX2 =
                sum(
                    x.map(value => value * value)
                );

            const sumY2 =
                sum(
                    y.map(value => value * value)
                );

            const numerator =
                n * sumXY -
                sumX * sumY;

            const denominator =
                Math.sqrt(
                    (
                        n * sumX2 -
                        Math.pow(sumX, 2)
                    ) *
                    (
                        n * sumY2 -
                        Math.pow(sumY, 2)
                    )
                );

            const r =
                numerator / denominator;

            return resultTemplate(
                "r = [nΣxy − (Σx)(Σy)] ÷ √{[nΣx² − (Σx)²][nΣy² − (Σy)²]}",

                `n = ${n}<br>
                 Σx = ${number(sumX)}<br>
                 Σy = ${number(sumY)}<br>
                 Σxy = ${number(sumXY)}<br>
                 Σx² = ${number(sumX2)}<br>
                 Σy² = ${number(sumY2)}<br><br>
                 r = ${number(r)}`,

                `Correlation coefficient = ${number(r)}`,

                interpretCorrelation(r)
            );

        }

    },


    "spearman": {

        title: "Spearman Rank Correlation",

        fields: [
            ["xdata", "X Values / Ranks (comma separated)", "text"],
            ["ydata", "Y Values / Ranks (comma separated)", "text"]
        ],

        formula: "ρ = 1 − [6Σd² ÷ n(n² − 1)]",

        calculate(v) {

            const x =
                getArray("xdata");

            const y =
                getArray("ydata");

            if (
                x.length === 0 ||
                x.length !== y.length
            ) {
                return errorMessage(
                    "Both datasets must contain the same number of observations."
                );
            }

            const n =
                x.length;

            let d2 = 0;

            const differences = [];

            for (let i = 0; i < n; i++) {

                const d =
                    x[i] - y[i];

                d2 += d * d;

                differences.push(d * d);

            }

            const rho =
                1 -
                (
                    6 * d2 /
                    (
                        n *
                        (
                            Math.pow(n, 2) - 1
                        )
                    )
                );

            return resultTemplate(
                "ρ = 1 − [6Σd² ÷ n(n² − 1)]",

                `d² values: ${differences.join(", ")}<br>
                 Σd² = ${number(d2)}<br>
                 n = ${n}<br><br>
                 ρ = ${number(rho)}`,

                `Spearman's ρ = ${number(rho)}`,

                interpretCorrelation(rho)
            );

        }

    },


    "covariance": {

        title: "Covariance",

        fields: [
            ["xdata", "X Values (comma separated)", "text"],
            ["ydata", "Y Values (comma separated)", "text"]
        ],

        formula: "Cov(X,Y) = Σ[(x − x̄)(y − ȳ)] ÷ N",

        calculate(v) {

            const x =
                getArray("xdata");

            const y =
                getArray("ydata");

            if (x.length !== y.length) {
                return errorMessage(
                    "Both datasets must contain the same number of observations."
                );
            }

            const meanX =
                average(x);

            const meanY =
                average(y);

            const products =
                x.map(
                    (value, i) =>
                        (value - meanX) *
                        (y[i] - meanY)
                );

            const covariance =
                average(products);

            return resultTemplate(
                "Cov(X,Y) = Σ[(x − x̄)(y − ȳ)] ÷ N",

                `x̄ = ${number(meanX)}<br>
                 ȳ = ${number(meanY)}<br>
                 Products of deviations:<br>
                 ${products.map(number).join(", ")}<br><br>
                 Covariance = ${number(covariance)}`,

                `Covariance = ${number(covariance)}`,

                covariance > 0
                    ? "Positive covariance indicates that the variables tend to move in the same direction."
                    : covariance < 0
                        ? "Negative covariance indicates that the variables tend to move in opposite directions."
                        : "The covariance is approximately zero."
            );

        }

    },


    "moving-average": {

        title: "Time Series — Moving Average",

        fields: [
            ["data", "Time-Series Values (comma separated)", "text"],
            ["period", "Moving Average Period", "number"]
        ],

        formula: "Moving Average = Sum of observations in the window ÷ Number of observations",

        calculate(v) {

            const data =
                getArray("data");

            const period =
                Math.floor(v.period);

            if (
                period <= 0 ||
                period > data.length
            ) {
                return errorMessage(
                    "The moving-average period must be positive and not greater than the number of observations."
                );
            }

            const averages = [];

            for (
                let i = 0;
                i <= data.length - period;
                i++
            ) {

                const window =
                    data.slice(i, i + period);

                const avg =
                    average(window);

                averages.push(avg);

            }

            const working =
                averages.map(
                    (value, i) => {

                        const window =
                            data.slice(
                                i,
                                i + period
                            );

                        return `
                            Period ${i + 1}:
                            (${window.join(" + ")})
                            ÷ ${period}
                            = ${number(value)}
                        `;

                    }
                ).join("<br><br>");

            return resultTemplate(
                "Moving Average = Sum of observations in the window ÷ Number of observations",

                working,

                `Moving Averages = ${averages.map(number).join(", ")}`,

                "Moving averages smooth short-term fluctuations and help reveal the underlying trend."
            );

        }

    },


    "weighted-moving-average": {

        title: "Time Series — Weighted Moving Average",

        fields: [
            ["data", "Time-Series Values (comma separated)", "text"],
            ["weights", "Weights (comma separated)", "text"]
        ],

        formula: "Weighted Moving Average = Σ(weight × observation) ÷ Σweights",

        calculate(v) {

            const data =
                getArray("data");

            const weights =
                getArray("weights");

            if (
                weights.length === 0 ||
                weights.length > data.length
            ) {
                return errorMessage(
                    "Enter valid weights that do not exceed the number of observations."
                );
            }

            const resultValues = [];

            for (
                let i = 0;
                i <= data.length - weights.length;
                i++
            ) {

                const window =
                    data.slice(
                        i,
                        i + weights.length
                    );

                const weighted =
                    window.reduce(
                        (total, value, index) =>
                            total +
                            value * weights[index],
                        0
                    );

                const weightTotal =
                    sum(weights);

                resultValues.push(
                    weighted / weightTotal
                );

            }

            return resultTemplate(
                "Weighted Moving Average = Σ(wx) ÷ Σw",

                `Weights = ${weights.join(", ")}<br>
                 Weighted averages:<br>
                 ${resultValues.map(number).join(", ")}`,

                `Weighted Moving Averages = ${resultValues.map(number).join(", ")}`,

                "Higher weights give greater influence to the observations assigned those weights."
            );

        }

    },


    "least-squares-trend": {

        title: "Time Series — Least-Squares Trend",

        fields: [
            ["data", "Time-Series Values (comma separated)", "text"]
        ],

        formula: "Y = a + bX",

        calculate(v) {

            const data =
                getArray("data");

            const n =
                data.length;

            const x =
                data.map(
                    (_, i) =>
                        i - (n - 1) / 2
                );

            const sumX =
                sum(x);

            const sumY =
                sum(data);

            const sumXY =
                sum(
                    x.map(
                        (value, i) =>
                            value * data[i]
                    )
                );

            const sumX2 =
                sum(
                    x.map(
                        value =>
                            value * value
                    )
                );

            const b =
                sumX2 === 0
                    ? 0
                    : sumXY / sumX2;

            const a =
                sumY / n;

            const trendValues =
                x.map(
                    value =>
                        a + b * value
                );

            const direction =
                b > 0
                    ? "Increasing"
                    : b < 0
                        ? "Decreasing"
                        : "Constant";

            return resultTemplate(
                "Y = a + bX",

                `a = ${number(a)}<br>
                 b = ${number(b)}<br><br>
                 Trend equation:<br>
                 Y = ${number(a)}
                 ${b >= 0 ? "+" : "−"}
                 ${number(Math.abs(b))}X<br><br>
                 Trend values:<br>
                 ${trendValues.map(number).join(", ")}`,

                `Trend Equation: Y = ${number(a)}
                 ${b >= 0 ? "+" : "−"}
                 ${number(Math.abs(b))}X`,

                `Trend direction: <strong>${direction}</strong>.<br>
                 The coefficient b indicates the estimated change per time period.`
            );

        }

    },


    "trend-forecast": {

        title: "Time Series — Trend Forecast",

        fields: [
            ["data", "Time-Series Values (comma separated)", "text"],
            ["futurePeriod", "Future Period Number", "number"]
        ],

        formula: "Forecast: Y = a + bX",

        calculate(v) {

            const data =
                getArray("data");

            const n =
                data.length;

            const x =
                data.map(
                    (_, i) =>
                        i - (n - 1) / 2
                );

            const meanY =
                average(data);

            const sumXY =
                sum(
                    x.map(
                        (value, i) =>
                            value * data[i]
                    )
                );

            const sumX2 =
                sum(
                    x.map(
                        value =>
                            value * value
                    )
                );

            const b =
                sumXY / sumX2;

            const a =
                meanY;

            const centeredFuture =
                v.futurePeriod -
                1 -
                (n - 1) / 2;

            const forecast =
                a + b * centeredFuture;

            return resultTemplate(
                "Y = a + bX",

                `a = ${number(a)}<br>
                 b = ${number(b)}<br>
                 Future X = ${number(centeredFuture)}<br><br>
                 Y = ${number(a)} + (${number(b)} × ${number(centeredFuture)})`,

                `Forecast = ${number(forecast)}`,

                "This is a trend-based forecast. It assumes the historical trend continues into the future."
            );

        }

    },


    "seasonal-index": {

        title: "Seasonal Index",

        fields: [
            ["actual", "Actual Value", "number"],
            ["trend", "Trend / Average Value", "number"]
        ],

        formula: "Seasonal Index = (Actual Value ÷ Trend Value) × 100",

        calculate(v) {

            const index =
                (v.actual / v.trend) * 100;

            return resultTemplate(
                "Seasonal Index = (Actual ÷ Trend) × 100",

                `(${v.actual} ÷ ${v.trend}) × 100
                 = ${percent(index)}`,

                `Seasonal Index = ${percent(index)}`,

                index > 100
                    ? "The period is above the underlying trend."
                    : index < 100
                        ? "The period is below the underlying trend."
                        : "The period is exactly at the underlying trend."
            );

        }

    }

},


/* =========================================================
   ECONOMICS
========================================================= */

economics: {


    "price-elasticity-demand": {

        title: "Price Elasticity of Demand",

        fields: [
            ["q1", "Original Quantity Demanded", "number"],
            ["q2", "New Quantity Demanded", "number"],
            ["p1", "Original Price", "number"],
            ["p2", "New Price", "number"]
        ],

        formula: "PED = % Change in Quantity Demanded ÷ % Change in Price",

        calculate(v) {

            const percentQ =
                ((v.q2 - v.q1) / v.q1) * 100;

            const percentP =
                ((v.p2 - v.p1) / v.p1) * 100;

            const ped =
                percentQ / percentP;

            return resultTemplate(
                "PED = %ΔQd ÷ %ΔP",

                `% change in Qd =
                 ${percent(percentQ)}<br><br>

                 % change in Price =
                 ${percent(percentP)}<br><br>

                 PED =
                 ${percentQ.toFixed(4)} ÷
                 ${percentP.toFixed(4)}`,

                `PED = ${number(ped)}`,

                interpretPED(ped)
            );

        }

    },


    const ped =
    percentQ / percentP;

const absolutePED =
    Math.abs(ped);

return resultTemplate(
    "PED = %ΔQd ÷ %ΔP",

    `% change in Qd =
     ${percent(percentQ)}<br><br>

     % change in Price =
     ${percent(percentP)}<br><br>

     PED =
     ${percentQ.toFixed(4)} ÷
     ${percentP.toFixed(4)}
     = ${number(absolutePED)}`,

    `PED = ${number(absolutePED)}`,

    `${interpretPED(absolutePED)}<br><br>
     <small>
     <strong>Note:</strong> PED is shown as a positive value because the negative sign reflects the inverse relationship between price and quantity demanded. The absolute value shows the degree of responsiveness.
     </small>`
);


    "income-elasticity": {

        title: "Income Elasticity of Demand",

        fields: [
            ["q1", "Original Quantity Demanded", "number"],
            ["q2", "New Quantity Demanded", "number"],
            ["y1", "Original Income", "number"],
            ["y2", "New Income", "number"]
        ],

        formula: "YED = % Change in Quantity Demanded ÷ % Change in Income",

        calculate(v) {

            const qChange =
                ((v.q2 - v.q1) / v.q1) * 100;

            const incomeChange =
                ((v.y2 - v.y1) / v.y1) * 100;

            const yed =
                qChange / incomeChange;

            return resultTemplate(
                "YED = %ΔQd ÷ %ΔIncome",

                `% change in quantity =
                 ${percent(qChange)}<br><br>

                 % change in income =
                 ${percent(incomeChange)}<br><br>

                 YED = ${number(yed)}`,

                `YED = ${number(yed)}`,

                interpretIncomeElasticity(yed)
            );

        }

    },


    "cross-elasticity": {

        title: "Cross Elasticity of Demand",

        fields: [
            ["q1", "Original Quantity of Good X", "number"],
            ["q2", "New Quantity of Good X", "number"],
            ["p1", "Original Price of Good Y", "number"],
            ["p2", "New Price of Good Y", "number"]
        ],

        formula: "XED = % Change in Quantity of X ÷ % Change in Price of Y",

        calculate(v) {

            const qChange =
                ((v.q2 - v.q1) / v.q1) * 100;

            const priceChange =
                ((v.p2 - v.p1) / v.p1) * 100;

            const xed =
                qChange / priceChange;

            return resultTemplate(
                "XED = %ΔQx ÷ %ΔPy",

                `% change in Qx =
                 ${percent(qChange)}<br><br>

                 % change in Py =
                 ${percent(priceChange)}<br><br>

                 XED = ${number(xed)}`,

                `XED = ${number(xed)}`,

                interpretCrossElasticity(xed)
            );

        }

    },


    "equilibrium": {

        title: "Market Equilibrium",

        fields: [
            ["demandA", "Demand Intercept (a)", "number"],
            ["demandB", "Demand Slope (b)", "number"],
            ["supplyC", "Supply Intercept (c)", "number"],
            ["supplyD", "Supply Slope (d)", "number"]
        ],

        formula: "Qd = a − bP and Qs = c + dP; at equilibrium Qd = Qs",

        calculate(v) {

            const price =
                (v.demandA - v.supplyC) /
                (v.demandB + v.supplyD);

            const quantity =
                v.demandA -
                v.demandB * price;

            return resultTemplate(
                "Qd = a − bP; Qs = c + dP; set Qd = Qs",

                `a − bP = c + dP<br><br>

                 ${v.demandA} − ${v.demandB}P
                 =
                 ${v.supplyC} + ${v.supplyD}P<br><br>

                 Equilibrium Price = ${number(price)}<br>
                 Equilibrium Quantity = ${number(quantity)}`,

                `Equilibrium Price = ${number(price)}<br>
                 Equilibrium Quantity = ${number(quantity)}`
            );

        }

    },


    "total-revenue": {

        title: "Total Revenue",

        fields: [
            ["price", "Price per Unit", "number"],
            ["quantity", "Quantity Sold", "number"]
        ],

        formula: "TR = P × Q",

        calculate(v) {

            const tr =
                v.price * v.quantity;

            return resultTemplate(
                "TR = P × Q",

                `${v.price} × ${v.quantity}
                 = ${number(tr)}`,

                `Total Revenue = ${number(tr)}`
            );

        }

    },


    "average-revenue": {

        title: "Average Revenue",

        fields: [
            ["revenue", "Total Revenue", "number"],
            ["quantity", "Quantity Sold", "number"]
        ],

        formula: "AR = TR ÷ Q",

        calculate(v) {

            const ar =
                v.revenue / v.quantity;

            return resultTemplate(
                "AR = TR ÷ Q",

                `${v.revenue} ÷ ${v.quantity}
                 = ${number(ar)}`,

                `Average Revenue = ${number(ar)}`
            );

        }

    },


    "marginal-revenue": {

        title: "Marginal Revenue",

        fields: [
            ["tr1", "Previous Total Revenue", "number"],
            ["tr2", "New Total Revenue", "number"],
            ["q1", "Previous Quantity", "number"],
            ["q2", "New Quantity", "number"]
        ],

        formula: "MR = ΔTR ÷ ΔQ",

        calculate(v) {

            const mr =
                (v.tr2 - v.tr1) /
                (v.q2 - v.q1);

            return resultTemplate(
                "MR = ΔTR ÷ ΔQ",

                `ΔTR = ${v.tr2} − ${v.tr1}
                 = ${number(v.tr2 - v.tr1)}<br><br>

                 ΔQ = ${v.q2} − ${v.q1}
                 = ${number(v.q2 - v.q1)}<br><br>

                 MR = ${number(mr)}`,

                `Marginal Revenue = ${number(mr)}`
            );

        }

    },


    "total-cost": {

        title: "Total Cost",

        fields: [
            ["fixed", "Fixed Cost", "number"],
            ["variable", "Variable Cost", "number"]
        ],

        formula: "TC = TFC + TVC",

        calculate(v) {

            const tc =
                v.fixed + v.variable;

            return resultTemplate(
                "TC = TFC + TVC",

                `${v.fixed} + ${v.variable}
                 = ${number(tc)}`,

                `Total Cost = ${number(tc)}`
            );

        }

    },


    "average-cost": {

        title: "Average Total Cost",

        fields: [
            ["totalCost", "Total Cost", "number"],
            ["quantity", "Quantity Produced", "number"]
        ],

        formula: "ATC = TC ÷ Q",

        calculate(v) {

            const atc =
                v.totalCost / v.quantity;

            return resultTemplate(
                "ATC = TC ÷ Q",

                `${v.totalCost} ÷ ${v.quantity}
                 = ${number(atc)}`,

                `Average Total Cost = ${number(atc)}`
            );

        }

    },


    "average-fixed-cost": {

        title: "Average Fixed Cost",

        fields: [
            ["fixed", "Total Fixed Cost", "number"],
            ["quantity", "Quantity Produced", "number"]
        ],

        formula: "AFC = TFC ÷ Q",

        calculate(v) {

            const afc =
                v.fixed / v.quantity;

            return resultTemplate(
                "AFC = TFC ÷ Q",

                `${v.fixed} ÷ ${v.quantity}
                 = ${number(afc)}`,

                `Average Fixed Cost = ${number(afc)}`
            );

        }

    },


    "average-variable-cost": {

        title: "Average Variable Cost",

        fields: [
            ["variable", "Total Variable Cost", "number"],
            ["quantity", "Quantity Produced", "number"]
        ],

        formula: "AVC = TVC ÷ Q",

        calculate(v) {

            const avc =
                v.variable / v.quantity;

            return resultTemplate(
                "AVC = TVC ÷ Q",

                `${v.variable} ÷ ${v.quantity}
                 = ${number(avc)}`,

                `Average Variable Cost = ${number(avc)}`
            );

        }

    },


    "profit": {

        title: "Economic Profit",

        fields: [
            ["revenue", "Total Revenue", "number"],
            ["cost", "Total Cost", "number"]
        ],

        formula: "Profit = Total Revenue − Total Cost",

        calculate(v) {

            const profit =
                v.revenue - v.cost;

            return resultTemplate(
                "Profit = TR − TC",

                `${v.revenue} − ${v.cost}
                 = ${number(profit)}`,

                `Profit = ${number(profit)}`,

                profit > 0
                    ? "The firm has a profit."
                    : profit < 0
                        ? "The firm has a loss."
                        : "The firm is at break-even."
            );

        }

    },


    "consumer-surplus": {

        title: "Consumer Surplus",

        fields: [
            ["maxPrice", "Maximum Willingness to Pay", "number"],
            ["marketPrice", "Market Price", "number"],
            ["quantity", "Quantity Purchased", "number"]
        ],

        formula: "Consumer Surplus = ½ × (Maximum Price − Market Price) × Quantity",

        calculate(v) {

            const cs =
                0.5 *
                (v.maxPrice - v.marketPrice) *
                v.quantity;

            return resultTemplate(
                "CS = ½ × (Maximum Price − Market Price) × Quantity",

                `½ × (${v.maxPrice} − ${v.marketPrice})
                 × ${v.quantity}
                 = ${number(cs)}`,

                `Consumer Surplus = ${number(cs)}`
            );

        }

    },


    "producer-surplus": {

        title: "Producer Surplus",

        fields: [
            ["marketPrice", "Market Price", "number"],
            ["minPrice", "Minimum Supply Price", "number"],
            ["quantity", "Quantity Sold", "number"]
        ],

        formula: "Producer Surplus = ½ × (Market Price − Minimum Price) × Quantity",

        calculate(v) {

            const ps =
                0.5 *
                (v.marketPrice - v.minPrice) *
                v.quantity;

            return resultTemplate(
                "PS = ½ × (Market Price − Minimum Price) × Quantity",

                `½ × (${v.marketPrice} − ${v.minPrice})
                 × ${v.quantity}
                 = ${number(ps)}`,

                `Producer Surplus = ${number(ps)}`
            );

        }

    },


    "total-product": {

        title: "Total Product",

        fields: [
            ["output", "Total Output", "number"]
        ],

        formula: "TP = Total Quantity of Output",

        calculate(v) {

            return resultTemplate(
                "TP = Total Quantity of Output",

                `Total output = ${v.output}`,

                `Total Product = ${number(v.output)}`
            );

        }

    },


    "average-product": {

        title: "Average Product",

        fields: [
            ["output", "Total Product", "number"],
            ["labour", "Units of Labour", "number"]
        ],

        formula: "AP = TP ÷ Labour",

        calculate(v) {

            const ap =
                v.output / v.labour;

            return resultTemplate(
                "AP = TP ÷ Labour",

                `${v.output} ÷ ${v.labour}
                 = ${number(ap)}`,

                `Average Product = ${number(ap)}`
            );

        }

    },


    "marginal-product": {

        title: "Marginal Product",

        fields: [
            ["tp1", "Previous Total Product", "number"],
            ["tp2", "New Total Product", "number"],
            ["l1", "Previous Labour", "number"],
            ["l2", "New Labour", "number"]
        ],

        formula: "MP = ΔTP ÷ ΔLabour",

        calculate(v) {

            const mp =
                (v.tp2 - v.tp1) /
                (v.l2 - v.l1);

            return resultTemplate(
                "MP = ΔTP ÷ ΔLabour",

                `ΔTP = ${v.tp2 - v.tp1}<br>
                 ΔLabour = ${v.l2 - v.l1}<br><br>
                 MP = ${number(mp)}`,

                `Marginal Product = ${number(mp)}`
            );

        }

    },


    "inflation-rate": {

        title: "Inflation Rate",

        fields: [
            ["oldIndex", "Previous Price Index", "number"],
            ["newIndex", "Current Price Index", "number"]
        ],

        formula: "Inflation Rate = [(New Index − Old Index) ÷ Old Index] × 100",

        calculate(v) {

            const inflation =
                (
                    (v.newIndex - v.oldIndex) /
                    v.oldIndex
                ) * 100;

            return resultTemplate(
                "[(New Index − Old Index) ÷ Old Index] × 100",

                `[( ${v.newIndex} − ${v.oldIndex} )
                 ÷ ${v.oldIndex}] × 100
                 = ${percent(inflation)}`,

                `Inflation Rate = ${percent(inflation)}`,

                inflation > 0
                    ? "The general price index has increased over the period."
                    : inflation < 0
                        ? "The price index has decreased over the period."
                        : "There is no change in the price index."
            );

        }

    },


    "per-capita-income": {

        title: "Per Capita Income",

        fields: [
            ["nationalIncome", "National Income", "number"],
            ["population", "Population", "number"]
        ],

        formula: "Per Capita Income = National Income ÷ Population",

        calculate(v) {

            const pci =
                v.nationalIncome /
                v.population;

            return resultTemplate(
                "Per Capita Income = National Income ÷ Population",

                `${v.nationalIncome} ÷ ${v.population}
                 = ${number(pci)}`,

                `Per Capita Income = ${number(pci)}`
            );

        }

    },


    "nominal-real-gdp": {

        title: "Real GDP",

        fields: [
            ["nominal", "Nominal GDP", "number"],
            ["priceIndex", "GDP Price Index", "number"]
        ],

        formula: "Real GDP = (Nominal GDP ÷ GDP Deflator) × 100",

        calculate(v) {

            const real =
                (v.nominal / v.priceIndex) * 100;

            return resultTemplate(
                "Real GDP = (Nominal GDP ÷ GDP Deflator) × 100",

                `(${v.nominal} ÷ ${v.priceIndex}) × 100
                 = ${number(real)}`,

                `Real GDP = ${number(real)}`
            );

        }

    },


    "gdp-deflator": {

        title: "GDP Deflator",

        fields: [
            ["nominal", "Nominal GDP", "number"],
            ["real", "Real GDP", "number"]
        ],

        formula: "GDP Deflator = (Nominal GDP ÷ Real GDP) × 100",

        calculate(v) {

            const deflator =
                (v.nominal / v.real) * 100;

            return resultTemplate(
                "(Nominal GDP ÷ Real GDP) × 100",

                `(${v.nominal} ÷ ${v.real}) × 100
                 = ${number(deflator)}`,

                `GDP Deflator = ${number(deflator)}`
            );

        }

    }

}

};


/* =========================================================
   CALCULATOR NAMES
========================================================= */

const calculatorNames = {

    "straight-line-depreciation": "Straight-Line Depreciation",
    "reducing-balance": "Reducing-Balance Depreciation",
    "book-value": "Book Value",
    "gross-profit": "Gross Profit",
    "gross-profit-margin": "Gross Profit Margin",
    "net-profit": "Net Profit",
    "net-profit-margin": "Net Profit Margin",
    "markup": "Markup",
    "break-even": "Break-Even Point",
    "vat": "VAT Calculation",
    "bad-debt": "Bad Debt",
    "cogs": "Cost of Goods Sold",

    "simple-interest": "Simple Interest",
    "compound-interest": "Compound Interest",
    "present-value": "Present Value",
    "future-value": "Future Value",
    "annuity": "Future Value of an Annuity",
    "payment": "Loan Payment / Installment",
    "sinking-fund": "Sinking Fund",
    "loan-amortization": "Loan Amortization",

    "quadratic-equation": "Quadratic Equation",
    "simple-equation": "Simple Linear Equation",
    "simultaneous-equations": "Simultaneous Equations",
    "indices": "Indices / Exponents",
    "logarithm": "Logarithm",
    "percentage-change": "Percentage Change",
    "permutation": "Permutation",
    "combination": "Combination",
    "distance": "Distance Between Two Points",
    "midpoint": "Midpoint",
    "gradient": "Gradient of a Straight Line",
    "circle-area": "Area of a Circle",
    "trigonometry": "Trigonometric Ratio",
    "differentiation-power": "Differentiation — Power Rule",
    "integration-power": "Integration — Power Rule",

    "mean": "Arithmetic Mean",
    "weighted-mean": "Weighted Mean",
    "median": "Median",
    "mode": "Mode",
    "range": "Range",
    "variance": "Variance",
    "standard-deviation": "Standard Deviation",
    "coefficient-variation": "Coefficient of Variation",
    "skewness": "Skewness",
    "kurtosis": "Kurtosis",
    "correlation": "Pearson Correlation",
    "spearman": "Spearman Rank Correlation",
    "covariance": "Covariance",
    "moving-average": "Time Series — Moving Average",
    "weighted-moving-average": "Time Series — Weighted Moving Average",
    "least-squares-trend": "Time Series — Least-Squares Trend",
    "trend-forecast": "Time Series — Trend Forecast",
    "seasonal-index": "Seasonal Index",

    "price-elasticity-demand": "Price Elasticity of Demand",
    "price-elasticity-supply": "Price Elasticity of Supply",
    "income-elasticity": "Income Elasticity of Demand",
    "cross-elasticity": "Cross Elasticity of Demand",
    "equilibrium": "Market Equilibrium",
    "total-revenue": "Total Revenue",
    "average-revenue": "Average Revenue",
    "marginal-revenue": "Marginal Revenue",
    "total-cost": "Total Cost",
    "average-cost": "Average Total Cost",
    "average-fixed-cost": "Average Fixed Cost",
    "average-variable-cost": "Average Variable Cost",
    "profit": "Economic Profit",
    "consumer-surplus": "Consumer Surplus",
    "producer-surplus": "Producer Surplus",
    "total-product": "Total Product",
    "average-product": "Average Product",
    "marginal-product": "Marginal Product",
    "inflation-rate": "Inflation Rate",
    "per-capita-income": "Per Capita Income",
    "nominal-real-gdp": "Real GDP",
    "gdp-deflator": "GDP Deflator"

};


/* =========================================================
   CATEGORY INITIALIZATION
========================================================= */

function populateCalculators() {

    const category =
        categorySelect.value;

    const categoryCalculators =
        calculators[category];

    calculatorSelect.innerHTML = "";

    Object.keys(categoryCalculators).forEach(type => {

        const option =
            document.createElement("option");

        option.value = type;

        option.textContent =
            calculatorNames[type] || type;

        calculatorSelect.appendChild(option);

    });

    showCalculator(
        calculatorSelect.value
    );

}


/* =========================================================
   SHOW SELECTED CALCULATOR
========================================================= */

function showCalculator(type) {

    const category =
        categorySelect.value;

    const calculator =
        calculators[category][type];

    if (!calculator) {
        return;
    }

    calculatorTitle.innerHTML = `
        <h2>${calculator.title}</h2>
    `;

    calculatorForm.innerHTML = "";

    calculator.fields.forEach(field => {

        const id =
            field[0];

        const label =
            field[1];

        const inputType =
            field[2];

        calculatorForm.innerHTML += `

            <div class="input-group">

                <label for="${id}">
                    ${label}
                </label>

                <input
                    id="${id}"
                    type="${inputType}"
                    ${inputType === "number" ? 'step="any"' : ""}
                    placeholder="${label}"
                >

            </div>

        `;

    });


    if (calculator.extraFields) {

        calculatorForm.innerHTML +=
            calculator.extraFields();

    }


    result.innerHTML = `

        <h3>Result</h3>

        <p>
            Enter your values and click Calculate.
        </p>

    `;

}


/* =========================================================
   CALCULATE
========================================================= */

function calculateCurrent() {

    const category =
        categorySelect.value;

    const type =
        calculatorSelect.value;

    const calculator =
        calculators[category][type];

    if (!calculator) {
        return;
    }


    const values = {};


    calculator.fields.forEach(field => {

        const id =
            field[0];

        const input =
            document.getElementById(id);

        if (!input) {
            return;
        }

        if (field[2] === "number") {

            values[id] =
                Number(input.value);

        } else {

            values[id] =
                input.value.trim();

        }

    });


    const numberFields =
        calculator.fields.filter(
            field => field[2] === "number"
        );


    for (const field of numberFields) {

        if (
            field[0] !== "data" &&
            field[0] !== "values" &&
            field[0] !== "weights" &&
            field[0] !== "xdata" &&
            field[0] !== "ydata"
        ) {

            if (
                !Number.isFinite(
                    values[field[0]]
                )
            ) {

                result.innerHTML =
                    errorMessage(
                        `Please enter a valid value for "${field[1]}".`
                    );

                return;

            }

        }

    }


    try {

        const output =
            calculator.calculate(values);

        result.innerHTML = `
            <h3>Result</h3>
            ${output}
        `;

    } catch (error) {

        console.error(error);

        result.innerHTML =
            errorMessage(
                "Something went wrong while calculating. Please check your inputs."
            );

    }

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

categorySelect.addEventListener(
    "change",
    populateCalculators
);


calculatorSelect.addEventListener(
    "change",
    function () {

        showCalculator(
            calculatorSelect.value
        );

    }
);


calculateButton.addEventListener(
    "click",
    calculateCurrent
);


/* =========================================================
   START APPLICATION
========================================================= */

populateCalculators();
