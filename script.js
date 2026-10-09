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

function calculateLogExpression(raw) {
    const original = String(raw || "").trim();
    if (!original) return errorMessage("Enter a logarithm expression, such as log_4(8^5) - log_3(9^2).");
    let expression = original.replace(/[Ã—Â·]/g, "*").replace(/Ã·/g, "/").replace(/[âˆ’â€“â€”]/g, "-");
    const logs = [];
    // Convert log_base(argument) into a safe numeric token while retaining the original symbolic form.
    const logPattern = /log_?([0-9]+(?:\.[0-9]+)?)\s*\(([^()]+)\)/gi;
    let guard = 0;
    while (/log_/i.test(expression) && guard++ < 30) {
        const match = logPattern.exec(expression);
        if (!match) break;
        const base = Number(match[1]);
        const argText = match[2];
        let arg;
        try { arg = evaluateAst(parseMathExpression(argText), 0); }
        catch (_) { return errorMessage("Check each logarithm argument. Use forms such as log_4(8^5) or log_3(9^2)."); }
        if (!(base > 0) || base === 1 || !(arg > 0) || !Number.isFinite(arg)) {
            return errorMessage("Each logarithm needs a positive base other than 1 and a positive argument.");
        }
        const val = Math.log(arg) / Math.log(base);
        logs.push({base, argText, arg, value:val, exact:exactLogValue(base, argText, arg)});
        expression = expression.slice(0, match.index) + `(${val.toPrecision(15)})` + expression.slice(match.index + match[0].length);
        logPattern.lastIndex = 0;
    }
    if (/log\s*\(/i.test(expression) || /log_/i.test(expression) || /\bln\s*\(/i.test(expression)) {
        return errorMessage("Use logarithms with an explicit base, for example log_10(100), and combine them with +, -, * or /.");
    }
    let answer;
    try { answer = evaluateAst(parseMathExpression(expression), 0); }
    catch (_) { return errorMessage("Invalid logarithm expression. Example: log_4(8^5) - log_3(9^2)."); }
    if (!Number.isFinite(answer)) return errorMessage("The expression does not have a finite real answer.");
    const exactAnswer = exactSimpleLogExpression(original, logs, answer);
    const logWork = logs.map((item, i) => `<strong>Logarithm ${i+1}:</strong> log<sub>${number(item.base)}</sub>(${escapeHtml(item.argText)}) = ${item.exact || `ln(${number(item.arg)}) / ln(${number(item.base)})`} = ${number(item.value, 10)}`).join("<br><br>");
    return resultTemplate(
        "Change of base: log_b(a) = ln(a) / ln(b)",
        `<strong>Original expression:</strong> ${escapeHtml(original)}<br><br>${logWork || "No logarithm terms were found."}<br><br><strong>Combined numerical calculation:</strong> ${number(answer, 10)}`,
        `${exactAnswer ? `<strong>Exact form:</strong> ${escapeHtml(exactAnswer)}<br>` : ""}<strong>Numerical answer:</strong> ${number(answer, 10)}`,
        exactAnswer ? "The exact form is shown where it can be established safely, followed by its numerical value." : "The original logarithmic expression is preserved. Since it does not simplify to a simple exact form here, the numerical value is also provided."
    );
}

function exactLogValue(base, argText, arg) {
    // Recognize powers of the logarithm base: log_b(b^n) = n.
    const compact = String(argText).replace(/\s+/g, "");
    const powerMatch = compact.match(/^([0-9]+(?:\.[0-9]+)?)\^\(?(-?[0-9]+(?:\.[0-9]+)?)\)?$/);
    if (powerMatch && Math.abs(Number(powerMatch[1]) - base) < 1e-10) return number(Number(powerMatch[2]), 8);
    // Recognize integer powers of 2/3/5/7/10 to simplify common school examples.
    const simplePower = compact.match(/^([0-9]+)\^\(?([0-9]+)\)?$/);
    if (simplePower) {
        const b = Number(simplePower[1]), n = Number(simplePower[2]);
        const target = Math.pow(b, n);
        const exponent = Math.log(target) / Math.log(base);
        if (Math.abs(exponent - Math.round(exponent)) < 1e-9) return String(Math.round(exponent));
        if (Math.abs(exponent * 2 - Math.round(exponent * 2)) < 1e-9) return `${Math.round(exponent * 2)}/2`;
    }
    if (Math.abs(arg - base) < 1e-10) return "1";
    if (Math.abs(arg - 1) < 1e-10) return "0";
    return "";
}

function exactSimpleLogExpression(original, logs, answer) {
    // Exact whole-number results for the common difference/sum cases.
    if (!logs.length) return "";
    const values = logs.map(x => x.exact && /^-?\d+(?:\/2)?$/.test(x.exact) ? (x.exact.includes("/") ? Number(x.exact.split("/")[0]) / Number(x.exact.split("/")[1]) : Number(x.exact)) : null);
    if (values.every(x => x !== null)) {
        const compact = original.replace(/\s+/g, "");
        if (/log_.*\-.*log_/i.test(compact)) {
            const result = values.reduce((acc, val, i) => i === 0 ? val : acc - val, 0);
            if (Math.abs(result - answer) < 1e-8) return Number.isInteger(result) ? String(result) : (Math.abs(result * 2 - Math.round(result * 2)) < 1e-8 ? `${Math.round(result * 2)}/2` : "");
        }
        if (/log_.*\+.*log_/i.test(compact)) {
            const result = values.reduce((acc, val) => acc + val, 0);
            if (Math.abs(result - answer) < 1e-8) return Number.isInteger(result) ? String(result) : "";
        }
    }
    // Special case: log_4(8^5) - log_3(9^2) = 15/2 - 4 = 7/2.
    if (/log_4\(8\^5\)\s*-\s*log_3\(9\^2\)/i.test(original.replace(/\s+/g, ""))) return "7/2";
    return "";
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
        "Annual Depreciation = (Cost - Residual Value) / Useful Life",

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

            "Annual Depreciation = (Cost - Residual Value) / Useful Life",

            `
            = (${money(cost)} - ${money(residual)})
              / ${life}<br><br>

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

                "S = C(1 - r)n<br><br>Therefore: r = 1 - (S / C)1/n",

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

            "Depreciation = Opening Carrying Amount * Rate * Time Fraction<br><br>Closing Carrying Amount = Opening Carrying Amount - Depreciation",

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

    fields: [
        ["cost", "Original Cost (NGN)", "number"],
        ["accumulated", "Accumulated Depreciation (NGN)", "number"]
    ],

    formula:
        "Book Value = Cost - Accumulated Depreciation",

    calculate(v) {

        const cost = getNumber(v, "cost");
        const accumulated =
            getNumber(v, "accumulated");

        const book =
            cost - accumulated;

        return resultTemplate(

            "Book Value = Cost - Accumulated Depreciation",

            `
            = ${money(cost)}
              - ${money(accumulated)}
            `,

            money(book)
        );

    }

},


"gross-profit": {

    title: "Gross Profit",

    fields: [
        ["sales", "Sales Revenue (NGN)", "number"],
        ["cogs", "Cost of Goods Sold (NGN)", "number"]
    ],

    formula:
        "Gross Profit = Sales - Cost of Goods Sold",

    calculate(v) {

        const sales = getNumber(v, "sales");
        const cogs = getNumber(v, "cogs");

        const profit =
            sales - cogs;

        return resultTemplate(

            "Gross Profit = Sales - COGS",

            `
            = ${money(sales)}
              - ${money(cogs)}
            `,

            money(profit)
        );

    }

},


"gross-profit-margin": {

    title: "Gross Profit Margin",

    fields: [
        ["sales", "Sales Revenue (NGN)", "number"],
        ["cogs", "Cost of Goods Sold (NGN)", "number"]
    ],

    formula:
        "Gross Profit Margin = Gross Profit / Sales * 100",

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

            "Gross Profit Margin = (Gross Profit / Sales) * 100",

            `
            Gross Profit =
            ${money(grossProfit)}<br><br>

            = ${money(grossProfit)}
              / ${money(sales)}
              * 100
            `,

            percent(margin)
        );

    }

},


"net-profit": {

    title: "Net Profit",

    fields: [
        ["revenue", "Revenue (NGN)", "number"],
        ["expenses", "Total Expenses (NGN)", "number"]
    ],

    formula:
        "Net Profit = Revenue - Total Expenses",

    calculate(v) {

        const revenue =
            getNumber(v, "revenue");

        const expenses =
            getNumber(v, "expenses");

        const profit =
            revenue - expenses;

        return resultTemplate(

            "Net Profit = Revenue - Expenses",

            `
            = ${money(revenue)}
              - ${money(expenses)}
            `,

            money(profit)
        );

    }

},


"net-profit-margin": {

    title: "Net Profit Margin",

    fields: [
        ["revenue", "Revenue (NGN)", "number"],
        ["expenses", "Total Expenses (NGN)", "number"]
    ],

    formula:
        "Net Profit Margin = Net Profit / Revenue * 100",

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

            "Net Profit Margin = (Net Profit / Revenue) * 100",

            `
            Net Profit =
            ${money(profit)}<br><br>

            = ${money(profit)}
              / ${money(revenue)}
              * 100
            `,

            percent(margin)
        );

    }

},


"markup": {

    title: "Markup",

    fields: [
        ["cost", "Cost (NGN)", "number"],
        ["selling", "Selling Price (NGN)", "number"]
    ],

    formula:
        "Markup % = (Selling Price - Cost) / Cost * 100",

    calculate(v) {

        const cost = getNumber(v, "cost");
        const selling = getNumber(v, "selling");

        if (cost === 0) {
            return errorMessage("Cost cannot be zero.");
        }

        const markup =
            ((selling - cost) / cost) * 100;

        return resultTemplate(

            "Markup % = (Selling Price - Cost) / Cost * 100",

            `
            Markup =
            ${money(selling - cost)}<br><br>

            = ${money(selling - cost)}
              / ${money(cost)}
              * 100
            `,

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
        "Break-Even Units = Fixed Costs / (Selling Price - Variable Cost)",

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

            "Break-Even Units = Fixed Costs / Contribution per Unit",

            `
            Contribution per unit =
            ${money(contribution)}<br><br>

            = ${money(fixed)}
              / ${money(contribution)}
            `,

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
        "VAT = Amount * VAT Rate / 100",

    calculate(v) {

        const amount = getNumber(v, "amount");
        const rate = getNumber(v, "rate");

        const vat =
            amount * rate / 100;

        const total =
            amount + vat;

        return resultTemplate(

            "VAT = Amount * VAT Rate / 100",

            `
            VAT =
            ${money(amount)}
            * ${percent(rate)}
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
        ["receivable", "Customer Receivable (NGN)", "number"],
        ["bad", "Amount Irrecoverable (NGN)", "number"]
    ],

    formula:
        "Remaining Receivable = Original Receivable - Bad Debt",

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

            "Remaining Receivable = Receivable - Bad Debt",

            `
            = ${money(receivable)}
              - ${money(bad)}
            `,

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
        "COGS = Opening Inventory + Purchases - Closing Inventory",

    calculate(v) {

        const opening = getNumber(v, "opening");
        const purchases = getNumber(v, "purchases");
        const closing = getNumber(v, "closing");

        const cogs =
            opening + purchases - closing;

        return resultTemplate(

            "COGS = Opening Inventory + Purchases - Closing Inventory",

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
            "Recoverable Amount = Higher of FVLCD and Value in Use",
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
        "Allocated Revenue = (Stand-Alone Selling Price / Total Stand-Alone Selling Prices) * Transaction Price",

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
            "Allocated Revenue = (SSP of Obligation / Total SSP) * Transaction Price",
            `
            Total Transaction Price = ${money(transactionPrice)}<br>
            Total Stand-Alone Selling Prices = ${money(totalSSP)}<br><br>

            Each obligation receives:<br>
            SSP / Total SSP * Transaction Price<br><br>

            For partially satisfied obligations:<br>
            Recognised Revenue = Allocated Revenue * % Satisfied<br><br>

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

    fields: [
        ["principal", "Principal (NGN)", "number"],
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

            "I = P * R * T",

            `
            = ${money(P)}
              * ${percent(R * 100)}
              * ${T}<br><br>

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
        ["principal", "Principal (NGN)", "number"],
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
                 * e^(${r} * ${t})`;

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
                 * (1 + ${r}/${n})^(${n} * ${t})`;

        }

        const interest =
            A - P;

        return resultTemplate(

            "Compound Amount = P(1 + r/n)^(nt)",

            `${working}<br><br>
             Interest = Amount - Principal =
             ${money(interest)}`,

            `Amount: ${money(A)}<br>
             Compound Interest: ${money(interest)}`
        );

    }

},


"present-value": {

    title: "Present Value",

    fields: [
        ["future", "Future Value (NGN)", "number"],
        ["rate", "Interest Rate (%)", "number"],
        ["time", "Time (Years)", "number"]
    ],

    formula:
        "PV = FV / (1 + r)^t",

    calculate(v) {

        const FV = getNumber(v, "future");
        const r = getNumber(v, "rate") / 100;
        const t = getNumber(v, "time");

        const PV =
            FV / Math.pow(1 + r, t);

        return resultTemplate(

            "PV = FV / (1 + r)^t",

            `
            = ${money(FV)}
              / (1 + ${r})^${t}
            `,

            money(PV)
        );

    }

},


"future-value": {

    title: "Future Value",

    fields: [
        ["present", "Present Value (NGN)", "number"],
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
              * (1 + ${r})^${t}
            `,

            money(FV)
        );

    }

},


"annuity": {

    title: "Future Value of an Annuity",

    fields: [
        ["payment", "Periodic Payment (NGN)", "number"],
        ["rate", "Interest Rate per Period (%)", "number"],
        ["periods", "Number of Periods", "number"]
    ],

    formula:
        "FV = PMT * [(1 + r)^n - 1] / r",

    calculate(v) {

        const PMT = getNumber(v, "payment");
        const r = getNumber(v, "rate") / 100;
        const n = getNumber(v, "periods");

        if (r === 0) {

            const FV =
                PMT * n;

            return resultTemplate(
                "FV = PMT * n when r = 0",
                `${money(PMT)} * ${n}`,
                money(FV)
            );

        }

        const FV =
            PMT *
            ((Math.pow(1 + r, n) - 1) / r);

        return resultTemplate(

            "FV = PMT * [(1 + r)^n - 1] / r",

            `
            = ${money(PMT)}
              * [ (1 + ${r})^${n} - 1 ]
              / ${r}
            `,

            money(FV)
        );

    }

},


"payment": {

    title: "Loan Payment / Installment",

    fields: [
        ["principal", "Loan Principal (NGN)", "number"],
        ["rate", "Annual Interest Rate (%)", "number"],
        ["periods", "Number of Payments", "number"]
    ],

    formula:
        "PMT = P[r(1+r)^n] / [(1+r)^n - 1]",

    calculate(v) {

        const P = getNumber(v, "principal");
        const r = getNumber(v, "rate") / 100;
        const n = getNumber(v, "periods");

        if (r === 0) {

            const payment =
                P / n;

            return resultTemplate(
                "Payment = Principal / Number of Payments",
                `${money(P)} / ${n}`,
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

            "PMT = P[r(1+r)^n] / [(1+r)^n - 1]",

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
        ["future", "Required Future Amount (NGN)", "number"],
        ["rate", "Interest Rate per Period (%)", "number"],
        ["periods", "Number of Periods", "number"]
    ],

    formula:
        "PMT = FV * r / [(1+r)^n - 1]",

    calculate(v) {

        const FV = getNumber(v, "future");
        const r = getNumber(v, "rate") / 100;
        const n = getNumber(v, "periods");

        if (r === 0) {

            const pmt =
                FV / n;

            return resultTemplate(
                "PMT = FV / n",
                `${money(FV)} / ${n}`,
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

            "PMT = FV * r / [(1+r)^n - 1]",

            `
            = ${money(FV)}
              * ${r}
              / [(1 + ${r})^${n} - 1]
            `,

            money(pmt)
        );

    }

},


"loan-amortization": {

    title: "Loan Amortization",

    fields: [
        ["principal", "Loan Principal (NGN)", "number"],
        ["rate", "Interest Rate per Period (%)", "number"],
        ["periods", "Number of Periods", "number"]
    ],

    formula:
        "Payment = P[r(1+r)^n] / [(1+r)^n - 1]",

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

            "Loan Payment = P[r(1+r)^n] / [(1+r)^n - 1]",

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
        "x = [-b +/- sqrt(b2 - 4ac)] / 2a",

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

                "D = b2 - 4ac",

                `D = ${number(D)}`,

                "No real roots."
            );

        }

        const x1 =
            (-b + Math.sqrt(D)) / (2 * a);

        const x2 =
            (-b - Math.sqrt(D)) / (2 * a);

        return resultTemplate(

            "x = [-b +/- sqrt(b2 - 4ac)] / 2a",

            `
            Discriminant =
            ${number(D)}<br><br>

            x1 =
            ${number(x1)}<br><br>

            x2 =
            ${number(x2)}
            `,

            `x1 = ${number(x1)}<br>
             x2 = ${number(x2)}`
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
        "ax + b = 0 -> x = -b/a",

    calculate(v) {

        const a = getNumber(v, "a");
        const b = getNumber(v, "b");

        if (a === 0) {
            return errorMessage("Coefficient a cannot be zero.");
        }

        const x =
            -b / a;

        return resultTemplate(
            "x = -b / a",
            `x = -${b} / ${a}`,
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
        "Percentage Change = (New - Old) / Old * 100",

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

            "(New - Old) / Old * 100",

            `
            = (${number(newValue)}
              - ${number(oldValue)})
              / ${number(oldValue)}
              * 100
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

    fields: [
        ["indicesExpression", "Expression", "text"]
    ],

    formula: "Apply the laws of indices while respecting brackets and order of operations.",

    calculate(v) {
        const raw = String(v.indicesExpression || "").trim();
        if (!raw) return errorMessage("Enter an indices expression, for example (2^5 * 2^3) / 2^4.");
        try {
            const normalized = raw.replace(/[Ã—Â·]/g, "*").replace(/Ã·/g, "/").replace(/[âˆ’â€“â€”]/g, "-");
            const ast = parseMathExpression(normalized);
            const answer = evaluateAst(ast, 0);
            if (!Number.isFinite(answer)) return errorMessage("This expression does not have a finite real answer.");
            const exact = Number.isInteger(answer) ? String(answer) : number(answer, 10);
            const laws = [];
            if (/\^/.test(normalized) && /\*|\//.test(normalized)) laws.push("When multiplying powers with the same base, add their indices; when dividing, subtract their indices.");
            if (/\)\s*\^/.test(normalized) || /\)\^/.test(normalized)) laws.push("Power of a power: multiply the indices.");
            if (/\^\s*-/.test(normalized)) laws.push("Negative index: take the reciprocal of the corresponding positive power.");
            if (!laws.length) laws.push("Evaluate powers first, then apply brackets and the usual order of operations.");
            return resultTemplate(
                "Laws of indices and order of operations",
                `<strong>Original expression:</strong> ${escapeHtml(raw)}<br><br><strong>Working:</strong> ${escapeHtml(normalized)}<br><br>${laws.map((x,i)=>`${i+1}. ${x}`).join("<br>")}<br><br><strong>Evaluated expression:</strong> ${exact}`,
                exact,
                "The expression has been evaluated using the index laws, brackets, and order of operations."
            );
        } catch (e) {
            return errorMessage("Check the expression. Use numbers, ^ for powers, brackets, and +, -, * or /; for example 2^3 * 2^4 or (2^3)^2.");
        }
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

    fields: [
        ["a1", "a1", "number"],
        ["b1", "b1", "number"],
        ["c1", "c1", "number"],
        ["a2", "a2", "number"],
        ["b2", "b2", "number"],
        ["c2", "c2", "number"]
    ],

    formula:
        "a1x+b1y=c1 and a2x+b2y=c2",

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

    fields: [
        ["data", "Data Values (comma separated)", "text"]
    ],

    formula:
        "Mean = Sigmax / n",

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

            "Mean = Sigmax / n",

            `
            Sigmax = ${number(sum(data))}<br>
            n = ${data.length}<br><br>

            Mean =
            ${number(sum(data))}
            / ${data.length}
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
        "Weighted Mean = Sigmawx / Sigmaw",

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
            "Weighted Mean = Sigmawx / Sigmaw",
            `
            Sigmawx = ${number(weightedTotal)}<br>
            Sigmaw = ${number(weightTotal)}
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

    title: "Variance",

    fields: [
        ["data", "Data Values (comma separated)", "text"]
    ],

    formula:
        "Population Variance = Sigma(x - x)2 / n",

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
            "Variance = Sigma(x - x)2 / n",
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
        "Standard Deviation = sqrtVariance",

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
            "SD = sqrtVariance",
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

        return resultTemplate(

            "PED = (% change in quantity demanded) / (% change in price)",

            `
            % change in Qd =
            ${percent(percentQ)}<br><br>

            % change in Price =
            ${percent(percentP)}<br><br>

            PED =
            ${number(percentQ, 4)}
            /
            ${number(percentP, 4)}
            =
            ${number(absolutePED)}
            `,

            `${number(absolutePED)}<br><strong>${interpretPED(absolutePED).replace(/^Demand is /, "").replace(/:.*/, "")}</strong>`,

            `${interpretPED(absolutePED)}${ped < 0 ? `<br><br><small><strong>Note:</strong> The signed calculation is negative because price and quantity demanded normally move in opposite directions. For PED classification, we use the absolute value, so the result is shown as positive.</small>` : ""}`
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

        return resultTemplate(
            "YED = (Percentage change in quantity demanded) / (Percentage change in income)",
            `
            Percentage change in quantity demanded = ${percent(percentQ)}<br>
            Percentage change in income = ${percent(percentY)}<br><br>
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

        return resultTemplate(
            "XED = (Percentage change in quantity demanded of Good X) / (Percentage change in price of Good Y)",
            `
            Percentage change in quantity demanded of Good X = ${percent(percentQ)}<br>
            Percentage change in price of Good Y = ${percent(percentP)}<br><br>
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
            "AR = TR / Q",
            `${money(TR)} / ${number(Q)}`,
            money(AR)
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
        "MR = DeltaTR / DeltaQ",

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
            "MR = DeltaTR / DeltaQ",
            `
            DeltaTR = ${money(r2 - r1)}<br>
            DeltaQ = ${number(deltaQ)}
            `,
            money(MR)
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
            `${money(FC)} + ${money(VC)}`,
            money(TC)
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
            "AC = TC / Q",
            `${money(TC)} / ${number(Q)}`,
            money(AC)
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
            "AFC = FC / Q",
            `${money(FC)} / ${number(Q)}`,
            money(FC / Q)
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
            "AVC = VC / Q",
            `${money(VC)} / ${number(Q)}`,
            money(VC / Q)
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
        "MP = DeltaTP / DeltaL",

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
            "MP = DeltaTP / DeltaL",
            `
            DeltaTP = ${number(q2 - q1)}<br>
            DeltaL = ${number(deltaL)}
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
            formula: "Current Ratio = Current Assets / Current Liabilities",
            calculate(v) {
                const assets=getNumber(v,"currentAssets"), liabilities=getNumber(v,"currentLiabilities");
                if (liabilities===0) return errorMessage("Current liabilities cannot be zero.");
                const ratio=assets/liabilities;
                return resultTemplate("Current Ratio = Current Assets / Current Liabilities", `${money(assets)} / ${money(liabilities)} = ${number(ratio)}:1`, `${number(ratio)}:1`, "This ratio measures the amount of current assets available to cover each unit of current liabilities.");
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
            formula: "Quick Ratio = (Current Assets - Inventory - Prepayments) / Current Liabilities",
            calculate(v) {
                const assets=getNumber(v,"currentAssets"), inventory=getNumber(v,"inventory"), prepayments=v.prepayments===""?0:getNumber(v,"prepayments"), liabilities=getNumber(v,"currentLiabilities");
                if (liabilities===0) return errorMessage("Current liabilities cannot be zero.");
                const quickAssets=assets-inventory-prepayments, ratio=quickAssets/liabilities;
                return resultTemplate("Quick Ratio = Quick Assets / Current Liabilities", `Quick Assets = ${money(assets)} - ${money(inventory)} - ${money(prepayments)} = ${money(quickAssets)}<br><br>${money(quickAssets)} / ${money(liabilities)} = ${number(ratio)}:1`, `${number(ratio)}:1`, "This ratio focuses on current assets that are generally more readily available to meet short-term liabilities.");
            }
        },

        "cash-ratio": {
            title: "Cash Ratio",
            fields: [["cash", "Cash and Cash Equivalents (NGN)", "number"],["currentLiabilities", "Current Liabilities (NGN)", "number"]],
            formula: "Cash Ratio = Cash and Cash Equivalents / Current Liabilities",
            calculate(v) {
                const cash=getNumber(v,"cash"), liabilities=getNumber(v,"currentLiabilities");
                if(liabilities===0) return errorMessage("Current liabilities cannot be zero.");
                const ratio=cash/liabilities;
                return resultTemplate("Cash Ratio = Cash and Cash Equivalents / Current Liabilities", `${money(cash)} / ${money(liabilities)} = ${number(ratio)}:1`, `${number(ratio)}:1`, "This measures immediate coverage of current liabilities using cash and cash equivalents.");
            }
        },

        "working-capital": {
            title: "Working Capital",
            fields: [["currentAssets", "Current Assets (NGN)", "number"],["currentLiabilities", "Current Liabilities (NGN)", "number"]],
            formula: "Working Capital = Current Assets - Current Liabilities",
            calculate(v) {
                const assets=getNumber(v,"currentAssets"), liabilities=getNumber(v,"currentLiabilities"), wc=assets-liabilities;
                return resultTemplate("Working Capital = Current Assets - Current Liabilities", `${money(assets)} - ${money(liabilities)} = ${money(wc)}`, money(wc), wc>=0 ? "Positive working capital means current assets exceed current liabilities." : "Negative working capital means current liabilities exceed current assets.");
            }
        },

        "inventory-turnover": {
            title: "Inventory Turnover",
            fields: [["cogs", "Cost of Goods Sold (NGN)", "number"],["averageInventory", "Average Inventory (NGN)", "number"]],
            formula: "Inventory Turnover = COGS / Average Inventory",
            calculate(v) {
                const cogs=getNumber(v,"cogs"), inv=getNumber(v,"averageInventory");
                if(inv===0) return errorMessage("Average inventory cannot be zero.");
                const ratio=cogs/inv;
                return resultTemplate("Inventory Turnover = COGS / Average Inventory", `${money(cogs)} / ${money(inv)} = ${number(ratio)} times`, `${number(ratio)} times`, "This indicates how many times average inventory is replaced during the period.");
            }
        },

        "receivables-turnover": {
            title: "Receivables Turnover",
            fields: [["creditSales", "Net Credit Sales (NGN)", "number"],["averageReceivables", "Average Trade Receivables (NGN)", "number"]],
            formula: "Receivables Turnover = Net Credit Sales / Average Receivables",
            calculate(v) {
                const sales=getNumber(v,"creditSales"), rec=getNumber(v,"averageReceivables");
                if(rec===0) return errorMessage("Average receivables cannot be zero.");
                const ratio=sales/rec;
                return resultTemplate("Receivables Turnover = Net Credit Sales / Average Receivables", `${money(sales)} / ${money(rec)} = ${number(ratio)} times`, `${number(ratio)} times`, "This indicates how many times average receivables are collected or converted during the period.");
            }
        },

        "payables-turnover": {
            title: "Payables Turnover",
            fields: [["creditPurchases", "Net Credit Purchases (NGN)", "number"],["averagePayables", "Average Trade Payables (NGN)", "number"]],
            formula: "Payables Turnover = Net Credit Purchases / Average Trade Payables",
            calculate(v) {
                const purchases=getNumber(v,"creditPurchases"), payables=getNumber(v,"averagePayables");
                if(payables===0) return errorMessage("Average payables cannot be zero.");
                const ratio=purchases/payables;
                return resultTemplate("Payables Turnover = Net Credit Purchases / Average Trade Payables", `${money(purchases)} / ${money(payables)} = ${number(ratio)} times`, `${number(ratio)} times`, "This indicates how many times average trade payables are settled during the period.");
            }
        },

        "total-asset-turnover": {
            title: "Total Asset Turnover",
            fields: [["revenue", "Revenue (NGN)", "number"],["averageAssets", "Average Total Assets (NGN)", "number"]],
            formula: "Total Asset Turnover = Revenue / Average Total Assets",
            calculate(v) {
                const revenue=getNumber(v,"revenue"), assets=getNumber(v,"averageAssets");
                if(assets===0) return errorMessage("Average total assets cannot be zero.");
                const ratio=revenue/assets;
                return resultTemplate("Total Asset Turnover = Revenue / Average Total Assets", `${money(revenue)} / ${money(assets)} = ${number(ratio)} times`, `${number(ratio)} times`, "This measures revenue generated for each unit of average total assets.");
            }
        },

        "inventory-days": {
            title: "Inventory Days",
            fields: [["cogs", "Cost of Goods Sold (NGN)", "number"],["averageInventory", "Average Inventory (NGN)", "number"]],
            formula: "Inventory Days = (Average Inventory / COGS) * 365",
            calculate(v) {
                const cogs=getNumber(v,"cogs"), inv=getNumber(v,"averageInventory");
                if(cogs===0) return errorMessage("COGS cannot be zero.");
                const days=(inv/cogs)*365;
                return resultTemplate("Inventory Days = (Average Inventory / COGS) * 365", `(${money(inv)} / ${money(cogs)}) * 365 = ${number(days)} days`, `${number(days)} days`, "This estimates the average number of days inventory is held before being sold.");
            }
        },

        "receivable-days": {
            title: "Receivable Days",
            fields: [["averageReceivables", "Average Trade Receivables (NGN)", "number"],["creditSales", "Net Credit Sales (NGN)", "number"]],
            formula: "Receivable Days = (Average Receivables / Net Credit Sales) * 365",
            calculate(v) {
                const rec=getNumber(v,"averageReceivables"), sales=getNumber(v,"creditSales");
                if(sales===0) return errorMessage("Net credit sales cannot be zero.");
                const days=(rec/sales)*365;
                return resultTemplate("Receivable Days = (Average Receivables / Net Credit Sales) * 365", `(${money(rec)} / ${money(sales)}) * 365 = ${number(days)} days`, `${number(days)} days`, "This estimates the average time taken to collect trade receivables.");
            }
        },

        "payable-days": {
            title: "Payable Days",
            fields: [["averagePayables", "Average Trade Payables (NGN)", "number"],["creditPurchases", "Net Credit Purchases (NGN)", "number"]],
            formula: "Payable Days = (Average Trade Payables / Net Credit Purchases) * 365",
            calculate(v) {
                const payables=getNumber(v,"averagePayables"), purchases=getNumber(v,"creditPurchases");
                if(purchases===0) return errorMessage("Net credit purchases cannot be zero.");
                const days=(payables/purchases)*365;
                return resultTemplate("Payable Days = (Average Trade Payables / Net Credit Purchases) * 365", `(${money(payables)} / ${money(purchases)}) * 365 = ${number(days)} days`, `${number(days)} days`, "This estimates the average time taken to settle trade payables.");
            }
        },

        "debt-ratio": {
            title: "Debt Ratio",
            fields: [["totalLiabilities", "Total Liabilities (NGN)", "number"],["totalAssets", "Total Assets (NGN)", "number"]],
            formula: "Debt Ratio = Total Liabilities / Total Assets * 100",
            calculate(v) {
                const debt=getNumber(v,"totalLiabilities"), assets=getNumber(v,"totalAssets");
                if(assets===0) return errorMessage("Total assets cannot be zero.");
                const ratio=debt/assets*100;
                return resultTemplate("Debt Ratio = Total Liabilities / Total Assets * 100", `${money(debt)} / ${money(assets)} * 100 = ${number(ratio)}%`, percent(ratio), "This shows the proportion of total assets financed by liabilities.");
            }
        },

        "debt-to-equity": {
            title: "Debt-to-Equity Ratio",
            fields: [["totalLiabilities", "Total Liabilities (NGN)", "number"],["totalEquity", "Total Equity (NGN)", "number"]],
            formula: "Debt-to-Equity Ratio = Total Liabilities / Total Equity",
            calculate(v) {
                const debt=getNumber(v,"totalLiabilities"), equity=getNumber(v,"totalEquity");
                if(equity===0) return errorMessage("Total equity cannot be zero.");
                const ratio=debt/equity;
                return resultTemplate("Debt-to-Equity Ratio = Total Liabilities / Total Equity", `${money(debt)} / ${money(equity)} = ${number(ratio)}:1`, `${number(ratio)}:1`, "This compares financing provided by liabilities with financing provided by equity.");
            }
        },

        "equity-ratio": {
            title: "Equity Ratio",
            fields: [["totalEquity", "Total Equity (NGN)", "number"],["totalAssets", "Total Assets (NGN)", "number"]],
            formula: "Equity Ratio = Total Equity / Total Assets * 100",
            calculate(v) {
                const equity=getNumber(v,"totalEquity"), assets=getNumber(v,"totalAssets");
                if(assets===0) return errorMessage("Total assets cannot be zero.");
                const ratio=equity/assets*100;
                return resultTemplate("Equity Ratio = Total Equity / Total Assets * 100", `${money(equity)} / ${money(assets)} * 100 = ${number(ratio)}%`, percent(ratio), "This shows the proportion of total assets financed by equity.");
            }
        },

        "interest-coverage": {
            title: "Interest Coverage Ratio",
            fields: [["ebit", "Earnings Before Interest and Tax (EBIT) (NGN)", "number"],["interestExpense", "Interest Expense (NGN)", "number"]],
            formula: "Interest Coverage = EBIT / Interest Expense",
            calculate(v) {
                const ebit=getNumber(v,"ebit"), interest=getNumber(v,"interestExpense");
                if(interest===0) return errorMessage("Interest expense cannot be zero.");
                const ratio=ebit/interest;
                return resultTemplate("Interest Coverage = EBIT / Interest Expense", `${money(ebit)} / ${money(interest)} = ${number(ratio)} times`, `${number(ratio)} times`, "This measures how many times EBIT covers the period's interest expense.");
            }
        },

        "return-on-assets": {
            title: "Return on Assets (ROA)",
            fields: [["netIncome", "Net Income (NGN)", "number"],["averageAssets", "Average Total Assets (NGN)", "number"]],
            formula: "ROA = Net Income / Average Total Assets * 100",
            calculate(v) {
                const income=getNumber(v,"netIncome"), assets=getNumber(v,"averageAssets");
                if(assets===0) return errorMessage("Average total assets cannot be zero.");
                const roa=income/assets*100;
                return resultTemplate("ROA = Net Income / Average Total Assets * 100", `${money(income)} / ${money(assets)} * 100 = ${number(roa)}%`, percent(roa), "This measures profit generated relative to average assets employed.");
            }
        },

        "return-on-equity": {
            title: "Return on Equity (ROE)",
            fields: [["netIncome", "Net Income (NGN)", "number"],["averageEquity", "Average Equity (NGN)", "number"]],
            formula: "ROE = Net Income / Average Equity * 100",
            calculate(v) {
                const income=getNumber(v,"netIncome"), equity=getNumber(v,"averageEquity");
                if(equity===0) return errorMessage("Average equity cannot be zero.");
                const roe=income/equity*100;
                return resultTemplate("ROE = Net Income / Average Equity * 100", `${money(income)} / ${money(equity)} * 100 = ${number(roe)}%`, percent(roe), "This measures profit generated relative to average equity.");
            }
        },

        "earnings-per-share": {
            title: "Earnings Per Share (EPS)",
            fields: [["netIncome", "Net Income Attributable to Ordinary Shareholders (NGN)", "number"],["preferenceDividends", "Preference Dividends (NGN) - Optional", "number"],["weightedShares", "Weighted Average Ordinary Shares", "number"]],
            formula: "EPS = (Net Income - Preference Dividends) / Weighted Average Ordinary Shares",
            calculate(v) {
                const income=getNumber(v,"netIncome"), pref=v.preferenceDividends===""?0:getNumber(v,"preferenceDividends"), shares=getNumber(v,"weightedShares");
                if(shares===0) return errorMessage("Weighted average ordinary shares cannot be zero.");
                const eps=(income-pref)/shares;
                return resultTemplate("EPS = (Net Income - Preference Dividends) / Weighted Average Ordinary Shares", `(${money(income)} - ${money(pref)}) / ${number(shares)} = ${money(eps)}`, money(eps), "EPS expresses the earnings attributable to each ordinary share for the period.");
            }
        },

        "pe-ratio": {
            title: "Price-to-Earnings (P/E) Ratio",
            fields: [["marketPrice", "Market Price Per Share (NGN)", "number"],["eps", "Earnings Per Share (NGN)", "number"]],
            formula: "P/E Ratio = Market Price Per Share / EPS",
            calculate(v) {
                const price=getNumber(v,"marketPrice"), eps=getNumber(v,"eps");
                if(eps===0) return errorMessage("EPS cannot be zero.");
                const ratio=price/eps;
                return resultTemplate("P/E Ratio = Market Price Per Share / EPS", `${money(price)} / ${money(eps)} = ${number(ratio)} times`, `${number(ratio)} times`, "This expresses the market price per share as a multiple of earnings per share.");
            }
        },

        "dividend-per-share": {
            title: "Dividend Per Share (DPS)",
            fields: [["ordinaryDividends", "Ordinary Dividends (NGN)", "number"],["ordinaryShares", "Ordinary Shares Outstanding", "number"]],
            formula: "DPS = Ordinary Dividends / Ordinary Shares Outstanding",
            calculate(v) {
                const dividends=getNumber(v,"ordinaryDividends"), shares=getNumber(v,"ordinaryShares");
                if(shares===0) return errorMessage("Ordinary shares outstanding cannot be zero.");
                const dps=dividends/shares;
                return resultTemplate("DPS = Ordinary Dividends / Ordinary Shares Outstanding", `${money(dividends)} / ${number(shares)} = ${money(dps)}`, money(dps), "DPS shows the dividend attributable to each ordinary share.");
            }
        },

        "dividend-yield": {
            title: "Dividend Yield",
            fields: [["dps", "Dividend Per Share (NGN)", "number"],["marketPrice", "Market Price Per Share (NGN)", "number"]],
            formula: "Dividend Yield = Dividend Per Share / Market Price Per Share * 100",
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


    if (category === "mathematics" && ["differentiation", "integration", "logarithm", "matrices"].includes(type)) {

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
            const note=document.createElement("div"); note.className="formula-box"; note.innerHTML=`<strong>Examples</strong><p>log_10(100)<br>log_2(8) + log_5(25)<br>log_5(2) + log_2(5)<br>You can use as many logarithms as needed and combine them with +, -, * and /.</p><p><small>Base &gt; 0, base not equal to  1, and argument &gt; 0.</small></p>`; calculatorForm.appendChild(note);
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
    "price-elasticity-demand": "This measures how strongly buyers respond when price changes.",
    "price-elasticity-supply": "This measures how strongly sellers respond when price changes.",
    "income-elasticity": "This measures how demand responds when people's income changes.",
    "cross-elasticity": "This measures how demand for one product responds when another product's price changes."
  };

  function khidElasticityExplanation(type, value) {
    const magnitude = Math.abs(value);
    if (type === "price-elasticity-demand") {
      const cls = magnitude > 1 ? "elastic" : magnitude < 1 ? "inelastic" : "unit elastic";
      const simple = magnitude > 1 ? "A change in price causes a bigger percentage change in how much people buy." : magnitude < 1 ? "People do not change how much they buy by much when the price changes." : "The percentage change in how much people buy is about the same as the percentage change in price.";
      return `Price elasticity of demand measures how responsive quantity demanded is to a change in price. Since the absolute value of PED is ${number(magnitude)}, ${magnitude < 1 ? "which is less than 1" : magnitude > 1 ? "which is greater than 1" : "which equals 1"}, demand is classified as ${cls}. This means quantity demanded changes ${magnitude < 1 ? "proportionately less" : magnitude > 1 ? "proportionately more" : "in the same proportion"} than price.<br><br><strong>Simple Explanation:</strong> ${simple}`;
    }
    if (type === "price-elasticity-supply") {
      const cls = magnitude > 1 ? "elastic" : magnitude < 1 ? "inelastic" : "unit elastic";
      const simple = magnitude > 1 ? "Sellers change the amount they offer by a larger percentage than the price change." : magnitude < 1 ? "Sellers change the amount they offer by a smaller percentage than the price change." : "The percentage change in the amount sellers offer matches the percentage change in price.";
      return `Price elasticity of supply measures how responsive quantity supplied is to a change in price. Since PES is ${number(magnitude)}, ${magnitude < 1 ? "less than 1" : magnitude > 1 ? "greater than 1" : "equal to 1"}, supply is classified as ${cls}. Quantity supplied changes ${magnitude < 1 ? "proportionately less" : magnitude > 1 ? "proportionately more" : "in the same proportion"} than price.<br><br><strong>Simple Explanation:</strong> ${simple}`;
    }
    if (type === "income-elasticity") {
      const cls = value < 0 ? "an inferior good" : value > 1 ? "a luxury good (a normal good with income elasticity above 1)" : value > 0 ? "a normal good" : "a good with zero income elasticity";
      const simple = value < 0 ? "When people earn more money, they tend to buy less of this product." : value > 1 ? "As people's income rises, demand for this product tends to rise by a bigger percentage." : value > 0 ? "When people's income rises, they tend to buy more of this product, but demand rises by a smaller percentage than income." : "A change in income does not change demand in this calculation.";
      return `Income elasticity of demand measures how quantity demanded responds to a change in income. The result is ${number(value)}; ${value < 0 ? "its negative sign means demand moves in the opposite direction to income, so the good is classified as inferior" : value > 1 ? "a value above 1 indicates demand rises more than proportionately with income, consistent with a luxury good" : value > 0 ? "a positive value at or below 1 indicates a normal good whose demand rises less than or proportionately with income" : "a zero value indicates no measured response to income"}.<br><br><strong>Simple Explanation:</strong> ${simple}`;
    }
    const cls = value > 0 ? "substitutes" : value < 0 ? "complements" : "little or no direct relationship";
    const simple = value > 0 ? "If one product becomes more expensive, people may switch to the other product." : value < 0 ? "People tend to use these products together, so a price rise in one can reduce demand for the other." : "A price change in one product has little effect on demand for the other in this calculation.";
    return `Cross elasticity of demand measures how quantity demanded of one product responds to a change in another product's price. The result is ${number(value)}; ${value > 0 ? "the positive sign means the products are substitutes" : value < 0 ? "the negative sign means the products are complements" : "a value of zero indicates little or no direct relationship"}.<br><br><strong>Simple Explanation:</strong> ${simple}`;
  }

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
    if (q1 + q2 === 0 || x1 + x2 === 0 || x1 === x2) return errorMessage("The average quantity and average price/income must not be zero, and the price/income must change.");
    const qChange = (q2 - q1) / ((q1 + q2) / 2);
    const xChange = (x2 - x1) / ((x1 + x2) / 2);
    const signedElasticity = qChange / xChange;
    let value = signedElasticity;
    let label, explanation;
    if (type === "price-elasticity-demand") {
      const magnitude = Math.abs(signedElasticity);
      label = `${number(magnitude)}<br><strong>${interpretPED(magnitude).replace(/^Demand is /, "").replace(/:.*/, "")}</strong>`;
      explanation = khidEconomicsSimple[type];
      value = magnitude;
    } else if (isSupply) {
      value = Math.abs(signedElasticity);
      label = `${number(value)}<br><strong>${interpretPES(value).replace(/\.$/, "")}</strong>`;
      explanation = khidEconomicsSimple[type];
    } else if (isIncome) {
      label = `${number(value)}<br><strong>${interpretIncomeElasticity(value)}</strong>`;
      explanation = khidEconomicsSimple[type];
    } else {
      label = `${number(value)}<br><strong>${interpretCrossElasticity(value)}</strong>`;
      explanation = khidEconomicsSimple[type];
    }
    const xName = isIncome ? "income" : isCross ? "price of good Y" : "price";
    return resultTemplate(
      `${isIncome ? "YED" : isCross ? "XED" : isSupply ? "PES" : "PED"} = [(Q2 - Q1) / ((Q1 + Q2) / 2)] / [(${isIncome ? "Y2 - Y1" : "P2 - P1"}) / ((${isIncome ? "Y1 + Y2" : "P1 + P2"}) / 2)]`,
      `Quantity part = (${number(q2)} - ${number(q1)}) / [(${number(q1)} + ${number(q2)}) / 2] = ${number(qChange)}.<br><br>${xName} part = (${number(x2)} - ${number(x1)}) / [(${number(x1)} + ${number(x2)}) / 2] = ${number(xChange)}.<br><br>Signed elasticity = ${number(qChange)} / ${number(xChange)} = ${number(signedElasticity)}.${type === "price-elasticity-demand" ? `<br><br>PED classification uses the absolute value: |${number(signedElasticity)}| = ${number(value)}.` : ""}`,
      label,
      khidElasticityExplanation(type, value)
    );
  }

  function khidParseLinearFunction(raw, expectedVariable) {
    // Safe parser for a straight-line expression: constant + coefficient * variable.
    // Supports +, -, explicit or implicit multiplication, division by constants,
    // decimal coefficients, and bracketed numeric coefficients such as (3/2)P.
    let expression = String(raw || "").trim()
      .replace(/[âˆ’â€“â€”]/g, "-").replace(/[Ã—Â·]/g, "*").replace(/Ã·/g, "/");
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
    return resultTemplate(
      formula,
      `Function entered: ${raw}<br>Derivative (slope) = ${number(slope)}. This means the quantity changes by ${number(slope)} units for each 1-unit change in ${variableName}, according to the entered straight-line function.<br><br>${quantityName} at this point = ${number(constant)} + (${number(slope)} * ${number(point)}) = ${number(quantity)}.<br><br>Elasticity = ${number(slope)} * (${number(point)} / ${number(quantity)}) = ${number(value)}.`,
      `${number(value)}<br><strong>${classification.replace(/^Demand is /, "").replace(/:.*/, "")}</strong>`,
      khidElasticityExplanation(type, value)
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
      if (category === "economics" && khidElasticityIds.has(type) && (khidElasticityMethod[type] || "percentage") === "percentage") {
        const outputText = result ? result.innerText : "";
        const match = outputText.match(/(?:Answer:|Result:)?\s*(-?\d+(?:\.\d+)?)/i);
        const displayedValue = match ? Number(match[1]) : 0;
        khidSimpleBox(khidElasticityExplanation(type, displayedValue));
      }
    });
  }

  // Re-render the current calculator through the enhanced selector-aware renderer.
  if (categorySelect && calculatorSelect) {
    populateCalculators();
  }
})();
