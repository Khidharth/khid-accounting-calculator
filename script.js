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
        const deltaQ = q2 - q1;
        const deltaP = p2 - p1;
        const working =
            `Step 1 - Find the change in quantity demanded:<br>\u0394Q = Q\u2082 - Q\u2081 = ${number(q2)} - ${number(q1)} = ${number(deltaQ)}<br><br>` +
            `Step 2 - Convert the quantity change to a percentage:<br>%\u0394Q = (\u0394Q / Q\u2081) \u00D7 100 = (${number(deltaQ)} / ${number(q1)}) \u00D7 100 = ${percent(percentQ)}<br><br>` +
            `Step 3 - Find the change in price:<br>\u0394P = P\u2082 - P\u2081 = ${number(p2)} - ${number(p1)} = ${number(deltaP)}<br><br>` +
            `Step 4 - Convert the price change to a percentage:<br>%\u0394P = (\u0394P / P\u2081) \u00D7 100 = (${number(deltaP)} / ${number(p1)}) \u00D7 100 = ${percent(percentP)}<br><br>` +
            `Step 5 - Divide the two percentage changes:<br>PED = %\u0394Q / %\u0394P = ${number(percentQ, 4)}% / ${number(percentP, 4)}% = ${mathNumber(ped)}<br><br>` +
            `Step 6 - Apply the usual PED convention:<br>|PED| = |${mathNumber(ped)}| = ${mathNumber(absolutePED)}`;
        return resultTemplate(
            "PED = (%\u0394Q\u1D05) / (%\u0394P)",
            working,
            `${mathNumber(absolutePED)}<br><br><strong>Classification: ${explanation.classification}</strong>`,
            `<strong>Normal Explanation:</strong> ${explanation.normal}<br><br><strong>Simple Explanation:</strong> ${explanation.simple}${ped < 0 ? `<br><br><small><strong>Note:</strong> The signed result is negative because price and quantity demanded normally move in opposite directions. The usual PED classification uses the absolute value, so the reported PED is positive.</small>` : ""}`
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

        const deltaQ = q2 - q1;
        const deltaP = p2 - p1;
        return resultTemplate(
            "PES = (%\u0394Q\u209B) / (%\u0394P)",
            `Step 1 - Change in quantity supplied:<br>\u0394Q\u209B = Q\u2082 - Q\u2081 = ${number(q2)} - ${number(q1)} = ${number(deltaQ)}<br><br>` +
            `Step 2 - Percentage change in quantity supplied:<br>%\u0394Q\u209B = (\u0394Q\u209B / Q\u2081) \u00D7 100 = (${number(deltaQ)} / ${number(q1)}) \u00D7 100 = ${percent(percentQ)}<br><br>` +
            `Step 3 - Change in price:<br>\u0394P = P\u2082 - P\u2081 = ${number(p2)} - ${number(p1)} = ${number(deltaP)}<br><br>` +
            `Step 4 - Percentage change in price:<br>%\u0394P = (\u0394P / P\u2081) \u00D7 100 = (${number(deltaP)} / ${number(p1)}) \u00D7 100 = ${percent(percentP)}<br><br>` +
            `Step 5 - Divide the percentage changes:<br>PES = ${number(percentQ, 4)}% / ${number(percentP, 4)}% = ${mathNumber(pes)}<br><br>Step 6 - Report the magnitude used for the usual classification:<br>|PES| = ${mathNumber(absolutePES)}`,
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
        const deltaQ = q2 - q1;
        const deltaY = y2 - y1;
        return resultTemplate(
            "YED = (%\u0394Q\u1D05) / (%\u0394Y)",
            `Step 1 - Change in quantity demanded:<br>\u0394Q = Q\u2082 - Q\u2081 = ${number(q2)} - ${number(q1)} = ${number(deltaQ)}<br><br>` +
            `Step 2 - Percentage change in quantity demanded:<br>%\u0394Q = (\u0394Q / Q\u2081) \u00D7 100 = (${number(deltaQ)} / ${number(q1)}) \u00D7 100 = ${percent(percentQ)}<br><br>` +
            `Step 3 - Change in income:<br>\u0394Y = Y\u2082 - Y\u2081 = ${number(y2)} - ${number(y1)} = ${number(deltaY)}<br><br>` +
            `Step 4 - Percentage change in income:<br>%\u0394Y = (\u0394Y / Y\u2081) \u00D7 100 = (${number(deltaY)} / ${number(y1)}) \u00D7 100 = ${percent(percentY)}<br><br>` +
            `Step 5 - Divide the percentage changes:<br>YED = %\u0394Q / %\u0394Y = ${number(percentQ, 4)}% / ${number(percentY, 4)}% = ${mathNumber(yed)}`,
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
        const deltaQ = q2 - q1;
        const deltaP = p2 - p1;
        return resultTemplate(
            "XED = (%\u0394Q\u2093) / (%\u0394P\u1D67)",
            `Step 1 - Change in quantity demanded of Good X:<br>\u0394Q\u2093 = Q\u2093\u2082 - Q\u2093\u2081 = ${number(q2)} - ${number(q1)} = ${number(deltaQ)}<br><br>` +
            `Step 2 - Percentage change in quantity of Good X:<br>%\u0394Q\u2093 = (\u0394Q\u2093 / Q\u2093\u2081) \u00D7 100 = (${number(deltaQ)} / ${number(q1)}) \u00D7 100 = ${percent(percentQ)}<br><br>` +
            `Step 3 - Change in the price of Good Y:<br>\u0394P\u1D67 = P\u1D67\u2082 - P\u1D67\u2081 = ${number(p2)} - ${number(p1)} = ${number(deltaP)}<br><br>` +
            `Step 4 - Percentage change in price of Good Y:<br>%\u0394P\u1D67 = (\u0394P\u1D67 / P\u1D67\u2081) \u00D7 100 = (${number(deltaP)} / ${number(p1)}) \u00D7 100 = ${percent(percentP)}<br><br>` +
            `Step 5 - Divide the percentage changes:<br>XED = %\u0394Q\u2093 / %\u0394P\u1D67 = ${number(percentQ, 4)}% / ${number(percentP, 4)}% = ${mathNumber(xed)}`,
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

function normalizeCalculatorCategory(value) {
    const category = String(value || "").trim().toLowerCase();
    if (["math", "maths", "mathematics-calculators", "mathematical"].includes(category)) return "mathematics";
    if (["econ", "economics-calculators"].includes(category)) return "economics";
    return category;
}

function populateCalculators() {

    const category =
        normalizeCalculatorCategory(categorySelect.value);

    calculatorSelect.innerHTML = "";

    const names =
        calculatorNames[category] || {};

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
        normalizeCalculatorCategory(categorySelect.value);

    const calculator =
        calculators[category] && calculators[category][type];

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
        normalizeCalculatorCategory(categorySelect.value);

    const type =
        calculatorSelect.value;

    const calculator =
        calculators[category] && calculators[category][type];


    if (!calculator) {

        result.innerHTML =
            errorMessage(
                "Calculator not found."
            );

        return;

    }


    // Resolve the selected advanced-mathematics inputs directly. This prevents a stale
    // category/form state from leaving the previous Economics calculator active.
    if (category === "mathematics" && ["indices", "logarithm", "differentiation", "integration", "matrices"].includes(type)) {
        const read = id => {
            const element = document.getElementById(id);
            return element ? element.value : "";
        };
        const values = {};
        calculator.fields.forEach(field => { values[field[0]] = read(field[0]); });
        try {
            const output = calculator.calculate(values);
            result.innerHTML = `<h3>Result</h3>${cleanMathOutput(output)}`;
        } catch (error) {
            console.error("Mathematics calculator error:", error);
            result.innerHTML = errorMessage(error.message || "Check the mathematical expression and try again.");
        }
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
    const category = categorySelect ? normalizeCalculatorCategory(categorySelect.value) : "";
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
    const deltaQ = q2 - q1;
    const averageQ = (q1 + q2) / 2;
    const deltaX = x2 - x1;
    const averageX = (x1 + x2) / 2;
    if (averageQ === 0 || averageX === 0 || deltaX === 0) {
        return errorMessage("The average quantity and average price/income must not be zero, and the price/income must change.");
    }

    const qChange = deltaQ / averageQ;
    const xChange = deltaX / averageX;
    const signedElasticity = qChange / xChange;
    let value = signedElasticity;
    if (type === "price-elasticity-demand" || isSupply) value = Math.abs(signedElasticity);

    const explanation = !isSupply ? elasticityExplanation(type, value) : null;
    const classification = explanation ? explanation.classification : interpretPES(value);
    const xName = isIncome ? "income" : isCross ? "price of Good Y" : "price";
    const xSymbol = isIncome ? "Y" : isCross ? "P\u1D67" : "P";
    const code = isIncome ? "YED" : isCross ? "XED" : isSupply ? "PES" : "PED";
    const qSymbol = isCross ? "Q\u2093" : isSupply ? "Q\u209B" : "Q\u1D05";
    const normal = explanation ? explanation.normal : "The absolute value measures how strongly quantity supplied responds to a change in price.";
    const simple = explanation ? explanation.simple : "This shows how strongly sellers change the quantity they offer when price changes.";
    const qPercent = qChange * 100;
    const xPercent = xChange * 100;
    const working =
      `Step 1 - Find the change in quantity:<br>\u0394${qSymbol} = Q\u2082 - Q\u2081 = ${number(q2)} - ${number(q1)} = ${number(deltaQ)}<br><br>` +
      `Step 2 - Find average quantity:<br>Average Q = (Q\u2081 + Q\u2082) / 2 = (${number(q1)} + ${number(q2)}) / 2 = ${number(averageQ)}<br><br>` +
      `Step 3 - Calculate the midpoint percentage change in quantity:<br>%\u0394Q = (\u0394Q / Average Q) \u00D7 100 = (${number(deltaQ)} / ${number(averageQ)}) \u00D7 100 = ${percent(qPercent)}<br><br>` +
      `Step 4 - Find the change in ${xName}:<br>\u0394${xSymbol} = ${xSymbol}\u2082 - ${xSymbol}\u2081 = ${number(x2)} - ${number(x1)} = ${number(deltaX)}<br><br>` +
      `Step 5 - Find average ${xName}:<br>Average ${xSymbol} = (${xSymbol}\u2081 + ${xSymbol}\u2082) / 2 = (${number(x1)} + ${number(x2)}) / 2 = ${number(averageX)}<br><br>` +
      `Step 6 - Calculate the midpoint percentage change in ${xName}:<br>%\u0394${xSymbol} = (\u0394${xSymbol} / Average ${xSymbol}) \u00D7 100 = (${number(deltaX)} / ${number(averageX)}) \u00D7 100 = ${percent(xPercent)}<br><br>` +
      `Step 7 - Divide the percentage changes:<br>${code} = ${number(qChange, 4)} / ${number(xChange, 4)} = ${mathNumber(signedElasticity)}` +
      (type === "price-elasticity-demand" || isSupply ? `<br><br>Step 8 - Magnitude used for classification:<br>|${code}| = ${mathNumber(value)}` : "");

    return resultTemplate(
      `${code} = (%\u0394Q) / (%\u0394${xSymbol}) using the midpoint method`,
      working,
      `${mathNumber(value)}<br><br><strong>Classification: ${classification}</strong>`,
      `<strong>Normal Explanation:</strong> ${normal}<br><br><strong>Simple Explanation:</strong> ${simple}${type === "price-elasticity-demand" && signedElasticity < 0 ? `<br><br><small><strong>Note:</strong> The signed result is negative because price and quantity demanded normally move in opposite directions. The usual PED classification uses its absolute value.</small>` : ""}`
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
    const variableName = isIncome ? "income (Y)" : isCross ? "price of Good Y (P\u1D67)" : "price (P)";
    const symbol = isIncome ? "Y" : isCross ? "P\u1D67" : "P";
    const quantitySymbol = isCross ? "Q\u2093" : isSupply ? "Q\u209B" : "Q\u1D05";
    const code = isIncome ? "YED" : isCross ? "XED" : isSupply ? "PES" : "PED";
    const formula = isIncome ? "YED = (dQ/dY) \u00D7 (Y/Q)" : isCross ? "XED = (dQ\u2093/dP\u1D67) \u00D7 (P\u1D67/Q\u2093)" : isSupply ? "PES = (dQ\u209B/dP) \u00D7 (P/Q\u209B)" : "PED = (dQ\u1D05/dP) \u00D7 (P/Q\u1D05)";
    const derivativeNote = `Since the function is linear, Q = a + b${symbol}, its derivative is constant: dQ/d${symbol} = b. The constant term differentiates to 0, and b${symbol} differentiates to b.`;
    const signedNote = type === "price-elasticity-demand" ? "The signed calculation is negative when price and quantity demanded move in opposite directions. The usual PED classification uses the absolute value." : isSupply ? "The slope is the derivative of the supply function. The usual supply-elasticity classification uses its magnitude." : "The sign matters: a positive result indicates quantity and the selected variable move in the same direction; a negative result indicates opposite directions.";
    const tailored = khidElasticityIds.has(type) && !isSupply ? elasticityExplanation(type, value) : null;
    const normalExplanation = tailored ? tailored.normal : classification;
    const simpleExplanation = tailored ? tailored.simple : (isSupply
      ? "This describes how strongly sellers change the amount they offer when price changes."
      : "This describes the response of quantity to the selected price or income.");
    const working =
      `Step 1 - Identify the linear function:<br>${quantitySymbol} = ${escapeHtml(raw)}<br><br>` +
      `Step 2 - Differentiate to find the slope:<br>${derivativeNote}<br>dQ/d${symbol} = ${mathNumber(slope)}<br><br>` +
      `Step 3 - Substitute the selected ${variableName} into the original function:<br>${quantitySymbol} = ${mathNumber(constant)} + (${mathNumber(slope)} \u00D7 ${mathNumber(point)}) = ${mathNumber(quantity)}<br><br>` +
      `Step 4 - Write the point-elasticity formula:<br>${code} = (dQ/d${symbol}) \u00D7 (${symbol} / ${quantitySymbol})<br><br>` +
      `Step 5 - Substitute the derivative, selected ${symbol}, and calculated quantity:<br>${code} = ${mathNumber(slope)} \u00D7 (${mathNumber(point)} / ${mathNumber(quantity)})<br><br>` +
      `Step 6 - Calculate the fraction first:<br>${mathNumber(point)} / ${mathNumber(quantity)} = ${mathNumber(point / quantity)}<br><br>` +
      `Step 7 - Multiply to obtain signed elasticity:<br>${mathNumber(slope)} \u00D7 ${mathNumber(point / quantity)} = ${mathNumber(valueSigned)}` +
      (type === "price-elasticity-demand" || isSupply ? `<br><br>Step 8 - Apply the magnitude convention:<br>|${code}| = |${mathNumber(valueSigned)}| = ${mathNumber(value)}` : "");
    return resultTemplate(
      formula,
      working,
      `${mathNumber(value)}<br><br><strong>Classification: ${classification}</strong>`,
      `<strong>Normal Explanation:</strong> ${normalExplanation}<br><br><strong>Simple Explanation:</strong> ${simpleExplanation}<br><br><small>${signedNote}</small>`
    );
  }

  if (calculateButton) {
    calculateButton.addEventListener("click", function (event) {
      const category = categorySelect ? normalizeCalculatorCategory(categorySelect.value) : "";
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
      const category = categorySelect ? normalizeCalculatorCategory(categorySelect.value) : "";
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

/* =========================================================
   KHID MATHEMATICS ENGINE  (append this block at the END of your script file)

   1. Fixes "Calculator unavailable": the maths calculators were stored inside
      the finance object, so calculators.mathematics did not exist.
   2. Rebuilds the maths calculators so every one shows formula, step-by-step
      working (parts first, then combined) and a clear visual final answer.
   Nothing above this block is changed.
========================================================= */

(function () {
"use strict";

/* ---------- small HTML / number helpers (entities only, so no mojibake) ---------- */

const MINUS = "&minus;", TIMES = "&times;", DIVS = "&divide;";
const sub = s => `<sub>${s}</sub>`;
const sup = s => `<sup>${s}</sup>`;
const frac = (n, d) => `<span style="display:inline-block;vertical-align:middle;text-align:center;margin:0 3px;"><span style="display:block;padding:0 4px;border-bottom:1px solid currentColor;">${n}</span><span style="display:block;padding:0 4px;">${d}</span></span>`;
const step = (n, title, body) => `<strong>Step ${n} &mdash; ${title}</strong><br>${body}`;
const joinSteps = a => a.join("<br><br>");
const N = v => Number.isFinite(v) ? mathNumber(v === 0 ? 0 : v) : "undefined";
const Nn = v => N(v).replace(/^-/, MINUS);
const par = v => v < 0 ? `(${Nn(v)})` : Nn(v);
const E = s => escapeHtml(String(s));
const eqRow = s => `<div style="margin:4px 0;">${s}</div>`;

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
const fr = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const frAdd = (a, b) => fr(a.n * b.d + b.n * a.d, a.d * b.d);
const frMul = (a, b) => fr(a.n * b.n, a.d * b.d);
const frVal = a => a.n / a.d;
const frHtml = a => a.d === 1 ? Nn(a.n) : (a.n < 0 ? MINUS : "") + frac(Math.abs(a.n), a.d);
function rationalize(x, maxDen = 1000) {
    if (!Number.isFinite(x)) return null;
    for (let d = 1; d <= maxDen; d++) {
        const n = Math.round(x * d);
        if (Math.abs(x * d - n) < 1e-9 * Math.max(1, Math.abs(x * d))) return fr(n, d);
    }
    return null;
}
const ratH = v => { const r = rationalize(v, 100); return r ? frHtml(r) : Nn(v); };
function factorInt(n) {
    const out = []; let m = n;
    for (let p = 2; p * p <= m; p++) {
        if (m % p === 0) { let e = 0; while (m % p === 0) { m /= p; e++; } out.push([p, e]); }
    }
    if (m > 1) out.push([m, 1]);
    return out;
}
function joinSigned(parts) {
    if (!parts.length) return "0";
    return parts.map((p, i) => i === 0 ? (p.neg ? MINUS : "") + p.html : ` ${p.neg ? MINUS : "+"} ${p.html}`).join("");
}
function simplifyRadical(n) {
    if (!Number.isSafeInteger(n) || n < 0) return null;
    let out = 1, inside = n;
    for (let p = 2; p * p <= inside; p++) {
        while (inside % (p * p) === 0) { inside /= p * p; out *= p; }
    }
    return { out, inside };
}
const radHtml = (k, inside) => inside === 1 ? Nn(k) : `${k === 1 ? "" : Nn(k)}&radic;${inside < 10 ? inside : "(" + inside + ")"}`;
function sqrtHtml(n) {
    const r = simplifyRadical(n);
    if (!r) return `&radic;(${N(n)})`;
    return radHtml(r.out, r.inside);
}

/* pretty-print a typed expression such as 9^2, sqrt(100), 2^3*2^4 */
function pretty(s) {
    let t = E(normalizeSuperscriptPowers(String(s)));
    t = t.replace(/sqrt\(/g, "&radic;(");
    t = t.replace(/([\w)])-(?=[\w(&])/g, "$1 &minus; ");
    t = t.replace(/\*/g, ` ${TIMES} `).replace(/\//g, ` ${DIVS} `);
    t = t.replace(/\^(?:\((-?[\d.]+)\)|(-?[\d.]+))/g, (m, p, q) => sup((p || q).replace(/^-/, MINUS)));
    t = t.replace(/\+/g, " + ");
    return t.replace(/-/g, MINUS);
}

/* =========================================================
   LOGARITHMS  (breaks down to the lowest log base form)
========================================================= */

const subDigits = {"₀":"0","₁":"1","₂":"2","₃":"3","₄":"4","₅":"5","₆":"6","₇":"7","₈":"8","₉":"9"};
function normLog(raw) {
    return normalizeSuperscriptPowers(String(raw || "").replace(/log([₀-₉]+)/gi, (_, d) => "log_" + [...d].map(c => subDigits[c]).join("")))
        .replace(/[−–—]/g, "-").replace(/[×·]/g, "*").replace(/÷/g, "/").replace(/\s+/g, "");
}
function logTemplate(expr) {
    let out = ""; const items = [];
    for (let i = 0; i < expr.length;) {
        const m = expr.slice(i).match(/^log_([0-9]+(?:\.[0-9]+)?)\(/i);
        if (!m) { out += expr[i++]; continue; }
        const open = i + m[0].length - 1;
        let depth = 1, j = open + 1;
        for (; j < expr.length && depth > 0; j++) { if (expr[j] === "(") depth++; else if (expr[j] === ")") depth--; }
        items.push({ base: Number(m[1]), argText: expr.slice(open + 1, j - 1) });
        out += `@${items.length - 1}@`;
        i = j;
    }
    return { template: out, items };
}
const logH = (b, a) => `log${sub(b)}(${a})`;

function symHtml(simp) {
    const parts = [];
    simp.terms.slice().sort((x, y) => x.p - y.p).forEach(t => {
        const c = t.c, ac = fr(Math.abs(c.n), c.d);
        const coef = (ac.n === 1 && ac.d === 1) ? "" : (ac.d === 1 ? `${ac.n} ` : `${frHtml(ac)} `);
        parts.push({ neg: c.n < 0, html: `${coef}${logH(t.base, t.p)}` });
    });
    if (simp.k.n !== 0) parts.push({ neg: simp.k.n < 0, html: frHtml(fr(Math.abs(simp.k.n), simp.k.d)) });
    return joinSigned(parts);
}

function analyseLog(item, ctx) {
    const steps = [];
    const push = (t, b) => steps.push(step(ctx.n++, t, b));
    const b = item.base, a = item.argument, bs = N(b);
    const argH = pretty(item.argumentText);
    push("Identify the base and the argument", `${logH(bs, argH)}<br>Base = ${bs}; argument = ${argH}`);
    if (!/^\d+(\.\d+)?$/.test(item.argumentText)) push("Evaluate the argument first", `${argH} = ${N(a)}`);

    const hasInner = /log_/i.test(item.argumentText);
    const rat = hasInner ? null : rationalize(a);
    const baseInt = Number.isSafeInteger(b) && b >= 2;
    const bf = baseInt ? factorInt(b) : null;
    const basePow = bf && bf.length === 1 && bf[0][1] >= 2 ? { q: bf[0][0], m: bf[0][1] } : null;
    const basePrime = bf && bf.length === 1 && bf[0][1] === 1;
    let simp = null;

    if (Math.abs(a - 1) < 1e-12) {
        push("Use the logarithm of 1", `${logH(bs, 1)} = 0 because ${bs}${sup(0)} = 1`);
        simp = { terms: [], k: fr(0), base: bs };
    } else if (rat && rat.n > 0 && Number.isSafeInteger(rat.n) && Number.isSafeInteger(rat.d)) {
        const k = Math.round(Math.log(a) / Math.log(b));
        if (!basePow && !basePrime && k !== 0 && Math.abs(Math.pow(b, k) - a) < 1e-9 * Math.abs(a)) {
            push("Recognise the argument as a power of the base", `${N(a)} = ${bs}${sup(Nn(k))}`);
            push("Apply the power rule and log<sub>b</sub>(b) = 1", `${logH(bs, bs + sup(Nn(k)))} = ${Nn(k)} ${logH(bs, bs)} = ${Nn(k)} ${TIMES} 1 = ${Nn(k)}`);
            simp = { terms: [], k: fr(k), base: bs };
        } else {
            const exps = new Map();
            (rat.n >= 2 ? factorInt(rat.n) : []).forEach(([p, e]) => exps.set(p, (exps.get(p) || 0) + e));
            (rat.d >= 2 ? factorInt(rat.d) : []).forEach(([p, e]) => exps.set(p, (exps.get(p) || 0) - e));
            const list = [...exps.entries()].filter(([, e]) => e !== 0).sort((x, y) => x[0] - y[0]);
            const argShow = rat.d === 1 ? N(a) : frac(rat.n, rat.d);
            const argPow = list.map(([p, e]) => e === 1 ? `${p}` : `${p}${sup(Nn(e))}`).join(` ${TIMES} `);
            const trivial = list.length === 1 && list[0][1] === 1;
            const qd = basePow ? basePow.q : (basePrime ? b : null);
            const Bd = basePow ? `${basePow.q}${sup(basePow.m)}` : bs;

            if (trivial) {
                push("The argument is already a prime number", `${argShow} = ${argPow}, so it cannot be factorised further.`);
            } else {
                push("Write the argument as prime powers", `${argShow} = ${argPow}`);
                push("Rewrite the logarithm with the argument in prime-power form", `${logH(bs, argShow)} = ${logH(bs, argPow)}`);
            }
            if (basePow) {
                push("Write the base as a power of a prime", `${bs} = ${Bd}<br>So ${logH(bs, trivial ? argPow : argPow)} = ${logH(Bd, argPow)}`);
            } else if (baseInt && !basePrime) {
                push("Check the base", `${bs} is not a power of a single prime number, so the base stays as ${bs}.`);
            }
            const signed = (e, h) => ({ neg: e < 0, html: `${Math.abs(e) === 1 ? "" : Nn(Math.abs(e)) + " "}${h}` });
            if (!trivial) {
                push("Apply the product rule and the power rule",
                    `Rules: ${logH("b", "x" + sup("n"))} = n ${logH("b", "x")} and ${logH("b", "xy")} = ${logH("b", "x")} + ${logH("b", "y")}<br>` +
                    `${logH(Bd, argPow)} = ${joinSigned(list.map(([p, e]) => signed(e, logH(Bd, p))))}`);
            }
            const terms = []; let kconst = fr(0);
            const unit = basePow ? fr(1, basePow.m) : fr(1);
            if (basePow) {
                push("Apply the base power rule",
                    `Rule: ${logH(`b${sup("m")}`, "x")} = ${frac(1, "m")} ${logH("b", "x")}<br>` +
                    list.map(([p]) => `${logH(Bd, p)} = ${frac(1, basePow.m)} ${logH(basePow.q, p)}`).join("<br>") + `<br><br>` +
                    `So ${logH(Bd, argPow)} = ${joinSigned(list.map(([p, e]) => ({ neg: e < 0, html: `${Math.abs(e) === 1 ? "" : Nn(Math.abs(e)) + " " + TIMES + " "}${frac(1, basePow.m)} ${logH(basePow.q, p)}` })))}`);
            }
            list.forEach(([p, e]) => {
                const c = frMul(fr(e), unit);
                if (qd !== null && p === qd) kconst = frAdd(kconst, c);
                else terms.push({ c, p, base: basePow ? String(basePow.q) : bs });
            });
            if (qd !== null && list.some(([p]) => p === qd)) {
                push(`Use ${logH("b", "b")} = 1`, list.filter(([p]) => p === qd).map(([p, e]) => `${logH(qd, qd)} = 1, so the term with ${logH(qd, p)} becomes ${frHtml(frMul(fr(e), unit))} ${TIMES} 1 = ${frHtml(frMul(fr(e), unit))}`).join("<br>"));
            }
            if (basePow || list.length > 1 || kconst.n !== 0) {
                const lines = list.filter(([p]) => !(qd !== null && p === qd)).map(([p, e]) => `Coefficient of ${logH(basePow ? basePow.q : bs, p)}: ${Nn(e)} ${TIMES} ${basePow ? frac(1, basePow.m) : "1"} = ${frHtml(frMul(fr(e), unit))}`);
                push("Combine the coefficients", (lines.length ? lines.join("<br>") + "<br><br>" : "") + `Simplified form: ${symHtml({ terms, k: kconst, base: bs })}`);
            }
            simp = { terms, k: kconst, base: bs };
        }
    } else {
        push("Check the argument", "The argument is not a simple product of prime powers, so only the numerical value is found.");
    }
    push("Find the numerical value using change of base",
        `${logH(bs, argH)} = ${frac("ln(" + N(a) + ")", "ln(" + bs + ")")} = ${frac(N(Math.log(a)), N(Math.log(b)))} = <strong>${N(item.value)}</strong>`);
    return { steps, simp, value: item.value };
}

function calcLogarithm(raw) {
    const original = String(raw || "").trim();
    if (!original) return errorMessage("Enter a logarithm, for example log_4(9), log_2(8) - log_2(2), or log_10(sqrt(100)).");
    const logs = [];
    let result;
    try { result = evaluateLogExpression(original, logs); }
    catch (e) { return errorMessage(e.message || "Check the logarithm notation, brackets, base and argument."); }

    const ctx = { n: 1 };
    const analysed = logs.map(item => analyseLog(item, ctx));
    const blocks = [];
    analysed.forEach((an, i) => {
        const head = logs.length > 1 ? `<strong>Logarithm ${i + 1}: ${logH(N(logs[i].base), pretty(logs[i].argumentText))}</strong><br><br>` : "";
        blocks.push(head + joinSteps(an.steps));
    });

    let finalSym = null;
    if (analysed.length === 1) {
        finalSym = analysed[0].simp ? symHtml(analysed[0].simp) : null;
    } else {
        const norm = normLog(original);
        const { template, items } = logTemplate(norm);
        const lookup = it => { const idx = logs.findIndex(l => l.base === it.base && l.argumentText === it.argText); return idx >= 0 ? analysed[idx] : null; };
        const opsOnly = s => s.replace(/\*/g, ` ${TIMES} `).replace(/\//g, ` ${DIVS} `).replace(/\+/g, " + ").replace(/-/g, ` ${MINUS} `)
            .replace(/\^(?:\((-?\d+)\)|(-?\d+))/g, (m, p, q) => sup(p || q)).replace(/sqrt\(/g, "&radic;(");
        const withSym = opsOnly(template).replace(/@(\d+)@/g, (m, i) => { const an = lookup(items[Number(i)]); return an && an.simp ? `(${symHtml(an.simp)})` : `(${N(an ? an.value : 0)})`; });
        const withNum = opsOnly(template).replace(/@(\d+)@/g, (m, i) => { const an = lookup(items[Number(i)]); return `(${N(an ? an.value : 0)})`; });
        blocks.push(step(ctx.n++, "Substitute the simplified logarithms into the expression", withSym.trim()));
        if (/^[+\-]?@\d+@(?:[+\-]@\d+@)*$/.test(template) && items.every(it => { const an = lookup(it); return an && an.simp; })) {
            const acc = new Map(); let k = fr(0);
            const re = /([+\-]?)@(\d+)@/g; let m;
            while ((m = re.exec(template))) {
                const sg = m[1] === "-" ? -1 : 1, an = lookup(items[Number(m[2])]);
                an.simp.terms.forEach(t => {
                    const key = t.base + "|" + t.p, prev = acc.get(key);
                    const c = frMul(t.c, fr(sg));
                    acc.set(key, { c: prev ? frAdd(prev.c, c) : c, p: t.p, base: t.base });
                });
                k = frAdd(k, frMul(an.simp.k, fr(sg)));
            }
            const combined = { terms: [...acc.values()].filter(t => t.c.n !== 0), k };
            finalSym = symHtml(combined);
            blocks.push(step(ctx.n++, "Combine like logarithms and constants", `Add or subtract the coefficients of identical logarithms:<br>${finalSym}`));
        }
        blocks.push(step(ctx.n++, "Check by evaluating the whole expression numerically", `${withNum.trim()} = <strong>${N(result.value)}</strong>`));
    }

    const lawText = `Power rule: ${logH("b", "x" + sup("n"))} = n ${logH("b", "x")}. Base power rule: ${logH("b" + sup("m"), "x")} = ${frac(1, "m")} ${logH("b", "x")}. Change of base: ${logH("b", "x")} = ${frac("ln x", "ln b")}, where b &gt; 0, b &ne; 1 and x &gt; 0.`;
    const formula = `${logH("b", "x" + sup("n"))} = n ${logH("b", "x")}<br>${logH("b" + sup("m"), "x")} = ${frac(1, "m")} ${logH("b", "x")}<br>${logH("b", "x")} = ${frac("ln x", "ln b")}`;
    return resultTemplate(formula, joinSteps(blocks),
        (finalSym !== null ? `<strong>Final logarithmic form:</strong> ${finalSym}<br><br>` : "") + `<strong>Numerical answer:</strong> ${N(result.value)}`,
        lawText);
}

/* =========================================================
   INDICES / EXPONENTS
========================================================= */

function parseIdx(s) {
    let i = 0;
    const peek = () => s[i];
    function expr() {
        let node = null, first = true;
        const factors = [];
        for (;;) {
            let op = "*";
            if (!first) {
                const c = peek();
                if (c === "*" || c === "/") { op = c; i++; }
                else if (c && /[a-z(]/i.test(c)) op = "*";
                else break;
            }
            const start = i;
            const f = unary();
            f.src = s.slice(start, i);
            factors.push({ op, node: f });
            node = node ? { t: op === "*" ? "mul" : "div", a: node, b: f } : f;
            first = false;
        }
        node.factors = factors;
        return node;
    }
    function unary() {
        if (peek() === "-") { i++; return { t: "neg", a: unary() }; }
        if (peek() === "+") { i++; return unary(); }
        return power();
    }
    function power() {
        const base = atom();
        if (peek() === "^") {
            i++;
            let ex;
            if (peek() === "(") {
                i++; const e = expr();
                if (s[i] !== ")") throw new Error("Missing closing bracket.");
                i++; ex = e;
            } else {
                const m = s.slice(i).match(/^-?\d+(\.\d+)?/);
                if (!m) throw new Error("Use a number or a bracket after ^.");
                i += m[0].length; ex = { t: "num", v: Number(m[0]) };
            }
            if (peek() === "^") throw new Error("Use brackets for stacked powers, for example (2^3)^2.");
            return { t: "pow", a: base, e: ex };
        }
        return base;
    }
    function atom() {
        const c = peek();
        if (c === "(") {
            const start = i; i++;
            const e = expr();
            if (s[i] !== ")") throw new Error("Missing closing bracket.");
            i++;
            return { t: "group", a: e, src: s.slice(start, i) };
        }
        const m = s.slice(i).match(/^\d+(\.\d+)?/);
        if (m) { i += m[0].length; return { t: "num", v: Number(m[0]) }; }
        if (c && /[a-z]/i.test(c)) { i++; return { t: "var", name: c }; }
        throw new Error("Unexpected character in the expression.");
    }
    const tree = expr();
    if (i < s.length) throw new Error("Unexpected character in the expression.");
    return tree;
}

function numEvalIdx(n) {
    if (n.t === "num") return n.v;
    if (n.t === "neg") return -numEvalIdx(n.a);
    if (n.t === "group") return numEvalIdx(n.a);
    if (n.t === "mul") return numEvalIdx(n.a) * numEvalIdx(n.b);
    if (n.t === "div") return numEvalIdx(n.a) / numEvalIdx(n.b);
    if (n.t === "pow") return Math.pow(numEvalIdx(n.a), numEvalIdx(n.e));
    throw new Error("Exponents must be numbers.");
}

const frKeyHtml = (key, e) => (e.n === 1 && e.d === 1) ? key : `${key}${sup(e.d === 1 ? Nn(e.n) : `${Nn(e.n)}/${e.d}`)}`;

function monoOf(n, events) {
    const copyM = m => ({ coef: m.coef, vars: new Map(m.vars) });
    switch (n.t) {
        case "num": {
            if (Number.isInteger(n.v) && n.v >= 2) return { coef: 1, vars: new Map([[String(n.v), fr(1)]]) };
            return { coef: n.v, vars: new Map() };
        }
        case "var": return { coef: 1, vars: new Map([[n.name, fr(1)]]) };
        case "neg": { const m = copyM(monoOf(n.a, events)); m.coef = -m.coef; return m; }
        case "group": {
            const m = monoOf(n.a, events);
            if (n.a.t === "mul" || n.a.t === "div") events.push({ kind: "inside", src: n.src, m: copyM(m) });
            return m;
        }
        case "mul": case "div": {
            const a = copyM(monoOf(n.a, events)), b = monoOf(n.b, events);
            if (n.t === "mul") { a.coef *= b.coef; b.vars.forEach((e, k) => a.vars.set(k, a.vars.has(k) ? frAdd(a.vars.get(k), e) : e)); }
            else { a.coef /= b.coef; b.vars.forEach((e, k) => a.vars.set(k, a.vars.has(k) ? frAdd(a.vars.get(k), fr(-e.n, e.d)) : fr(-e.n, e.d))); }
            return a;
        }
        case "pow": {
            const exV = numEvalIdx(n.e);
            const r = rationalize(exV);
            if (!r) throw new Error("The exponent must be a rational number.");
            const bm = monoOf(n.a, events);
            const out = { coef: Math.pow(bm.coef, exV), vars: new Map() };
            if (!Number.isFinite(out.coef)) throw new Error("This power is not a real number.");
            bm.vars.forEach((e, k) => out.vars.set(k, frMul(e, r)));
            if (n.a.t === "group" && bm.vars.size) events.push({ kind: "power", before: copyM(bm), r, after: copyM(out) });
            return out;
        }
    }
    throw new Error("Unsupported expression.");
}
function monoHtml(m) {
    const parts = [];
    m.vars.forEach((e, k) => { if (e.n !== 0) parts.push(frKeyHtml(k, e)); });
    const body = parts.join(` ${TIMES} `);
    if (m.coef === 1) return body || "1";
    if (m.coef === -1) return MINUS + (body || "1");
    return `${Nn(m.coef)}${body ? " " + TIMES + " " + body : ""}`;
}

function calculateIndices(raw) {
    const original = String(raw || "").trim();
    if (!original) return errorMessage("Enter an index expression, e.g. 2^3 * 2^4, 3^5 / 3^2, (2^3)^2 or x^5 * x^2.");
    const s = normalizeSuperscriptPowers(original).replace(/[×·]/g, "*").replace(/÷/g, "/").replace(/[−–—]/g, "-").replace(/\s+/g, "");
    if (/[^0-9a-zA-Z.+\-*\/^()]/.test(s)) return errorMessage("Use numbers, letters, brackets and the symbols + - * / ^ only.");

    /* Sums and differences: evaluate each power first, then add/subtract */
    const topLevelSum = (() => { let d = 0; for (let k = 1; k < s.length; k++) { const c = s[k]; if (c === "(") d++; else if (c === ")") d--; else if (d === 0 && (c === "+" || c === "-") && s[k - 1] !== "^" && s[k - 1] !== "(" && s[k - 1] !== "*" && s[k - 1] !== "/") return true; } return false; })();
    if (topLevelSum) {
        if (/[a-zA-Z]/.test(s)) return errorMessage("Expressions with letters and + or &minus; cannot be combined into one index form here. Use only &times; and &divide; between terms.");
        let value;
        try { value = Function('"use strict"; return (' + s.replace(/\^/g, "**") + ");")(); } catch (e) { return errorMessage("That expression could not be read. Check the powers and brackets."); }
        if (!Number.isFinite(value)) return errorMessage("The expression does not give a finite number.");
        const powers = []; let replaced = s;
        const re = /(\d+(?:\.\d+)?)\^\(?(-?\d+(?:\.\d+)?)\)?/g; let m;
        while ((m = re.exec(s))) powers.push({ b: Number(m[1]), e: Number(m[2]), text: m[0] });
        powers.forEach(p => { replaced = replaced.replace(p.text, `(${N(Math.pow(p.b, p.e))})`); });
        const st = [];
        st.push(step(1, "Read the expression", pretty(original)));
        if (powers.length) st.push(step(2, "Evaluate each power separately first", powers.map(p => `${N(p.b)}${sup(Nn(p.e))} = ${N(Math.pow(p.b, p.e))}`).join("<br>")));
        st.push(step(st.length + 1, "Substitute the values and complete the + and &minus; operations", `${pretty(replaced)} = <strong>${N(value)}</strong>`));
        return resultTemplate("Evaluate powers first (BODMAS), then add and subtract.", joinSteps(st), `<strong>Numerical answer:</strong> ${N(value)}`, "Powers are evaluated before addition and subtraction.");
    }

    let tree;
    try { tree = parseIdx(s); } catch (e) { return errorMessage(e.message || "That expression could not be read."); }
    const events = [];
    let factors;
    try {
        factors = tree.factors.map(f => ({ op: f.op, src: f.node.src, mono: monoOf(f.node, events) }));
    } catch (e) { return errorMessage(e.message || "That expression could not be evaluated."); }

    const st = []; let n = 1;
    const push = (t, b) => st.push(step(n++, t, b));
    const laws = [];
    push("Read the expression and its factors", `${pretty(original)}<br>Factors: ${factors.map((f, i) => (i ? (f.op === "*" ? ` ${TIMES} ` : ` ${DIVS} `) : "") + pretty(f.src)).join("")}`);

    const insideEv = events.filter(e => e.kind === "inside");
    const powerEv = events.filter(e => e.kind === "power");
    if (powerEv.length) {
        laws.push("Power of a power: (a^m)^n = a^(m &times; n)");
        push("Apply the power of a power rule", powerEv.map(ev => {
            const lines = [];
            const rTxt = ev.r.d === 1 ? Nn(ev.r.n) : `${Nn(ev.r.n)}/${ev.r.d}`;
            ev.before.vars.forEach((e, k) => {
                const ne = frMul(e, ev.r);
                const eTxt = e.d === 1 ? Nn(e.n) : `${Nn(e.n)}/${e.d}`;
                lines.push(`(${frKeyHtml(k, e)})${sup(rTxt)} = ${k}${sup(`(${eTxt} ${TIMES} ${ev.r.n < 0 || ev.r.d > 1 ? "(" + rTxt + ")" : rTxt})`)} = ${frKeyHtml(k, ne)}`);
            });
            return lines.join("<br>");
        }).join("<br>"));
    }
    if (insideEv.length) {
        push("Simplify inside the brackets first", insideEv.map(ev => `${pretty(ev.src)} = ${monoHtml(ev.m)}`).join("<br>"));
    }

    /* common prime base */
    const numKeys = [...new Set(factors.flatMap(f => [...f.mono.vars.keys()].filter(k => /^\d+$/.test(k))))];
    let working = factors.map(f => ({ op: f.op, mono: { coef: f.mono.coef, vars: new Map(f.mono.vars) } }));
    if (numKeys.length >= 2) {
        const primeSets = numKeys.map(k => factorInt(Number(k)).map(([p]) => p));
        const shared = primeSets.some((ps, i) => ps.some(p => primeSets.some((qs, j) => j !== i && qs.includes(p))));
        if (shared) {
            const lines = numKeys.filter(k => { const f = factorInt(Number(k)); return !(f.length === 1 && f[0][1] === 1); }).map(k => `${k} = ${factorInt(Number(k)).map(([p, e]) => e === 1 ? p : p + sup(e)).join(` ${TIMES} `)}`);
            push("Write the numeric bases as prime numbers so that equal bases can be compared", lines.join("<br>") || "All bases are already prime.");
            working = working.map(f => {
                const vars = new Map();
                f.mono.vars.forEach((e, k) => {
                    if (/^\d+$/.test(k)) factorInt(Number(k)).forEach(([p, pe]) => { const add = frMul(e, fr(pe)); const key = String(p); vars.set(key, vars.has(key) ? frAdd(vars.get(key), add) : add); });
                    else vars.set(k, vars.has(k) ? frAdd(vars.get(k), e) : e);
                });
                return { op: f.op, mono: { coef: f.mono.coef, vars } };
            });
            push("Rewrite each factor with the prime bases", working.map((f, i) => (i ? (f.op === "*" ? ` ${TIMES} ` : ` ${DIVS} `) : "") + monoHtml(f.mono)).join(""));
        }
    }

    /* group by base */
    const keyOrder = [];
    working.forEach(f => f.mono.vars.forEach((e, k) => { if (!keyOrder.includes(k)) keyOrder.push(k); }));
    const finalVars = new Map(); let coef = 1;
    const groupLines = []; let usedProduct = false, usedQuotient = false;
    working.forEach(f => { coef = f.op === "*" ? coef * f.mono.coef : coef / f.mono.coef; });
    keyOrder.forEach(k => {
        const contribs = [];
        working.forEach(f => { if (f.mono.vars.has(k)) contribs.push({ op: f.op, e: f.mono.vars.get(k) }); });
        let total = fr(0);
        contribs.forEach(c => { total = frAdd(total, c.op === "*" ? c.e : fr(-c.e.n, c.e.d)); });
        finalVars.set(k, total);
        if (contribs.length > 1) {
            const hasDiv = contribs.some((c, i) => c.op === "/");
            if (hasDiv) usedQuotient = true;
            if (contribs.some((c, i) => i > 0 && c.op === "*") || (contribs[0].op === "*" && contribs.length > 1)) usedProduct = true;
            const lhs = contribs.map((c, i) => (i ? (c.op === "*" ? ` ${TIMES} ` : ` ${DIVS} `) : "") + frKeyHtml(k, c.e)).join("");
            const sumTxt = contribs.map((c, i) => (i === 0 ? (c.op === "/" ? MINUS : "") : (c.op === "*" ? " + " : ` ${MINUS} `)) + (c.e.d === 1 && c.e.n >= 0 ? Nn(c.e.n) : `(${frHtml(c.e)})`)).join("");
            groupLines.push(`${lhs}<br>= ${k}${sup(`(${sumTxt})`)} = ${frKeyHtml(k, total)}`);
        } else {
            const c = contribs[0];
            const t = c.op === "/" ? fr(-c.e.n, c.e.d) : c.e;
            groupLines.push(`${frKeyHtml(k, c.e)}${c.op === "/" ? ` appears once as a divisor, so its index changes sign: ${frKeyHtml(k, t)}` : " appears once, so it stays as it is."}`);
        }
    });
    if (usedProduct) laws.push("Product rule: a^m &times; a^n = a^(m+n)");
    if (usedQuotient) laws.push("Quotient rule: a^m &divide; a^n = a^(m&minus;n), a &ne; 0");
    push("Combine the indices of each base", (laws.length ? laws.join("<br>") + "<br><br>" : "") + groupLines.join("<br><br>"));

    /* special exponents */
    const finalMono = { coef, vars: finalVars };
    const notes = [];
    finalVars.forEach((e, k) => {
        if (e.n === 0) notes.push(`${k}${sup(0)} = 1 (any non-zero number to the power 0 is 1)`);
        else if (e.n < 0) notes.push(`${frKeyHtml(k, e)} = ${frac(1, frKeyHtml(k, fr(-e.n, e.d)))} (negative index: a${sup(MINUS + "n")} = ${frac(1, "a" + sup("n"))})`);
        if (e.d > 1) notes.push(`${frKeyHtml(k, e)} = ${e.d === 2 ? "&radic;" : sup(e.d) + "&radic;"}(${frKeyHtml(k, fr(Math.abs(e.n)))}) (fractional index: a${sup("m/n")} = n-th root of a${sup("m")})`);
    });
    if (notes.length) push("Handle zero, negative and fractional indices", notes.join("<br>"));

    /* index form */
    const pos = [], neg = [];
    finalVars.forEach((e, k) => { if (e.n > 0) pos.push(frKeyHtml(k, e)); else if (e.n < 0) neg.push(frKeyHtml(k, fr(-e.n, e.d))); });
    const numerBody = pos.join(` ${TIMES} `) || "1";
    const denomBody = neg.join(` ${TIMES} `);
    let indexForm = denomBody ? frac(numerBody, denomBody) : numerBody;
    if (coef !== 1) indexForm = `${Nn(coef)} ${TIMES} ${indexForm}`;
    push("Write the answer in index form", indexForm);

    /* numerical evaluation */
    let numeric = coef; const numLines = []; const letters = [];
    finalVars.forEach((e, k) => {
        if (/^\d+$/.test(k)) {
            const v = Math.pow(Number(k), frVal(e));
            numeric *= v;
            if (e.n !== 0) numLines.push(`${frKeyHtml(k, e)} = ${N(v)}`);
        } else if (e.n !== 0) letters.push(frKeyHtml(k, e));
    });
    if (numLines.length || coef !== 1) {
        push(letters.length ? "Evaluate the numerical powers" : "Evaluate the powers and multiply", (numLines.length ? numLines.join("<br>") + "<br>" : "") + (numLines.length > 1 || coef !== 1 ? `Numerical part = ${[coef !== 1 ? par(coef) : null, ...numLines.map(l => l.split(" = ")[1])].filter(x => x !== null).join(` ${TIMES} `)} = ${N(numeric)}` : ""));
    }
    const answerLetters = letters.join(` ${TIMES} `);
    const simplified = answerLetters ? ((numeric === 1 ? "" : (numeric === -1 ? MINUS : N(numeric))) + answerLetters) : N(numeric);
    return resultTemplate(
        "a<sup>m</sup> &times; a<sup>n</sup> = a<sup>m+n</sup><br>a<sup>m</sup> &divide; a<sup>n</sup> = a<sup>m&minus;n</sup><br>(a<sup>m</sup>)<sup>n</sup> = a<sup>mn</sup><br>a<sup>0</sup> = 1; a<sup>&minus;n</sup> = " + frac(1, "a<sup>n</sup>"),
        joinSteps(st),
        `<strong>Index form:</strong> ${indexForm}` + (answerLetters || numeric !== 1 || true ? `<br><br><strong>${letters.length ? "Simplified answer" : "Numerical answer"}:</strong> ${simplified}` : ""),
        laws.length ? laws.join("; ") : "Evaluate the powers first, then complete the remaining operations.");
}

/* =========================================================
   SETS  (with Venn diagram)
========================================================= */

let vennCounter = 0;
function vennSvg(opt) {
    const id = ++vennCounter;
    const hi = new Set(opt.highlight || []);
    const fill = "rgba(46,134,222,0.35)";
    const two = opt.mode !== "single";
    const cA = two ? { cx: 125, cy: 100, r: 65 } : { cx: 170, cy: 100, r: 70 };
    const cB = { cx: 215, cy: 100, r: 65 };
    const txt = (arr, x, y) => {
        if (!arr || !arr.length) return "";
        const shown = arr.slice(0, 12), chunks = [];
        for (let i = 0; i < shown.length; i += 3) chunks.push(shown.slice(i, i + 3).join(", "));
        if (arr.length > 12) chunks[chunks.length - 1] += " ...";
        const y0 = y - ((chunks.length - 1) * 7);
        return chunks.map((c, i) => `<text x="${x}" y="${y0 + i * 14}" text-anchor="middle" font-size="12" fill="currentColor">${E(c)}</text>`).join("");
    };
    let defs = "", shapes = "";
    if (two) {
        defs = `<clipPath id="vc${id}"><circle cx="${cB.cx}" cy="${cB.cy}" r="${cB.r}"/></clipPath>` +
            `<mask id="vmA${id}"><rect width="340" height="200" fill="white"/><circle cx="${cB.cx}" cy="${cB.cy}" r="${cB.r}" fill="black"/></mask>` +
            `<mask id="vmB${id}"><rect width="340" height="200" fill="white"/><circle cx="${cA.cx}" cy="${cA.cy}" r="${cA.r}" fill="black"/></mask>` +
            `<mask id="vmO${id}"><rect width="340" height="200" fill="white"/><circle cx="${cA.cx}" cy="${cA.cy}" r="${cA.r}" fill="black"/><circle cx="${cB.cx}" cy="${cB.cy}" r="${cB.r}" fill="black"/></mask>`;
        if (hi.has("O")) shapes += `<rect x="5" y="5" width="330" height="190" fill="${fill}" mask="url(#vmO${id})"/>`;
        if (hi.has("A")) shapes += `<circle cx="${cA.cx}" cy="${cA.cy}" r="${cA.r}" fill="${fill}" mask="url(#vmA${id})"/>`;
        if (hi.has("B")) shapes += `<circle cx="${cB.cx}" cy="${cB.cy}" r="${cB.r}" fill="${fill}" mask="url(#vmB${id})"/>`;
        if (hi.has("AB")) shapes += `<circle cx="${cA.cx}" cy="${cA.cy}" r="${cA.r}" fill="${fill}" clip-path="url(#vc${id})"/>`;
    } else {
        defs = `<mask id="vmO${id}"><rect width="340" height="200" fill="white"/><circle cx="${cA.cx}" cy="${cA.cy}" r="${cA.r}" fill="black"/></mask>`;
        if (hi.has("O")) shapes += `<rect x="5" y="5" width="330" height="190" fill="${fill}" mask="url(#vmO${id})"/>`;
        if (hi.has("A")) shapes += `<circle cx="${cA.cx}" cy="${cA.cy}" r="${cA.r}" fill="${fill}"/>`;
    }
    const outline = `<rect x="5" y="5" width="330" height="190" fill="none" stroke="currentColor" stroke-width="1.5" rx="6"/>` +
        `<circle cx="${cA.cx}" cy="${cA.cy}" r="${cA.r}" fill="none" stroke="currentColor" stroke-width="1.5"/>` +
        (two ? `<circle cx="${cB.cx}" cy="${cB.cy}" r="${cB.r}" fill="none" stroke="currentColor" stroke-width="1.5"/>` : "");
    const labels = `<text x="14" y="22" font-size="13" font-weight="bold" fill="currentColor">U</text>` +
        `<text x="${cA.cx - cA.r + 6}" y="${cA.cy - cA.r + 4}" font-size="13" font-weight="bold" fill="currentColor">A</text>` +
        (two ? `<text x="${cB.cx + cB.r - 14}" y="${cB.cy - cB.r + 4}" font-size="13" font-weight="bold" fill="currentColor">B</text>` : "");
    const r = opt.regions || {};
    const content = two
        ? txt(r.A, 90, 100) + txt(r.AB, 170, 100) + txt(r.B, 250, 100) + txt(r.O, 170, 178)
        : txt(r.A, 170, 100) + txt(r.O, 60, 100);
    return `<div style="text-align:center;margin:8px 0;"><svg viewBox="0 0 340 200" style="width:100%;max-width:340px;" role="img" aria-label="Venn diagram"><defs>${defs}</defs>${shapes}${outline}${labels}${content}</svg></div>`;
}

const setFmt = arr => (!arr || !arr.length) ? "&empty;" : `{${arr.map(E).join(", ")}}`;
const parseSetValues = v => (typeof v === "string" && v.trim() !== "") ? [...new Set(v.split(",").map(x => x.trim()).filter(x => x !== ""))] : [];

function calculateSets(v) {
    const A = parseSetValues(v.setA), B = parseSetValues(v.setB), U = parseSetValues(v.universal);
    const op = v.operation;
    const needBoth = ["union", "intersection", "differenceAB", "differenceBA", "symmetric", "subset", "properSubset", "disjoint", "cartesian"];
    if (needBoth.includes(op) && (!A.length || !B.length)) return errorMessage("Enter both Set A and Set B.");
    if (["complementA", "complementB"].includes(op)) {
        const S = op === "complementA" ? A : B;
        if (!S.length || !U.length) return errorMessage("Enter the required set and the Universal Set U.");
    }
    if (op === "cardinalityA" && !A.length) return errorMessage("Enter Set A.");
    if (op === "cardinalityB" && !B.length) return errorMessage("Enter Set B.");
    if (op === "powerSetA") {
        if (!A.length) return errorMessage("Enter Set A.");
        if (A.length > 10) return errorMessage("For practical use, the power set is limited to sets with 10 or fewer elements.");
    }
    const onlyA = A.filter(x => !B.includes(x)), both = A.filter(x => B.includes(x)), onlyB = B.filter(x => !A.includes(x));
    const st = []; let n = 1;
    const push = (t, b) => st.push(step(n++, t, b));
    const nA = A.length, nB = B.length, nI = both.length;
    const setsLine = `A = ${setFmt(A)}, so n(A) = ${nA}` + (B.length ? `<br>B = ${setFmt(B)}, so n(B) = ${nB}` : "") + (U.length ? `<br>U = ${setFmt(U)}, so n(U) = ${U.length}` : "");
    const regionsStep = () => push("Sort every element into its region",
        `Only in A (A &minus; B): ${setFmt(onlyA)}<br>In both A and B (A &cap; B): ${setFmt(both)}<br>Only in B (B &minus; A): ${setFmt(onlyB)}`);
    const venn2 = hl => push("Show it on a Venn diagram", vennSvg({ regions: { A: onlyA, AB: both, B: onlyB, O: U.filter(x => !A.includes(x) && !B.includes(x)) }, highlight: hl }));
    let formula, answer, note = "";

    switch (op) {
        case "union": {
            const un = [...new Set([...A, ...B])];
            formula = "A &cup; B = { x : x &isin; A or x &isin; B }";
            push("Write down the sets", setsLine); regionsStep();
            push("Join the three regions (every element once)", `A &cup; B = ${setFmt(onlyA)} &cup; ${setFmt(both)} &cup; ${setFmt(onlyB)} = ${setFmt(un)}`);
            push("Check the count with the inclusion&ndash;exclusion rule", `n(A &cup; B) = n(A) + n(B) &minus; n(A &cap; B) = ${nA} + ${nB} &minus; ${nI} = ${nA + nB - nI}`);
            venn2(["A", "AB", "B"]); answer = `A &cup; B = ${setFmt(un)}`; note = "The union contains every element that is in A, in B, or in both, written once."; break;
        }
        case "intersection": {
            formula = "A &cap; B = { x : x &isin; A and x &isin; B }";
            push("Write down the sets", setsLine);
            push("Test each element of A: is it also in B?", A.map(x => `${E(x)} &isin; B? ${B.includes(x) ? "Yes" : "No"}`).join("<br>"));
            push("Keep only the elements that are in both sets", `A &cap; B = ${setFmt(both)}, so n(A &cap; B) = ${nI}`);
            venn2(["AB"]); answer = `A &cap; B = ${setFmt(both)}`; note = "The intersection contains only the elements common to both sets."; break;
        }
        case "differenceAB": case "differenceBA": {
            const first = op === "differenceAB" ? A : B, second = op === "differenceAB" ? B : A, res = op === "differenceAB" ? onlyA : onlyB;
            const f = op === "differenceAB" ? "A" : "B", s = op === "differenceAB" ? "B" : "A";
            formula = `${f} &minus; ${s} = { x : x &isin; ${f} and x &notin; ${s} }`;
            push("Write down the sets", setsLine);
            push(`Test each element of ${f}: is it missing from ${s}?`, first.map(x => `${E(x)} &isin; ${s}? ${second.includes(x) ? "Yes &rarr; remove it" : "No &rarr; keep it"}`).join("<br>"));
            push("Collect the elements that were kept", `${f} &minus; ${s} = ${setFmt(res)}`);
            push("Check the count", `n(${f} &minus; ${s}) = n(${f}) &minus; n(A &cap; B) = ${first.length} &minus; ${nI} = ${first.length - nI}`);
            venn2([op === "differenceAB" ? "A" : "B"]); answer = `${f} &minus; ${s} = ${setFmt(res)}`; note = `Elements of ${f} that do not belong to ${s}.`; break;
        }
        case "symmetric": {
            const sd = [...onlyA, ...onlyB];
            formula = "A &Delta; B = (A &minus; B) &cup; (B &minus; A)";
            push("Write down the sets", setsLine); regionsStep();
            push("Join the two outer regions", `A &Delta; B = ${setFmt(onlyA)} &cup; ${setFmt(onlyB)} = ${setFmt(sd)}`);
            push("Check the count", `n(A &Delta; B) = n(A) + n(B) &minus; 2 n(A &cap; B) = ${nA} + ${nB} &minus; 2(${nI}) = ${nA + nB - 2 * nI}`);
            venn2(["A", "B"]); answer = `A &Delta; B = ${setFmt(sd)}`; note = "The symmetric difference contains elements that are in exactly one of the two sets."; break;
        }
        case "complementA": case "complementB": {
            const S = op === "complementA" ? A : B, nm = op === "complementA" ? "A" : "B";
            const inS = U.filter(x => S.includes(x)), comp = U.filter(x => !S.includes(x));
            formula = `${nm}&prime; = U &minus; ${nm} = { x &isin; U : x &notin; ${nm} }`;
            push("Write down the sets", `${nm} = ${setFmt(S)}<br>U = ${setFmt(U)}, so n(U) = ${U.length}`);
            push(`Test each element of U: is it in ${nm}?`, U.map(x => `${E(x)} &isin; ${nm}? ${S.includes(x) ? "Yes &rarr; remove it" : "No &rarr; keep it"}`).join("<br>"));
            push("Collect the kept elements", `${nm}&prime; = ${setFmt(comp)}`);
            push("Check the count", `n(${nm}&prime;) = n(U) &minus; n(${nm}) = ${U.length} &minus; ${inS.length} = ${comp.length}`);
            push("Show it on a Venn diagram", vennSvg({ mode: "single", regions: { A: inS, O: comp }, highlight: ["O"] }));
            answer = `${nm}&prime; = ${setFmt(comp)}`; note = S.some(x => !U.includes(x)) ? `Note: some elements of ${nm} are not in U; they are ignored in the complement.` : "The complement contains every element of U that is not in the set."; break;
        }
        case "cardinalityA": case "cardinalityB": {
            const S = op === "cardinalityA" ? A : B, nm = op === "cardinalityA" ? "A" : "B";
            formula = `n(${nm}) = number of distinct elements in ${nm}`;
            push("Write the set", `${nm} = ${setFmt(S)}`);
            push("Count the distinct elements", S.map((x, i) => `${i + 1}. ${E(x)}`).join("<br>"));
            answer = `n(${nm}) = ${S.length}`; note = "Repeated elements are counted once."; break;
        }
        case "subset": case "properSubset": {
            const isSub = A.every(x => B.includes(x));
            const proper = isSub && nA < nB;
            formula = op === "subset" ? "A &sube; B if every element of A is in B" : "A &sub; B if A &sube; B and A &ne; B";
            push("Write down the sets", setsLine);
            push("Check every element of A against B", A.map(x => `${E(x)} &isin; B? ${B.includes(x) ? "Yes" : "No"}`).join("<br>"));
            if (op === "subset") push("Decide", isSub ? "Every element of A is in B, so A &sube; B." : "At least one element of A is not in B, so A is not a subset of B.");
            else push("Decide", `A &sube; B? ${isSub ? "Yes" : "No"}<br>n(A) &lt; n(B)? ${nA} &lt; ${nB} is ${nA < nB ? "true" : "false"}<br>${proper ? "Both conditions hold, so A is a proper subset of B." : "Both conditions are not met, so A is not a proper subset of B."}`);
            venn2([]); answer = op === "subset" ? (isSub ? "A &sube; B &mdash; YES" : "A &sube; B &mdash; NO") : (proper ? "A &sub; B &mdash; YES" : "A &sub; B &mdash; NO");
            note = "A proper subset must also be smaller than the larger set."; break;
        }
        case "disjoint": {
            formula = "A and B are disjoint if A &cap; B = &empty;";
            push("Write down the sets", setsLine);
            push("Find the common elements", `A &cap; B = ${setFmt(both)}`);
            push("Decide", both.length === 0 ? "The intersection is empty, so the sets are disjoint." : "The intersection is not empty, so the sets are not disjoint.");
            venn2(["AB"]); answer = both.length === 0 ? "A and B are DISJOINT." : "A and B are NOT DISJOINT."; break;
        }
        case "cartesian": {
            formula = "A &times; B = { (a, b) : a &isin; A, b &isin; B }";
            push("Write down the sets", setsLine);
            push("Pair each element of A with every element of B",
                `<div style="overflow-x:auto;"><table style="border-collapse:collapse;margin:6px 0;"><thead><tr><th style="border:1px solid #999;padding:4px 8px;">A \\ B</th>${B.map(b => `<th style="border:1px solid #999;padding:4px 8px;">${E(b)}</th>`).join("")}</tr></thead><tbody>` +
                A.map(a => `<tr><th style="border:1px solid #999;padding:4px 8px;">${E(a)}</th>${B.map(b => `<td style="border:1px solid #999;padding:4px 8px;text-align:center;">(${E(a)}, ${E(b)})</td>`).join("")}</tr>`).join("") + `</tbody></table></div>`);
            push("Count the ordered pairs", `n(A &times; B) = n(A) &times; n(B) = ${nA} &times; ${nB} = ${nA * nB}`);
            answer = `A &times; B = {${A.flatMap(a => B.map(b => `(${E(a)}, ${E(b)})`)).join(", ")}}`; note = "Order matters in each pair: (a, b) is not the same as (b, a)."; break;
        }
        case "powerSetA": {
            formula = "n(P(A)) = 2<sup>n</sup>";
            push("Write the set", `A = ${setFmt(A)}, n = ${nA}`);
            push("Count the subsets", `Number of subsets = 2${sup(nA)} = ${Math.pow(2, nA)}`);
            const subsets = [[]];
            A.forEach(el => { subsets.push(...subsets.map(sb => [...sb, el])); });
            const bySize = []; for (let k = 0; k <= nA; k++) bySize.push(subsets.filter(sb => sb.length === k));
            push("List the subsets by size", bySize.map((g, k) => `<strong>Size ${k}</strong> (${g.length}): ${g.map(sb => setFmt(sb)).join(", ")}`).join("<br>"));
            push("Check the total", `${bySize.map(g => g.length).join(" + ")} = ${Math.pow(2, nA)}`);
            answer = `P(A) = {${subsets.map(sb => setFmt(sb)).join(", ")}}`; note = "Every set has the empty set and itself as subsets."; break;
        }
        default: return errorMessage("Please select a valid set operation.");
    }
    return resultTemplate(formula, joinSteps(st), answer, note);
}

/* =========================================================
   MATRICES
========================================================= */

const cellStyle = "padding:4px 12px;text-align:center;";
function mx(M, fmt) {
    const f = fmt || (x => typeof x === "string" ? x : entryHtml(x));
    return `<table style="display:inline-table;vertical-align:middle;border-collapse:collapse;border-left:2px solid currentColor;border-right:2px solid currentColor;border-radius:8px;margin:4px 6px;"><tbody>` +
        M.map(row => `<tr>${row.map(x => `<td style="${cellStyle}">${f(x)}</td>`).join("")}</tr>`).join("") + `</tbody></table>`;
}
function entryHtml(v) {
    if (typeof v !== "number") return String(v);
    const r = Number.isInteger(v) ? null : rationalize(v, 200);
    return r && r.d > 1 ? frHtml(r) : Nn(v);
}
const det2 = (a, b, c, d) => a * d - b * c;
const minorOf = (M, i, j) => M.filter((_, r) => r !== i).map(row => row.filter((_, c) => c !== j));
function det2Work(m) {
    const [[a, b], [c, d]] = m;
    return `(${par(a)} ${TIMES} ${par(d)}) ${MINUS} (${par(b)} ${TIMES} ${par(c)}) = ${par(a * d)} ${MINUS} ${par(b * c)} = ${Nn(det2(a, b, c, d))}`;
}
function detSteps(A, push, label) {
    const n = A.length;
    if (n === 1) { push(`Find the determinant of ${label}`, `For a 1&times;1 matrix, det = the single entry = ${Nn(A[0][0])}`); return A[0][0]; }
    if (n === 2) {
        push(`Find the determinant of ${label}`, `Rule: for ${mx([["a", "b"], ["c", "d"]])} det = ad &minus; bc<br>${det2Work(A)}`);
        return det2(A[0][0], A[0][1], A[1][0], A[1][1]);
    }
    const minors = [0, 1, 2].map(j => minorOf(A, 0, j));
    const mv = minors.map(m => det2(m[0][0], m[0][1], m[1][0], m[1][1]));
    push("Find the three minors from row 1 (cross out the row and column of each entry)",
        minors.map((m, j) => `Minor M${sub("1" + (j + 1))} = ${mx(m)}<br>= ${det2Work(m)}`).join("<br><br>"));
    const total = A[0][0] * mv[0] - A[0][1] * mv[1] + A[0][2] * mv[2];
    push(`Expand along row 1 to find the determinant of ${label}`,
        `Rule: det = a${sub(11)}M${sub(11)} ${MINUS} a${sub(12)}M${sub(12)} + a${sub(13)}M${sub(13)}<br>` +
        `det = ${par(A[0][0])}(${Nn(mv[0])}) ${MINUS} ${par(A[0][1])}(${Nn(mv[1])}) + ${par(A[0][2])}(${Nn(mv[2])})<br>` +
        `det = ${Nn(A[0][0] * mv[0])} ${MINUS} (${Nn(A[0][1] * mv[1])}) + ${par(A[0][2] * mv[2])} = <strong>${Nn(total)}</strong>`);
    return total;
}
function calculateMatrices(v) {
    const op = v.matrixOperation;
    const ra = clampInt(v.matrixRowsA, 1, 3), ca = clampInt(v.matrixColsA, 1, 3);
    if (!ra || !ca) return errorMessage("Matrix A dimensions must be whole numbers from 1 to 3.");
    const needB = ["add", "subtract", "multiply"].includes(op);
    const rb = needB ? clampInt(v.matrixRowsB, 1, 3) : null, cb = needB ? clampInt(v.matrixColsB, 1, 3) : null;
    if (needB && (!rb || !cb)) return errorMessage("Matrix B dimensions must be whole numbers from 1 to 3.");
    const A = readMatrix(v, "a", ra, ca);
    const B = needB ? readMatrix(v, "b", rb, cb) : null;
    if (["add", "subtract"].includes(op) && (ra !== rb || ca !== cb)) return errorMessage("For addition or subtraction, Matrix A and Matrix B must have the same dimensions.");
    if (op === "multiply" && ca !== rb) return errorMessage("For multiplication, the number of columns of A must equal the number of rows of B.");
    if (["determinantA", "inverseA"].includes(op) && ra !== ca) return errorMessage("A determinant or inverse requires a square Matrix A.");
    const st = []; let n = 1;
    const push = (t, b) => st.push(step(n++, t, b));
    const dims = `${ra}&times;${ca}`;

    if (op === "add" || op === "subtract") {
        const sign = op === "add" ? "+" : MINUS;
        push("Write both matrices", `A = ${mx(A)} B = ${mx(B)}<br>Both are ${dims}, so they can be ${op === "add" ? "added" : "subtracted"}.`);
        push(`${op === "add" ? "Add" : "Subtract"} the corresponding entries`, mx(A.map((row, i) => row.map((x, j) => `${par(x)} ${sign} ${par(B[i][j])}`))));
        const R = A.map((row, i) => row.map((x, j) => op === "add" ? x + B[i][j] : x - B[i][j]));
        push("Work out each entry", mx(R));
        return resultTemplate(op === "add" ? "(A + B)<sub>ij</sub> = a<sub>ij</sub> + b<sub>ij</sub>" : "(A &minus; B)<sub>ij</sub> = a<sub>ij</sub> &minus; b<sub>ij</sub>", joinSteps(st), `${op === "add" ? "A + B" : "A &minus; B"} = ${mx(R)}`, "The matrices must have the same dimensions.");
    }
    if (op === "multiply") {
        push("Write both matrices and check the dimensions", `A = ${mx(A)} B = ${mx(B)}<br>A is ${dims} and B is ${rb}&times;${cb}. The inner numbers match (${ca} = ${rb}), so AB exists and is ${ra}&times;${cb}.`);
        const R = Array.from({ length: ra }, () => Array(cb).fill(0));
        const lines = [];
        for (let i = 0; i < ra; i++) for (let j = 0; j < cb; j++) {
            const terms = [], vals = [];
            for (let k = 0; k < ca; k++) { R[i][j] += A[i][k] * B[k][j]; terms.push(`(${Nn(A[i][k])})(${Nn(B[k][j])})`); vals.push(par(A[i][k] * B[k][j])); }
            lines.push(`c${sub("" + (i + 1) + (j + 1))} = (row ${i + 1} of A) &middot; (column ${j + 1} of B) = ${terms.join(" + ")} = ${vals.join(" + ")} = <strong>${Nn(R[i][j])}</strong>`);
        }
        push("Each entry is a row of A multiplied by a column of B", lines.join("<br>"));
        push("Place the entries in the result matrix", mx(R));
        return resultTemplate("c<sub>ij</sub> = a<sub>i1</sub>b<sub>1j</sub> + a<sub>i2</sub>b<sub>2j</sub> + &hellip;", joinSteps(st), `AB = ${mx(R)}`, "In general AB and BA are not equal.");
    }
    if (op === "scalar") {
        const k = Number(v.matrixScalar);
        if (!Number.isFinite(k) || v.matrixScalar === "" || v.matrixScalar === undefined) return errorMessage("Enter a valid scalar value.");
        push("Write the matrix and the scalar", `k = ${Nn(k)}<br>A = ${mx(A)}`);
        push("Multiply every entry by k", mx(A.map(row => row.map(x => `${par(k)} ${TIMES} ${par(x)}`))));
        const R = A.map(row => row.map(x => k * x));
        push("Work out each entry", mx(R));
        return resultTemplate("(kA)<sub>ij</sub> = k &times; a<sub>ij</sub>", joinSteps(st), `${Nn(k)}A = ${mx(R)}`, "Scalar multiplication scales every entry.");
    }
    if (op === "transposeA") {
        const R = A[0].map((_, j) => A.map(row => row[j]));
        push("Write the matrix", `A = ${mx(A)}`);
        push("Turn each row into a column", A.map((row, i) => `Row ${i + 1} (${row.map(Nn).join(", ")}) becomes column ${i + 1}`).join("<br>"));
        push("Write the transpose", `A${sup("T")} = ${mx(R)}`);
        return resultTemplate("(A<sup>T</sup>)<sub>ij</sub> = a<sub>ji</sub>", joinSteps(st), `A${sup("T")} = ${mx(R)}`, `A ${dims} matrix becomes ${ca}&times;${ra}.`);
    }
    if (op === "determinantA") {
        push("Write the matrix", `A = ${mx(A)}`);
        const d = detSteps(A, push, "A");
        return resultTemplate(ra === 2 ? "det(A) = ad &minus; bc" : (ra === 3 ? "det(A) = a<sub>11</sub>M<sub>11</sub> &minus; a<sub>12</sub>M<sub>12</sub> + a<sub>13</sub>M<sub>13</sub>" : "det(A) = a"), joinSteps(st), `det(A) = ${Nn(d)}`, d === 0 ? "The determinant is zero, so A is singular and has no inverse." : "A non-zero determinant means the matrix has an inverse.");
    }
    if (op === "inverseA") {
        push("Write the matrix", `A = ${mx(A)}`);
        const d = detSteps(A, push, "A");
        if (Math.abs(d) < 1e-12) {
            push("Test whether the inverse exists", "det(A) = 0, so A is singular.");
            return resultTemplate("A<sup>&minus;1</sup> = " + frac(1, "det(A)") + " adj(A)", joinSteps(st), "No inverse exists.", "A matrix with zero determinant has no inverse.");
        }
        push("Test whether the inverse exists", `det(A) = ${Nn(d)} &ne; 0, so A<sup>&minus;1</sup> exists.`);
        let adj;
        if (ra === 1) {
            adj = [[1]];
        } else if (ra === 2) {
            adj = [[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]];
            push("Build the adjugate: swap the diagonal and change the signs of the other two entries", `${mx([["a", "b"], ["c", "d"]])} &rarr; ${mx([["d", MINUS + "b"], [MINUS + "c", "a"]])}<br>adj(A) = ${mx(adj)}`);
        } else {
            const cof = A.map((row, i) => row.map((_, j) => { const m = minorOf(A, i, j); return ((i + j) % 2 === 0 ? 1 : -1) * det2(m[0][0], m[0][1], m[1][0], m[1][1]); }));
            const lines = [];
            A.forEach((row, i) => row.forEach((_, j) => { const m = minorOf(A, i, j); const sg = (i + j) % 2 === 0 ? "+" : MINUS; lines.push(`C${sub("" + (i + 1) + (j + 1))} = ${sg}${mx(m)} = ${sg}(${det2(m[0][0], m[0][1], m[1][0], m[1][1])}) = ${Nn(cof[i][j])}`); }));
            push("Find every cofactor: C = (sign) &times; minor. The signs alternate: row 1 (+ &minus; +), row 2 (&minus; + &minus;), row 3 (+ &minus; +)", lines.join("<br>"));
            push("Write the cofactor matrix", mx(cof));
            adj = cof[0].map((_, j) => cof.map(row => row[j]));
            push("Transpose the cofactor matrix to get the adjugate", `adj(A) = ${mx(adj)}`);
        }
        const inv = adj.map(row => row.map(x => x / d));
        push("Multiply the adjugate by 1 &divide; det(A)", `A${sup(MINUS + "1")} = ${frac(1, Nn(d))} ${mx(adj)} = ${mx(adj.map(row => row.map(x => frac(Nn(x), Nn(d)))))}`);
        push("Simplify each entry", mx(inv));
        return resultTemplate("A<sup>&minus;1</sup> = " + frac(1, "det(A)") + " adj(A)", joinSteps(st), `A${sup(MINUS + "1")} = ${mx(inv)}`, "Check: A &times; A<sup>&minus;1</sup> should give the identity matrix.");
    }
    return errorMessage("Select a valid matrix operation.");
}

/* =========================================================
   DIFFERENTIATION & INTEGRATION  (visual answers)
========================================================= */

const isC = n => n && n.kind === "const";
const cst = v => ({ kind: "const", value: v });

/* ---- polynomial (power-of-x) maps: exponent -> coefficient ---- */
const pRound = e => Math.round(e * 1e9) / 1e9;
function pmul(a, b) {
    const out = new Map();
    a.forEach((ca, ea) => b.forEach((cb, eb) => { const e = pRound(ea + eb); out.set(e, (out.get(e) || 0) + ca * cb); }));
    return out;
}
function toPoly(n, strict) {
    const isConstP = p => p.size === 1 && p.has(0);
    switch (n.kind) {
        case "const": return new Map([[0, n.value]]);
        case "var": return new Map([[1, 1]]);
        case "neg": { const p = toPoly(n.arg, strict); if (!p) return null; const o = new Map(); p.forEach((c, e) => o.set(e, -c)); return o; }
        case "+": case "-": {
            const a = toPoly(n.left, strict), b = toPoly(n.right, strict);
            if (!a || !b) return null;
            const out = new Map(a);
            b.forEach((c, e) => out.set(e, (out.get(e) || 0) + (n.kind === "+" ? c : -c)));
            return out;
        }
        case "*": {
            const a = toPoly(n.left, strict), b = toPoly(n.right, strict);
            if (!a || !b) return null;
            if (strict && !(isConstP(a) || isConstP(b))) return null;
            return pmul(a, b);
        }
        case "/": {
            const a = toPoly(n.left, strict), b = toPoly(n.right, strict);
            if (!a || !b || b.size !== 1) return null;
            const [e, c] = [...b.entries()][0];
            if (c === 0) return null;
            const out = new Map(); a.forEach((ca, ea) => out.set(pRound(ea - e), ca / c));
            return out;
        }
        case "pow": {
            if (!isC(n.right)) return null;
            const k = n.right.value;
            if (isC(n.left)) return new Map([[0, Math.pow(n.left.value, k)]]);
            if (n.left.kind === "var") return new Map([[k, 1]]);
            if (strict) return null;
            const b = toPoly(n.left, false);
            if (!b) return null;
            if (Number.isInteger(k) && k >= 0 && k <= 20) { let r = new Map([[0, 1]]); for (let i = 0; i < k; i++) r = pmul(r, b); return r; }
            if (b.size === 1) { const [be, bc] = [...b.entries()][0]; if (bc > 0 || Number.isInteger(k)) return new Map([[pRound(be * k), Math.pow(bc, k)]]); }
            return null;
        }
        case "func":
            if (n.name === "sqrt" && n.arg.kind === "var") return new Map([[0.5, 1]]);
            return null;
        default: return null;
    }
}
const expTxt = e => { if (Number.isInteger(e)) return Nn(e); const r = rationalize(e, 100); return r ? `${Nn(r.n)}/${r.d}` : N(e); };
const xPow = (e, xs) => e === 1 ? xs : (e === 0.5 ? `&radic;${xs}` : `${xs}${sup(expTxt(e))}`);
function termHtml(c, e, opt) {
    const subst = opt && opt.sub !== undefined;
    if (subst) {
        const xs = `(${Nn(opt.sub)})`;
        if (e === 0) return ratH(c);
        return `${Math.abs(c - 1) < 1e-12 ? "" : ratH(c) + " " + TIMES + " "}${e === 1 ? xs : (e === 0.5 ? `&radic;${xs}` : `${xs}${sup(expTxt(e))}`)}`;
    }
    if (e === 0) return ratH(c);
    const r = rationalize(c, 100);
    if (!r) return `${N(c)}${e > 0 ? xPow(e, "x") : ""}`;
    const p = r.n, q = r.d;
    if (e > 0) {
        const numer = `${p === 1 ? "" : p}${xPow(e, "x")}`;
        return q > 1 ? frac(numer, q) : numer;
    }
    const den = `${q > 1 ? q : ""}${xPow(-e, "x")}`;
    return frac(p, den);
}
function polyHtml(map, opt) {
    const terms = [...map.entries()].filter(([, c]) => Math.abs(c) > 1e-12).sort((a, b) => b[0] - a[0]);
    if (!terms.length) return "0";
    return joinSigned(terms.map(([e, c]) => ({ neg: c < 0, html: termHtml(Math.abs(c), e, opt) })));
}

/* ---- better simplification and rendering of expression trees ---- */
function flattenMul(n, out) {
    if (n.kind === "*") { flattenMul(n.left, out); flattenMul(n.right, out); }
    else if (n.kind === "neg") { out.push(cst(-1)); flattenMul(n.arg, out); }
    else out.push(n);
    return out;
}
function normAst(n) {
    n = simplifyAst(cloneAst(n));
    function go(m) {
        if (!m) return m;
        if (m.left) m.left = go(m.left);
        if (m.right) m.right = go(m.right);
        if (m.arg) m.arg = go(m.arg);
        if (m.kind === "*") {
            const f = flattenMul(m, []);
            let k = 1; const rest = [];
            f.forEach(x => { if (isC(x)) k *= x.value; else rest.push(x); });
            if (k === 0) return cst(0);
            if (!rest.length) return cst(k);
            let body = rest[0];
            for (let i = 1; i < rest.length; i++) body = { kind: "*", left: body, right: rest[i] };
            return k === 1 ? body : { kind: "*", left: cst(k), right: body };
        }
        return m;
    }
    return simplifyAst(go(go(n)));
}
const constHtml = v => Number.isInteger(v) ? Nn(v) : ratH(v);
function wrapP(s, prec, ctx) { return ctx > prec ? `(${s})` : s; }
function astHtml(n, ctx = 0) {
    switch (n.kind) {
        case "const": { const s = constHtml(n.value); return n.value < 0 && ctx > 0 ? `(${s})` : s; }
        case "var": return "x";
        case "neg": return wrapP(`${MINUS}${astHtml(n.arg, 2)}`, 2, ctx);
        case "+": {
            const r = n.right;
            if (r.kind === "neg") return wrapP(`${astHtml(n.left, 1)} ${MINUS} ${astHtml(r.arg, 2)}`, 1, ctx);
            if (isC(r) && r.value < 0) return wrapP(`${astHtml(n.left, 1)} ${MINUS} ${constHtml(-r.value)}`, 1, ctx);
            return wrapP(`${astHtml(n.left, 1)} + ${astHtml(r, 1)}`, 1, ctx);
        }
        case "-": return wrapP(`${astHtml(n.left, 1)} ${MINUS} ${astHtml(n.right, 2)}`, 1, ctx);
        case "*": {
            let l = n.left, r = n.right;
            if (isC(r) && !isC(l)) { const t = l; l = r; r = t; }
            if (isC(l)) {
                if (l.value === -1) return wrapP(`${MINUS}${astHtml(r, 2)}`, 2, ctx);
                if (isC(r)) return wrapP(`${constHtml(l.value)} ${TIMES} ${astHtml(r, 2)}`, 2, ctx);
                return wrapP(`${constHtml(l.value)}${astHtml(r, 2)}`, 2, ctx);
            }
            return wrapP(`${astHtml(l, 2)}&thinsp;${astHtml(r, 2)}`, 2, ctx);
        }
        case "/": return frac(astHtml(n.left, 0), astHtml(n.right, 0));
        case "pow": {
            const b = n.left, e = n.right;
            if (isC(e)) {
                const k = e.value;
                if (k === 1) return astHtml(b, ctx);
                if (k === 0.5) return `&radic;(${astHtml(b, 0)})`;
                if (k < 0) return frac(1, k === -1 ? astHtml(b, 0) : astHtml({ kind: "pow", left: b, right: cst(-k) }, 0));
                if (b.kind === "func" && b.name !== "sqrt" && b.name !== "exp") return `${b.name}${sup(expTxt(k))}(${astHtml(b.arg, 0)})`;
                return `${astHtml(b, 4)}${sup(expTxt(k))}`;
            }
            return `${astHtml(b, 4)}${sup(astHtml(e, 0))}`;
        }
        case "func":
            if (n.name === "sqrt") return `&radic;(${astHtml(n.arg, 0)})`;
            if (n.name === "exp") return `e${sup(astHtml(n.arg, 0))}`;
            return `${n.name}(${astHtml(n.arg, 0)})`;
    }
    return "?";
}
function exprHtml(d) {
    const p = toPoly(d, true);
    if (p) return polyHtml(p);
    if (d.kind === "/") {
        const np = toPoly(d.left, false);
        const numH = np ? polyHtml(np) : astHtml(d.left, 0);
        return frac(numH, astHtml(d.right, 0));
    }
    return astHtml(d, 0);
}
const derivOf = n => normAst(derivativeAst(cloneAst(n)));
const dHtml = n => exprHtml(derivOf(n));
function substVar(n, val) {
    if (n.kind === "var") return cst(val);
    const c = cloneAst(n);
    if (c.left) c.left = substVar(c.left, val);
    if (c.right) c.right = substVar(c.right, val);
    if (c.arg) c.arg = substVar(c.arg, val);
    return c;
}
function splitTerms(n, sign = 1, out = []) {
    if (n.kind === "+") { splitTerms(n.left, sign, out); splitTerms(n.right, sign, out); }
    else if (n.kind === "-") { splitTerms(n.left, sign, out); splitTerms(n.right, -sign, out); }
    else if (n.kind === "neg") splitTerms(n.arg, -sign, out);
    else out.push({ sign, node: n });
    return out;
}
const dd = "d/dx";

/* ---- differentiation: rule explanations for one term ---- */
function outerDerivHtml(node, uH) {
    if (node.kind === "pow") { const k = node.right.value; return k - 1 === 0 ? `${Nn(k)}` : `${Nn(k)}(${uH})${k - 1 === 1 ? "" : sup(expTxt(k - 1))}`; }
    switch (node.name) {
        case "sin": return `cos(${uH})`;
        case "cos": return `${MINUS}sin(${uH})`;
        case "tan": return frac(1, `cos${sup(2)}(${uH})`);
        case "ln": return frac(1, uH);
        case "exp": return `e${sup(uH)}`;
        case "sqrt": return frac(1, `2&radic;(${uH})`);
    }
    return "?";
}
function termRule(node) {
    const f = astHtml(normAst(node), 0);
    const poly = toPoly(node, true);
    if (isC(node) || (poly && poly.size === 1 && poly.has(0))) return { title: "Constant rule", body: `${dd}[${f}] = 0` };
    if (poly && poly.size === 1) {
        const [e, c] = [...poly.entries()][0];
        const newE = e - 1;
        const coefNum = c * e;
        const res = polyHtml(new Map([[pRound(newE), coefNum]]));
        const cStr = Math.abs(c - 1) < 1e-12 ? "" : `${ratH(c)} ${TIMES} `;
        return { title: `Power rule: ${dd}[x${sup("n")}] = n x${sup("n" + MINUS + "1")}`,
            body: `${dd}[${f}] = ${cStr}${ratH(e)} ${TIMES} x${sup(`(${expTxt(e)} ${MINUS} 1)`)}<br>= ${cStr}${ratH(e)} ${TIMES} x${sup(expTxt(newE))}<br>= ${res}` };
    }
    if (node.kind === "*" && (isC(node.left) || isC(node.right))) {
        const c = isC(node.left) ? node.left : node.right, g = isC(node.left) ? node.right : node.left;
        const inner = termRule(g);
        return { title: "Constant multiple rule", body: `${dd}[${constHtml(c.value)} ${TIMES} g(x)] = ${constHtml(c.value)} ${TIMES} g&prime;(x), with g(x) = ${astHtml(normAst(g), 0)}<br>${inner.title}:<br>${inner.body}<br>So ${dd}[${f}] = ${constHtml(c.value)} ${TIMES} (${dHtml(g)}) = ${dHtml(node)}` };
    }
    if (node.kind === "/" && isC(node.right)) {
        const g = node.left;
        return { title: "Constant multiple rule", body: `${dd}[g(x) ${DIVS} ${constHtml(node.right.value)}] = g&prime;(x) ${DIVS} ${constHtml(node.right.value)}, with g(x) = ${astHtml(normAst(g), 0)}<br>g&prime;(x) = ${dHtml(g)}<br>So ${dd}[${f}] = ${dHtml(node)}` };
    }
    if (node.kind === "*") {
        const u = node.left, vv = node.right;
        const U = astHtml(normAst(u), 0), V = astHtml(normAst(vv), 0), dU = dHtml(u), dV = dHtml(vv);
        return { title: `Product rule: (uv)&prime; = u&prime;v + uv&prime;`,
            body: `u = ${U}<br>v = ${V}<br>u&prime; = ${dU}<br>v&prime; = ${dV}<br>` +
                `(uv)&prime; = (${dU})(${V}) + (${U})(${dV})<br>= ${dHtml(node)}` };
    }
    if (node.kind === "/") {
        const u = node.left, vv = node.right;
        const U = astHtml(normAst(u), 0), V = astHtml(normAst(vv), 0), dU = dHtml(u), dV = dHtml(vv);
        return { title: `Quotient rule: (u${DIVS}v)&prime; = ${frac("u&prime;v " + MINUS + " uv&prime;", "v" + sup(2))}`,
            body: `u = ${U}<br>v = ${V}<br>u&prime; = ${dU}<br>v&prime; = ${dV}<br>` +
                `(u${DIVS}v)&prime; = ${frac(`(${dU})(${V}) ${MINUS} (${U})(${dV})`, `(${V})${sup(2)}`)}<br>= ${dHtml(node)}` };
    }
    if ((node.kind === "func" || (node.kind === "pow" && isC(node.right) && node.left.kind !== "const")) ) {
        const inner = node.kind === "func" ? node.arg : node.left;
        if (inner.kind === "var") {
            const tbl = { sin: "cos(x)", cos: `${MINUS}sin(x)`, tan: frac(1, `cos${sup(2)}(x)`), ln: frac(1, "x"), exp: `e${sup("x")}`, sqrt: frac(1, "2&radic;x") };
            return { title: "Standard derivative", body: `${dd}[${f}] = ${tbl[node.name]}` };
        }
        const uH = astHtml(normAst(inner), 0), du = dHtml(inner);
        const outerLabel = node.kind === "pow" ? `F(u) = u${sup(expTxt(node.right.value))}` : (node.name === "exp" ? `F(u) = e${sup("u")}` : `F(u) = ${node.name === "sqrt" ? "&radic;u" : node.name + "(u)"}`);
        return { title: `Chain rule: ${dd}[F(u)] = F&prime;(u) &times; u&prime;`,
            body: `Inner function u = ${uH}<br>Outer function ${outerLabel}<br>F&prime;(u) = ${outerDerivHtml(node, uH)}<br>u&prime; = ${du}<br>` +
                `${dd}[${f}] = (${outerDerivHtml(node, uH)}) ${TIMES} (${du})<br>= ${dHtml(node)}` };
    }
    return { title: "Differentiate", body: `${dd}[${f}] = ${dHtml(node)}` };
}

function calculateDifferentiation(v) {
    const method = v.diffMethod || "general", mode = v.diffMode || "without";
    let expression = (v.diffExpression || "").trim();
    let ast;
    try {
        if (method === "product" || method === "quotient") {
            const u = (v.diffU || "").trim(), vv = (v.diffV || "").trim();
            if (!u || !vv) return errorMessage(`Enter both u(x) and v(x) for the ${method === "product" ? "Product" : "Quotient"} Rule.`);
            expression = method === "product" ? `(${u})*(${vv})` : `(${u})/(${vv})`;
        } else if (method === "chain") {
            const outer = (v.diffOuter || "").trim(), inner = (v.diffInner || "").trim();
            if (!outer || !inner) return errorMessage("Enter the outer function F(u) and inner function u(x) for the Chain Rule.");
            if (!outer.includes("u")) return errorMessage("For Chain Rule, write the outer function using u, for example u^3, sin(u), or ln(u).");
            expression = outer.replace(/\bu\b/g, `(${inner})`);
        } else if (!expression) return errorMessage("Enter an expression in x, for example 3x^2 + 2x - 5.");
        ast = parseMathExpression(expression);
    } catch (e) {
        return errorMessage(`Could not read the expression. Use forms such as <strong>3x^2 + 2x - 5</strong>, <strong>(x+1)(x-2)</strong>, <strong>sin(x)</strong>, <strong>ln(x)</strong> or <strong>sqrt(x)</strong>.`);
    }
    let derivative;
    try { derivative = derivOf(ast); } catch (e) { return errorMessage("This expression cannot be differentiated by the rules supported here."); }

    const st = []; let n = 1;
    const push = (t, b) => st.push(step(n++, t, b));
    const fx = astHtml(ast, 0);
    push("Write the function", `f(x) = ${fx}`);
    const terms = splitTerms(ast);
    const blocks = terms.map((t, i) => {
        const r = termRule(t.node);
        return `<strong>${terms.length > 1 ? `Term ${i + 1}: ` : ""}${astHtml(normAst(t.node), 0)}</strong><br>Rule used &mdash; ${r.title}<br>${r.body}`;
    });
    push(terms.length > 1 ? "Differentiate each term separately" : "Choose the rule and differentiate", blocks.join("<br><br>"));
    if (terms.length > 1) {
        const parts = terms.map(t => ({ neg: t.sign < 0, html: `(${dHtml(t.node)})` }));
        push("Combine the derivatives of the terms", `f&prime;(x) = ${joinSigned(parts)}`);
    }
    const poly = toPoly(derivative, true);
    const finalH = exprHtml(derivative);
    push("Simplify", `f&prime;(x) = ${finalH}`);
    let expanded = "";
    if (!poly) { const p2 = toPoly(derivative, false); if (p2) { const eh = polyHtml(p2); if (eh !== finalH) expanded = `<br><br><strong>Expanded form:</strong> f&prime;(x) = ${eh}`; } }
    let answer = `<strong>f&prime;(x) = ${finalH}</strong>${expanded}`;
    if (mode === "with") {
        if (v.diffX === "" || v.diffX === undefined) return errorMessage("Enter the x value for numerical evaluation.");
        const x = Number(v.diffX);
        if (!Number.isFinite(x)) return errorMessage("Enter a valid numerical x value.");
        const val = evaluateAst(derivative, x);
        if (!Number.isFinite(val)) return errorMessage("The derivative cannot be evaluated at that x value.");
        const subH = poly ? polyHtml(poly, { sub: x }) : astHtml(substVar(derivative, x), 0);
        push(`Substitute x = ${Nn(x)} into f&prime;(x)`, `f&prime;(${Nn(x)}) = ${subH}<br>f&prime;(${Nn(x)}) = <strong>${N(val)}</strong>`);
        answer += `<br><br><strong>f&prime;(${Nn(x)}) = ${N(val)}</strong>`;
    }
    const methodNote = { general: "The correct rule is chosen automatically for each term.", power: "Power rule: d/dx[x^n] = n x^(n&minus;1).", product: "Product rule: (uv)&prime; = u&prime;v + uv&prime;.", quotient: "Quotient rule: (u&divide;v)&prime; = (u&prime;v &minus; uv&prime;)&divide;v&sup2;.", chain: "Chain rule: d/dx F(u) = F&prime;(u) u&prime;." }[method];
    return resultTemplate(
        `${dd}[x${sup("n")}] = n x${sup("n" + MINUS + "1")}; (uv)&prime; = u&prime;v + uv&prime;; (u${DIVS}v)&prime; = ${frac("u&prime;v " + MINUS + " uv&prime;", "v" + sup(2))}; ${dd}F(u) = F&prime;(u) u&prime;`,
        joinSteps(st), answer, methodNote);
}

/* ---- integration ---- */
function polyIntegralMap(poly) {
    const out = new Map(), logs = [];
    poly.forEach((c, e) => {
        if (Math.abs(c) < 1e-12) return;
        if (Math.abs(e + 1) < 1e-9) logs.push(c);
        else out.set(pRound(e + 1), c / (e + 1));
    });
    return { map: out, logCoef: logs.reduce((a, b) => a + b, 0), hasLog: logs.length > 0 };
}
function integralHtml(parts) { return parts.length ? joinSigned(parts) : "0"; }

function calculateIntegration(v) {
    const type = v.integrationType || "indefinite";
    const expression = (v.integrationExpression || "").trim();
    if (!expression) return errorMessage("Enter an expression in x, for example 3x^2 + 2x + 1.");
    let ast, terms;
    try { ast = parseMathExpression(expression); terms = splitTerms(ast); } catch (e) { return errorMessage("Could not read the expression. Check the format and try again."); }
    const st = []; let n = 1;
    const push = (t, b) => st.push(step(n++, t, b));
    push("Write the integrand", `f(x) = ${astHtml(ast, 0)}`);

    const polyAll = new Map(); const others = []; const blocks = []; let failed = false;
    terms.forEach((t, i) => {
        const node = t.node, f = astHtml(normAst(node), 0);
        const p = toPoly(node, true);
        const sg = t.sign;
        const head = `<strong>${terms.length > 1 ? `Term ${i + 1}: ` : ""}${sg < 0 ? MINUS : ""}${f}</strong><br>`;
        if (p && p.size === 1) {
            const [e, c0] = [...p.entries()][0]; const c = c0 * sg;
            p.forEach((cc, ee) => polyAll.set(ee, (polyAll.get(ee) || 0) + cc * sg));
            if (e === 0) blocks.push(`${head}Rule &mdash; Constant: &int; k dx = kx<br>= ${polyHtml(new Map([[1, c]]))}`);
            else if (Math.abs(e + 1) < 1e-9) blocks.push(`${head}Rule &mdash; &int; x${sup(MINUS + "1")} dx = ln|x|<br>= ${Math.abs(c) === 1 ? (c < 0 ? MINUS : "") : ratH(c) + " "}ln|x|`);
            else blocks.push(`${head}Rule &mdash; Power: &int; x${sup("n")} dx = ${frac("x" + sup("n+1"), "n+1")}<br>` +
                `&int; ${polyHtml(new Map([[e, c]]))} dx = ${Math.abs(c - 1) < 1e-12 ? "" : ratH(c) + " " + TIMES + " "}${frac("x" + sup(`(${expTxt(e)} + 1)`), `${expTxt(e)} + 1`)}<br>` +
                `= ${Math.abs(c - 1) < 1e-12 ? "" : ratH(c) + " " + TIMES + " "}${frac("x" + sup(expTxt(e + 1)), expTxt(e + 1))}<br>= ${polyHtml(new Map([[pRound(e + 1), c / (e + 1)]]))}`);
        } else {
            let F;
            try { F = simplifyAst(integrateAst(simplifyAst(cloneAst(node)))); } catch (err) { failed = true; return; }
            const signed = sg < 0 ? { kind: "neg", arg: F } : F;
            others.push({ ast: signed });
            blocks.push(`${head}Rule &mdash; standard integral<br>= ${sg < 0 ? MINUS + "(" : ""}${astHtml(normAst(F), 0)}${sg < 0 ? ")" : ""}`);
        }
    });
    if (failed) return errorMessage("This integration engine supports common forms such as polynomial terms, 1/x, sin(x), cos(x), ln(x) and e^x. Check the expression format and try again.");
    push(terms.length > 1 ? "Integrate each term separately" : "Choose the rule and integrate", blocks.join("<br><br>"));

    const pi = polyIntegralMap(polyAll);
    const parts = [];
    [...pi.map.entries()].sort((a, b) => b[0] - a[0]).forEach(([e, c]) => parts.push({ neg: c < 0, html: termHtml(Math.abs(c), e) }));
    if (pi.hasLog && Math.abs(pi.logCoef) > 1e-12) parts.push({ neg: pi.logCoef < 0, html: `${Math.abs(pi.logCoef) === 1 ? "" : ratH(Math.abs(pi.logCoef)) + " "}ln|x|` });
    others.forEach(o => { const isNeg = o.ast.kind === "neg"; parts.push({ neg: isNeg, html: astHtml(normAst(isNeg ? o.ast.arg : o.ast), 0) }); });
    const FH = integralHtml(parts);
    if (terms.length > 1) push("Add the results", `F(x) = ${FH} + C`);

    if (type === "indefinite") {
        return resultTemplate("&int; x<sup>n</sup> dx = " + frac("x<sup>n+1</sup>", "n+1") + " + C (n &ne; &minus;1); &int; x<sup>&minus;1</sup> dx = ln|x| + C",
            joinSteps(st) + "<br><br><small>Indefinite integration gives a family of antiderivatives, so the constant + C is required.</small>",
            `<strong>&int; f(x) dx = ${FH} + C</strong>`);
    }
    if (v.integrationLower === "" || v.integrationUpper === "") return errorMessage("Enter both the lower and upper limits for a definite integral.");
    const lower = Number(v.integrationLower), upper = Number(v.integrationUpper);
    if (!Number.isFinite(lower) || !Number.isFinite(upper)) return errorMessage("Enter valid numerical limits.");
    if (upper < lower) return errorMessage("Upper limit must be greater than or equal to the lower limit.");
    const crosses = lower <= 0 && upper >= 0;
    if (crosses && ([...polyAll.keys()].some(e => e < 0) || others.some(o => containsSingularity(o.ast, lower, upper)))) return errorMessage("The selected limits cross a point where the antiderivative is undefined.");
    const polyF = x => { let s = 0; pi.map.forEach((c, e) => { s += c * Math.pow(x, e); }); if (pi.hasLog) s += pi.logCoef * Math.log(Math.abs(x)); return s; };
    const Fv = x => polyF(x) + others.reduce((a, o) => a + evaluateAst(o.ast, x), 0);
    const fu = Fv(upper), fl = Fv(lower);
    const answer = fu - fl;
    if (!Number.isFinite(answer)) return errorMessage("The definite integral could not be evaluated for these limits.");
    const substHtml = x => {
        const ps = [];
        [...pi.map.entries()].sort((a, b) => b[0] - a[0]).forEach(([e, c]) => ps.push({ neg: c < 0, html: termHtml(Math.abs(c), e, { sub: x }) }));
        if (pi.hasLog && Math.abs(pi.logCoef) > 1e-12) ps.push({ neg: pi.logCoef < 0, html: `${Math.abs(pi.logCoef) === 1 ? "" : ratH(Math.abs(pi.logCoef)) + " " + TIMES + " "}ln|${Nn(x)}|` });
        others.forEach(o => { const isNeg = o.ast.kind === "neg"; ps.push({ neg: isNeg, html: astHtml(substVar(isNeg ? o.ast.arg : o.ast, x), 0) }); });
        return joinSigned(ps);
    };
    push(`Evaluate F at the upper limit x = ${Nn(upper)}`, `F(${Nn(upper)}) = ${substHtml(upper)} = <strong>${N(fu)}</strong>`);
    push(`Evaluate F at the lower limit x = ${Nn(lower)}`, `F(${Nn(lower)}) = ${substHtml(lower)} = <strong>${N(fl)}</strong>`);
    push("Subtract: upper &minus; lower", `&int;<sub>${Nn(lower)}</sub><sup>${Nn(upper)}</sup> f(x) dx = F(${Nn(upper)}) ${MINUS} F(${Nn(lower)}) = ${par(fu)} ${MINUS} ${par(fl)} = <strong>${N(answer)}</strong>`);
    return resultTemplate("&int;<sub>a</sub><sup>b</sup> f(x) dx = F(b) &minus; F(a)", joinSteps(st),
        `<strong>&int;<sub>${Nn(lower)}</sub><sup>${Nn(upper)}</sup> f(x) dx = ${N(answer)}</strong>`, "A definite integral gives the signed net accumulation over the stated interval.");
}

/* =========================================================
   OTHER MATHEMATICS CALCULATORS (full workings)
========================================================= */

function calcQuadratic(v) {
    const a = getNumber(v, "a"), b = getNumber(v, "b"), c = getNumber(v, "c");
    if (![a, b, c].every(Number.isFinite)) return errorMessage("Enter valid numbers for a, b and c.");
    if (a === 0) return errorMessage("The coefficient a cannot be zero for a quadratic equation.");
    const D = b * b - 4 * a * c;
    const st = []; let n = 1; const push = (t, x) => st.push(step(n++, t, x));
    const eq = `${a === 1 ? "" : (a === -1 ? MINUS : Nn(a))}x${sup(2)} ${b < 0 ? MINUS : "+"} ${Math.abs(b) === 1 ? "" : N(Math.abs(b))}x ${c < 0 ? MINUS : "+"} ${N(Math.abs(c))} = 0`;
    push("Write the equation and identify a, b and c", `${eq}<br>a = ${Nn(a)}, b = ${Nn(b)}, c = ${Nn(c)}`);
    push("Calculate the discriminant D = b&sup2; &minus; 4ac", `D = (${Nn(b)})${sup(2)} ${MINUS} 4(${Nn(a)})(${Nn(c)})<br>D = ${Nn(b * b)} ${MINUS} (${Nn(4 * a * c)}) = <strong>${Nn(D)}</strong>`);
    if (D < 0) {
        const re = -b / (2 * a), im = Math.sqrt(-D) / (2 * a);
        push("Interpret the discriminant", "D is negative, so there are no real roots. The roots are complex numbers.");
        push("Substitute into the quadratic formula", `x = ${frac(`${MINUS}(${Nn(b)}) &plusmn; &radic;(${Nn(D)})`, `2(${Nn(a)})`)} = ${frac(`${Nn(-b)} &plusmn; ${sqrtHtml(-D)}i`, Nn(2 * a))}`);
        return resultTemplate(`x = ${frac("&minus;b &plusmn; &radic;(b&sup2; &minus; 4ac)", "2a")}`, joinSteps(st), `x = ${N(re)} &plusmn; ${N(Math.abs(im))}i`, "A negative discriminant means the square root is not real.");
    }
    const sq = Math.sqrt(D);
    push("Interpret the discriminant", D === 0 ? "D = 0, so there is one repeated real root." : "D &gt; 0, so there are two different real roots.");
    push("Substitute into the quadratic formula", `x = ${frac(`${MINUS}(${Nn(b)}) &plusmn; &radic;(${Nn(D)})`, `2(${Nn(a)})`)}`);
    push("Simplify the square root and the denominator", `&radic;${Nn(D)} = ${Number.isInteger(sq) ? N(sq) : sqrtHtml(D) + " &asymp; " + N(sq)}<br>x = ${frac(`${Nn(-b)} &plusmn; ${N(sq)}`, Nn(2 * a))}`);
    const x1 = (-b + sq) / (2 * a), x2 = (-b - sq) / (2 * a);
    push("Calculate both roots", `x${sub(1)} = ${frac(`${Nn(-b)} + ${N(sq)}`, Nn(2 * a))} = ${N(x1)}<br>x${sub(2)} = ${frac(`${Nn(-b)} ${MINUS} ${N(sq)}`, Nn(2 * a))} = ${N(x2)}`);
    push("Check by substituting a root", `a(${N(x1)})${sup(2)} + b(${N(x1)}) + c = ${N(a * x1 * x1 + b * x1 + c)}`);
    return resultTemplate(`x = ${frac("&minus;b &plusmn; &radic;(b&sup2; &minus; 4ac)", "2a")}`, joinSteps(st),
        D === 0 ? `x = ${N(x1)} (repeated root)` : `x${sub(1)} = ${N(x1)}, x${sub(2)} = ${N(x2)}`, "Substituting a root into the equation should give zero (apart from tiny rounding).");
}
function calcSimpleEquation(v) {
    const a = getNumber(v, "a"), b = getNumber(v, "b");
    if (![a, b].every(Number.isFinite)) return errorMessage("Enter valid values for a and b.");
    if (a === 0) return errorMessage("Coefficient a cannot be zero. If a = 0, the equation is not a unique linear equation.");
    const x = -b / a;
    const st = [];
    st.push(step(1, "Write the equation", `${Nn(a)}x ${b < 0 ? MINUS : "+"} ${N(Math.abs(b))} = 0`));
    st.push(step(2, "Move the constant to the right-hand side", `${Nn(a)}x = ${Nn(-b)}`));
    st.push(step(3, "Divide both sides by the coefficient of x", `x = ${frac(Nn(-b), Nn(a))}`));
    st.push(step(4, "Simplify", `x = ${entryHtml(x)}`));
    st.push(step(5, "Check", `${Nn(a)}(${N(x)}) ${b < 0 ? MINUS : "+"} ${N(Math.abs(b))} = ${N(a * x + b)}`));
    return resultTemplate(`ax + b = 0, x = ${frac("&minus;b", "a")}`, joinSteps(st), `x = ${entryHtml(x)}`, "Substituting the answer gives zero on the left-hand side.");
}

function calcDistance(v) {
    const x1 = getNumber(v, "x1"), y1 = getNumber(v, "y1"), x2 = getNumber(v, "x2"), y2 = getNumber(v, "y2");
    if (![x1, y1, x2, y2].every(Number.isFinite)) return errorMessage("Enter valid numbers for all four coordinates.");
    const dx = x2 - x1, dy = y2 - y1, s = dx * dx + dy * dy, d = Math.sqrt(s);
    const st = [];
    st.push(step(1, "Write the points", `A(${Nn(x1)}, ${Nn(y1)}) and B(${Nn(x2)}, ${Nn(y2)})`));
    st.push(step(2, "Find the horizontal and vertical differences", `x${sub(2)} ${MINUS} x${sub(1)} = ${par(x2)} ${MINUS} ${par(x1)} = ${Nn(dx)}<br>y${sub(2)} ${MINUS} y${sub(1)} = ${par(y2)} ${MINUS} ${par(y1)} = ${Nn(dy)}`));
    st.push(step(3, "Square each difference", `(${Nn(dx)})${sup(2)} = ${Nn(dx * dx)}<br>(${Nn(dy)})${sup(2)} = ${Nn(dy * dy)}`));
    st.push(step(4, "Add the squares", `${Nn(dx * dx)} + ${Nn(dy * dy)} = ${Nn(s)}`));
    const exact = Number.isInteger(s) ? sqrtHtml(s) : `&radic;${N(s)}`;
    st.push(step(5, "Take the square root", `d = &radic;${Nn(s)} = ${exact}${Number.isInteger(d) || !Number.isInteger(s) ? "" : " &asymp; " + N(d)}`));
    return resultTemplate(`d = &radic;((x${sub(2)} &minus; x${sub(1)})${sup(2)} + (y${sub(2)} &minus; y${sub(1)})${sup(2)})`, joinSteps(st), `d = ${Number.isInteger(s) && !Number.isInteger(d) ? exact + " &asymp; " + N(d) : N(d)}`, "The distance is always zero or positive.");
}
function calcMidpoint(v) {
    const x1 = getNumber(v, "x1"), y1 = getNumber(v, "y1"), x2 = getNumber(v, "x2"), y2 = getNumber(v, "y2");
    if (![x1, y1, x2, y2].every(Number.isFinite)) return errorMessage("Enter valid numbers for all four coordinates.");
    const mx_ = (x1 + x2) / 2, my_ = (y1 + y2) / 2;
    const st = [];
    st.push(step(1, "Write the points", `A(${Nn(x1)}, ${Nn(y1)}) and B(${Nn(x2)}, ${Nn(y2)})`));
    st.push(step(2, "Add the x-coordinates and halve", `x = ${frac(`${par(x1)} + ${par(x2)}`, 2)} = ${frac(Nn(x1 + x2), 2)}${(x1 + x2) % 2 === 0 ? " = " + entryHtml(mx_) : ""}`));
    st.push(step(3, "Add the y-coordinates and halve", `y = ${frac(`${par(y1)} + ${par(y2)}`, 2)} = ${frac(Nn(y1 + y2), 2)}${(y1 + y2) % 2 === 0 ? " = " + entryHtml(my_) : ""}`));
    st.push(step(4, "Write the midpoint", `M = (${entryHtml(mx_)}, ${entryHtml(my_)})`));
    return resultTemplate(`M = (${frac(`x${sub(1)} + x${sub(2)}`, 2)}, ${frac(`y${sub(1)} + y${sub(2)}`, 2)})`, joinSteps(st), `M = (${entryHtml(mx_)}, ${entryHtml(my_)})`, "The midpoint is exactly halfway between the two points.");
}
function calcGradient(v) {
    const x1 = getNumber(v, "x1"), y1 = getNumber(v, "y1"), x2 = getNumber(v, "x2"), y2 = getNumber(v, "y2");
    if (![x1, y1, x2, y2].every(Number.isFinite)) return errorMessage("Enter valid numbers for all four coordinates.");
    if (x2 === x1) return errorMessage("The gradient is undefined because x&#8322; &minus; x&#8321; = 0 (a vertical line).");
    const rise = y2 - y1, run = x2 - x1, m = rise / run;
    const st = [];
    st.push(step(1, "Write the points", `A(${Nn(x1)}, ${Nn(y1)}) and B(${Nn(x2)}, ${Nn(y2)})`));
    st.push(step(2, "Find the rise (change in y)", `y${sub(2)} ${MINUS} y${sub(1)} = ${par(y2)} ${MINUS} ${par(y1)} = ${Nn(rise)}`));
    st.push(step(3, "Find the run (change in x)", `x${sub(2)} ${MINUS} x${sub(1)} = ${par(x2)} ${MINUS} ${par(x1)} = ${Nn(run)}`));
    { const rr = fr(rise, run); st.push(step(4, "Divide rise by run", `m = ${frac(Nn(rise), Nn(run))}${(rr.n === rise && rr.d === run) ? "" : " = " + entryHtml(m)}`)); }
    const angle = Math.atan(m) * 180 / Math.PI;
    return resultTemplate(`m = ${frac(`y${sub(2)} &minus; y${sub(1)}`, `x${sub(2)} &minus; x${sub(1)}`)}`, joinSteps(st), `m = ${entryHtml(m)}`, m === 0 ? "A gradient of 0 means a horizontal line." : `The line ${m > 0 ? "rises" : "falls"} as x increases, at an angle of about ${N(Math.abs(angle))}&deg; to the x-axis.`);
}
function calcCircle(v) {
    const r = getNumber(v, "radius");
    if (!Number.isFinite(r) || r < 0) return errorMessage("Enter a valid non-negative radius.");
    const st = [];
    st.push(step(1, "Write the radius", `r = ${Nn(r)}`));
    st.push(step(2, "Square the radius", `r${sup(2)} = (${Nn(r)})${sup(2)} = ${Nn(r * r)}`));
    st.push(step(3, "Multiply by &pi; (exact form first)", `A = &pi; ${TIMES} ${Nn(r * r)} = ${r * r === 1 ? "" : Nn(r * r)}&pi;`));
    st.push(step(4, "Use &pi; &asymp; 3.14159265 for the decimal value", `A = ${Nn(r * r)} ${TIMES} 3.14159265 = ${N(Math.PI * r * r)}`));
    return resultTemplate("A = &pi;r<sup>2</sup>", joinSteps(st), `A = ${r * r === 1 ? "" : Nn(r * r)}&pi; &asymp; ${N(Math.PI * r * r)}`, "Area is measured in square units.");
}

const trigExact = {
    sin: { 0: "0", 30: frac(1, 2), 45: frac("&radic;2", 2), 60: frac("&radic;3", 2), 90: "1" },
    cos: { 0: "1", 30: frac("&radic;3", 2), 45: frac("&radic;2", 2), 60: frac(1, 2), 90: "0" },
    tan: { 0: "0", 30: frac(1, "&radic;3"), 45: "1", 60: "&radic;3", 90: "undefined" }
};
function calcTrig(v) {
    const angle = getNumber(v, "angle"), fn = v.ratio || "sin";
    if (!Number.isFinite(angle)) return errorMessage("Enter a valid angle in degrees.");
    const rad = angle * Math.PI / 180;
    const val = Math[fn](rad);
    const st = []; let n = 1; const push = (t, b) => st.push(step(n++, t, b));
    push("Write the ratio", `${fn}(${Nn(angle)}&deg;)`);
    push("Convert the angle to radians", `${Nn(angle)}&deg; ${TIMES} ${frac("&pi;", 180)} = ${N(rad)} rad`);
    const red = ((angle % 360) + 360) % 360;
    const isSpecial = Number.isInteger(red) && red % 30 === 0 || red % 45 === 0 && Number.isInteger(red);
    let answer;
    if (isSpecial) {
        let ref, quad;
        if (red <= 90) { ref = red; quad = 1; } else if (red <= 180) { ref = 180 - red; quad = 2; } else if (red <= 270) { ref = red - 180; quad = 3; } else { ref = 360 - red; quad = 4; }
        const sign = fn === "sin" ? (quad <= 2 ? 1 : -1) : fn === "cos" ? (quad === 1 || quad === 4 ? 1 : -1) : (quad === 1 || quad === 3 ? 1 : -1);
        if (angle !== red) push("Reduce the angle to between 0&deg; and 360&deg;", `${Nn(angle)}&deg; &equiv; ${red}&deg;`);
        push("Find the quadrant and the reference angle", `${red}&deg; is in quadrant ${quad}; reference angle = ${ref}&deg;`);
        push("Decide the sign (ASTC rule)", `In quadrant ${quad}, ${fn} is ${sign > 0 ? "positive" : "negative"}.`);
        const ex = trigExact[fn][ref];
        push("Use the exact value of the reference angle", `${fn}(${ref}&deg;) = ${ex}`);
        if (ex === "undefined") answer = `${fn}(${Nn(angle)}&deg;) is undefined`;
        else answer = `${fn}(${Nn(angle)}&deg;) = ${sign < 0 ? MINUS : ""}${ex} = ${N(val)}`;
        push("Combine the sign and the value", answer);
    } else {
        push("Evaluate with the calculator", `${fn}(${N(rad)}) = ${N(val)}`);
        answer = `${fn}(${Nn(angle)}&deg;) = ${N(val)}`;
    }
    if (fn === "tan" && Math.abs(Math.cos(rad)) < 1e-12) return resultTemplate(`${fn} &theta;`, joinSteps(st), `tan(${Nn(angle)}&deg;) is undefined`, "tan &theta; = sin &theta; &divide; cos &theta;, and cos &theta; = 0 here.");
    return resultTemplate(`${fn} &theta;; &theta; (rad) = &theta;&deg; &times; ${frac("&pi;", 180)}`, joinSteps(st), answer, "Exact values come from the special angles 30&deg;, 45&deg; and 60&deg;.");
}

function bigFactorialRange(n, r) { let p = 1n; for (let i = 0; i < r; i++) p *= BigInt(n - i); return p; }
function bigFact(r) { let p = 1n; for (let i = 2; i <= r; i++) p *= BigInt(i); return p; }
const bigStr = b => b.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
function calcPerm(v) {
    const n = getNumber(v, "n"), r = getNumber(v, "r");
    if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n) return errorMessage("n and r must be whole numbers with n &ge; r.");
    if (n > 500) return errorMessage("Please use n of 500 or less.");
    const val = bigFactorialRange(n, r);
    const st = [];
    st.push(step(1, "Write the values", `n = ${n}, r = ${r}`));
    st.push(step(2, "Substitute into the formula", `<sup>${n}</sup>P<sub>${r}</sub> = ${frac(`${n}!`, `(${n} ${MINUS} ${r})!`)} = ${frac(`${n}!`, `${n - r}!`)}`));
    const terms = Array.from({ length: Math.min(r, 12) }, (_, i) => n - i);
    st.push(step(3, "Cancel the common factorial: only the first r factors remain", `${frac(`${n}!`, `${n - r}!`)} = ${r === 0 ? "1" : terms.join(` ${TIMES} `) + (r > 12 ? ` ${TIMES} &hellip; ${TIMES} ${n - r + 1}` : "")}`));
    st.push(step(4, "Multiply", `= <strong>${bigStr(val)}</strong>`));
    return resultTemplate(`<sup>n</sup>P<sub>r</sub> = ${frac("n!", "(n &minus; r)!")}`, joinSteps(st), `<sup>${n}</sup>P<sub>${r}</sub> = ${bigStr(val)}`, "Permutations count ordered arrangements.");
}
function calcComb(v) {
    const n = getNumber(v, "n"), r = getNumber(v, "r");
    if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n) return errorMessage("n and r must be whole numbers with n &ge; r.");
    if (n > 500) return errorMessage("Please use n of 500 or less.");
    const k = Math.min(r, n - r);
    const num = bigFactorialRange(n, k), den = bigFact(k), val = num / den;
    const st = [];
    st.push(step(1, "Write the values", `n = ${n}, r = ${r}`));
    st.push(step(2, "Substitute into the formula", `<sup>${n}</sup>C<sub>${r}</sub> = ${frac(`${n}!`, `${r}!(${n} ${MINUS} ${r})!`)} = ${frac(`${n}!`, `${r}!${n - r}!`)}`));
    if (k !== r) st.push(step(3, "Use symmetry to shorten the work", `<sup>${n}</sup>C<sub>${r}</sub> = <sup>${n}</sup>C<sub>${n - r}</sub>, so use r = ${k}`));
    const top = Array.from({ length: Math.min(k, 12) }, (_, i) => n - i).join(` ${TIMES} `) + (k > 12 ? ` ${TIMES} &hellip;` : "");
    const bottom = Array.from({ length: Math.min(k, 12) }, (_, i) => k - i).join(` ${TIMES} `) + (k > 12 ? ` ${TIMES} &hellip;` : "");
    st.push(step(st.length + 1, "Cancel the common factorial and expand", k === 0 ? "= 1" : `= ${frac(top, bottom)}`));
    st.push(step(st.length + 1, "Work out the top and the bottom separately", `Top = ${bigStr(num)}<br>Bottom = ${k}! = ${bigStr(den)}`));
    st.push(step(st.length + 1, "Divide", `${bigStr(num)} ${DIVS} ${bigStr(den)} = <strong>${bigStr(val)}</strong>`));
    return resultTemplate(`<sup>n</sup>C<sub>r</sub> = ${frac("n!", "r!(n &minus; r)!")}`, joinSteps(st), `<sup>${n}</sup>C<sub>${r}</sub> = ${bigStr(val)}`, "Combinations count selections where order does not matter.");
}

function calcApGp(v) {
    const type = v.sequenceType, calc = v.calculation;
    const a = getNumber(v, "a"), n = getNumber(v, "n");
    if (!Number.isFinite(a) || !Number.isFinite(n)) return errorMessage("Please enter valid numbers.");
    if (n <= 0 || !Number.isInteger(n)) return errorMessage("Number of terms (n) must be a positive whole number.");
    const st = []; let k = 1; const push = (t, b) => st.push(step(k++, t, b));
    const first = (fn, count = 6) => Array.from({ length: Math.min(n, count) }, (_, i) => N(fn(i + 1))).join(", ") + (n > count ? ", &hellip;" : "");
    if (type === "ap") {
        const d = getNumber(v, "d");
        if (!Number.isFinite(d)) return errorMessage("Please enter a valid common difference.");
        push("Identify the arithmetic progression", `a = ${Nn(a)}, d = ${Nn(d)}, n = ${n}<br>Sequence: ${first(i => a + (i - 1) * d)}`);
        if (calc === "nth-term") {
            push("Write the formula", `T${sub("n")} = a + (n ${MINUS} 1)d`);
            push("Work out (n &minus; 1)d first", `(${n} ${MINUS} 1) ${TIMES} ${par(d)} = ${Nn((n - 1) * d)}`);
            const t = a + (n - 1) * d;
            push("Add a", `T${sub(n)} = ${par(a)} + ${par((n - 1) * d)} = <strong>${Nn(t)}</strong>`);
            return resultTemplate(`T<sub>n</sub> = a + (n &minus; 1)d`, joinSteps(st), `T${sub(n)} = ${Nn(t)}`, "Each term is the previous term plus the common difference.");
        }
        push("Write the formula", `S${sub("n")} = ${frac("n", 2)}[2a + (n ${MINUS} 1)d]`);
        push("Work out the bracket in parts", `2a = 2 ${TIMES} ${par(a)} = ${Nn(2 * a)}<br>(n ${MINUS} 1)d = ${Nn((n - 1) * d)}<br>2a + (n ${MINUS} 1)d = ${Nn(2 * a)} + ${par((n - 1) * d)} = ${Nn(2 * a + (n - 1) * d)}`);
        const s = (n / 2) * (2 * a + (n - 1) * d);
        push("Multiply by n&divide;2", `S${sub(n)} = ${frac(n, 2)} ${TIMES} ${par(2 * a + (n - 1) * d)} = <strong>${Nn(s)}</strong>`);
        return resultTemplate(`S<sub>n</sub> = ${frac("n", 2)}[2a + (n &minus; 1)d]`, joinSteps(st), `Sum of the first ${n} terms = ${Nn(s)}`, `Equivalent form: S = ${frac("n", 2)}(first term + last term).`);
    }
    if (type === "gp") {
        const r = getNumber(v, "r");
        if (!Number.isFinite(r)) return errorMessage("Please enter a valid common ratio.");
        push("Identify the geometric progression", `a = ${Nn(a)}, r = ${Nn(r)}, n = ${n}<br>Sequence: ${first(i => a * Math.pow(r, i - 1))}`);
        if (calc === "nth-term") {
            push("Write the formula", `T${sub("n")} = a r${sup("n" + MINUS + "1")}`);
            push("Work out the power first", `r${sup(`(${n} ${MINUS} 1)`)} = (${Nn(r)})${sup(n - 1)} = ${Nn(Math.pow(r, n - 1))}`);
            const t = a * Math.pow(r, n - 1);
            push("Multiply by a", `T${sub(n)} = ${par(a)} ${TIMES} ${par(Math.pow(r, n - 1))} = <strong>${Nn(t)}</strong>`);
            return resultTemplate(`T<sub>n</sub> = ar<sup>n&minus;1</sup>`, joinSteps(st), `T${sub(n)} = ${Nn(t)}`, "Each term is the previous term multiplied by the common ratio.");
        }
        if (r === 1) {
            push("The ratio is 1, so every term equals a", `S${sub(n)} = na = ${n} ${TIMES} ${par(a)} = <strong>${Nn(n * a)}</strong>`);
            return resultTemplate("S<sub>n</sub> = na (r = 1)", joinSteps(st), `Sum of the first ${n} terms = ${Nn(n * a)}`, "");
        }
        push("Write the formula", `S${sub("n")} = ${frac(`a(r${sup("n")} ${MINUS} 1)`, `r ${MINUS} 1`)}`);
        push("Work out the parts", `r${sup(n)} = (${Nn(r)})${sup(n)} = ${Nn(Math.pow(r, n))}<br>r${sup(n)} ${MINUS} 1 = ${Nn(Math.pow(r, n) - 1)}<br>r ${MINUS} 1 = ${Nn(r - 1)}`);
        const s = a * (Math.pow(r, n) - 1) / (r - 1);
        push("Put the parts together", `S${sub(n)} = ${frac(`${par(a)} ${TIMES} ${par(Math.pow(r, n) - 1)}`, par(r - 1))} = <strong>${Nn(s)}</strong>`);
        return resultTemplate(`S<sub>n</sub> = ${frac("a(r<sup>n</sup> &minus; 1)", "r &minus; 1")}`, joinSteps(st), `Sum of the first ${n} terms = ${Nn(s)}`, "");
    }
    return errorMessage("Please check your selections.");
}

/* =========================================================
   REGISTER THE MATHEMATICS CATEGORY
========================================================= */

const base = calculators.finance || {};
const names = (typeof calculatorNames !== "undefined" && calculatorNames.mathematics) ? Object.keys(calculatorNames.mathematics) : [];
const mathCalcs = {};
names.forEach(key => { if (base[key]) mathCalcs[key] = base[key]; });
const override = (key, fn) => { if (mathCalcs[key]) mathCalcs[key] = Object.assign({}, mathCalcs[key], { calculate: fn }); };
override("quadratic-equation", calcQuadratic);
override("simple-equation", calcSimpleEquation);
override("indices", v => calculateIndices(v.indexExpression));
override("logarithm", v => calcLogarithm(v.logExpression));
override("permutation", calcPerm);
override("combination", calcComb);
override("distance", calcDistance);
override("midpoint", calcMidpoint);
override("gradient", calcGradient);
override("circle-area", calcCircle);
override("trigonometry", calcTrig);
override("sets", calculateSets);
override("matrices", calculateMatrices);
override("differentiation", calculateDifferentiation);
override("integration", calculateIntegration);
override("ap-gp", calcApGp);
calculators.mathematics = mathCalcs;

if (typeof categorySelect !== "undefined" && categorySelect && typeof populateCalculators === "function") populateCalculators();
})();

/* =========================================================
   KHID STATISTICS ENGINE  (append this block at the END of your script file,
   AFTER the Mathematics patch)

   - Every Statistics calculator now shows formula, numbered workings with
     tables, the parts first, then the final answer.
   - Ungrouped data, ungrouped frequency tables and grouped (class interval)
     data are all supported where the statistic accepts a table.
   - Nothing above this block is changed. It overrides the old statistics entries.
========================================================= */

(function () {
"use strict";

const MINUS = "&minus;", TIMES = "&times;", DIVS = "&divide;";
const sub = s => `<sub>${s}</sub>`;
const sup = s => `<sup>${s}</sup>`;
const frac = (n, d) => `<span style="display:inline-block;vertical-align:middle;text-align:center;margin:0 3px;"><span style="display:block;padding:0 4px;border-bottom:1px solid currentColor;">${n}</span><span style="display:block;padding:0 4px;">${d}</span></span>`;
const xbar = '<span style="text-decoration:overline;">x</span>';
const ybar = '<span style="text-decoration:overline;">y</span>';
const step = (n, t, b) => `<strong>Step ${n} &mdash; ${t}</strong><br>${b}`;
const joinSteps = a => a.join("<br><br>");
const F2 = (v, d) => {
    if (!Number.isFinite(v)) return "undefined";
    const r = Number(v.toFixed(d));
    return String(Object.is(r, -0) ? 0 : r).replace(/^-/, MINUS);
};
const F = v => F2(v, 4);   /* single argument on purpose, so it is safe inside .map(F) */
const P = v => v < 0 ? `(${F(v)})` : F(v);
const sumArr = a => a.reduce((s, x) => s + x, 0);
const listSum = (arr, max = 10) => arr.length <= max ? arr.map(P).join(" + ") : arr.slice(0, 6).map(P).join(" + ") + " + &hellip; + " + P(arr[arr.length - 1]);
const ord = n => { const k = Math.abs(Math.round(n)), t = k % 100, u = k % 10; return n + (t >= 11 && t <= 13 ? "th" : u === 1 ? "st" : u === 2 ? "nd" : u === 3 ? "rd" : "th"); };
const mk = () => { const st = []; let n = 1; return { st, push: (t, b) => st.push(step(n++, t, b)) }; };

function tbl(head, rows, foot) {
    const cell = (c, h) => `<${h ? "th" : "td"} style="border:1px solid rgba(128,128,128,.55);padding:4px 8px;text-align:${h ? "center" : "right"};white-space:nowrap;">${c}</${h ? "th" : "td"}>`;
    return `<div style="overflow-x:auto;margin:6px 0;"><table style="border-collapse:collapse;font-size:.92em;"><thead><tr>${head.map(h => cell(h, true)).join("")}</tr></thead><tbody>` +
        rows.map(r => `<tr>${r.map(c => cell(c)).join("")}</tr>`).join("") +
        (foot ? `<tr style="font-weight:bold;">${foot.map(c => cell(c)).join("")}</tr>` : "") + `</tbody></table></div>`;
}

/* ---------- reading the inputs ---------- */
const clean = s => String(s == null ? "" : s).replace(/[−–—]/g, "-").trim();
function parseNums(s, what) {
    const t = clean(s);
    if (!t) return [];
    const nums = t.split(/[,;\s]+/).filter(Boolean).map(Number);
    if (nums.some(n => !Number.isFinite(n))) throw new Error(`${what || "The values"} must be numbers separated by commas.`);
    return nums;
}
function parseClasses(s) {
    const t = clean(s);
    if (!t) throw new Error("Enter the class intervals, for example 0-10, 10-20, 20-30.");
    const parts = t.split(/[,;]+/).map(x => x.trim()).filter(Boolean);
    const rows = parts.map(p => {
        const m = p.match(/^(-?\d+(?:\.\d+)?)\s*(?:-|to)\s*(-?\d+(?:\.\d+)?)$/i);
        if (!m) throw new Error(`The class "${p}" is not valid. Write classes like 10-20 or 10 - 19.`);
        const lo = Number(m[1]), up = Number(m[2]);
        if (!(up > lo)) throw new Error(`In the class "${p}" the upper value must be bigger than the lower value.`);
        return { lo, up };
    });
    for (let i = 1; i < rows.length; i++) if (rows[i].lo < rows[i - 1].up) throw new Error("The classes must be in ascending order and must not overlap.");
    const gaps = rows.slice(1).map((r, i) => Number((r.lo - rows[i].up).toFixed(9)));
    let gap = 0;
    if (gaps.length) {
        if (gaps.every(g => g === 0)) gap = 0;
        else if (gaps.every(g => g === gaps[0])) gap = gaps[0];
        else throw new Error("The gaps between the classes must all be the same (either no gap, like 10-20, 20-30, or a constant gap, like 10-19, 20-29).");
    }
    rows.forEach(r => { r.LB = r.lo - gap / 2; r.UB = r.up + gap / 2; r.c = r.UB - r.LB; r.x = (r.lo + r.up) / 2; });
    return { rows, gap };
}
function getDS(v) {
    const type = v.dataType || "ungrouped";
    if (type === "ungrouped") {
        const data = parseNums(v.data, "The data values");
        if (!data.length) throw new Error("Enter your data values separated by commas, for example 12, 15, 18, 20.");
        return { type, data };
    }
    const f = parseNums(v.freq, "The frequencies");
    if (type === "discrete") {
        const xs = parseNums(v.data, "The values");
        if (!xs.length) throw new Error("Enter the values in the data box and their frequencies in the frequency box.");
        if (xs.length !== f.length) throw new Error("The number of values and the number of frequencies must be the same.");
        if (f.some(x => x < 0)) throw new Error("Frequencies cannot be negative.");
        const rows = xs.map((x, i) => ({ x, f: f[i] })).sort((a, b) => a.x - b.x);
        let cf = 0; rows.forEach(r => { cf += r.f; r.cf = cf; });
        if (cf <= 0) throw new Error("The total frequency must be greater than zero.");
        return { type, rows, N: cf };
    }
    const cl = parseClasses(v.classes);
    if (cl.rows.length !== f.length) throw new Error(`You entered ${cl.rows.length} classes but ${f.length} frequencies. They must match.`);
    if (f.some(x => x < 0)) throw new Error("Frequencies cannot be negative.");
    let cf = 0;
    cl.rows.forEach((r, i) => { r.f = f[i]; cf += f[i]; r.cf = cf; });
    if (cf <= 0) throw new Error("The total frequency must be greater than zero.");
    return { type: "grouped", rows: cl.rows, N: cf, gap: cl.gap };
}
const dsN = ds => ds.type === "ungrouped" ? ds.data.length : ds.N;
const isFreq = ds => ds.type !== "ungrouped";

/* ---------- tables ---------- */
function gtable(ds, cols, ctx = {}) {
    const rows = ds.rows, g = ds.type === "grouped", m = ctx.mean;
    const tot = fn => () => F(sumArr(rows.map(fn)));
    const D = {
        cls: g ? ["Class", r => `${F(r.lo)} &ndash; ${F(r.up)}`] : null,
        bnd: g ? ["Class boundaries", r => `${F(r.LB)} &ndash; ${F(r.UB)}`] : null,
        x: [g ? "Class mark x" : "Value x", r => F(r.x)],
        f: ["Frequency f", r => F(r.f), () => F(ds.N)],
        fx: ["fx", r => F(r.f * r.x), tot(r => r.f * r.x)],
        fx2: ["fx&sup2;", r => F(r.f * r.x * r.x), tot(r => r.f * r.x * r.x)],
        cf: ["Cumulative f", r => F(r.cf)],
        dev: ["x &minus; " + xbar, r => F(r.x - m)],
        fdev2: ["f(x &minus; " + xbar + ")&sup2;", r => F(r.f * Math.pow(r.x - m, 2)), tot(r => r.f * Math.pow(r.x - m, 2))],
        fdev4: ["f(x &minus; " + xbar + ")" + sup(4), r => F(r.f * Math.pow(r.x - m, 4)), tot(r => r.f * Math.pow(r.x - m, 4))],
        fabs: ["f|x &minus; " + xbar + "|", r => F(r.f * Math.abs(r.x - m)), tot(r => r.f * Math.abs(r.x - m))]
    };
    const used = cols.filter(c => D[c]);
    return tbl(used.map(c => D[c][0]), rows.map(r => used.map(c => D[c][1](r))), used.map((c, i) => i === 0 ? "Total" : (D[c][2] ? D[c][2]() : "")));
}
function utable(data, cols, ctx = {}) {
    const m = ctx.mean;
    const D = {
        no: ["No.", (x, i) => String(i + 1)],
        x: ["x", x => F(x), () => F(sumArr(data))],
        x2: ["x&sup2;", x => F(x * x), () => F(sumArr(data.map(x => x * x)))],
        dev: ["x &minus; " + xbar, x => F(x - m), () => F(sumArr(data.map(x => x - m)))],
        dev2: ["(x &minus; " + xbar + ")&sup2;", x => F(Math.pow(x - m, 2)), () => F(sumArr(data.map(x => Math.pow(x - m, 2))))],
        dev4: ["(x &minus; " + xbar + ")" + sup(4), x => F(Math.pow(x - m, 4)), () => F(sumArr(data.map(x => Math.pow(x - m, 4))))],
        abs: ["|x &minus; " + xbar + "|", x => F(Math.abs(x - m)), () => F(sumArr(data.map(x => Math.abs(x - m))))]
    };
    return tbl(cols.map(c => D[c][0]), data.map((x, i) => cols.map(c => D[c][1](x, i))), cols.map((c, i) => i === 0 ? "Total" : (D[c][2] ? D[c][2]() : "")));
}

/* ---------- introduction steps for a data set ---------- */
function intro(ds, push) {
    if (ds.type === "ungrouped") {
        push("Write down the data", `${ds.data.map(F).join(", ")}<br>Number of values: n = ${ds.data.length}`);
    } else if (ds.type === "discrete") {
        push("Write down the frequency table", gtable(ds, ["x", "f"]) + `Total frequency: N = &Sigma;f = ${F(ds.N)}`);
    } else {
        push("Write down the class intervals and frequencies", gtable(ds, ["cls", "f"]) + `Total frequency: N = &Sigma;f = ${F(ds.N)}`);
        if (ds.gap > 0) {
            const h = ds.gap / 2;
            push("Convert the class limits to class boundaries", `The classes have a gap of ${F(ds.gap)} between them, so subtract ${F(h)} from every lower limit and add ${F(h)} to every upper limit.<br>` +
                tbl(["Class limits", "Class boundaries"], ds.rows.map(r => [`${F(r.lo)} &ndash; ${F(r.up)}`, `${F(r.LB)} &ndash; ${F(r.UB)}`]), null));
        }
    }
}

/* =========================================================
   REUSABLE STATISTICAL PARTS (each pushes its own working steps)
========================================================= */

function meanPart(ds, push) {
    if (ds.type === "ungrouped") {
        const n = ds.data.length, s = sumArr(ds.data), m = s / n;
        push("Add up all the values", `&Sigma;x = ${listSum(ds.data)} = <strong>${F(s)}</strong><br>n = ${n}`);
        push("Divide the total by the number of values", `${xbar} = ${frac("&Sigma;x", "n")} = ${frac(F(s), n)} = <strong>${F(m)}</strong>`);
        return m;
    }
    const rows = ds.rows, N = ds.N, sfx = sumArr(rows.map(r => r.f * r.x)), m = sfx / N;
    if (ds.type === "grouped") {
        push("Find the class mark (midpoint) of each class", `x = ${frac("lower limit + upper limit", 2)}<br>` + rows.map(r => `${F(r.lo)} &ndash; ${F(r.up)}: x = ${frac(`${F(r.lo)} + ${F(r.up)}`, 2)} = ${F(r.x)}`).join("<br>"));
    }
    push("Multiply each value by its frequency, then add up", gtable(ds, ["cls", "x", "f", "fx"]) + `&Sigma;f = ${F(N)} and &Sigma;fx = ${F(sfx)}`);
    push("Divide &Sigma;fx by &Sigma;f", `${xbar} = ${frac("&Sigma;fx", "&Sigma;f")} = ${frac(F(sfx), F(N))} = <strong>${F(m)}</strong>`);
    return m;
}

function valueAtPos(ds, pos) {
    if (ds.type === "ungrouped") { const d = [...ds.data].sort((a, b) => a - b); return d[Math.min(Math.max(pos, 1), d.length) - 1]; }
    const r = ds.rows.find(rr => rr.cf >= pos) || ds.rows[ds.rows.length - 1];
    return r.x;
}

/* position-based value with interpolation (ungrouped / frequency tables) */
function interpPos(ds, pos) {
    const N = dsN(ds), lo = Math.floor(pos), fr = pos - lo;
    const a = valueAtPos(ds, lo), b = valueAtPos(ds, lo + 1);
    return { lo, fr, a, b, value: fr === 0 ? a : a + fr * (b - a) };
}

function quantilePart(ds, k, m, label, push) {
    const N = dsN(ds);
    if (ds.type === "grouped") {
        const target = k * N / m;
        push(`Find the position of ${label}`, `Position = ${frac(`${k === 1 ? "" : k + " &times; "}N`, m)} = ${frac(`${k === 1 ? "" : k + " &times; "}${F(N)}`, m)} = <strong>${F(target)}</strong><br>` + "Build the cumulative frequency column:" + gtable(ds, ["bnd", "f", "cf"]));
        const idx = ds.rows.findIndex(r => r.cf >= target && r.f > 0);
        const r = ds.rows[idx], cfb = r.cf - r.f;
        push(`Find the ${label} class`, `The first class whose cumulative frequency reaches ${F(target)} is ${F(r.LB)} &ndash; ${F(r.UB)}.<br>L = ${F(r.LB)}, cf (before the class) = ${F(cfb)}, f = ${F(r.f)}, c = ${F(r.c)}`);
        const p1 = target - cfb, p2 = p1 / r.f, p3 = p2 * r.c, val = r.LB + p3;
        push(`Apply the formula for ${label}`, `${label} = L + ${frac(`(${k === 1 ? "" : k}N${DIVS}${m}) &minus; cf`, "f")} &times; c<br>` +
            `Top part: ${F(target)} &minus; ${F(cfb)} = ${F(p1)}<br>Divide by f: ${F(p1)} &divide; ${F(r.f)} = ${F(p2)}<br>Multiply by c: ${F(p2)} &times; ${F(r.c)} = ${F(p3)}<br>` +
            `${label} = ${F(r.LB)} + ${F(p3)} = <strong>${F(val)}</strong>`);
        return val;
    }
    const pos = k * (N + 1) / m;
    if (ds.type === "ungrouped") push("Arrange the data in ascending order", [...ds.data].sort((a, b) => a - b).map(F).join(", "));
    else push("Build the cumulative frequency column", gtable(ds, ["x", "f", "cf"]));
    push(`Find the position of ${label}`, `Position = ${frac(`${k}(N + 1)`, m)} = ${frac(`${k}(${F(N)} + 1)`, m)} = <strong>${F(pos)}</strong>`);
    const ip = interpPos(ds, pos);
    if (ip.fr === 0 || pos < 1 || pos > N) {
        push(`Read the ${label}`, `The value at position ${F(Math.min(Math.max(pos, 1), N))} is <strong>${F(ip.value)}</strong>`);
    } else {
        push(`Interpolate between the two neighbouring values`, `The ${ord(ip.lo)} value = ${F(ip.a)} and the ${ord(ip.lo + 1)} value = ${F(ip.b)}<br>Fractional part = ${F(ip.fr)}<br>` +
            `${label} = ${F(ip.a)} + ${F(ip.fr)} &times; (${F(ip.b)} &minus; ${F(ip.a)}) = ${F(ip.a)} + ${F(ip.fr * (ip.b - ip.a))} = <strong>${F(ip.value)}</strong>`);
    }
    return ip.value;
}

function medianPart(ds, push) {
    const N = dsN(ds);
    if (ds.type === "grouped") return quantilePart(ds, 1, 2, "Median", push);
    if (ds.type === "ungrouped") {
        const d = [...ds.data].sort((a, b) => a - b), n = d.length;
        push("Arrange the data in ascending order", d.map(F).join(", "));
        if (n % 2) {
            const p = (n + 1) / 2;
            push("Find the middle position", `n = ${n} (odd), so Position = ${frac("n + 1", 2)} = ${frac(`${n} + 1`, 2)} = ${p}`);
            push("Read the middle value", `The ${ord(p)} value is <strong>${F(d[p - 1])}</strong>`);
            return d[p - 1];
        }
        const p1 = n / 2, p2 = p1 + 1, m = (d[p1 - 1] + d[p2 - 1]) / 2;
        push("Find the two middle positions", `n = ${n} (even), so the middle values are the ${ord(p1)} and the ${ord(p2)}`);
        push("Average the two middle values", `Median = ${frac(`${F(d[p1 - 1])} + ${F(d[p2 - 1])}`, 2)} = ${frac(F(d[p1 - 1] + d[p2 - 1]), 2)} = <strong>${F(m)}</strong>`);
        return m;
    }
    push("Build the cumulative frequency column", gtable(ds, ["x", "f", "cf"]));
    if (N % 2) {
        const p = (N + 1) / 2, v = valueAtPos(ds, p);
        push("Find the middle position", `N = ${F(N)} (odd), so Position = ${frac("N + 1", 2)} = ${F(p)}`);
        push("Read the value from the cumulative frequency column", `The ${ord(p)} value is <strong>${F(v)}</strong>`);
        return v;
    }
    const p1 = N / 2, a = valueAtPos(ds, p1), b = valueAtPos(ds, p1 + 1), m = (a + b) / 2;
    push("Find the two middle positions", `N = ${F(N)} (even), so the middle values are the ${ord(p1)} and the ${ord(p1 + 1)}`);
    push("Average the two middle values", `Median = ${frac(`${F(a)} + ${F(b)}`, 2)} = <strong>${F(m)}</strong>`);
    return m;
}

/* returns { value (NaN if none/multiple), text } */
function modePart(ds, push) {
    if (ds.type === "grouped") {
        const rows = ds.rows, maxf = Math.max(...rows.map(r => r.f)), idx = rows.findIndex(r => r.f === maxf), r = rows[idx];
        const f0 = idx > 0 ? rows[idx - 1].f : 0, f2 = idx < rows.length - 1 ? rows[idx + 1].f : 0;
        const d1 = r.f - f0, d2 = r.f - f2;
        push("Find the modal class (the class with the highest frequency)", gtable(ds, ["bnd", "f"]) + `The highest frequency is ${F(maxf)}, so the modal class is <strong>${F(r.LB)} &ndash; ${F(r.UB)}</strong>.`);
        push("Pick out the values for the formula", `L = ${F(r.LB)} (lower boundary of the modal class)<br>f${sub(1)} = ${F(r.f)} (frequency of the modal class)<br>f${sub(0)} = ${F(f0)} (frequency of the class before${idx === 0 ? ", none, so 0" : ""})<br>f${sub(2)} = ${F(f2)} (frequency of the class after${idx === rows.length - 1 ? ", none, so 0" : ""})<br>c = ${F(r.c)} (class width)`);
        push("Find the differences", `&#916;${sub(1)} = f${sub(1)} &minus; f${sub(0)} = ${F(r.f)} &minus; ${F(f0)} = ${F(d1)}<br>&#916;${sub(2)} = f${sub(1)} &minus; f${sub(2)} = ${F(r.f)} &minus; ${F(f2)} = ${F(d2)}`);
        if (d1 + d2 === 0) { push("Check the formula", "&#916;1 + &#916;2 = 0, so the modal-class formula cannot be used for this table."); return { value: NaN, text: "no unique mode" }; }
        const fr = d1 / (d1 + d2), part = fr * r.c, val = r.LB + part;
        push("Apply the formula Mode = L + [&#916;1 &divide; (&#916;1 + &#916;2)] &times; c", `Fraction: ${frac(F(d1), `${F(d1)} + ${F(d2)}`)} = ${frac(F(d1), F(d1 + d2))} = ${F(fr)}<br>Multiply by c: ${F(fr)} &times; ${F(r.c)} = ${F(part)}<br>Mode = ${F(r.LB)} + ${F(part)} = <strong>${F(val)}</strong>`);
        return { value: val, text: F(val) };
    }
    let table;
    if (ds.type === "ungrouped") {
        const map = new Map(); ds.data.forEach(x => map.set(x, (map.get(x) || 0) + 1));
        table = [...map.entries()].sort((a, b) => a[0] - b[0]).map(([x, f]) => ({ x, f }));
        push("Count how many times each value appears", tbl(["Value x", "Frequency f"], table.map(r => [F(r.x), F(r.f)]), null));
    } else {
        table = ds.rows;
        push("Look at the frequency of each value", gtable(ds, ["x", "f"]));
    }
    const maxf = Math.max(...table.map(r => r.f)), modes = table.filter(r => r.f === maxf).map(r => r.x);
    if (maxf === 1 && ds.type === "ungrouped") {
        push("Pick the most frequent value", "Every value appears only once, so there is <strong>no mode</strong>.");
        return { value: NaN, text: "no mode (every value appears once)" };
    }
    if (modes.length === table.length && table.length > 1) {
        push("Pick the most frequent value", "All values have the same frequency, so there is <strong>no mode</strong>.");
        return { value: NaN, text: "no mode (all frequencies are equal)" };
    }
    push("Pick the most frequent value", `The highest frequency is ${F(maxf)}. It belongs to ${modes.map(F).join(" and ")}.`);
    const lab = modes.length === 1 ? "unimodal" : (modes.length === 2 ? "bimodal" : "multimodal");
    return { value: modes.length === 1 ? modes[0] : NaN, text: modes.map(F).join(" and ") + (modes.length > 1 ? ` (${lab})` : ""), list: modes };
}

function rangePart(ds, push) {
    if (ds.type === "ungrouped") {
        const mx = Math.max(...ds.data), mn = Math.min(...ds.data);
        push("Find the largest and the smallest value", `Largest value = ${F(mx)}<br>Smallest value = ${F(mn)}`);
        push("Subtract", `Range = Largest &minus; Smallest = ${F(mx)} &minus; ${P(mn)} = <strong>${F(mx - mn)}</strong>`);
        return { range: mx - mn, hi: mx, lo: mn };
    }
    const rows = ds.rows;
    if (ds.type === "discrete") {
        const mx = rows[rows.length - 1].x, mn = rows[0].x;
        push("Find the largest and the smallest value in the table", `Largest value = ${F(mx)}<br>Smallest value = ${F(mn)}`);
        push("Subtract", `Range = ${F(mx)} &minus; ${P(mn)} = <strong>${F(mx - mn)}</strong>`);
        return { range: mx - mn, hi: mx, lo: mn };
    }
    const hi = rows[rows.length - 1].UB, lo = rows[0].LB;
    push("Find the highest upper boundary and the lowest lower boundary", `Highest upper class boundary = ${F(hi)}<br>Lowest lower class boundary = ${F(lo)}`);
    push("Subtract", `Range = Highest upper boundary &minus; Lowest lower boundary = ${F(hi)} &minus; ${P(lo)} = <strong>${F(hi - lo)}</strong>`);
    return { range: hi - lo, hi, lo };
}

/* variance / SD: returns { mean, N, ss, variance, sd, divisor } */
function spreadPart(ds, push, sample) {
    const N = dsN(ds);
    if (sample && N < 2) throw new Error("A sample variance needs at least 2 values.");
    const mean = meanPart(ds, push);
    const div = sample ? N - 1 : N;
    let ss, sx2;
    if (ds.type === "ungrouped") {
        ss = sumArr(ds.data.map(x => Math.pow(x - mean, 2)));
        sx2 = sumArr(ds.data.map(x => x * x));
        push(`Find each deviation from the mean and square it`, `Mean ${xbar} = ${F(mean)}<br>` + utable(ds.data, ["no", "x", "dev", "dev2"], { mean }) + `&Sigma;(x &minus; ${xbar})&sup2; = <strong>${F(ss)}</strong>`);
    } else {
        ss = sumArr(ds.rows.map(r => r.f * Math.pow(r.x - mean, 2)));
        sx2 = sumArr(ds.rows.map(r => r.f * r.x * r.x));
        push("Find each deviation from the mean, square it and multiply by f", `Mean ${xbar} = ${F(mean)}<br>` + gtable(ds, ["cls", "x", "f", "dev", "fdev2"], { mean }) + `&Sigma;f(x &minus; ${xbar})&sup2; = <strong>${F(ss)}</strong>`);
    }
    const variance = ss / div, sd = Math.sqrt(variance);
    const sym = sample ? "s" : "&sigma;";
    const topSym = ds.type === "ungrouped" ? `&Sigma;(x &minus; ${xbar})&sup2;` : `&Sigma;f(x &minus; ${xbar})&sup2;`;
    const botSym = ds.type === "ungrouped" ? (sample ? "n &minus; 1" : "n") : (sample ? "&Sigma;f &minus; 1" : "&Sigma;f");
    push(`Divide by ${sample ? "(" + (ds.type === "ungrouped" ? "n" : "&Sigma;f") + " &minus; 1)" : (ds.type === "ungrouped" ? "n" : "&Sigma;f")} to get the variance`,
        `${sym}&sup2; = ${frac(topSym, botSym)} = ${frac(F(ss), F(div))} = <strong>${F(variance)}</strong>`);
    let check = null;
    if (!sample) {
        check = sx2 / N - mean * mean;
        push("Check with the shortcut formula", `${sym}&sup2; = ${frac(ds.type === "ungrouped" ? "&Sigma;x&sup2;" : "&Sigma;fx&sup2;", ds.type === "ungrouped" ? "n" : "&Sigma;f")} &minus; ${xbar}&sup2; = ${frac(F(sx2), F(N))} &minus; (${F(mean)})&sup2; = ${F(sx2 / N)} &minus; ${F(mean * mean)} = ${F(check)}`);
    }
    return { mean, N, ss, variance, sd, div, sym };
}

/* =========================================================
   THE CALCULATORS
========================================================= */

const wrap = fn => v => { try { return fn(v || {}); } catch (e) { return errorMessage(e && e.message ? e.message : "Check your inputs and try again."); } };
const numField = (v, k) => { const s = clean(v[k]); return s === "" ? NaN : Number(s); };

const TYPE_OPTS = [["ungrouped", "Ungrouped data (raw values)"], ["discrete", "Ungrouped frequency table (values and frequencies)"], ["grouped", "Grouped data (class intervals and frequencies)"]];
const TYPE_OPTS_MANUAL = [["manual", "Enter the values directly"], ...TYPE_OPTS];
const BASIS_OPTS = [["population", "Population (divide by n)"], ["sample", "Sample (divide by n − 1)"]];
const DATA_FIELDS = [
    ["dataType", "Type of Data", "select"],
    ["data", "Ungrouped data or table values (comma separated, e.g. 12, 15, 18)", "text"],
    ["classes", "Grouped data only: class intervals (e.g. 0-10, 10-20, 20-30)", "text"],
    ["freq", "Tables only: frequencies (e.g. 5, 8, 12)", "text"]
];
const formulaBox = (a, b, c) => `<strong>Ungrouped:</strong> ${a}<br><strong>Frequency table or grouped data:</strong> ${b}` + (c ? `<br>${c}` : "");

/* ---------- Mean ---------- */
function calcMean(v) {
    const ds = getDS(v), { st, push } = mk();
    intro(ds, push);
    const m = meanPart(ds, push);
    return resultTemplate(formulaBox(`${xbar} = ${frac("&Sigma;x", "n")}`, `${xbar} = ${frac("&Sigma;fx", "&Sigma;f")} where x = class mark = (lower + upper) &divide; 2`),
        joinSteps(st), `<strong>Mean ${xbar} = ${F(m)}</strong>`, "The mean is the balancing point of the data.");
}

/* ---------- Weighted mean ---------- */
function calcWeighted(v) {
    const x = parseNums(v.values, "The values"), w = parseNums(v.weights, "The weights");
    if (!x.length || x.length !== w.length) throw new Error("Values and weights must have the same non-zero number of entries.");
    if (w.some(a => a < 0)) throw new Error("Weights cannot be negative.");
    const sw = sumArr(w);
    if (sw === 0) throw new Error("The sum of the weights cannot be zero.");
    const { st, push } = mk();
    push("Write the values and their weights", tbl(["Value x", "Weight w"], x.map((a, i) => [F(a), F(w[i])]), null));
    const wx = x.map((a, i) => a * w[i]), swx = sumArr(wx);
    push("Multiply each value by its weight", tbl(["x", "w", "wx"], x.map((a, i) => [F(a), F(w[i]), F(wx[i])]), ["Total", F(sw), F(swx)]) + `&Sigma;w = ${F(sw)}, &Sigma;wx = ${F(swx)}`);
    const m = swx / sw;
    push("Divide &Sigma;wx by &Sigma;w", `${xbar}${sub("w")} = ${frac("&Sigma;wx", "&Sigma;w")} = ${frac(F(swx), F(sw))} = <strong>${F(m)}</strong>`);
    return resultTemplate(`${xbar}${sub("w")} = ${frac("&Sigma;wx", "&Sigma;w")}`, joinSteps(st), `<strong>Weighted mean = ${F(m)}</strong>`, "Values with larger weights pull the mean towards them.");
}

/* ---------- Median ---------- */
function calcMedian(v) {
    const ds = getDS(v), { st, push } = mk();
    intro(ds, push);
    const m = medianPart(ds, push);
    return resultTemplate(formulaBox("Median = middle value; for even n, the average of the two middle values", "Median = L + [(N&divide;2 &minus; cf) &divide; f] &times; c (grouped data)<br>L = lower boundary of median class, cf = cumulative frequency before it, f = its frequency, c = class width"),
        joinSteps(st), `<strong>Median = ${F(m)}</strong>`, "Half of the data lies below the median and half above it.");
}

/* ---------- Mode ---------- */
function calcMode(v) {
    const ds = getDS(v), { st, push } = mk();
    intro(ds, push);
    const r = modePart(ds, push);
    return resultTemplate(formulaBox("Mode = the value that occurs most often", "Mode = L + [&#916;1 &divide; (&#916;1 + &#916;2)] &times; c (grouped data)<br>&#916;1 = f1 &minus; f0 and &#916;2 = f1 &minus; f2"),
        joinSteps(st), `<strong>Mode = ${r.text}</strong>`, "The mode is the most common value, or the most crowded class in grouped data.");
}

/* ---------- Range ---------- */
function calcRange(v) {
    const ds = getDS(v), { st, push } = mk();
    intro(ds, push);
    const r = rangePart(ds, push);
    const coef = (r.hi - r.lo) / (r.hi + r.lo);
    if (r.hi + r.lo !== 0) push("Find the coefficient of range", `Coefficient of range = ${frac("Largest &minus; Smallest", "Largest + Smallest")} = ${frac(`${F(r.hi)} &minus; ${P(r.lo)}`, `${F(r.hi)} + ${P(r.lo)}`)} = <strong>${F(coef)}</strong>`);
    return resultTemplate(formulaBox("Range = Largest value &minus; Smallest value", "Range = Highest upper class boundary &minus; Lowest lower class boundary"),
        joinSteps(st), `<strong>Range = ${F(r.range)}</strong>` + (r.hi + r.lo !== 0 ? `<br>Coefficient of range = ${F(coef)}` : ""), "The range measures the total spread, but it uses only the two extreme values.");
}

/* ---------- Variance and standard deviation ---------- */
const varFormulaU = s => `${s ? "s" : "&sigma;"}&sup2; = ${frac(`&Sigma;(x &minus; ${xbar})&sup2;`, s ? "n &minus; 1" : "n")}`;
const varFormulaG = s => `${s ? "s" : "&sigma;"}&sup2; = ${frac(`&Sigma;f(x &minus; ${xbar})&sup2;`, s ? "&Sigma;f &minus; 1" : "&Sigma;f")}`;
function calcVariance(v) {
    const ds = getDS(v), sample = v.basis === "sample", { st, push } = mk();
    intro(ds, push);
    const r = spreadPart(ds, push, sample);
    return resultTemplate(formulaBox(varFormulaU(sample), varFormulaG(sample)), joinSteps(st), `<strong>${sample ? "Sample" : "Population"} variance ${r.sym}&sup2; = ${F(r.variance)}</strong>`, "Variance is the average squared distance of the data from the mean.");
}
function calcSD(v) {
    const ds = getDS(v), sample = v.basis === "sample", { st, push } = mk();
    intro(ds, push);
    const r = spreadPart(ds, push, sample);
    push("Take the square root of the variance", `${r.sym} = &radic;(${r.sym}&sup2;) = &radic;(${F(r.variance)}) = <strong>${F(r.sd)}</strong>`);
    return resultTemplate(formulaBox(`${sample ? "s" : "&sigma;"} = &radic;[${frac(`&Sigma;(x &minus; ${xbar})&sup2;`, sample ? "n &minus; 1" : "n")}]`, `${sample ? "s" : "&sigma;"} = &radic;[${frac(`&Sigma;f(x &minus; ${xbar})&sup2;`, sample ? "&Sigma;f &minus; 1" : "&Sigma;f")}]`),
        joinSteps(st), `<strong>${sample ? "Sample" : "Population"} standard deviation ${r.sym} = ${F(r.sd)}</strong><br>Variance = ${F(r.variance)}`, "Standard deviation is in the same units as the data.");
}

/* ---------- Coefficient of variation ---------- */
function calcCV(v) {
    const { st, push } = mk();
    let mean, sd;
    if ((v.dataType || "manual") === "manual") {
        mean = numField(v, "mean"); sd = numField(v, "sd");
        if (!Number.isFinite(mean) || !Number.isFinite(sd)) throw new Error("Enter the mean and the standard deviation, or choose a data type and enter the data.");
        if (mean === 0) throw new Error("The mean cannot be zero.");
        push("Write the given values", `Mean ${xbar} = ${F(mean)}<br>Standard deviation &sigma; = ${F(sd)}`);
    } else {
        const ds = getDS(v), sample = v.basis === "sample";
        intro(ds, push);
        const r = spreadPart(ds, push, sample);
        push("Take the square root of the variance", `${r.sym} = &radic;(${F(r.variance)}) = ${F(r.sd)}`);
        mean = r.mean; sd = r.sd;
        if (mean === 0) throw new Error("The mean is zero, so the coefficient of variation is undefined.");
    }
    const cv = sd / mean * 100;
    push("Divide the standard deviation by the mean", `${frac("&sigma;", xbar)} = ${frac(F(sd), F(mean))} = ${F(sd / mean)}`);
    push("Multiply by 100 to get a percentage", `CV = ${F(sd / mean)} &times; 100 = <strong>${F(cv)}%</strong>`);
    return resultTemplate(`CV = ${frac("&sigma;", xbar)} &times; 100%`, joinSteps(st), `<strong>Coefficient of variation = ${F(cv)}%</strong>`, "A smaller CV means the data is more consistent relative to its mean.");
}

/* ---------- Skewness ---------- */
function calcSkew(v) {
    const { st, push } = mk();
    let mean, mode, sd, median = NaN, modeText = "";
    if ((v.dataType || "manual") === "manual") {
        mean = numField(v, "mean"); mode = numField(v, "mode"); sd = numField(v, "sd");
        if (![mean, mode, sd].every(Number.isFinite)) throw new Error("Enter the mean, the mode and the standard deviation, or choose a data type and enter the data.");
        if (sd === 0) throw new Error("The standard deviation cannot be zero.");
        push("Write the given values", `Mean ${xbar} = ${F(mean)}<br>Mode = ${F(mode)}<br>Standard deviation &sigma; = ${F(sd)}`);
    } else {
        const ds = getDS(v), sample = v.basis === "sample";
        intro(ds, push);
        push("PART A: the mean and the standard deviation", "First find the mean and the standard deviation.");
        const r = spreadPart(ds, push, sample); mean = r.mean; sd = Math.sqrt(r.variance);
        push("Take the square root of the variance", `${r.sym} = &radic;(${F(r.variance)}) = ${F(sd)}`);
        push("PART B: the mode", "Now find the mode.");
        const md = modePart(ds, push); mode = md.value; modeText = md.text;
        push("PART C: the median", "Now find the median.");
        median = medianPart(ds, push);
        if (sd === 0) throw new Error("The standard deviation is zero, so skewness is undefined.");
    }
    let main, label;
    if (Number.isFinite(mode)) {
        const top = mean - mode; main = top / sd; label = "Pearson's first coefficient";
        push("Pearson's first coefficient of skewness", `Sk${sub(1)} = ${frac(`${xbar} &minus; Mode`, "&sigma;")} = ${frac(`${F(mean)} &minus; ${P(mode)}`, F(sd))} = ${frac(F(top), F(sd))} = <strong>${F(main)}</strong>`);
    }
    if (Number.isFinite(median)) {
        const top = 3 * (mean - median), sk2 = top / sd;
        push("Pearson's second coefficient of skewness", `Sk${sub(2)} = ${frac(`3(${xbar} &minus; Median)`, "&sigma;")} = ${frac(`3(${F(mean)} &minus; ${P(median)})`, F(sd))} = ${frac(F(top), F(sd))} = <strong>${F(sk2)}</strong>`);
        if (!Number.isFinite(main)) { main = sk2; label = "Pearson's second coefficient (no unique mode)"; }
    }
    const kind = Math.abs(main) < 1e-9 ? "symmetric" : (main > 0 ? "positively skewed (the long tail is on the right)" : "negatively skewed (the long tail is on the left)");
    return resultTemplate(`Sk${sub(1)} = ${frac(`${xbar} &minus; Mode`, "&sigma;")}<br>Sk${sub(2)} = ${frac(`3(${xbar} &minus; Median)`, "&sigma;")}`, joinSteps(st),
        `<strong>${label}: Sk = ${F(main)}</strong>` + (modeText ? `<br>Mode used: ${modeText}` : ""), `The distribution is ${kind}.`);
}

/* ---------- Kurtosis ---------- */
function calcKurt(v) {
    const { st, push } = mk();
    let m4, m2;
    if ((v.dataType || "manual") === "manual") {
        m4 = numField(v, "m4"); m2 = numField(v, "variance");
        if (!Number.isFinite(m4) || !Number.isFinite(m2)) throw new Error("Enter the fourth central moment and the variance, or choose a data type and enter the data.");
        if (m2 <= 0) throw new Error("The variance must be greater than zero.");
        push("Write the given values", `Fourth central moment &mu;${sub(4)} = ${F(m4)}<br>Variance &sigma;&sup2; = ${F(m2)}`);
    } else {
        const ds = getDS(v);
        intro(ds, push);
        const mean = meanPart(ds, push), N = dsN(ds);
        if (ds.type === "ungrouped") {
            const s2 = sumArr(ds.data.map(x => Math.pow(x - mean, 2))), s4 = sumArr(ds.data.map(x => Math.pow(x - mean, 4)));
            push("Find the deviations, then the squares and fourth powers", utable(ds.data, ["no", "x", "dev", "dev2", "dev4"], { mean }));
            m2 = s2 / N; m4 = s4 / N;
            push("Find the second and fourth central moments", `&mu;${sub(2)} = ${frac(`&Sigma;(x &minus; ${xbar})&sup2;`, "n")} = ${frac(F(s2), F(N))} = ${F(m2)}<br>&mu;${sub(4)} = ${frac(`&Sigma;(x &minus; ${xbar})${sup(4)}`, "n")} = ${frac(F(s4), F(N))} = ${F(m4)}`);
        } else {
            const s2 = sumArr(ds.rows.map(r => r.f * Math.pow(r.x - mean, 2))), s4 = sumArr(ds.rows.map(r => r.f * Math.pow(r.x - mean, 4)));
            push("Find the deviations, then f times the squares and fourth powers", gtable(ds, ["cls", "x", "f", "dev", "fdev2", "fdev4"], { mean }));
            m2 = s2 / N; m4 = s4 / N;
            push("Find the second and fourth central moments", `&mu;${sub(2)} = ${frac(`&Sigma;f(x &minus; ${xbar})&sup2;`, "&Sigma;f")} = ${frac(F(s2), F(N))} = ${F(m2)}<br>&mu;${sub(4)} = ${frac(`&Sigma;f(x &minus; ${xbar})${sup(4)}`, "&Sigma;f")} = ${frac(F(s4), F(N))} = ${F(m4)}`);
        }
        if (m2 <= 0) throw new Error("The variance is zero, so kurtosis is undefined.");
    }
    push("Square the variance", `&sigma;${sup(4)} = (&sigma;&sup2;)&sup2; = (${F(m2)})&sup2; = ${F(m2 * m2)}`);
    const b2 = m4 / (m2 * m2);
    push("Divide the fourth moment by &sigma;" + sup(4), `&beta;${sub(2)} = ${frac("&mu;" + sub(4), "&sigma;" + sup(4))} = ${frac(F(m4), F(m2 * m2))} = <strong>${F(b2)}</strong>`);
    push("Find the excess kurtosis", `&gamma;${sub(2)} = &beta;${sub(2)} &minus; 3 = ${F(b2)} &minus; 3 = <strong>${F(b2 - 3)}</strong>`);
    const kind = Math.abs(b2 - 3) < 1e-9 ? "mesokurtic (normal peakedness)" : (b2 > 3 ? "leptokurtic (more peaked than normal)" : "platykurtic (flatter than normal)");
    return resultTemplate(`&beta;${sub(2)} = ${frac("&mu;" + sub(4), "&sigma;" + sup(4))}, excess kurtosis = &beta;${sub(2)} &minus; 3`, joinSteps(st),
        `<strong>&beta;${sub(2)} = ${F(b2)}</strong><br>Excess kurtosis = ${F(b2 - 3)}`, `The distribution is ${kind}.`);
}

/* ---------- Quartiles, deciles, percentiles (new) ---------- */
function calcQuantiles(v) {
    const ds = getDS(v), { st, push } = mk(), meas = v.measure || "q1";
    intro(ds, push);
    const kk = numField(v, "k");
    let out = "", note = "";
    if (meas === "q1" || meas === "q2" || meas === "q3") {
        const k = Number(meas[1]), val = quantilePart(ds, k, 4, `Q${k}`, push);
        out = `<strong>Q${sub(k)} = ${F(val)}</strong>`;
    } else if (meas === "iqr") {
        push("PART A: the lower quartile Q1", "Find Q1 first.");
        const q1 = quantilePart(ds, 1, 4, "Q1", push);
        push("PART B: the upper quartile Q3", "Now find Q3.");
        const q3 = quantilePart(ds, 3, 4, "Q3", push);
        const iqr = q3 - q1;
        push("Interquartile range", `IQR = Q${sub(3)} &minus; Q${sub(1)} = ${F(q3)} &minus; ${P(q1)} = <strong>${F(iqr)}</strong>`);
        push("Quartile deviation (semi-interquartile range)", `QD = ${frac(`Q${sub(3)} &minus; Q${sub(1)}`, 2)} = ${frac(F(iqr), 2)} = <strong>${F(iqr / 2)}</strong>`);
        if (q3 + q1 !== 0) push("Coefficient of quartile deviation", `${frac(`Q${sub(3)} &minus; Q${sub(1)}`, `Q${sub(3)} + Q${sub(1)}`)} = ${frac(F(iqr), F(q3 + q1))} = <strong>${F(iqr / (q3 + q1))}</strong>`);
        out = `<strong>Q1 = ${F(q1)}, Q3 = ${F(q3)}</strong><br>IQR = ${F(iqr)}, Quartile deviation = ${F(iqr / 2)}`;
    } else if (meas === "decile") {
        if (!Number.isInteger(kk) || kk < 1 || kk > 9) throw new Error("For a decile, enter a whole number from 1 to 9 in the k box.");
        const val = quantilePart(ds, kk, 10, `D${kk}`, push); out = `<strong>D${sub(kk)} = ${F(val)}</strong>`;
    } else {
        if (!Number.isInteger(kk) || kk < 1 || kk > 99) throw new Error("For a percentile, enter a whole number from 1 to 99 in the k box.");
        const val = quantilePart(ds, kk, 100, `P${kk}`, push); out = `<strong>P${sub(kk)} = ${F(val)}</strong>`;
    }
    note = ds.type === "grouped" ? "For grouped data the position is kN/m and the value is found by interpolation inside the class." : "For raw data the position is k(N + 1)/m, with interpolation between neighbouring values when the position is not a whole number.";
    return resultTemplate(formulaBox(`Position = ${frac("k(n + 1)", "m")} (m = 4 for quartiles, 10 for deciles, 100 for percentiles)`, `Value = L + [(kN&divide;m &minus; cf) &divide; f] &times; c`), joinSteps(st), out, note);
}

/* ---------- Mean deviation (new) ---------- */
function calcMeanDev(v) {
    const ds = getDS(v), { st, push } = mk();
    intro(ds, push);
    const mean = meanPart(ds, push), N = dsN(ds);
    let tot;
    if (ds.type === "ungrouped") {
        tot = sumArr(ds.data.map(x => Math.abs(x - mean)));
        push("Find the distance of each value from the mean (ignore the signs)", utable(ds.data, ["no", "x", "abs"], { mean }));
        push("Divide by n", `MD = ${frac(`&Sigma;|x &minus; ${xbar}|`, "n")} = ${frac(F(tot), F(N))} = <strong>${F(tot / N)}</strong>`);
    } else {
        tot = sumArr(ds.rows.map(r => r.f * Math.abs(r.x - mean)));
        push("Find f times the distance from the mean (ignore the signs)", gtable(ds, ["cls", "x", "f", "fabs"], { mean }));
        push("Divide by &Sigma;f", `MD = ${frac(`&Sigma;f|x &minus; ${xbar}|`, "&Sigma;f")} = ${frac(F(tot), F(N))} = <strong>${F(tot / N)}</strong>`);
    }
    const md = tot / N;
    if (mean !== 0) push("Find the coefficient of mean deviation", `${frac("MD", xbar)} = ${frac(F(md), P(mean))} = <strong>${F(md / mean)}</strong>`);
    return resultTemplate(formulaBox(`MD = ${frac(`&Sigma;|x &minus; ${xbar}|`, "n")}`, `MD = ${frac(`&Sigma;f|x &minus; ${xbar}|`, "&Sigma;f")}`), joinSteps(st),
        `<strong>Mean deviation = ${F(md)}</strong>` + (mean !== 0 ? `<br>Coefficient of mean deviation = ${F(md / mean)}` : ""), "Mean deviation is the average distance of the data from the mean.");
}

/* =========================================================
   RELATIONSHIPS AND TIME SERIES
========================================================= */

function getPairs(v, kx, ky, minN = 2) {
    const x = parseNums(v[kx], "The X values"), y = parseNums(v[ky], "The Y values");
    if (x.length < minN || x.length !== y.length) throw new Error(`X and Y must have the same number of values (at least ${minN}).`);
    return [x, y];
}
const strength = r => { const a = Math.abs(r); return a >= 0.9 ? "very strong" : a >= 0.7 ? "strong" : a >= 0.5 ? "moderate" : a >= 0.3 ? "weak" : "very weak or no"; };

function calcCorrelation(v) {
    const [x, y] = getPairs(v, "x", "y"), n = x.length, { st, push } = mk();
    const sx = sumArr(x), sy = sumArr(y), sxy = sumArr(x.map((a, i) => a * y[i])), sx2 = sumArr(x.map(a => a * a)), sy2 = sumArr(y.map(a => a * a));
    push("Write the pairs of values", `n = ${n}`);
    push("Build the table of x, y, xy, x&sup2; and y&sup2;", tbl(["x", "y", "xy", "x&sup2;", "y&sup2;"], x.map((a, i) => [F(a), F(y[i]), F(a * y[i]), F(a * a), F(y[i] * y[i])]), ["Total", F(sy), F(sxy), F(sx2), F(sy2)]) + `&Sigma;x = ${F(sx)}, &Sigma;y = ${F(sy)}, &Sigma;xy = ${F(sxy)}, &Sigma;x&sup2; = ${F(sx2)}, &Sigma;y&sup2; = ${F(sy2)}`);
    const num = n * sxy - sx * sy, A = n * sx2 - sx * sx, B = n * sy2 - sy * sy;
    push("Work out the top part (numerator)", `n&Sigma;xy &minus; &Sigma;x&Sigma;y = ${n}(${F(sxy)}) &minus; (${F(sx)})(${F(sy)}) = ${F(n * sxy)} &minus; ${F(sx * sy)} = <strong>${F(num)}</strong>`);
    push("Work out the two parts under the square root", `n&Sigma;x&sup2; &minus; (&Sigma;x)&sup2; = ${n}(${F(sx2)}) &minus; (${F(sx)})&sup2; = ${F(n * sx2)} &minus; ${F(sx * sx)} = <strong>${F(A)}</strong><br>n&Sigma;y&sup2; &minus; (&Sigma;y)&sup2; = ${n}(${F(sy2)}) &minus; (${F(sy)})&sup2; = ${F(n * sy2)} &minus; ${F(sy * sy)} = <strong>${F(B)}</strong>`);
    if (A <= 0 || B <= 0) throw new Error("X or Y has no variation (all its values are the same), so the correlation is undefined.");
    const den = Math.sqrt(A * B), r = num / den;
    push("Combine the parts", `Denominator = &radic;(${F(A)} &times; ${F(B)}) = &radic;(${F(A * B)}) = ${F(den)}<br>r = ${frac(F(num), F(den))} = <strong>${F(r)}</strong>`);
    push("Find the coefficient of determination", `r&sup2; = (${F(r)})&sup2; = ${F(r * r)}, so ${F2(r * r * 100, 2)}% of the variation in Y is explained by X.`);
    return resultTemplate(`r = ${frac("n&Sigma;xy &minus; &Sigma;x&Sigma;y", "&radic;{[n&Sigma;x&sup2; &minus; (&Sigma;x)&sup2;][n&Sigma;y&sup2; &minus; (&Sigma;y)&sup2;]}")}`, joinSteps(st),
        `<strong>Pearson correlation r = ${F(r)}</strong>`, `There is a ${strength(r)} ${r > 0 ? "positive" : r < 0 ? "negative" : ""} linear relationship.`);
}

function ranksOf(a) {
    const idx = a.map((_, i) => i).sort((i, j) => a[j] - a[i]), r = Array(a.length);
    let i = 0, ties = false;
    while (i < idx.length) {
        let j = i;
        while (j + 1 < idx.length && a[idx[j + 1]] === a[idx[i]]) j++;
        if (j > i) ties = true;
        const avg = (i + j) / 2 + 1;
        for (let k = i; k <= j; k++) r[idx[k]] = avg;
        i = j + 1;
    }
    return { r, ties };
}
function calcSpearman(v) {
    const { st, push } = mk();
    let d2, n, ties = false, exact = null;
    if ((v.inputMode || "manual") === "manual") {
        d2 = numField(v, "d2"); n = numField(v, "n");
        if (!Number.isFinite(d2) || !Number.isFinite(n)) throw new Error("Enter Σd² and n, or choose 'Rank the X and Y data' and enter the data.");
        if (!Number.isInteger(n) || n < 2) throw new Error("n must be a whole number of at least 2.");
        if (d2 < 0) throw new Error("Σd² cannot be negative.");
        push("Write the given values", `&Sigma;d&sup2; = ${F(d2)}, n = ${F(n)}`);
    } else {
        const [x, y] = getPairs(v, "x", "y"); n = x.length;
        const rx = ranksOf(x), ry = ranksOf(y); ties = rx.ties || ry.ties;
        push("Rank the X values (the highest value gets rank 1)", `Where values are tied, each takes the average of the ranks they share.` + tbl(["x", "Rank of x"], x.map((a, i) => [F(a), F(rx.r[i])]), null));
        push("Rank the Y values in the same way", tbl(["y", "Rank of y"], y.map((a, i) => [F(a), F(ry.r[i])]), null));
        const d = rx.r.map((a, i) => a - ry.r[i]);
        d2 = sumArr(d.map(a => a * a));
        push("Find the difference between the ranks and square it", tbl(["x", "y", "R" + "x", "R" + "y", "d = Rx &minus; Ry", "d&sup2;"], x.map((a, i) => [F(a), F(y[i]), F(rx.r[i]), F(ry.r[i]), F(d[i]), F(d[i] * d[i])]), ["Total", "", "", "", F(sumArr(d)), F(d2)]) + `&Sigma;d&sup2; = <strong>${F(d2)}</strong>, n = ${n}`);
        const mx = sumArr(rx.r) / n, my = sumArr(ry.r) / n;
        const sxy = sumArr(rx.r.map((a, i) => (a - mx) * (ry.r[i] - my))), sxx = sumArr(rx.r.map(a => (a - mx) * (a - mx))), syy = sumArr(ry.r.map(a => (a - my) * (a - my)));
        if (sxx > 0 && syy > 0) exact = sxy / Math.sqrt(sxx * syy);
    }
    const bot = n * (n * n - 1), top = 6 * d2, rho = 1 - top / bot;
    push("Work out the parts of the formula", `n(n&sup2; &minus; 1) = ${F(n)}(${F(n)}&sup2; &minus; 1) = ${F(n)}(${F(n * n)} &minus; 1) = ${F(n)} &times; ${F(n * n - 1)} = ${F(bot)}<br>6&Sigma;d&sup2; = 6 &times; ${F(d2)} = ${F(top)}`);
    push("Divide, then subtract from 1", `${frac("6&Sigma;d&sup2;", "n(n&sup2; &minus; 1)")} = ${frac(F(top), F(bot))} = ${F(top / bot)}<br>&rho; = 1 &minus; ${F(top / bot)} = <strong>${F(rho)}</strong>`);
    if (ties && exact !== null) push("Note on tied ranks", `Because some values are tied, the formula is only approximate. The exact rank correlation (Pearson's r applied to the ranks) is <strong>${F(exact)}</strong>.`);
    return resultTemplate(`&rho; = 1 &minus; ${frac("6&Sigma;d&sup2;", "n(n&sup2; &minus; 1)")}`, joinSteps(st), `<strong>Spearman's rank correlation &rho; = ${F(rho)}</strong>`, `There is a ${strength(rho)} ${rho > 0 ? "positive" : rho < 0 ? "negative" : ""} rank relationship.`);
}

function calcCovariance(v) {
    const [x, y] = getPairs(v, "x", "y"), n = x.length, sample = v.basis === "sample", { st, push } = mk();
    if (sample && n < 2) throw new Error("Sample covariance needs at least 2 pairs.");
    const mx = sumArr(x) / n, my = sumArr(y) / n;
    push("Find the two means", `${xbar} = ${frac(F(sumArr(x)), n)} = ${F(mx)}<br>${ybar} = ${frac(F(sumArr(y)), n)} = ${F(my)}`);
    const prod = x.map((a, i) => (a - mx) * (y[i] - my)), s = sumArr(prod);
    push("Find the deviations and multiply them", tbl(["x", "y", "x &minus; " + xbar, "y &minus; " + ybar, "(x &minus; " + xbar + ")(y &minus; " + ybar + ")"], x.map((a, i) => [F(a), F(y[i]), F(a - mx), F(y[i] - my), F(prod[i])]), ["Total", "", "", "", F(s)]) + `&Sigma;(x &minus; ${xbar})(y &minus; ${ybar}) = <strong>${F(s)}</strong>`);
    const div = sample ? n - 1 : n, cov = s / div;
    push(`Divide by ${sample ? "n &minus; 1" : "n"}`, `Cov(X, Y) = ${frac(`&Sigma;(x &minus; ${xbar})(y &minus; ${ybar})`, sample ? "n &minus; 1" : "n")} = ${frac(F(s), F(div))} = <strong>${F(cov)}</strong>`);
    return resultTemplate(`Cov(X, Y) = ${frac(`&Sigma;(x &minus; ${xbar})(y &minus; ${ybar})`, sample ? "n &minus; 1" : "n")}`, joinSteps(st), `<strong>Cov(X, Y) = ${F(cov)}</strong>`, cov > 0 ? "Positive covariance: X and Y tend to move in the same direction." : cov < 0 ? "Negative covariance: X and Y tend to move in opposite directions." : "Zero covariance: no linear co-movement.");
}

/* ---------- Moving average ---------- */
function calcMovingAverage(v) {
    const y = parseNums(v.data, "The data values"), k = numField(v, "period"), n = y.length, { st, push } = mk();
    if (!n) throw new Error("Enter the data values separated by commas.");
    if (!Number.isInteger(k) || k < 2 || k > n) throw new Error("The period must be a whole number from 2 up to the number of values.");
    push("Write the data in time order", tbl(["t", ...y.map((_, i) => String(i + 1))], [["Y", ...y.map(F)]], null) + `n = ${n}, period k = ${k} (${k % 2 ? "odd" : "even"})`);
    const wins = []; for (let j = 0; j <= n - k; j++) { const seg = y.slice(j, j + k), tot = sumArr(seg); wins.push({ j, seg, tot, avg: tot / k }); }
    push(`Find the ${k}-period moving totals and averages`, `Add ${k} consecutive values, then divide by ${k}. Slide forward one period each time.<br>` +
        tbl(["Window", "Values added", "Moving total", "Moving average"], wins.map(w => [`t = ${w.j + 1} to ${w.j + k}`, w.seg.map(F).join(" + "), F(w.tot), F(w.avg)]), null) +
        `Example: ${wins[0].seg.map(F).join(" + ")} = ${F(wins[0].tot)}, then ${F(wins[0].tot)} &divide; ${k} = ${F(wins[0].avg)}`);
    let finals;
    if (k % 2) {
        const half = (k - 1) / 2;
        finals = wins.map(w => ({ t: w.j + 1 + half, v: w.avg }));
        push("Place each average at the middle period of its window", `For an odd period, each average sits exactly at the middle period.<br>` + tbl(["Middle period t", "Moving average"], finals.map(f => [String(f.t), F(f.v)]), null));
    } else {
        const cen = []; for (let j = 0; j + 1 < wins.length; j++) cen.push({ t: j + 1 + k / 2, a: wins[j].avg, b: wins[j + 1].avg, v: (wins[j].avg + wins[j + 1].avg) / 2 });
        finals = cen.map(c => ({ t: c.t, v: c.v }));
        if (!cen.length) throw new Error("There are not enough values to centre an even-period moving average. Use more data.");
        push("Centre the averages", `For an even period, each average falls halfway between two periods, so average two consecutive moving averages to centre them on a period.<br>` +
            tbl(["Centred at t", "Two averages", "Centred moving average"], cen.map(c => [String(c.t), `(${F(c.a)} + ${F(c.b)}) &divide; 2`, F(c.v)]), null));
    }
    push("Compare the series with its trend", tbl(["t", "Actual Y", "Trend (moving average)"], y.map((a, i) => { const f = finals.find(q => q.t === i + 1); return [String(i + 1), F(a), f ? F(f.v) : "&mdash;"]; }), null));
    return resultTemplate(`Moving average = ${frac("Sum of k consecutive values", "k")}<br>Even k: average two consecutive moving averages to centre them`, joinSteps(st),
        `<strong>Trend values: </strong>${finals.map(f => `t=${f.t}: ${F(f.v)}`).join(", ")}`, "A moving average smooths out short-term ups and downs to show the trend.");
}

/* ---------- Weighted moving average ---------- */
function calcWMA(v) {
    const x = parseNums(v.values, "The values"), w = parseNums(v.weights, "The weights"), { st, push } = mk();
    if (!x.length || !w.length || w.length > x.length) throw new Error("Enter the values and the weights. There cannot be more weights than values.");
    if (w.some(a => a < 0)) throw new Error("Weights cannot be negative.");
    const sw = sumArr(w);
    if (sw === 0) throw new Error("The sum of the weights cannot be zero.");
    const k = w.length, out = [];
    push("Write the values and the weights", `Values: ${x.map(F).join(", ")}<br>Weights: ${w.map(F).join(", ")} (&Sigma;w = ${F(sw)})` + (k < x.length ? `<br>There are fewer weights than values, so the ${k} weights are applied to each ${k} consecutive values (oldest value gets the first weight).` : ""));
    for (let j = 0; j + k <= x.length; j++) { const seg = x.slice(j, j + k), prods = seg.map((a, i) => a * w[i]), tot = sumArr(prods); out.push({ seg, prods, tot, avg: tot / sw }); }
    out.forEach((o, i) => {
        push(k < x.length ? `Weighted moving average ${i + 1}` : "Multiply each value by its weight and add up",
            tbl(["x", "w", "wx"], o.seg.map((a, q) => [F(a), F(w[q]), F(o.prods[q])]), ["Total", F(sw), F(o.tot)]) + `WMA = ${frac("&Sigma;wx", "&Sigma;w")} = ${frac(F(o.tot), F(sw))} = <strong>${F(o.avg)}</strong>`);
    });
    return resultTemplate(`WMA = ${frac("&Sigma;(w &times; x)", "&Sigma;w")}`, joinSteps(st), out.length === 1 ? `<strong>Weighted moving average = ${F(out[0].avg)}</strong>` : `<strong>Weighted moving averages: ${out.map(o => F(o.avg)).join(", ")}</strong>`, "Recent values can be given larger weights so they influence the result more.");
}

/* ---------- Least squares trend ---------- */
function calcTrend(v) {
    const y = parseNums(v.y, "The Y values"), n = y.length, { st, push } = mk();
    if (n < 2) throw new Error("Enter at least 2 Y values.");
    let X = parseNums(v.x, "The X values");
    let intro_ = "";
    if (!X.length) { X = y.map((_, i) => i + 1); intro_ = "The X box was empty, so the time periods 1, 2, 3, &hellip; are used.<br>"; }
    if (X.length !== n) throw new Error("X and Y must have the same number of values.");
    const coded = v.xMode === "coded", xm = sumArr(X) / n;
    const x = coded ? X.map(a => a - xm) : X;
    push("Write the data", intro_ + tbl(coded ? ["Original X", "Coded x = X &minus; " + F(xm), "Y"] : ["X", "Y"], X.map((a, i) => coded ? [F(a), F(x[i]), F(y[i])] : [F(a), F(y[i])]), null) + (coded ? "Coding with x = X &minus; mean makes &Sigma;x = 0, which simplifies the working." : ""));
    const sx = sumArr(x), sy = sumArr(y), sxy = sumArr(x.map((a, i) => a * y[i])), sx2 = sumArr(x.map(a => a * a));
    push("Build the table of x, y, xy and x&sup2;", tbl(["x", "y", "xy", "x&sup2;"], x.map((a, i) => [F(a), F(y[i]), F(a * y[i]), F(a * a)]), ["Total", F(sy), F(sxy), F(sx2)]) + `&Sigma;x = ${F(sx)}, &Sigma;y = ${F(sy)}, &Sigma;xy = ${F(sxy)}, &Sigma;x&sup2; = ${F(sx2)}`);
    push("Write the normal equations for Y = a + bx", `&Sigma;y = na + b&Sigma;x &nbsp;&rarr;&nbsp; ${F(sy)} = ${n}a + ${P(sx)}b<br>&Sigma;xy = a&Sigma;x + b&Sigma;x&sup2; &nbsp;&rarr;&nbsp; ${F(sxy)} = ${P(sx)}a + ${F(sx2)}b`);
    const bn = n * sxy - sx * sy, bd = n * sx2 - sx * sx;
    if (Math.abs(bd) < 1e-12) throw new Error("All the X values are the same, so a trend line cannot be fitted.");
    const b = bn / bd;
    push("Solve for b (the slope)", `b = ${frac("n&Sigma;xy &minus; &Sigma;x&Sigma;y", "n&Sigma;x&sup2; &minus; (&Sigma;x)&sup2;")}<br>Top: ${n}(${F(sxy)}) &minus; (${F(sx)})(${F(sy)}) = ${F(n * sxy)} &minus; ${F(sx * sy)} = ${F(bn)}<br>Bottom: ${n}(${F(sx2)}) &minus; (${F(sx)})&sup2; = ${F(n * sx2)} &minus; ${F(sx * sx)} = ${F(bd)}<br>b = ${frac(F(bn), F(bd))} = <strong>${F(b)}</strong>`);
    const a = (sy - b * sx) / n;
    push("Solve for a (the intercept)", `a = ${frac("&Sigma;y &minus; b&Sigma;x", "n")} = ${frac(`${F(sy)} &minus; ${P(b)}(${F(sx)})`, n)} = ${frac(F(sy - b * sx), n)} = <strong>${F(a)}</strong>`);
    const sign = b < 0 ? MINUS : "+";
    let eq = `Y = ${F(a)} ${sign} ${F(Math.abs(b))}${coded ? "x" : "X"}`;
    push("Write the trend equation", eq);
    let finalEq = eq;
    if (coded) {
        const a2 = a - b * xm;
        push("Convert back to the original X", `x = X &minus; ${F(xm)}, so Y = ${F(a)} + ${P(b)}(X &minus; ${F(xm)}) = (${F(a)} &minus; ${P(b)} &times; ${F(xm)}) + ${P(b)}X<br>Y = ${F(a2)} ${sign} ${F(Math.abs(b))}X`);
        finalEq = `Y = ${F(a2)} ${sign} ${F(Math.abs(b))}X (and in coded form: ${eq})`;
    }
    push("Calculate the trend values", tbl(["X", "Actual Y", "Trend Y = a + b" + (coded ? "x" : "X"), "Difference"], X.map((a0, i) => { const t = a + b * x[i]; return [F(a0), F(y[i]), F(t), F(y[i] - t)]; }), null));
    return resultTemplate(`Y = a + bX<br>b = ${frac("n&Sigma;XY &minus; &Sigma;X&Sigma;Y", "n&Sigma;X&sup2; &minus; (&Sigma;X)&sup2;")}, a = ${frac("&Sigma;Y &minus; b&Sigma;X", "n")}`, joinSteps(st),
        `<strong>${finalEq}</strong><br>a = ${F(a)}, b = ${F(b)}`, `On average, Y ${b >= 0 ? "increases" : "decreases"} by ${F(Math.abs(b))} for each one-unit increase in ${coded ? "x" : "X"}.`);
}

/* ---------- Trend forecast ---------- */
function calcForecast(v) {
    const a = numField(v, "a"), b = numField(v, "b"), xs = parseNums(v.x, "The future X values"), { st, push } = mk();
    if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error("Enter valid values for the intercept a and the trend coefficient b.");
    if (!xs.length) throw new Error("Enter at least one future X value (several can be separated by commas).");
    push("Write the trend equation", `Y = a + bX = ${F(a)} ${b < 0 ? MINUS : "+"} ${F(Math.abs(b))}X`);
    const res = xs.map(X => ({ X, bx: b * X, Y: a + b * X }));
    res.forEach((r, i) => push(`Forecast for X = ${F(r.X)}`, `bX = ${P(b)} &times; ${P(r.X)} = ${F(r.bx)}<br>Y = a + bX = ${F(a)} + ${P(r.bx)} = <strong>${F(r.Y)}</strong>`));
    return resultTemplate("Y = a + bX", joinSteps(st), res.length === 1 ? `<strong>Forecast Y = ${F(res[0].Y)}</strong>` : `<strong>Forecasts: ${res.map(r => `X=${F(r.X)}: ${F(r.Y)}`).join(", ")}</strong>`, "A forecast assumes the trend continues as before.");
}

/* ---------- Seasonal index ---------- */
function calcSeasonal(v) {
    const { st, push } = mk();
    if ((v.method || "simple") === "simple") {
        const act = numField(v, "actual"), avg = numField(v, "average");
        if (!Number.isFinite(act) || !Number.isFinite(avg)) throw new Error("Enter the actual value and the average or trend value, or choose 'Table of seasonal data'.");
        if (avg === 0) throw new Error("The average or trend value cannot be zero.");
        push("Write the values", `Actual value = ${F(act)}<br>Average / trend value = ${F(avg)}`);
        push("Divide the actual by the average", `${frac("Actual", "Average")} = ${frac(F(act), F(avg))} = ${F(act / avg)}`);
        push("Multiply by 100", `Seasonal index = ${F(act / avg)} &times; 100 = <strong>${F(act / avg * 100)}</strong>`);
        return resultTemplate(`Seasonal index = ${frac("Actual", "Average / Trend")} &times; 100`, joinSteps(st), `<strong>Seasonal index = ${F(act / avg * 100)}</strong>`, act / avg * 100 > 100 ? "The season is above average." : act / avg * 100 < 100 ? "The season is below average." : "The season is exactly average.");
    }
    const rows = clean(v.table).split(/[;\n]+/).map(r => r.trim()).filter(Boolean).map(r => parseNums(r, "The table values"));
    if (rows.length < 2) throw new Error("Enter at least 2 years (rows) separated by semicolons, for example: 10,12,15,11; 12,14,18,13; 13,15,19,14");
    const k = rows[0].length;
    if (k < 2 || rows.some(r => r.length !== k)) throw new Error("Every row must have the same number of seasons (at least 2).");
    const add = v.model === "additive", names = Array.from({ length: k }, (_, i) => k === 4 ? "Q" + (i + 1) : k === 12 ? "M" + (i + 1) : "S" + (i + 1));
    push("Write the data (each row is one year, each column is one season)", tbl(["Year", ...names], rows.map((r, i) => ["Year " + (i + 1), ...r.map(F)]), null));
    const colTot = names.map((_, j) => sumArr(rows.map(r => r[j]))), colAvg = colTot.map(t => t / rows.length);
    push("Find the total and the average of each season", tbl(["", ...names], [["Total", ...colTot.map(F)], ["Average (total &divide; " + rows.length + ")", ...colAvg.map(F)]], null));
    const grand = sumArr(colAvg) / k;
    push("Find the overall average of the seasonal averages", `Overall average = ${frac(colAvg.map(F).join(" + "), k)} = ${frac(F(sumArr(colAvg)), k)} = <strong>${F(grand)}</strong>`);
    if (grand === 0) throw new Error("The overall average is zero, so seasonal indices cannot be found.");
    let res;
    if (add) {
        res = colAvg.map(a => a - grand);
        push("Seasonal variation = season average &minus; overall average", tbl(["Season", "Calculation", "Variation"], names.map((n_, j) => [n_, `${F(colAvg[j])} &minus; ${P(grand)}`, F(res[j])]), ["Sum", "", F(sumArr(res))]) + "The variations should add up to about zero.");
    } else {
        res = colAvg.map(a => a / grand * 100);
        push("Seasonal index = (season average &divide; overall average) &times; 100", tbl(["Season", "Calculation", "Index"], names.map((n_, j) => [n_, `(${F(colAvg[j])} &divide; ${F(grand)}) &times; 100`, F(res[j])]), ["Sum", "", F(sumArr(res))]) + `The indices should add up to ${100 * k}.`);
    }
    return resultTemplate(add ? "Seasonal variation = Season average &minus; Overall average" : `Seasonal index = ${frac("Season average", "Overall average")} &times; 100`, joinSteps(st),
        `<strong>${add ? "Seasonal variations" : "Seasonal indices"}: ${names.map((n_, j) => `${n_} = ${F(res[j])}`).join(", ")}</strong>`, add ? "Positive values are above the overall average, negative values are below it." : "An index above 100 means the season is above average; below 100 means it is below average.");
}

/* =========================================================
   REGISTER (override the old statistics entries)
========================================================= */
if (typeof calculators === "undefined" || !calculators.statistics) return;
const S = calculators.statistics;
const upd = (key, title, o) => { S[key] = Object.assign({}, S[key] || {}, { title: (S[key] && S[key].title) || title }, o); };
const basisOpt = { basis: BASIS_OPTS };
const basisField = ["basis", "Variance basis", "select"];

upd("mean", "Arithmetic Mean", { fields: DATA_FIELDS, options: { dataType: TYPE_OPTS }, formula: "x̄ = Σx / n  or  x̄ = Σfx / Σf", calculate: wrap(calcMean) });
upd("weighted-mean", "Weighted Mean", { calculate: wrap(calcWeighted) });
upd("median", "Median", { fields: DATA_FIELDS, options: { dataType: TYPE_OPTS }, formula: "Median = middle value  or  L + [(N/2 − cf)/f] × c", calculate: wrap(calcMedian) });
upd("mode", "Mode", { fields: DATA_FIELDS, options: { dataType: TYPE_OPTS }, formula: "Mode = most frequent value  or  L + [Δ1/(Δ1 + Δ2)] × c", calculate: wrap(calcMode) });
upd("range", "Range", { fields: DATA_FIELDS, options: { dataType: TYPE_OPTS }, formula: "Range = Largest − Smallest", calculate: wrap(calcRange) });
upd("variance", "Variance", { fields: [...DATA_FIELDS, basisField], options: { dataType: TYPE_OPTS, ...basisOpt }, formula: "σ² = Σ(x − x̄)² / n  or  Σf(x − x̄)² / Σf", calculate: wrap(calcVariance) });
upd("standard-deviation", "Standard Deviation", { fields: [...DATA_FIELDS, basisField], options: { dataType: TYPE_OPTS, ...basisOpt }, formula: "σ = √[Σ(x − x̄)² / n]", calculate: wrap(calcSD) });
upd("coefficient-variation", "Coefficient of Variation", { fields: [["dataType", "Input Method", "select"], ["mean", "Mean (when entering values directly)", "number"], ["sd", "Standard Deviation (when entering values directly)", "number"], ...DATA_FIELDS.slice(1), basisField], options: { dataType: TYPE_OPTS_MANUAL, ...basisOpt }, formula: "CV = (σ / x̄) × 100%", calculate: wrap(calcCV) });
upd("skewness", "Skewness", { fields: [["dataType", "Input Method", "select"], ["mean", "Mean (when entering values directly)", "number"], ["mode", "Mode (when entering values directly)", "number"], ["sd", "Standard Deviation (when entering values directly)", "number"], ...DATA_FIELDS.slice(1), basisField], options: { dataType: TYPE_OPTS_MANUAL, ...basisOpt }, formula: "Sk = (Mean − Mode) / σ  and  3(Mean − Median) / σ", calculate: wrap(calcSkew) });
upd("kurtosis", "Kurtosis", { fields: [["dataType", "Input Method", "select"], ["m4", "Fourth Central Moment (when entering values directly)", "number"], ["variance", "Variance (when entering values directly)", "number"], ...DATA_FIELDS.slice(1)], options: { dataType: TYPE_OPTS_MANUAL }, formula: "β2 = μ4 / σ⁴", calculate: wrap(calcKurt) });
upd("correlation", "Pearson Correlation", { calculate: wrap(calcCorrelation) });
upd("spearman", "Spearman Rank Correlation", { fields: [["inputMode", "Input Method", "select"], ["d2", "Σd² (when entering values directly)", "number"], ["n", "Number of Observations n (when entering values directly)", "number"], ["x", "X Values (when ranking data, comma separated)", "text"], ["y", "Y Values (when ranking data, comma separated)", "text"]], options: { inputMode: [["manual", "Enter Σd² and n directly"], ["data", "Rank the X and Y data"]] }, formula: "ρ = 1 − [6Σd² / n(n² − 1)]", calculate: wrap(calcSpearman) });
upd("covariance", "Covariance", { fields: [["x", "X Values (comma separated)", "text"], ["y", "Y Values (comma separated)", "text"], basisField], options: basisOpt, calculate: wrap(calcCovariance) });
upd("moving-average", "Moving Average", { calculate: wrap(calcMovingAverage) });
upd("weighted-moving-average", "Weighted Moving Average", { fields: [["values", "Values (comma separated)", "text"], ["weights", "Weights (comma separated, oldest first)", "text"]], calculate: wrap(calcWMA) });
upd("least-squares-trend", "Least Squares Trend", { fields: [["x", "X Values / Time Periods (comma separated, leave blank for 1, 2, 3 ...)", "text"], ["y", "Y Values (comma separated)", "text"], ["xMode", "Method", "select"]], options: { xMode: [["actual", "Use X as entered"], ["coded", "Code X so that Σx = 0 (time-series method)"]] }, calculate: wrap(calcTrend) });
upd("trend-forecast", "Trend Forecast", { fields: [["a", "Intercept (a)", "number"], ["b", "Trend Coefficient (b)", "number"], ["x", "Future X Value (several values can be separated by commas)", "text"]], calculate: wrap(calcForecast) });
upd("seasonal-index", "Seasonal Index", { fields: [["method", "Method", "select"], ["actual", "Actual Value (single season method)", "number"], ["average", "Average / Trend Value (single season method)", "number"], ["table", "Table of seasonal data: one row per year, rows separated by ; (e.g. 10,12,15,11; 12,14,18,13)", "text"], ["model", "Model (table method)", "select"]], options: { method: [["simple", "Single season: Actual ÷ Average × 100"], ["table", "Table of seasonal data (several years)"]], model: [["multiplicative", "Multiplicative (seasonal index)"], ["additive", "Additive (seasonal variation)"]] }, calculate: wrap(calcSeasonal) });

/* two new statistics that accept tables */
const QOPTS = [["q1", "Lower quartile Q1"], ["q2", "Median Q2"], ["q3", "Upper quartile Q3"], ["iqr", "Interquartile range and quartile deviation"], ["decile", "Decile (D1 to D9)"], ["percentile", "Percentile (P1 to P99)"]];
upd("quartiles", "Quartiles, Deciles and Percentiles", { fields: [["measure", "What do you want to find?", "select"], ...DATA_FIELDS, ["k", "k (for a decile 1 to 9, or a percentile 1 to 99)", "number"]], options: { measure: QOPTS, dataType: TYPE_OPTS }, formula: "Position = k(n + 1)/m  or  L + [(kN/m − cf)/f] × c", calculate: wrap(calcQuantiles) });
upd("mean-deviation", "Mean Deviation", { fields: DATA_FIELDS, options: { dataType: TYPE_OPTS }, formula: "MD = Σ|x − x̄| / n  or  Σf|x − x̄| / Σf", calculate: wrap(calcMeanDev) });
if (typeof calculatorNames !== "undefined" && calculatorNames.statistics) {
    calculatorNames.statistics["quartiles"] = "Quartiles, Deciles and Percentiles";
    calculatorNames.statistics["mean-deviation"] = "Mean Deviation";
}
if (typeof categorySelect !== "undefined" && categorySelect && typeof populateCalculators === "function") populateCalculators();
})();

