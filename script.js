/* =========================================================
   KHID MULTIPURPOSE CALCULATOR
   ACCOUNTING + FINANCE + MATHEMATICS
   STATISTICS + ECONOMICS
========================================================= */


/* =========================================================
   THEME TOGGLE
========================================================= */

const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {

    const savedTheme = localStorage.getItem("theme");

    /* Restore saved light mode */
    if (savedTheme === "light") {

        document.body.classList.add("light-mode");

    }


    /* Update the icon */
    function updateThemeIcon() {

        const isLight =
            document.body.classList.contains("light-mode");

        themeToggle.setAttribute(
            "aria-label",
            isLight
                ? "Switch to dark mode"
                : "Switch to light mode"
        );

    }


    /* Set correct icon when page loads */
    updateThemeIcon();


    /* Toggle theme */
    themeToggle.addEventListener("click", function () {

        document.body.classList.toggle("light-mode");

        const isLight =
            document.body.classList.contains("light-mode");


        if (isLight) {

            localStorage.setItem("theme", "light");

        } else {

            localStorage.setItem("theme", "dark");

        }


        updateThemeIcon();

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

    return Number(value).toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });

}

/* Compact formatting for ratios and mathematical answers:
   keep meaningful decimals, remove unnecessary trailing zeros. */
function compactNumber(value, maxDecimals = 4) {
    if (!Number.isFinite(value)) return "Undefined";
    const rounded = Number(value.toFixed(maxDecimals));
    return rounded.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: maxDecimals
    });
}

/* Mathematics results use whole numbers when possible, otherwise up to 4 decimals. */
function mathNumber(value) {
    return compactNumber(value, 4);
}

function cleanMathOutput(html) {
    return String(html).replace(/-?\\d[\\d,]*\\.\\d+/g, match => {
        const value = Number(match.replace(/,/g, ""));
        return Number.isFinite(value) ? mathNumber(value) : match;
    });
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

function formatLearningSteps(working) {
    const html = String(working ?? "").trim();
    if (!html) return "No working was supplied for this calculation.";

    // Keep detailed, manually authored workings and schedules exactly as they are.
    if (/<table\b/i.test(html) || /<strong>\s*Step\s*\d+/i.test(html) || /\bStep\s*\d+\s*[:\u2014\u2013-]/i.test(html) || /<strong>Formula:?<\/strong>/i.test(html) || /<strong>Substitute:?<\/strong>/i.test(html)) {
        return html;
    }

    let parts = html.split(/<br\s*\/?>\s*<br\s*\/?>/i).map(part => part.trim()).filter(Boolean);
    // Older calculators sometimes separate stages with a single line break only.
    if (parts.length === 1 && /<br\s*\/?>/i.test(parts[0])) {
        parts = parts[0].split(/<br\s*\/?>/i).map(part => part.trim()).filter(Boolean);
    }
    if (!parts.length) return html;

    // Number each meaningful working stage. This gives older calculators a consistent
    // learning structure without changing their calculations or answer values.
    return `<div class="learning-steps">${parts.map((part, index) =>
        `<div class="learning-step" style="margin:0 0 12px 0;"><strong>Step ${index + 1}:</strong> ${part}</div>`
    ).join("")}</div>`;
}

/* Convert stored LaTeX-like strings into readable browser-safe mathematical notation.
   This avoids raw commands such as \\frac or broken escape sequences appearing in results. */
function formatMathNotation(value) {
    let out = String(value ?? "");
    // Repair common mojibake/control characters if they entered a stored formula string.
    out = out.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
    out = out.replace(/\\\(/g, "").replace(/\\\)/g, "")
             .replace(/\\\[/g, "").replace(/\\\]/g, "");
    out = out.replace(/\\left/g, "").replace(/\\right/g, "")
             .replace(/\\quad/g, " ").replace(/\\qquad/g, " ")
             .replace(/\\,/g, " ").replace(/\\!/g, "");
    out = out.replace(/\\text\{([^{}]*)\}/g, "$1")
             .replace(/\\mathrm\{([^{}]*)\}/g, "$1");
    // Resolve nested square roots and fractions from the inside out. Fractions are displayed plainly.
    for (let i = 0; i < 10; i++) {
        const next = out.replace(/\\sqrt\{([^{}]*)\}/g, "\u221A($1)")
                        .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1) / ($2)");
        if (next === out) break;
        out = next;
    }
    out = out.replace(/\\sqrt\{([^{}]*)\}/g, "\u221A($1)")
             .replace(/\\bar\{([^{}]*)\}/g, "$1\u0304")
             .replace(/\\times/g, "\u00D7").replace(/\\cdot/g, "\u00B7")
             .replace(/\\pm/g, "\u00B1").replace(/\\Delta/g, "\u0394")
             .replace(/\\Sigma/g, "\u03A3").replace(/\\sum/g, "\u03A3")
             .replace(/\\pi/g, "\u03C0").replace(/\\theta/g, "\u03B8")
             .replace(/\\leq/g, "\u2264").replace(/\\geq/g, "\u2265")
             .replace(/\\neq/g, "\u2260").replace(/\\infty/g, "\u221E")
             .replace(/\\cdots/g, "\u2026")
             .replace(/\bsqrt\(/g, "\u221A(");
    // Use actual mathematical symbols instead of English spellings in formula labels.
    out = out.replace(/\bDelta(?=(?:TR|TP|Q|L)\b)/g, "\u0394")
             .replace(/\bDelta(TR|TP|Q|L)\b/g, "\u0394$1")
             .replace(/\bDelta\b/g, "\u0394");
    // Remove LaTeX grouping braces around powers/subscripts before formatting them.
    out = out.replace(/\^\{([^{}]*)\}/g, "^$1").replace(/_\{([^{}]*)\}/g, "_$1");
    // Convert common variable subscripts and powers to proper mathematical typography.
    out = out.replace(/<[^>]*>|([A-Za-z\u0391-\u03A9\u03B1-\u03C9]+)_([A-Za-z0-9]+)/g, (match, name, index) => match.startsWith("<") ? match : `${name}<sub>${index}</sub>`)
             .replace(/<[^>]*>|([A-Za-z\u0391-\u03A9\u03B1-\u03C90-9)])\^(\([^)]*\)|[+-]?[A-Za-z0-9]+)/g, (match, base, power) => match.startsWith("<") ? match : `${base}<sup>${power}</sup>`);
    out = out.replace(/\s\*\s/g, " \u00D7 ").replace(/\s\/\s/g, " \u00F7 ")
             .replace(/\bDeltaTR\b/g, "\u0394TR").replace(/\bDeltaQ\b/g, "\u0394Q")
             .replace(/\bDeltaTP\b/g, "\u0394TP").replace(/\bDeltaL\b/g, "\u0394L");
    return out;
}

function resultTemplate(
    formula,
    working,
    answer,
    interpretation = ""
) {
    const displayFormula = formatMathNotation(formula);
    const displayWorking = formatMathNotation(working);
    const displayAnswer = formatMathNotation(answer);
    const displayInterpretation = formatMathNotation(interpretation);
    const learningWorking = formatLearningSteps(displayWorking);
    return `
        <div class="formula-box">
            <strong>Formula / Method</strong>
            <p>${displayFormula}</p>
        </div>
        <div class="working-box">
            <strong>Step-by-Step Working</strong>
            <div>${learningWorking}</div>
        </div>
        <div class="interpretation-box">
            <strong>Final Answer</strong>
            <p>${displayAnswer}</p>
            ${displayInterpretation ? `<p><strong>Clarification:</strong><br>${displayInterpretation}</p>` : ""}

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
    if (!Number.isFinite(x)) return "Demand elasticity cannot be determined from the values entered.";
    if (x === 0) return "Perfectly inelastic demand";
    if (x > 1) return "Elastic demand";
    if (x < 1) return "Inelastic demand";
    return "Unit elastic demand";
}

function interpretPES(value) {
    const x = Math.abs(value);
    if (!Number.isFinite(x)) return "Supply elasticity cannot be determined from the values entered.";
    if (x === 0) return "Perfectly inelastic supply";
    if (x > 1) return "Elastic supply";
    if (x < 1) return "Inelastic supply";
    return "Unit elastic supply";
}

function interpretIncomeElasticity(value) {
    if (!Number.isFinite(value)) return "Income elasticity cannot be determined from the values entered.";
    if (value < 0) return "Inferior good";
    if (value === 0) return "Zero income elasticity";
    if (value > 1) return "Luxury good";
    if (value === 1) return "Unit income elastic";
    return "Normal necessity";
}

function interpretCrossElasticity(value) {
    if (!Number.isFinite(value)) return "Cross elasticity cannot be determined from the values entered.";
    if (value > 0) return "Substitute goods";
    if (value < 0) return "Complementary goods";
    return "Unrelated goods (zero cross elasticity)";
}

/* Result-specific explanations for PED, XED and YED. */
function elasticityExplanation(type, value) {
    const v = Number(value);
    if (type === "price-elasticity-demand") {
        const x = Math.abs(v);
        let classification, normal, simple;
        if (x === 0) {
            classification = "Perfectly Inelastic Demand";
            normal = "Quantity demanded does not change when price changes; the calculated elasticity is zero.";
            simple = "Even when the price changes, buyers purchase the same quantity. For example, they may still need the same amount of an essential medicine.";
        } else if (x > 1) {
            classification = "Elastic Demand";
            normal = "The percentage change in quantity demanded is greater than the percentage change in price.";
            simple = "Buyers respond strongly to price changes. A small price increase may cause them to reduce purchases by a larger percentage.";
        } else if (x < 1) {
            classification = "Inelastic Demand";
            normal = "The percentage change in quantity demanded is smaller than the percentage change in price.";
            simple = "Buyers do not change how much they buy very much when the price changes, often because the product is important or has few alternatives.";
        } else {
            classification = "Unit Elastic Demand";
            normal = "The percentage change in quantity demanded is equal in magnitude to the percentage change in price.";
            simple = "If price rises by 10%, quantity demanded falls by about 10%. The two percentage changes are equal in size.";
        }
        return { classification, normal, simple };
    }

    if (type === "cross-elasticity") {
        let classification, normal, simple;
        if (v > 0) {
            classification = "Substitute Goods";
            normal = "Cross elasticity is positive, meaning demand for Good X moves in the same direction as the price of Good Y.";
            simple = "The goods can replace each other. For example, if tea becomes more expensive, some people may buy more coffee instead.";
        } else if (v < 0) {
            classification = "Complementary Goods";
            normal = "Cross elasticity is negative, meaning demand for Good X moves in the opposite direction to the price of Good Y.";
            simple = "The goods are often used together. For example, if the price of printers rises and fewer printers are bought, demand for printer ink may also fall.";
        } else {
            classification = "Unrelated Goods";
            normal = "Cross elasticity is zero, indicating that a price change in Good Y produces no measured change in demand for Good X.";
            simple = "Changing the price of one product does not affect how much people buy of the other, such as two products with no meaningful connection.";
        }
        return { classification, normal, simple };
    }

    if (type === "income-elasticity") {
        let classification, normal, simple;
        if (v < 0) {
            classification = "Inferior Good";
            normal = "Income elasticity is negative, so demand falls as consumer income rises.";
            simple = "When people have more money, they may switch away from this cheaper option to a preferred alternative.";
        } else if (v === 0) {
            classification = "Zero Income Elasticity";
            normal = "The measured quantity demanded does not respond to the change in income.";
            simple = "Even when people's income changes, they buy about the same amount of this product.";
        } else if (v > 1) {
            classification = "Luxury Good";
            normal = "Income elasticity is greater than one, so demand changes by a larger percentage than income.";
            simple = "As people earn more, they increase purchases of this product by an even larger percentage, such as expensive holidays or luxury items.";
        } else if (v === 1) {
            classification = "Unit Income Elasticity";
            normal = "Demand changes by the same percentage as consumer income.";
            simple = "If income rises by 10%, demand rises by about 10%.";
        } else {
            classification = "Normal Necessity";
            normal = "Income elasticity is positive but less than one, so demand rises by a smaller percentage than income.";
            simple = "When people earn more, they buy somewhat more of the product, but not as sharply as their income increases.";
        }
        return { classification, normal, simple };
    }

    return { classification: "", normal: "", simple: "" };
}

/* =========================================================
   ADVANCED MATHEMATICS ENGINE
========================================================= */

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function clampInt(value, min, max) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < min || n > max) return null;
    return n;
}

function normalizeMathExpression(input) {
    let s = String(input || "").trim()
        .replace(/[-]/g, "-")
        .replace(/pi/g, "pi")
        .replace(/sqrt/g, "sqrt")
        .replace(/\s+/g, "");

    s = s.replace(/\bln\b/gi, "ln");
    s = s.replace(/\bsin\b/gi, "sin");
    s = s.replace(/\bcos\b/gi, "cos");
    s = s.replace(/\btan\b/gi, "tan");
    s = s.replace(/\bsqrt\b/gi, "sqrt");
    s = s.replace(/\bexp\b/gi, "exp");

    // Common implicit multiplication: 2x, 2(x+1), x(x+1), 2sin(x), etc.
    s = s.replace(/(\d|x|pi|\))(?=(x|pi|\(|sin|cos|tan|ln|sqrt|exp))/g, "$1*");
    s = s.replace(/(x|pi|\))(?=\d)/g, "$1*");
    return s;
}

function tokenizeMath(s) {
    const tokens = [];
    let i = 0;
    while (i < s.length) {
        const ch = s[i];
        if (/\d|\./.test(ch)) {
            let j = i + 1;
            while (j < s.length && /[\d.]/.test(s[j])) j++;
            if (s[j] === "e" || s[j] === "E") {
                j++;
                if (s[j] === "+" || s[j] === "-") j++;
                while (j < s.length && /\d/.test(s[j])) j++;
            }
            tokens.push({type:"number", value:s.slice(i,j)}); i=j; continue;
        }
        if (/[a-zA-Z]/.test(ch)) {
            let j=i+1;
            while (j<s.length && /[a-zA-Z]/.test(s[j])) j++;
            tokens.push({type:"name", value:s.slice(i,j)}); i=j; continue;
        }
        if ("+-*/^(),".includes(ch)) { tokens.push({type:ch,value:ch}); i++; continue; }
        throw new Error("Invalid character");
    }
    tokens.push({type:"EOF",value:""});
    return tokens;
}

function parseMathExpression(input) {
    const tokens = tokenizeMath(normalizeMathExpression(input));
    let pos=0;
    const peek=()=>tokens[pos];
    const eat=(type)=>{ if(peek().type!==type) throw new Error("Expected "+type); return tokens[pos++]; };

    function primary() {
        const t=peek();
        if(t.type==="number") { pos++; return {kind:"const",value:Number(t.value)}; }
        if(t.type==="name") {
            pos++;
            const name=t.value;
            if(name==="x") return {kind:"var"};
            if(name==="pi") return {kind:"const",value:Math.PI};
            if(name==="e") return {kind:"const",value:Math.E};
            if(["sin","cos","tan","ln","sqrt","exp"].includes(name)) {
                eat("("); const arg=expression(); eat(")"); return {kind:"func",name,arg};
            }
            throw new Error("Unknown name");
        }
        if(t.type==="(") { pos++; const n=expression(); eat(")"); return n; }
        if(t.type==="-") { pos++; return {kind:"neg",arg:primary()}; }
        if(t.type==="+") { pos++; return primary(); }
        throw new Error("Expected primary");
    }
    function power() {
        let left=primary();
        if(peek().type==="^") { pos++; const right=power(); left={kind:"pow",left,right}; }
        return left;
    }
    function term() {
        let left=power();
        while(peek().type==="*" || peek().type==="/") { const op=peek().type; pos++; const right=power(); left={kind:op,left,right}; }
        return left;
    }
    function expression() {
        let left=term();
        while(peek().type==="+" || peek().type==="-") { const op=peek().type; pos++; const right=term(); left={kind:op,left,right}; }
        return left;
    }
    const ast=expression();
    if(peek().type!=="EOF") throw new Error("Unexpected token");
    return ast;
}

function cloneAst(node) { return JSON.parse(JSON.stringify(node)); }
function isConst(node) { return node && node.kind === "const"; }
function constAst(v) { return {kind:"const",value:v}; }
function addAst(a,b) { return {kind:"+",left:a,right:b}; }
function mulAst(a,b) { return {kind:"*",left:a,right:b}; }

function derivativeAst(n) {
    switch(n.kind) {
        case "const": return constAst(0);
        case "var": return constAst(1);
        case "neg": return {kind:"neg",arg:derivativeAst(n.arg)};
        case "+": return addAst(derivativeAst(n.left),derivativeAst(n.right));
        case "-": return {kind:"-",left:derivativeAst(n.left),right:derivativeAst(n.right)};
        case "*": return {kind:"+",left:{kind:"*",left:derivativeAst(n.left),right:cloneAst(n.right)},right:{kind:"*",left:cloneAst(n.left),right:derivativeAst(n.right)}};
        case "/": return {kind:"/",left:{kind:"-",left:{kind:"*",left:derivativeAst(n.left),right:cloneAst(n.right)},right:{kind:"*",left:cloneAst(n.left),right:derivativeAst(n.right)}},right:{kind:"pow",left:cloneAst(n.right),right:constAst(2)}};
        case "pow":
            if(isConst(n.right)) return {kind:"*",left:{kind:"*",left:cloneAst(n.right),right:{kind:"pow",left:cloneAst(n.left),right:constAst(n.right.value-1)}},right:derivativeAst(n.left)};
            return {kind:"*",left:{kind:"pow",left:cloneAst(n.left),right:cloneAst(n.right)},right:{kind:"+",left:{kind:"*",left:derivativeAst(n.right),right:{kind:"func",name:"ln",arg:cloneAst(n.left)}},right:{kind:"/",left:{kind:"*",left:cloneAst(n.right),right:derivativeAst(n.left)},right:cloneAst(n.left)}}};
        case "func": {
            const d=derivativeAst(n.arg);
            if(n.name==="sin") return mulAst({kind:"func",name:"cos",arg:cloneAst(n.arg)},d);
            if(n.name==="cos") return mulAst({kind:"neg",arg:{kind:"func",name:"sin",arg:cloneAst(n.arg)}},d);
            if(n.name==="tan") return mulAst({kind:"/",left:constAst(1),right:{kind:"pow",left:{kind:"func",name:"cos",arg:cloneAst(n.arg)},right:constAst(2)}},d);
            if(n.name==="ln") return {kind:"/",left:d,right:cloneAst(n.arg)};
            if(n.name==="exp") return mulAst({kind:"func",name:"exp",arg:cloneAst(n.arg)},d);
            if(n.name==="sqrt") return {kind:"/",left:d,right:{kind:"*",left:constAst(2),right:{kind:"func",name:"sqrt",arg:cloneAst(n.arg)}}};
            throw new Error("Unsupported function");
        }
        default: throw new Error("Unsupported node");
    }
}

function integrateAst(n) {
    switch(n.kind) {
        case "const": return {kind:"*",left:constAst(n.value),right:{kind:"var"}};
        case "var": return {kind:"/",left:{kind:"pow",left:{kind:"var"},right:constAst(2)},right:constAst(2)};
        case "neg": return {kind:"neg",arg:integrateAst(n.arg)};
        case "+": return {kind:"+",left:integrateAst(n.left),right:integrateAst(n.right)};
        case "-": return {kind:"-",left:integrateAst(n.left),right:integrateAst(n.right)};
        case "*": {
            if(isConst(n.left)) return {kind:"*",left:cloneAst(n.left),right:integrateAst(n.right)};
            if(isConst(n.right)) return {kind:"*",left:cloneAst(n.right),right:integrateAst(n.left)};
            throw new Error("Only constant-coefficient products are directly integrated");
        }
        case "/": {
            if(isConst(n.right)) return {kind:"/",left:integrateAst(n.left),right:cloneAst(n.right)};
            if(n.right.kind==="var" && isConst(n.left)) return {kind:"*",left:cloneAst(n.left),right:{kind:"func",name:"ln",arg:{kind:"var"}}};
            throw new Error("Unsupported quotient");
        }
        case "pow": {
            if(n.left.kind!=="var" || !isConst(n.right)) throw new Error("Integration currently supports powers of x");
            const p=n.right.value;
            if(p===-1) return {kind:"func",name:"ln",arg:{kind:"var"}};
            return {kind:"/",left:{kind:"pow",left:{kind:"var"},right:constAst(p+1)},right:constAst(p+1)};
        }
        case "func":
            if(n.arg.kind!=="var") throw new Error("Integration of composed functions is not supported in this basic engine");
            if(n.name==="sin") return {kind:"neg",arg:{kind:"func",name:"cos",arg:{kind:"var"}}};
            if(n.name==="cos") return {kind:"func",name:"sin",arg:{kind:"var"}};
            if(n.name==="exp") return {kind:"func",name:"exp",arg:{kind:"var"}};
            if(n.name==="ln") return {kind:"-",left:{kind:"*",left:{kind:"var"},right:{kind:"func",name:"ln",arg:{kind:"var"}}},right:{kind:"var"}};
            throw new Error("Unsupported function");
        default: throw new Error("Unsupported integral");
    }
}

function simplifyAst(n) {
    if(!n) return n;
    if(["+","-","*","/","pow"].includes(n.kind)) {
        n.left=simplifyAst(n.left); n.right=simplifyAst(n.right);
        if(isConst(n.left) && isConst(n.right)) {
            if(n.kind==="+") return constAst(n.left.value+n.right.value);
            if(n.kind==="-") return constAst(n.left.value-n.right.value);
            if(n.kind==="*") return constAst(n.left.value*n.right.value);
            if(n.kind==="/") return constAst(n.left.value/n.right.value);
            if(n.kind==="pow") return constAst(Math.pow(n.left.value,n.right.value));
        }
        if(n.kind==="+") { if(isConst(n.left)&&n.left.value===0) return n.right; if(isConst(n.right)&&n.right.value===0) return n.left; }
        if(n.kind==="-") { if(isConst(n.right)&&n.right.value===0) return n.left; }
        if(n.kind==="*") { if(isConst(n.left)&&n.left.value===0) return constAst(0); if(isConst(n.right)&&n.right.value===0) return constAst(0); if(isConst(n.left)&&n.left.value===1) return n.right; if(isConst(n.right)&&n.right.value===1) return n.left; }
        if(n.kind==="/") { if(isConst(n.left)&&n.left.value===0) return constAst(0); if(isConst(n.right)&&n.right.value===1) return n.left; }
        if(n.kind==="pow") { if(isConst(n.right)&&n.right.value===1) return n.left; if(isConst(n.right)&&n.right.value===0) return constAst(1); }
        return n;
    }
    if(n.kind==="neg") { n.arg=simplifyAst(n.arg); if(isConst(n.arg)) return constAst(-n.arg.value); if(n.arg.kind==="neg") return n.arg.arg; return n; }
    if(n.kind==="func") { n.arg=simplifyAst(n.arg); return n; }
    return n;
}

function astToString(n, parent=0) {
    if(n.kind==="const") return Number.isInteger(n.value) ? String(n.value) : Number(n.value.toFixed(8)).toString();
    if(n.kind==="var") return "x";
    if(n.kind==="neg") return `-${needsParens(n.arg,3)?"("+astToString(n.arg)+")":astToString(n.arg)}`;
    if(n.kind==="func") return `${n.name}(${astToString(n.arg)})`;
    const prec={"+":1,"-":1,"*":2,"/":2,"pow":3}[n.kind];
    let a=astToString(n.left,prec), b=astToString(n.right,prec);
    if(n.kind==="pow") return `${wrapIf(n.left,n.kind)}^${wrapIf(n.right,n.kind)}`;
    let out=`${a} ${n.kind} ${b}`;
    if(prec<parent) out=`(${out})`;
    return out;
}
function needsParens(n, p){ return n && ({"+":1,"-":1,"*":2,"/":2,"pow":3}[n.kind]||4)<p; }
function wrapIf(n,kind){ const p={"+":1,"-":1,"*":2,"/":2,"pow":3}[n.kind]||4; return p<3?`(${astToString(n)})`:astToString(n); }

function evaluateAst(n,x) {
    switch(n.kind) {
        case "const": return n.value;
        case "var": return x;
        case "neg": return -evaluateAst(n.arg,x);
        case "+": return evaluateAst(n.left,x)+evaluateAst(n.right,x);
        case "-": return evaluateAst(n.left,x)-evaluateAst(n.right,x);
        case "*": return evaluateAst(n.left,x)*evaluateAst(n.right,x);
        case "/": return evaluateAst(n.left,x)/evaluateAst(n.right,x);
        case "pow": return Math.pow(evaluateAst(n.left,x),evaluateAst(n.right,x));
        case "func": {
            const a=evaluateAst(n.arg,x);
            if(n.name==="sin") return Math.sin(a);
            if(n.name==="cos") return Math.cos(a);
            if(n.name==="tan") return Math.tan(a);
            if(n.name==="ln") return Math.log(a);
            if(n.name==="sqrt") return Math.sqrt(a);
            if(n.name==="exp") return Math.exp(a);
            throw new Error("Unsupported function");
        }
    }
}

function containsSingularity(ast, lower, upper) {
    // ln(x), x^negative, and 1/x are undefined at x=0. Also reject any interval crossing 0 for these forms.
    if(lower===0 || upper===0 || (lower<0 && upper>0)) {
        let found=false;
        (function walk(n){
            if(!n||found) return;
            if(n.kind==="func" && n.name==="ln") found=true;
            if(n.kind==="/" && n.right.kind==="var") found=true;
            if(n.kind==="pow" && isConst(n.right) && n.right.value<0) found=true;
            if(n.left) walk(n.left); if(n.right) walk(n.right); if(n.arg) walk(n.arg);
        })(ast);
        return found;
    }
    return false;
}

function matrixHtml(M) {
    return `<table style="border-collapse:collapse; margin:8px 0;"><tbody>` +
        M.map(row => `<tr>${row.map(x => `<td style="border:1px solid #999; padding:8px; min-width:45px; text-align:center;">${number(x,4)}</td>`).join("")}</tr>`).join("") +
        `</tbody></table>`;
}
function readMatrix(v,prefix,rows,cols) {
    return Array.from({length:rows},(_,i)=>Array.from({length:cols},(_,j)=>{
        const raw=v[`${prefix}${i+1}${j+1}`];
        const n=Number(raw);
        return Number.isFinite(n)?n:0;
    }));
}
function determinant(M) {
    const n=M.length;
    if(n===1) return M[0][0];
    if(n===2) return M[0][0]*M[1][1]-M[0][1]*M[1][0];
    let d=0;
    for(let j=0;j<n;j++) {
        const minor=M.slice(1).map(r=>r.filter((_,k)=>k!==j));
        d += (j%2===0?1:-1)*M[0][j]*determinant(minor);
    }
    return d;
}
function inverseMatrix(M) {
    const n=M.length;
    const aug=M.map((r,i)=>r.map(x=>x).concat(Array.from({length:n},(_,j)=>i===j?1:0)));
    for(let i=0;i<n;i++) {
        let pivot=i;
        for(let r=i+1;r<n;r++) if(Math.abs(aug[r][i])>Math.abs(aug[pivot][i])) pivot=r;
        if(Math.abs(aug[pivot][i])<1e-12) return null;
        [aug[i],aug[pivot]]=[aug[pivot],aug[i]];
        const div=aug[i][i];
        for(let j=0;j<2*n;j++) aug[i][j]/=div;
        for(let r=0;r<n;r++) if(r!==i) {
            const factor=aug[r][i];
            for(let j=0;j<2*n;j++) aug[r][j]-=factor*aug[i][j];
        }
    }
    return aug.map(r=>r.slice(n));
}

function calculateIndicesExpression(raw) {
    const original = String(raw || "").trim();
    if (!original) return errorMessage("Enter an index expression, e.g. 2^3 * 2^4, 3^5 / 3^2, or (2^3)^2.");

    const expression = normalizeSuperscriptPowers(original)
        .replace(/[\u00D7\u00B7]/g, "*")
        .replace(/\u00F7/g, "/")
        .replace(/[\u2212\u2013\u2014]/g, "-")
        .replace(/\s+/g, "");

    if (/[^0-9.+\-* /^()]/.test(expression) || /[^0-9.+\-* /^()]/.test(expression.replace(/\s/g, ""))) {
        return errorMessage("Use numbers, brackets, +, -, *, / and ^ for powers.");
    }
    if (/\*\*\*|\/\/|\^\^|[+*/^.-]{3,}/.test(expression)) {
        return errorMessage("Check the operators and brackets in your expression.");
    }

    let value;
    try {
        value = Function('"use strict"; return (' + expression.replace(/\^/g, "**") + ');')();
    } catch (_) {
        return errorMessage("That index expression could not be read. Check the powers and brackets.");
    }
    if (!Number.isFinite(value)) return errorMessage("The expression does not produce a finite numerical answer.");

    let law = "Evaluate powers first, then complete the remaining operations in the correct order.";
    let simplified = expression;
    let working = `Expression: <strong>${escapeHtml(original)}</strong><br><br>Evaluate the powers, then complete the remaining operations.`;

    let m = expression.match(/^\(?([0-9]+(?:\.[0-9]+)?)\^(-?\d+)\)?\*\(?\1\^(-?\d+)\)?$/);
    if (m) {
        const base = m[1], a = Number(m[2]), b = Number(m[3]);
        simplified = `${base}^${a + b}`;
        law = "Product rule: a^m \u00D7 a^n = a^(m+n)";
        working = `${base}^${a} \u00D7 ${base}^${b} = ${base}^(${a} + ${b}) = <strong>${simplified}</strong>`;
    } else {
        m = expression.match(/^\(?([0-9]+(?:\.[0-9]+)?)\^(-?\d+)\)?\/\(?\1\^(-?\d+)\)?$/);
        if (m) {
            const base = m[1], a = Number(m[2]), b = Number(m[3]);
            simplified = `${base}^${a - b}`;
            law = "Quotient rule: a^m / a^n = a^(m-n), where a is not zero";
            working = `${base}^${a} / ${base}^${b} = ${base}^(${a} - ${b}) = <strong>${simplified}</strong>`;
        } else {
            m = expression.match(/^\(([0-9]+(?:\.[0-9]+)?)\^(-?\d+)\)\^(-?\d+)$/);
            if (m) {
                const base = m[1], a = Number(m[2]), b = Number(m[3]);
                simplified = `${base}^${a * b}`;
                law = "Power of a power: (a^m)^n = a^(m \u00D7 n)";
                working = `(${base}^${a})^${b} = ${base}^(${a} \u00D7 ${b}) = <strong>${simplified}</strong>`;
            }
        }
    }

    return resultTemplate(
        law.includes("=") ? law : `Expression: ${escapeHtml(original)}`,
        working,
        `<strong>Index form:</strong> ${escapeHtml(simplified)}<br><br><strong>Numerical answer:</strong> ${mathNumber(value)}`,
        law
    );
}

function normalizeSuperscriptPowers(text) {
    const superscripts = {"\u2070":"0","\u00B9":"1","\u00B2":"2","\u00B3":"3","\u2074":"4","\u2075":"5","\u2076":"6","\u2077":"7","\u2078":"8","\u2079":"9","\u207B":"-"};
    return String(text).replace(/[\u2070\u00B9\u00B2\u00B3\u2074\u2075\u2076\u2077\u2078\u2079\u207B]+/g, part => "^" + [...part].map(ch => superscripts[ch] ?? ch).join(""));
}

function evaluateLogExpression(raw, collectedLogs = []) {
    const subscriptDigits = {"\u2080":"0","\u2081":"1","\u2082":"2","\u2083":"3","\u2084":"4","\u2085":"5","\u2086":"6","\u2087":"7","\u2088":"8","\u2089":"9"};
    let expr = normalizeSuperscriptPowers(String(raw || "").replace(/log([\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089]+)/gi, (_, digits) => "log_" + [...digits].map(ch => subscriptDigits[ch]).join("")))
        .replace(/[\u2212\u2013\u2014]/g, "-").replace(/[\u00D7\u00B7]/g, "*").replace(/\u00F7/g, "/")
        .replace(/\s+/g, "");

    // Read log_base(argument) with balanced brackets so the argument can contain powers,
    // brackets, multiplication, division, or supported functions such as sqrt(...).
    let output = "";
    for (let i = 0; i < expr.length;) {
        const match = expr.slice(i).match(/^log_([0-9]+(?:\.[0-9]+)?)\(/i);
        if (!match) { output += expr[i++]; continue; }
        const base = Number(match[1]);
        const openAt = i + match[0].length - 1;
        let depth = 1, j = openAt + 1;
        for (; j < expr.length && depth > 0; j++) {
            if (expr[j] === "(") depth++;
            else if (expr[j] === ")") depth--;
        }
        if (depth !== 0) throw new Error("Missing closing bracket in logarithm.");
        const argumentText = expr.slice(openAt + 1, j - 1);
        const argument = evaluateLogExpression(argumentText, collectedLogs);
        if (!(base > 0) || base === 1 || !(argument.value > 0) || !Number.isFinite(argument.value)) {
            throw new Error("The base must be positive and not 1, and the logarithm argument must be positive.");
        }
        const value = Math.log(argument.value) / Math.log(base);
        const item = {base, argumentText, argument:argument.value, value};
        collectedLogs.push(item);
        output += `(${value})`;
        i = j;
    }
    const ast = parseMathExpression(output);
    const value = evaluateAst(ast, 0);
    if (!Number.isFinite(value)) throw new Error("The expression does not have a finite numerical value.");
    return {value, expression:output};
}

function primePowerForm(value) {
    if (!Number.isSafeInteger(value) || value < 2) return null;
    let n = value;
    const factors = [];
    for (let p = 2; p * p <= n; p++) {
        if (n % p !== 0) continue;
        let power = 0;
        while (n % p === 0) { n /= p; power++; }
        factors.push({ prime: p, power });
    }
    if (n > 1) factors.push({ prime: n, power: 1 });
    return factors;
}

function basePowerForm(base) {
    if (!Number.isSafeInteger(base) || base < 2) return null;
    const factors = primePowerForm(base);
    if (!factors || factors.length !== 1 || factors[0].power < 2) return null;
    return { prime: factors[0].prime, power: factors[0].power };
}

function expandedLogForm(base, argument) {
    // Expand integer arguments that are exact powers, for example log_4(81) = 4 log_4(3).
    if (!Number.isSafeInteger(argument) || argument < 2) return null;
    const factors = primePowerForm(argument);
    if (!factors || factors.length !== 1 || factors[0].power < 2) return null;
    const { prime, power } = factors[0];
    return {
        prime,
        power,
        form: `${power} log_${mathNumber(base)}(${prime})`,
        factorForm: `${mathNumber(argument)} = ${prime}^${power}`
    };
}

function simplifyLogBaseForm(base, argumentForm) {
    // If the base is a power, apply log_(a^n)(x) = (1/n) log_a(x).
    const basePower = basePowerForm(base);
    if (!basePower) return argumentForm;
    const multiplierMatch = argumentForm.match(/^([0-9]+) log_[^(]+\((.+)\)$/);
    const coefficient = multiplierMatch ? Number(multiplierMatch[1]) : 1;
    const inside = multiplierMatch ? multiplierMatch[2] : argumentForm.match(/^log_[^(]+\((.+)\)$/)?.[1];
    if (!inside) return argumentForm;
    const numerator = coefficient;
    const denominator = basePower.power;
    const reducedNumerator = numerator / gcdPositiveIntegers(numerator, denominator);
    const reducedDenominator = denominator / gcdPositiveIntegers(numerator, denominator);
    const coefficientText = reducedNumerator === 1
        ? (reducedDenominator === 1 ? "" : `1/${reducedDenominator} `)
        : (reducedDenominator === 1 ? `${reducedNumerator} ` : `${reducedNumerator}/${reducedDenominator} `);
    return `${coefficientText}log_${basePower.prime}(${inside})`;
}

function gcdPositiveIntegers(a, b) {
    let x = Math.abs(a), y = Math.abs(b);
    while (y) { const remainder = x % y; x = y; y = remainder; }
    return x || 1;
}

function calculateLogExpression(raw) {
    const original = String(raw || "").trim();
    if (!original) return errorMessage("Enter a logarithm, for example log_2(8), log_4(9^2), or log_10(sqrt(100)).");
    const logs = [];
    let result;
    try {
        result = evaluateLogExpression(original, logs);
    } catch (error) {
        return errorMessage(error.message || "Check the logarithm notation, brackets, base and argument.");
    }

    const steps = [];
    let stepNumber = 1;
    logs.forEach((item) => {
        const baseText = mathNumber(item.base);
        const cleanArgument = normalizeSuperscriptPowers(item.argumentText);
        const argumentHtml = formatMathNotation(escapeHtml(cleanArgument));
        const simplePower = cleanArgument.match(/^\(?\s*(\d+(?:\.\d+)?)\s*\)?\s*\^\s*(\d+)$/);
        const exactPower = simplePower && Number.isInteger(Number(simplePower[1])) && Number(simplePower[2]) > 0;

        if (exactPower) {
            const originalBase = Number(simplePower[1]);
            const exponent = Number(simplePower[2]);
            steps.push(`Step ${stepNumber++} \u2014 Evaluate the power inside the logarithm:<br>${argumentHtml} = ${mathNumber(item.argument)}`);
            const expanded = expandedLogForm(item.base, item.argument);
            if (expanded) {
                steps.push(`Step ${stepNumber++} \u2014 Rewrite the argument as a power of a prime number:<br>${mathNumber(item.argument)} = ${expanded.prime}<sup>${expanded.power}</sup>`);
                steps.push(`Step ${stepNumber++} \u2014 Apply the power rule for logarithms:<br>log<sub>${baseText}</sub>(${expanded.prime}<sup>${expanded.power}</sup>) = ${expanded.power} log<sub>${baseText}</sub>(${expanded.prime})`);
            } else {
                steps.push(`Step ${stepNumber++} \u2014 Apply the power rule for logarithms:<br>log<sub>${baseText}</sub>(${mathNumber(originalBase)}<sup>${exponent}</sup>) = ${exponent} log<sub>${baseText}</sub>(${mathNumber(originalBase)})`);
            }
        } else {
            steps.push(`Step ${stepNumber++} \u2014 Simplify the logarithm's argument:<br>${argumentHtml} = ${mathNumber(item.argument)}`);
            const expanded = expandedLogForm(item.base, item.argument);
            if (expanded) {
                steps.push(`Step ${stepNumber++} \u2014 Factor the argument into a power:<br>${expanded.factorForm}`);
                steps.push(`Step ${stepNumber++} \u2014 Apply the power rule:<br>log<sub>${baseText}</sub>(${expanded.prime}<sup>${expanded.power}</sup>) = ${expanded.power} log<sub>${baseText}</sub>(${expanded.prime})`);
            }
        }
        const basePower = basePowerForm(item.base);
        if (basePower) {
            steps.push(`Step ${stepNumber++} \u2014 Break down the base into a power:<br>${baseText} = ${basePower.prime}<sup>${basePower.power}</sup>`);
            steps.push(`Step ${stepNumber++} \u2014 Apply the base power rule:<br>log<sub>${basePower.prime}<sup>${basePower.power}</sup></sub>(x) = (1/${basePower.power}) log<sub>${basePower.prime}</sub>(x)`);
        }
        steps.push(`Step ${stepNumber++} \u2014 Find the numerical value using change of base:<br>log<sub>${baseText}</sub>(${mathNumber(item.argument)}) = ln(${mathNumber(item.argument)}) \u00F7 ln(${baseText}) = ${mathNumber(item.value)}`);
    });
    if (!steps.length) {
        steps.push(`Step 1 \u2014 Evaluate the logarithmic expression:<br>${formatMathNotation(escapeHtml(normalizeSuperscriptPowers(original)))}`);
    }
    if (logs.length > 1 || /[+*/\u2212\u00F7\u00D7]/.test(normalizeSuperscriptPowers(original).replace(/log_[0-9.]+/gi, ""))) {
        steps.push(`Final step \u2014 Complete the remaining operations:<br>${mathNumber(result.value)}`);
    }

    const law = "Power rule: log_b(x^n) = n log_b(x). Change of base: log_b(x) = ln(x) \u00F7 ln(b), where b > 0, b \u2260 1 and x > 0.";
    const normalizedOriginal = normalizeSuperscriptPowers(original);
    const oneLogOnly = normalizedOriginal.match(/^log_([0-9]+(?:\.[0-9]+)?)\((.*)\)$/i);
    let logForm = normalizedOriginal;
    if (oneLogOnly && logs.length === 1) {
        const item = logs[0];
        const expanded = expandedLogForm(item.base, item.argument);
        if (expanded) {
            logForm = simplifyLogBaseForm(item.base, expanded.form);
        } else {
            const power = item.argumentText.match(/^\(?\s*(\d+(?:\.\d+)?)\s*\)?\s*\^\s*(\d+)$/);
            const argumentForm = power
                ? `${power[2]} log_${mathNumber(item.base)}(${mathNumber(Number(power[1]))})`
                : `log_${mathNumber(item.base)}(${mathNumber(item.argument)})`;
            logForm = simplifyLogBaseForm(item.base, argumentForm);
        }
    }
    return resultTemplate(
        "log<sub>b</sub>(x) = ln(x) \u00F7 ln(b)",
        steps.join("<br><br>"),
        `<strong>Final logarithmic form:</strong> ${formatMathNotation(escapeHtml(logForm))}<br><br><strong>Numerical answer:</strong> ${mathNumber(result.value)}`,
        law
    );
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
        ["cost", "Asset Cost (NGN)", "number"],
        ["residual", "Residual Value (NGN)", "number"],
        ["life", "Useful Life (Years)", "number"]
    ],

    formula:
        "D = (C \u2212 R) \u00F7 n",

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

            "D = (C \u2212 R) \u00F7 n \u2014 annual straight-line depreciation",

            `Step 1 \u2014 Calculate the depreciable amount:<br>Cost \u2212 Residual value = ${money(cost)} \u2212 ${money(residual)} = ${money(cost-residual)}<br><br>Step 2 \u2014 Divide by the useful life in years:<br>Annual depreciation = ${money(cost-residual)} \u00F7 ${number(life)} = ${money(annual)}<br><br>Step 3 \u2014 Convert annual depreciation to a monthly amount:<br>Monthly depreciation = ${money(annual)} \u00F7 12 = ${money(monthly)}` ,

            `Annual: ${money(annual)}<br>
             Monthly: ${money(monthly)}`
        );

    }

},


"reducing-balance": {

    title: "Reducing-Balance Depreciation",

    fields: [
        ["method", "Calculation Method", "select"],
        ["cost", "Cost of Asset (NGN)", "number"],
        ["residual", "Scrap / Residual Value (NGN)", "number"],
        ["usefulLife", "Useful Life (Years)", "number"],
        ["rate", "Depreciation Rate (%)", "number"],
        ["startDate", "Start Date", "date"],
        ["endDate", "End Date", "date"],
        ["openingAccumulated", "Opening Accumulated Depreciation (NGN) - Optional", "number"]
    ],

    options: {
        method: [
            ["rate", "Calculate Depreciation Rate"],
            ["depreciation", "Calculate Depreciation"]
        ]
    },

    formula:
        "Select a method to display the appropriate reducing-balance formula.",

    calculate(v) {

        const method = v.method || "rate";

        if (method === "rate") {

            const cost = getNumber(v, "cost");
            const residual = getNumber(v, "residual");
            const usefulLife = getNumber(v, "usefulLife");

            if (!Number.isFinite(cost) || cost <= 0) {
                return errorMessage("Cost of asset must be greater than zero.");
            }

            if (!Number.isFinite(residual) || residual < 0) {
                return errorMessage("Residual value cannot be negative.");
            }

            if (residual >= cost) {
                return errorMessage("Residual value must be less than the cost of the asset.");
            }

            if (!Number.isFinite(usefulLife) || usefulLife <= 0) {
                return errorMessage("Useful life must be greater than zero.");
            }

            const rate =
                1 - Math.pow(residual / cost, 1 / usefulLife);

            return resultTemplate(

                "S = C(1 \u2212 r)\u207F<br><br>Therefore: r = 1 \u2212 (S \u00F7 C)^(1/n)",

                `
                S = ${money(residual)}<br>
                C = ${money(cost)}<br>
                n = ${number(usefulLife)} years<br><br>

                r = 1 - (${money(residual)} / ${money(cost)})<sup>1/${number(usefulLife)}</sup><br><br>

                r = 1 - ${number(Math.pow(residual / cost, 1 / usefulLife), 6)}<br><br>

                r = ${number(rate * 100)}%
                `,

                `Depreciation Rate = ${percent(rate * 100)}`,

                "This rate can now be used to calculate reducing-balance depreciation year by year."
            );

        }


        const cost = getNumber(v, "cost");
        const ratePercent = getNumber(v, "rate");
        const rate = ratePercent / 100;
        const startDate = new Date(v.startDate);
        const endDate = new Date(v.endDate);
        const openingAccumulatedRaw = v.openingAccumulated;
        const openingAccumulated =
            openingAccumulatedRaw === "" || openingAccumulatedRaw === undefined
                ? 0
                : Number(openingAccumulatedRaw);

        if (!Number.isFinite(cost) || cost <= 0) {
            return errorMessage("Cost of asset must be greater than zero.");
        }

        if (!Number.isFinite(ratePercent) || ratePercent <= 0 || ratePercent >= 100) {
            return errorMessage("Depreciation rate must be greater than 0% and less than 100%.");
        }

        if (!v.startDate || !v.endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return errorMessage("Please enter both the start date and end date.");
        }

        if (endDate <= startDate) {
            return errorMessage("End date must be after the start date.");
        }

        if (!Number.isFinite(openingAccumulated) || openingAccumulated < 0) {
            return errorMessage("Opening accumulated depreciation cannot be negative.");
        }

        if (openingAccumulated >= cost) {
            return errorMessage("Opening accumulated depreciation must be less than the asset cost.");
        }

        const openingCarryingAmount =
            cost - openingAccumulated;

        let cursor = new Date(startDate);
        let accumulated = openingAccumulated;
        let carryingAmount = openingCarryingAmount;
        let totalDepreciation = 0;
        let schedule = [];
        let periodNumber = 1;

        function addOneYear(date) {
            const next = new Date(date);
            next.setFullYear(next.getFullYear() + 1);
            return next;
        }

        function dayDifference(a, b) {
            return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
        }

        function periodText(start, end) {
            let years = end.getFullYear() - start.getFullYear();
            let months = end.getMonth() - start.getMonth();
            let days = end.getDate() - start.getDate();

            if (days < 0) {
                months--;
                const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0);
                days += previousMonth.getDate();
            }

            if (months < 0) {
                years--;
                months += 12;
            }

            const parts = [];
            if (years) parts.push(`${years} year${years === 1 ? "" : "s"}`);
            if (months) parts.push(`${months} month${months === 1 ? "" : "s"}`);
            if (days) parts.push(`${days} day${days === 1 ? "" : "s"}`);

            return parts.length ? parts.join(" ") : "0 days";
        }

        while (cursor < endDate) {

            const nextAnniversary = addOneYear(cursor);
            const segmentEnd =
                nextAnniversary < endDate
                    ? nextAnniversary
                    : new Date(endDate);

            const days = dayDifference(cursor, segmentEnd);
            const fullYearDays =
                ((new Date(cursor.getFullYear() + 1, cursor.getMonth(), cursor.getDate())) - cursor) /
                (1000 * 60 * 60 * 24);

            const timeFraction =
                days / fullYearDays;

            const fullYearDepreciation =
                carryingAmount * rate;

            const depreciation =
                Math.min(
                    carryingAmount,
                    fullYearDepreciation * timeFraction
                );

            const closingAmount =
                carryingAmount - depreciation;

            accumulated += depreciation;
            totalDepreciation += depreciation;

            schedule.push({
                number: periodNumber,
                start: cursor.toLocaleDateString("en-GB"),
                end: segmentEnd.toLocaleDateString("en-GB"),
                period: periodText(cursor, segmentEnd),
                days,
                fraction: timeFraction,
                opening: carryingAmount,
                depreciation,
                accumulated,
                closing: closingAmount
            });

            carryingAmount = closingAmount;
            cursor = segmentEnd;
            periodNumber++;
        }

        const totalDays =
            dayDifference(startDate, endDate);

        const totalYears =
            Math.floor(totalDays / 365);

        const remainderDays =
            totalDays - (totalYears * 365);

        const approxMonths =
            Math.floor(remainderDays / 30);

        let periodSummary = "";

        if (totalYears > 0) {
            periodSummary += `${totalYears} year${totalYears === 1 ? "" : "s"}`;
        }

        if (approxMonths > 0) {
            periodSummary += `${periodSummary ? " " : ""}${approxMonths} month${approxMonths === 1 ? "" : "s"}`;
        }

        if (!periodSummary) {
            periodSummary = `${totalDays} days`;
        }

        let tableRows = schedule.map(row => `
            <tr>
                <td>${row.number}</td>
                <td>${row.start}</td>
                <td>${row.end}</td>
                <td>${row.period}</td>
                <td>${money(row.opening)}</td>
                <td>${money(row.depreciation)}</td>
                <td>${money(row.accumulated)}</td>
                <td>${money(row.closing)}</td>
            </tr>
        `).join("");

        const finalTable = `
            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; margin-top:15px;">
                    <thead>
                        <tr>
                            <th style="padding:8px; border:1px solid #999;">Period</th>
                            <th style="padding:8px; border:1px solid #999;">Start</th>
                            <th style="padding:8px; border:1px solid #999;">End</th>
                            <th style="padding:8px; border:1px solid #999;">Time</th>
                            <th style="padding:8px; border:1px solid #999;">Opening Carrying Amount</th>
                            <th style="padding:8px; border:1px solid #999;">Depreciation</th>
                            <th style="padding:8px; border:1px solid #999;">Accumulated Depreciation</th>
                            <th style="padding:8px; border:1px solid #999;">Closing Carrying Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;

        const partialNote = schedule.length > 0
            ? `The final period is prorated according to the actual time covered. For example, a 5-month period uses approximately 5/12 of the annual reducing-balance depreciation for that period.`
            : "";

        return resultTemplate(

            "D\u209C = CA\u209C\u208B\u2081 \u00D7 r \u00D7 f; CA\u209C = CA\u209C\u208B\u2081 \u2212 D\u209C; f = days in period \u00F7 days in year",

            `
            Cost = ${money(cost)}<br>
            Rate = ${percent(ratePercent)}<br>
            Opening Accumulated Depreciation = ${money(openingAccumulated)}<br>
            Opening Carrying Amount = ${money(cost)} - ${money(openingAccumulated)} = ${money(openingCarryingAmount)}<br><br>

            Total Period = ${periodSummary}<br>
            Total Depreciation = ${money(totalDepreciation)}<br>
            Closing Carrying Amount = ${money(carryingAmount)}<br><br>

            ${partialNote}<br><br>
            ${finalTable}
            `,

            `Total Depreciation: ${money(totalDepreciation)}<br>
             Accumulated Depreciation at End: ${money(accumulated)}<br>
             Closing Carrying Amount: ${money(carryingAmount)}`
        );

    }

},


"book-value": {
    title: "Book Value",
    fields: [["cost", "Original Cost (NGN)", "number"], ["accumulated", "Accumulated Depreciation (NGN)", "number"]],
    formula: "\\(\\text{Book value}=\\text{Cost}-\\text{Accumulated depreciation}\\)",
    calculate(v) {
        const cost=getNumber(v,"cost"), accumulated=getNumber(v,"accumulated");
        if (![cost,accumulated].every(Number.isFinite) || cost<0 || accumulated<0) return errorMessage("Enter valid non-negative cost and accumulated depreciation.");
        if (accumulated>cost) return errorMessage("Accumulated depreciation cannot exceed the original cost for this basic book-value calculation.");
        const book=cost-accumulated;
        return resultTemplate("\\(\\text{Book value}=\\text{Cost}-\\text{Accumulated depreciation}\\)",`Step 1 \u2014 Identify the original cost:<br>Cost = ${money(cost)}<br><br>Step 2 \u2014 Identify accumulated depreciation to date:<br>Accumulated depreciation = ${money(accumulated)}<br><br>Step 3 \u2014 Subtract accumulated depreciation from cost:<br>Book value = ${money(cost)} \u2212 ${money(accumulated)} = ${money(book)}`,money(book),"Book value is the carrying amount before considering any separate impairment or revaluation adjustment.");
    }
},
"gross-profit": {
    title: "Gross Profit",
    fields: [["sales", "Sales Revenue (NGN)", "number"], ["cogs", "Cost of Goods Sold (NGN)", "number"]],
    formula: "\\(\\text{Gross profit}=\\text{Sales}-\\text{Cost of goods sold}\\)",
    calculate(v) {
        const sales=getNumber(v,"sales"), cogs=getNumber(v,"cogs");
        if (![sales,cogs].every(Number.isFinite)) return errorMessage("Enter valid sales and cost of goods sold values.");
        const profit=sales-cogs;
        return resultTemplate("\\(\\text{Gross profit}=\\text{Sales}-\\text{COGS}\\)",`Step 1 \u2014 Identify sales revenue:<br>Sales = ${money(sales)}<br><br>Step 2 \u2014 Identify the cost of goods sold:<br>COGS = ${money(cogs)}<br><br>Step 3 \u2014 Subtract COGS from sales:<br>Gross profit = ${money(sales)} \u2212 ${money(cogs)} = ${money(profit)}`,money(profit),"Gross profit is calculated before deducting operating expenses and other costs not included in cost of goods sold.");
    }
},
"gross-profit-margin": {
    title: "Gross Profit Margin",
    fields: [["sales", "Sales Revenue (NGN)", "number"], ["cogs", "Cost of Goods Sold (NGN)", "number"]],
    formula: "\\(\\text{Gross margin}=\\frac{\\text{Sales}-\\text{COGS}}{\\text{Sales}}\\times100\\%\\)",
    calculate(v) {
        const sales=getNumber(v,"sales"), cogs=getNumber(v,"cogs");
        if (![sales,cogs].every(Number.isFinite)) return errorMessage("Enter valid sales and COGS values.");
        if (sales===0) return errorMessage("Sales cannot be zero because sales is the denominator.");
        const grossProfit=sales-cogs, margin=grossProfit/sales*100;
        return resultTemplate("\\(\\text{Gross margin}=\\frac{\\text{Gross profit}}{\\text{Sales}}\\times100\\%\\)",`Step 1 \u2014 Calculate gross profit:<br>Gross profit = Sales \u2212 COGS = ${money(sales)} \u2212 ${money(cogs)} = ${money(grossProfit)}<br><br>Step 2 \u2014 Divide gross profit by sales:<br>${money(grossProfit)} \u00F7 ${money(sales)} = ${number(grossProfit/sales,6)}<br><br>Step 3 \u2014 Convert the ratio to a percentage:<br>${number(grossProfit/sales,6)} \u00D7 100% = ${percent(margin)}`,percent(margin),"The percentage of sales revenue remaining after covering the cost of goods sold.");
    }
},
"net-profit": {
    title: "Net Profit",
    fields: [["revenue", "Revenue (NGN)", "number"], ["expenses", "Total Expenses (NGN)", "number"]],
    formula: "\\(\\text{Net profit}=\\text{Revenue}-\\text{Total expenses}\\)",
    calculate(v) {
        const revenue=getNumber(v,"revenue"), expenses=getNumber(v,"expenses");
        if (![revenue,expenses].every(Number.isFinite)) return errorMessage("Enter valid revenue and expense values.");
        const profit=revenue-expenses;
        return resultTemplate("\\(\\text{Net profit}=\\text{Revenue}-\\text{Expenses}\\)",`Step 1 \u2014 Identify total revenue:<br>Revenue = ${money(revenue)}<br><br>Step 2 \u2014 Identify total expenses:<br>Expenses = ${money(expenses)}<br><br>Step 3 \u2014 Subtract total expenses from revenue:<br>Net profit = ${money(revenue)} \u2212 ${money(expenses)} = ${money(profit)}`,money(profit),profit<0?"Expenses exceed revenue, so the result is a net loss.":"This is the amount remaining after the stated expenses are deducted from revenue.");
    }
},
"net-profit-margin": {
    title: "Net Profit Margin",
    fields: [["revenue", "Revenue (NGN)", "number"], ["expenses", "Total Expenses (NGN)", "number"]],
    formula: "\\(\\text{Net margin}=\\frac{\\text{Net profit}}{\\text{Revenue}}\\times100\\%\\)",
    calculate(v) {
        const revenue=getNumber(v,"revenue"), expenses=getNumber(v,"expenses");
        if (![revenue,expenses].every(Number.isFinite)) return errorMessage("Enter valid revenue and expense values.");
        if (revenue===0) return errorMessage("Revenue cannot be zero because it is the denominator.");
        const profit=revenue-expenses, margin=profit/revenue*100;
        return resultTemplate("\\(\\text{Net margin}=\\frac{\\text{Net profit}}{\\text{Revenue}}\\times100\\%\\)",`Step 1 \u2014 Calculate net profit:<br>Net profit = Revenue \u2212 Expenses = ${money(revenue)} \u2212 ${money(expenses)} = ${money(profit)}<br><br>Step 2 \u2014 Divide net profit by revenue:<br>${money(profit)} \u00F7 ${money(revenue)} = ${number(profit/revenue,6)}<br><br>Step 3 \u2014 Convert the ratio to a percentage:<br>${number(profit/revenue,6)} \u00D7 100% = ${percent(margin)}`,percent(margin),margin<0?"A negative net margin means the stated expenses exceed revenue.":"This is the share of revenue remaining after the stated expenses are deducted.");
    }
},
"markup": {

    title: "Markup",

    fields: [
        ["cost", "Cost (NGN)", "number"],
        ["selling", "Selling Price (NGN)", "number"]
    ],

    formula:
        "MU% = [(SP \u2212 C) \u00F7 C] \u00D7 100%",

    calculate(v) {

        const cost = getNumber(v, "cost");
        const selling = getNumber(v, "selling");

        if (cost === 0) {
            return errorMessage("Cost cannot be zero.");
        }

        const markup =
            ((selling - cost) / cost) * 100;

        return resultTemplate(

            "MU% = [(SP \u2212 C) \u00F7 C] \u00D7 100%",

            `Step 1 \u2014 Calculate the markup amount:<br>Markup = Selling Price \u2212 Cost = ${money(selling)} \u2212 ${money(cost)} = ${money(selling-cost)}<br><br>Step 2 \u2014 Divide markup by cost:<br>Markup ratio = ${money(selling-cost)} \u00F7 ${money(cost)} = ${compactNumber((selling-cost)/cost)}<br><br>Step 3 \u2014 Convert the ratio to a percentage:<br>Markup % = ${compactNumber((selling-cost)/cost)} \u00D7 100% = ${percent(markup)}` ,

            percent(markup)
        );

    }

},


"break-even": {

    title: "Break-Even Point",

    fields: [
        ["fixed", "Fixed Costs (NGN)", "number"],
        ["selling", "Selling Price per Unit (NGN)", "number"],
        ["variable", "Variable Cost per Unit (NGN)", "number"]
    ],

    formula:
        "Q_BE = FC \u00F7 (P \u2212 AVC)",

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

            "Q_BE = FC \u00F7 (P \u2212 AVC)",

            `Step 1 \u2014 Calculate contribution per unit:<br>Contribution = Selling price \u2212 Variable cost = ${money(selling)} \u2212 ${money(variable)} = ${money(contribution)}<br><br>Step 2 \u2014 Divide fixed costs by contribution per unit:<br>Q_BE = FC \u00F7 Contribution = ${money(fixed)} \u00F7 ${money(contribution)} = ${number(units)} units<br><br>Step 3 \u2014 Interpret the result:<br>The business must sell approximately ${number(units)} units to cover its fixed and variable costs at the stated prices.` ,

            `${number(units)} units`
        );

    }

},


"vat": {

    title: "VAT Calculator",

    fields: [
        ["amount", "Amount (NGN)", "number"],
        ["rate", "VAT Rate (%)", "number"]
    ],

    formula:
        "VAT = B \u00D7 r \u00F7 100; Total = B + VAT",

    calculate(v) {

        const amount = getNumber(v, "amount");
        const rate = getNumber(v, "rate");

        const vat =
            amount * rate / 100;

        const total =
            amount + vat;

        return resultTemplate(

            "VAT = B \u00D7 r \u00F7 100; Total = B + VAT",

            `Step 1 \u2014 Calculate VAT:<br>VAT = B \u00D7 r \u00F7 100 = ${money(amount)} \u00D7 ${number(rate)} \u00F7 100 = ${money(vat)}<br><br>Step 2 \u2014 Add VAT to the original amount:<br>Total = B + VAT = ${money(amount)} + ${money(vat)} = ${money(total)}` ,

            `VAT: ${money(vat)}<br>
             Total: ${money(total)}`
        );

    }

},


"bad-debt": {

    title: "Bad Debt",

    fields: [
        ["receivable", "Customer Receivable (NGN)", "number"],
        ["bad", "Amount Irrecoverable (NGN)", "number"]
    ],

    formula:
        "AR_remaining = AR \u2212 BD",

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

            "AR_remaining = AR \u2212 BD",

            `Step 1 \u2014 Identify the original receivable:<br>AR = ${money(receivable)}<br><br>Step 2 \u2014 Deduct the amount confirmed irrecoverable:<br>AR_remaining = AR \u2212 BD = ${money(receivable)} \u2212 ${money(bad)} = ${money(remaining)}<br><br>Step 3 \u2014 Recognise the bad debt expense:<br>Bad Debt Expense = ${money(bad)}` ,

            `Bad Debt Expense: ${money(bad)}<br>
             Remaining Receivable: ${money(remaining)}`
        );

    }

},


"cogs": {

    title: "Cost of Goods Sold",

    fields: [
        ["opening", "Opening Inventory (NGN)", "number"],
        ["purchases", "Purchases (NGN)", "number"],
        ["closing", "Closing Inventory (NGN)", "number"]
    ],

    formula:
        "COGS = OI + P \u2212 CI",

    calculate(v) {

        const opening = getNumber(v, "opening");
        const purchases = getNumber(v, "purchases");
        const closing = getNumber(v, "closing");

        const cogs =
            opening + purchases - closing;

        return resultTemplate(

            "COGS = OI + P \u2212 CI",

            `
            = ${money(opening)}
              + ${money(purchases)}
              - ${money(closing)}
            `,

            money(cogs)
        );

    }

}
,
"ias36-impairment": {

    title: "IAS 36 Impairment Test",

    fields: [
        ["carryingAmount", "Carrying Amount (NGN)", "number"],
        ["fairValue", "Fair Value (NGN)", "number"],
        ["costsDisposal", "Costs of Disposal (NGN)", "number"],
        ["valueInUse", "Value in Use (NGN)", "number"]
    ],

    formula:
        "Recoverable Amount = Higher of Fair Value Less Costs of Disposal (FVLCD) and Value in Use",

    calculate(v) {

        const carryingAmount = getNumber(v, "carryingAmount");
        const fairValue = getNumber(v, "fairValue");
        const costsDisposal = getNumber(v, "costsDisposal");
        const valueInUse = getNumber(v, "valueInUse");

        if (![carryingAmount, fairValue, costsDisposal, valueInUse].every(Number.isFinite)) {
            return errorMessage("Enter valid numerical values for all IAS 36 inputs.");
        }

        if (carryingAmount < 0 || fairValue < 0 || costsDisposal < 0 || valueInUse < 0) {
            return errorMessage("IAS 36 amounts cannot be negative.");
        }

        const fvlcd = fairValue - costsDisposal;
        const recoverableAmount = Math.max(fvlcd, valueInUse);
        const impairmentLoss = Math.max(0, carryingAmount - recoverableAmount);

        const comparison = carryingAmount > recoverableAmount
            ? `The carrying amount exceeds the recoverable amount by ${money(impairmentLoss)}.`
            : "The carrying amount does not exceed the recoverable amount, so no impairment loss is recognised.";

        const journal = impairmentLoss > 0
            ? `<strong>Journal Entry</strong><br>Dr Impairment Loss ${money(impairmentLoss)}<br>Cr Accumulated Impairment Loss / Asset ${money(impairmentLoss)}<br><br><small>For revalued assets, the accounting treatment may involve the revaluation surplus and OCI under the applicable IFRS requirements.</small>`
            : "No impairment journal entry is required because no impairment loss arises.";

        return resultTemplate(
            "RA = max(FVLCD, VIU); Impairment Loss = max(0, CA \u2212 RA)",
            `
            Fair Value Less Costs of Disposal (FVLCD)<br>
            = ${money(fairValue)} - ${money(costsDisposal)}<br>
            = ${money(fvlcd)}<br><br>

            Recoverable Amount<br>
            = Higher of ${money(fvlcd)} and ${money(valueInUse)}<br>
            = ${money(recoverableAmount)}<br><br>

            Carrying Amount = ${money(carryingAmount)}<br>
            Impairment Loss<br>
            = ${money(carryingAmount)} - ${money(recoverableAmount)}<br>
            = ${money(impairmentLoss)}<br><br>

            ${journal}
            `,
            impairmentLoss > 0
                ? `Impairment Loss = ${money(impairmentLoss)}`
                : "No Impairment Loss",
            comparison
        );

    }

},


"ifrs15-performance-obligations": {

    title: "IFRS 15 Multiple Performance Obligations",

    fields: [
        ["transactionPrice", "Total Transaction Price (NGN)", "number"],
        ["obligationCount", "Number of Performance Obligations", "select"],
        ["ssp1", "Obligation 1 - Stand-Alone Selling Price (NGN)", "number"],
        ["status1", "Obligation 1 - Status", "select"],
        ["percent1", "Obligation 1 - Percentage Satisfied (%)", "number"],
        ["ssp2", "Obligation 2 - Stand-Alone Selling Price (NGN)", "number"],
        ["status2", "Obligation 2 - Status", "select"],
        ["percent2", "Obligation 2 - Percentage Satisfied (%)", "number"],
        ["ssp3", "Obligation 3 - Stand-Alone Selling Price (NGN)", "number"],
        ["status3", "Obligation 3 - Status", "select"],
        ["percent3", "Obligation 3 - Percentage Satisfied (%)", "number"],
        ["ssp4", "Obligation 4 - Stand-Alone Selling Price (NGN)", "number"],
        ["status4", "Obligation 4 - Status", "select"],
        ["percent4", "Obligation 4 - Percentage Satisfied (%)", "number"],
        ["ssp5", "Obligation 5 - Stand-Alone Selling Price (NGN)", "number"],
        ["status5", "Obligation 5 - Status", "select"],
        ["percent5", "Obligation 5 - Percentage Satisfied (%)", "number"]
    ],

    options: {
        obligationCount: [
            ["2", "2 Obligations"],
            ["3", "3 Obligations"],
            ["4", "4 Obligations"],
            ["5", "5 Obligations"]
        ],
        status1: [["satisfied", "Satisfied"], ["partial", "Partially Satisfied"], ["not-satisfied", "Not Satisfied"]],
        status2: [["satisfied", "Satisfied"], ["partial", "Partially Satisfied"], ["not-satisfied", "Not Satisfied"]],
        status3: [["satisfied", "Satisfied"], ["partial", "Partially Satisfied"], ["not-satisfied", "Not Satisfied"]],
        status4: [["satisfied", "Satisfied"], ["partial", "Partially Satisfied"], ["not-satisfied", "Not Satisfied"]],
        status5: [["satisfied", "Satisfied"], ["partial", "Partially Satisfied"], ["not-satisfied", "Not Satisfied"]]
    },

    formula:
        "AR\u1D62 = (SSP\u1D62 \u00F7 \u03A3SSP) \u00D7 TP",

    calculate(v) {

        const transactionPrice = getNumber(v, "transactionPrice");
        const count = Number(v.obligationCount || 2);

        if (!Number.isFinite(transactionPrice) || transactionPrice < 0) {
            return errorMessage("Enter a valid non-negative transaction price.");
        }

        const rows = [];
        let totalSSP = 0;

        for (let i = 1; i <= count; i++) {
            const ssp = Number(v[`ssp${i}`]);
            const status = v[`status${i}`] || "not-satisfied";
            const percentSatisfied = Number(v[`percent${i}`] || 0);

            if (!Number.isFinite(ssp) || ssp <= 0) {
                return errorMessage(`Enter a valid stand-alone selling price for Obligation ${i}.`);
            }

            if (status === "partial" && (!Number.isFinite(percentSatisfied) || percentSatisfied < 0 || percentSatisfied > 100)) {
                return errorMessage(`Enter a percentage between 0 and 100 for Obligation ${i}.`);
            }

            totalSSP += ssp;
            rows.push({
                number: i,
                ssp,
                status,
                percentSatisfied
            });
        }

        let recognised = 0;
        let remaining = 0;

        rows.forEach(row => {
            row.allocated = (row.ssp / totalSSP) * transactionPrice;

            if (row.status === "satisfied") {
                row.recognised = row.allocated;
            } else if (row.status === "partial") {
                row.recognised =
                    row.allocated * (row.percentSatisfied / 100);
            } else {
                row.recognised = 0;
            }

            row.remaining =
                row.allocated - row.recognised;

            recognised += row.recognised;
            remaining += row.remaining;
        });

        const allocationSteps = rows.map(row => {
            const recognisedPercent = row.status === "satisfied" ? 100 : row.status === "partial" ? row.percentSatisfied : 0;
            const statusText = row.status === "satisfied" ? "100% satisfied" : row.status === "partial" ? `${number(row.percentSatisfied)}% satisfied` : "not yet satisfied";
            return `Obligation ${row.number}: Allocated Revenue = (${money(row.ssp)} \u00F7 ${money(totalSSP)}) \u00D7 ${money(transactionPrice)} = ${money(row.allocated)}; Recognised Revenue = ${money(row.allocated)} \u00D7 ${number(recognisedPercent)}% = ${money(row.recognised)} (${statusText}).`;
        }).join("<br><br>");

        const tableRows = rows.map(row => `
            <tr>
                <td style="padding:8px; border:1px solid #999;">${row.number}</td>
                <td style="padding:8px; border:1px solid #999;">${money(row.ssp)}</td>
                <td style="padding:8px; border:1px solid #999;">${row.status === "satisfied" ? "Satisfied" : row.status === "partial" ? "Partially Satisfied" : "Not Satisfied"}</td>
                <td style="padding:8px; border:1px solid #999;">${row.status === "partial" ? number(row.percentSatisfied) + "%" : row.status === "satisfied" ? "100%" : "0%"}</td>
                <td style="padding:8px; border:1px solid #999;">${money(row.allocated)}</td>
                <td style="padding:8px; border:1px solid #999;">${money(row.recognised)}</td>
            </tr>
        `).join("");

        return resultTemplate(
            "AR\u1D62 = (SSP\u1D62 \u00F7 \u03A3SSP) \u00D7 TP; RR\u1D62 = AR\u1D62 \u00D7 Satisfaction %",
            `Step 1 \u2014 Add the stand-alone selling prices:<br>\u03A3SSP = ${rows.map(row => money(row.ssp)).join(" + ")} = ${money(totalSSP)}<br><br>Step 2 \u2014 Allocate the transaction price in proportion to each obligation\u2019s stand-alone selling price:<br>AR\u1D62 = (SSP\u1D62 \u00F7 \u03A3SSP) \u00D7 TP<br><br>${allocationSteps}<br><br>Step 3 \u2014 Total the recognised and unrecognised revenue:<br>Recognised Revenue = ${money(recognised)}<br>Revenue Not Yet Recognised = ${money(remaining)}<br><br>
            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; margin-top:10px;">
                    <thead>
                        <tr>
                            <th style="padding:8px; border:1px solid #999;">Obligation</th>
                            <th style="padding:8px; border:1px solid #999;">SSP</th>
                            <th style="padding:8px; border:1px solid #999;">Status</th>
                            <th style="padding:8px; border:1px solid #999;">% Satisfied</th>
                            <th style="padding:8px; border:1px solid #999;">Allocated Revenue</th>
                            <th style="padding:8px; border:1px solid #999;">Revenue Recognised</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>
            <br>
            Revenue Recognised = ${money(recognised)}<br>
            Revenue Not Yet Recognised = ${money(remaining)}
            `,
            `Recognised Revenue = ${money(recognised)}<br>Remaining Contract Revenue = ${money(remaining)}`,
            "Revenue is recognised based on the satisfaction status of each performance obligation. For partially satisfied obligations, only the satisfied percentage of the allocated revenue is recognised."
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
    fields: [["principal", "Principal (NGN)", "number"], ["rate", "Interest Rate (%)", "number"], ["time", "Time (Years)", "number"]],
    formula: "\\(I=Prt,\\quad A=P+I=P(1+rt)\\)",
    calculate(v) {
        const P=getNumber(v,"principal"), ratePct=getNumber(v,"rate"), r=ratePct/100, t=getNumber(v,"time");
        if (![P,ratePct,t].every(Number.isFinite) || P<0 || ratePct<0 || t<0) return errorMessage("Enter valid non-negative principal, rate and time values.");
        const I=P*r*t, A=P+I;
        const working=`Step 1 \u2014 Convert the rate to a decimal:<br>r = ${number(ratePct)}% \u00F7 100 = ${compactNumber(r)}<br><br>Step 2 \u2014 Use the simple-interest formula:<br>I = P \u00D7 r \u00D7 t<br><br>Step 3 \u2014 Substitute the values:<br>I = ${money(P)} \u00D7 ${compactNumber(r)} \u00D7 ${number(t)} = ${money(I)}<br><br>Step 4 \u2014 Calculate the total amount:<br>A = P + I = ${money(P)} + ${money(I)} = ${money(A)}`;
        return resultTemplate("\\(I=Prt,\\quad A=P+I\\)",working,`Interest: ${money(I)}<br>Total amount: ${money(A)}`,"Simple interest is calculated on the original principal only; previously earned interest is not added to the base.");
    }
},
"compound-interest": {
    title: "Compound Interest",
    fields: [["principal", "Principal (NGN)", "number"], ["rate", "Annual Interest Rate (%)", "number"], ["time", "Time (Years)", "number"], ["frequency", "Compounding Frequency", "select"]],
    options: { frequency: [["1","Annual"],["2","Semi-Annual"],["4","Quarterly"],["12","Monthly"],["365","Daily"],["continuous","Continuous"]] },
    formula: "Select the compounding frequency to display the matching formula.",
    calculate(v) {
        const P=getNumber(v,"principal"), ratePct=getNumber(v,"rate"), r=ratePct/100, t=getNumber(v,"time");
        if (![P,ratePct,t].every(Number.isFinite) || P<0 || ratePct<0 || t<0) return errorMessage("Enter valid non-negative principal, rate and time values.");
        let A, formula, working;
        if (v.frequency === "continuous") {
            A=P*Math.exp(r*t); formula="\\(A=Pe^{rt}\\) (continuous compounding)";
            working=`Step 1 \u2014 Convert the annual rate to a decimal:<br>r = ${number(ratePct)}% \u00F7 100 = ${compactNumber(r)}<br><br>Step 2 \u2014 Use the continuous-compounding formula:<br>A = Pe^(rt)<br><br>Step 3 \u2014 Substitute the values:<br>A = ${money(P)} \u00D7 e^(${compactNumber(r)} \u00D7 ${number(t)})<br><br>Step 4 \u2014 Calculate the amount:<br>A = ${money(A)}`;
        } else {
            const n=Number(v.frequency);
            if (!Number.isFinite(n) || n<=0) return errorMessage("Choose a valid compounding frequency.");
            A=P*Math.pow(1+r/n,n*t);
            const frequencyName={1:"annually",2:"semi-annually",4:"quarterly",12:"monthly",365:"daily"}[n] || `${n} times per year`;
            formula="\\(A=P\\left(1+\\frac{r}{n}\\right)^{nt}\\) (periodic compounding)";
            working=`Step 1 \u2014 Convert the annual rate to a decimal:<br>r = ${number(ratePct)}% \u00F7 100 = ${compactNumber(r)}<br><br>Step 2 \u2014 Identify the compounding frequency:<br>n = ${n} times per year (${frequencyName})<br><br>Step 3 \u2014 Use the periodic-compounding formula:<br>A = P(1 + r/n)^(nt)<br><br>Step 4 \u2014 Substitute the values:<br>A = ${money(P)} \u00D7 (1 + ${compactNumber(r)}/${n})^(${n} \u00D7 ${number(t)})<br><br>Step 5 \u2014 Calculate the amount:<br>A = ${money(A)}`;
        }
        const interest=A-P;
        working += `<br><br>Final step \u2014 Find compound interest:<br>Interest = A \u2212 P = ${money(A)} \u2212 ${money(P)} = ${money(interest)}`;
        return resultTemplate(formula,working,`Compound amount: ${money(A)}<br>Compound interest: ${money(interest)}`,v.frequency === "continuous" ? "Continuous compounding assumes interest is compounded continuously." : "Periodic compounding adds interest to the balance at each compounding interval.");
    }
},
"present-value": {
    title: "Present Value",
    fields: [["future", "Future Value (NGN)", "number"], ["rate", "Interest Rate (%)", "number"], ["time", "Time (Years)", "number"]],
    formula: "\\(PV=\\frac{FV}{(1+r)^t}\\)",
    calculate(v) {
        const FV=getNumber(v,"future"), ratePct=getNumber(v,"rate"), r=ratePct/100, t=getNumber(v,"time");
        if (![FV,ratePct,t].every(Number.isFinite) || FV<0 || ratePct<0 || t<0) return errorMessage("Enter valid non-negative future value, rate and time.");
        const denominator=Math.pow(1+r,t), PV=FV/denominator;
        return resultTemplate("\\(PV=\\frac{FV}{(1+r)^t}\\)",`Step 1 \u2014 Convert the rate to a decimal:<br>r = ${number(ratePct)}% \u00F7 100 = ${compactNumber(r)}<br><br>Step 2 \u2014 Calculate the discount factor:<br>(1 + r)^t = (1 + ${compactNumber(r)})^${number(t)} = ${compactNumber(denominator)}<br><br>Step 3 \u2014 Divide the future value by the discount factor:<br>PV = ${money(FV)} \u00F7 ${compactNumber(denominator)} = ${money(PV)}`,money(PV),"Present value estimates what a future amount is worth today at the stated rate.");
    }
},
"future-value": {
    title: "Future Value",
    fields: [["present", "Present Value (NGN)", "number"], ["rate", "Interest Rate (%)", "number"], ["time", "Time (Years)", "number"]],
    formula: "\\(FV=PV(1+r)^t\\)",
    calculate(v) {
        const PV=getNumber(v,"present"), ratePct=getNumber(v,"rate"), r=ratePct/100, t=getNumber(v,"time");
        if (![PV,ratePct,t].every(Number.isFinite) || PV<0 || ratePct<0 || t<0) return errorMessage("Enter valid non-negative present value, rate and time.");
        const factor=Math.pow(1+r,t), FV=PV*factor;
        return resultTemplate("\\(FV=PV(1+r)^t\\)",`Step 1 \u2014 Convert the rate to a decimal:<br>r = ${number(ratePct)}% \u00F7 100 = ${compactNumber(r)}<br><br>Step 2 \u2014 Calculate the growth factor:<br>(1 + r)^t = (1 + ${compactNumber(r)})^${number(t)} = ${compactNumber(factor)}<br><br>Step 3 \u2014 Multiply the present value by the growth factor:<br>FV = ${money(PV)} \u00D7 ${compactNumber(factor)} = ${money(FV)}`,money(FV),"Future value estimates how much the present amount will grow to under the stated rate and time assumptions.");
    }
},
"annuity": {

    title: "Annuity Calculator",

    fields: [
        ["annuityType", "Annuity Type", "select"],
        ["payment", "Periodic Payment (NGN)", "number"],
        ["rate", "Interest Rate per Period (%)", "number"],
        ["periods", "Number of Periods", "number"]
    ],

    options: {
        annuityType: [
            ["future", "Future Value of an Annuity (FVA)"],
            ["present", "Present Value of an Annuity (PVA)"]
        ]
    },

    formula: "Choose Future Value or Present Value of an Annuity.",

    calculate(v) {
        const PMT = getNumber(v, "payment");
        const r = getNumber(v, "rate") / 100;
        const n = getNumber(v, "periods");
        const type = v.annuityType || "future";
        if (PMT < 0 || r < 0 || n <= 0 || !Number.isFinite(n)) {
            return errorMessage("Enter a non-negative payment and rate, and a number of periods greater than zero.");
        }
        const label = type === "present" ? "Present Value of an Annuity (PVA)" : "Future Value of an Annuity (FVA)";
        const formula = type === "present"
            ? "PVA = PMT \u00D7 [1 \u2212 1 / (1 + r)^n] / r"
            : "FVA = PMT \u00D7 [(1 + r)^n \u2212 1] / r";
        let answer, working;
        if (r === 0) {
            answer = PMT * n;
            working = `Since the interest rate is 0%, use the zero-rate form:<br><br><strong>Formula</strong><br>Value = PMT \u00D7 n<br><br><strong>Substitute</strong><br>${money(PMT)} \u00D7 ${number(n)} = ${money(answer)}<br><br>With no interest, the value is simply the total of all payments.`;
        } else if (type === "present") {
            answer = PMT * (1 - Math.pow(1 + r, -n)) / r;
            working = `<strong>Formula:</strong> ${formula}<br><br><strong>Substitute:</strong> PVA = ${money(PMT)} \u00D7 [1 \u2212 1 / (1 + ${compactNumber(r)})^${compactNumber(n)}] / ${compactNumber(r)}<br><br><strong>Calculated value:</strong> ${money(answer)}<br><br>This is the value today of the future payments.`;
        } else {
            answer = PMT * (Math.pow(1 + r, n) - 1) / r;
            working = `<strong>Formula:</strong> ${formula}<br><br><strong>Substitute:</strong> FVA = ${money(PMT)} \u00D7 [(1 + ${compactNumber(r)})<sup>${compactNumber(n)}</sup> \u2212 1] / ${compactNumber(r)}<br><br><strong>Calculated value:</strong> ${money(answer)}<br><br>This is the accumulated value of the regular payments at the end of the period.`;
        }
        return resultTemplate(label, working, money(answer), type === "present" ? "This is the value today of the specified regular future payments." : "This is the accumulated value of the specified regular payments at the end of the period.");
    }
},

"payment": {
    title: "Loan Payment / Installment",
    fields: [["principal", "Loan Principal (NGN)", "number"], ["rate", "Interest Rate per Period (%)", "number"], ["periods", "Number of Payments", "number"]],
    formula: "\\(PMT=\\frac{Pr(1+r)^n}{(1+r)^n-1}\\)",
    calculate(v) {
        const P=getNumber(v,"principal"), ratePct=getNumber(v,"rate"), r=ratePct/100, n=getNumber(v,"periods");
        if (![P,ratePct,n].every(Number.isFinite) || P<0 || ratePct<0 || !Number.isInteger(n) || n<=0) return errorMessage("Enter a non-negative loan and interest rate, and a positive whole number of payments.");
        const factor=Math.pow(1+r,n), payment=r===0?P/n:P*r*factor/(factor-1);
        const working=r===0 ? `Step 1 \u2014 The interest rate is 0%, so divide the principal equally:<br>PMT = P \u00F7 n<br><br>Step 2 \u2014 Substitute:<br>PMT = ${money(P)} \u00F7 ${n} = ${money(payment)}` : `Step 1 \u2014 Convert the rate to a decimal:<br>r = ${number(ratePct)}% \u00F7 100 = ${compactNumber(r)}<br><br>Step 2 \u2014 Calculate the growth factor:<br>(1 + r)^n = (1 + ${compactNumber(r)})^${n} = ${compactNumber(factor)}<br><br>Step 3 \u2014 Substitute into the loan-payment formula:<br>PMT = [${money(P)} \u00D7 ${compactNumber(r)} \u00D7 ${compactNumber(factor)}] \u00F7 [${compactNumber(factor)} \u2212 1]<br><br>Step 4 \u2014 Calculate the regular payment:<br>PMT = ${money(payment)}`;
        return resultTemplate(r===0?"\\(PMT=P/n\\)":"\\(PMT=\\frac{Pr(1+r)^n}{(1+r)^n-1}\\)",working,`${money(payment)} per payment`,"This assumes equal payments made at the end of each period, with the rate expressed per payment period.");
    }
},
"sinking-fund": {
    title: "Sinking Fund",
    fields: [["future", "Required Future Amount (NGN)", "number"], ["rate", "Interest Rate per Period (%)", "number"], ["periods", "Number of Periods", "number"]],
    formula: "\\(PMT=\\frac{FV\\,r}{(1+r)^n-1}\\)",
    calculate(v) {
        const FV=getNumber(v,"future"), ratePct=getNumber(v,"rate"), r=ratePct/100, n=getNumber(v,"periods");
        if (![FV,ratePct,n].every(Number.isFinite) || FV<0 || ratePct<0 || !Number.isInteger(n) || n<=0) return errorMessage("Enter a non-negative future amount and rate, and a positive whole number of periods.");
        const factor=Math.pow(1+r,n), pmt=r===0?FV/n:FV*r/(factor-1);
        const working=r===0 ? `Step 1 \u2014 With a 0% interest rate, divide the target equally across the periods:<br>PMT = FV \u00F7 n<br><br>Step 2 \u2014 Substitute:<br>PMT = ${money(FV)} \u00F7 ${n} = ${money(pmt)}` : `Step 1 \u2014 Convert the rate to a decimal:<br>r = ${number(ratePct)}% \u00F7 100 = ${compactNumber(r)}<br><br>Step 2 \u2014 Calculate (1 + r)^n:<br>(1 + ${compactNumber(r)})^${n} = ${compactNumber(factor)}<br><br>Step 3 \u2014 Substitute into the sinking-fund formula:<br>PMT = [${money(FV)} \u00D7 ${compactNumber(r)}] \u00F7 [${compactNumber(factor)} \u2212 1]<br><br>Step 4 \u2014 Calculate the required deposit each period:<br>PMT = ${money(pmt)}`;
        return resultTemplate(r===0?"\\(PMT=FV/n\\)":"\\(PMT=\\frac{FV\\,r}{(1+r)^n-1}\\)",working,money(pmt),"This is the regular end-of-period deposit needed to reach the target, assuming the stated rate applies each period.");
    }
},
"loan-amortization": {
    title: "Loan Amortization",
    fields: [["principal", "Loan Principal (NGN)", "number"], ["rate", "Interest Rate per Period (%)", "number"], ["periods", "Number of Periods", "number"]],
    formula: "\\(PMT=\\frac{Pr(1+r)^n}{(1+r)^n-1}\\)",
    calculate(v) {
        const P=getNumber(v,"principal"), ratePct=getNumber(v,"rate"), r=ratePct/100, n=getNumber(v,"periods");
        if (![P,ratePct,n].every(Number.isFinite) || P<0 || ratePct<0 || !Number.isInteger(n) || n<=0) return errorMessage("Enter a non-negative principal and rate, and a positive whole number of periods.");
        const factor=Math.pow(1+r,n), payment=r===0?P/n:P*r*factor/(factor-1), total=payment*n, interest=total-P;
        const working=r===0 ? `Step 1 \u2014 Interest rate is 0%, so payment = principal \u00F7 number of periods:<br>PMT = ${money(P)} \u00F7 ${n} = ${money(payment)}` : `Step 1 \u2014 Convert the rate to a decimal:<br>r = ${number(ratePct)}% \u00F7 100 = ${compactNumber(r)}<br><br>Step 2 \u2014 Calculate (1 + r)^n:<br>(1 + ${compactNumber(r)})^${n} = ${compactNumber(factor)}<br><br>Step 3 \u2014 Calculate the regular payment:<br>PMT = [${money(P)} \u00D7 ${compactNumber(r)} \u00D7 ${compactNumber(factor)}] \u00F7 [${compactNumber(factor)} \u2212 1] = ${money(payment)}`;
        return resultTemplate(r===0?"\\(PMT=P/n\\)":"\\(PMT=\\frac{Pr(1+r)^n}{(1+r)^n-1}\\)",`${working}<br><br>Step ${r===0?2:4} \u2014 Calculate total payments:<br>Total = PMT \u00D7 n = ${money(payment)} \u00D7 ${n} = ${money(total)}<br><br>Step ${r===0?3:5} \u2014 Calculate total interest:<br>Interest = Total payments \u2212 Principal = ${money(total)} \u2212 ${money(P)} = ${money(interest)}`,`Payment per period: ${money(payment)}<br>Total payments: ${money(total)}<br>Total interest: ${money(interest)}`,"The calculation assumes a fixed periodic rate and equal payments throughout the loan term.");
    }
},


/* =========================================================
   MATHEMATICS SECTION
   (Quadratic Equation and the mathematics calculators below)
========================================================= */

"quadratic-equation": {
    title: "Quadratic Equation",
    fields: [["a", "Coefficient a", "number"], ["b", "Coefficient b", "number"], ["c", "Coefficient c", "number"]],
    formula: "\\(ax^2+bx+c=0,\\quad x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}\\)",
    calculate(v) {
        const a = getNumber(v, "a"), b = getNumber(v, "b"), c = getNumber(v, "c");
        if (![a,b,c].every(Number.isFinite)) return errorMessage("Enter valid numbers for a, b and c.");
        if (a === 0) return errorMessage("The coefficient a cannot be zero for a quadratic equation.");
        const D = b*b - 4*a*c;
        const discWorking = `Step 1 \u2014 Identify the coefficients:<br>a = ${number(a)}, b = ${number(b)}, c = ${number(c)}<br><br>Step 2 \u2014 Calculate the discriminant, D = b\u00B2 \u2212 4ac:<br>D = (${number(b)})\u00B2 \u2212 4(${number(a)})(${number(c)})<br>D = ${number(b*b)} \u2212 ${number(4*a*c)} = ${number(D)}`;
        if (D < 0) {
            const realPart = -b/(2*a), imagPart = Math.sqrt(-D)/(2*a);
            return resultTemplate("\\(D=b^2-4ac\\)", `${discWorking}<br><br>Step 3 \u2014 Interpret the discriminant:<br>Because D is negative, there are no real roots. The two roots are complex.`, `No real roots.<br>Complex roots: x = ${number(realPart)} \u00B1 ${number(imagPart)}i`, "A negative discriminant means the square root in the quadratic formula is not real.");
        }
        const sqrtD = Math.sqrt(D), x1=(-b+sqrtD)/(2*a), x2=(-b-sqrtD)/(2*a);
        const rootWork = `${discWorking}<br><br>Step 3 \u2014 Substitute into the quadratic formula:<br>x = [\u2212(${number(b)}) \u00B1 \u221A(${number(D)})] / [2(${number(a)})]<br><br>Step 4 \u2014 Simplify:<br>x = [${number(-b)} \u00B1 ${number(sqrtD)}] / ${number(2*a)}<br><br>Step 5 \u2014 Calculate both roots:<br>x\u2081 = (${number(-b)} + ${number(sqrtD)}) / ${number(2*a)} = ${number(x1)}<br>x\u2082 = (${number(-b)} \u2212 ${number(sqrtD)}) / ${number(2*a)} = ${number(x2)}`;
        return resultTemplate("\\(x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}\\)", rootWork, D === 0 ? `Repeated root: \\(x=${number(x1)}\\)` : `\\(x_1=${number(x1)},\\quad x_2=${number(x2)}\\)`, D === 0 ? "The discriminant is zero, so both roots are equal." : "The equation has two real roots. Substitute either root into the original equation to check the result.");
    }
},
"simple-equation": {
    title: "Simple Linear Equation",
    fields: [["a", "Coefficient a", "number"], ["b", "Constant b", "number"]],
    formula: "\\(ax+b=0,\\quad x=-\\frac{b}{a}\\)",
    calculate(v) {
        const a=getNumber(v,"a"), b=getNumber(v,"b");
        if (![a,b].every(Number.isFinite)) return errorMessage("Enter valid values for a and b.");
        if (a===0) return errorMessage("Coefficient a cannot be zero. If a = 0, the equation is not a unique linear equation.");
        const x=-b/a;
        return resultTemplate("\\(ax+b=0,\\quad x=-\\frac{b}{a}\\)",`Step 1 \u2014 Start with the equation:<br>${number(a)}x ${b<0?"\u2212":"+"} ${number(Math.abs(b))} = 0<br><br>Step 2 \u2014 Move the constant to the other side:<br>${number(a)}x = ${number(-b)}<br><br>Step 3 \u2014 Divide both sides by the coefficient of x:<br>x = ${number(-b)} \u00F7 ${number(a)}<br><br>Step 4 \u2014 Calculate x:<br>x = ${number(x)}`,`\\(x=${number(x)}\\)`,"Check by substituting the value of x into the original equation; the left-hand side should equal zero.");
    }
},
"percentage-change": {
    title: "Percentage Change",
    fields: [["old", "Original Value", "number"], ["new", "New Value", "number"]],
    formula: "\\(\\text{Percentage change}=\\frac{\\text{New}-\\text{Old}}{\\text{Old}}\\times100\\%\\)",
    calculate(v) {
        const oldValue=getNumber(v,"old"), newValue=getNumber(v,"new");
        if (![oldValue,newValue].every(Number.isFinite)) return errorMessage("Enter valid original and new values.");
        if (oldValue===0) return errorMessage("Original value cannot be zero because it is the denominator.");
        const difference=newValue-oldValue, change=(difference/oldValue)*100;
        const direction=difference>0?"increase":difference<0?"decrease":"no change";
        return resultTemplate("\\(\\frac{\\text{New}-\\text{Old}}{\\text{Old}}\\times100\\%\\)",`Step 1 \u2014 Find the change:<br>Change = New value \u2212 Original value = ${number(newValue)} \u2212 ${number(oldValue)} = ${number(difference)}<br><br>Step 2 \u2014 Divide the change by the original value:<br>${number(difference)} \u00F7 ${number(oldValue)} = ${compactNumber(difference/oldValue)}<br><br>Step 3 \u2014 Convert the ratio to a percentage:<br>${compactNumber(difference/oldValue)} \u00D7 100% = ${percent(change)}<br><br>Step 4 \u2014 Interpret the sign:<br>This is a ${direction} relative to the original value.`,percent(change),`The value shows a ${direction} of ${Math.abs(change).toFixed(2)}% from the original figure.`);
    }
},
"permutation": {

    title: "Permutation",

    fields: [
        ["n", "n", "number"],
        ["r", "r", "number"]
    ],

    formula:
        "nPr = n! / (n - r)!",

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
                "n and r must be whole numbers with n >= r."
            );
        }

        const answer =
            permutations(n, r);

        return resultTemplate(

            "nPr = n! / (n - r)!",

            `
            = ${n}! / (${n} - ${r})!
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
        "nCr = n! / [r!(n - r)!]",

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
                "n and r must be whole numbers with n >= r."
            );
        }

        const answer =
            combinations(n, r);

        return resultTemplate(

            "nCr = n! / [r!(n - r)!]",

            `
            = ${n}! /
              [${r}!(${n} - ${r})!]
            `,

            number(answer)
        );

    }

},


"distance": {

    title: "Distance Between Two Points",

    fields: [
        ["x1", "x1", "number"],
        ["y1", "y1", "number"],
        ["x2", "x2", "number"],
        ["y2", "y2", "number"]
    ],

    formula:
        "d = sqrt[(x2 - x1)2 + (y2 - y1)2]",

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
            "d = sqrt[(x2 - x1)2 + (y2 - y1)2]",
            `d = ${number(d)}`,
            number(d)
        );

    }

},


"midpoint": {

    title: "Midpoint",

    fields: [
        ["x1", "x1", "number"],
        ["y1", "y1", "number"],
        ["x2", "x2", "number"],
        ["y2", "y2", "number"]
    ],

    formula:
        "M = ((x1+x2)/2, (y1+y2)/2)",

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
            "M = ((x1+x2)/2, (y1+y2)/2)",
            `M = (${number(x)}, ${number(y)})`,
            `(${number(x)}, ${number(y)})`
        );

    }

},


"gradient": {

    title: "Gradient",

    fields: [
        ["x1", "x1", "number"],
        ["y1", "y1", "number"],
        ["x2", "x2", "number"],
        ["y2", "y2", "number"]
    ],

    formula:
        "m = (y2 - y1) / (x2 - x1)",

    calculate(v) {

        const x1 = getNumber(v, "x1");
        const y1 = getNumber(v, "y1");
        const x2 = getNumber(v, "x2");
        const y2 = getNumber(v, "y2");

        if (x2 === x1) {
            return errorMessage(
                "The gradient is undefined because x2 - x1 = 0."
            );
        }

        const m =
            (y2 - y1) / (x2 - x1);

        return resultTemplate(
            "m = (y2 - y1) / (x2 - x1)",
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
        "Area = pir2",

    calculate(v) {

        const r =
            getNumber(v, "radius");

        const area =
            Math.PI * r * r;

        return resultTemplate(
            "Area = pir2",
            `pi * ${number(r)}2`,
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

            `${v.ratio}(${angle} degrees)`,

            `Angle converted to radians:
             ${number(radians, 6)}`,

            number(answer, 6)
        );

    }

},


"indices": {
    title: "Indices / Exponents",
    fields: [["indexExpression", "Expression involving indices", "text"]],
    formula: "Use the law of indices that matches the expression.",
    calculate(v) {
        return calculateIndicesExpression(v.indexExpression);
    }
},

"logarithm": {

    title: "Logarithms",

    fields: [
        ["logExpression", "Logarithm Expression", "text"]
    ],

    formula:
        "log_b(x) = ln(x) / ln(b). You can combine multiple logarithms using +, -, *, and /.",

    calculate(v) {
        return calculateLogExpression(v.logExpression);
    }

},


"simultaneous-equations": {
    title: "Simultaneous Equations",
    fields: [["a1", "a\u2081 in a\u2081x + b\u2081y = c\u2081", "number"], ["b1", "b\u2081 in a\u2081x + b\u2081y = c\u2081", "number"], ["c1", "c\u2081 in a\u2081x + b\u2081y = c\u2081", "number"], ["a2", "a\u2082 in a\u2082x + b\u2082y = c\u2082", "number"], ["b2", "b\u2082 in a\u2082x + b\u2082y = c\u2082", "number"], ["c2", "c\u2082 in a\u2082x + b\u2082y = c\u2082", "number"]],
    formula: "a\u2081x + b\u2081y = c\u2081; a\u2082x + b\u2082y = c\u2082 \u2014 Cramer\u2019s rule",
    calculate(v) {
        const a1=getNumber(v,"a1"), b1=getNumber(v,"b1"), c1=getNumber(v,"c1"), a2=getNumber(v,"a2"), b2=getNumber(v,"b2"), c2=getNumber(v,"c2");
        if (![a1,b1,c1,a2,b2,c2].every(Number.isFinite)) return errorMessage("Enter valid numbers in all six fields.");
        const D=a1*b2-a2*b1, Dx=c1*b2-c2*b1, Dy=a1*c2-a2*c1;
        const eq1 = `${number(a1)}x ${b1 < 0 ? "\u2212" : "+"} ${number(Math.abs(b1))}y = ${number(c1)}`;
        const eq2 = `${number(a2)}x ${b2 < 0 ? "\u2212" : "+"} ${number(Math.abs(b2))}y = ${number(c2)}`;
        if (Math.abs(D) < 1e-12) {
            const sameLine = Math.abs(a1*c2-a2*c1)<1e-12 && Math.abs(b1*c2-b2*c1)<1e-12;
            return resultTemplate("D = a\u2081b\u2082 \u2212 a\u2082b\u2081", `Step 1 \u2014 Write the equations:<br>${eq1}<br>${eq2}<br><br>Step 2 \u2014 Calculate the determinant:<br>D = (${number(a1)} \u00D7 ${number(b2)}) \u2212 (${number(a2)} \u00D7 ${number(b1)}) = ${number(D)}<br><br>Step 3 \u2014 Interpret the result:<br>The determinant is zero, so Cramer's rule cannot produce one unique solution.`, sameLine ? "The equations represent the same line; there are infinitely many solutions." : "There is no unique solution (the equations may be parallel or dependent).", "A zero determinant means there is not exactly one solution. Check whether the equations are equivalent or inconsistent.");
        }
        const x=Dx/D, y=Dy/D;
        const working=`Step 1 \u2014 Write the equations in standard form:<br>${eq1}<br>${eq2}<br><br>Step 2 \u2014 Find D = a\u2081b\u2082 \u2212 a\u2082b\u2081:<br>D = (${number(a1)} \u00D7 ${number(b2)}) \u2212 (${number(a2)} \u00D7 ${number(b1)}) = ${number(D)}<br><br>Step 3 \u2014 Find D\u2093 = c\u2081b\u2082 \u2212 c\u2082b\u2081:<br>D\u2093 = (${number(c1)} \u00D7 ${number(b2)}) \u2212 (${number(c2)} \u00D7 ${number(b1)}) = ${number(Dx)}<br><br>Step 4 \u2014 Find D\u1D67 = a\u2081c\u2082 \u2212 a\u2082c\u2081:<br>D\u1D67 = (${number(a1)} \u00D7 ${number(c2)}) \u2212 (${number(a2)} \u00D7 ${number(c1)}) = ${number(Dy)}<br><br>Step 5 \u2014 Calculate x = D\u2093 / D:<br>x = ${number(Dx)} / ${number(D)} = ${number(x)}<br><br>Step 6 \u2014 Calculate y = D\u1D67 / D:<br>y = ${number(Dy)} / ${number(D)} = ${number(y)}<br><br>Step 7 \u2014 Check by substituting x and y into both original equations.`;
        return resultTemplate("x = D\u2093 \u00F7 D; y = D\u1D67 \u00F7 D", working, `x = ${number(x)}; y = ${number(y)}`, "Substitute the answers into both original equations. Both left-hand sides should equal their corresponding right-hand sides.");
    }
},
   "sets": {

    title: "Sets",

    fields: [
        ["operation", "Set Operation", "select"],
        ["setA", "Set A (e.g. 1,2,3,4)", "text"],
        ["setB", "Set B (e.g. 3,4,5,6)", "text"],
        ["universal", "Universal Set U (for complements)", "text"]
    ],

    options: {
        operation: [
            ["union", "A union B - Union"],
            ["intersection", "A intersection B - Intersection"],
            ["differenceAB", "A minus B - Difference"],
            ["differenceBA", "B minus A - Difference"],
            ["symmetric", "A symmetric difference B - Symmetric Difference"],
            ["complementA", "Complement of A"],
            ["complementB", "Complement of B"],
            ["cardinalityA", "n(A) - Number of elements in A"],
            ["cardinalityB", "n(B) - Number of elements in B"],
            ["subset", "Is A a subset of B?"],
            ["properSubset", "Is A a proper subset of B?"],
            ["disjoint", "Are A and B disjoint?"],
            ["cartesian", "A cartesian product B - Cartesian Product"],
            ["powerSetA", "P(A) - Power Set of A"]
        ]
    },

    formula:
        "Set operations include union, intersection, difference, complement, subsets, cardinality and Cartesian product.",

    calculate(v) {

        function parseSet(value) {

            if (
                typeof value !== "string" ||
                value.trim() === ""
            ) {
                return [];
            }

            return [
                ...new Set(
                    value
                        .split(",")
                        .map(item => item.trim())
                        .filter(item => item !== "")
                )
            ];
        }

        const A = parseSet(v.setA);
        const B = parseSet(v.setB);
        const U = parseSet(v.universal);

        const operation = v.operation;

        const hasA = A.length > 0;
        const hasB = B.length > 0;

        const union = [
            ...new Set([...A, ...B])
        ];

        const intersection =
            A.filter(x => B.includes(x));

        const differenceAB =
            A.filter(x => !B.includes(x));

        const differenceBA =
            B.filter(x => !A.includes(x));

        const symmetricDifference = [
            ...new Set([
                ...differenceAB,
                ...differenceBA
            ])
        ];

        function formatSet(set) {

            if (!set || set.length === 0) {
                return "empty set";
            }

            return `{${set.join(", ")}}`;
        }

        if (
            [
                "union",
                "intersection",
                "differenceAB",
                "differenceBA",
                "symmetric",
                "subset",
                "properSubset",
                "disjoint",
                "cartesian"
            ].includes(operation)
            &&
            (!hasA || !hasB)
        ) {
            return errorMessage(
                "Enter both Set A and Set B."
            );
        }

        if (
            ["complementA", "complementB"].includes(operation)
            &&
            (!hasA || U.length === 0)
        ) {
            return errorMessage(
                "Enter the required set and the Universal Set U."
            );
        }

        switch (operation) {

            case "union":

                return resultTemplate(
                    "A union B",
                    `
                    A = ${formatSet(A)}<br>
                    B = ${formatSet(B)}<br><br>

                    Combine all elements and remove duplicates:
                    <br><br>

                    ${formatSet(A)}
                    union
                    ${formatSet(B)}

                    =
                    ${formatSet(union)}
                    `,
                    `A union B = ${formatSet(union)}`
                );


            case "intersection":

                return resultTemplate(
                    "A intersection B",
                    `
                    A = ${formatSet(A)}<br>
                    B = ${formatSet(B)}<br><br>

                    Common elements in both sets:
                    <br><br>

                    ${formatSet(A)}
                    intersection
                    ${formatSet(B)}

                    =
                    ${formatSet(intersection)}
                    `,
                    `A intersection B = ${formatSet(intersection)}`
                );


            case "differenceAB":

                return resultTemplate(
                    "A minus B",
                    `
                    A = ${formatSet(A)}<br>
                    B = ${formatSet(B)}<br><br>

                    Elements in A that are not in B:
                    <br><br>

                    ${formatSet(A)}
                    -
                    ${formatSet(B)}

                    =
                    ${formatSet(differenceAB)}
                    `,
                    `A minus B = ${formatSet(differenceAB)}`
                );


            case "differenceBA":

                return resultTemplate(
                    "B - A",
                    `
                    A = ${formatSet(A)}<br>
                    B = ${formatSet(B)}<br><br>

                    Elements in B that are not in A:
                    <br><br>

                    ${formatSet(B)}
                    -
                    ${formatSet(A)}

                    =
                    ${formatSet(differenceBA)}
                    `,
                    `B - A = ${formatSet(differenceBA)}`
                );


            case "symmetric":

                return resultTemplate(
                    "A symmetric difference B",
                    `
                    A = ${formatSet(A)}<br>
                    B = ${formatSet(B)}<br><br>

                    Elements that belong to A or B,
                    but not both:
                    <br><br>

                    ${formatSet(symmetricDifference)}
                    `,
                    `A symmetric difference B = ${formatSet(symmetricDifference)}`
                );


            case "complementA": {

                const complementA =
                    U.filter(x => !A.includes(x));

                return resultTemplate(
                    "Complement of A",
                    `
                    U = ${formatSet(U)}<br>
                    A = ${formatSet(A)}<br><br>

                    Complement of A = U minus A
                    <br><br>

                    ${formatSet(U)}
                    -
                    ${formatSet(A)}

                    =
                    ${formatSet(complementA)}
                    `,
                    `Complement of A = ${formatSet(complementA)}`
                );

            }


            case "complementB": {

                const complementB =
                    U.filter(x => !B.includes(x));

                return resultTemplate(
                    "Complement of B",
                    `
                    U = ${formatSet(U)}<br>
                    B = ${formatSet(B)}<br><br>

                    B' = U - B
                    <br><br>

                    ${formatSet(U)}
                    -
                    ${formatSet(B)}

                    =
                    ${formatSet(complementB)}
                    `,
                    `B' = ${formatSet(complementB)}`
                );

            }


            case "cardinalityA":

                if (!hasA) {
                    return errorMessage(
                        "Enter Set A."
                    );
                }

                return resultTemplate(
                    "Cardinality of A",
                    `
                    A = ${formatSet(A)}<br><br>

                    Count the distinct elements:
                    <br>
                    ${A.length} elements
                    `,
                    `n(A) = ${A.length}`
                );


            case "cardinalityB":

                if (!hasB) {
                    return errorMessage(
                        "Enter Set B."
                    );
                }

                return resultTemplate(
                    "Cardinality of B",
                    `
                    B = ${formatSet(B)}<br><br>

                    Count the distinct elements:
                    <br>
                    ${B.length} elements
                    `,
                    `n(B) = ${B.length}`
                );


            case "subset": {

                const isSubset =
                    A.every(x => B.includes(x));

                return resultTemplate(
                    "Subset Test",
                    `
                    A = ${formatSet(A)}<br>
                    B = ${formatSet(B)}<br><br>

                    Every element of A must also
                    appear in B.
                    `,
                    isSubset
                        ? "A is a subset of B - YES"
                        : "A is a subset of B - NO"
                );

            }


            case "properSubset": {

                const isSubset =
                    A.every(x => B.includes(x));

                const isProper =
                    isSubset &&
                    A.length < B.length;

                return resultTemplate(
                    "Proper Subset Test",
                    `
                    A = ${formatSet(A)}<br>
                    B = ${formatSet(B)}<br><br>

                    A must be a subset of B
                    and A must contain fewer elements.
                    `,
                    isProper
                        ? "A is a proper subset of B - YES"
                        : "A is a proper subset of B - NO"
                );

            }


            case "disjoint": {

                const areDisjoint =
                    intersection.length === 0;

                return resultTemplate(
                    "Disjoint Sets",
                    `
                    A intersection B =
                    ${formatSet(intersection)}
                    <br><br>

                    Two sets are disjoint when
                    their intersection is empty.
                    `,
                    areDisjoint
                        ? "A and B are DISJOINT."
                        : "A and B are NOT DISJOINT."
                );

            }


            case "cartesian": {

                const pairs = [];

                A.forEach(a => {

                    B.forEach(b => {

                        pairs.push(
                            `(${a}, ${b})`
                        );

                    });

                });

                return resultTemplate(
                    "Cartesian Product",
                    `
                    A = ${formatSet(A)}<br>
                    B = ${formatSet(B)}<br><br>

                    Pair every element of A
                    with every element of B.
                    <br><br>

                    Number of ordered pairs:
                    ${A.length} * ${B.length}
                    =
                    ${pairs.length}
                    `,
                    `Cartesian product A x B = {${pairs.join(", ")}}`
                );

            }


            case "powerSetA": {

                if (!hasA) {
                    return errorMessage(
                        "Enter Set A."
                    );
                }

                if (A.length > 10) {
                    return errorMessage(
                        "For practical use, the power set is limited to sets with 10 or fewer elements."
                    );
                }

                const powerSet = [[]];

                A.forEach(element => {

                    const current =
                        powerSet.map(
                            subset => [
                                ...subset,
                                element
                            ]
                        );

                    powerSet.push(...current);

                });

                const formatted =
                    powerSet
                        .map(
                            subset =>
                                subset.length === 0
                                    ? "empty set"
                                    : `{${subset.join(", ")}}`
                        )
                        .join(", ");

                return resultTemplate(
                    "Power Set P(A)",
                    `
                    A = ${formatSet(A)}<br><br>

                    Number of subsets:
                    2^${A.length}
                    =
                    ${powerSet.length}
                    `,
                    `P(A) = {${formatted}}`
                );

            }


            default:

                return errorMessage(
                    "Please select a valid set operation."
                );
        }
    }
},

"matrices": {

    title: "Matrices",

    fields: [
        ["matrixOperation", "Matrix Operation", "select"],
        ["matrixRowsA", "Rows of Matrix A", "number"],
        ["matrixColsA", "Columns of Matrix A", "number"],
        ["matrixRowsB", "Rows of Matrix B", "number"],
        ["matrixColsB", "Columns of Matrix B", "number"],
        ["matrixScalar", "Scalar", "number"],
        ...Array.from({length: 9}, (_, i) => [`a${Math.floor(i/3)+1}${(i%3)+1}`, `A${Math.floor(i/3)+1}${(i%3)+1}`, "number"]),
        ...Array.from({length: 9}, (_, i) => [`b${Math.floor(i/3)+1}${(i%3)+1}`, `B${Math.floor(i/3)+1}${(i%3)+1}`, "number"])
    ],

    options: {
        matrixOperation: [
            ["add", "A + B"],
            ["subtract", "A - B"],
            ["multiply", "A x B"],
            ["scalar", "Scalar Multiplication"],
            ["transposeA", "Transpose of A"],
            ["determinantA", "Determinant of A"],
            ["inverseA", "Inverse of A"]
        ]
    },

    formula: "Matrix operations follow the dimensions and rules of the selected operation.",

    calculate(v) {
        const op = v.matrixOperation;
        const ra = clampInt(v.matrixRowsA, 1, 3);
        const ca = clampInt(v.matrixColsA, 1, 3);
        const rb = clampInt(v.matrixRowsB, 1, 3);
        const cb = clampInt(v.matrixColsB, 1, 3);

        if (!ra || !ca || !rb || !cb) return errorMessage("Matrix dimensions must be whole numbers from 1 to 3.");

        const A = readMatrix(v, "a", ra, ca);
        const B = readMatrix(v, "b", rb, cb);

        if (["add", "subtract"].includes(op) && (ra !== rb || ca !== cb)) {
            return errorMessage("For addition or subtraction, Matrix A and Matrix B must have the same dimensions.");
        }
        if (op === "multiply" && ca !== rb) {
            return errorMessage("For multiplication, the columns of A must equal the rows of B.");
        }
        if (["determinantA", "inverseA"].includes(op) && ra !== ca) {
            return errorMessage("A determinant or inverse requires a square Matrix A.");
        }

        let resultMatrix;
        let working;

        if (op === "add" || op === "subtract") {
            resultMatrix = A.map((row, i) => row.map((x, j) => op === "add" ? x + B[i][j] : x - B[i][j]));
            working = op === "add" ? "Add corresponding entries of A and B." : "Subtract corresponding entries of B from A.";
        } else if (op === "multiply") {
            resultMatrix = Array.from({length: ra}, () => Array(cb).fill(0));
            for (let i=0;i<ra;i++) for (let j=0;j<cb;j++) for (let k=0;k<ca;k++) resultMatrix[i][j] += A[i][k] * B[k][j];
            working = "Each entry is the dot product of a row of A and a column of B.";
        } else if (op === "scalar") {
            const scalar = Number(v.matrixScalar);
            if (!Number.isFinite(scalar)) return errorMessage("Enter a valid scalar value.");
            resultMatrix = A.map(row => row.map(x => x * scalar));
            working = `Multiply every entry of A by ${number(scalar)}.`;
        } else if (op === "transposeA") {
            resultMatrix = A[0].map((_, j) => A.map(row => row[j]));
            working = "Rows of A become columns of the transpose.";
        } else if (op === "determinantA") {
            const det = determinant(A);
            return resultTemplate("det(A)", `A = ${matrixHtml(A)}<br><br>det(A) = ${number(det, 6)}`, number(det, 6));
        } else if (op === "inverseA") {
            const inv = inverseMatrix(A);
            if (!inv) return errorMessage("Matrix A is singular, so it has no inverse.");
            resultMatrix = inv;
            working = "Use the inverse operation / Gauss-Jordan elimination to obtain A^-1.";
        } else {
            return errorMessage("Select a valid matrix operation.");
        }

        return resultTemplate(
            "Matrix calculation",
            `${working}<br><br>Result:<br>${matrixHtml(resultMatrix)}`,
            matrixHtml(resultMatrix)
        );
    }

},

"differentiation": {

    title: "Differentiation",

    fields: [
        ["diffMethod", "Differentiation Method", "select"],
        ["diffMode", "Evaluation", "select"],
        ["diffExpression", "Expression in x", "text"],
        ["diffU", "u(x) - for Product/Quotient", "text"],
        ["diffV", "v(x) - for Product/Quotient", "text"],
        ["diffInner", "Inner function u(x) - for Chain Rule", "text"],
        ["diffOuter", "Outer function F(u) - for Chain Rule", "text"],
        ["diffX", "x value", "number"]
    ],

    options: {
        diffMethod: [
            ["general", "General / Automatic Rule"],
            ["power", "Power Rule"],
            ["product", "Product Rule"],
            ["quotient", "Quotient Rule"],
            ["chain", "Chain Rule"]
        ],
        diffMode: [
            ["without", "Without x value - symbolic answer"],
            ["with", "With x value - evaluate derivative"]
        ]
    },

    formula:
        "Differentiate the expression with respect to x using the selected rule.",

    calculate(v) {
        const method = v.diffMethod || "general";
        const mode = v.diffMode || "without";
        let expression = (v.diffExpression || "").trim();

        try {
            let ast;

            if (method === "product") {
                const u = (v.diffU || "").trim();
                const vv = (v.diffV || "").trim();
                if (!u || !vv) return errorMessage("Enter both u(x) and v(x) for the Product Rule.");
                expression = `(${u})*(${vv})`;
                ast = parseMathExpression(expression);
            } else if (method === "quotient") {
                const u = (v.diffU || "").trim();
                const vv = (v.diffV || "").trim();
                if (!u || !vv) return errorMessage("Enter both u(x) and v(x) for the Quotient Rule.");
                expression = `(${u})/(${vv})`;
                ast = parseMathExpression(expression);
            } else if (method === "chain") {
                const outer = (v.diffOuter || "").trim();
                const inner = (v.diffInner || "").trim();
                if (!outer || !inner) return errorMessage("Enter the outer function F(u) and inner function u(x) for the Chain Rule.");
                if (!outer.includes("u")) return errorMessage("For Chain Rule, write the outer function using u, for example u^3, sin(u), or ln(u).");
                expression = outer.replace(/\bu\b/g, `(${inner})`);
                ast = parseMathExpression(expression);
            } else {
                if (!expression) return errorMessage("Enter an expression in x, for example 3x^2 + 2x - 5.");
                ast = parseMathExpression(expression);
            }

            const derivative = simplifyAst(derivativeAst(ast));
            const derivativeText = astToString(derivative);

            let evaluation = "";
            if (mode === "with") {
                if (v.diffX === "" || v.diffX === undefined) return errorMessage("Enter the x value for numerical evaluation.");
                const x = Number(v.diffX);
                if (!Number.isFinite(x)) return errorMessage("Enter a valid numerical x value.");
                const value = evaluateAst(derivative, x);
                if (!Number.isFinite(value)) return errorMessage("The derivative cannot be evaluated at that x value.");
                evaluation = `<br><br><strong>At x = ${number(x)}:</strong> f'(x) = ${number(value, 6)}`;
            }

            const methodNote = {
                general: "The automatic method applies the appropriate differentiation rule to the expression.",
                power: "Power Rule: d/dx[x^n] = n x^(n-1).",
                product: "Product Rule: (uv)' = u'v + uv'.",
                quotient: "Quotient Rule: (u/v)' = (u'v - uv')/v^2.",
                chain: "Chain Rule: d/dx F(u) = F'(u)u'."
            }[method];

            return resultTemplate(
                "Differentiate with respect to x",
                `<strong>Original expression:</strong> ${escapeHtml(expression)}<br><br>` +
                `<strong>Method:</strong> ${methodNote}<br><br>` +
                `<strong>Derivative:</strong> ${escapeHtml(derivativeText)}${evaluation}`,
                mode === "with"
                    ? `f'(x) = ${escapeHtml(derivativeText)}<br>Numerical value = ${evaluation.replace(/.*f'\(x\) = /, '').replace(/<br>.*/, '')}`
                    : `f'(x) = ${escapeHtml(derivativeText)}`
            );
        } catch (error) {
            return errorMessage(`Could not parse the expression. Use forms such as <strong>3x^2 + 2x - 5</strong>, <strong>(x+1)(x-2)</strong>, <strong>sin(x)</strong>, <strong>ln(x)</strong>, or <strong>sqrt(x)</strong>.`);
        }
    }

},


"integration": {

    title: "Integration",

    fields: [
        ["integrationType", "Integral Type", "select"],
        ["integrationExpression", "Expression in x", "text"],
        ["integrationLower", "Lower Limit - for Definite Integral", "number"],
        ["integrationUpper", "Upper Limit - for Definite Integral", "number"]
    ],

    options: {
        integrationType: [
            ["indefinite", "Indefinite Integral"],
            ["definite", "Definite Integral"]
        ]
    },

    formula:
        "Indefinite: find a general antiderivative and add + C. Definite: evaluate F(upper) - F(lower).",

    calculate(v) {
        const type = v.integrationType || "indefinite";
        const expression = (v.integrationExpression || "").trim();
        if (!expression) return errorMessage("Enter an expression in x, for example 3x^2 + 2x + 1.");

        try {
            const ast = parseMathExpression(expression);
            const integral = simplifyAst(integrateAst(ast));
            const integralText = astToString(integral);

            if (type === "indefinite") {
                return resultTemplate(
                    "Integral f(x) dx = F(x) + C",
                    `<strong>Expression:</strong> ${escapeHtml(expression)}<br><br>` +
                    `<strong>Antiderivative:</strong> ${escapeHtml(integralText)} + C<br><br>` +
                    `<small>Indefinite integration gives a family of antiderivatives, so the constant of integration + C is required.</small>`,
                    `${escapeHtml(integralText)} + C`
                );
            }

            if (v.integrationLower === "" || v.integrationUpper === "") {
                return errorMessage("Enter both the lower and upper limits for a definite integral.");
            }
            const lower = Number(v.integrationLower);
            const upper = Number(v.integrationUpper);
            if (!Number.isFinite(lower) || !Number.isFinite(upper)) return errorMessage("Enter valid numerical limits.");
            if (upper < lower) return errorMessage("Upper limit must be greater than or equal to the lower limit.");

            if (containsSingularity(integral, lower, upper)) {
                return errorMessage("The selected limits cross a point where the antiderivative is undefined.");
            }

            const upperValue = evaluateAst(integral, upper);
            const lowerValue = evaluateAst(integral, lower);
            const answer = upperValue - lowerValue;

            if (!Number.isFinite(answer)) return errorMessage("The definite integral could not be evaluated for these limits.");

            return resultTemplate(
                "Integralfrom a to b f(x) dx = F(b) - F(a)",
                `<strong>Antiderivative:</strong> ${escapeHtml(integralText)}<br><br>` +
                `F(${number(upper)}) = ${number(upperValue, 6)}<br>` +
                `F(${number(lower)}) = ${number(lowerValue, 6)}<br><br>` +
                `Integral = ${number(upperValue, 6)} - ${number(lowerValue, 6)}`,
                number(answer, 6),
                "A definite integral gives the signed net accumulation over the stated interval."
            );
        } catch (error) {
            return errorMessage("This integration engine supports common forms such as polynomial terms, 1/x, sin(x), cos(x), and e^x. Check the expression format and try again.");
        }
    }

},


"ap-gp": {

    title: "Arithmetic & Geometric Progression",

    fields: [
        ["sequenceType", "Sequence Type", "select"],
        ["calculation", "What do you want to calculate?", "select"],
        ["a", "First Term (a)", "number"],
        ["d", "Common Difference (d)", "number"],
        ["r", "Common Ratio (r)", "number"],
        ["n", "Number of Terms (n)", "number"]
    ],

    options: {

        sequenceType: [
            ["ap", "Arithmetic Progression (AP)"],
            ["gp", "Geometric Progression (GP)"]
        ],

        calculation: [
            ["nth-term", "Find nth Term"],
            ["sum", "Find Sum of n Terms"]
        ]
    },

    formula:
        "AP: Tn = a + (n - 1)d, Sn = n/2[2a + (n - 1)d]<br>" +
        "GP: Tn = arn-1, Sn = a(rn - 1)/(r - 1)",

    calculate(v) {

        const type = v.sequenceType;
        const calculation = v.calculation;

        const a = getNumber(v, "a");
        const n = getNumber(v, "n");

        if (!Number.isFinite(a) || !Number.isFinite(n)) {
            return errorMessage("Please enter valid numbers.");
        }

        if (n <= 0 || !Number.isInteger(n)) {
            return errorMessage(
                "Number of terms (n) must be a positive whole number."
            );
        }

        if (type === "ap") {

            const d = getNumber(v, "d");

            if (!Number.isFinite(d)) {
                return errorMessage(
                    "Please enter a valid common difference."
                );
            }

            if (calculation === "nth-term") {

                const term =
                    a + (n - 1) * d;

                return resultTemplate(
                    "Tn = a + (n - 1)d",
                    `
                    Tn = ${a} + (${n} - 1) * ${d}<br><br>
                    Tn = ${number(term)}
                    `,
                    `The ${n}th term is ${number(term)}`
                );
            }

            if (calculation === "sum") {

                const sumValue =
                    (n / 2) *
                    (2 * a + (n - 1) * d);

                return resultTemplate(
                    "Sn = n/2[2a + (n - 1)d]",
                    `
                    Sn = ${n}/2 [2(${a}) + (${n} - 1)(${d})]<br><br>
                    Sn = ${number(sumValue)}
                    `,
                    `Sum of the first ${n} terms = ${number(sumValue)}`
                );
            }
        }

        if (type === "gp") {

            const r = getNumber(v, "r");

            if (!Number.isFinite(r)) {
                return errorMessage(
                    "Please enter a valid common ratio."
                );
            }

            if (calculation === "nth-term") {

                const term =
                    a * Math.pow(r, n - 1);

                return resultTemplate(
                    "Tn = arn-1",
                    `
                    Tn = ${a} * ${r}(${n}-1)<br><br>
                    Tn = ${number(term)}
                    `,
                    `The ${n}th term is ${number(term)}`
                );
            }

            if (calculation === "sum") {

                if (r === 1) {

                    const sumValue = n * a;

                    return resultTemplate(
                        "Sn = na when r = 1",
                        `
                        Sn = ${n} * ${a}<br><br>
                        Sn = ${number(sumValue)}
                        `,
                        `Sum of the first ${n} terms = ${number(sumValue)}`
                    );
                }

                const sumValue =
                    a *
                    (Math.pow(r, n) - 1) /
                    (r - 1);

                return resultTemplate(
                    "Sn = a(rn - 1)/(r - 1)",
                    `
                    Sn = ${a} * (${r}n - 1) / (${r} - 1)<br><br>
                    Sn = ${number(sumValue)}
                    `,
                    `Sum of the first ${n} terms = ${number(sumValue)}`
                );
            }
        }

        return errorMessage(
            "Please check your selections."
        );
    }

},

},


/* =========================================================
   STATISTICS
========================================================= */

statistics: {


"mean": {
    title: "Arithmetic Mean",
    fields: [["data", "Data Values (comma separated)", "text"]],
    formula: "\\(\\bar{x}=\\frac{\\sum x}{n}\\)",
    calculate(v) {
        const data=getArray(v.data);
        if (!data.length || !data.every(Number.isFinite)) return errorMessage("Enter valid data values separated by commas.");
        const total=sum(data), n=data.length, mean=total/n;
        return resultTemplate("\\(\\bar{x}=\\frac{\\sum x}{n}\\)",`Step 1 \u2014 List the observations:<br>${data.map(number).join(", ")}<br><br>Step 2 \u2014 Add all observations:<br>\u03A3x = ${data.map(number).join(" + ")} = ${number(total)}<br><br>Step 3 \u2014 Count the observations:<br>n = ${n}<br><br>Step 4 \u2014 Divide the total by the number of observations:<br>Mean = ${number(total)} \u00F7 ${n} = ${number(mean)}`,number(mean),"The arithmetic mean is the total of all observations divided by the number of observations.");
    }
},
"weighted-mean": {
    title: "Weighted Mean",
    fields: [["values", "Values (comma separated)", "text"], ["weights", "Weights (comma separated)", "text"]],
    formula: "\\(\\bar{x}_w=\\frac{\\sum wx}{\\sum w}\\)",
    calculate(v) {
        const values=getArray(v.values), weights=getArray(v.weights);
        if (!values.length || values.length!==weights.length) return errorMessage("Values and weights must have the same non-zero number of entries.");
        if (!values.every(Number.isFinite) || !weights.every(Number.isFinite) || weights.some(w=>w<0)) return errorMessage("Enter valid values and non-negative weights.");
        const products=values.map((value,i)=>value*weights[i]), weightedTotal=sum(products), weightTotal=sum(weights);
        if (weightTotal===0) return errorMessage("The sum of the weights cannot be zero.");
        const answer=weightedTotal/weightTotal;
        return resultTemplate("\\(\\bar{x}_w=\\frac{\\sum wx}{\\sum w}\\)",`Step 1 \u2014 Multiply each value by its corresponding weight:<br>${values.map((value,i)=>`${number(value)} \u00D7 ${number(weights[i])} = ${number(products[i])}`).join("<br>")}<br><br>Step 2 \u2014 Add the weighted products:<br>\u03A3wx = ${products.map(number).join(" + ")} = ${number(weightedTotal)}<br><br>Step 3 \u2014 Add all weights:<br>\u03A3w = ${weights.map(number).join(" + ")} = ${number(weightTotal)}<br><br>Step 4 \u2014 Divide the weighted total by the total weight:<br>Weighted mean = ${number(weightedTotal)} \u00F7 ${number(weightTotal)} = ${number(answer)}`,number(answer),"Values with larger weights have a greater influence on the weighted mean.");
    }
},
"median": {
    title: "Median",
    fields: [["data", "Data Values (comma separated)", "text"]],
    formula: "Arrange the data in order, then find the middle value.",
    calculate(v) {
        const original=getArray(v.data);
        if (!original.length || !original.every(Number.isFinite)) return errorMessage("Enter valid data values separated by commas.");
        const data=[...original].sort((a,b)=>a-b), n=data.length;
        const odd=n%2===1, lowerIndex=Math.floor((n-1)/2), upperIndex=Math.floor(n/2);
        const median=odd?data[lowerIndex]:(data[lowerIndex]+data[upperIndex])/2;
        const working=`Step 1 \u2014 Arrange the data from smallest to largest:<br>${data.map(number).join(", ")}<br><br>Step 2 \u2014 Count the observations:<br>n = ${n}<br><br>${odd?`Step 3 \u2014 Since n is odd, select the middle observation (position ${upperIndex+1}):<br>Median = ${number(data[lowerIndex])}`:`Step 3 \u2014 Since n is even, take the two middle observations (positions ${lowerIndex+1} and ${upperIndex+1}):<br>Middle values = ${number(data[lowerIndex])} and ${number(data[upperIndex])}<br><br>Step 4 \u2014 Find their average:<br>Median = (${number(data[lowerIndex])} + ${number(data[upperIndex])}) \u00F7 2 = ${number(median)}`}`;
        return resultTemplate("Median = middle value (odd n) or average of two middle values (even n)",working,number(median),odd?"An odd number of observations has one middle value.":"An even number of observations has two middle values, so their average is the median.");
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
        "Range = Maximum - Minimum",

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
            "Range = Maximum - Minimum",
            `${number(max)} - ${number(min)}`,
            number(max - min)
        );

    }

},


"variance": {
    title: "Population Variance",
    fields: [["data", "Data Values (comma separated)", "text"]],
    formula: "\\(\\sigma^2=\\frac{\\sum(x-\\bar{x})^2}{n}\\)",
    calculate(v) {
        const data=getArray(v.data);
        if (!data.length || !data.every(Number.isFinite)) return errorMessage("Enter valid data values separated by commas.");
        const mean=average(data), deviations=data.map(x=>x-mean), squares=deviations.map(d=>d*d), totalSquares=sum(squares), variance=totalSquares/data.length;
        return resultTemplate("\\(\\sigma^2=\\frac{\\sum(x-\\bar{x})^2}{n}\\)",`Step 1 \u2014 Calculate the mean:<br>\u03A3x = ${number(sum(data))}; n = ${data.length}; mean = ${number(mean)}<br><br>Step 2 \u2014 Subtract the mean from each observation:<br>${data.map((x,i)=>`${number(x)} \u2212 ${number(mean)} = ${number(deviations[i])}`).join("<br")}<br><br>Step 3 \u2014 Square each deviation:<br>${deviations.map((d,i)=>`(${number(d)})\u00B2 = ${number(squares[i])}`).join("<br")}<br><br>Step 4 \u2014 Add the squared deviations:<br>\u03A3(x \u2212 mean)\u00B2 = ${squares.map(number).join(" + ")} = ${number(totalSquares)}<br><br>Step 5 \u2014 Divide by n for population variance:<br>Variance = ${number(totalSquares)} \u00F7 ${data.length} = ${number(variance)}`,number(variance),"This is population variance, so the sum of squared deviations is divided by n. For sample variance, divide by n \u2212 1 instead.");
    }
},
"standard-deviation": {
    title: "Population Standard Deviation",
    fields: [["data", "Data Values (comma separated)", "text"]],
    formula: "\\(\\sigma=\\sqrt{\\frac{\\sum(x-\\bar{x})^2}{n}}\\)",
    calculate(v) {
        const data=getArray(v.data);
        if (!data.length || !data.every(Number.isFinite)) return errorMessage("Enter valid data values separated by commas.");
        const mean=average(data), squares=data.map(x=>Math.pow(x-mean,2)), variance=sum(squares)/data.length, sd=Math.sqrt(variance);
        return resultTemplate("\\(\\sigma=\\sqrt{\\frac{\\sum(x-\\bar{x})^2}{n}}\\)",`Step 1 \u2014 Calculate the mean:<br>Mean = ${number(sum(data))} \u00F7 ${data.length} = ${number(mean)}<br><br>Step 2 \u2014 Calculate the squared deviations and their total:<br>${data.map(x=>`(${number(x)} \u2212 ${number(mean)})\u00B2 = ${number(Math.pow(x-mean,2))}`).join("<br")}<br>Sum of squared deviations = ${number(sum(squares))}<br><br>Step 3 \u2014 Divide by n to get population variance:<br>Variance = ${number(sum(squares))} \u00F7 ${data.length} = ${number(variance)}<br><br>Step 4 \u2014 Take the square root:<br>Standard deviation = \u221A${number(variance)} = ${number(sd)}`,number(sd),"Standard deviation describes the typical spread of observations around the mean, in the original data units. This is the population version.");
    }
},
"coefficient-variation": {

    title: "Coefficient of Variation",

    fields: [
        ["mean", "Mean", "number"],
        ["sd", "Standard Deviation", "number"]
    ],

    formula:
        "CV = SD / Mean * 100",

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
            "CV = SD / Mean * 100",
            `${number(sd)} / ${number(mean)} * 100`,
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
        "Skewness = (Mean - Mode) / SD",

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
            "Skewness = (Mean - Mode) / SD",
            `(${mean} - ${mode}) / ${sd}`,
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
        "beta2 = mu4 / sigma4",

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
            "beta2 = mu4 / sigma4",
            `${number(m4)} / ${number(variance)}2`,
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
        "r = Cov(X,Y) / (sigmaxsigmay)",

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
            "r = Sigma[(x-x)(y-y-bar)] / sqrt[Sigma(x-x)2Sigma(y-y-bar)2]",
            `r = ${number(r, 4)}`,
            number(r, 4),
            interpretCorrelation(r)
        );

    }

},


"spearman": {

    title: "Spearman Rank Correlation",

    fields: [
        ["d2", "Sigmad2", "number"],
        ["n", "Number of Observations", "number"]
    ],

    formula:
        "rho = 1 - [6Sigmad2 / n(n2-1)]",

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
            "rho = 1 - [6Sigmad2 / n(n2-1)]",
            `rho = ${number(rho, 4)}`,
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
        "Cov(X,Y) = Sigma[(x-x)(y-y-bar)] / n",

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
            "Cov(X,Y) = Sigma[(x-x)(y-y-bar)] / n",
            `Sigma = ${number(total)}`,
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
        "Moving Average = Sum of selected observations / Number of observations",

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
            "Moving Average = Sum / Number of observations",
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
        "WMA = Sigma(Value * Weight) / SigmaWeights",

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
            "WMA = Sigma(Value * Weight) / SigmaWeights",
            `${number(numerator)} / ${number(denominator)}`,
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
            `${a} + (${b} * ${x})`,
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
        "Seasonal Index = Actual / Average * 100",

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
            "Seasonal Index = Actual / Average * 100",
            `${actual} / ${avg} * 100`,
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
        "PED = % Change in Quantity Demanded / % Change in Price",

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

        const explanation = elasticityExplanation("price-elasticity-demand", absolutePED);
        return resultTemplate(
            "PED = percentage change in quantity demanded / percentage change in price",
            `% change in quantity demanded = ${percent(percentQ)}<br><br>% change in price = ${percent(percentP)}<br><br>PED = ${number(percentQ, 4)} / ${number(percentP, 4)} = ${mathNumber(absolutePED)}`,
            `${mathNumber(absolutePED)}<br><br><strong>Classification: ${explanation.classification}</strong>`,
            `<strong>Normal Explanation:</strong> ${explanation.normal}<br><br><strong>Simple Explanation:</strong> ${explanation.simple}${ped < 0 ? `<br><br><small><strong>Note:</strong> The signed calculation is negative because price and quantity demanded normally move in opposite directions. The usual PED classification uses the absolute value, so the answer is shown as positive.</small>` : ""}`
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
        "PES = % Change in Quantity Supplied / % Change in Price",

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

            "PES = (Percentage change in quantity supplied) / (Percentage change in price)",

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
        "YED = % Change in Quantity / % Change in Income",

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

        const explanation = elasticityExplanation("income-elasticity", yed);
        return resultTemplate(
            "YED = percentage change in quantity demanded / percentage change in income",
            `Percentage change in quantity demanded = ${percent(percentQ)}<br><br>Percentage change in income = ${percent(percentY)}<br><br>YED = ${number(percentQ, 4)} / ${number(percentY, 4)} = ${mathNumber(yed)}`,
            `${mathNumber(yed)}<br><br><strong>Classification: ${explanation.classification}</strong>`,
            `<strong>Normal Explanation:</strong> ${explanation.normal}<br><br><strong>Simple Explanation:</strong> ${explanation.simple}`
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
        "XED = % Change in Quantity of X / % Change in Price of Y",

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

        const explanation = elasticityExplanation("cross-elasticity", xed);
        return resultTemplate(
            "XED = percentage change in quantity demanded of Good X / percentage change in price of Good Y",
            `Percentage change in quantity demanded of Good X = ${percent(percentQ)}<br><br>Percentage change in price of Good Y = ${percent(percentP)}<br><br>XED = ${number(percentQ, 4)} / ${number(percentP, 4)} = ${mathNumber(xed)}`,
            `${mathNumber(xed)}<br><br><strong>Classification: ${explanation.classification}</strong>`,
            `<strong>Normal Explanation:</strong> ${explanation.normal}<br><br><strong>Simple Explanation:</strong> ${explanation.simple}`
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
        "Demand: Qd = a - bP; Supply: Qs = c + dP",

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
            P = (${a} - ${c})
                / (${b} + ${d})<br><br>

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
        ["price", "Price per Unit (NGN)", "number"],
        ["quantity", "Quantity Sold", "number"]
    ],

    formula:
        "TR = P * Q",

    calculate(v) {

        const P = getNumber(v, "price");
        const Q = getNumber(v, "quantity");

        const TR =
            P * Q;

        return resultTemplate(
            "TR = P * Q",
            `${money(P)} * ${number(Q)}`,
            money(TR)
        );

    }

},


"average-revenue": {

    title: "Average Revenue",

    fields: [
        ["revenue", "Total Revenue (NGN)", "number"],
        ["quantity", "Quantity Sold", "number"]
    ],

    formula:
        "AR = TR / Q",

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
            "AR = TR \u00F7 Q",
            `Step 1 \u2014 Identify total revenue and quantity:<br>TR = ${money(TR)}; Q = ${number(Q)}<br><br>Step 2 \u2014 Divide total revenue by quantity:<br>AR = TR \u00F7 Q = ${money(TR)} \u00F7 ${number(Q)} = ${money(AR)}`,
            money(AR),
            "Average revenue is the revenue earned per unit sold."
        );

    }

},


"marginal-revenue": {

    title: "Marginal Revenue",

    fields: [
        ["r1", "Previous Total Revenue (NGN)", "number"],
        ["r2", "New Total Revenue (NGN)", "number"],
        ["q1", "Previous Quantity", "number"],
        ["q2", "New Quantity", "number"]
    ],

    formula:
        "MR = \u0394TR \u00F7 \u0394Q = (TR\u2082 \u2212 TR\u2081) \u00F7 (Q\u2082 \u2212 Q\u2081)",

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
            "MR = \u0394TR \u00F7 \u0394Q = (TR\u2082 \u2212 TR\u2081) \u00F7 (Q\u2082 \u2212 Q\u2081)",
            `Step 1 \u2014 Find the change in total revenue:<br>\u0394TR = TR\u2082 \u2212 TR\u2081 = ${money(r2)} \u2212 ${money(r1)} = ${money(r2-r1)}<br><br>Step 2 \u2014 Find the change in quantity:<br>\u0394Q = Q\u2082 \u2212 Q\u2081 = ${number(q2)} \u2212 ${number(q1)} = ${number(deltaQ)}<br><br>Step 3 \u2014 Divide the change in revenue by the change in quantity:<br>MR = \u0394TR \u00F7 \u0394Q = ${money(r2-r1)} \u00F7 ${number(deltaQ)} = ${money(MR)}`,
            money(MR),
            "Marginal revenue is the additional revenue earned per additional unit sold over the stated change in quantity."
        );

    }

},


"total-cost": {

    title: "Total Cost",

    fields: [
        ["fixed", "Fixed Cost (NGN)", "number"],
        ["variable", "Variable Cost (NGN)", "number"]
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
            `Step 1 \u2014 Identify fixed cost (FC):<br>FC = ${money(FC)}<br><br>Step 2 \u2014 Identify variable cost (VC):<br>VC = ${money(VC)}<br><br>Step 3 \u2014 Add fixed and variable costs:<br>TC = FC + VC = ${money(FC)} + ${money(VC)} = ${money(TC)}`,
            money(TC),
            "Total cost is the full cost of production at the stated output: fixed cost plus variable cost."
        );

    }

},


"average-cost": {

    title: "Average Cost",

    fields: [
        ["total", "Total Cost (NGN)", "number"],
        ["quantity", "Quantity", "number"]
    ],

    formula:
        "AC = TC / Q",

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
            "AC = TC \u00F7 Q",
            `Step 1 \u2014 Identify total cost and quantity:<br>TC = ${money(TC)}; Q = ${number(Q)}<br><br>Step 2 \u2014 Divide total cost by quantity:<br>AC = TC \u00F7 Q = ${money(TC)} \u00F7 ${number(Q)} = ${money(AC)}`,
            money(AC),
            "Average cost is the cost of producing one unit at the stated output."
        );

    }

},


"average-fixed-cost": {

    title: "Average Fixed Cost",

    fields: [
        ["fixed", "Fixed Cost (NGN)", "number"],
        ["quantity", "Quantity", "number"]
    ],

    formula:
        "AFC = FC / Q",

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
            "AFC = FC \u00F7 Q",
            `Step 1 \u2014 Identify fixed cost and output:<br>FC = ${money(FC)}; Q = ${number(Q)}<br><br>Step 2 \u2014 Divide fixed cost by output:<br>AFC = FC \u00F7 Q = ${money(FC)} \u00F7 ${number(Q)} = ${money(FC/Q)}`,
            money(FC / Q),
            "Average fixed cost is the fixed cost allocated to each unit of output."
        );

    }

},


"average-variable-cost": {

    title: "Average Variable Cost",

    fields: [
        ["variable", "Variable Cost (NGN)", "number"],
        ["quantity", "Quantity", "number"]
    ],

    formula:
        "AVC = VC / Q",

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
            "AVC = VC \u00F7 Q",
            `Step 1 \u2014 Identify variable cost and output:<br>VC = ${money(VC)}; Q = ${number(Q)}<br><br>Step 2 \u2014 Divide variable cost by output:<br>AVC = VC \u00F7 Q = ${money(VC)} \u00F7 ${number(Q)} = ${money(VC/Q)}`,
            money(VC / Q),
            "Average variable cost is the variable cost per unit of output."
        );

    }

},


"profit": {

    title: "Economic Profit",

    fields: [
        ["revenue", "Total Revenue (NGN)", "number"],
        ["cost", "Total Cost (NGN)", "number"]
    ],

    formula:
        "Profit = Total Revenue - Total Cost",

    calculate(v) {

        const TR =
            getNumber(v, "revenue");

        const TC =
            getNumber(v, "cost");

        const profit =
            TR - TC;

        return resultTemplate(
            "Profit = TR - TC",
            `${money(TR)} - ${money(TC)}`,
            money(profit)
        );

    }

},


"consumer-surplus": {

    title: "Consumer Surplus",

    fields: [
        ["maximum", "Maximum Willingness to Pay (NGN)", "number"],
        ["actual", "Actual Market Price (NGN)", "number"],
        ["quantity", "Quantity", "number"]
    ],

    formula:
        "Consumer Surplus = 1/2 * (Maximum Price - Market Price) * Quantity",

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
            "CS = 1/2 * (Maximum Price - Market Price) * Q",
            `
            = 1/2 * (${money(max)}
            - ${money(price)})
            * ${number(Q)}
            `,
            money(CS)
        );

    }

},


"producer-surplus": {

    title: "Producer Surplus",

    fields: [
        ["market", "Market Price (NGN)", "number"],
        ["minimum", "Minimum Supply Price (NGN)", "number"],
        ["quantity", "Quantity", "number"]
    ],

    formula:
        "Producer Surplus = 1/2 * (Market Price - Minimum Price) * Quantity",

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
            "PS = 1/2 * (Market Price - Minimum Price) * Q",
            `
            = 1/2 * (${money(market)}
            - ${money(minimum)})
            * ${number(Q)}
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
        "AP = TP / Labour",

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
            "AP = TP / Labour",
            `${number(TP)} / ${number(L)}`,
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
        "MP = \u0394TP \u00F7 \u0394L = (TP\u2082 \u2212 TP\u2081) \u00F7 (L\u2082 \u2212 L\u2081)",

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
            "MP = \u0394TP \u00F7 \u0394L = (TP\u2082 \u2212 TP\u2081) \u00F7 (L\u2082 \u2212 L\u2081)",
            `Step 1 \u2014 Find the change in total product:<br>\u0394TP = TP\u2082 \u2212 TP\u2081 = ${number(q2)} \u2212 ${number(q1)} = ${number(q2-q1)}<br><br>Step 2 \u2014 Find the change in labour:<br>\u0394L = L\u2082 \u2212 L\u2081 = ${number(l2)} \u2212 ${number(l1)} = ${number(deltaL)}<br><br>Step 3 \u2014 Divide the change in output by the change in labour:<br>MP = \u0394TP \u00F7 \u0394L = ${number(q2-q1)} \u00F7 ${number(deltaL)} = ${number(MP)}`,
            number(MP),
            "Marginal product is the additional output associated with each additional unit of labour over the stated change."
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
        "Inflation Rate = (New Index - Old Index) / Old Index * 100",

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
            "Inflation Rate = (New - Old) / Old * 100",
            `
            (${newIndex} - ${oldIndex})
            / ${oldIndex}
            * 100
            `,
            percent(rate)
        );

    }

},


"per-capita-income": {

    title: "Per Capita Income",

    fields: [
        ["income", "National Income (NGN)", "number"],
        ["population", "Population", "number"]
    ],

    formula:
        "Per Capita Income = National Income / Population",

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
            "PCI = National Income / Population",
            `${money(income)} / ${number(population)}`,
            money(answer)
        );

    }

},


"nominal-real-gdp": {

    title: "Real GDP from Nominal GDP",

    fields: [
        ["nominal", "Nominal GDP (NGN)", "number"],
        ["deflator", "GDP Deflator", "number"]
    ],

    formula:
        "Real GDP = Nominal GDP / GDP Deflator * 100",

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
            "Real GDP = Nominal GDP / GDP Deflator * 100",
            `
            = ${money(nominal)}
              / ${number(deflator)}
              * 100
            `,
            money(real)
        );

    }

},


"gdp-deflator": {

    title: "GDP Deflator",

    fields: [
        ["nominal", "Nominal GDP (NGN)", "number"],
        ["real", "Real GDP (NGN)", "number"]
    ],

    formula:
        "GDP Deflator = Nominal GDP / Real GDP * 100",

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
            "GDP Deflator = Nominal GDP / Real GDP * 100",
            `
            = ${money(nominal)}
              / ${money(real)}
              * 100
            `,
            number(deflator)
        );

    }

}

}
,


/* =========================================================
   FINANCIAL ANALYSIS
========================================================= */

    "financial-analysis": {

        "current-ratio": {
            title: "Current Ratio",
            fields: [
                ["currentAssets", "Current Assets (NGN)", "number"],
                ["currentLiabilities", "Current Liabilities (NGN)", "number"]
            ],
            formula: "Current Ratio = CA \u00F7 CL",
            calculate(v) {
                const assets=getNumber(v,"currentAssets"), liabilities=getNumber(v,"currentLiabilities");
                if (liabilities===0) return errorMessage("Current liabilities cannot be zero.");
                const ratio=assets/liabilities;
                return resultTemplate("Current Ratio = CA \u00F7 CL", `${money(assets)} / ${money(liabilities)} = ${compactNumber(ratio)}:1`, `${compactNumber(ratio)}:1`, "This ratio measures the amount of current assets available to cover each unit of current liabilities.");
            }
        },

        "acid-test-ratio": {
            title: "Acid-Test / Quick Ratio",
            fields: [
                ["currentAssets", "Current Assets (NGN)", "number"],
                ["inventory", "Inventory (NGN)", "number"],
                ["prepayments", "Prepayments (NGN) - Optional", "number"],
                ["currentLiabilities", "Current Liabilities (NGN)", "number"]
            ],
            formula: "Quick Ratio = (CA \u2212 Inventory \u2212 Prepayments) \u00F7 CL",
            calculate(v) {
                const assets=getNumber(v,"currentAssets"), inventory=getNumber(v,"inventory"), prepayments=v.prepayments===""?0:getNumber(v,"prepayments"), liabilities=getNumber(v,"currentLiabilities");
                if (liabilities===0) return errorMessage("Current liabilities cannot be zero.");
                const quickAssets=assets-inventory-prepayments, ratio=quickAssets/liabilities;
                return resultTemplate("Quick Ratio = Quick Assets / Current Liabilities", `Quick Assets = ${money(assets)} - ${money(inventory)} - ${money(prepayments)} = ${money(quickAssets)}<br><br>${money(quickAssets)} / ${money(liabilities)} = ${compactNumber(ratio)}:1`, `${compactNumber(ratio)}:1`, "This ratio focuses on current assets that are generally more readily available to meet short-term liabilities.");
            }
        },

        "cash-ratio": {
            title: "Cash Ratio",
            fields: [["cash", "Cash and Cash Equivalents (NGN)", "number"],["currentLiabilities", "Current Liabilities (NGN)", "number"]],
            formula: "Cash Ratio = Cash & Cash Equivalents \u00F7 CL",
            calculate(v) {
                const cash=getNumber(v,"cash"), liabilities=getNumber(v,"currentLiabilities");
                if(liabilities===0) return errorMessage("Current liabilities cannot be zero.");
                const ratio=cash/liabilities;
                return resultTemplate("Cash Ratio = Cash & Cash Equivalents \u00F7 CL", `${money(cash)} / ${money(liabilities)} = ${compactNumber(ratio)}:1`, `${compactNumber(ratio)}:1`, "This measures immediate coverage of current liabilities using cash and cash equivalents.");
            }
        },

        "working-capital": {
            title: "Working Capital",
            fields: [["currentAssets", "Current Assets (NGN)", "number"],["currentLiabilities", "Current Liabilities (NGN)", "number"]],
            formula: "Working Capital = CA \u2212 CL",
            calculate(v) {
                const assets=getNumber(v,"currentAssets"), liabilities=getNumber(v,"currentLiabilities"), wc=assets-liabilities;
                return resultTemplate("Working Capital = CA \u2212 CL", `${money(assets)} - ${money(liabilities)} = ${money(wc)}`, money(wc), wc>=0 ? "Positive working capital means current assets exceed current liabilities." : "Negative working capital means current liabilities exceed current assets.");
            }
        },

        "inventory-turnover": {
            title: "Inventory Turnover",
            fields: [["cogs", "Cost of Goods Sold (NGN)", "number"],["averageInventory", "Average Inventory (NGN)", "number"]],
            formula: "Inventory Turnover = COGS \u00F7 Average Inventory",
            calculate(v) {
                const cogs=getNumber(v,"cogs"), inv=getNumber(v,"averageInventory");
                if(inv===0) return errorMessage("Average inventory cannot be zero.");
                const ratio=cogs/inv;
                return resultTemplate("Inventory Turnover = COGS \u00F7 Average Inventory", `${money(cogs)} / ${money(inv)} = ${number(ratio)} times`, `${number(ratio)} times`, "This indicates how many times average inventory is replaced during the period.");
            }
        },

        "receivables-turnover": {
            title: "Receivables Turnover",
            fields: [["creditSales", "Net Credit Sales (NGN)", "number"],["averageReceivables", "Average Trade Receivables (NGN)", "number"]],
            formula: "Receivables Turnover = Net Credit Sales \u00F7 Average Receivables",
            calculate(v) {
                const sales=getNumber(v,"creditSales"), rec=getNumber(v,"averageReceivables");
                if(rec===0) return errorMessage("Average receivables cannot be zero.");
                const ratio=sales/rec;
                return resultTemplate("Receivables Turnover = Net Credit Sales \u00F7 Average Receivables", `${money(sales)} / ${money(rec)} = ${number(ratio)} times`, `${number(ratio)} times`, "This indicates how many times average receivables are collected or converted during the period.");
            }
        },

        "payables-turnover": {
            title: "Payables Turnover",
            fields: [["creditPurchases", "Net Credit Purchases (NGN)", "number"],["averagePayables", "Average Trade Payables (NGN)", "number"]],
            formula: "Payables Turnover = Net Credit Purchases \u00F7 Average Trade Payables",
            calculate(v) {
                const purchases=getNumber(v,"creditPurchases"), payables=getNumber(v,"averagePayables");
                if(payables===0) return errorMessage("Average payables cannot be zero.");
                const ratio=purchases/payables;
                return resultTemplate("Payables Turnover = Net Credit Purchases \u00F7 Average Trade Payables", `${money(purchases)} / ${money(payables)} = ${number(ratio)} times`, `${number(ratio)} times`, "This indicates how many times average trade payables are settled during the period.");
            }
        },

        "total-asset-turnover": {
            title: "Total Asset Turnover",
            fields: [["revenue", "Revenue (NGN)", "number"],["averageAssets", "Average Total Assets (NGN)", "number"]],
            formula: "Total Asset Turnover = Revenue \u00F7 Average Total Assets",
            calculate(v) {
                const revenue=getNumber(v,"revenue"), assets=getNumber(v,"averageAssets");
                if(assets===0) return errorMessage("Average total assets cannot be zero.");
                const ratio=revenue/assets;
                return resultTemplate("Total Asset Turnover = Revenue \u00F7 Average Total Assets", `${money(revenue)} / ${money(assets)} = ${number(ratio)} times`, `${number(ratio)} times`, "This measures revenue generated for each unit of average total assets.");
            }
        },

        "inventory-days": {
            title: "Inventory Days",
            fields: [["cogs", "Cost of Goods Sold (NGN)", "number"],["averageInventory", "Average Inventory (NGN)", "number"]],
            formula: "Inventory Days = (Average Inventory \u00F7 COGS) \u00D7 365",
            calculate(v) {
                const cogs=getNumber(v,"cogs"), inv=getNumber(v,"averageInventory");
                if(cogs===0) return errorMessage("COGS cannot be zero.");
                const days=(inv/cogs)*365;
                return resultTemplate("Inventory Days = (Average Inventory \u00F7 COGS) \u00D7 365", `(${money(inv)} / ${money(cogs)}) * 365 = ${number(days)} days`, `${number(days)} days`, "This estimates the average number of days inventory is held before being sold.");
            }
        },

        "receivable-days": {
            title: "Receivable Days",
            fields: [["averageReceivables", "Average Trade Receivables (NGN)", "number"],["creditSales", "Net Credit Sales (NGN)", "number"]],
            formula: "Receivable Days = (Average Receivables \u00F7 Net Credit Sales) \u00D7 365",
            calculate(v) {
                const rec=getNumber(v,"averageReceivables"), sales=getNumber(v,"creditSales");
                if(sales===0) return errorMessage("Net credit sales cannot be zero.");
                const days=(rec/sales)*365;
                return resultTemplate("Receivable Days = (Average Receivables \u00F7 Net Credit Sales) \u00D7 365", `(${money(rec)} / ${money(sales)}) * 365 = ${number(days)} days`, `${number(days)} days`, "This estimates the average time taken to collect trade receivables.");
            }
        },

        "payable-days": {
            title: "Payable Days",
            fields: [["averagePayables", "Average Trade Payables (NGN)", "number"],["creditPurchases", "Net Credit Purchases (NGN)", "number"]],
            formula: "Payable Days = (Average Trade Payables \u00F7 Net Credit Purchases) \u00D7 365",
            calculate(v) {
                const payables=getNumber(v,"averagePayables"), purchases=getNumber(v,"creditPurchases");
                if(purchases===0) return errorMessage("Net credit purchases cannot be zero.");
                const days=(payables/purchases)*365;
                return resultTemplate("Payable Days = (Average Trade Payables \u00F7 Net Credit Purchases) \u00D7 365", `(${money(payables)} / ${money(purchases)}) * 365 = ${number(days)} days`, `${number(days)} days`, "This estimates the average time taken to settle trade payables.");
            }
        },

        "debt-ratio": {
            title: "Debt Ratio",
            fields: [["totalLiabilities", "Total Liabilities (NGN)", "number"],["totalAssets", "Total Assets (NGN)", "number"]],
            formula: "Debt Ratio = (Total Liabilities \u00F7 Total Assets) \u00D7 100%",
            calculate(v) {
                const debt=getNumber(v,"totalLiabilities"), assets=getNumber(v,"totalAssets");
                if(assets===0) return errorMessage("Total assets cannot be zero.");
                const ratio=debt/assets*100;
                return resultTemplate("Debt Ratio = (Total Liabilities \u00F7 Total Assets) \u00D7 100%", `${money(debt)} / ${money(assets)} * 100 = ${number(ratio)}%`, percent(ratio), "This shows the proportion of total assets financed by liabilities.");
            }
        },

        "debt-to-equity": {
            title: "Debt-to-Equity Ratio",
            fields: [["totalLiabilities", "Total Liabilities (NGN)", "number"],["totalEquity", "Total Equity (NGN)", "number"]],
            formula: "Debt-to-Equity Ratio = Total Liabilities \u00F7 Total Equity",
            calculate(v) {
                const debt=getNumber(v,"totalLiabilities"), equity=getNumber(v,"totalEquity");
                if(equity===0) return errorMessage("Total equity cannot be zero.");
                const ratio=debt/equity;
                return resultTemplate("Debt-to-Equity Ratio = Total Liabilities \u00F7 Total Equity", `${money(debt)} / ${money(equity)} = ${compactNumber(ratio)}:1`, `${compactNumber(ratio)}:1`, "This compares financing provided by liabilities with financing provided by equity.");
            }
        },

        "equity-ratio": {
            title: "Equity Ratio",
            fields: [["totalEquity", "Total Equity (NGN)", "number"],["totalAssets", "Total Assets (NGN)", "number"]],
            formula: "Equity Ratio = (Total Equity \u00F7 Total Assets) \u00D7 100%",
            calculate(v) {
                const equity=getNumber(v,"totalEquity"), assets=getNumber(v,"totalAssets");
                if(assets===0) return errorMessage("Total assets cannot be zero.");
                const ratio=equity/assets*100;
                return resultTemplate("Equity Ratio = (Total Equity \u00F7 Total Assets) \u00D7 100%", `${money(equity)} / ${money(assets)} * 100 = ${number(ratio)}%`, percent(ratio), "This shows the proportion of total assets financed by equity.");
            }
        },

        "interest-coverage": {
            title: "Interest Coverage Ratio",
            fields: [["ebit", "Earnings Before Interest and Tax (EBIT) (NGN)", "number"],["interestExpense", "Interest Expense (NGN)", "number"]],
            formula: "Interest Coverage = EBIT \u00F7 Interest Expense",
            calculate(v) {
                const ebit=getNumber(v,"ebit"), interest=getNumber(v,"interestExpense");
                if(interest===0) return errorMessage("Interest expense cannot be zero.");
                const ratio=ebit/interest;
                return resultTemplate("Interest Coverage = EBIT \u00F7 Interest Expense", `${money(ebit)} / ${money(interest)} = ${number(ratio)} times`, `${number(ratio)} times`, "This measures how many times EBIT covers the period's interest expense.");
            }
        },

        "return-on-assets": {
            title: "Return on Assets (ROA)",
            fields: [["netIncome", "Net Income (NGN)", "number"],["averageAssets", "Average Total Assets (NGN)", "number"]],
            formula: "ROA = (Net Income \u00F7 Average Total Assets) \u00D7 100%",
            calculate(v) {
                const income=getNumber(v,"netIncome"), assets=getNumber(v,"averageAssets");
                if(assets===0) return errorMessage("Average total assets cannot be zero.");
                const roa=income/assets*100;
                return resultTemplate("ROA = (Net Income \u00F7 Average Total Assets) \u00D7 100%", `${money(income)} / ${money(assets)} * 100 = ${number(roa)}%`, percent(roa), "This measures profit generated relative to average assets employed.");
            }
        },

        "return-on-equity": {
            title: "Return on Equity (ROE)",
            fields: [["netIncome", "Net Income (NGN)", "number"],["averageEquity", "Average Equity (NGN)", "number"]],
            formula: "ROE = (Net Income \u00F7 Average Equity) \u00D7 100%",
            calculate(v) {
                const income=getNumber(v,"netIncome"), equity=getNumber(v,"averageEquity");
                if(equity===0) return errorMessage("Average equity cannot be zero.");
                const roe=income/equity*100;
                return resultTemplate("ROE = (Net Income \u00F7 Average Equity) \u00D7 100%", `${money(income)} / ${money(equity)} * 100 = ${number(roe)}%`, percent(roe), "This measures profit generated relative to average equity.");
            }
        },

        "earnings-per-share": {
            title: "Earnings Per Share (EPS)",
            fields: [["netIncome", "Net Income Attributable to Ordinary Shareholders (NGN)", "number"],["preferenceDividends", "Preference Dividends (NGN) - Optional", "number"],["weightedShares", "Weighted Average Ordinary Shares", "number"]],
            formula: "EPS = (Net Income \u2212 Preference Dividends) \u00F7 Weighted Average Ordinary Shares",
            calculate(v) {
                const income=getNumber(v,"netIncome"), pref=v.preferenceDividends===""?0:getNumber(v,"preferenceDividends"), shares=getNumber(v,"weightedShares");
                if(shares===0) return errorMessage("Weighted average ordinary shares cannot be zero.");
                const eps=(income-pref)/shares;
                return resultTemplate("EPS = (Net Income \u2212 Preference Dividends) \u00F7 Weighted Average Ordinary Shares", `(${money(income)} - ${money(pref)}) / ${number(shares)} = ${money(eps)}`, money(eps), "EPS expresses the earnings attributable to each ordinary share for the period.");
            }
        },

        "pe-ratio": {
            title: "Price-to-Earnings (P/E) Ratio",
            fields: [["marketPrice", "Market Price Per Share (NGN)", "number"],["eps", "Earnings Per Share (NGN)", "number"]],
            formula: "P/E Ratio = Market Price per Share \u00F7 EPS",
            calculate(v) {
                const price=getNumber(v,"marketPrice"), eps=getNumber(v,"eps");
                if(eps===0) return errorMessage("EPS cannot be zero.");
                const ratio=price/eps;
                return resultTemplate("P/E Ratio = Market Price per Share \u00F7 EPS", `${money(price)} / ${money(eps)} = ${number(ratio)} times`, `${number(ratio)} times`, "This expresses the market price per share as a multiple of earnings per share.");
            }
        },

        "dividend-per-share": {
            title: "Dividend Per Share (DPS)",
            fields: [["ordinaryDividends", "Ordinary Dividends (NGN)", "number"],["ordinaryShares", "Ordinary Shares Outstanding", "number"]],
            formula: "DPS = Ordinary Dividends \u00F7 Ordinary Shares Outstanding",
            calculate(v) {
                const dividends=getNumber(v,"ordinaryDividends"), shares=getNumber(v,"ordinaryShares");
                if(shares===0) return errorMessage("Ordinary shares outstanding cannot be zero.");
                const dps=dividends/shares;
                return resultTemplate("DPS = Ordinary Dividends \u00F7 Ordinary Shares Outstanding", `${money(dividends)} / ${number(shares)} = ${money(dps)}`, money(dps), "DPS shows the dividend attributable to each ordinary share.");
            }
        },

        "dividend-yield": {
            title: "Dividend Yield",
            fields: [["dps", "Dividend Per Share (NGN)", "number"],["marketPrice", "Market Price Per Share (NGN)", "number"]],
            formula: "Dividend Yield = (Dividend per Share \u00F7 Market Price per Share) \u00D7 100%",
            calculate(v) {
                const dps=getNumber(v,"dps"), price=getNumber(v,"marketPrice");
                if(price===0) return errorMessage("Market price per share cannot be zero.");
                const yieldValue=dps/price*100;
                return resultTemplate("Dividend Yield = DPS / Market Price Per Share * 100", `${money(dps)} / ${money(price)} * 100 = ${number(yieldValue)}%`, percent(yieldValue), "This expresses the dividend per share as a percentage of the current market price per share.");
            }
        }

    },


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
            "Cost of Goods Sold",

        "ias36-impairment":
            "IAS 36 Impairment Test",

        "ifrs15-performance-obligations":
            "IFRS 15 Multiple Performance Obligations"

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
            "Logarithms",

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

        "sets":
            "Sets",

        "differentiation":
            "Differentiation",

        "integration":
            "Integration",

        "matrices":
            "Matrices",

        "ap-gp":
            "Arithmetic & Geometric Progression"

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

    },

    "financial-analysis": {

        "current-ratio": "Current Ratio",
        "acid-test-ratio": "Acid-Test / Quick Ratio",
        "cash-ratio": "Cash Ratio",
        "working-capital": "Working Capital",
        "inventory-turnover": "Inventory Turnover",
        "receivables-turnover": "Receivables Turnover",
        "payables-turnover": "Payables Turnover",
        "total-asset-turnover": "Total Asset Turnover",
        "inventory-days": "Inventory Days",
        "receivable-days": "Receivable Days",
        "payable-days": "Payable Days",
        "debt-ratio": "Debt Ratio",
        "debt-to-equity": "Debt-to-Equity Ratio",
        "equity-ratio": "Equity Ratio",
        "interest-coverage": "Interest Coverage Ratio",
        "return-on-assets": "Return on Assets (ROA)",
        "return-on-equity": "Return on Equity (ROE)",
        "earnings-per-share": "Earnings Per Share (EPS)",
        "pe-ratio": "Price-to-Earnings (P/E) Ratio",
        "dividend-per-share": "Dividend Per Share (DPS)",
        "dividend-yield": "Dividend Yield"

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


    function createField(field) {

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

        return group;
    }


    if (category === "mathematics" && ["differentiation", "integration", "logarithm", "indices", "matrices"].includes(type)) {

        // Advanced mathematics has its own guided interface.
        const addGroup = (label, id, inputType="text", options=[]) => {
            const group=document.createElement("div");
            group.className="input-group";
            const lab=document.createElement("label"); lab.htmlFor=id; lab.textContent=label; group.appendChild(lab);
            if(inputType==="select") {
                const el=document.createElement("select"); el.id=id; el.name=id;
                options.forEach(([value,text])=>{const o=document.createElement("option");o.value=value;o.textContent=text;el.appendChild(o);});
                group.appendChild(el);
            } else {
                const el=document.createElement("input"); el.type=inputType; el.id=id; el.name=id; el.placeholder=label; if(inputType==="number") el.step="any"; group.appendChild(el);
            }
            calculatorForm.appendChild(group);
            return document.getElementById(id);
        };

        if (type === "differentiation") {
            const method=addGroup("Differentiation Method","diffMethod","select",calculator.options.diffMethod);
            const mode=addGroup("Evaluation","diffMode","select",calculator.options.diffMode);
            const expr=addGroup("Expression in x","diffExpression","text");
            const u=addGroup("u(x) - Product/Quotient only","diffU","text");
            const vv=addGroup("v(x) - Product/Quotient only","diffV","text");
            const inner=addGroup("Inner function u(x) - Chain Rule only","diffInner","text");
            const outer=addGroup("Outer function F(u) - Chain Rule only","diffOuter","text");
            const x=addGroup("x value - With x value only","diffX","number");
            const note=document.createElement("div"); note.className="formula-box"; note.innerHTML=`<strong>How to use</strong><p>General/Power: enter one expression such as <strong>3x^2 + 2x - 5</strong>.<br>Product: enter u(x) and v(x).<br>Quotient: enter u(x) and v(x).<br>Chain: enter outer F(u), e.g. <strong>u^3</strong>, and inner u(x), e.g. <strong>2x+1</strong>.<br>Choose <strong>With x value</strong> when you want the numerical value of the derivative at a particular x.</p>`; calculatorForm.appendChild(note);
            const refresh=()=>{
                const m=method.value;
                expr.parentElement.style.display=["general","power"].includes(m)?"block":"none";
                u.parentElement.style.display=["product","quotient"].includes(m)?"block":"none";
                vv.parentElement.style.display=["product","quotient"].includes(m)?"block":"none";
                inner.parentElement.style.display=m==="chain"?"block":"none";
                outer.parentElement.style.display=m==="chain"?"block":"none";
                x.parentElement.style.display=mode.value==="with"?"block":"none";
            };
            method.addEventListener("change",refresh); mode.addEventListener("change",refresh); refresh();
        } else if (type === "integration") {
            const kind=addGroup("Integral Type","integrationType","select",calculator.options.integrationType);
            const expr=addGroup("Expression in x","integrationExpression","text");
            const lower=addGroup("Lower Limit","integrationLower","number");
            const upper=addGroup("Upper Limit","integrationUpper","number");
            const note=document.createElement("div"); note.className="formula-box"; note.innerHTML=`<strong>How to use</strong><p><strong>Indefinite Integral:</strong> gives the general antiderivative and includes + C.<br><strong>Definite Integral:</strong> enter lower and upper limits to obtain F(upper) - F(lower).<br>Examples: <strong>3x^2 + 2x + 1</strong>, <strong>1/x</strong>, <strong>sin(x)</strong>.</p>`; calculatorForm.appendChild(note);
            const refresh=()=>{ const show=kind.value==="definite"; lower.parentElement.style.display=show?"block":"none"; upper.parentElement.style.display=show?"block":"none"; };
            kind.addEventListener("change",refresh); refresh();
        } else if (type === "logarithm") {
            const expr=addGroup("Logarithm Expression","logExpression","text");
            expr.placeholder="e.g. log_2(8) - log_2(2)";
            const note=document.createElement("div"); note.className="formula-box"; note.innerHTML=`<strong>How to enter a logarithm</strong><p>Use <strong>log_base(argument)</strong>, for example <strong>log_2(8)</strong>, <strong>log_4(9^2)</strong>, <strong>log_4(9\u00B2)</strong> or <strong>log_10(sqrt(100))</strong>.</p><p>You can use powers, brackets, square roots, ln(...), and combine logarithms with +, \u2212, \u00D7 and \u00F7. The result shows the simplified logarithmic form, numerical value and step-by-step working.</p><p><strong>Conditions:</strong> the base must be positive and not equal to 1; the argument must be positive.</p>`; calculatorForm.appendChild(note);
        } else if (type === "indices") {
            const expr=addGroup("Expression involving indices","indexExpression","text");
            expr.placeholder="e.g. 2^3 * 2^4 or (2^3)^2";
            const note=document.createElement("div"); note.className="formula-box"; note.innerHTML=`<strong>How to enter indices</strong><p>Use <strong>^</strong> or superscripts for powers, <strong>\u00D7</strong> or <strong>*</strong> for multiplication, and <strong>\u00F7</strong> or <strong>/</strong> for division.</p><p>Examples: <strong>2^3 * 2^4</strong>, <strong>3^5 / 3^2</strong>, <strong>(2^3)^2</strong>.</p><p>The result includes the relevant law, step-by-step working, simplified index form where recognized, and numerical value.</p>`; calculatorForm.appendChild(note);
        } else if (type === "matrices") {
            const op=addGroup("Matrix Operation","matrixOperation","select",calculator.options.matrixOperation);
            const ra=addGroup("Rows of A","matrixRowsA","number"); const ca=addGroup("Columns of A","matrixColsA","number");
            const rb=addGroup("Rows of B","matrixRowsB","number"); const cb=addGroup("Columns of B","matrixColsB","number");
            const scalar=addGroup("Scalar - Scalar Multiplication only","matrixScalar","number");
            const grid=document.createElement("div"); grid.id="matrixInputGrid"; calculatorForm.appendChild(grid);
            const note=document.createElement("div"); note.className="formula-box"; note.innerHTML=`<strong>Matrix guide</strong><p>Use dimensions from 1x1 up to 3x3. Addition/subtraction require equal dimensions. Multiplication requires columns of A = rows of B. Determinant and inverse require a square Matrix A.</p>`; calculatorForm.appendChild(note);
            const build=()=>{
                grid.innerHTML="";
                const rA=clampInt(ra.value,1,3)||2, cA=clampInt(ca.value,1,3)||2, rB=clampInt(rb.value,1,3)||2, cB=clampInt(cb.value,1,3)||2;
                const make=(prefix,r,c,title)=>{const h=document.createElement("h4");h.textContent=title;grid.appendChild(h);const wrap=document.createElement("div");wrap.style.display="grid";wrap.style.gridTemplateColumns=`repeat(${c}, minmax(55px, 1fr))`;wrap.style.gap="6px";for(let i=1;i<=r;i++)for(let j=1;j<=c;j++){const inp=document.createElement("input");inp.type="number";inp.step="any";inp.id=`${prefix}${i}${j}`;inp.placeholder=`${prefix.toUpperCase()}${i}${j}`;wrap.appendChild(inp);}grid.appendChild(wrap);};
                make("a",rA,cA,"Matrix A"); make("b",rB,cB,"Matrix B");
                const single=["transposeA","determinantA","inverseA","scalar"].includes(op.value); grid.querySelectorAll("h4:nth-of-type(2), h4:nth-of-type(2) ~ div").forEach(el=>{el.style.display=single?"none":"grid";});
                scalar.parentElement.style.display=op.value==="scalar"?"block":"none";
                rb.parentElement.style.display=["transposeA","determinantA","inverseA","scalar"].includes(op.value)?"none":"block";
                cb.parentElement.style.display=["transposeA","determinantA","inverseA","scalar"].includes(op.value)?"none":"block";
            };
            [op,ra,ca,rb,cb].forEach(el=>el.addEventListener("change",build)); build();
        }

    } else if (
        category === "accounting" &&
        type === "ifrs15-performance-obligations"
    ) {

        calculatorForm.appendChild(
            createField(calculator.fields[0])
        );

        calculatorForm.appendChild(
            createField(calculator.fields[1])
        );

        const obligationFields = [];

        for (let i = 1; i <= 5; i++) {

            const sspField =
                calculator.fields.find(
                    field => field[0] === `ssp${i}`
                );

            const statusField =
                calculator.fields.find(
                    field => field[0] === `status${i}`
                );

            const percentField =
                calculator.fields.find(
                    field => field[0] === `percent${i}`
                );

            const sspElement =
                createField(sspField);

            const statusElement =
                createField(statusField);

            const percentElement =
                createField(percentField);

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "ifrs15-obligation";

            wrapper.dataset.obligation =
                i;

            wrapper.appendChild(
                sspElement
            );

            wrapper.appendChild(
                statusElement
            );

            wrapper.appendChild(
                percentElement
            );

            calculatorForm.appendChild(
                wrapper
            );

            obligationFields.push({
                wrapper,
                statusElement,
                percentElement
            });

            const statusSelect =
                document.getElementById(
                    `status${i}`
                );

            const refreshPartialField = () => {

                percentElement.style.display =
                    statusSelect.value === "partial"
                        ? "block"
                        : "none";

                const percentInput =
                    document.getElementById(
                        `percent${i}`
                    );

                if (
                    statusSelect.value !== "partial"
                ) {
                    percentInput.value = "";
                }

            };

            statusSelect.addEventListener(
                "change",
                refreshPartialField
            );

            refreshPartialField();

        }

        const countSelect =
            document.getElementById(
                "obligationCount"
            );

        const refreshObligations = () => {

            const count =
                Number(countSelect.value || 2);

            obligationFields.forEach(
                (item, index) => {

                    item.wrapper.style.display =
                        index < count
                            ? "block"
                            : "none";

                }
            );

        };

        countSelect.addEventListener(
            "change",
            refreshObligations
        );

        refreshObligations();

    } else if (
        category === "accounting" &&
        type === "reducing-balance"
    ) {

        const methodField =
            createField(calculator.fields[0]);

        calculatorForm.appendChild(
            methodField
        );

        const methodSelect =
            document.getElementById("method");

        function renderReducingBalanceFields() {

            const oldFields =
                calculatorForm.querySelectorAll(
                    ".reducing-balance-field"
                );

            oldFields.forEach(
                field => field.remove()
            );

            if (methodSelect.value === "rate") {

                const fields = [
                    calculator.fields[1],
                    calculator.fields[2],
                    calculator.fields[3]
                ];

                fields.forEach(field => {

                    const element =
                        createField(field);

                    element.classList.add(
                        "reducing-balance-field"
                    );

                    calculatorForm.appendChild(
                        element
                    );

                });

                const note =
                    document.createElement("div");

                note.className =
                    "formula-box reducing-balance-field";

                note.innerHTML = `
                    <strong>Formula</strong>
                    <p>
                        S = C(1 - r)<sup>n</sup><br><br>
                        r = 1 - (S / C)<sup>1/n</sup>
                    </p>
                `;

                calculatorForm.appendChild(note);

            } else {

                const fields = [
                    calculator.fields[1],
                    calculator.fields[4],
                    calculator.fields[5],
                    calculator.fields[6],
                    calculator.fields[7]
                ];

                fields.forEach(field => {

                    const element =
                        createField(field);

                    element.classList.add(
                        "reducing-balance-field"
                    );

                    calculatorForm.appendChild(
                        element
                    );

                });

                const note =
                    document.createElement("div");

                note.className =
                    "formula-box reducing-balance-field";

                note.innerHTML = `
                    <strong>Formula</strong>
                    <p>
                        Depreciation = Opening Carrying Amount * Rate * Time Fraction<br><br>
                        Closing Carrying Amount = Opening Carrying Amount - Depreciation
                    </p>
                `;

                calculatorForm.appendChild(note);

            }

        }

        renderReducingBalanceFields();

        methodSelect.addEventListener(
            "change",
            renderReducingBalanceFields
        );

    } else {

        calculator.fields.forEach(
            field => {
                calculatorForm.appendChild(
                    createField(field)
                );
            }
        );

    }


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

        let output = calculator.calculate(values);

        if (category === "mathematics") {
            output = cleanMathOutput(output);
        }

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


/* =========================================================
   KHID AI ASSISTANT
========================================================= */

const khidAiPanel = document.getElementById("khidAiPanel");
const khidAiMessages = document.getElementById("khidAiMessages");
const aiInput = document.getElementById("aiInput");
const sendAiButton = document.getElementById("sendAiButton");
const openAiButton = document.getElementById("openAiButton");
const closeAiButton = document.getElementById("closeAiButton");

const KHID_AI_WORKER =
    "https://khid-ai.simonmiraclechinecherem.workers.dev";

let aiHistory = [];


/* =========================================================
   OPEN AI
========================================================= */

if (openAiButton && khidAiPanel) {

    openAiButton.addEventListener("click", function () {

        khidAiPanel.style.display = "flex";
        openAiButton.style.display = "none";

        if (aiInput) {
            aiInput.focus();
        }

    });

}


/* =========================================================
   CLOSE AI
========================================================= */

if (closeAiButton && khidAiPanel) {

    closeAiButton.addEventListener("click", function () {

        khidAiPanel.style.display = "none";
        openAiButton.style.display = "block";

    });

}


/* =========================================================
   ADD MESSAGE
========================================================= */

function addAiMessage(sender, message, type) {

    if (!khidAiMessages) return;

    const messageBox = document.createElement("div");

    messageBox.className =
        "khid-ai-message " +
        (type === "user"
            ? "khid-ai-user-message"
            : "khid-ai-bot-message");


    const strong = document.createElement("strong");

    strong.textContent = sender + ":";


    const paragraph = document.createElement("div");

    paragraph.className = "khid-ai-content";


    /*
       Convert common Markdown into HTML
    */

    let formatted = message
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");


    /* Display math */

    formatted = formatted.replace(
        /\$\$([\s\S]*?)\$\$/g,
        '<div class="ai-formula">\\[$1\\]</div>'
    );


    /* Bold */

    formatted = formatted.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );


    /* Headings */

    formatted = formatted.replace(
        /^### (.*)$/gm,
        "<h4>$1</h4>"
    );

    formatted = formatted.replace(
        /^## (.*)$/gm,
        "<h3>$1</h3>"
    );


    /* Bullet points */

    formatted = formatted.replace(
        /^\* (.*)$/gm,
        "<li>$1</li>"
    );

    formatted = formatted.replace(
        /^- (.*)$/gm,
        "<li>$1</li>"
    );


    /* Numbered lists */

    formatted = formatted.replace(
        /^\d+\.\s+(.*)$/gm,
        "<li>$1</li>"
    );


    /* Line breaks */

    formatted = formatted.replace(
        /\n/g,
        "<br>"
    );


    paragraph.innerHTML = formatted;


    messageBox.appendChild(strong);
    messageBox.appendChild(paragraph);

    khidAiMessages.appendChild(messageBox);


    /* Render mathematical formulas */

    if (
        window.MathJax &&
        typeof window.MathJax.typesetPromise === "function"
    ) {

        window.MathJax.typesetPromise([paragraph])
            .catch(function(error) {

                console.error(
                    "MathJax rendering error:",
                    error
                );

            });

    }


    khidAiMessages.scrollTop =
        khidAiMessages.scrollHeight;

}


/* =========================================================
   THINKING MESSAGE
========================================================= */

function addThinkingMessage() {

    const thinking = document.createElement("div");

    thinking.id = "khidAiThinking";

    thinking.className =
        "khid-ai-message khid-ai-bot-message";

    thinking.innerHTML =
        "<strong>KHID AI:</strong>" +
        "<p>Thinking...</p>";

    khidAiMessages.appendChild(thinking);

    khidAiMessages.scrollTop =
        khidAiMessages.scrollHeight;

}


/* =========================================================
   REMOVE THINKING MESSAGE
========================================================= */

function removeThinkingMessage() {

    const thinking =
        document.getElementById("khidAiThinking");

    if (thinking) {
        thinking.remove();
    }

}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendAiMessage() {

    if (!aiInput || !sendAiButton) return;

    const message =
        aiInput.value.trim();

    if (!message) return;


    /* Show user's message */

    addAiMessage(
        "You",
        message,
        "user"
    );


    /* Clear input */

    aiInput.value = "";


    /* Disable button */

    sendAiButton.disabled = true;
    sendAiButton.textContent = "Thinking...";


    /* Thinking indicator */

    addThinkingMessage();


    try {

        const response =
            await fetch(
                KHID_AI_WORKER,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message: message,

                        history:
                            aiHistory.slice(-10)

                    })

                }
            );


        const data =
            await response.json();


        removeThinkingMessage();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "The AI server returned an error."
            );

        }


        const answer =
            data.answer;


        if (!answer) {

            throw new Error(
                "KHID AI returned no answer."
            );

        }


        /* Show AI response */

        addAiMessage(
            "KHID AI",
            answer,
            "bot"
        );


        /* Save conversation */

        aiHistory.push({
            role: "user",
            text: message
        });

        aiHistory.push({
            role: "model",
            text: answer
        });


    } catch (error) {

        removeThinkingMessage();

        addAiMessage(
            "KHID AI",
            "Sorry, I'm temporarily unavailable because my free AI usage limit has been reached. Please try again.",
            "bot"
        );

        console.error(
            "KHID AI Error:",
            error
        );

    } finally {

        sendAiButton.disabled = false;
        sendAiButton.textContent = "Send";

        aiInput.focus();

    }

}


/* =========================================================
   SEND BUTTON
========================================================= */

if (sendAiButton) {

    sendAiButton.addEventListener(
        "click",
        sendAiMessage
    );

}


/* =========================================================
   ENTER TO SEND
========================================================= */

if (aiInput) {

    aiInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendAiMessage();

            }

        }
    );

}/* =========================================================
   KHID MULTIPURPOSE CALCULATOR - SAFE ENHANCEMENTS
   Keeps the existing calculators and their original formulas.
   Adds Financial Analysis Basic/Advanced modes, elasticity methods,
   and a plain-language explanation after the existing result.
========================================================= */

(function () {
  const khidOriginalShowCalculator = showCalculator;
  const khidElasticityIds = new Set([
    "price-elasticity-demand",
    "price-elasticity-supply",
    "income-elasticity",
    "cross-elasticity"
  ]);
  const khidElasticityMethod = {};
  let khidFinancialMode = "basic";

  const khidFinancialFields = {
    currentAssets: [
      ["cash", "Cash and cash equivalents (NGN )"],
      ["shortInvestments", "Short-term investments (NGN )"],
      ["receivables", "Debtors / trade receivables (NGN )"],
      ["inventory", "Stock / inventory (NGN )"],
      ["prepayments", "Prepayments (NGN )"],
      ["otherCurrentAssets", "Other current assets (NGN )"]
    ],
    currentLiabilities: [
      ["payables", "Creditors / trade payables (NGN )"],
      ["accruedExpenses", "Accrued expenses (NGN )"],
      ["shortTermLoan", "Short-term loans / overdraft (NGN )"],
      ["taxPayable", "Tax payable (NGN )"],
      ["otherCurrentLiabilities", "Other current liabilities (NGN )"]
    ],
    nonCurrentAssets: [
      ["propertyPlantEquipment", "Property, plant and equipment (NGN )"],
      ["intangibleAssets", "Intangible assets (NGN )"],
      ["otherNonCurrentAssets", "Other non-current assets (NGN )"]
    ],
    nonCurrentLiabilities: [
      ["longTermLoans", "Long-term loans (NGN )"],
      ["leaseLiabilities", "Lease liabilities (NGN )"],
      ["otherNonCurrentLiabilities", "Other non-current liabilities (NGN )"]
    ]
  };

  const khidFinancialAdvancedFields = {
    "current-ratio": [...khidFinancialFields.currentAssets, ...khidFinancialFields.currentLiabilities],
    "acid-test-ratio": [...khidFinancialFields.currentAssets, ...khidFinancialFields.currentLiabilities],
    "cash-ratio": [["cash", "Cash and cash equivalents (NGN )"], ["shortInvestments", "Short-term investments readily convertible to cash (NGN )"], ...khidFinancialFields.currentLiabilities],
    "working-capital": [...khidFinancialFields.currentAssets, ...khidFinancialFields.currentLiabilities],
    "inventory-turnover": [["openingInventory", "Opening inventory / opening stock (NGN )"], ["purchases", "Purchases (NGN )"], ["purchaseReturns", "Purchase returns (NGN )"], ["carriageInwards", "Carriage inwards (NGN )"], ["closingInventory", "Closing inventory / closing stock (NGN )" ]],
    "inventory-days": [["openingInventory", "Opening inventory / opening stock (NGN )"], ["purchases", "Purchases (NGN )"], ["purchaseReturns", "Purchase returns (NGN )"], ["carriageInwards", "Carriage inwards (NGN )"], ["closingInventory", "Closing inventory / closing stock (NGN )" ]],
    "receivables-turnover": [["creditSales", "Credit sales (NGN )"], ["salesReturns", "Sales returns (NGN )"], ["openingReceivables", "Opening debtors / receivables (NGN )"], ["closingReceivables", "Closing debtors / receivables (NGN )" ]],
    "receivable-days": [["creditSales", "Credit sales (NGN )"], ["salesReturns", "Sales returns (NGN )"], ["openingReceivables", "Opening debtors / receivables (NGN )"], ["closingReceivables", "Closing debtors / receivables (NGN )" ]],
    "payables-turnover": [["creditPurchases", "Credit purchases (NGN )"], ["purchaseReturns", "Purchase returns (NGN )"], ["openingPayables", "Opening creditors / payables (NGN )"], ["closingPayables", "Closing creditors / payables (NGN )" ]],
    "payable-days": [["creditPurchases", "Credit purchases (NGN )"], ["purchaseReturns", "Purchase returns (NGN )"], ["openingPayables", "Opening creditors / payables (NGN )"], ["closingPayables", "Closing creditors / payables (NGN )" ]],
    "total-asset-turnover": [["revenue", "Revenue / sales (NGN )"], ["openingCurrentAssets", "Opening current assets (NGN )"], ["openingNonCurrentAssets", "Opening non-current assets (NGN )"], ["closingCurrentAssets", "Closing current assets (NGN )"], ["closingNonCurrentAssets", "Closing non-current assets (NGN )" ]],
    "debt-ratio": [...khidFinancialFields.currentAssets, ...khidFinancialFields.nonCurrentAssets, ...khidFinancialFields.currentLiabilities, ...khidFinancialFields.nonCurrentLiabilities],
    "debt-to-equity": [...khidFinancialFields.currentAssets, ...khidFinancialFields.nonCurrentAssets, ...khidFinancialFields.currentLiabilities, ...khidFinancialFields.nonCurrentLiabilities],
    "equity-ratio": [...khidFinancialFields.currentAssets, ...khidFinancialFields.nonCurrentAssets, ...khidFinancialFields.currentLiabilities, ...khidFinancialFields.nonCurrentLiabilities],
    "interest-coverage": [["profitBeforeTax", "Profit before tax (NGN )"], ["interestExpense", "Interest expense (NGN )" ]],
    "return-on-assets": [["netIncome", "Net profit / net income for the period (NGN )"], ["openingCurrentAssets", "Opening current assets (NGN )"], ["openingNonCurrentAssets", "Opening non-current assets (NGN )"], ["closingCurrentAssets", "Closing current assets (NGN )"], ["closingNonCurrentAssets", "Closing non-current assets (NGN )" ]],
    "return-on-equity": [["netIncome", "Net profit / net income for the period (NGN )"], ["openingEquity", "Opening equity / capital (NGN )"], ["closingEquity", "Closing equity / capital (NGN )" ]],
    "earnings-per-share": [["netIncome", "Profit attributable to ordinary shareholders (NGN )"], ["preferenceDividends", "Preference dividends (NGN , optional)"], ["weightedShares", "Weighted average ordinary shares" ]],
    "pe-ratio": [["marketPrice", "Market price per share (NGN )"], ["eps", "Earnings per share (NGN )" ]],
    "dividend-per-share": [["ordinaryDividends", "Ordinary dividends (NGN )"], ["ordinaryShares", "Ordinary shares outstanding" ]],
    "dividend-yield": [["dps", "Dividend per share (NGN )"], ["marketPrice", "Market price per share (NGN )" ]]
  };

  const khidFinancialSimple = {
    "current-ratio": "This compares what the business expects to turn into cash or use up soon with what it must pay soon. A higher ratio can provide more short-term breathing room, but the quality of the assets and timing of payments also matter.",
    "acid-test-ratio": "This checks whether the business can cover short-term bills without depending on selling its stock or using prepayments. It focuses on assets that are generally easier to use to pay bills.",
    "cash-ratio": "This looks at how much of the short-term bills could be covered immediately with cash and near-cash funds.",
    "working-capital": "This is what remains from short-term assets after subtracting short-term obligations. A positive amount means those assets are greater than those obligations; a negative amount means the business may need to manage cash carefully.",
    "inventory-turnover": "This estimates how many times the business sold through and replaced its average stock during the period. Compare it with the business's past results and industry, because faster is not automatically better.",
    "inventory-days": "This estimates how long stock stays in the business before it is sold. Fewer days can mean stock moves faster, but the right level depends on the type of business.",
    "receivables-turnover": "This shows how frequently the business collects its average customer debts during the period. A higher figure often means customer debts are being collected more frequently.",
    "receivable-days": "This estimates how many days customers take, on average, to pay. More days can mean cash is tied up in unpaid invoices for longer.",
    "payables-turnover": "This estimates how frequently the business settles its average supplier debts during the period. Interpret it alongside supplier credit terms and cash flow.",
    "payable-days": "This estimates how many days the business takes, on average, to pay suppliers. Too-fast or too-slow payment is not automatically good or bad; compare it with agreed terms and available cash.",
    "total-asset-turnover": "This shows how much sales revenue is generated for each naira invested in average assets. It helps you see how effectively assets are being used to generate sales.",
    "debt-ratio": "This shows the percentage of the business's assets financed by liabilities. A higher percentage means more of the assets are financed by amounts owed to others.",
    "debt-to-equity": "This compares amounts owed to the owners' equity. It helps show how much the business relies on borrowing and other liabilities compared with owners' funds.",
    "equity-ratio": "This shows the percentage of total assets financed by owners' equity rather than liabilities.",
    "interest-coverage": "This estimates how many times operating earnings before interest and tax can cover the interest charge. A low figure may leave less room to pay interest if earnings fall.",
    "return-on-assets": "This measures how much profit the business earns in relation to the assets it uses. It helps assess how productively the assets are being used to generate profit.",
    "return-on-equity": "This measures profit in relation to the owners' average equity. It shows the return generated on the funds invested by owners, but should be considered alongside risk and debt.",
    "earnings-per-share": "This estimates the earnings attributable to each ordinary share for the period. It is not the same as the cash dividend paid per share.",
    "pe-ratio": "This compares a share's market price with its earnings per share. It tells you how many naira of share price investors are paying for each naira of earnings per share; it is not a guarantee of future performance.",
    "dividend-per-share": "This shows the amount of ordinary dividend attributable to each ordinary share.",
    "dividend-yield": "This expresses the dividend per share as a percentage of the current share price. It does not include any gain or loss in the share price."
  };

  const khidEconomicsSimple = {
    "price-elasticity-demand": "Price elasticity of demand tells you how strongly buyers respond when price changes. For PED classification, the calculator shows the absolute value as positive. A negative signed result in the underlying calculation reflects the usual opposite movement of price and quantity demanded; the negative sign is not used for the usual PED classification.",
    "price-elasticity-supply": "This tells you how strongly sellers change the quantity they offer when price changes. A larger elasticity means quantity supplied responds more strongly.",
    "income-elasticity": "This shows how demand responds when people's income changes. A negative result suggests demand falls as income rises (an inferior good); a positive result suggests demand rises as income rises (a normal good). Values above 1 are commonly associated with luxury goods.",
    "cross-elasticity": "This shows how demand for one product responds when the price of another product changes. A positive result usually points to substitutes, a negative result to complements, and a result around zero to little direct relationship."
  };

  function khidReadValues(fields) {
    const values = {};
    fields.forEach(([id]) => {
      const el = document.getElementById(id);
      const raw = el ? el.value.trim() : "";
      values[id] = raw === "" ? 0 : Number(raw);
      if (!Number.isFinite(values[id])) throw new Error("Please enter numbers only.");
    });
    return values;
  }

  function khidMakeField(id, label, type = "number", placeholder = "Enter a number") {
    const group = document.createElement("div");
    group.className = "input-group";
    const lab = document.createElement("label");
    lab.htmlFor = id;
    lab.textContent = label;
    group.appendChild(lab);
    const input = document.createElement("input");
    input.type = type;
    input.id = id;
    input.name = id;
    input.placeholder = placeholder;
    if (type === "number") input.step = "any";
    group.appendChild(input);
    return group;
  }

  function khidInsertModeSelect(mode, options, onChange, id = "khidMethodSelect") {
    const group = document.createElement("div");
    group.className = "input-group";
    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = "Calculation method";
    group.appendChild(label);
    const select = document.createElement("select");
    select.id = id;
    options.forEach(([value, text]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      select.appendChild(option);
    });
    select.value = mode;
    select.addEventListener("change", () => onChange(select.value));
    group.appendChild(select);
    return group;
  }

  function khidSimpleBox(text) {
    if (!text || !result || result.querySelector(".error-message")) return;
    if (result.querySelector(".khid-simple-explanation")) return;
    const box = document.createElement("div");
    box.className = "interpretation-box khid-simple-explanation";
    box.innerHTML = `<p><strong>Simple Explanation:</strong><br>${text}</p>`;
    result.appendChild(box);
  }

  function khidRenderElasticity(type, method) {
    khidElasticityMethod[type] = method;
    khidOriginalShowCalculator(type);
    const calculator = calculators.economics[type];
    const selectBox = khidInsertModeSelect(method, [
      ["percentage", "Percentage Method (existing)"],
      ["arc", "Arc Elasticity / Midpoint Method"],
      ["point", "Point Elasticity (linear function)" ]
    ], next => khidRenderElasticity(type, next));
    calculatorForm.insertBefore(selectBox, calculatorForm.firstChild);
    if (method === "percentage") return;

    calculatorForm.innerHTML = "";
    calculatorForm.appendChild(selectBox);
    const isIncome = type === "income-elasticity";
    const isCross = type === "cross-elasticity";
    const isSupply = type === "price-elasticity-supply";
    const variableLabel = isIncome ? "Income (Y)" : isCross ? "Price of the other good (Py)" : "Price (P)";
    const functionLabel = isIncome ? "Quantity-demand function in income Y" : isCross ? "Quantity of good X as a function of price of good Y" : isSupply ? "Quantity-supplied function in price P" : "Quantity-demand function in price P";

    if (method === "arc") {
      const fields = isIncome
        ? [["q1", "Original quantity demanded"], ["q2", "New quantity demanded"], ["y1", "Original income (Y1)"], ["y2", "New income (Y2)"]]
        : [["q1", isCross ? "Original quantity of good X" : isSupply ? "Original quantity supplied" : "Original quantity demanded"], ["q2", isCross ? "New quantity of good X" : isSupply ? "New quantity supplied" : "New quantity demanded"], ["p1", isCross ? "Original price of good Y" : "Original price (P1)"], ["p2", isCross ? "New price of good Y" : "New price (P2)"]];
      fields.forEach(([id, label]) => calculatorForm.appendChild(khidMakeField(id, label)));
      const note = document.createElement("div");
      note.className = "formula-box";
      note.innerHTML = "<strong>How to use</strong><p>Enter the two observed quantities and the two corresponding prices or incomes. The midpoint method divides each change by the average of its two values, which makes the comparison less dependent on which point is treated as the starting point.</p>";
      calculatorForm.appendChild(note);
    } else {
      calculatorForm.appendChild(khidMakeField("khidLinearFunction", functionLabel, "text", isIncome ? "Example: Q = 20 + 3Y" : isCross ? "Example: Qx = 80 - 2Py" : isSupply ? "Example: Qs = 10 + 2P" : "Example: Qd = 100 - 2P"));
      calculatorForm.appendChild(khidMakeField("khidPointValue", `Enter ${variableLabel}`, "number", "Enter the price or income"));
      const note = document.createElement("div");
      note.className = "formula-box";
      note.innerHTML = `<strong>How to use</strong><p>Enter a straight-line function, such as <strong>${isIncome ? "Q = 20 + 3Y" : isCross ? "Qx = 80 - 2Py" : isSupply ? "Qs = 10 + 2P" : "Qd = 100 - 2P"}</strong>, then enter the price or income at which you want to measure elasticity. The calculator finds the derivative (the slope of the straight line) and the quantity at that point. Use a linear function with one variable only.</p>`;
      calculatorForm.appendChild(note);
    }
    result.innerHTML = `<h3>Result</h3><p>Enter your values and click <strong>Calculate</strong>.</p>`;
  }

  showCalculator = function (type) {
    const category = categorySelect ? categorySelect.value : "";
    if (category === "economics" && khidElasticityIds.has(type)) {
      khidRenderElasticity(type, khidElasticityMethod[type] || "percentage");
      return;
    }
    if (category === "financial-analysis") {
      khidOriginalShowCalculator(type);
      const method = khidInsertModeSelect(khidFinancialMode, [
        ["basic", "Basic Mode (enter the totals)"],
        ["advanced", "Advanced Mode (enter account balances)" ]
      ], next => {
        khidFinancialMode = next;
        showCalculator(type);
      }, "khidFinancialMode");
      calculatorForm.insertBefore(method, calculatorForm.firstChild);
      if (khidFinancialMode === "advanced") {
        calculatorForm.innerHTML = "";
        calculatorForm.appendChild(method);
        const fields = khidFinancialAdvancedFields[type] || [];
        fields.forEach(([id, label]) => calculatorForm.appendChild(khidMakeField(id, label)));
        const note = document.createElement("div");
        note.className = "formula-box";
        note.innerHTML = "<strong>Advanced Mode</strong><p>Enter the underlying account balances. Leave genuinely absent optional balances blank (they are treated as zero). The calculator will build the relevant totals or averages before calculating the ratio. Use figures from the same reporting period and in the same currency.</p>";
        calculatorForm.appendChild(note);
        result.innerHTML = `<h3>Result</h3><p>Enter your balances and click <strong>Calculate</strong>.</p>`;
      }
      return;
    }
    khidOriginalShowCalculator(type);
  };

  function khidAdvancedFinancialValues(type) {
    const fields = khidFinancialAdvancedFields[type] || [];
    const v = khidReadValues(fields);
    const n = key => Number(v[key] || 0);
    const currentAssets = khidFinancialFields.currentAssets.reduce((total, [id]) => total + n(id), 0);
    const currentLiabilities = khidFinancialFields.currentLiabilities.reduce((total, [id]) => total + n(id), 0);
    const nonCurrentAssets = khidFinancialFields.nonCurrentAssets.reduce((total, [id]) => total + n(id), 0);
    const nonCurrentLiabilities = khidFinancialFields.nonCurrentLiabilities.reduce((total, [id]) => total + n(id), 0);
    const totalAssets = currentAssets + nonCurrentAssets;
    const totalLiabilities = currentLiabilities + nonCurrentLiabilities;
    const totalEquity = totalAssets - totalLiabilities;
    let working = [];
    const add = (text) => working.push(text);

    if (["current-ratio", "acid-test-ratio", "cash-ratio", "working-capital"].includes(type)) {
      add(`Current assets = ${money(currentAssets)} (cash + short-term investments + receivables + inventory + prepayments + other current assets).`);
      add(`Current liabilities = ${money(currentLiabilities)} (payables + accruals + short-term loans/overdraft + tax payable + other current liabilities).`);
      if (type === "current-ratio") Object.assign(v, { currentAssets, currentLiabilities });
      if (type === "acid-test-ratio") Object.assign(v, { currentAssets, inventory: n("inventory"), prepayments: n("prepayments"), currentLiabilities });
      if (type === "cash-ratio") Object.assign(v, { cash: n("cash") + n("shortInvestments"), currentLiabilities });
      if (type === "working-capital") Object.assign(v, { currentAssets, currentLiabilities });
    }
    if (["inventory-turnover", "inventory-days"].includes(type)) {
      const cogs = n("openingInventory") + n("purchases") - n("purchaseReturns") + n("carriageInwards") - n("closingInventory");
      const averageInventory = (n("openingInventory") + n("closingInventory")) / 2;
      add(`Cost of goods sold = opening stock + purchases - purchase returns + carriage inwards - closing stock = ${money(cogs)}.`);
      add(`Average inventory = (opening stock + closing stock) / 2 = ${money(averageInventory)}.`);
      Object.assign(v, { cogs, averageInventory });
    }
    if (["receivables-turnover", "receivable-days"].includes(type)) {
      const creditSales = n("creditSales") - n("salesReturns");
      const averageReceivables = (n("openingReceivables") + n("closingReceivables")) / 2;
      add(`Net credit sales = credit sales - sales returns = ${money(creditSales)}.`);
      add(`Average receivables = (opening receivables + closing receivables) / 2 = ${money(averageReceivables)}.`);
      Object.assign(v, { creditSales, averageReceivables });
    }
    if (["payables-turnover", "payable-days"].includes(type)) {
      const creditPurchases = n("creditPurchases") - n("purchaseReturns");
      const averagePayables = (n("openingPayables") + n("closingPayables")) / 2;
      add(`Net credit purchases = credit purchases - purchase returns = ${money(creditPurchases)}.`);
      add(`Average payables = (opening payables + closing payables) / 2 = ${money(averagePayables)}.`);
      Object.assign(v, { creditPurchases, averagePayables });
    }
    if (["total-asset-turnover", "return-on-assets"].includes(type)) {
      const openingAssets = n("openingCurrentAssets") + n("openingNonCurrentAssets");
      const closingAssets = n("closingCurrentAssets") + n("closingNonCurrentAssets");
      const averageAssets = (openingAssets + closingAssets) / 2;
      add(`Opening total assets = opening current assets + opening non-current assets = ${money(openingAssets)}.`);
      add(`Closing total assets = closing current assets + closing non-current assets = ${money(closingAssets)}.`);
      add(`Average total assets = (opening total assets + closing total assets) / 2 = ${money(averageAssets)}.`);
      Object.assign(v, { averageAssets });
    }
    if (["debt-ratio", "debt-to-equity", "equity-ratio"].includes(type)) {
      add(`Total assets = current assets + non-current assets = ${money(totalAssets)}.`);
      add(`Total liabilities = current liabilities + non-current liabilities = ${money(totalLiabilities)}.`);
      add(`Equity (net assets) = total assets - total liabilities = ${money(totalEquity)}.`);
      Object.assign(v, { totalAssets, totalLiabilities, totalEquity });
    }
    if (type === "interest-coverage") {
      const ebit = n("profitBeforeTax") + n("interestExpense");
      add(`EBIT = profit before tax + interest expense = ${money(ebit)}. This assumes profit before tax is after the interest expense has been deducted.`);
      Object.assign(v, { ebit, interestExpense: n("interestExpense") });
    }
    if (type === "return-on-equity") {
      const averageEquity = (n("openingEquity") + n("closingEquity")) / 2;
      add(`Average equity = (opening equity + closing equity) / 2 = ${money(averageEquity)}.`);
      Object.assign(v, { averageEquity, netIncome: n("netIncome") });
    }
    if (["earnings-per-share", "pe-ratio", "dividend-per-share", "dividend-yield"].includes(type)) {
      add("This calculation uses the underlying per-share figures entered above; no intermediate balance total is required for this formula.");
    }
    return { values: v, working };
  }

  function khidCalculateArc(type) {
    const isIncome = type === "income-elasticity";
    const isCross = type === "cross-elasticity";
    const isSupply = type === "price-elasticity-supply";
    const fields = isIncome
      ? [["q1", "Original quantity"], ["q2", "New quantity"], ["y1", "Original income"], ["y2", "New income"]]
      : [["q1", "Original quantity"], ["q2", "New quantity"], ["p1", "Original price"], ["p2", "New price"]];
    const v = khidReadValues(fields);
    const q1 = v.q1, q2 = v.q2;
    const x1 = isIncome ? v.y1 : v.p1;
    const x2 = isIncome ? v.y2 : v.p2;
    if (q1 + q2 === 0 || x1 + x2 === 0 || x1 === x2) {
        return errorMessage("The average quantity and average price/income must not be zero, and the price/income must change.");
    }

    const qChange = (q2 - q1) / ((q1 + q2) / 2);
    const xChange = (x2 - x1) / ((x1 + x2) / 2);
    const signedElasticity = qChange / xChange;
    let value = signedElasticity;
    if (type === "price-elasticity-demand" || isSupply) value = Math.abs(signedElasticity);

    const explanation = !isSupply ? elasticityExplanation(type, value) : null;
    const classification = explanation ? explanation.classification : interpretPES(value);
    const xName = isIncome ? "income" : isCross ? "price of Good Y" : "price";
    const code = isIncome ? "YED" : isCross ? "XED" : isSupply ? "PES" : "PED";
    const normal = explanation ? explanation.normal : "The absolute value measures how strongly quantity supplied responds to a change in price.";
    const simple = explanation ? explanation.simple : "This shows how strongly sellers change the quantity they offer when price changes.";

    return resultTemplate(
      `${code} = percentage change in quantity / percentage change in ${xName}`,
      `Quantity change (midpoint method) = ${mathNumber(qChange * 100)}%<br><br>${xName} change (midpoint method) = ${mathNumber(xChange * 100)}%<br><br>${code} = ${mathNumber(qChange)} / ${mathNumber(xChange)} = ${mathNumber(value)}${type === "price-elasticity-demand" ? `<br><br>Absolute value used for PED = ${mathNumber(value)}` : ""}`,
      `${mathNumber(value)}<br><br><strong>Classification: ${classification}</strong>`,
      `<strong>Normal Explanation:</strong> ${normal}<br><br><strong>Simple Explanation:</strong> ${simple}${type === "price-elasticity-demand" && signedElasticity < 0 ? `<br><br><small><strong>Note:</strong> The signed calculation is negative because price and quantity demanded normally move in opposite directions. PED classification uses the absolute value.</small>` : ""}`
    );
}

function khidParseLinearFunction(raw, expectedVariable) {
    // Safe parser for a straight-line expression: constant + coefficient * variable.
    // Supports +, -, explicit or implicit multiplication, division by constants,
    // decimal coefficients, and bracketed numeric coefficients such as (3/2)P.
    let expression = String(raw || "").trim()
      .replace(/[\u2212\u2013\u2014]/g, "-").replace(/[\u00D7\u00B7]/g, "*").replace(/\u00F7/g, "/");
    if (!expression) throw new Error("Enter a linear function first.");
    if (expression.includes("=")) expression = expression.slice(expression.lastIndexOf("=") + 1).trim();
    expression = expression.replace(/\s+/g, "").replace(/[{}]/g, "");
    const variable = expectedVariable.toUpperCase();
    // Normalize common names for cross elasticity.
    if (variable === "PY") expression = expression.replace(/P[_]?Y/ig, "V").replace(/PY/ig, "V");
    else expression = expression.replace(new RegExp(variable, "ig"), "V");
    if (/[^0-9V.+\-*/()]/.test(expression)) throw new Error(`Use ${expectedVariable} as the only variable in a straight-line function.`);
    // Convert implicit multiplication (2V, (3/2)V, V(2) is not supported).
    expression = expression.replace(/(\d|\))(?=V)/g, "$1*").replace(/V(?=\d|\()/g, "V*");
    // Terms are split only at top-level + or - signs.
    const terms = [];
    let depth = 0, from = 0;
    for (let i = 0; i < expression.length; i++) {
      const ch = expression[i];
      if (ch === "(") depth++;
      else if (ch === ")") { depth--; if (depth < 0) throw new Error("Check the brackets in your function."); }
      else if ((ch === "+" || ch === "-") && i > from && depth === 0) {
        // Do not split a sign immediately after an exponent (scientific notation isn't otherwise needed).
        terms.push(expression.slice(from, i)); from = i;
      }
    }
    if (depth !== 0) throw new Error("Check the brackets in your function.");
    terms.push(expression.slice(from));
    let constant = 0, slope = 0, foundVariable = false;
    function numeric(expr) {
      if (!/^[+\-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\/(?:\d+(?:\.\d*)?|\.\d+))?$/.test(expr)) throw new Error("Use numbers and a linear variable only. Example: Qd = 100 - (3/2)P.");
      const parts = expr.split("/");
      const n = Number(parts[0]) / (parts.length > 1 ? Number(parts[1]) : 1);
      if (!Number.isFinite(n) || (parts.length > 1 && Number(parts[1]) === 0)) throw new Error("The coefficient must be a valid number and cannot divide by zero.");
      return n;
    }
    for (let term of terms) {
      if (!term) continue;
      const sign = term[0] === "-" ? -1 : 1;
      if (term[0] === "+" || term[0] === "-") term = term.slice(1);
      if (!term) throw new Error("Check the signs in your function.");
      if (term.includes("V")) {
        if ((term.match(/V/g) || []).length !== 1) throw new Error("Use a straight-line function with one occurrence of the variable.");
        const pieces = term.split("V");
        let coefficientText = pieces[0];
        let coefficient;
        if (pieces[1] && /^\/\d+(?:\.\d+)?$/.test(pieces[1])) {
          if (coefficientText && coefficientText !== "*") throw new Error("For division, write the variable as P/2 or use a numeric coefficient such as (3/2)P.");
          coefficient = 1 / Number(pieces[1].slice(1));
        } else if (pieces[1] !== "") {
          throw new Error("Use a straight-line term such as 2P, P/2, or (3/2)P.");
        } else {
          coefficientText = coefficientText.replace(/\*$/, "").replace(/^\((.*)\)$/, "$1");
          if (coefficientText === "") coefficient = 1;
          else coefficient = numeric(coefficientText);
        }
        if (!Number.isFinite(coefficient)) throw new Error("The coefficient must be a valid number.");
        slope += sign * coefficient; foundVariable = true;
      } else {
        constant += sign * numeric(term);
      }
    }
    if (!foundVariable || !Number.isFinite(constant) || !Number.isFinite(slope)) throw new Error("The function must include the required variable and valid numbers.");
    return { constant, slope };
  }

  function khidCalculatePoint(type) {
    const isIncome = type === "income-elasticity";
    const isCross = type === "cross-elasticity";
    const isSupply = type === "price-elasticity-supply";
    const variable = isIncome ? "Y" : isCross ? "PY" : "P";
    const raw = document.getElementById("khidLinearFunction").value;
    const pointInput = document.getElementById("khidPointValue");
    if (!pointInput || pointInput.value.trim() === "") return errorMessage("Enter the price or income where you want to measure elasticity.");
    const point = Number(pointInput.value);
    if (!Number.isFinite(point)) return errorMessage("Enter a valid price or income.");
    const { constant, slope } = khidParseLinearFunction(raw, variable);
    const quantity = constant + slope * point;
    if (quantity === 0) return errorMessage("The calculated quantity is zero, so point elasticity cannot be calculated.");
    const valueSigned = slope * point / quantity;
    let value = valueSigned;
    let classification = "";
    if (type === "price-elasticity-demand") {
      value = Math.abs(valueSigned);
      classification = interpretPED(value);
    } else if (isSupply) {
      value = Math.abs(valueSigned);
      classification = interpretPES(value);
    } else if (isIncome) classification = interpretIncomeElasticity(value);
    else classification = interpretCrossElasticity(value);
    const quantityName = isSupply ? "quantity supplied" : "quantity demanded";
    const variableName = isIncome ? "income (Y)" : isCross ? "price of good Y (Py)" : "price (P)";
    const formula = isIncome ? "YED = (dQ/dY) &times; (Y/Q)" : isCross ? "XED = (dQx/dPy) &times; (Py/Qx)" : isSupply ? "PES = (dQs/dP) &times; (P/Qs)" : "PED = (dQd/dP) &times; (P/Qd)";
    const signedNote = type === "price-elasticity-demand" ? "The signed calculation is negative because price and quantity demanded normally move in opposite directions. For PED classification, the calculator reports the absolute value as positive." : isSupply ? "The derivative shows the slope of the supply function. The usual supply elasticity classification uses its magnitude." : "The sign is meaningful here: it helps identify whether quantity moves in the same or opposite direction as the selected price or income variable.";
    const tailored = khidElasticityIds.has(type) && !isSupply
      ? elasticityExplanation(type, value)
      : null;
    const normalExplanation = tailored ? tailored.normal : classification;
    const simpleExplanation = tailored ? tailored.simple : (isSupply
      ? "This describes how strongly sellers change the amount they offer when price changes."
      : "This describes the response of quantity to the selected price or income.");
    return resultTemplate(
      formula,
      `Function entered: ${escapeHtml(raw)}<br><br>Slope = ${mathNumber(slope)}<br>${quantityName} at this point = ${mathNumber(constant)} + (${mathNumber(slope)} \u00D7 ${mathNumber(point)}) = ${mathNumber(quantity)}<br><br>Elasticity = ${mathNumber(slope)} \u00D7 (${mathNumber(point)} / ${mathNumber(quantity)}) = ${mathNumber(value)}.`,
      `${mathNumber(value)}<br><br><strong>Classification: ${tailored ? tailored.classification : classification}</strong>`,
      `<strong>Normal Explanation:</strong> ${normalExplanation}<br><br><strong>Simple Explanation:</strong> ${simpleExplanation}${type === "price-elasticity-demand" && valueSigned < 0 ? `<br><br><small><strong>Note:</strong> The signed calculation is negative because price and quantity demanded normally move in opposite directions. The usual PED classification uses the absolute value.</small>` : ""}`
    );
  }

  if (calculateButton) {
    calculateButton.addEventListener("click", function (event) {
      const category = categorySelect ? categorySelect.value : "";
      const type = calculatorSelect ? calculatorSelect.value : "";
      if (category === "financial-analysis" && khidFinancialMode === "advanced") {
        event.preventDefault();
        event.stopImmediatePropagation();
        try {
          const { values, working } = khidAdvancedFinancialValues(type);
          const output = calculators[category][type].calculate(values);
          const outputCheck = document.createElement("div");
          outputCheck.innerHTML = output;
          if (outputCheck.querySelector(".error-message")) {
            result.innerHTML = `<h3>Result</h3>${output}`;
            return;
          }
          result.innerHTML = `<h3>Result</h3>${output}<div class="working-box"><strong>How the totals were built</strong><p>${working.join("<br><br>")}</p></div>`;
          khidSimpleBox(khidFinancialSimple[type] || "This result helps explain one aspect of the business's financial position or performance. Consider it alongside the other financial statements and relevant business circumstances.");
        } catch (error) {
          result.innerHTML = errorMessage(error.message || "Please check your inputs.");
        }
        return;
      }
      if (category === "economics" && khidElasticityIds.has(type)) {
        const method = khidElasticityMethod[type] || "percentage";
        if (method === "arc" || method === "point") {
          event.preventDefault();
          event.stopImmediatePropagation();
          try {
            result.innerHTML = `<h3>Result</h3>${method === "arc" ? khidCalculateArc(type) : khidCalculatePoint(type)}`;
          } catch (error) {
            result.innerHTML = errorMessage(error.message || "Please check your inputs.");
          }
        }
      }
    }, true);

    // Runs after the original calculator handler. It adds a simple explanation
    // below existing answers without changing the original result or formula.
    calculateButton.addEventListener("click", function () {
      const category = categorySelect ? categorySelect.value : "";
      const type = calculatorSelect ? calculatorSelect.value : "";
      if (category === "financial-analysis" && khidFinancialMode === "basic") {
        khidSimpleBox(khidFinancialSimple[type] || "This ratio or measure gives one useful view of the business. Interpret it with the business's circumstances and other financial information.");
      }
      // PED, XED and YED now render their own result-specific normal and simple explanations.
      // Do not append the old generic explanation a second time.
    });
  }

  // Re-render the current calculator through the enhanced selector-aware renderer.
  if (categorySelect && calculatorSelect) {
    populateCalculators();
  }
})();
