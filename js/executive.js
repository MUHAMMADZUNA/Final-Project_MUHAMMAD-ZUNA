function generateExecutiveSummary(
    totalSales,
    totalProfit,
    margin,
    topCategory
){

document.getElementById(
"executiveSummary"
).innerHTML = `

<p>

AI menemukan bahwa
<b>${topCategory}</b>
merupakan kategori utama yang
mendorong pertumbuhan bisnis.

<br><br>

Total sales mencapai
<b>$${(totalSales/1000000).toFixed(2)}M</b>
dengan profit sebesar
<b>$${(totalProfit/1000000).toFixed(2)}M</b>.

<br><br>

Profit margin sebesar
<b>${margin.toFixed(2)}%</b>
menunjukkan performa bisnis
berada pada kategori sehat.

</p>

`;

}