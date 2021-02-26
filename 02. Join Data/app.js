const data=[10,20,30,40,50];
const el= d3.select('ul')
    .selectAll('li')
    .data(data)
    .join('li')
    .text("test");

console.log(el )
