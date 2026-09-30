// ========================================
// DARK MODE
// ========================================

const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        themeToggle.textContent = "☀️ Light Mode";
    } else {
        themeToggle.textContent = "🌙 Dark Mode";
    }

});


// ========================================
// CALCULATOR SYSTEM
// ========================================

const calculatorType = document.getElementById("calculatorType");
const calculatorForm = document.getElementById("calculatorForm");
const result = document.getElementById("result");
const formula = document.getElementById("formula");


// ========================================
// CALCULATOR DEFINITIONS
// ========================================

const calculators = {

    // ====================================
    // SIMPLE INTEREST
    // ====================================

    "simple-interest": {

        title: "Simple Interest",

        fields: [
            ["principal", "Principal (₦)", "number"],
            ["rate", "Interest Rate (%)", "number"],
            ["time", "Time (Years)", "number"]
        ],

        formula: "I = (P × R × T) / 100",

        calculate: function (v) {

            const interest =
                (v.principal * v.rate * v.time) / 100;

            const amount =
                v.principal + interest;

            return `
                <p><strong>Interest:</strong>
                ₦${interest.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>

                <p><strong>Total Amount:</strong>
                ₦${amount.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>
            `;
        }
    },


    // ====================================
    // COMPOUND INTEREST
    // ====================================

    "compound-interest": {

        title: "Compound Interest",

        fields: [
            ["principal", "Principal (₦)", "number"],
            ["rate", "Interest Rate (%)", "number"],
            ["time", "Time (Years)", "number"]
        ],

        formula: "A = P(1 + R/n)^(nt)",

        calculate: function (v) {

            const method =
                document.getElementById("compoundingMethod").value;

            let amount;
            let formulaUsed;
            let methodName;


            // ANNUALLY
            if (method === "annually") {

                amount =
                    v.principal *
                    Math.pow(
                        1 + v.rate / 100,
                        v.time
                    );

                formulaUsed =
                    "A = P(1 + R)^T";

                methodName = "Annually";
            }


            // SEMI-ANNUALLY
            else if (method === "semi-annually") {

                const n = 2;

                amount =
                    v.principal *
                    Math.pow(
                        1 + (v.rate / 100) / n,
                        n * v.time
                    );

                formulaUsed =
                    "A = P(1 + R/n)^(nt), n = 2";

                methodName = "Semi-Annually";
            }


            // QUARTERLY
            else if (method === "quarterly") {

                const n = 4;

                amount =
                    v.principal *
                    Math.pow(
                        1 + (v.rate / 100) / n,
                        n * v.time
                    );

                formulaUsed =
                    "A = P(1 + R/n)^(nt), n = 4";

                methodName = "Quarterly";
            }


            // MONTHLY
            else if (method === "monthly") {

                const n = 12;

                amount =
                    v.principal *
                    Math.pow(
                        1 + (v.rate / 100) / n,
                        n * v.time
                    );

                formulaUsed =
                    "A = P(1 + R/n)^(nt), n = 12";

                methodName = "Monthly";
            }


            // DAILY
            else if (method === "daily") {

                const n = 365;

                amount =
                    v.principal *
                    Math.pow(
                        1 + (v.rate / 100) / n,
                        n * v.time
                    );

                formulaUsed =
                    "A = P(1 + R/n)^(nt), n = 365";

                methodName = "Daily";
            }


            // CONTINUOUS / EXPONENTIAL
            else if (method === "continuous") {

                const r =
                    v.rate / 100;

                amount =
                    v.principal *
                    Math.exp(r * v.time);

                formulaUsed =
                    "A = Pe^(rt)";

                methodName =
                    "Continuously (Exponential)";
            }


            const interest =
                amount - v.principal;


            return `
                <p><strong>Compounding Method:</strong>
                ${methodName}</p>

                <p><strong>Formula:</strong>
                ${formulaUsed}</p>

                <p><strong>Compound Interest:</strong>
                ₦${interest.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>

                <p><strong>Total Amount:</strong>
                ₦${amount.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>
            `;
        }
    },


    // ====================================
    // PRESENT VALUE
    // ====================================

    "present-value": {

        title: "Present Value",

        fields: [
            ["futureValue", "Future Value (₦)", "number"],
            ["rate", "Interest Rate (%)", "number"],
            ["time", "Time (Years)", "number"]
        ],

        formula: "PV = FV / (1 + R)^T",

        calculate: function (v) {

            const pv =
                v.futureValue /
                Math.pow(
                    1 + v.rate / 100,
                    v.time
                );

            return `
                <p><strong>Present Value:</strong>
                ₦${pv.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>
            `;
        }
    },


    // ====================================
    // FUTURE VALUE
    // ====================================

    "future-value": {

        title: "Future Value",

        fields: [
            ["presentValue", "Present Value (₦)", "number"],
            ["rate", "Interest Rate (%)", "number"],
            ["time", "Time (Years)", "number"]
        ],

        formula: "FV = PV(1 + R)^T",

        calculate: function (v) {

            const fv =
                v.presentValue *
                Math.pow(
                    1 + v.rate / 100,
                    v.time
                );

            return `
                <p><strong>Future Value:</strong>
                ₦${fv.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>
            `;
        }
    },


    // ====================================
    // LOAN AMORTIZATION
    // ====================================

    "loan-amortization": {

        title: "Loan Amortization",

        fields: [
            ["loan", "Loan Amount (₦)", "number"],
            ["rate", "Annual Interest Rate (%)", "number"],
            ["years", "Loan Period (Years)", "number"]
        ],

        formula:
            "M = P × [r(1+r)^n] / [(1+r)^n − 1]",

        calculate: function (v) {

            const monthlyRate =
                (v.rate / 100) / 12;

            const months =
                v.years * 12;

            let payment;


            if (monthlyRate === 0) {

                payment =
                    v.loan / months;

            } else {

                payment =
                    v.loan *
                    (
                        monthlyRate *
                        Math.pow(
                            1 + monthlyRate,
                            months
                        )
                    ) /
                    (
                        Math.pow(
                            1 + monthlyRate,
                            months
                        ) - 1
                    );
            }


            const totalPayment =
                payment * months;

            const totalInterest =
                totalPayment - v.loan;


            return `
                <p><strong>Monthly Payment:</strong>
                ₦${payment.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>

                <p><strong>Total Payment:</strong>
                ₦${totalPayment.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>

                <p><strong>Total Interest:</strong>
                ₦${totalInterest.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>
            `;
        }
    },


    // ====================================
    // SINKING FUND
    // ====================================

    "sinking-fund": {

        title: "Sinking Fund",

        fields: [
            ["futureValue", "Target Amount (₦)", "number"],
            ["rate", "Annual Interest Rate (%)", "number"],
            ["years", "Time (Years)", "number"]
        ],

        formula:
            "PMT = FV × r / [(1+r)^n − 1]",

        calculate: function (v) {

            const monthlyRate =
                (v.rate / 100) / 12;

            const months =
                v.years * 12;

            let payment;


            if (monthlyRate === 0) {

                payment =
                    v.futureValue / months;

            } else {

                payment =
                    v.futureValue *
                    monthlyRate /
                    (
                        Math.pow(
                            1 + monthlyRate,
                            months
                        ) - 1
                    );
            }


            return `
                <p><strong>Monthly Sinking Fund Deposit:</strong>
                ₦${payment.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>
            `;
        }
    },


    // ====================================
    // ANNUITY
    // ====================================

    "annuity": {

        title: "Annuity Future Value",

        fields: [
            ["payment", "Periodic Payment (₦)", "number"],
            ["rate", "Annual Interest Rate (%)", "number"],
            ["years", "Time (Years)", "number"]
        ],

        formula:
            "FV = PMT × [((1+r)^n − 1) / r]",

        calculate: function (v) {

            const monthlyRate =
                (v.rate / 100) / 12;

            const months =
                v.years * 12;

            let futureValue;


            if (monthlyRate === 0) {

                futureValue =
                    v.payment * months;

            } else {

                futureValue =
                    v.payment *
                    (
                        Math.pow(
                            1 + monthlyRate,
                            months
                        ) - 1
                    ) /
                    monthlyRate;
            }


            return `
                <p><strong>Future Value of Annuity:</strong>
                ₦${futureValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>
            `;
        }
    },


    // ====================================
    // PAYMENT / INSTALLMENT
    // ====================================

    "payment": {

        title: "Payment / Installment",

        fields: [
            ["loan", "Loan Amount (₦)", "number"],
            ["rate", "Annual Interest Rate (%)", "number"],
            ["years", "Payment Period (Years)", "number"]
        ],

        formula:
            "Payment = P × [r(1+r)^n] / [(1+r)^n − 1]",

        calculate: function (v) {

            const monthlyRate =
                (v.rate / 100) / 12;

            const months =
                v.years * 12;

            let payment;


            if (monthlyRate === 0) {

                payment =
                    v.loan / months;

            } else {

                payment =
                    v.loan *
                    monthlyRate *
                    Math.pow(
                        1 + monthlyRate,
                        months
                    ) /
                    (
                        Math.pow(
                            1 + monthlyRate,
                            months
                        ) - 1
                    );
            }


            return `
                <p><strong>Monthly Installment:</strong>
                ₦${payment.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>
            `;
        }
    },


    // ====================================
    // STRAIGHT-LINE DEPRECIATION
    // ====================================

    "straight-line-depreciation": {

        title: "Straight-Line Depreciation",

        fields: [
            ["cost", "Asset Cost (₦)", "number"],
            ["residual", "Residual Value (₦)", "number"],
            ["life", "Useful Life (Years)", "number"]
        ],

        formula:
            "Annual Depreciation = (Cost − Residual Value) / Useful Life",

        calculate: function (v) {

            const annual =
                (v.cost - v.residual) /
                v.life;

            const monthly =
                annual / 12;


            return `
                <p><strong>Annual Depreciation:</strong>
                ₦${annual.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>

                <p><strong>Monthly Depreciation:</strong>
                ₦${monthly.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>
            `;
        }
    },


    // ====================================
    // REDUCING-BALANCE DEPRECIATION
    // ====================================

    "reducing-balance": {

        title: "Reducing-Balance Depreciation",

        fields: [
            ["cost", "Asset Cost (₦)", "number"],
            ["rate", "Depreciation Rate (%)", "number"],
            ["years", "Number of Years", "number"]
        ],

        formula:
            "Depreciation = Opening Book Value × Depreciation Rate",

        calculate: function (v) {

            let bookValue =
                v.cost;


            for (
                let year = 1;
                year <= v.years;
                year++
            ) {

                bookValue =
                    bookValue *
                    (1 - v.rate / 100);
            }


            return `
                <p><strong>Book Value After ${v.years} Year(s):</strong>
                ₦${bookValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>
            `;
        }
    },


    // ====================================
    // BOOK VALUE
    // ====================================

    "book-value": {

        title: "Book Value",

        fields: [
            ["cost", "Asset Cost (₦)", "number"],
            ["accumulated", "Accumulated Depreciation (₦)", "number"]
        ],

        formula:
            "Book Value = Cost − Accumulated Depreciation",

        calculate: function (v) {

            const bookValue =
                v.cost - v.accumulated;


            return `
                <p><strong>Book Value:</strong>
                ₦${bookValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>
            `;
        }
    },


    // ====================================
    // GROSS PROFIT
    // ====================================

    "gross-profit": {

        title: "Gross Profit",

        fields: [
            ["sales", "Sales Revenue (₦)", "number"],
            ["cogs", "Cost of Goods Sold (₦)", "number"]
        ],

        formula:
            "Gross Profit = Sales − COGS",

        calculate: function (v) {

            const profit =
                v.sales - v.cogs;


            return `
                <p><strong>Gross Profit:</strong>
                ₦${profit.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>
            `;
        }
    },


    // ====================================
    // GROSS PROFIT MARGIN
    // ====================================

    "gross-profit-margin": {

        title: "Gross Profit Margin",

        fields: [
            ["grossProfit", "Gross Profit (₦)", "number"],
            ["sales", "Sales Revenue (₦)", "number"]
        ],

        formula:
            "Gross Profit Margin = (Gross Profit / Sales) × 100",

        calculate: function (v) {

            const margin =
                (v.grossProfit / v.sales) * 100;


            return `
                <p><strong>Gross Profit Margin:</strong>
                ${margin.toFixed(2)}%</p>
            `;
        }
    },


    // ====================================
    // NET PROFIT
    // ====================================

    "net-profit": {

        title: "Net Profit",

        fields: [
            ["grossProfit", "Gross Profit (₦)", "number"],
            ["expenses", "Operating Expenses (₦)", "number"]
        ],

        formula:
            "Net Profit = Gross Profit − Expenses",

        calculate: function (v) {

            const profit =
                v.grossProfit - v.expenses;


            return `
                <p><strong>Net Profit:</strong>
                ₦${profit.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>
            `;
        }
    },


    // ====================================
    // NET PROFIT MARGIN
    // ====================================

    "net-profit-margin": {

        title: "Net Profit Margin",

        fields: [
            ["netProfit", "Net Profit (₦)", "number"],
            ["sales", "Sales Revenue (₦)", "number"]
        ],

        formula:
            "Net Profit Margin = (Net Profit / Sales) × 100",

        calculate: function (v) {

            const margin =
                (v.netProfit / v.sales) * 100;


            return `
                <p><strong>Net Profit Margin:</strong>
                ${margin.toFixed(2)}%</p>
            `;
        }
    },


    // ====================================
    // MARKUP
    // ====================================

    "markup": {

        title: "Markup",

        fields: [
            ["cost", "Cost (₦)", "number"],
            ["sellingPrice", "Selling Price (₦)", "number"]
        ],

        formula:
            "Markup = ((Selling Price − Cost) / Cost) × 100",

        calculate: function (v) {

            const markup =
                (
                    (v.sellingPrice - v.cost) /
                    v.cost
                ) * 100;


            return `
                <p><strong>Markup:</strong>
                ${markup.toFixed(2)}%</p>
            `;
        }
    },


    // ====================================
    // BREAK-EVEN POINT
    // ====================================

    "break-even": {

        title: "Break-Even Point",

        fields: [
            ["fixedCosts", "Fixed Costs (₦)", "number"],
            ["sellingPrice", "Selling Price Per Unit (₦)", "number"],
            ["variableCost", "Variable Cost Per Unit (₦)", "number"]
        ],

        formula:
            "Break-Even Units = Fixed Costs / (Selling Price − Variable Cost)",

        calculate: function (v) {

            const units =
                v.fixedCosts /
                (
                    v.sellingPrice -
                    v.variableCost
                );


            return `
                <p><strong>Break-Even Point:</strong>
                ${units.toFixed(2)} units</p>
            `;
        }
    },


    // ====================================
    // VAT
    // ====================================

    "vat": {

        title: "VAT",

        fields: [
            ["amount", "Amount Before VAT (₦)", "number"],
            ["rate", "VAT Rate (%)", "number"]
        ],

        formula:
            "VAT = Amount × VAT Rate",

        calculate: function (v) {

            const vat =
                v.amount *
                (v.rate / 100);

            const total =
                v.amount + vat;


            return `
                <p><strong>VAT:</strong>
                ₦${vat.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>

                <p><strong>Total Including VAT:</strong>
                ₦${total.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>
            `;
        }
    },


    // ====================================
    // BAD DEBT
    // ====================================

    "bad-debt": {

        title: "Bad Debt",

        fields: [
            ["receivable", "Customer Receivable (₦)", "number"],
            ["badDebt", "Amount Written Off (₦)", "number"]
        ],

        formula:
            "Remaining Receivable = Receivable − Bad Debt",

        calculate: function (v) {

            const remaining =
                v.receivable -
                v.badDebt;


            return `
                <p><strong>Bad Debt Expense:</strong>
                ₦${v.badDebt.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>

                <p><strong>Remaining Receivable:</strong>
                ₦${remaining.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>
            `;
        }
    },


    // ====================================
    // COGS
    // ====================================

    "cogs": {

        title: "Cost of Goods Sold",

        fields: [
            ["openingInventory", "Opening Inventory (₦)", "number"],
            ["purchases", "Purchases (₦)", "number"],
            ["closingInventory", "Closing Inventory (₦)", "number"]
        ],

        formula:
            "COGS = Opening Inventory + Purchases − Closing Inventory",

        calculate: function (v) {

            const cogs =
                v.openingInventory +
                v.purchases -
                v.closingInventory;


            return `
                <p><strong>COGS:</strong>
                ₦${cogs.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                })}</p>
            `;
        }
    }

};


// ========================================
// DISPLAY SELECTED CALCULATOR
// ========================================

function showCalculator(type) {

    const calculator =
        calculators[type];


    calculatorForm.innerHTML = `

        <h2>${calculator.title}</h2>


        ${calculator.fields.map(function(field) {

            return `
                <label for="${field[0]}">
                    ${field[1]}
                </label>

                <input
                    type="${field[2]}"
                    id="${field[0]}"
                    placeholder="Enter ${field[1]}"
                    min="0"
                    step="any"
                >
            `;

        }).join("")}


        ${type === "compound-interest" ? `

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

                <option value="monthly" selected>
                    Monthly
                </option>

                <option value="daily">
                    Daily
                </option>

                <option value="continuous">
                    Continuously (Exponential)
                </option>

            </select>

        ` : ""}


        <button id="calculateButton">
            Calculate
        </button>

    `;


    formula.innerHTML = `

        <h3>Formula Used</h3>

        <p>${calculator.formula}</p>

    `;


    result.innerHTML = `

        <h3>Result</h3>

        <p>
            Enter your values and click Calculate.
        </p>

    `;


    document
        .getElementById("calculateButton")
        .addEventListener("click", function() {

            const values = {};

            let hasEmptyValue = false;


            calculator.fields.forEach(function(field) {

                const input =
                    document.getElementById(field[0]);


                if (input.value === "") {

                    hasEmptyValue = true;

                }


                values[field[0]] =
                    Number(input.value);

            });


            if (hasEmptyValue) {

                result.innerHTML = `

                    <h3>Result</h3>

                    <p>
                        Please enter all required values.
                    </p>

                `;

                return;
            }


            result.innerHTML = `

                <h3>Result</h3>

                ${calculator.calculate(values)}

            `;

        });

}


// ========================================
// CHANGE CALCULATOR
// ========================================

calculatorType.addEventListener("change", function() {

    showCalculator(
        calculatorType.value
    );

});


// ========================================
// LOAD SIMPLE INTEREST FIRST
// ========================================

showCalculator("simple-interest");
