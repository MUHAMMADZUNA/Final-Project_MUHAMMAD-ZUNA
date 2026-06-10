function generateInsight(
    topSalesCategory,
    topProfitCategory,
    margin
){

document.getElementById("insightBox").innerHTML = `

<ul>

<li>
<b>${topSalesCategory}</b>
memiliki total penjualan tertinggi.
</li>

<li>
<b>${topProfitCategory}</b>
menjadi penyumbang profit terbesar.
</li>

<li>
Profit Margin perusahaan saat ini
mencapai <b>${margin.toFixed(2)}%</b>.
</li>

<li>
Sales tinggi belum tentu menghasilkan
profit yang tinggi.
</li>

</ul>

`;

}