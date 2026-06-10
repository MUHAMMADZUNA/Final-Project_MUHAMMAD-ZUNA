function generateAnomaly(
    lowestProfitCategory
){

document.getElementById("anomalyBox").innerHTML = `

<ul>

<li>
Kategori
<b>${lowestProfitCategory}</b>
memiliki profit paling rendah.
</li>

<li>
Terdapat potensi biaya operasional
yang terlalu tinggi.
</li>

<li>
Margin kategori perlu dievaluasi.
</li>

<li>
Perlu audit produk dengan profit kecil.
</li>

</ul>

`;

}