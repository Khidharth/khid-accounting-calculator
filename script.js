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
   DATE HELPERS
========================================================= */

function parseLocalDate(value) {

    if (!value) {
        return null;
    }

    const parts = value.split("-").map(Number);

    if (parts.length !== 3) {
        return null;
    }

    const [year, month, day] = parts;

    return new Date(
        year,
        month - 1,
        day
    );

}


function dateDifferenceInDays(start, end) {

    const milliseconds =
        end.getTime() - start.getTime();

    return Math.round(
        milliseconds / (1000 * 60 * 60 * 24)
    );

}


function addOneYear(date) {

    const result = new Date(date);

    result.setFullYear(
        result.getFullYear() + 1
    );

    return result;

}


function formatPeriod(start, end) {

    let years =
        end.getFullYear() -
        start.getFullYear();

    let months =
        end.getMonth() -
        start.getMonth();

    let days =
        end.getDate() -
        start.getDate();


    if (days < 0) {

        months--;

        const previousMonth =
            new Date(
                end.getFullYear(),
                end.getMonth(),
                0
            );

        days +=
            previousMonth.getDate();

    }


    if (months < 0) {

        years--;

        months += 12;

    }


    const parts = [];


    if (years > 0) {

        parts.push(
            `${years} year${years === 1 ? "" : "s"}`
        );

    }


    if (months > 0) {

        parts.push(
            `${months} month${months === 1 ? "" : "s"}`
        );

    }


    if (days > 0) {

        parts.push(
            `${days} day${days === 1 ? "" : "s"}`
        );

    }


    if (!parts.length) {

        return "0 days";

    }


    return parts.join(" ");

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

        if (
            life <= 0 ||
            cost < residual
        ) {

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


/* =========================================================
   REDUCING-BALANCE DEPRECIATION
========================================================= */

"reducing-balance": {

    title: "Reducing-Balance Depreciation",

    /*
       The fields are generated dynamically because this
       calculator has two different calculation methods.
    */

    fields: [],

    formula:
        "Reducing-balance depreciation uses a percentage rate applied to the opening carrying amount.",

    calculate(v) {

        const method = v.method;


        /* =================================================
           METHOD 1 — CALCULATE DEPRECIATION RATE
        ================================================= */

        if (method === "rate") {

            const cost =
                getNumber(v, "cost");

            const residual =
                getNumber(v, "residual");

            const usefulLife =
                getNumber(v, "usefulLife");


            if (
                !Number.isFinite(cost) ||
                !Number.isFinite(residual) ||
                !Number.isFinite(usefulLife)
            ) {

                return errorMessage(
                    "Please enter all required values."
                );

            }


            if (cost <= 0) {

                return errorMessage(
                    "Cost of asset must be greater than zero."
                );

            }


            if (residual < 0) {

                return errorMessage(
                    "Residual value cannot be negative."
                );

            }


            if (residual >= cost) {

                return errorMessage(
                    "Residual value must be less than the cost of the asset."
                );

            }


            if (usefulLife <= 0) {

                return errorMessage(
                    "Useful life must be greater than zero."
                );

            }


            /*
                S = C(1 − r)^n

                r = 1 − (S/C)^(1/n)
            */

            const rateDecimal =
                1 -
                Math.pow(
                    residual / cost,
                    1 / usefulLife
                );


            const rate =
                rateDecimal * 100;


            return resultTemplate(

                `
                S = C(1 − r)<sup>n</sup><br>
                r = 1 − (S/C)<sup>1/n</sup>
                `,

                `
                S = ${money(residual)}<br>
                C = ${money(cost)}<br>
                n = ${number(usefulLife)} years<br><br>

                r =
                1 −
                (${money(residual)} ÷ ${money(cost)})<sup>1/${number(usefulLife)}</sup><br><br>

                r =
                1 −
                ${number(
                    Math.pow(
                        residual / cost,
                        1 / usefulLife
                    ),
                    6
                )}<br><br>

                r =
                ${number(rateDecimal, 6)}
                `,

                `Depreciation Rate = <strong>${percent(rate, 4)}</strong>`,

                "This is the annual reducing-balance depreciation rate required for the asset's carrying amount to reduce from its cost to the stated residual value over the useful life."
            );

        }


        /* =================================================
           METHOD 2 — CALCULATE DEPRECIATION
        ================================================= */

        if (method === "depreciation") {

            const cost =
                getNumber(v, "cost");

            const rate =
                getNumber(v, "rate");

            const openingAccumulated =
                v.openingAccumulated === ""
                ? 0
                : getNumber(v, "openingAccumulated");


            const start =
                parseLocalDate(v.startDate);

            const end =
                parseLocalDate(v.endDate);


            if (
                !Number.isFinite(cost) ||
                !Number.isFinite(rate)
            ) {

                return errorMessage(
                    "Please enter the cost and depreciation rate."
                );

            }


            if (!start || !end) {

                return errorMessage(
                    "Please enter both the start date and end date."
                );

            }


            if (cost <= 0) {

                return errorMessage(
                    "Cost of asset must be greater than zero."
                );

            }


            if (rate < 0 || rate > 100) {

                return errorMessage(
                    "Depreciation rate must be between 0% and 100%."
                );

            }


            if (
                !Number.isFinite(openingAccumulated) ||
                openingAccumulated < 0
            ) {

                return errorMessage(
                    "Opening accumulated depreciation cannot be negative."
                );

            }


            if (openingAccumulated > cost) {

                return errorMessage(
                    "Opening accumulated depreciation cannot exceed the asset cost."
                );

            }


            if (end <= start) {

                return errorMessage(
                    "End date must be after the start date."
                );

            }


            /*
                Opening carrying amount
                = Cost − Opening Accumulated Depreciation
            */

            let openingCarrying =
                cost - openingAccumulated;

            let accumulated =
                openingAccumulated;

            let currentStart =
                new Date(start);

            const rows = [];


            let periodNumber = 1;


            /*
                We divide the depreciation period into
                one-year sections and a final partial period.

                Time fraction is based on actual days / 365.
            */

            while (currentStart < end) {

                let currentEnd =
                    addOneYear(currentStart);


                if (currentEnd > end) {

                    currentEnd =
                        new Date(end);

                }


                const days =
                    dateDifferenceInDays(
                        currentStart,
                        currentEnd
                    );


                const timeFraction =
                    days / 365;


                const depreciation =
                    Math.min(
                        openingCarrying,
                        openingCarrying *
                        (rate / 100) *
                        timeFraction
                    );


                const closingCarrying =
                    openingCarrying -
                    depreciation;


                accumulated +=
                    depreciation;


                rows.push({

                    period:
                        periodNumber,

                    start:
                        new Date(currentStart),

                    end:
                        new Date(currentEnd),

                    days,

                    timeFraction,

                    periodText:
                        formatPeriod(
                            currentStart,
                            currentEnd
                        ),

                    opening:
                        openingCarrying,

                    depreciation,

                    accumulated,

                    closing:
                        closingCarrying

                });


                openingCarrying =
                    closingCarrying;


                currentStart =
                    currentEnd;


                periodNumber++;

            }


            const totalDays =
                dateDifferenceInDays(
                    start,
                    end
                );


            const totalYears =
                totalDays / 365;


            const totalDepreciation =
                accumulated -
                openingAccumulated;


            const finalCarrying =
                cost -
                accumulated;


            let tableRows = "";


            rows.forEach(row => {

                tableRows += `

                    <tr>

                        <td style="border:1px solid #94a3b8;padding:8px;text-align:center;">
                            ${row.period}
                        </td>

                        <td style="border:1px solid #94a3b8;padding:8px;">
                            ${row.periodText}
                        </td>

                        <td style="border:1px solid #94a3b8;padding:8px;text-align:right;">
                            ${number(row.days, 0)}
                        </td>

                        <td style="border:1px solid #94a3b8;padding:8px;text-align:right;">
                            ${money(row.opening)}
                        </td>

                        <td style="border:1px solid #94a3b8;padding:8px;text-align:right;">
                            ${money(row.depreciation)}
                        </td>

                        <td style="border:1px solid #94a3b8;padding:8px;text-align:right;">
                            ${money(row.accumulated)}
                        </td>

                        <td style="border:1px solid #94a3b8;padding:8px;text-align:right;">
                            ${money(row.closing)}
                        </td>

                    </tr>

                `;

            });


            return `

                <div class="formula-box">

                    <strong>Formula</strong>

                    <p>
                        Depreciation =
                        Opening Carrying Amount
                        × Depreciation Rate
                        × Time Fraction
                    </p>

                    <p>
                        Closing Carrying Amount =
                        Opening Carrying Amount
                        − Depreciation
                    </p>

                    <p>
                        Accumulated Depreciation =
                        Opening Accumulated Depreciation
                        + Current Depreciation
                    </p>

                </div>


                <div class="working-box">

                    <strong>Working</strong>

                    <p>

                        Cost of Asset =
                        ${money(cost)}<br>

                        Opening Accumulated Depreciation =
                        ${money(openingAccumulated)}<br>

                        Opening Carrying Amount =
                        ${money(cost)}
                        −
                        ${money(openingAccumulated)}
                        =
                        <strong>${money(
                            cost - openingAccumulated
                        )}</strong><br>

                        Depreciation Rate =
                        ${percent(rate)}<br>

                        Total Period =
                        ${formatPeriod(start, end)}
                        (${number(totalDays, 0)} days)<br>

                        Time in years =
                        ${number(totalYears, 4)}
                        years

                    </p>


                    <p>

                        For each period:

                        <br><br>

                        Depreciation =
                        Opening Carrying Amount
                        ×
                        ${percent(rate)}
                        ×
                        (Days ÷ 365)

                    </p>


                    <div style="overflow-x:auto;">

                        <table style="
                            width:100%;
                            border-collapse:collapse;
                            margin-top:15px;
                            font-size:0.92rem;
                        ">

                            <thead>

                                <tr>

                                    <th style="
                                        border:1px solid #94a3b8;
                                        padding:8px;
                                        background:#0f766e;
                                        color:white;
                                    ">
                                        Period
                                    </th>

                                    <th style="
                                        border:1px solid #94a3b8;
                                        padding:8px;
                                        background:#0f766e;
                                        color:white;
                                    ">
                                        Period Length
                                    </th>

                                    <th style="
                                        border:1px solid #94a3b8;
                                        padding:8px;
                                        background:#0f766e;
                                        color:white;
                                    ">
                                        Days
                                    </th>

                                    <th style="
                                        border:1px solid #94a3b8;
                                        padding:8px;
                                        background:#0f766e;
                                        color:white;
                                    ">
                                        Opening Carrying Amount
                                    </th>

                                    <th style="
                                        border:1px solid #94a3b8;
                                        padding:8px;
                                        background:#0f766e;
                                        color:white;
                                    ">
                                        Depreciation
                                    </th>

                                    <th style="
                                        border:1px solid #94a3b8;
                                        padding:8px;
                                        background:#0f766e;
                                        color:white;
                                    ">
                                        Accumulated Depreciation
                                    </th>

                                    <th style="
                                        border:1px solid #94a3b8;
                                        padding:8px;
                                        background:#0f766e;
                                        color:white;
                                    ">
                                        Closing Carrying Amount
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                ${tableRows}

                            </tbody>

                        </table>

                    </div>

                </div>


                <div class="interpretation-box">

                    <strong>Answer</strong>

                    <p>

                        Total Depreciation =
                        <strong>${money(totalDepreciation)}</strong>

                    </p>

                    <p>

                        Closing Accumulated Depreciation =
                        <strong>${money(accumulated)}</strong>

                    </p>

                    <p>

                        Closing Carrying Amount =
                        <strong>${money(finalCarrying)}</strong>

                    </p>

                    <p>

                        <strong>Note:</strong>
                        The partial period is calculated using
                        actual days ÷ 365. The displayed
                        year/month/day period is shown separately
                        so that the working is clear.

                    </p>

                </div>

            `;

        }


        return errorMessage(
            "Please select a valid reducing-balance calculation method."
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

        const cost =
            getNumber(v, "cost");

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

        const sales =
            getNumber(v, "sales");

        const cogs =
            getNumber(v, "cogs");

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

        const sales =
            getNumber(v, "sales");

        const cogs =
            getNumber(v, "cogs");

        if (sales === 0) {

            return errorMessage(
                "Sales cannot be zero."
            );

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

            =
            ${money(grossProfit)}
            ÷
            ${money(sales)}
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
            =
            ${money(revenue)}
            −
            ${money(expenses)}
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

            return errorMessage(
                "Revenue cannot be zero."
            );

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

            =
            ${money(profit)}
            ÷
            ${money(revenue)}
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

        const cost =
            getNumber(v, "cost");

        const selling =
            getNumber(v, "selling");

        if (cost === 0) {

            return errorMessage(
                "Cost cannot be zero."
            );

        }

        const markup =
            ((selling - cost) / cost) * 100;

        return resultTemplate(

            "Markup % = (Selling Price − Cost) ÷ Cost × 100",

            `
            Markup =
            ${money(selling - cost)}<br><br>

            =
            ${money(selling - cost)}
            ÷
            ${money(cost)}
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

        const fixed =
            getNumber(v, "fixed");

        const selling =
            getNumber(v, "selling");

        const variable =
            getNumber(v, "variable");

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

            =
            ${money(fixed)}
            ÷
            ${money(contribution)}
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

        const amount =
            getNumber(v, "amount");

        const rate =
            getNumber(v, "rate");

        const vat =
            amount * rate / 100;

        const total =
            amount + vat;

        return resultTemplate(

            "VAT = Amount × VAT Rate ÷ 100",

            `
            VAT =
            ${money(amount)}
            ×
            ${percent(rate)}
            =
            ${money(vat)}<br><br>

            Total =
            ${money(amount)}
            +
            ${money(vat)}
            =
            ${money(total)}
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
            =
            ${money(receivable)}
            −
            ${money(bad)}
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

        const opening =
            getNumber(v, "opening");

        const purchases =
            getNumber(v, "purchases");

        const closing =
            getNumber(v, "closing");

        const cogs =
            opening +
            purchases -
            closing;

        return resultTemplate(

            "COGS = Opening Inventory + Purchases − Closing Inventory",

            `
            =
            ${money(opening)}
            +
            ${money(purchases)}
            −
            ${money(closing)}
            `,

            money(cogs)

        );

    }

}

},


/* =========================================================
   FINANCE
========================================================= */

finance: {            `,

            `Derivative = ${number(newCoefficient)}x^${number(newPower)}`
        );

    }

},


"factorial": {

    title: "Factorial",

    fields: [
        ["n", "Number (n)", "number"]
    ],

    formula:
        "n! = n × (n−1) × ... × 1",

    calculate(v) {

        const n =
            getNumber(v, "n");

        if (
            n < 0 ||
            !Number.isInteger(n)
        ) {

            return errorMessage(
                "The number must be a non-negative whole number."
            );

        }

        const answer =
            factorial(n);

        return resultTemplate(

            "n! = n × (n−1) × ... × 1",

            `${n}! = ${number(answer)}`,

            number(answer)

        );

    }

}

},


/* =========================================================
   STATISTICS
========================================================= */

statistics: {


"mean": {

    title: "Mean",

    fields: [
        ["data", "Data (comma separated)", "text"]
    ],

    formula:
        "Mean = Σx ÷ n",

    calculate(v) {

        const values =
            getArray(v.data);

        if (!values.length) {

            return errorMessage(
                "Enter valid numbers separated by commas."
            );

        }

        const total =
            sum(values);

        const mean =
            total / values.length;

        return resultTemplate(

            "Mean = Σx ÷ n",

            `
            Σx =
            ${number(total)}<br><br>

            n =
            ${values.length}<br><br>

            Mean =
            ${number(total)}
            ÷
            ${values.length}
            =
            ${number(mean)}
            `,

            number(mean)

        );

    }

},


"median": {

    title: "Median",

    fields: [
        ["data", "Data (comma separated)", "text"]
    ],

    formula:
        "Median = middle value after arranging data in order",

    calculate(v) {

        const values =
            getArray(v.data);

        if (!values.length) {

            return errorMessage(
                "Enter valid numbers separated by commas."
            );

        }

        values.sort(
            (a, b) => a - b
        );

        const n =
            values.length;

        let median;

        if (n % 2 === 0) {

            median =
                (
                    values[n / 2 - 1] +
                    values[n / 2]
                ) / 2;

        } else {

            median =
                values[Math.floor(n / 2)];

        }

        return resultTemplate(

            "Median = middle value after arranging data",

            `
            Ordered data =
            ${values.join(", ")}<br><br>

            Median =
            ${number(median)}
            `,

            number(median)

        );

    }

},


"mode": {

    title: "Mode",

    fields: [
        ["data", "Data (comma separated)", "text"]
    ],

    formula:
        "Mode = value(s) occurring most frequently",

    calculate(v) {

        const values =
            getArray(v.data);

        if (!values.length) {

            return errorMessage(
                "Enter valid numbers separated by commas."
            );

        }

        const frequency = {};

        values.forEach(value => {

            frequency[value] =
                (frequency[value] || 0) + 1;

        });


        let highest = 0;

        Object.values(frequency)
            .forEach(count => {

                if (count > highest) {
                    highest = count;
                }

            });


        if (highest === 1) {

            return resultTemplate(

                "Mode = value(s) occurring most frequently",

                "Every value occurs once.",

                "No mode."

            );

        }


        const modes =
            Object.keys(frequency)
                .filter(
                    value =>
                        frequency[value] === highest
                )
                .map(Number);


        return resultTemplate(

            "Mode = value(s) occurring most frequently",

            `
            Highest frequency =
            ${highest}<br><br>

            Mode(s) =
            ${modes.join(", ")}
            `,

            modes.join(", ")

        );

    }

},


"range": {

    title: "Range",

    fields: [
        ["data", "Data (comma separated)", "text"]
    ],

    formula:
        "Range = Maximum − Minimum",

    calculate(v) {

        const values =
            getArray(v.data);

        if (!values.length) {

            return errorMessage(
                "Enter valid numbers separated by commas."
            );

        }

        const minimum =
            Math.min(...values);

        const maximum =
            Math.max(...values);

        const range =
            maximum - minimum;

        return resultTemplate(

            "Range = Maximum − Minimum",

            `
            Maximum =
            ${number(maximum)}<br><br>

            Minimum =
            ${number(minimum)}<br><br>

            Range =
            ${number(maximum)}
            −
            ${number(minimum)}
            =
            ${number(range)}
            `,

            number(range)

        );

    }

},


"variance": {

    title: "Variance",

    fields: [
        ["data", "Data (comma separated)", "text"]
    ],

    formula:
        "Population Variance = Σ(x − x̄)² ÷ n",

    calculate(v) {

        const values =
            getArray(v.data);

        if (!values.length) {

            return errorMessage(
                "Enter valid numbers separated by commas."
            );

        }

        const meanValue =
            average(values);

        const squaredDifferences =
            values.map(
                value =>
                    Math.pow(
                        value - meanValue,
                        2
                    )
            );

        const varianceValue =
            average(squaredDifferences);

        return resultTemplate(

            "Population Variance = Σ(x − x̄)² ÷ n",

            `
            Mean =
            ${number(meanValue)}<br><br>

            Σ(x − x̄)² =
            ${number(
                sum(squaredDifferences)
            )}<br><br>

            Variance =
            ${number(varianceValue)}
            `,

            number(varianceValue)

        );

    }

},


"standard-deviation": {

    title: "Standard Deviation",

    fields: [
        ["data", "Data (comma separated)", "text"]
    ],

    formula:
        "Standard Deviation = √Variance",

    calculate(v) {

        const values =
            getArray(v.data);

        if (!values.length) {

            return errorMessage(
                "Enter valid numbers separated by commas."
            );

        }

        const meanValue =
            average(values);

        const varianceValue =
            average(
                values.map(
                    value =>
                        Math.pow(
                            value - meanValue,
                            2
                        )
                )
            );

        const standardDeviation =
            Math.sqrt(varianceValue);

        return resultTemplate(

            "Standard Deviation = √Variance",

            `
            Variance =
            ${number(varianceValue)}<br><br>

            Standard Deviation =
            √${number(varianceValue)}
            =
            ${number(standardDeviation)}
            `,

            number(standardDeviation)

        );

    }

},


"coefficient-variation": {

    title: "Coefficient of Variation",

    fields: [
        ["data", "Data (comma separated)", "text"]
    ],

    formula:
        "CV = Standard Deviation ÷ Mean × 100",

    calculate(v) {

        const values =
            getArray(v.data);

        if (!values.length) {

            return errorMessage(
                "Enter valid numbers separated by commas."
            );

        }

        const meanValue =
            average(values);

        if (meanValue === 0) {

            return errorMessage(
                "Mean cannot be zero."
            );

        }

        const varianceValue =
            average(
                values.map(
                    value =>
                        Math.pow(
                            value - meanValue,
                            2
                        )
                )
            );

        const sd =
            Math.sqrt(varianceValue);

        const cv =
            (sd / Math.abs(meanValue))
            * 100;

        return resultTemplate(

            "CV = Standard Deviation ÷ Mean × 100",

            `
            Mean =
            ${number(meanValue)}<br><br>

            Standard Deviation =
            ${number(sd)}<br><br>

            CV =
            ${number(sd)}
            ÷
            ${number(Math.abs(meanValue))}
            × 100
            `,

            percent(cv)

        );

    }

},


"quartile": {

    title: "Quartiles",

    fields: [
        ["data", "Data (comma separated)", "text"]
    ],

    formula:
        "Quartiles divide ordered data into four parts.",

    calculate(v) {

        const values =
            getArray(v.data);

        if (!values.length) {

            return errorMessage(
                "Enter valid numbers separated by commas."
            );

        }

        values.sort(
            (a, b) => a - b
        );


        const medianOfArray =
            arr => {

                const n =
                    arr.length;

                if (n % 2 === 0) {

                    return (
                        arr[n / 2 - 1] +
                        arr[n / 2]
                    ) / 2;

                }

                return arr[
                    Math.floor(n / 2)
                ];

            };


        const n =
            values.length;

        const median =
            medianOfArray(values);


        const lower =
            n % 2 === 0
            ? values.slice(0, n / 2)
            : values.slice(0, Math.floor(n / 2));


        const upper =
            n % 2 === 0
            ? values.slice(n / 2)
            : values.slice(Math.floor(n / 2) + 1);


        const Q1 =
            lower.length
            ? medianOfArray(lower)
            : median;


        const Q3 =
            upper.length
            ? medianOfArray(upper)
            : median;


        const IQR =
            Q3 - Q1;


        return resultTemplate(

            "Quartiles divide ordered data into four parts.",

            `
            Ordered data =
            ${values.join(", ")}<br><br>

            Q₁ =
            ${number(Q1)}<br>

            Q₂ =
            ${number(median)}<br>

            Q₃ =
            ${number(Q3)}<br><br>

            IQR =
            Q₃ − Q₁
            =
            ${number(IQR)}
            `,

            `Q₁ = ${number(Q1)}<br>
             Q₂ = ${number(median)}<br>
             Q₃ = ${number(Q3)}<br>
             IQR = ${number(IQR)}`

        );

    }

},


"correlation": {

    title: "Correlation Coefficient",

    fields: [
        ["x", "X values (comma separated)", "text"],
        ["y", "Y values (comma separated)", "text"]
    ],

    formula:
        "r = correlation coefficient",

    calculate(v) {

        const x =
            getArray(v.x);

        const y =
            getArray(v.y);


        if (
            !x.length ||
            !y.length ||
            x.length !== y.length
        ) {

            return errorMessage(
                "X and Y must contain the same number of valid values."
            );

        }


        const xMean =
            average(x);

        const yMean =
            average(y);


        let numerator = 0;
        let xSum = 0;
        let ySum = 0;


        for (
            let i = 0;
            i < x.length;
            i++
        ) {

            const dx =
                x[i] - xMean;

            const dy =
                y[i] - yMean;

            numerator +=
                dx * dy;

            xSum +=
                dx * dx;

            ySum +=
                dy * dy;

        }


        const denominator =
            Math.sqrt(
                xSum * ySum
            );


        if (denominator === 0) {

            return errorMessage(
                "Correlation cannot be determined when one variable has no variation."
            );

        }


        const r =
            numerator / denominator;


        return resultTemplate(

            "Correlation coefficient",

            `
            r =
            ${number(r, 6)}
            `,

            number(r, 6),

            interpretCorrelation(r)

        );

    }

},


"skewness": {

    title: "Skewness",

    fields: [
        ["data", "Data (comma separated)", "text"]
    ],

    formula:
        "Skewness = μ₃ ÷ σ³",

    calculate(v) {

        const values =
            getArray(v.data);

        if (!values.length) {

            return errorMessage(
                "Enter valid numbers separated by commas."
            );

        }

        const meanValue =
            average(values);


        const deviations =
            values.map(
                value =>
                    value - meanValue
            );


        const m2 =
            average(
                deviations.map(
                    value =>
                        Math.pow(value, 2)
                )
            );


        const m3 =
            average(
                deviations.map(
                    value =>
                        Math.pow(value, 3)
                )
            );


        if (m2 === 0) {

            return errorMessage(
                "Skewness cannot be determined when all values are equal."
            );

        }


        const skewness =
            m3 /
            Math.pow(m2, 1.5);


        return resultTemplate(

            "Skewness = μ₃ ÷ σ³",

            `
            Mean =
            ${number(meanValue)}<br><br>

            μ₂ =
            ${number(m2)}<br><br>

            μ₃ =
            ${number(m3)}<br><br>

            Skewness =
            ${number(skewness)}
            `,

            number(skewness),

            interpretSkewness(skewness)

        );

    }

},


"kurtosis": {

    title: "Kurtosis",

    fields: [
        ["data", "Data (comma separated)", "text"]
    ],

    formula:
        "β₂ = μ₄ ÷ μ₂²",

    calculate(v) {

        const values =
            getArray(v.data);

        if (!values.length) {

            return errorMessage(
                "Enter valid numbers separated by commas."
            );

        }

        const meanValue =
            average(values);


        const deviations =
            values.map(
                value =>
                    value - meanValue
            );


        const m2 =
            average(
                deviations.map(
                    value =>
                        Math.pow(value, 2)
                )
            );


        const m4 =
            average(
                deviations.map(
                    value =>
                        Math.pow(value, 4)
                )
            );


        if (m2 === 0) {

            return errorMessage(
                "Kurtosis cannot be determined when all values are equal."
            );

        }


        const beta2 =
            m4 /
            Math.pow(m2, 2);


        return resultTemplate(

            "β₂ = μ₄ ÷ μ₂²",

            `
            μ₂ =
            ${number(m2)}<br><br>

            μ₄ =
            ${number(m4)}<br><br>

            β₂ =
            ${number(beta2)}
            `,

            number(beta2),

            interpretKurtosis(beta2)

        );

    }

}

},


/* =========================================================
   ECONOMICS
========================================================= */

economics: {


"price-elasticity-demand": {

    title: "Price Elasticity of Demand (PED)",

    fields: [
        ["q1", "Initial Quantity Demanded", "number"],
        ["q2", "New Quantity Demanded", "number"],
        ["p1", "Initial Price", "number"],
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
                "Initial quantity and initial price cannot be zero."
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
            percentQ /
            percentP;


        const absolutePED =
            Math.abs(ped);


        return resultTemplate(

            "PED = % Change in Quantity Demanded ÷ % Change in Price",

            `
            % Change in Quantity =
            ${percent(percentQ)}<br><br>

            % Change in Price =
            ${percent(percentP)}<br><br>

            PED =
            ${number(ped, 4)}<br><br>

            Absolute PED =
            |${number(ped, 4)}|
            =
            ${number(absolutePED, 4)}
            `,

            `PED = <strong>${number(absolutePED, 4)}</strong>`,

            `${interpretPED(ped)}
            <br><br>
            <strong>Note:</strong> The negative sign in the ordinary PED value reflects the inverse relationship between price and quantity demanded. PED is commonly reported as an absolute positive value when classifying elasticity.`

        );

    }

},


"price-elasticity-supply": {

    title: "Price Elasticity of Supply (PES)",

    fields: [
        ["q1", "Initial Quantity Supplied", "number"],
        ["q2", "New Quantity Supplied", "number"],
        ["p1", "Initial Price", "number"],
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
                "Initial quantity and initial price cannot be zero."
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
            percentQ /
            percentP;


        return resultTemplate(

            "PES = % Change in Quantity Supplied ÷ % Change in Price",

            `
            % Change in Quantity =
            ${percent(percentQ)}<br><br>

            % Change in Price =
            ${percent(percentP)}<br><br>

            PES =
            ${number(pes, 4)}
            `,

            `PES = <strong>${number(pes, 4)}</strong>`,

            interpretPES(pes)

        );

    }

},


"income-elasticity": {

    title: "Income Elasticity of Demand",

    fields: [
        ["q1", "Initial Quantity Demanded", "number"],
        ["q2", "New Quantity Demanded", "number"],
        ["i1", "Initial Income", "number"],
        ["i2", "New Income", "number"]
    ],

    formula:
        "YED = % Change in Quantity Demanded ÷ % Change in Income",

    calculate(v) {

        const q1 =
            getNumber(v, "q1");

        const q2 =
            getNumber(v, "q2");

        const i1 =
            getNumber(v, "i1");

        const i2 =
            getNumber(v, "i2");


        if (
            q1 === 0 ||
            i1 === 0
        ) {

            return errorMessage(
                "Initial quantity and initial income cannot be zero."
            );

        }


        const percentQ =
            ((q2 - q1) / q1) * 100;

        const percentI =
            ((i2 - i1) / i1) * 100;


        if (percentI === 0) {

            return errorMessage(
                "Percentage change in income cannot be zero."
            );

        }


        const elasticity =
            percentQ /
            percentI;


        return resultTemplate(

            "YED = % Change in Quantity Demanded ÷ % Change in Income",

            `
            % Change in Quantity =
            ${percent(percentQ)}<br><br>

            % Change in Income =
            ${percent(percentI)}<br><br>

            YED =
            ${number(elasticity, 4)}
            `,

            number(elasticity, 4),

            interpretIncomeElasticity(elasticity)

        );

    }

},


"cross-elasticity": {

    title: "Cross Elasticity of Demand",

    fields: [
        ["q1", "Initial Quantity of Good X", "number"],
        ["q2", "New Quantity of Good X", "number"],
        ["p1", "Initial Price of Good Y", "number"],
        ["p2", "New Price of Good Y", "number"]
    ],

    formula:
        "XED = % Change in Quantity of X ÷ % Change in Price of Y",

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
                "Initial quantity and initial price cannot be zero."
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


        const elasticity =
            percentQ /
            percentP;


        return resultTemplate(

            "XED = % Change in Quantity of X ÷ % Change in Price of Y",

            `
            % Change in Quantity of X =
            ${percent(percentQ)}<br><br>

            % Change in Price of Y =
            ${percent(percentP)}<br><br>

            XED =
            ${number(elasticity, 4)}
            `,

            number(elasticity, 4),

            interpretCrossElasticity(elasticity)

        );

    }

},


"profit": {

    title: "Economic Profit",

    fields: [
        ["revenue", "Total Revenue (₦)", "number"],
        ["explicit", "Explicit Costs (₦)", "number"],
        ["implicit", "Implicit Costs (₦)", "number"]
    ],

    formula:
        "Economic Profit = Total Revenue − Explicit Costs − Implicit Costs",

    calculate(v) {

        const revenue =
            getNumber(v, "revenue");

        const explicit =
            getNumber(v, "explicit");

        const implicit =
            getNumber(v, "implicit");


        const profit =
            revenue -
            explicit -
            implicit;


        return resultTemplate(

            "Economic Profit = TR − Explicit Costs − Implicit Costs",

            `
            =
            ${money(revenue)}
            −
            ${money(explicit)}
            −
            ${money(implicit)}
            `,

            money(profit)

        );

    }

},


"national-income": {

    title: "National Income",

    fields: [
        ["wages", "Wages", "number"],
        ["rent", "Rent", "number"],
        ["interest", "Interest", "number"],
        ["profit", "Profit", "number"]
    ],

    formula:
        "National Income = Wages + Rent + Interest + Profit",

    calculate(v) {

        const wages =
            getNumber(v, "wages");

        const rent =
            getNumber(v, "rent");

        const interest =
            getNumber(v, "interest");

        const profit =
            getNumber(v, "profit");


        const income =
            wages +
            rent +
            interest +
            profit;


        return resultTemplate(

            "National Income = Wages + Rent + Interest + Profit",

            `
            =
            ${money(wages)}
            +
            ${money(rent)}
            +
            ${money(interest)}
            +
            ${money(profit)}
            `,

            money(income)

        );

    }

},


"price-index": {

    title: "Price Index",

    fields: [
        ["current", "Current Price", "number"],
        ["base", "Base Price", "number"]
    ],

    formula:
        "Price Index = Current Price ÷ Base Price × 100",

    calculate(v) {

        const current =
            getNumber(v, "current");

        const base =
            getNumber(v, "base");


        if (base === 0) {

            return errorMessage(
                "Base price cannot be zero."
            );

        }


        const index =
            (current / base) * 100;


        return resultTemplate(

            "Price Index = Current Price ÷ Base Price × 100",

            `
            =
            ${number(current)}
            ÷
            ${number(base)}
            × 100
            `,

            number(index)

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
            "VAT Calculator",

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
            "Loan Payment / Installment",

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

        "indices":
            "Indices / Exponents",

        "logarithm":
            "Logarithm",

        "simultaneous-equations":
            "Simultaneous Equations",

        "differentiation-power":
            "Differentiation – Power Rule",

        "factorial":
            "Factorial"

    },


    statistics: {

        "mean":
            "Mean",

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

        "quartile":
            "Quartiles",

        "correlation":
            "Correlation Coefficient",

        "skewness":
            "Skewness",

        "kurtosis":
            "Kurtosis"

    },


    economics: {

        "price-elasticity-demand":
            "Price Elasticity of Demand (PED)",

        "price-elasticity-supply":
            "Price Elasticity of Supply (PES)",

        "income-elasticity":
            "Income Elasticity of Demand",

        "cross-elasticity":
            "Cross Elasticity of Demand",

        "profit":
            "Economic Profit",

        "national-income":
            "National Income",

        "price-index":
            "Price Index"

    }

};


/* =========================================================
   DOM ELEMENTS
========================================================= */

const categorySelect =
    document.getElementById("category");            `

            Derivative =
            ${number(newCoefficient)}x^${number(newPower)}
            `,

            `${number(newCoefficient)}x^${number(newPower)}`
        );

    }

},


"basic-arithmetic": {

    title: "Basic Arithmetic",

    fields: [
        ["first", "First Number", "number"],
        ["second", "Second Number", "number"],
        ["operation", "Operation", "select"]
    ],

    options: {
        operation: [
            ["add", "Addition (+)"],
            ["subtract", "Subtraction (−)"],
            ["multiply", "Multiplication (×)"],
            ["divide", "Division (÷)"]
        ]
    },

    formula:
        "Perform the selected arithmetic operation.",

    calculate(v) {

        const first =
            getNumber(v, "first");

        const second =
            getNumber(v, "second");

        let answer;
        let symbol;

        if (v.operation === "add") {

            answer = first + second;
            symbol = "+";

        }

        if (v.operation === "subtract") {

            answer = first - second;
            symbol = "−";

        }

        if (v.operation === "multiply") {

            answer = first * second;
            symbol = "×";

        }

        if (v.operation === "divide") {

            if (second === 0) {

                return errorMessage(
                    "Division by zero is not allowed."
                );

            }

            answer = first / second;
            symbol = "÷";

        }

        return resultTemplate(

            "Selected arithmetic operation",

            `
            ${number(first)}
            ${symbol}
            ${number(second)}
            =
            ${number(answer)}
            `,

            number(answer)
        );

    }

}

},


/* =========================================================
   STATISTICS
========================================================= */

statistics: {


"mean": {

    title: "Mean",

    fields: [
        ["data", "Data Values (comma separated)", "text"]
    ],

    formula:
        "Mean = Σx ÷ n",

    calculate(v) {

        const values =
            getArray(v.data);

        if (!values.length) {

            return errorMessage(
                "Enter at least one valid number."
            );

        }

        const total =
            sum(values);

        const mean =
            average(values);

        return resultTemplate(

            "Mean = Σx ÷ n",

            `
            Σx = ${number(total)}<br><br>

            n = ${values.length}<br><br>

            Mean =
            ${number(total)}
            ÷ ${values.length}
            =
            ${number(mean)}
            `,

            number(mean)
        );

    }

},


"median": {

    title: "Median",

    fields: [
        ["data", "Data Values (comma separated)", "text"]
    ],

    formula:
        "Median = middle value after arranging the data.",

    calculate(v) {

        const values =
            getArray(v.data)
                .sort((a, b) => a - b);

        if (!values.length) {

            return errorMessage(
                "Enter at least one valid number."
            );

        }

        const middle =
            Math.floor(values.length / 2);

        let median;

        if (values.length % 2 === 0) {

            median =
                (
                    values[middle - 1] +
                    values[middle]
                ) / 2;

        } else {

            median =
                values[middle];

        }

        return resultTemplate(

            "Median = middle value after arranging the data.",

            `
            Ordered data:
            ${values.join(", ")}<br><br>

            Median =
            ${number(median)}
            `,

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
        "Mode = value(s) occurring most frequently.",

    calculate(v) {

        const values =
            getArray(v.data);

        if (!values.length) {

            return errorMessage(
                "Enter at least one valid number."
            );

        }

        const frequencies = {};

        values.forEach(value => {

            frequencies[value] =
                (frequencies[value] || 0) + 1;

        });

        const highest =
            Math.max(
                ...Object.values(frequencies)
            );

        const modes =
            Object.keys(frequencies)
                .filter(
                    key =>
                        frequencies[key] === highest
                )
                .map(Number);

        if (highest === 1) {

            return resultTemplate(

                "Mode = value occurring most frequently.",

                `
                Every value occurs only once.
                `,

                "No mode."
            );

        }

        return resultTemplate(

            "Mode = value(s) occurring most frequently.",

            `
            Highest frequency =
            ${highest}<br><br>

            Mode value(s):
            ${modes.join(", ")}
            `,

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

        const values =
            getArray(v.data);

        if (!values.length) {

            return errorMessage(
                "Enter at least one valid number."
            );

        }

        const minimum =
            Math.min(...values);

        const maximum =
            Math.max(...values);

        const range =
            maximum - minimum;

        return resultTemplate(

            "Range = Maximum − Minimum",

            `
            Maximum = ${number(maximum)}<br><br>

            Minimum = ${number(minimum)}<br><br>

            Range =
            ${number(maximum)}
            −
            ${number(minimum)}
            =
            ${number(range)}
            `,

            number(range)
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

        const values =
            getArray(v.data);

        if (!values.length) {

            return errorMessage(
                "Enter at least one valid number."
            );

        }

        const mean =
            average(values);

        const squaredDifferences =
            values.map(
                x =>
                    Math.pow(x - mean, 2)
            );

        const variance =
            average(squaredDifferences);

        return resultTemplate(

            "Population Variance = Σ(x − x̄)² ÷ n",

            `
            Mean =
            ${number(mean)}<br><br>

            Σ(x − x̄)² =
            ${number(sum(squaredDifferences))}<br><br>

            Variance =
            ${number(variance)}
            `,

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

        const values =
            getArray(v.data);

        if (!values.length) {

            return errorMessage(
                "Enter at least one valid number."
            );

        }

        const mean =
            average(values);

        const variance =
            average(
                values.map(
                    x =>
                        Math.pow(x - mean, 2)
                )
            );

        const standardDeviation =
            Math.sqrt(variance);

        return resultTemplate(

            "Standard Deviation = √Variance",

            `
            Variance =
            ${number(variance)}<br><br>

            Standard Deviation =
            √${number(variance)}
            =
            ${number(standardDeviation)}
            `,

            number(standardDeviation)
        );

    }

},


"coefficient-of-variation": {

    title: "Coefficient of Variation",

    fields: [
        ["data", "Data Values (comma separated)", "text"]
    ],

    formula:
        "CV = Standard Deviation ÷ Mean × 100",

    calculate(v) {

        const values =
            getArray(v.data);

        if (!values.length) {

            return errorMessage(
                "Enter at least one valid number."
            );

        }

        const mean =
            average(values);

        if (mean === 0) {

            return errorMessage(
                "Mean cannot be zero."
            );

        }

        const variance =
            average(
                values.map(
                    x =>
                        Math.pow(x - mean, 2)
                )
            );

        const sd =
            Math.sqrt(variance);

        const cv =
            (sd / Math.abs(mean)) * 100;

        return resultTemplate(

            "CV = Standard Deviation ÷ Mean × 100",

            `
            Mean =
            ${number(mean)}<br><br>

            Standard Deviation =
            ${number(sd)}<br><br>

            CV =
            ${number(sd)}
            ÷
            ${number(Math.abs(mean))}
            × 100
            `,

            percent(cv)
        );

    }

},


"correlation": {

    title: "Correlation Coefficient",

    fields: [
        ["x", "X Values (comma separated)", "text"],
        ["y", "Y Values (comma separated)", "text"]
    ],

    formula:
        "r = Cov(X,Y) ÷ (σx × σy)",

    calculate(v) {

        const x =
            getArray(v.x);

        const y =
            getArray(v.y);

        if (
            !x.length ||
            !y.length ||
            x.length !== y.length
        ) {

            return errorMessage(
                "X and Y must contain the same number of valid values."
            );

        }

        const meanX =
            average(x);

        const meanY =
            average(y);

        let numerator = 0;
        let denominatorX = 0;
        let denominatorY = 0;

        for (
            let i = 0;
            i < x.length;
            i++
        ) {

            const dx =
                x[i] - meanX;

            const dy =
                y[i] - meanY;

            numerator +=
                dx * dy;

            denominatorX +=
                dx * dx;

            denominatorY +=
                dy * dy;

        }

        if (
            denominatorX === 0 ||
            denominatorY === 0
        ) {

            return errorMessage(
                "Correlation cannot be calculated when one variable has no variation."
            );

        }

        const r =
            numerator /
            Math.sqrt(
                denominatorX *
                denominatorY
            );

        return resultTemplate(

            "r = Σ[(x − x̄)(y − ȳ)] ÷ √[Σ(x − x̄)²Σ(y − ȳ)²]",

            `
            r =
            ${number(r, 4)}
            `,

            number(r, 4),

            interpretCorrelation(r)
        );

    }

},


"skewness": {

    title: "Skewness",

    fields: [
        ["data", "Data Values (comma separated)", "text"]
    ],

    formula:
        "Skewness = μ₃ ÷ σ³",

    calculate(v) {

        const values =
            getArray(v.data);

        if (!values.length) {

            return errorMessage(
                "Enter at least one valid number."
            );

        }

        const mean =
            average(values);

        const variance =
            average(
                values.map(
                    x =>
                        Math.pow(x - mean, 2)
                )
            );

        const sd =
            Math.sqrt(variance);

        if (sd === 0) {

            return errorMessage(
                "Skewness cannot be calculated when standard deviation is zero."
            );

        }

        const thirdMoment =
            average(
                values.map(
                    x =>
                        Math.pow(x - mean, 3)
                )
            );

        const skewness =
            thirdMoment /
            Math.pow(sd, 3);

        return resultTemplate(

            "Skewness = μ₃ ÷ σ³",

            `
            Mean =
            ${number(mean)}<br><br>

            Standard Deviation =
            ${number(sd)}<br><br>

            Third central moment =
            ${number(thirdMoment)}<br><br>

            Skewness =
            ${number(skewness)}
            `,

            number(skewness),

            interpretSkewness(skewness)
        );

    }

},


"kurtosis": {

    title: "Kurtosis",

    fields: [
        ["data", "Data Values (comma separated)", "text"]
    ],

    formula:
        "β₂ = μ₄ ÷ σ⁴",

    calculate(v) {

        const values =
            getArray(v.data);

        if (!values.length) {

            return errorMessage(
                "Enter at least one valid number."
            );

        }

        const mean =
            average(values);

        const variance =
            average(
                values.map(
                    x =>
                        Math.pow(x - mean, 2)
                )
            );

        if (variance === 0) {

            return errorMessage(
                "Kurtosis cannot be calculated when variance is zero."
            );

        }

        const fourthMoment =
            average(
                values.map(
                    x =>
                        Math.pow(x - mean, 4)
                )
            );

        const beta2 =
            fourthMoment /
            Math.pow(variance, 2);

        return resultTemplate(

            "β₂ = μ₄ ÷ σ⁴",

            `
            Fourth central moment =
            ${number(fourthMoment)}<br><br>

            Variance =
            ${number(variance)}<br><br>

            Kurtosis =
            ${number(beta2)}
            `,

            number(beta2),

            interpretKurtosis(beta2)
        );

    }

}

},        return resultTemplate(
            "GDP Deflator = Nominal GDP ÷ Real GDP × 100",
            `
            = ${money(nominal)}
              ÷ ${money(real)}
              × 100
            `,
            number(deflator)
        );

    }

},


"unemployment-rate": {

    title: "Unemployment Rate",

    fields: [
        ["unemployed", "Number of Unemployed", "number"],
        ["labour", "Labour Force", "number"]
    ],

    formula:
        "Unemployment Rate = Unemployed ÷ Labour Force × 100",

    calculate(v) {

        const unemployed =
            getNumber(v, "unemployed");

        const labour =
            getNumber(v, "labour");

        if (labour === 0) {
            return errorMessage(
                "Labour force cannot be zero."
            );
        }

        const rate =
            unemployed / labour * 100;

        return resultTemplate(
            "Unemployment Rate = Unemployed ÷ Labour Force × 100",
            `${number(unemployed)} ÷ ${number(labour)} × 100`,
            percent(rate)
        );

    }

},


"employment-rate": {

    title: "Employment Rate",

    fields: [
        ["employed", "Number Employed", "number"],
        ["labour", "Labour Force", "number"]
    ],

    formula:
        "Employment Rate = Employed ÷ Labour Force × 100",

    calculate(v) {

        const employed =
            getNumber(v, "employed");

        const labour =
            getNumber(v, "labour");

        if (labour === 0) {
            return errorMessage(
                "Labour force cannot be zero."
            );
        }

        const rate =
            employed / labour * 100;

        return resultTemplate(
            "Employment Rate = Employed ÷ Labour Force × 100",
            `${number(employed)} ÷ ${number(labour)} × 100`,
            percent(rate)
        );

    }

},


"national-income": {

    title: "National Income",

    fields: [
        ["consumption", "Consumption (₦)", "number"],
        ["investment", "Investment (₦)", "number"],
        ["government", "Government Expenditure (₦)", "number"],
        ["exports", "Exports (₦)", "number"],
        ["imports", "Imports (₦)", "number"]
    ],

    formula:
        "Y = C + I + G + (X − M)",

    calculate(v) {

        const C =
            getNumber(v, "consumption");

        const I =
            getNumber(v, "investment");

        const G =
            getNumber(v, "government");

        const X =
            getNumber(v, "exports");

        const M =
            getNumber(v, "imports");

        const Y =
            C + I + G + X - M;

        return resultTemplate(
            "Y = C + I + G + (X − M)",
            `
            = ${money(C)}
              + ${money(I)}
              + ${money(G)}
              + ${money(X)}
              − ${money(M)}
            `,
            money(Y)
        );

    }

},


"multiplier": {

    title: "Simple Keynesian Multiplier",

    fields: [
        ["mpc", "Marginal Propensity to Consume", "number"]
    ],

    formula:
        "Multiplier = 1 ÷ (1 − MPC)",

    calculate(v) {

        const mpc =
            getNumber(v, "mpc");

        if (
            mpc >= 1 ||
            mpc < 0
        ) {
            return errorMessage(
                "MPC must be between 0 and less than 1."
            );
        }

        const multiplier =
            1 / (1 - mpc);

        return resultTemplate(
            "Multiplier = 1 ÷ (1 − MPC)",
            `1 ÷ (1 − ${number(mpc)})`,
            number(multiplier)
        );

    }

},


"marginal-propensity-consume": {

    title: "Marginal Propensity to Consume",

    fields: [
        ["changeConsumption", "Change in Consumption (₦)", "number"],
        ["changeIncome", "Change in Income (₦)", "number"]
    ],

    formula:
        "MPC = ΔC ÷ ΔY",

    calculate(v) {

        const deltaC =
            getNumber(v, "changeConsumption");

        const deltaY =
            getNumber(v, "changeIncome");

        if (deltaY === 0) {
            return errorMessage(
                "Change in income cannot be zero."
            );
        }

        const mpc =
            deltaC / deltaY;

        return resultTemplate(
            "MPC = ΔC ÷ ΔY",
            `${number(deltaC)} ÷ ${number(deltaY)}`,
            number(mpc)
        );

    }

},


"marginal-propensity-save": {

    title: "Marginal Propensity to Save",

    fields: [
        ["changeSaving", "Change in Saving (₦)", "number"],
        ["changeIncome", "Change in Income (₦)", "number"]
    ],

    formula:
        "MPS = ΔS ÷ ΔY",

    calculate(v) {

        const deltaS =
            getNumber(v, "changeSaving");

        const deltaY =
            getNumber(v, "changeIncome");

        if (deltaY === 0) {
            return errorMessage(
                "Change in income cannot be zero."
            );
        }

        const mps =
            deltaS / deltaY;

        return resultTemplate(
            "MPS = ΔS ÷ ΔY",
            `${number(deltaS)} ÷ ${number(deltaY)}`,
            number(mps)
        );

    }

},


"balance-of-trade": {

    title: "Balance of Trade",

    fields: [
        ["exports", "Exports (₦)", "number"],
        ["imports", "Imports (₦)", "number"]
    ],

    formula:
        "BOT = Exports − Imports",

    calculate(v) {

        const exports =
            getNumber(v, "exports");

        const imports =
            getNumber(v, "imports");

        const balance =
            exports - imports;

        return resultTemplate(
            "BOT = Exports − Imports",
            `${money(exports)} − ${money(imports)}`,
            money(balance)
        );

    }

},


"exchange-rate": {

    title: "Currency Conversion",

    fields: [
        ["amount", "Amount", "number"],
        ["rate", "Exchange Rate", "number"]
    ],

    formula:
        "Converted Amount = Amount × Exchange Rate",

    calculate(v) {

        const amount =
            getNumber(v, "amount");

        const rate =
            getNumber(v, "rate");

        const converted =
            amount * rate;

        return resultTemplate(
            "Converted Amount = Amount × Exchange Rate",
            `${number(amount)} × ${number(rate)}`,
            number(converted)
        );

    }

}

},


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
            "VAT Calculator",

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
            "Future Value of an Annuity",

        "payment":
            "Loan Payment / Installment",

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

        "indices":
            "Indices / Exponents",

        "logarithm":
            "Logarithm",

        "simultaneous-equations":
            "Simultaneous Equations",

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
            "GDP Deflator",

        "unemployment-rate":
            "Unemployment Rate",

        "employment-rate":
            "Employment Rate",

        "national-income":
            "National Income",

        "multiplier":
            "Simple Keynesian Multiplier",

        "marginal-propensity-consume":
            "Marginal Propensity to Consume",

        "marginal-propensity-save":
            "Marginal Propensity to Save",

        "balance-of-trade":
            "Balance of Trade",

        "exchange-rate":
            "Currency Conversion"

    }

};/* =========================================================
   REDUCING-BALANCE DEPRECIATION
   UPDATED TWO-METHOD SYSTEM
========================================================= */

calculators.accounting["reducing-balance"] = {

    title: "Reducing-Balance Depreciation",

    fields: [],

    calculate(v) {

        const method = v.method;


        /* =================================================
           METHOD 1:
           CALCULATE DEPRECIATION RATE
        ================================================= */

        if (method === "rate") {

            const cost = Number(v.cost);
            const residual = Number(v.residual);
            const usefulLife = Number(v.usefulLife);


            if (
                !Number.isFinite(cost) ||
                !Number.isFinite(residual) ||
                !Number.isFinite(usefulLife)
            ) {

                return errorMessage(
                    "Please enter valid numbers for all fields."
                );

            }


            if (cost <= 0) {

                return errorMessage(
                    "Cost of asset must be greater than zero."
                );

            }


            if (residual < 0) {

                return errorMessage(
                    "Residual value cannot be negative."
                );

            }


            if (residual >= cost) {

                return errorMessage(
                    "Residual value must be less than the cost of the asset."
                );

            }


            if (usefulLife <= 0) {

                return errorMessage(
                    "Useful life must be greater than zero."
                );

            }


            /*
                S = C(1-r)^n

                r = 1 - (S/C)^(1/n)
            */

            const rate =
                1 -
                Math.pow(
                    residual / cost,
                    1 / usefulLife
                );


            const percentageRate =
                rate * 100;


            return resultTemplate(

                "S = C(1 − r)ⁿ<br><br>" +
                "Rearranged:<br>" +
                "r = 1 − (S/C)^(1/n)",

                `
                <strong>Step 1: Identify the values</strong><br><br>

                Cost of Asset (C) =
                ${money(cost)}<br>

                Residual Value (S) =
                ${money(residual)}<br>

                Useful Life (n) =
                ${number(usefulLife)} years

                <br><br>

                <strong>Step 2: Substitute into the formula</strong><br><br>

                r = 1 −
                (${money(residual)} ÷ ${money(cost)})^(1/${number(usefulLife)})

                <br><br>

                <strong>Step 3: Calculate the rate</strong><br><br>

                r =
                ${number(rate, 6)}

                <br><br>

                Depreciation Rate =
                ${percent(percentageRate)}
                `,

                percent(percentageRate)

            );

        }



        /* =================================================
           METHOD 2:
           CALCULATE DEPRECIATION
        ================================================= */

        if (method === "depreciation") {

            const cost = Number(v.cost);
            const rate = Number(v.rate);
            const openingAccumulated =
                v.openingAccumulated === ""
                    ? 0
                    : Number(v.openingAccumulated);


            const start =
                rbParseDate(v.startDate);

            const end =
                rbParseDate(v.endDate);


            if (
                !Number.isFinite(cost) ||
                !Number.isFinite(rate) ||
                !Number.isFinite(openingAccumulated)
            ) {

                return errorMessage(
                    "Please enter valid numerical values."
                );

            }


            if (cost <= 0) {

                return errorMessage(
                    "Cost of asset must be greater than zero."
                );

            }


            if (rate < 0 || rate > 100) {

                return errorMessage(
                    "Depreciation rate must be between 0% and 100%."
                );

            }


            if (
                openingAccumulated < 0 ||
                openingAccumulated > cost
            ) {

                return errorMessage(
                    "Opening accumulated depreciation must be between ₦0 and the asset cost."
                );

            }


            if (!start || !end) {

                return errorMessage(
                    "Please enter both the start date and end date."
                );

            }


            if (end <= start) {

                return errorMessage(
                    "End date must be after the start date."
                );

            }


            const openingCarrying =
                cost - openingAccumulated;


            let currentOpening =
                openingCarrying;

            let accumulated =
                openingAccumulated;

            let periodStart =
                new Date(start);


            const rows = [];


            while (periodStart < end) {

                let anniversary =
                    rbAddOneYear(periodStart);


                let periodEnd =
                    anniversary < end
                        ? anniversary
                        : end;


                const days =
                    rbDaysBetween(
                        periodStart,
                        periodEnd
                    );


                const timeFraction =
                    days / 365;


                let depreciation =
                    currentOpening *
                    (rate / 100) *
                    timeFraction;


                /*
                   Depreciation cannot exceed
                   the carrying amount.
                */

                if (depreciation > currentOpening) {

                    depreciation =
                        currentOpening;

                }


                const closing =
                    currentOpening -
                    depreciation;


                accumulated +=
                    depreciation;


                const periodDescription =
                    rbFormatPeriod(
                        periodStart,
                        periodEnd
                    );


                rows.push({

                    period:
                        periodDescription,

                    days:
                        days,

                    opening:
                        currentOpening,

                    depreciation:
                        depreciation,

                    accumulated:
                        accumulated,

                    closing:
                        closing

                });


                currentOpening =
                    closing;


                periodStart =
                    new Date(periodEnd);

            }


            const totalDays =
                rbDaysBetween(
                    start,
                    end
                );


            const totalPeriod =
                rbFormatPeriod(
                    start,
                    end
                );


            let tableRows = "";


            rows.forEach(
                (row, index) => {

                    tableRows += `

                        <tr>

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                ${row.period}
                            </td>

                            <td>
                                ${row.days}
                            </td>

                            <td>
                                ${money(row.opening)}
                            </td>

                            <td>
                                ${money(row.depreciation)}
                            </td>

                            <td>
                                ${money(row.accumulated)}
                            </td>

                            <td>
                                ${money(row.closing)}
                            </td>

                        </tr>

                    `;

                }
            );


            const schedule = `

                <div style="
                    overflow-x:auto;
                    margin-top:20px;
                ">

                    <table style="
                        width:100%;
                        border-collapse:collapse;
                        font-size:14px;
                    ">

                        <thead>

                            <tr>

                                <th style="
                                    border:1px solid #ccc;
                                    padding:8px;
                                ">
                                    Year
                                </th>

                                <th style="
                                    border:1px solid #ccc;
                                    padding:8px;
                                ">
                                    Period
                                </th>

                                <th style="
                                    border:1px solid #ccc;
                                    padding:8px;
                                ">
                                    Days
                                </th>

                                <th style="
                                    border:1px solid #ccc;
                                    padding:8px;
                                ">
                                    Opening Carrying Amount
                                </th>

                                <th style="
                                    border:1px solid #ccc;
                                    padding:8px;
                                ">
                                    Depreciation
                                </th>

                                <th style="
                                    border:1px solid #ccc;
                                    padding:8px;
                                ">
                                    Accumulated Depreciation
                                </th>

                                <th style="
                                    border:1px solid #ccc;
                                    padding:8px;
                                ">
                                    Closing Carrying Amount
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            ${tableRows}

                        </tbody>

                    </table>

                </div>

            `;


            const finalDepreciation =
                rows.length
                    ? rows[rows.length - 1].closing
                    : openingCarrying;


            return resultTemplate(

                `
                Depreciation =
                Opening Carrying Amount ×
                Depreciation Rate ×
                Time

                <br><br>

                Closing Carrying Amount =
                Opening Carrying Amount −
                Depreciation

                <br><br>

                Partial period:
                Actual Days ÷ 365
                `,

                `

                <strong>Asset Cost:</strong>
                ${money(cost)}

                <br>

                <strong>Opening Accumulated Depreciation:</strong>
                ${money(openingAccumulated)}

                <br>

                <strong>Opening Carrying Amount:</strong>
                ${money(openingCarrying)}

                <br>

                <strong>Depreciation Rate:</strong>
                ${percent(rate)}

                <br>

                <strong>Total Period:</strong>
                ${totalPeriod}

                <br>

                <strong>Total Days:</strong>
                ${number(totalDays, 0)}

                <br><br>

                <strong>Depreciation Schedule</strong>

                ${schedule}

                `,

                `

                Final Carrying Amount:
                ${money(finalDepreciation)}

                <br><br>

                Total Accumulated Depreciation:
                ${money(accumulated)}

                `

            );

        }


        return errorMessage(
            "Please select a valid reducing-balance calculation method."
        );

    }

};



/* =========================================================
   REDUCING-BALANCE DATE HELPERS
========================================================= */

function rbParseDate(value) {

    if (!value) {
        return null;
    }


    const parts =
        value.split("-").map(Number);


    if (parts.length !== 3) {
        return null;
    }


    const year = parts[0];
    const month = parts[1] - 1;
    const day = parts[2];


    const date =
        new Date(
            year,
            month,
            day
        );


    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month ||
        date.getDate() !== day
    ) {

        return null;

    }


    return date;

}


function rbDaysBetween(start, end) {

    const milliseconds =
        end.getTime() -
        start.getTime();


    return Math.round(
        milliseconds /
        (1000 * 60 * 60 * 24)
    );

}


function rbAddOneYear(date) {

    const result =
        new Date(date);


    const originalMonth =
        result.getMonth();


    result.setFullYear(
        result.getFullYear() + 1
    );


    /*
       Handles February 29
       when moving to a non-leap year.
    */

    if (
        result.getMonth() !== originalMonth
    ) {

        result.setDate(0);

    }


    return result;

}


function rbFormatPeriod(start, end) {

    let years =
        end.getFullYear() -
        start.getFullYear();


    let months =
        end.getMonth() -
        start.getMonth();


    let days =
        end.getDate() -
        start.getDate();


    if (days < 0) {

        months--;

        const previousMonth =
            new Date(
                end.getFullYear(),
                end.getMonth(),
                0
            );


        days +=
            previousMonth.getDate();

    }


    if (months < 0) {

        years--;

        months += 12;

    }


    const parts = [];


    if (years === 1) {

        parts.push("1 year");

    } else if (years > 1) {

        parts.push(
            `${years} years`
        );

    }


    if (months === 1) {

        parts.push("1 month");

    } else if (months > 1) {

        parts.push(
            `${months} months`
        );

    }


    if (days === 1) {

        parts.push("1 day");

    } else if (days > 1) {

        parts.push(
            `${days} days`
        );

    }


    return parts.length
        ? parts.join(" ")
        : "0 days";

}



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


            option.value =
                value;

            option.textContent =
                text;


            calculatorSelect.appendChild(
                option
            );

        }
    );


    showCalculator(
        calculatorSelect.value
    );

}



/* =========================================================
   CREATE INPUT FIELD
========================================================= */

function createCalculatorInput(
    container,
    name,
    label,
    type = "number"
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
        type;


    input.id =
        name;


    input.name =
        name;


    input.placeholder =
        label;


    if (type === "number") {

        input.step =
            "any";

    }


    group.appendChild(
        input
    );


    container.appendChild(
        group
    );

}



/* =========================================================
   SHOW REDUCING-BALANCE FIELDS
========================================================= */

function showReducingBalanceFields(
    method,
    container
) {

    container.innerHTML = "";


    if (method === "rate") {

        createCalculatorInput(
            container,
            "cost",
            "Cost of Asset (₦)"
        );


        createCalculatorInput(
            container,
            "residual",
            "Scrap / Residual Value (₦)"
        );


        createCalculatorInput(
            container,
            "usefulLife",
            "Useful Life (Years)"
        );


        const formula =
            document.createElement("div");


        formula.style.marginTop =
            "15px";


        formula.innerHTML = `

            <strong>Formula:</strong>

            <br><br>

            S = C(1 − r)ⁿ

            <br><br>

            Therefore:

            <br>

            r = 1 − (S/C)^(1/n)

        `;


        container.appendChild(
            formula
        );

    }



    if (method === "depreciation") {

        createCalculatorInput(
            container,
            "cost",
            "Cost of Asset (₦)"
        );


        createCalculatorInput(
            container,
            "rate",
            "Depreciation Rate (%)"
        );


        createCalculatorInput(
            container,
            "startDate",
            "Start Date",
            "date"
        );


        createCalculatorInput(
            container,
            "endDate",
            "End Date",
            "date"
        );


        createCalculatorInput(
            container,
            "openingAccumulated",
            "Opening Accumulated Depreciation (₦) — Optional"
        );


        const formula =
            document.createElement("div");


        formula.style.marginTop =
            "15px";


        formula.innerHTML = `

            <strong>Formula:</strong>

            <br><br>

            Depreciation =
            Opening Carrying Amount ×
            Rate × Time

            <br><br>

            Closing Carrying Amount =
            Opening Carrying Amount −
            Depreciation

            <br><br>

            Partial Period =
            Actual Days ÷ 365

        `;


        container.appendChild(
            formula
        );

    }

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

        calculatorTitle.innerHTML =
            "<h2>Calculator unavailable</h2>";


        calculatorForm.innerHTML =
            "";


        return;

    }


    calculatorTitle.innerHTML =
        `<h2>${calculator.title}</h2>`;


    calculatorForm.innerHTML =
        "";


    /*
       Special interface for
       Reducing-Balance.
    */

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


        methodLabel.htmlFor =
            "reducingBalanceMethod";


        methodLabel.textContent =
            "Calculation Method";


        methodGroup.appendChild(
            methodLabel
        );


        const methodSelect =
            document.createElement("select");


        methodSelect.id =
            "reducingBalanceMethod";


        methodSelect.innerHTML = `

            <option value="rate">
                Calculate Depreciation Rate
            </option>

            <option value="depreciation">
                Calculate Depreciation
            </option>

        `;


        methodGroup.appendChild(
            methodSelect
        );


        calculatorForm.appendChild(
            methodGroup
        );


        const dynamicContainer =
            document.createElement("div");


        dynamicContainer.id =
            "reducingBalanceDynamicFields";


        calculatorForm.appendChild(
            dynamicContainer
        );


        showReducingBalanceFields(
            methodSelect.value,
            dynamicContainer
        );


        methodSelect.addEventListener(
            "change",
            function () {

                showReducingBalanceFields(
                    methodSelect.value,
                    dynamicContainer
                );


                result.innerHTML = `

                    <h3>Result</h3>

                    <p>
                        Enter your values and click
                        <strong>Calculate</strong>.
                    </p>

                `;

            }
        );


        result.innerHTML = `

            <h3>Result</h3>

            <p>
                Select a method, enter your values,
                and click <strong>Calculate</strong>.
            </p>

        `;


        return;

    }



    /*
       Normal calculators.
    */

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


            if (
                inputType === "select"
            ) {

                const select =
                    document.createElement("select");


                select.id =
                    name;


                select.name =
                    name;


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


                group.appendChild(
                    select
                );


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


                if (
                    inputType === "number"
                ) {

                    input.step =
                        "any";

                }


                group.appendChild(
                    input
                );

            }


            calculatorForm.appendChild(
                group
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


    /*
       Special handling for
       Reducing-Balance.
    */

    if (
        category === "accounting" &&
        type === "reducing-balance"
    ) {

        const methodElement =
            document.getElementById(
                "reducingBalanceMethod"
            );


        values.method =
            methodElement
                ? methodElement.value
                : "";


        const reducingFields = [

            "cost",
            "residual",
            "usefulLife",
            "rate",
            "startDate",
            "endDate",
            "openingAccumulated"

        ];


        reducingFields.forEach(
            name => {

                const element =
                    document.getElementById(name);


                if (element) {

                    values[name] =
                        element.value;

                }

            }
        );

    }



    /*
       Normal calculators.
    */

    else {

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
