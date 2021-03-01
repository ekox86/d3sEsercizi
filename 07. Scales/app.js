const slices = [100, 200, 300, 400, 500]

const scale = d3.scaleLinear()
  //.domain([d3.min(slices), d3.max(slices)])
  .domain(d3.extent(slices))
  .range([10, 350])

  console.log(scale(100)) //print 10
  console.log(scale(500)) //print 350
  console.log(scale(300)) //print 180
