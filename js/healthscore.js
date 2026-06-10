function generateHealthScore(margin){

let score = 0;

if(margin >= 25){

score = 95;

}else if(margin >= 20){

score = 85;

}else if(margin >= 15){

score = 75;

}else{

score = 60;

}

Plotly.newPlot(
"profitGauge",
[
{
type:"indicator",
mode:"gauge+number",

value:score,

title:{
text:"Business Health Score"
},

gauge:{
axis:{
range:[0,100]
},

bar:{
color:"#22d3ee"
},

steps:[
{
range:[0,50],
color:"#ef4444"
},
{
range:[50,75],
color:"#f59e0b"
},
{
range:[75,100],
color:"#10b981"
}
]
}
}
],
{
paper_bgcolor:"transparent",
font:{
color:"white"
}
}
);

}