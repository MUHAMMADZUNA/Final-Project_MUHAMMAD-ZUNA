// ============================================================
// SCRIPT.JS — AI Zuna Dashboard (FIXED VERSION)
// Fix: Qty kolom benar "Qty", tambah Territory filter & chart
// ============================================================

let originalData = [];
let currentTopSalesCategory = "Unknown";
let currentTopProfitCategory = "Unknown";

// ✅ BARU: simpan ringkasan data terbaru untuk dikirim ke LLM (Groq)
let dashboardContext = {
    totalSales: 0,
    totalProfit: 0,
    totalQty: 0,
    margin: 0,
    topSalesCategory: "Unknown",
    topProfitCategory: "Unknown",
    lowestProfitCategory: "Unknown",
    healthScore: 0,
    healthStatus: "Unknown",
    riskLevel: "Unknown"
};

Papa.parse("sales.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,

    complete: function (results) {
        const data = results.data;
        console.log("✅ Dataset Loaded:", data.length, "rows");
        if (data.length > 0) console.log("Sample row:", data[0]);

        const regions     = new Set();
        const categories  = new Set();
        const subCats     = new Set();
        const segments    = new Set();

        data.forEach(row => {
            categories.add(row.Category    || "Unknown");
            regions.add(row.Territory      || row.CountryRegion || "Unknown");
            subCats.add(row.SubCategory    || "Unknown");
            segments.add(row.Segment       || "Unknown");
        });

        populateFilter("categoryFilter",   categories,  "All Category");
        populateFilter("regionFilter",     regions,     "All Region");
        populateFilter("subCatFilter",     subCats,     "All SubCategory");
        populateFilter("segmentFilter",    segments,    "All Segment");

        // Event listeners semua filter
        ["categoryFilter","regionFilter","subCatFilter","segmentFilter"]
            .forEach(id => {
                const el = document.getElementById(id);
                if (el) el.addEventListener("change", applyFilters);
            });

        originalData = data;
        updateDashboard(originalData);

        // AI CHAT — ✅ SEKARANG TERHUBUNG KE GROQ (LLM nyata) + fallback rule-based
        window.askAI = async function () {
            const questionEl = document.getElementById("question");
            const answerBox  = document.getElementById("answerBox");
            if (!questionEl || !answerBox) return;

            const q = questionEl.value.trim();
            if (!q) return;

            const ql = q.toLowerCase();

            // ── 1. Coba pakai Groq AI (LLM nyata) jika key sudah dikonfigurasi ──
            if (typeof isGroqReady === "function" && isGroqReady()) {
                answerBox.innerHTML = `<span class="ai-thinking">🤖 AI sedang menganalisis data...</span>`;
                try {
                    const aiAnswer = await askGroqAI(q, dashboardContext);
                    answerBox.innerHTML = `🤖 ${aiAnswer}`;
                    return;
                } catch (err) {
                    console.warn("⚠️ Groq AI gagal, fallback ke rule-based:", err.message);
                    // lanjut ke fallback di bawah
                }
            }

            // ── 2. Fallback: jawaban rule-based (selalu berfungsi tanpa API) ──
            let answer = "Maaf, AI belum memiliki jawaban untuk pertanyaan tersebut. Coba tanyakan tentang sales, profit, atau risk.";

            if (ql.includes("sales") || ql.includes("revenue") || ql.includes("category")) {
                answer = `Kategori dengan sales tertinggi saat ini adalah <b>${currentTopSalesCategory}</b>.`;
            } else if (ql.includes("profit")) {
                answer = `Kategori dengan profit tertinggi saat ini adalah <b>${currentTopProfitCategory}</b>.`;
            } else if (ql.includes("risk")) {
                const riskEl = document.getElementById("riskLevel");
                answer = `Risk Level saat ini adalah <b>${riskEl ? riskEl.innerHTML : "Unknown"}</b>.`;
            } else if (ql.includes("margin")) {
                const marginEl = document.getElementById("margin");
                answer = `Profit Margin saat ini adalah <b>${marginEl ? marginEl.innerHTML : "N/A"}</b>.`;
            } else if (ql.includes("qty") || ql.includes("quantity")) {
                const qtyEl = document.getElementById("qty");
                answer = `Total Quantity Sold saat ini adalah <b>${qtyEl ? qtyEl.innerHTML : "N/A"}</b>.`;
            }

            answerBox.innerHTML = answer;
        };

        // Allow Enter key on chat
        const qInput = document.getElementById("question");
        if (qInput) qInput.addEventListener("keydown", e => { if (e.key === "Enter") window.askAI(); });
    },

    error: function (error) {
        console.error("❌ PapaParse Error:", error);
        alert("Gagal membaca sales.csv. Pastikan file tersedia dan formatnya sesuai.");
    }
});

// ──────────────────────────────────────────
// HELPER: populate <select> filter
// ──────────────────────────────────────────
function populateFilter(id, valueSet, defaultLabel) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = `<option value="All">${defaultLabel}</option>`;
    [...valueSet].sort().forEach(val => {
        const opt = document.createElement("option");
        opt.value = val;
        opt.textContent = val;
        el.appendChild(opt);
    });
}

// ──────────────────────────────────────────
// APPLY FILTERS
// ──────────────────────────────────────────
function applyFilters() {
    const cat    = (document.getElementById("categoryFilter")?.value)  || "All";
    const region = (document.getElementById("regionFilter")?.value)    || "All";
    const subCat = (document.getElementById("subCatFilter")?.value)    || "All";
    const seg    = (document.getElementById("segmentFilter")?.value)   || "All";

    const filtered = originalData.filter(row => {
        const rowCat    = row.Category   || "Unknown";
        const rowRegion = row.Territory  || row.CountryRegion || "Unknown";
        const rowSub    = row.SubCategory || "Unknown";
        const rowSeg    = row.Segment    || "Unknown";

        return (cat    === "All" || rowCat    === cat)
            && (region === "All" || rowRegion === region)
            && (subCat === "All" || rowSub    === subCat)
            && (seg    === "All" || rowSeg    === seg);
    });

    updateDashboard(filtered);
}

// ──────────────────────────────────────────
// UPDATE DASHBOARD (kalkulasi ulang semua)
// ──────────────────────────────────────────
function updateDashboard(data) {
    let totalSales  = 0;
    let totalProfit = 0;
    let totalQty    = 0;

    const categorySales   = {};
    const categoryProfit  = {};
    const productSales    = {};
    const monthlySales    = {};
    const monthlyProfit   = {};
    const territorySales  = {};   // ✅ BARU: untuk chart profitability by region
    const territoryProfit = {};   // ✅ BARU

    data.forEach(row => {
        const sales  = parseFloat(row.Sales)  || 0;
        const profit = parseFloat(row.Profit) || 0;
        const qty    = parseInt(row.Qty)      || 0;   // ✅ FIX: pakai "Qty" bukan OrderQuantity

        totalSales  += sales;
        totalProfit += profit;
        totalQty    += qty;

        const cat      = row.Category    || "Unknown";
        const product  = row.ProductName || "Unknown";
        const territory = row.Territory  || row.CountryRegion || "Unknown";

        categorySales[cat]    = (categorySales[cat]   || 0) + sales;
        categoryProfit[cat]   = (categoryProfit[cat]  || 0) + profit;
        productSales[product] = (productSales[product]|| 0) + sales;

        territorySales[territory]  = (territorySales[territory]  || 0) + sales;
        territoryProfit[territory] = (territoryProfit[territory] || 0) + profit;

        const date = row.OrderDate;
        if (date) {
            const d = new Date(date);
            if (!isNaN(d.getTime())) {
                const month = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
                monthlySales[month]  = (monthlySales[month]  || 0) + sales;
                monthlyProfit[month] = (monthlyProfit[month] || 0) + profit;
            }
        }
    });

    const margin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    // ── KPI Cards ──
    setHTML("sales",  "$" + (totalSales  / 1_000_000).toFixed(2) + "M");
    setHTML("profit", "$" + (totalProfit / 1_000_000).toFixed(2) + "M");
    setHTML("margin", margin.toFixed(2) + "%");
    setHTML("qty",    totalQty.toLocaleString());   // ✅ SEKARANG TAMPIL BENAR

    // ── Top / Lowest Category ──
    currentTopSalesCategory  = topKey(categorySales)  || "Unknown";
    currentTopProfitCategory = topKey(categoryProfit) || "Unknown";
    const lowestProfitCat    = bottomKey(categoryProfit) || "Unknown";

    // ── Business Health Score ──
    let healthScore = Math.min(100, Math.round(Math.min(margin * 2, 50) + Math.min(totalProfit / 50000, 50)));
    let healthStatus = healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : "Needs Attention";
    setHTML("healthScore",  healthScore);
    setHTML("healthStatus", healthStatus);

    // ── Mini Cards ──
    setHTML("bestCategory", currentTopSalesCategory);
    setHTML("bestProfit",   currentTopProfitCategory);
    const riskLevel = margin > 20 ? "Low" : margin > 10 ? "Medium" : "High";
    setHTML("riskLevel", riskLevel);

    // ── ✅ BARU: update dashboardContext untuk AI Sales Assistant (Groq) ──
    dashboardContext = {
        totalSales: totalSales,
        totalProfit: totalProfit,
        totalQty: totalQty,
        margin: margin,
        topSalesCategory: currentTopSalesCategory,
        topProfitCategory: currentTopProfitCategory,
        lowestProfitCategory: lowestProfitCat,
        healthScore: healthScore,
        healthStatus: healthStatus,
        riskLevel: riskLevel
    };

    // ── Executive Summary ──
    setHTML("executiveSummary", `
        <p>AI Analysis menemukan bahwa <b>${currentTopSalesCategory}</b> merupakan kategori dengan kontribusi penjualan terbesar.</p>
        <p>Total sales mencapai <b>$${(totalSales/1_000_000).toFixed(2)}M</b> dengan profit sebesar <b>$${(totalProfit/1_000_000).toFixed(2)}M</b>.</p>
        <p>Profit margin saat ini berada pada level <b>${margin.toFixed(2)}%</b>.</p>
    `);

    // ── Panggil modul external ──
    if (typeof generateInsight       === "function") generateInsight(currentTopSalesCategory, currentTopProfitCategory, margin);
    if (typeof generateAnomaly       === "function") generateAnomaly(lowestProfitCat);
    if (typeof generateRecommendation=== "function") generateRecommendation(currentTopSalesCategory, currentTopProfitCategory);
    if (typeof generateConclusion    === "function") generateConclusion(margin, currentTopSalesCategory);
    if (typeof generateTopPerformer  === "function") generateTopPerformer(
        currentTopSalesCategory,
        categorySales[currentTopSalesCategory]  || 0,
        categoryProfit[currentTopSalesCategory] || 0
    );

    // ── Charts ──
    if (typeof createCharts === "function") {
        createCharts(
            categorySales, categoryProfit,
            productSales,
            monthlySales, monthlyProfit,
            data, margin,
            territorySales, territoryProfit   // ✅ kirim ke charts.js
        );
    }
}

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────
function setHTML(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = val;
}
function topKey(obj) {
    const keys = Object.keys(obj);
    if (!keys.length) return null;
    return keys.reduce((a, b) => obj[a] > obj[b] ? a : b);
}
function bottomKey(obj) {
    const keys = Object.keys(obj);
    if (!keys.length) return null;
    return keys.reduce((a, b) => obj[a] < obj[b] ? a : b);
}

// ──────────────────────────────────────────
// TAB SWITCHER
// ──────────────────────────────────────────
window.openTab = function (tabId, event) {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active-tab"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    const target = document.getElementById(tabId);
    if (target) target.classList.add("active-tab");
    if (event && event.target) event.target.classList.add("active");
};