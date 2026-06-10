function generateConclusion(
    margin,
    topCategory
){

let status = "";

if(margin > 20){

status =
"Business Performance Excellent";

}else if(margin > 10){

status =
"Business Performance Good";

}else{

status =
"Business Performance Needs Improvement";

}

document.getElementById(
"finalConclusion"
).innerHTML = `

<p>

${status}

<br><br>

Kategori utama bisnis saat ini adalah
<b>${topCategory}</b>.

<br><br>

Strategi yang direkomendasikan:

<ul>

<li>Mempertahankan kategori unggulan.</li>
<li>Meningkatkan profit kategori lemah.</li>
<li>Memanfaatkan cross-selling.</li>
<li>Mengoptimalkan marketing budget.</li>

</ul>

</p>

`;

}