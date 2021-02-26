const pBrowser = document.querySelector('p');
const body = d3.select('body');
const p = body.append('p')
    .attr('id','paragraph')
    .classed('foo',true)
    .classed('bar',true)
    .text('Hello world')
    .style('color','blue');
console.log(body);
console.log(p);