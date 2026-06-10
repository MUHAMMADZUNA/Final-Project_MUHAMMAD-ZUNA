function generateRecommendation(
    topSalesCategory,
    topProfitCategory
){

document.getElementById("recommendationBox").innerHTML = `

<ul>

<li>
Fokus promosi pada kategori
<b>${topSalesCategory}</b>.
</li>

<li>
Perkuat strategi cross-selling
untuk kategori profit tertinggi.
</li>

<li>
Terapkan bundling produk.
</li>

<li>
Optimalkan produk dengan margin kecil.
</li>

<li>
Monitoring kategori profit rendah.
</li>

</ul>

`;

}