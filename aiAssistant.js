// ============================================================
// AIASSISTANT.JS — Integrasi LLM Nyata via Cloudflare Worker Proxy
// Tidak ada API key di file ini — key disimpan aman di Cloudflare
// ============================================================

// 🔧 GANTI dengan URL Worker kamu setelah deploy
// Contoh: "https://groq-proxy.namakamu.workers.dev"
const WORKER_URL = "https://groq-proxy.muhammadzuna30.workers.dev";

// ── Cek apakah proxy AI siap dipakai ──
function isGroqReady() {
    return typeof WORKER_URL === "string"
        && WORKER_URL.length > 0
        && !WORKER_URL.includes("GANTI-INI");
}

// ── Build prompt dari konteks dashboard + pertanyaan user ──
function buildAssistantPrompt(question, ctx) {
    return `Berikut adalah ringkasan data penjualan saat ini (sudah memperhitungkan filter yang aktif):
- Total Sales: $${ctx.totalSales.toFixed(2)}
- Total Profit: $${ctx.totalProfit.toFixed(2)}
- Profit Margin: ${ctx.margin.toFixed(2)}%
- Total Quantity Sold: ${ctx.totalQty.toLocaleString()}
- Kategori dengan Sales tertinggi: ${ctx.topSalesCategory}
- Kategori dengan Profit tertinggi: ${ctx.topProfitCategory}
- Kategori dengan Profit terendah: ${ctx.lowestProfitCategory}
- Business Health Score: ${ctx.healthScore}/100 (${ctx.healthStatus})
- Risk Level: ${ctx.riskLevel}

Pertanyaan dari user: "${question}"

Jawab pertanyaan tersebut berdasarkan data di atas. Gunakan Bahasa Indonesia,
maksimal 3 kalimat, langsung ke poin, dan sertakan angka spesifik jika relevan.
Jangan menyebut kategori atau data yang tidak ada dalam ringkasan di atas.`;
}

// ── Panggil AI lewat Cloudflare Worker proxy (Groq di baliknya) ──
async function askGroqAI(question, ctx) {
    const prompt = buildAssistantPrompt(question, ctx);

    const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "Kamu adalah asisten analis data penjualan yang ramah, ringkas, dan berbasis data. Selalu jawab dalam Bahasa Indonesia."
                },
                { role: "user", content: prompt }
            ],
            max_tokens: 200,
            temperature: 0.4
        })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `AI Proxy error: ${res.status}`);
    }

    const data = await res.json();

    if (data.error) throw new Error(data.error.message || "Groq error");

    return data.choices[0].message.content.trim();
}