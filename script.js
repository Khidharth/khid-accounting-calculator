/* =========================================================
   KHID MULTIPURPOSE CALCULATOR
   ACCOUNTING + FINANCE + MATHEMATICS
   STATISTICS + ECONOMICS
========================================================= */


/* =========================================================
   DARK MODE
========================================================= */

const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {

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
   BASIC HELPERS
========================================================= */

function money(value) {

    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2
    }).format(value);

}


function number(value, decimals = 2) {

    if (!Number.isFinite(value)) {
        return "Undefined";
    }

    return Number(value).toLocaleString(
        "en-US",
        {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }
    );

}


function percent(value, decimals = 2) {

    if (!Number.isFinite(value)) {
        return "Undefined";
    }

    return `${number(value, decimals)}%`;

}


function getNumber(values, key) {

    const value = Number(values[key]);

    return value;

}


function average(values) {

    if (!values.length) return 0;

    return values.reduce(
        (a, b) => a + b,
        0
    ) / values.length;

}


function sum(values) {

    return values.reduce(
        (a, b) => a + b,
        0
    );

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

    return factorial(n) /
        (factorial(r) * factorial(n - r));

}


function permutations(n, r) {

    return factorial(n) /
        factorial(n - r);

}


function getArray(value) {

    return value
        .split(",")
        .map(Number)
        .filter(v => Number.isFinite(v));

}


/* =========================================================
   RESULT TEMPLATE
========================================================= */

function resultTemplate(
    formula,
    working,
    answer,
    interpretation = ""
) {

    return `

        <div class="formula-box">

            <strong>Formula</strong>

            <p>${formula}</p>

        </div>


        <div class="working-box">

            <strong>Working</strong>

            <p>${working}</p>

        </div>


        <div class="interpretation-box">

            <strong>Answer</strong>

            <p>${answer}</p>

            ${
                interpretation
                ? `<p><strong>Interpretation:</strong><br>${interpretation}</p>`
                : ""
            }

        </div>

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

function interpretPED(value) {

    const x = Math.abs(value);

    if (!Number.isFinite(x)) {
        return "The elasticity cannot be determined from the values entered.";
    }

    if (x > 1) {
        return "Demand is elastic: quantity demanded responds more than proportionately to price.";
    }

    if (x < 1) {
        return "Demand is inelastic: quantity demanded responds less than proportionately to price.";
    }

    return "Demand has unit elasticity: quantity demanded changes proportionately with price.";

}


function interpretPES(value) {

    const x = Math.abs(value);

    if (x > 1) {
        return "Supply is elastic.";
    }

    if (x < 1) {
        return "Supply is inelastic.";
    }

    return "Supply has unit elasticity.";

}


function interpretIncomeElasticity(value) {

    if (value < 0) {
        return "The good is an inferior good.";
    }

    if (value > 1) {
        return "The good is a luxury good.";
    }

    if (value > 0 && value <= 1) {
        return "The good is a normal necessity.";
    }

    return "The relationship is unitary.";
}


function interpretCrossElasticity(value) {

    if (value > 0) {
        return "The goods are substitutes.";
    }

    if (value < 0) {
        return "The goods are complements.";
    }

    return "The goods are unrelated.";
}


function interpretCorrelation(r) {

    const x = Math.abs(r);

    if (x >= 0.8) {
        return "Very strong correlation.";
    }

    if (x >= 0.6) {
        return "Strong correlation.";
    }

    if (x >= 0.4) {
        return "Moderate correlation.";
    }

    if (x >= 0.2) {
        return "Weak correlation.";
    }

    return "Very weak or no linear correlation.";
}


function interpretSkewness(value) {

    if (value > 0) {
        return "The distribution is positively skewed.";
    }

    if (value < 0) {
        return "The distribution is negatively skewed.";
    }

    return "The distribution is approximately symmetrical.";
}


function interpretKurtosis(beta2) {

    if (beta2 > 3) {
        return "The distribution is leptokurtic.";
    }

    if (beta2 < 3) {
        return "The distribution is platykurtic.";
    }

    return "The distribution is mesokurtic.";
}


/* =========================================================
   CALCULATORS
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

    formula:
        "Annual Depreciation = (Cost − Residual Value) ÷ Useful Life",

    calculate(v) {

        const cost = getNumber(v, "cost");
        const residual = getNumber(v, "residual");
        const life = getNumber(v, "life");

        if (life <= 0 || cost < residual) {
            return errorMessage(
                "Check the asset cost, residual value and useful life."
            );
        }

        const annual =
            (cost - residual) / life;

        const monthly =
            annual / 12;

        return resultTemplate(

            "Annual Depreciation = (Cost − Residual Value) ÷ Useful Life",

            `
            = (${money(cost)} − ${money(residual)})
              ÷ ${life}<br><br>

            Annual Depreciation =
            ${money(annual)}<br><br>

            Monthly Depreciation =
            ${money(monthly)}
            `,

            `Annual: ${money(annual)}<br>
             Monthly: ${money(monthly)}`
        );

    }

},


"reducing-balance": {

    title: "Reducing-Balance Depreciation",

    fields: [
        ["method", "Calculation Method", "select"],
        ["cost", "Asset Cost (₦)", "number"],
        ["residual", "Scrap / Residual Value (₦)", "number"],
        ["life", "Useful Life (Years)", "number"],
        ["rate", "Depreciation Rate (%)", "number"],
        ["startDate", "Start Date", "date"],
        ["endDate", "End Date", "date"],
        ["openingAccumulated", "Opening Accumulated Depreciation (₦)", "number"]
    ],

    options: {

        method: [
            ["rate", "Calculate Depreciation Rate"],
            ["depreciation", "Calculate Depreciation"]
        ]

    },

    formula:
        "Reducing Balance: Depreciation = Opening Carrying Amount × Depreciation Rate",

    calculate(v) {

        const method = v.method;

        /* =========================
           METHOD 1 — CALCULATE RATE
           ========================= */

        if (method === "rate") {

            const cost =
                getNumber(v, "cost");

            const residual =
                getNumber(v, "residual");

            const life =
                getNumber(v, "life");

            if (cost <= 0) {
                throw new Error(
                    "Asset cost must be greater than zero."
                );
            }

            if (residual < 0 || residual >= cost) {
                throw new Error(
                    "Residual value must be at least zero and less than asset cost."
                );
            }

            if (life <= 0) {
                throw new Error(
                    "Useful life must be greater than zero."
                );
            }

            /*
                S = C(1-r)^n

                r = 1 - (S/C)^(1/n)
            */

            const rate =
                (1 - Math.pow(
                    residual / cost,
                    1 / life
                )) * 100;

            return resultTemplate(

                "Reducing-Balance Rate Formula",

                `
                S = C(1 − r)<sup>n</sup><br><br>

                Rearranged:<br>

                r = 1 − (S / C)<sup>1/n</sup><br><br>

                = 1 − (${money(residual)} /
                ${money(cost)})<sup>1/${number(life)}</sup><br><br>

                Depreciation Rate =
                <strong>${percent(rate)}</strong>
                `,

                `
                <strong>Depreciation Rate:
                ${percent(rate)}</strong><br><br>

                Asset Cost:
                ${money(cost)}<br>

                Residual Value:
                ${money(residual)}<br>

                Useful Life:
                ${number(life)} years
                `
            );

        }


        /* =========================
           METHOD 2 — CALCULATE DEPRECIATION
           ========================= */

        if (method === "depreciation") {

            const cost =
                getNumber(v, "cost");

            const rate =
                getNumber(v, "rate");

            const startDate =
                v.startDate;

            const endDate =
                v.endDate;

            const openingAccumulated =
                v.openingAccumulated === ""
                    ? 0
                    : getNumber(
                        v,
                        "openingAccumulated"
                    );

            if (cost <= 0) {
                throw new Error(
                    "Asset cost must be greater than zero."
                );
            }

            if (rate < 0 || rate > 100) {
                throw new Error(
                    "Depreciation rate must be between 0% and 100%."
                );
            }

            if (!startDate || !endDate) {
                throw new Error(
                    "Please enter both the start date and end date."
                );
            }

            const start =
                new Date(startDate + "T00:00:00");

            const end =
                new Date(endDate + "T00:00:00");

            if (
                Number.isNaN(start.getTime()) ||
                Number.isNaN(end.getTime())
            ) {
                throw new Error(
                    "Please enter valid dates."
                );
            }

            if (end <= start) {
                throw new Error(
                    "End date must be after the start date."
                );
            }

            if (
                openingAccumulated < 0 ||
                openingAccumulated > cost
            ) {
                throw new Error(
                    "Opening accumulated depreciation cannot be negative or exceed asset cost."
                );
            }

            let periodStart =
                new Date(start);

            let openingBookValue =
                cost - openingAccumulated;

            let accumulated =
                openingAccumulated;

            let totalDepreciation = 0;

            let rows = "";

            let periodNumber = 1;


            while (periodStart < end) {

                let periodEnd =
                    new Date(periodStart);

                periodEnd.setFullYear(
                    periodEnd.getFullYear() + 1
                );

                if (periodEnd > end) {
                    periodEnd = new Date(end);
                }

                const days =
                    Math.round(
                        (
                            periodEnd -
                            periodStart
                        ) / 86400000
                    );

                const fraction =
                    days / 365;

                const depreciation =
                    openingBookValue *
                    (rate / 100) *
                    fraction;

                const closingBookValue =
                    openingBookValue -
                    depreciation;

                accumulated +=
                    depreciation;

                totalDepreciation +=
                    depreciation;

                rows += `

                    <tr>

                        <td style="border:1px solid #999;padding:6px;">
                            ${periodNumber}
                        </td>

                        <td style="border:1px solid #999;padding:6px;">
                            ${rbPeriodLabel(
                                periodStart,
                                periodEnd
                            )}
                        </td>

                        <td style="border:1px solid #999;padding:6px;">
                            ${money(openingBookValue)}
                        </td>

                        <td style="border:1px solid #999;padding:6px;">
                            ${money(depreciation)}
                        </td>

                        <td style="border:1px solid #999;padding:6px;">
                            ${money(accumulated)}
                        </td>

                        <td style="border:1px solid #999;padding:6px;">
                            ${money(closingBookValue)}
                        </td>

                    </tr>

                `;

                openingBookValue =
                    closingBookValue;

                periodStart =
                    periodEnd;

                periodNumber++;

                if (periodNumber > 100) {
                    break;
                }

            }


            const totalDays =
                Math.round(
                    (end - start) / 86400000
                );

            return resultTemplate(

                "Reducing-Balance Depreciation Schedule",

                `

                Asset Cost =
                ${money(cost)}<br><br>

                Depreciation Rate =
                ${percent(rate)}<br><br>

                Period =
                ${rbPeriodLabel(start, end)}<br><br>

                Total Days =
                ${number(totalDays)} days<br><br>

                Formula:<br>

                Depreciation =
                Opening Carrying Amount × Rate ×
                (Days / 365)

                <br><br>

                <table style="width:100%;border-collapse:collapse;">

                    <thead>

                        <tr>

                            <th style="border:1px solid #999;padding:6px;">
                                Period
                            </th>

                            <th style="border:1px solid #999;padding:6px;">
                                Duration
                            </th>

                            <th style="border:1px solid #999;padding:6px;">
                                Opening Carrying Amount
                            </th>

                            <th style="border:1px solid #999;padding:6px;">
                                Depreciation
                            </th>

                            <th style="border:1px solid #999;padding:6px;">
                                Accumulated Depreciation
                            </th>

                            <th style="border:1px solid #999;padding:6px;">
                                Closing Carrying Amount
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        ${rows}

                    </tbody>

                </table>

                `,

                `
                <strong>Total Depreciation:
                ${money(totalDepreciation)}</strong>
                `

            );

        }

        throw new Error(
            "Please select a calculation method."
        );

    }

},

"book-value": {

    title: "Book Value",

    fields: [
        ["cost", "Original Cost (₦)", "number"],
        ["accumulated", "Accumulated Depreciation (₦)", "number"]
    ],

    formula:
        "Book Value = Cost − Accumulated Depreciation",

    calculate(v) {

        const cost = getNumber(v, "cost");
        const accumulated =
            getNumber(v, "accumulated");

        const book =
            cost - accumulated;

        return resultTemplate(

            "Book Value = Cost − Accumulated Depreciation",

            `
            = ${money(cost)}
              − ${money(accumulated)}
            `,

            money(book)
        );

    }

},


"gross-profit": {

    title: "Gross Profit",

    fields: [
        ["sales", "Sales Revenue (₦)", "number"],
        ["cogs", "Cost of Goods Sold (₦)", "number"]
    ],

    formula:
        "Gross Profit = Sales − Cost of Goods Sold",

    calculate(v) {

        const sales = getNumber(v, "sales");
        const cogs = getNumber(v, "cogs");

        const profit =
            sales - cogs;

        return resultTemplate(

            "Gross Profit = Sales − COGS",

            `
            = ${money(sales)}
              − ${money(cogs)}
            `,

            money(profit)
        );

    }

},


"gross-profit-margin": {

    title: "Gross Profit Margin",

    fields: [
        ["sales", "Sales Revenue (₦)", "number"],
        ["cogs", "Cost of Goods Sold (₦)", "number"]
    ],

    formula:
        "Gross Profit Margin = Gross Profit ÷ Sales × 100",

    calculate(v) {

        const sales = getNumber(v, "sales");
        const cogs = getNumber(v, "cogs");

        if (sales === 0) {
            return errorMessage("Sales cannot be zero.");
        }

        const grossProfit =
            sales - cogs;

        const margin =
            (grossProfit / sales) * 100;

        return resultTemplate(

            "Gross Profit Margin = (Gross Profit ÷ Sales) × 100",

            `
            Gross Profit =
            ${money(grossProfit)}<br><br>

            = ${money(grossProfit)}
              ÷ ${money(sales)}
              × 100
            `,

            percent(margin)
        );

    }

},


"net-profit": {

    title: "Net Profit",

    fields: [
        ["revenue", "Revenue (₦)", "number"],
        ["expenses", "Total Expenses (₦)", "number"]
    ],

    formula:
        "Net Profit = Revenue − Total Expenses",

    calculate(v) {

        const revenue =
            getNumber(v, "revenue");

        const expenses =
            getNumber(v, "expenses");

        const profit =
            revenue - expenses;

        return resultTemplate(

            "Net Profit = Revenue − Expenses",

            `
            = ${money(revenue)}
              − ${money(expenses)}
            `,

            money(profit)
        );

    }

},


"net-profit-margin": {

    title: "Net Profit Margin",

    fields: [
        ["revenue", "Revenue (₦)", "number"],
        ["expenses", "Total Expenses (₦)", "number"]
    ],

    formula:
        "Net Profit Margin = Net Profit ÷ Revenue × 100",

    calculate(v) {

        const revenue =
            getNumber(v, "revenue");

        const expenses =
            getNumber(v, "expenses");

        if (revenue === 0) {
            return errorMessage("Revenue cannot be zero.");
        }

        const profit =
            revenue - expenses;

        const margin =
            (profit / revenue) * 100;

        return resultTemplate(

            "Net Profit Margin = (Net Profit ÷ Revenue) × 100",

            `
            Net Profit =
            ${money(profit)}<br><br>

            = ${money(profit)}
              ÷ ${money(revenue)}
              × 100
            `,

            percent(margin)
        );

    }

},


"markup": {

    title: "Markup",

    fields: [
        ["cost", "Cost (₦)", "number"],
        ["selling", "Selling Price (₦)", "number"]
    ],

    formula:
        "Markup % = (Selling Price − Cost) ÷ Cost × 100",

    calculate(v) {

        const cost = getNumber(v, "cost");
        const selling = getNumber(v, "selling");

        if (cost === 0) {
            return errorMessage("Cost cannot be zero.");
        }

        const markup =
            ((selling - cost) / cost) * 100;

        return resultTemplate(

            "Markup % = (Selling Price − Cost) ÷ Cost × 100",

            `
            Markup =
            ${money(selling - cost)}<br><br>

            = ${money(selling - cost)}
              ÷ ${money(cost)}
              × 100
            `,

            percent(markup)
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

    formula:
        "Break-Even Units = Fixed Costs ÷ (Selling Price − Variable Cost)",

    calculate(v) {

        const fixed = getNumber(v, "fixed");
        const selling = getNumber(v, "selling");
        const variable = getNumber(v, "variable");

        const contribution =
            selling - variable;

        if (contribution <= 0) {
            return errorMessage(
                "Selling price must be greater than variable cost."
            );
        }

        const units =
            fixed / contribution;

        return resultTemplate(

            "Break-Even Units = Fixed Costs ÷ Contribution per Unit",

            `
            Contribution per unit =
            ${money(contribution)}<br><br>

            = ${money(fixed)}
              ÷ ${money(contribution)}
            `,

            `${number(units)} units`
        );

    }

},


"vat": {

    title: "VAT Calculator",

    fields: [
        ["amount", "Amount (₦)", "number"],
        ["rate", "VAT Rate (%)", "number"]
    ],

    formula:
        "VAT = Amount × VAT Rate ÷ 100",

    calculate(v) {

        const amount = getNumber(v, "amount");
        const rate = getNumber(v, "rate");

        const vat =
            amount * rate / 100;

        const total =
            amount + vat;

        return resultTemplate(

            "VAT = Amount × VAT Rate ÷ 100",

            `
            VAT =
            ${money(amount)}
            × ${percent(rate)}
            = ${money(vat)}<br><br>

            Total =
            ${money(amount)}
            + ${money(vat)}
            = ${money(total)}
            `,

            `VAT: ${money(vat)}<br>
             Total: ${money(total)}`
        );

    }

},


"bad-debt": {

    title: "Bad Debt",

    fields: [
        ["receivable", "Customer Receivable (₦)", "number"],
        ["bad", "Amount Irrecoverable (₦)", "number"]
    ],

    formula:
        "Remaining Receivable = Original Receivable − Bad Debt",

    calculate(v) {

        const receivable =
            getNumber(v, "receivable");

        const bad =
            getNumber(v, "bad");

        if (bad > receivable) {
            return errorMessage(
                "Bad debt cannot exceed the receivable."
            );
        }

        const remaining =
            receivable - bad;

        return resultTemplate(

            "Remaining Receivable = Receivable − Bad Debt",

            `
            = ${money(receivable)}
              − ${money(bad)}
            `,

            `Bad Debt Expense: ${money(bad)}<br>
             Remaining Receivable: ${money(remaining)}`
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

    formula:
        "COGS = Opening Inventory + Purchases − Closing Inventory",

    calculate(v) {

        const opening = getNumber(v, "opening");
        const purchases = getNumber(v, "purchases");
        const closing = getNumber(v, "closing");

        const cogs =
            opening + purchases - closing;

        return resultTemplate(

            "COGS = Opening Inventory + Purchases − Closing Inventory",

            `
            = ${money(opening)}
              + ${money(purchases)}
              − ${money(closing)}
            `,

            money(cogs)
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

    formula:
        "I = PRT",

    calculate(v) {

        const P = getNumber(v, "principal");
        const R = getNumber(v, "rate") / 100;
        const T = getNumber(v, "time");

        const interest =
            P * R * T;

        const amount =
            P + interest;

        return resultTemplate(

            "I = P × R × T",

            `
            = ${money(P)}
              × ${percent(R * 100)}
              × ${T}<br><br>

            Interest =
            ${money(interest)}
            `,

            `Interest: ${money(interest)}<br>
             Amount: ${money(amount)}`
        );

    }

},


"compound-interest": {

    title: "Compound Interest",

    fields: [
        ["principal", "Principal (₦)", "number"],
        ["rate", "Annual Interest Rate (%)", "number"],
        ["time", "Time (Years)", "number"],
        ["frequency", "Compounding Frequency", "select"]
    ],

    options: {
        frequency: [
            ["1", "Annual"],
            ["2", "Semi-Annual"],
            ["4", "Quarterly"],
            ["12", "Monthly"],
            ["365", "Daily"],
            ["continuous", "Continuous"]
        ]
    },

    formula:
        "A = P(1 + r/n)^(nt), or A = Pe^(rt) for continuous compounding",

    calculate(v) {

        const P = getNumber(v, "principal");
        const r = getNumber(v, "rate") / 100;
        const t = getNumber(v, "time");

        let A;
        let working;

        if (v.frequency === "continuous") {

            A = P * Math.exp(r * t);

            working =
                `A = ${money(P)}
                 × e^(${r} × ${t})`;

        } else {

            const n =
                Number(v.frequency);

            A =
                P *
                Math.pow(
                    1 + r / n,
                    n * t
                );

            working =
                `A = ${money(P)}
                 × (1 + ${r}/${n})^(${n} × ${t})`;

        }

        const interest =
            A - P;

        return resultTemplate(

            "Compound Amount = P(1 + r/n)^(nt)",

            `${working}<br><br>
             Interest = Amount − Principal =
             ${money(interest)}`,

            `Amount: ${money(A)}<br>
             Compound Interest: ${money(interest)}`
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

    formula:
        "PV = FV ÷ (1 + r)^t",

    calculate(v) {

        const FV = getNumber(v, "future");
        const r = getNumber(v, "rate") / 100;
        const t = getNumber(v, "time");

        const PV =
            FV / Math.pow(1 + r, t);

        return resultTemplate(

            "PV = FV ÷ (1 + r)^t",

            `
            = ${money(FV)}
              ÷ (1 + ${r})^${t}
            `,

            money(PV)
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

    formula:
        "FV = PV(1 + r)^t",

    calculate(v) {

        const PV = getNumber(v, "present");
        const r = getNumber(v, "rate") / 100;
        const t = getNumber(v, "time");

        const FV =
            PV * Math.pow(1 + r, t);

        return resultTemplate(

            "FV = PV(1 + r)^t",

            `
            = ${money(PV)}
              × (1 + ${r})^${t}
            `,

            money(FV)
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

    formula:
        "FV = PMT × [(1 + r)^n − 1] ÷ r",

    calculate(v) {

        const PMT = getNumber(v, "payment");
        const r = getNumber(v, "rate") / 100;
        const n = getNumber(v, "periods");

        if (r === 0) {

            const FV =
                PMT * n;

            return resultTemplate(
                "FV = PMT × n when r = 0",
                `${money(PMT)} × ${n}`,
                money(FV)
            );

        }

        const FV =
            PMT *
            ((Math.pow(1 + r, n) - 1) / r);

        return resultTemplate(

            "FV = PMT × [(1 + r)^n − 1] ÷ r",

            `
            = ${money(PMT)}
              × [ (1 + ${r})^${n} − 1 ]
              ÷ ${r}
            `,

            money(FV)
        );

    }

},


"payment": {

    title: "Loan Payment / Installment",

    fields: [
        ["principal", "Loan Principal (₦)", "number"],
        ["rate", "Annual Interest Rate (%)", "number"],
        ["periods", "Number of Payments", "number"]
    ],

    formula:
        "PMT = P[r(1+r)^n] ÷ [(1+r)^n − 1]",

    calculate(v) {

        const P = getNumber(v, "principal");
        const r = getNumber(v, "rate") / 100;
        const n = getNumber(v, "periods");

        if (r === 0) {

            const payment =
                P / n;

            return resultTemplate(
                "Payment = Principal ÷ Number of Payments",
                `${money(P)} ÷ ${n}`,
                money(payment)
            );

        }

        const payment =
            P *
            (
                r *
                Math.pow(1 + r, n)
            ) /
            (
                Math.pow(1 + r, n) - 1
            );

        return resultTemplate(

            "PMT = P[r(1+r)^n] ÷ [(1+r)^n − 1]",

            `
            = ${money(payment)}
            per payment
            `,

            money(payment)
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

    formula:
        "PMT = FV × r ÷ [(1+r)^n − 1]",

    calculate(v) {

        const FV = getNumber(v, "future");
        const r = getNumber(v, "rate") / 100;
        const n = getNumber(v, "periods");

        if (r === 0) {

            const pmt =
                FV / n;

            return resultTemplate(
                "PMT = FV ÷ n",
                `${money(FV)} ÷ ${n}`,
                money(pmt)
            );

        }

        const pmt =
            FV *
            r /
            (
                Math.pow(1 + r, n) - 1
            );

        return resultTemplate(

            "PMT = FV × r ÷ [(1+r)^n − 1]",

            `
            = ${money(FV)}
              × ${r}
              ÷ [(1 + ${r})^${n} − 1]
            `,

            money(pmt)
        );

    }

},


"loan-amortization": {

    title: "Loan Amortization",

    fields: [
        ["principal", "Loan Principal (₦)", "number"],
        ["rate", "Interest Rate per Period (%)", "number"],
        ["periods", "Number of Periods", "number"]
    ],

    formula:
        "Payment = P[r(1+r)^n] ÷ [(1+r)^n − 1]",

    calculate(v) {

        const P = getNumber(v, "principal");
        const r = getNumber(v, "rate") / 100;
        const n = getNumber(v, "periods");

        let payment;

        if (r === 0) {

            payment = P / n;

        } else {

            payment =
                P *
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
            total - P;

        return resultTemplate(

            "Loan Payment = P[r(1+r)^n] ÷ [(1+r)^n − 1]",

            `
            Periodic Payment =
            ${money(payment)}<br><br>

            Total Payments =
            ${money(total)}<br><br>

            Total Interest =
            ${money(interest)}
            `,

            `Periodic Payment: ${money(payment)}<br>
             Total Interest: ${money(interest)}`
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
        ["c", "Coefficient c", "number"]
    ],

    formula:
        "x = [-b ± √(b² − 4ac)] ÷ 2a",

    calculate(v) {

        const a = getNumber(v, "a");
        const b = getNumber(v, "b");
        const c = getNumber(v, "c");

        if (a === 0) {
            return errorMessage("a cannot be zero.");
        }

        const D =
            b * b - 4 * a * c;

        if (D < 0) {

            return resultTemplate(

                "D = b² − 4ac",

                `D = ${number(D)}`,

                "No real roots."
            );

        }

        const x1 =
            (-b + Math.sqrt(D)) / (2 * a);

        const x2 =
            (-b - Math.sqrt(D)) / (2 * a);

        return resultTemplate(

            "x = [-b ± √(b² − 4ac)] ÷ 2a",

            `
            Discriminant =
            ${number(D)}<br><br>

            x₁ =
            ${number(x1)}<br><br>

            x₂ =
            ${number(x2)}
            `,

            `x₁ = ${number(x1)}<br>
             x₂ = ${number(x2)}`
        );

    }

},


"simple-equation": {

    title: "Simple Linear Equation",

    fields: [
        ["a", "Coefficient a", "number"],
        ["b", "Constant b", "number"]
    ],

    formula:
        "ax + b = 0 → x = −b/a",

    calculate(v) {

        const a = getNumber(v, "a");
        const b = getNumber(v, "b");

        if (a === 0) {
            return errorMessage("Coefficient a cannot be zero.");
        }

        const x =
            -b / a;

        return resultTemplate(
            "x = −b ÷ a",
            `x = −${b} ÷ ${a}`,
            `x = ${number(x)}`
        );

    }

},


"percentage-change": {

    title: "Percentage Change",

    fields: [
        ["old", "Original Value", "number"],
        ["new", "New Value", "number"]
    ],

    formula:
        "Percentage Change = (New − Old) ÷ Old × 100",

    calculate(v) {

        const oldValue = getNumber(v, "old");
        const newValue = getNumber(v, "new");

        if (oldValue === 0) {
            return errorMessage(
                "Original value cannot be zero."
            );
        }

        const change =
            ((newValue - oldValue) /
                oldValue) * 100;

        return resultTemplate(

            "(New − Old) ÷ Old × 100",

            `
            = (${number(newValue)}
              − ${number(oldValue)})
              ÷ ${number(oldValue)}
              × 100
            `,

            percent(change)
        );

    }

},


"permutation": {

    title: "Permutation",

    fields: [
        ["n", "n", "number"],
        ["r", "r", "number"]
    ],

    formula:
        "nPr = n! ÷ (n − r)!",

    calculate(v) {

        const n = getNumber(v, "n");
        const r = getNumber(v, "r");

        if (
            n < 0 ||
            r < 0 ||
            r > n ||
            !Number.isInteger(n) ||
            !Number.isInteger(r)
        ) {
            return errorMessage(
                "n and r must be whole numbers with n ≥ r."
            );
        }

        const answer =
            permutations(n, r);

        return resultTemplate(

            "nPr = n! ÷ (n − r)!",

            `
            = ${n}! ÷ (${n} − ${r})!
            `,

            number(answer)
        );

    }

},


"combination": {

    title: "Combination",

    fields: [
        ["n", "n", "number"],
        ["r", "r", "number"]
    ],

    formula:
        "nCr = n! ÷ [r!(n − r)!]",

    calculate(v) {

        const n = getNumber(v, "n");
        const r = getNumber(v, "r");

        if (
            n < 0 ||
            r < 0 ||
            r > n ||
            !Number.isInteger(n) ||
            !Number.isInteger(r)
        ) {
            return errorMessage(
                "n and r must be whole numbers with n ≥ r."
            );
        }

        const answer =
            combinations(n, r);

        return resultTemplate(

            "nCr = n! ÷ [r!(n − r)!]",

            `
            = ${n}! ÷
              [${r}!(${n} − ${r})!]
            `,

            number(answer)
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

    formula:
        "d = √[(x₂ − x₁)² + (y₂ − y₁)²]",

    calculate(v) {

        const x1 = getNumber(v, "x1");
        const y1 = getNumber(v, "y1");
        const x2 = getNumber(v, "x2");
        const y2 = getNumber(v, "y2");

        const d =
            Math.sqrt(
                Math.pow(x2 - x1, 2) +
                Math.pow(y2 - y1, 2)
            );

        return resultTemplate(
            "d = √[(x₂ − x₁)² + (y₂ − y₁)²]",
            `d = ${number(d)}`,
            number(d)
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

    formula:
        "M = ((x₁+x₂)/2, (y₁+y₂)/2)",

    calculate(v) {

        const x1 = getNumber(v, "x1");
        const y1 = getNumber(v, "y1");
        const x2 = getNumber(v, "x2");
        const y2 = getNumber(v, "y2");

        const x =
            (x1 + x2) / 2;

        const y =
            (y1 + y2) / 2;

        return resultTemplate(
            "M = ((x₁+x₂)/2, (y₁+y₂)/2)",
            `M = (${number(x)}, ${number(y)})`,
            `(${number(x)}, ${number(y)})`
        );

    }

},


"gradient": {

    title: "Gradient",

    fields: [
        ["x1", "x₁", "number"],
        ["y1", "y₁", "number"],
        ["x2", "x₂", "number"],
        ["y2", "y₂", "number"]
    ],

    formula:
        "m = (y₂ − y₁) ÷ (x₂ − x₁)",

    calculate(v) {

        const x1 = getNumber(v, "x1");
        const y1 = getNumber(v, "y1");
        const x2 = getNumber(v, "x2");
        const y2 = getNumber(v, "y2");

        if (x2 === x1) {
            return errorMessage(
                "The gradient is undefined because x₂ − x₁ = 0."
            );
        }

        const m =
            (y2 - y1) / (x2 - x1);

        return resultTemplate(
            "m = (y₂ − y₁) ÷ (x₂ − x₁)",
            `m = ${number(m)}`,
            number(m)
        );

    }

},


"circle-area": {

    title: "Area of a Circle",

    fields: [
        ["radius", "Radius", "number"]
    ],

    formula:
        "Area = πr²",

    calculate(v) {

        const r =
            getNumber(v, "radius");

        const area =
            Math.PI * r * r;

        return resultTemplate(
            "Area = πr²",
            `π × ${number(r)}²`,
            number(area)
        );

    }

},


"trigonometry": {

    title: "Trigonometry",

    fields: [
        ["angle", "Angle (Degrees)", "number"],
        ["ratio", "Ratio", "select"]
    ],

    options: {
        ratio: [
            ["sin", "sin"],
            ["cos", "cos"],
            ["tan", "tan"]
        ]
    },

    formula:
        "Use the selected trigonometric ratio of the angle.",

    calculate(v) {

        const angle =
            getNumber(v, "angle");

        const radians =
            angle * Math.PI / 180;

        let answer;

        if (v.ratio === "sin") {
            answer = Math.sin(radians);
        }

        if (v.ratio === "cos") {
            answer = Math.cos(radians);
        }

        if (v.ratio === "tan") {
            answer = Math.tan(radians);
        }

        return resultTemplate(

            `${v.ratio}(${angle}°)`,

            `Angle converted to radians:
             ${number(radians, 6)}`,

            number(answer, 6)
        );

    }

},


"indices": {

    title: "Indices / Exponents",

    fields: [
        ["base", "Base", "number"],
        ["power", "Power", "number"]
    ],

    formula:
        "aⁿ",

    calculate(v) {

        const a = getNumber(v, "base");
        const n = getNumber(v, "power");

        const answer =
            Math.pow(a, n);

        return resultTemplate(
            "aⁿ",
            `${number(a)}^${number(n)}`,
            number(answer)
        );

    }

},


"logarithm": {

    title: "Logarithm",

    fields: [
        ["value", "Value", "number"],
        ["base", "Base", "number"]
    ],

    formula:
        "log₍b₎(x) = ln(x) ÷ ln(b)",

    calculate(v) {

        const value = getNumber(v, "value");
        const base = getNumber(v, "base");

        if (
            value <= 0 ||
            base <= 0 ||
            base === 1
        ) {
            return errorMessage(
                "Value must be positive, and base must be positive and not equal to 1."
            );
        }

        const answer =
            Math.log(value) /
            Math.log(base);

        return resultTemplate(
            "log₍b₎(x) = ln(x) ÷ ln(b)",
            `ln(${value}) ÷ ln(${base})`,
            number(answer)
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

    formula:
        "a₁x+b₁y=c₁ and a₂x+b₂y=c₂",

    calculate(v) {

        const a1 = getNumber(v, "a1");
        const b1 = getNumber(v, "b1");
        const c1 = getNumber(v, "c1");

        const a2 = getNumber(v, "a2");
        const b2 = getNumber(v, "b2");
        const c2 = getNumber(v, "c2");

        const D =
            a1 * b2 -
            a2 * b1;

        if (D === 0) {
            return errorMessage(
                "The equations do not have one unique solution."
            );
        }

        const x =
            (c1 * b2 - c2 * b1) / D;

        const y =
            (a1 * c2 - a2 * c1) / D;

        return resultTemplate(
            "Cramer's Rule",
            `
            D = ${number(D)}<br><br>
            x = ${number(x)}<br>
            y = ${number(y)}
            `,
            `x = ${number(x)}<br>
             y = ${number(y)}`
        );

    }

},


"differentiation-power": {

    title: "Differentiation – Power Rule",

    fields: [
        ["coefficient", "Coefficient", "number"],
        ["power", "Power", "number"]
    ],

    formula:
        "d/dx (axⁿ) = an xⁿ⁻¹",

    calculate(v) {

        const a =
            getNumber(v, "coefficient");

        const n =
            getNumber(v, "power");

        const newCoefficient =
            a * n;

        const newPower =
            n - 1;

        return resultTemplate(
            "d/dx(axⁿ) = anxⁿ⁻¹",
            `
            = ${number(a)} × ${number(n)}
              x^(${number(newPower)})
            `,
            `${number(newCoefficient)}x^${number(newPower)}`
        );

    }

},


"integration-power": {

    title: "Integration – Power Rule",

    fields: [
        ["coefficient", "Coefficient", "number"],
        ["power", "Power", "number"]
    ],

    formula:
        "∫axⁿ dx = axⁿ⁺¹ ÷ (n+1) + C",

    calculate(v) {

        const a =
            getNumber(v, "coefficient");

        const n =
            getNumber(v, "power");

        if (n === -1) {
            return errorMessage(
                "For n = -1, use logarithmic integration."
            );
        }

        const newPower =
            n + 1;

        const newCoefficient =
            a / newPower;

        return resultTemplate(
            "∫axⁿ dx = axⁿ⁺¹ ÷ (n+1) + C",
            `
            = ${number(newCoefficient)}
              x^${number(newPower)} + C
            `,
            `${number(newCoefficient)}x^${number(newPower)} + C`
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

    formula:
        "Mean = Σx ÷ n",

    calculate(v) {

        const data =
            getArray(v.data);

        if (!data.length) {
            return errorMessage(
                "Enter valid data separated by commas."
            );
        }

        const mean =
            average(data);

        return resultTemplate(

            "Mean = Σx ÷ n",

            `
            Σx = ${number(sum(data))}<br>
            n = ${data.length}<br><br>

            Mean =
            ${number(sum(data))}
            ÷ ${data.length}
            `,

            number(mean)
        );

    }

},


"weighted-mean": {

    title: "Weighted Mean",

    fields: [
        ["values", "Values (comma separated)", "text"],
        ["weights", "Weights (comma separated)", "text"]
    ],

    formula:
        "Weighted Mean = Σwx ÷ Σw",

    calculate(v) {

        const values =
            getArray(v.values);

        const weights =
            getArray(v.weights);

        if (
            values.length === 0 ||
            values.length !== weights.length
        ) {
            return errorMessage(
                "Values and weights must have the same number of entries."
            );
        }

        const weightedTotal =
            values.reduce(
                (total, value, i) =>
                    total + value * weights[i],
                0
            );

        const weightTotal =
            sum(weights);

        const answer =
            weightedTotal / weightTotal;

        return resultTemplate(
            "Weighted Mean = Σwx ÷ Σw",
            `
            Σwx = ${number(weightedTotal)}<br>
            Σw = ${number(weightTotal)}
            `,
            number(answer)
        );

    }

},


"median": {

    title: "Median",

    fields: [
        ["data", "Data Values (comma separated)", "text"]
    ],

    formula:
        "Median = middle value after arranging data",

    calculate(v) {

        const data =
            getArray(v.data)
            .sort((a, b) => a - b);

        if (!data.length) {
            return errorMessage(
                "Enter valid data."
            );
        }

        const n = data.length;

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
            "Median = Middle value",
            `Ordered data: ${data.join(", ")}`,
            number(median)
        );

    }

},


"mode": {

    title: "Mode",

    fields: [
        ["data", "Data Values (comma separated)", "text"]
    ],

    formula:
        "Mode = Most frequently occurring value",

    calculate(v) {

        const data =
            getArray(v.data);

        if (!data.length) {
            return errorMessage(
                "Enter valid data."
            );
        }

        const frequencies = {};

        data.forEach(value => {

            frequencies[value] =
                (frequencies[value] || 0) + 1;

        });

        const max =
            Math.max(
                ...Object.values(frequencies)
            );

        const modes =
            Object.keys(frequencies)
                .filter(
                    key =>
                        frequencies[key] === max
                );

        return resultTemplate(
            "Mode = Most frequent value",
            `Highest frequency = ${max}`,
            modes.join(", ")
        );

    }

},


"range": {

    title: "Range",

    fields: [
        ["data", "Data Values (comma separated)", "text"]
    ],

    formula:
        "Range = Maximum − Minimum",

    calculate(v) {

        const data =
            getArray(v.data);

        if (!data.length) {
            return errorMessage(
                "Enter valid data."
            );
        }

        const min =
            Math.min(...data);

        const max =
            Math.max(...data);

        return resultTemplate(
            "Range = Maximum − Minimum",
            `${number(max)} − ${number(min)}`,
            number(max - min)
        );

    }

},


"variance": {

    title: "Variance",

    fields: [
        ["data", "Data Values (comma separated)", "text"]
    ],

    formula:
        "Population Variance = Σ(x − x̄)² ÷ n",

    calculate(v) {

        const data =
            getArray(v.data);

        if (!data.length) {
            return errorMessage(
                "Enter valid data."
            );
        }

        const mean =
            average(data);

        const variance =
            data.reduce(
                (total, x) =>
                    total +
                    Math.pow(x - mean, 2),
                0
            ) / data.length;

        return resultTemplate(
            "Variance = Σ(x − x̄)² ÷ n",
            `Mean = ${number(mean)}`,
            number(variance)
        );

    }

},


"standard-deviation": {

    title: "Standard Deviation",

    fields: [
        ["data", "Data Values (comma separated)", "text"]
    ],

    formula:
        "Standard Deviation = √Variance",

    calculate(v) {

        const data =
            getArray(v.data);

        if (!data.length) {
            return errorMessage(
                "Enter valid data."
            );
        }

        const mean =
            average(data);

        const variance =
            data.reduce(
                (total, x) =>
                    total +
                    Math.pow(x - mean, 2),
                0
            ) / data.length;

        const sd =
            Math.sqrt(variance);

        return resultTemplate(
            "SD = √Variance",
            `Variance = ${number(variance)}`,
            number(sd)
        );

    }

},


"coefficient-variation": {

    title: "Coefficient of Variation",

    fields: [
        ["mean", "Mean", "number"],
        ["sd", "Standard Deviation", "number"]
    ],

    formula:
        "CV = SD ÷ Mean × 100",

    calculate(v) {

        const mean =
            getNumber(v, "mean");

        const sd =
            getNumber(v, "sd");

        if (mean === 0) {
            return errorMessage(
                "Mean cannot be zero."
            );
        }

        const cv =
            (sd / mean) * 100;

        return resultTemplate(
            "CV = SD ÷ Mean × 100",
            `${number(sd)} ÷ ${number(mean)} × 100`,
            percent(cv)
        );

    }

},


"skewness": {

    title: "Skewness",

    fields: [
        ["mean", "Mean", "number"],
        ["mode", "Mode", "number"],
        ["sd", "Standard Deviation", "number"]
    ],

    formula:
        "Skewness = (Mean − Mode) ÷ SD",

    calculate(v) {

        const mean =
            getNumber(v, "mean");

        const mode =
            getNumber(v, "mode");

        const sd =
            getNumber(v, "sd");

        if (sd === 0) {
            return errorMessage(
                "Standard deviation cannot be zero."
            );
        }

        const skew =
            (mean - mode) / sd;

        return resultTemplate(
            "Skewness = (Mean − Mode) ÷ SD",
            `(${mean} − ${mode}) ÷ ${sd}`,
            number(skew),
            interpretSkewness(skew)
        );

    }

},


"kurtosis": {

    title: "Kurtosis",

    fields: [
        ["m4", "Fourth Central Moment", "number"],
        ["variance", "Variance", "number"]
    ],

    formula:
        "β₂ = μ₄ ÷ σ⁴",

    calculate(v) {

        const m4 =
            getNumber(v, "m4");

        const variance =
            getNumber(v, "variance");

        if (variance === 0) {
            return errorMessage(
                "Variance cannot be zero."
            );
        }

        const beta2 =
            m4 /
            Math.pow(variance, 2);

        return resultTemplate(
            "β₂ = μ₄ ÷ σ⁴",
            `${number(m4)} ÷ ${number(variance)}²`,
            number(beta2),
            interpretKurtosis(beta2)
        );

    }

},


"correlation": {

    title: "Pearson Correlation",

    fields: [
        ["x", "X Values (comma separated)", "text"],
        ["y", "Y Values (comma separated)", "text"]
    ],

    formula:
        "r = Cov(X,Y) ÷ (σxσy)",

    calculate(v) {

        const x =
            getArray(v.x);

        const y =
            getArray(v.y);

        if (
            !x.length ||
            x.length !== y.length
        ) {
            return errorMessage(
                "X and Y must contain the same number of values."
            );
        }

        const meanX =
            average(x);

        const meanY =
            average(y);

        let numerator = 0;
        let sumX = 0;
        let sumY = 0;

        for (let i = 0; i < x.length; i++) {

            numerator +=
                (x[i] - meanX) *
                (y[i] - meanY);

            sumX +=
                Math.pow(x[i] - meanX, 2);

            sumY +=
                Math.pow(y[i] - meanY, 2);

        }

        const denominator =
            Math.sqrt(sumX * sumY);

        if (denominator === 0) {
            return errorMessage(
                "Correlation cannot be calculated."
            );
        }

        const r =
            numerator / denominator;

        return resultTemplate(
            "r = Σ[(x−x̄)(y−ȳ)] ÷ √[Σ(x−x̄)²Σ(y−ȳ)²]",
            `r = ${number(r, 4)}`,
            number(r, 4),
            interpretCorrelation(r)
        );

    }

},


"spearman": {

    title: "Spearman Rank Correlation",

    fields: [
        ["d2", "Σd²", "number"],
        ["n", "Number of Observations", "number"]
    ],

    formula:
        "ρ = 1 − [6Σd² ÷ n(n²−1)]",

    calculate(v) {

        const d2 =
            getNumber(v, "d2");

        const n =
            getNumber(v, "n");

        if (n <= 1) {
            return errorMessage(
                "Number of observations must be greater than 1."
            );
        }

        const rho =
            1 -
            (
                6 * d2 /
                (n * (n * n - 1))
            );

        return resultTemplate(
            "ρ = 1 − [6Σd² ÷ n(n²−1)]",
            `ρ = ${number(rho, 4)}`,
            number(rho, 4),
            interpretCorrelation(rho)
        );

    }

},


"covariance": {

    title: "Covariance",

    fields: [
        ["x", "X Values (comma separated)", "text"],
        ["y", "Y Values (comma separated)", "text"]
    ],

    formula:
        "Cov(X,Y) = Σ[(x−x̄)(y−ȳ)] ÷ n",

    calculate(v) {

        const x =
            getArray(v.x);

        const y =
            getArray(v.y);

        if (
            !x.length ||
            x.length !== y.length
        ) {
            return errorMessage(
                "X and Y must have the same number of values."
            );
        }

        const meanX =
            average(x);

        const meanY =
            average(y);

        let total = 0;

        for (let i = 0; i < x.length; i++) {

            total +=
                (x[i] - meanX) *
                (y[i] - meanY);

        }

        const covariance =
            total / x.length;

        return resultTemplate(
            "Cov(X,Y) = Σ[(x−x̄)(y−ȳ)] ÷ n",
            `Σ = ${number(total)}`,
            number(covariance)
        );

    }

},


"moving-average": {

    title: "Moving Average",

    fields: [
        ["data", "Data Values (comma separated)", "text"],
        ["period", "Moving Average Period", "number"]
    ],

    formula:
        "Moving Average = Sum of selected observations ÷ Number of observations",

    calculate(v) {

        const data =
            getArray(v.data);

        const period =
            getNumber(v, "period");

        if (
            period <= 0 ||
            period > data.length
        ) {
            return errorMessage(
                "Invalid moving-average period."
            );
        }

        const averages = [];

        for (
            let i = 0;
            i <= data.length - period;
            i++
        ) {

            const group =
                data.slice(i, i + period);

            averages.push(
                average(group)
            );

        }

        return resultTemplate(
            "Moving Average = Sum ÷ Number of observations",
            averages
                .map(
                    (x, i) =>
                        `Period ${i + 1}: ${number(x)}`
                )
                .join("<br>"),
            averages
                .map(number)
                .join(", ")
        );

    }

},


"weighted-moving-average": {

    title: "Weighted Moving Average",

    fields: [
        ["values", "Values (comma separated)", "text"],
        ["weights", "Weights (comma separated)", "text"]
    ],

    formula:
        "WMA = Σ(Value × Weight) ÷ ΣWeights",

    calculate(v) {

        const values =
            getArray(v.values);

        const weights =
            getArray(v.weights);

        if (
            values.length === 0 ||
            values.length !== weights.length
        ) {
            return errorMessage(
                "Values and weights must have the same number of entries."
            );
        }

        const numerator =
            values.reduce(
                (total, value, i) =>
                    total + value * weights[i],
                0
            );

        const denominator =
            sum(weights);

        if (denominator === 0) {
            return errorMessage(
                "Total weight cannot be zero."
            );
        }

        const answer =
            numerator / denominator;

        return resultTemplate(
            "WMA = Σ(Value × Weight) ÷ ΣWeights",
            `${number(numerator)} ÷ ${number(denominator)}`,
            number(answer)
        );

    }

},


"least-squares-trend": {

    title: "Least Squares Trend",

    fields: [
        ["x", "X Values (comma separated)", "text"],
        ["y", "Y Values (comma separated)", "text"]
    ],

    formula:
        "Trend line: Y = a + bX",

    calculate(v) {

        const x =
            getArray(v.x);

        const y =
            getArray(v.y);

        if (
            !x.length ||
            x.length !== y.length
        ) {
            return errorMessage(
                "X and Y must have the same number of values."
            );
        }

        const meanX =
            average(x);

        const meanY =
            average(y);

        let numerator = 0;
        let denominator = 0;

        for (let i = 0; i < x.length; i++) {

            numerator +=
                (x[i] - meanX) *
                (y[i] - meanY);

            denominator +=
                Math.pow(x[i] - meanX, 2);

        }

        if (denominator === 0) {
            return errorMessage(
                "X values must vary."
            );
        }

        const b =
            numerator / denominator;

        const a =
            meanY - b * meanX;

        return resultTemplate(
            "Y = a + bX",
            `
            b = ${number(b)}<br>
            a = ${number(a)}
            `,
            `Y = ${number(a)} + ${number(b)}X`
        );

    }

},


"trend-forecast": {

    title: "Trend Forecast",

    fields: [
        ["a", "Intercept (a)", "number"],
        ["b", "Trend Coefficient (b)", "number"],
        ["x", "Future X Value", "number"]
    ],

    formula:
        "Y = a + bX",

    calculate(v) {

        const a =
            getNumber(v, "a");

        const b =
            getNumber(v, "b");

        const x =
            getNumber(v, "x");

        const forecast =
            a + b * x;

        return resultTemplate(
            "Y = a + bX",
            `${a} + (${b} × ${x})`,
            number(forecast)
        );

    }

},


"seasonal-index": {

    title: "Seasonal Index",

    fields: [
        ["actual", "Actual Value", "number"],
        ["average", "Average / Trend Value", "number"]
    ],

    formula:
        "Seasonal Index = Actual ÷ Average × 100",

    calculate(v) {

        const actual =
            getNumber(v, "actual");

        const avg =
            getNumber(v, "average");

        if (avg === 0) {
            return errorMessage(
                "Average value cannot be zero."
            );
        }

        const index =
            (actual / avg) * 100;

        return resultTemplate(
            "Seasonal Index = Actual ÷ Average × 100",
            `${actual} ÷ ${avg} × 100`,
            percent(index)
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

    formula:
        "PED = % Change in Quantity Demanded ÷ % Change in Price",

    calculate(v) {

        const q1 =
            getNumber(v, "q1");

        const q2 =
            getNumber(v, "q2");

        const p1 =
            getNumber(v, "p1");

        const p2 =
            getNumber(v, "p2");

        if (
            q1 === 0 ||
            p1 === 0
        ) {
            return errorMessage(
                "Original quantity and original price cannot be zero."
            );
        }

        const percentQ =
            ((q2 - q1) / q1) * 100;

        const percentP =
            ((p2 - p1) / p1) * 100;

        if (percentP === 0) {
            return errorMessage(
                "Percentage change in price cannot be zero."
            );
        }

        const ped =
            percentQ / percentP;

        const absolutePED =
            Math.abs(ped);

        return resultTemplate(

            "PED = %ΔQd ÷ %ΔP",

            `
            % change in Qd =
            ${percent(percentQ)}<br><br>

            % change in Price =
            ${percent(percentP)}<br><br>

            PED =
            ${number(percentQ, 4)}
            ÷
            ${number(percentP, 4)}
            =
            ${number(absolutePED)}
            `,

            `PED = ${number(absolutePED)}`,

            `${interpretPED(absolutePED)}<br><br>

            <small>
            <strong>Note:</strong>
            PED is shown as a positive value because the
            negative sign reflects the inverse relationship
            between price and quantity demanded. The absolute
            value shows the degree of responsiveness.
            </small>`
        );

    }

},


"price-elasticity-supply": {

    title: "Price Elasticity of Supply",

    fields: [
        ["q1", "Original Quantity Supplied", "number"],
        ["q2", "New Quantity Supplied", "number"],
        ["p1", "Original Price", "number"],
        ["p2", "New Price", "number"]
    ],

    formula:
        "PES = % Change in Quantity Supplied ÷ % Change in Price",

    calculate(v) {

        const q1 =
            getNumber(v, "q1");

        const q2 =
            getNumber(v, "q2");

        const p1 =
            getNumber(v, "p1");

        const p2 =
            getNumber(v, "p2");

        if (
            q1 === 0 ||
            p1 === 0
        ) {
            return errorMessage(
                "Original quantity and original price cannot be zero."
            );
        }

        const percentQ =
            ((q2 - q1) / q1) * 100;

        const percentP =
            ((p2 - p1) / p1) * 100;

        if (percentP === 0) {
            return errorMessage(
                "Percentage change in price cannot be zero."
            );
        }

        const pes =
            percentQ / percentP;

        const absolutePES =
            Math.abs(pes);

        return resultTemplate(

            "PES = %ΔQs ÷ %ΔP",

            `
            % change in Qs =
            ${percent(percentQ)}<br><br>

            % change in Price =
            ${percent(percentP)}<br><br>

            PES =
            ${number(absolutePES)}
            `,

            `PES = ${number(absolutePES)}`,

            interpretPES(absolutePES)
        );

    }

},


"income-elasticity": {

    title: "Income Elasticity of Demand",

    fields: [
        ["q1", "Original Quantity", "number"],
        ["q2", "New Quantity", "number"],
        ["y1", "Original Income", "number"],
        ["y2", "New Income", "number"]
    ],

    formula:
        "YED = % Change in Quantity ÷ % Change in Income",

    calculate(v) {

        const q1 = getNumber(v, "q1");
        const q2 = getNumber(v, "q2");
        const y1 = getNumber(v, "y1");
        const y2 = getNumber(v, "y2");

        if (q1 === 0 || y1 === 0) {
            return errorMessage(
                "Original quantity and income cannot be zero."
            );
        }

        const percentQ =
            ((q2 - q1) / q1) * 100;

        const percentY =
            ((y2 - y1) / y1) * 100;

        if (percentY === 0) {
            return errorMessage(
                "Percentage change in income cannot be zero."
            );
        }

        const yed =
            percentQ / percentY;

        return resultTemplate(
            "YED = %ΔQ ÷ %ΔY",
            `
            %ΔQ = ${percent(percentQ)}<br>
            %ΔY = ${percent(percentY)}<br><br>
            YED = ${number(yed)}
            `,
            number(yed),
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

    formula:
        "XED = % Change in Quantity of X ÷ % Change in Price of Y",

    calculate(v) {

        const q1 = getNumber(v, "q1");
        const q2 = getNumber(v, "q2");
        const p1 = getNumber(v, "p1");
        const p2 = getNumber(v, "p2");

        if (q1 === 0 || p1 === 0) {
            return errorMessage(
                "Original values cannot be zero."
            );
        }

        const percentQ =
            ((q2 - q1) / q1) * 100;

        const percentP =
            ((p2 - p1) / p1) * 100;

        if (percentP === 0) {
            return errorMessage(
                "Price change cannot be zero."
            );
        }

        const xed =
            percentQ / percentP;

        return resultTemplate(
            "XED = %ΔQx ÷ %ΔPy",
            `
            %ΔQx = ${percent(percentQ)}<br>
            %ΔPy = ${percent(percentP)}<br><br>
            XED = ${number(xed)}
            `,
            number(xed),
            interpretCrossElasticity(xed)
        );

    }

},


"equilibrium": {

    title: "Market Equilibrium",

    fields: [
        ["a", "Demand Intercept (a)", "number"],
        ["b", "Demand Slope (b)", "number"],
        ["c", "Supply Intercept (c)", "number"],
        ["d", "Supply Slope (d)", "number"]
    ],

    formula:
        "Demand: Qd = a − bP; Supply: Qs = c + dP",

    calculate(v) {

        const a = getNumber(v, "a");
        const b = getNumber(v, "b");
        const c = getNumber(v, "c");
        const d = getNumber(v, "d");

        if (b + d === 0) {
            return errorMessage(
                "Demand and supply slopes cannot produce a zero denominator."
            );
        }

        const price =
            (a - c) / (b + d);

        const quantity =
            a - b * price;

        return resultTemplate(
            "At equilibrium: Qd = Qs",
            `
            P = (${a} − ${c})
                ÷ (${b} + ${d})<br><br>

            P = ${number(price)}<br>
            Q = ${number(quantity)}
            `,
            `Equilibrium Price = ${number(price)}<br>
             Equilibrium Quantity = ${number(quantity)}`
        );

    }

},


"total-revenue": {

    title: "Total Revenue",

    fields: [
        ["price", "Price per Unit (₦)", "number"],
        ["quantity", "Quantity Sold", "number"]
    ],

    formula:
        "TR = P × Q",

    calculate(v) {

        const P = getNumber(v, "price");
        const Q = getNumber(v, "quantity");

        const TR =
            P * Q;

        return resultTemplate(
            "TR = P × Q",
            `${money(P)} × ${number(Q)}`,
            money(TR)
        );

    }

},


"average-revenue": {

    title: "Average Revenue",

    fields: [
        ["revenue", "Total Revenue (₦)", "number"],
        ["quantity", "Quantity Sold", "number"]
    ],

    formula:
        "AR = TR ÷ Q",

    calculate(v) {

        const TR =
            getNumber(v, "revenue");

        const Q =
            getNumber(v, "quantity");

        if (Q === 0) {
            return errorMessage(
                "Quantity cannot be zero."
            );
        }

        const AR =
            TR / Q;

        return resultTemplate(
            "AR = TR ÷ Q",
            `${money(TR)} ÷ ${number(Q)}`,
            money(AR)
        );

    }

},


"marginal-revenue": {

    title: "Marginal Revenue",

    fields: [
        ["r1", "Previous Total Revenue (₦)", "number"],
        ["r2", "New Total Revenue (₦)", "number"],
        ["q1", "Previous Quantity", "number"],
        ["q2", "New Quantity", "number"]
    ],

    formula:
        "MR = ΔTR ÷ ΔQ",

    calculate(v) {

        const r1 = getNumber(v, "r1");
        const r2 = getNumber(v, "r2");
        const q1 = getNumber(v, "q1");
        const q2 = getNumber(v, "q2");

        const deltaQ =
            q2 - q1;

        if (deltaQ === 0) {
            return errorMessage(
                "Change in quantity cannot be zero."
            );
        }

        const MR =
            (r2 - r1) / deltaQ;

        return resultTemplate(
            "MR = ΔTR ÷ ΔQ",
            `
            ΔTR = ${money(r2 - r1)}<br>
            ΔQ = ${number(deltaQ)}
            `,
            money(MR)
        );

    }

},


"total-cost": {

    title: "Total Cost",

    fields: [
        ["fixed", "Fixed Cost (₦)", "number"],
        ["variable", "Variable Cost (₦)", "number"]
    ],

    formula:
        "TC = FC + VC",

    calculate(v) {

        const FC =
            getNumber(v, "fixed");

        const VC =
            getNumber(v, "variable");

        const TC =
            FC + VC;

        return resultTemplate(
            "TC = FC + VC",
            `${money(FC)} + ${money(VC)}`,
            money(TC)
        );

    }

},


"average-cost": {

    title: "Average Cost",

    fields: [
        ["total", "Total Cost (₦)", "number"],
        ["quantity", "Quantity", "number"]
    ],

    formula:
        "AC = TC ÷ Q",

    calculate(v) {

        const TC =
            getNumber(v, "total");

        const Q =
            getNumber(v, "quantity");

        if (Q === 0) {
            return errorMessage(
                "Quantity cannot be zero."
            );
        }

        const AC =
            TC / Q;

        return resultTemplate(
            "AC = TC ÷ Q",
            `${money(TC)} ÷ ${number(Q)}`,
            money(AC)
        );

    }

},


"average-fixed-cost": {

    title: "Average Fixed Cost",

    fields: [
        ["fixed", "Fixed Cost (₦)", "number"],
        ["quantity", "Quantity", "number"]
    ],

    formula:
        "AFC = FC ÷ Q",

    calculate(v) {

        const FC =
            getNumber(v, "fixed");

        const Q =
            getNumber(v, "quantity");

        if (Q === 0) {
            return errorMessage(
                "Quantity cannot be zero."
            );
        }

        return resultTemplate(
            "AFC = FC ÷ Q",
            `${money(FC)} ÷ ${number(Q)}`,
            money(FC / Q)
        );

    }

},


"average-variable-cost": {

    title: "Average Variable Cost",

    fields: [
        ["variable", "Variable Cost (₦)", "number"],
        ["quantity", "Quantity", "number"]
    ],

    formula:
        "AVC = VC ÷ Q",

    calculate(v) {

        const VC =
            getNumber(v, "variable");

        const Q =
            getNumber(v, "quantity");

        if (Q === 0) {
            return errorMessage(
                "Quantity cannot be zero."
            );
        }

        return resultTemplate(
            "AVC = VC ÷ Q",
            `${money(VC)} ÷ ${number(Q)}`,
            money(VC / Q)
        );

    }

},


"profit": {

    title: "Economic Profit",

    fields: [
        ["revenue", "Total Revenue (₦)", "number"],
        ["cost", "Total Cost (₦)", "number"]
    ],

    formula:
        "Profit = Total Revenue − Total Cost",

    calculate(v) {

        const TR =
            getNumber(v, "revenue");

        const TC =
            getNumber(v, "cost");

        const profit =
            TR - TC;

        return resultTemplate(
            "Profit = TR − TC",
            `${money(TR)} − ${money(TC)}`,
            money(profit)
        );

    }

},


"consumer-surplus": {

    title: "Consumer Surplus",

    fields: [
        ["maximum", "Maximum Willingness to Pay (₦)", "number"],
        ["actual", "Actual Market Price (₦)", "number"],
        ["quantity", "Quantity", "number"]
    ],

    formula:
        "Consumer Surplus = ½ × (Maximum Price − Market Price) × Quantity",

    calculate(v) {

        const max =
            getNumber(v, "maximum");

        const price =
            getNumber(v, "actual");

        const Q =
            getNumber(v, "quantity");

        const CS =
            0.5 *
            (max - price) *
            Q;

        return resultTemplate(
            "CS = ½ × (Maximum Price − Market Price) × Q",
            `
            = ½ × (${money(max)}
            − ${money(price)})
            × ${number(Q)}
            `,
            money(CS)
        );

    }

},


"producer-surplus": {

    title: "Producer Surplus",

    fields: [
        ["market", "Market Price (₦)", "number"],
        ["minimum", "Minimum Supply Price (₦)", "number"],
        ["quantity", "Quantity", "number"]
    ],

    formula:
        "Producer Surplus = ½ × (Market Price − Minimum Price) × Quantity",

    calculate(v) {

        const market =
            getNumber(v, "market");

        const minimum =
            getNumber(v, "minimum");

        const Q =
            getNumber(v, "quantity");

        const PS =
            0.5 *
            (market - minimum) *
            Q;

        return resultTemplate(
            "PS = ½ × (Market Price − Minimum Price) × Q",
            `
            = ½ × (${money(market)}
            − ${money(minimum)})
            × ${number(Q)}
            `,
            money(PS)
        );

    }

},


"total-product": {

    title: "Total Product",

    fields: [
        ["output", "Total Output", "number"]
    ],

    formula:
        "TP = Total Output",

    calculate(v) {

        const TP =
            getNumber(v, "output");

        return resultTemplate(
            "TP = Total Output",
            `TP = ${number(TP)}`,
            number(TP)
        );

    }

},


"average-product": {

    title: "Average Product",

    fields: [
        ["output", "Total Product", "number"],
        ["labour", "Units of Labour", "number"]
    ],

    formula:
        "AP = TP ÷ Labour",

    calculate(v) {

        const TP =
            getNumber(v, "output");

        const L =
            getNumber(v, "labour");

        if (L === 0) {
            return errorMessage(
                "Labour cannot be zero."
            );
        }

        return resultTemplate(
            "AP = TP ÷ Labour",
            `${number(TP)} ÷ ${number(L)}`,
            number(TP / L)
        );

    }

},


"marginal-product": {

    title: "Marginal Product",

    fields: [
        ["q1", "Previous Output", "number"],
        ["q2", "New Output", "number"],
        ["l1", "Previous Labour", "number"],
        ["l2", "New Labour", "number"]
    ],

    formula:
        "MP = ΔTP ÷ ΔL",

    calculate(v) {

        const q1 =
            getNumber(v, "q1");

        const q2 =
            getNumber(v, "q2");

        const l1 =
            getNumber(v, "l1");

        const l2 =
            getNumber(v, "l2");

        const deltaL =
            l2 - l1;

        if (deltaL === 0) {
            return errorMessage(
                "Change in labour cannot be zero."
            );
        }

        const MP =
            (q2 - q1) / deltaL;

        return resultTemplate(
            "MP = ΔTP ÷ ΔL",
            `
            ΔTP = ${number(q2 - q1)}<br>
            ΔL = ${number(deltaL)}
            `,
            number(MP)
        );

    }

},


"inflation-rate": {

    title: "Inflation Rate",

    fields: [
        ["old", "Old Price Index", "number"],
        ["new", "New Price Index", "number"]
    ],

    formula:
        "Inflation Rate = (New Index − Old Index) ÷ Old Index × 100",

    calculate(v) {

        const oldIndex =
            getNumber(v, "old");

        const newIndex =
            getNumber(v, "new");

        if (oldIndex === 0) {
            return errorMessage(
                "Old price index cannot be zero."
            );
        }

        const rate =
            ((newIndex - oldIndex) /
                oldIndex) * 100;

        return resultTemplate(
            "Inflation Rate = (New − Old) ÷ Old × 100",
            `
            (${newIndex} − ${oldIndex})
            ÷ ${oldIndex}
            × 100
            `,
            percent(rate)
        );

    }

},


"per-capita-income": {

    title: "Per Capita Income",

    fields: [
        ["income", "National Income (₦)", "number"],
        ["population", "Population", "number"]
    ],

    formula:
        "Per Capita Income = National Income ÷ Population",

    calculate(v) {

        const income =
            getNumber(v, "income");

        const population =
            getNumber(v, "population");

        if (population === 0) {
            return errorMessage(
                "Population cannot be zero."
            );
        }

        const answer =
            income / population;

        return resultTemplate(
            "PCI = National Income ÷ Population",
            `${money(income)} ÷ ${number(population)}`,
            money(answer)
        );

    }

},


"nominal-real-gdp": {

    title: "Real GDP from Nominal GDP",

    fields: [
        ["nominal", "Nominal GDP (₦)", "number"],
        ["deflator", "GDP Deflator", "number"]
    ],

    formula:
        "Real GDP = Nominal GDP ÷ GDP Deflator × 100",

    calculate(v) {

        const nominal =
            getNumber(v, "nominal");

        const deflator =
            getNumber(v, "deflator");

        if (deflator === 0) {
            return errorMessage(
                "GDP deflator cannot be zero."
            );
        }

        const real =
            nominal / deflator * 100;

        return resultTemplate(
            "Real GDP = Nominal GDP ÷ GDP Deflator × 100",
            `
            = ${money(nominal)}
              ÷ ${number(deflator)}
              × 100
            `,
            money(real)
        );

    }

},


"gdp-deflator": {

    title: "GDP Deflator",

    fields: [
        ["nominal", "Nominal GDP (₦)", "number"],
        ["real", "Real GDP (₦)", "number"]
    ],

    formula:
        "GDP Deflator = Nominal GDP ÷ Real GDP × 100",

    calculate(v) {

        const nominal =
            getNumber(v, "nominal");

        const real =
            getNumber(v, "real");

        if (real === 0) {
            return errorMessage(
                "Real GDP cannot be zero."
            );
        }

        const deflator =
            nominal / real * 100;

        return resultTemplate(
            "GDP Deflator = Nominal GDP ÷ Real GDP × 100",
            `
            = ${money(nominal)}
              ÷ ${money(real)}
              × 100
            `,
            number(deflator)
        );

    }

}

}

};


/* =========================================================
   CALCULATOR NAMES
========================================================= */

const calculatorNames = {

    accounting: {

        "straight-line-depreciation":
            "Straight-Line Depreciation",

        "reducing-balance":
            "Reducing-Balance Depreciation",

        "book-value":
            "Book Value",

        "gross-profit":
            "Gross Profit",

        "gross-profit-margin":
            "Gross Profit Margin",

        "net-profit":
            "Net Profit",

        "net-profit-margin":
            "Net Profit Margin",

        "markup":
            "Markup",

        "break-even":
            "Break-Even Point",

        "vat":
            "VAT",

        "bad-debt":
            "Bad Debt",

        "cogs":
            "Cost of Goods Sold"

    },


    finance: {

        "simple-interest":
            "Simple Interest",

        "compound-interest":
            "Compound Interest",

        "present-value":
            "Present Value",

        "future-value":
            "Future Value",

        "annuity":
            "Annuity",

        "payment":
            "Payment / Installment",

        "sinking-fund":
            "Sinking Fund",

        "loan-amortization":
            "Loan Amortization"

    },


    mathematics: {

        "quadratic-equation":
            "Quadratic Equation",

        "simple-equation":
            "Simple Linear Equation",

        "simultaneous-equations":
            "Simultaneous Equations",

        "indices":
            "Indices / Exponents",

        "logarithm":
            "Logarithm",

        "percentage-change":
            "Percentage Change",

        "permutation":
            "Permutation",

        "combination":
            "Combination",

        "distance":
            "Distance Between Two Points",

        "midpoint":
            "Midpoint",

        "gradient":
            "Gradient",

        "circle-area":
            "Area of a Circle",

        "trigonometry":
            "Trigonometry",

        "differentiation-power":
            "Differentiation – Power Rule",

        "integration-power":
            "Integration – Power Rule"

    },


    statistics: {

        "mean":
            "Arithmetic Mean",

        "weighted-mean":
            "Weighted Mean",

        "median":
            "Median",

        "mode":
            "Mode",

        "range":
            "Range",

        "variance":
            "Variance",

        "standard-deviation":
            "Standard Deviation",

        "coefficient-variation":
            "Coefficient of Variation",

        "skewness":
            "Skewness",

        "kurtosis":
            "Kurtosis",

        "correlation":
            "Pearson Correlation",

        "spearman":
            "Spearman Rank Correlation",

        "covariance":
            "Covariance",

        "moving-average":
            "Moving Average",

        "weighted-moving-average":
            "Weighted Moving Average",

        "least-squares-trend":
            "Least Squares Trend",

        "trend-forecast":
            "Trend Forecast",

        "seasonal-index":
            "Seasonal Index"

    },


    economics: {

        "price-elasticity-demand":
            "Price Elasticity of Demand",

        "price-elasticity-supply":
            "Price Elasticity of Supply",

        "income-elasticity":
            "Income Elasticity of Demand",

        "cross-elasticity":
            "Cross Elasticity of Demand",

        "equilibrium":
            "Market Equilibrium",

        "total-revenue":
            "Total Revenue",

        "average-revenue":
            "Average Revenue",

        "marginal-revenue":
            "Marginal Revenue",

        "total-cost":
            "Total Cost",

        "average-cost":
            "Average Cost",

        "average-fixed-cost":
            "Average Fixed Cost",

        "average-variable-cost":
            "Average Variable Cost",

        "profit":
            "Economic Profit",

        "consumer-surplus":
            "Consumer Surplus",

        "producer-surplus":
            "Producer Surplus",

        "total-product":
            "Total Product",

        "average-product":
            "Average Product",

        "marginal-product":
            "Marginal Product",

        "inflation-rate":
            "Inflation Rate",

        "per-capita-income":
            "Per Capita Income",

        "nominal-real-gdp":
            "Real GDP from Nominal GDP",

        "gdp-deflator":
            "GDP Deflator"

    }

};


/* =========================================================
   DOM ELEMENTS
========================================================= */

const categorySelect =
    document.getElementById("categorySelect");

const calculatorSelect =
    document.getElementById("calculatorSelect");

const calculatorTitle =
    document.getElementById("calculatorTitle");

const calculatorForm =
    document.getElementById("calculatorForm");

const calculateButton =
    document.getElementById("calculateButton");

const result =
    document.getElementById("result");


/* =========================================================
   POPULATE CALCULATORS
========================================================= */

function populateCalculators() {

    const category =
        categorySelect.value;

    calculatorSelect.innerHTML = "";

    const names =
        calculatorNames[category];

    Object.entries(names).forEach(
        ([value, text]) => {

            const option =
                document.createElement("option");

            option.value = value;
            option.textContent = text;

            calculatorSelect.appendChild(option);

        }
    );


    showCalculator(
        calculatorSelect.value
    );

}


/* =========================================================
   SHOW SELECTED CALCULATOR
========================================================= */

function rbPeriodLabel(start, end) {

    let months =
        (
            end.getFullYear() -
            start.getFullYear()
        ) * 12 +
        (
            end.getMonth() -
            start.getMonth()
        );

    if (end.getDate() < start.getDate()) {
        months--;
    }

    const years =
        Math.floor(months / 12);

    const remainingMonths =
        months % 12;

    const parts = [];

    if (years > 0) {

        parts.push(
            years +
            (years === 1 ? " year" : " years")
        );

    }

    if (remainingMonths > 0) {

        parts.push(
            remainingMonths +
            (remainingMonths === 1
                ? " month"
                : " months")
        );

    }

    if (parts.length === 0) {

        const days =
            Math.round(
                (end - start) / 86400000
            );

        return days +
            (days === 1 ? " day" : " days");

    }

    return parts.join(" ");

}


function rbAddField(
    container,
    name,
    label,
    inputType
) {

    const group =
        document.createElement("div");

    group.className =
        "input-group";

    const labelElement =
        document.createElement("label");

    labelElement.htmlFor =
        name;

    labelElement.textContent =
        label;

    group.appendChild(
        labelElement
    );

    const input =
        document.createElement("input");

    input.type =
        inputType;

    input.id =
        name;

    input.name =
        name;

    input.placeholder =
        label;

    if (inputType === "number") {

        input.step = "any";

    }

    group.appendChild(
        input
    );

    container.appendChild(
        group
    );

}


function showCalculator(type) {

    const category =
        categorySelect.value;

    const calculator =
        calculators[category][type];

    if (!calculator) {

        calculatorTitle.innerHTML =
            "<h2>Calculator unavailable</h2>";

        calculatorForm.innerHTML = "";

        return;

    }


    calculatorTitle.innerHTML =
        `<h2>${calculator.title}</h2>`;


    calculatorForm.innerHTML = "";

   if (
    category === "accounting" &&
    type === "reducing-balance"
) {

    const methodGroup =
        document.createElement("div");

    methodGroup.className =
        "input-group";

    const methodLabel =
        document.createElement("label");

    methodLabel.htmlFor = "method";

    methodLabel.textContent =
        "Calculation Method";

    methodGroup.appendChild(
        methodLabel
    );

    const methodSelect =
        document.createElement("select");

    methodSelect.id = "method";
    methodSelect.name = "method";

    const rateOption =
        document.createElement("option");

    rateOption.value = "rate";

    rateOption.textContent =
        "Calculate Depreciation Rate";

    methodSelect.appendChild(
        rateOption
    );

    const depreciationOption =
        document.createElement("option");

    depreciationOption.value =
        "depreciation";

    depreciationOption.textContent =
        "Calculate Depreciation";

    methodSelect.appendChild(
        depreciationOption
    );

    methodGroup.appendChild(
        methodSelect
    );

    calculatorForm.appendChild(
        methodGroup
    );


    const fieldsContainer =
        document.createElement("div");

    fieldsContainer.id =
        "reducingBalanceFields";

    calculatorForm.appendChild(
        fieldsContainer
    );


    function renderFields(method) {

        fieldsContainer.innerHTML = "";


        if (method === "rate") {

            rbAddField(
                fieldsContainer,
                "cost",
                "Asset Cost (₦)",
                "number"
            );

            rbAddField(
                fieldsContainer,
                "residual",
                "Scrap / Residual Value (₦)",
                "number"
            );

            rbAddField(
                fieldsContainer,
                "life",
                "Useful Life (Years)",
                "number"
            );

        }


        if (method === "depreciation") {

            rbAddField(
                fieldsContainer,
                "cost",
                "Asset Cost (₦)",
                "number"
            );

            rbAddField(
                fieldsContainer,
                "rate",
                "Depreciation Rate (%)",
                "number"
            );

            rbAddField(
                fieldsContainer,
                "startDate",
                "Start Date",
                "date"
            );

            rbAddField(
                fieldsContainer,
                "endDate",
                "End Date",
                "date"
            );

            rbAddField(
                fieldsContainer,
                "openingAccumulated",
                "Opening Accumulated Depreciation (₦) — Optional",
                "number"
            );

        }

    }


    renderFields("rate");


    methodSelect.addEventListener(
        "change",
        function () {

            renderFields(
                methodSelect.value
            );

        }
    );


    result.innerHTML = `

        <h3>Result</h3>

        <p>
            Enter your values and click
            <strong>Calculate</strong>.
        </p>

    `;

    return;

}

    calculator.fields.forEach(
        field => {

            const [
                name,
                label,
                inputType
            ] = field;


            const group =
                document.createElement("div");

            group.className =
                "input-group";


            const labelElement =
                document.createElement("label");

            labelElement.htmlFor =
                name;

            labelElement.textContent =
                label;


            group.appendChild(
                labelElement
            );


            if (inputType === "select") {

                const select =
                    document.createElement("select");

                select.id = name;
                select.name = name;


                const options =
                    calculator.options[name] || [];


                options.forEach(
                    optionData => {

                        const option =
                            document.createElement("option");

                        option.value =
                            optionData[0];

                        option.textContent =
                            optionData[1];

                        select.appendChild(
                            option
                        );

                    }
                );


                group.appendChild(select);


            } else {

                const input =
                    document.createElement("input");

                input.type =
                    inputType;

                input.id =
                    name;

                input.name =
                    name;

                input.placeholder =
                    label;


                if (inputType === "number") {

                    input.step = "any";

                }


                group.appendChild(input);

            }


            calculatorForm.appendChild(group);

        }
    );


    result.innerHTML = `

        <h3>Result</h3>

        <p>
            Enter your values and click
            <strong>Calculate</strong>.
        </p>

    `;

}


/* =========================================================
   CALCULATE CURRENT
========================================================= */

function calculateCurrent() {

    const category =
        categorySelect.value;

    const type =
        calculatorSelect.value;

    const calculator =
        calculators[category][type];


    if (!calculator) {

        result.innerHTML =
            errorMessage(
                "Calculator not found."
            );

        return;

    }


    const values = {};


    calculator.fields.forEach(
        field => {

            const name =
                field[0];

            const element =
                document.getElementById(name);

            if (element) {

                values[name] =
                    element.value;

            }

        }
    );


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
                "Something went wrong. Please check your inputs."
            );

    }

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

if (categorySelect) {

    categorySelect.addEventListener(
        "change",
        populateCalculators
    );

}


if (calculatorSelect) {

    calculatorSelect.addEventListener(
        "change",
        function () {

            showCalculator(
                calculatorSelect.value
            );

        }
    );

}


if (calculateButton) {

    calculateButton.addEventListener(
        "click",
        calculateCurrent
    );

}


/* =========================================================
   START APPLICATION
========================================================= */

populateCalculators();
