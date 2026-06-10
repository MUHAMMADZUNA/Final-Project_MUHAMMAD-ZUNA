// ============================================================
// CHARTS.JS — AI Zuna Dashboard (FIXED VERSION)
// Tambahan: Profitability by Territory chart
// ============================================================

function createCharts(
    categorySales, categoryProfit,
    productSales,
    monthlySales, monthlyProfit,
    data, margin,
    territorySales, territoryProfit   // ✅ parameter baru
) {
    const darkLayout = {
        paper_bgcolor: "transparent",
        plot_bgcolor:  "transparent",
        font: { color: "white", size: 11 },
        margin: { t: 40, l: 55, r: 20, b: 55 }
    };

    // 1. SALES BY CATEGORY
    Plotly.react("salesCategory", [{
        x: Object.keys(categorySales),
        y: Object.values(categorySales),
        type: "bar",
        marker: { color: "#22d3ee" }
    }], { ...darkLayout, title: "Sales by Category" });

    // 2. PROFIT BY CATEGORY
    Plotly.react("profitCategory", [{
        x: Object.keys(categoryProfit),
        y: Object.values(categoryProfit),
        type: "bar",
        marker: { color: "#a855f7" }
    }], { ...darkLayout, title: "Profit by Category" });

    // 3. SALES TREND
    const smKeys = Object.keys(monthlySales).sort();
    Plotly.react("salesTrend", [{
        x: smKeys,
        y: smKeys.map(k => monthlySales[k]),
        mode: "lines+markers",
        line: { color: "#22d3ee" }
    }], { ...darkLayout, title: "Sales Trend" });

    // 4. PROFIT TREND
    const pmKeys = Object.keys(monthlyProfit).sort();
    Plotly.react("profitTrend", [{
        x: pmKeys,
        y: pmKeys.map(k => monthlyProfit[k]),
        mode: "lines+markers",
        line: { color: "#ec4899" }
    }], { ...darkLayout, title: "Profit Trend" });

    // 5. SCATTER PLOT — Sales vs Profit
    Plotly.react("scatterPlot", [{
        x: data.map(r => parseFloat(r.Sales)  || 0),
        y: data.map(r => parseFloat(r.Profit) || 0),
        mode: "markers",
        marker: { size: 6, color: "#38bdf8", opacity: 0.7 }
    }], {
        ...darkLayout,
        title: "Sales vs Profit",
        xaxis: { title: "Sales", color: "white" },
        yaxis: { title: "Profit", color: "white" }
    });

    // 6. TOP 10 PRODUCTS
    const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    Plotly.react("topProducts", [{
        x: topProducts.map(x => x[1]),
        y: topProducts.map(x => x[0]),
        orientation: "h",
        type: "bar",
        marker: { color: "#ec4899" }
    }], {
        ...darkLayout,
        title: "Top 10 Products",
        yaxis: { autorange: "reversed" }
    });

    // 7. ✅ PROFITABILITY BY TERRITORY (CHART BARU)
    if (territorySales && territoryProfit) {
        const terKeys = Object.keys(territoryProfit).sort((a, b) => territoryProfit[b] - territoryProfit[a]);
        const profitMarginByTer = terKeys.map(k =>
            territorySales[k] > 0 ? (territoryProfit[k] / territorySales[k]) * 100 : 0
        );

        Plotly.react("profitByRegion", [
            {
                x: terKeys,
                y: terKeys.map(k => territoryProfit[k]),
                name: "Profit",
                type: "bar",
                marker: { color: "#10b981" }
            },
            {
                x: terKeys,
                y: profitMarginByTer,
                name: "Profit Margin (%)",
                type: "scatter",
                mode: "lines+markers",
                yaxis: "y2",
                line: { color: "#f59e0b" },
                marker: { size: 7 }
            }
        ], {
            ...darkLayout,
            title: "Profitability by Territory",
            barmode: "group",
            yaxis:  { title: "Profit ($)", color: "white" },
            yaxis2: {
                title: "Margin (%)",
                overlaying: "y",
                side: "right",
                color: "#f59e0b",
                showgrid: false
            },
            legend: { orientation: "h", y: -0.2 }
        });
    }

    // 8. TOP CATEGORY CARD
    const topCat = Object.keys(categorySales).length > 0
        ? Object.keys(categorySales).reduce((a, b) => categorySales[a] > categorySales[b] ? a : b)
        : "Unknown";

    const topCategoryEl = document.getElementById("topCategory");
    if (topCategoryEl) {
        topCategoryEl.innerHTML = `
            <div style="height:100%;display:flex;justify-content:center;align-items:center;flex-direction:column;padding:20px 0;">
                <div style="font-size:48px;">🏆</div>
                <h2 style="margin:10px 0 5px;color:#22d3ee;">${topCat}</h2>
                <p style="margin:0;opacity:0.7;">Best Performing Category</p>
            </div>
        `;
    }

    // 9. HEALTH SCORE GAUGE
    if (typeof generateHealthScore === "function") generateHealthScore(margin);
}