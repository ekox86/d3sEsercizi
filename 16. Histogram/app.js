async function draw() {
  // Data
  const dataset = await d3.json('data.json')
  const xAccessor = d=> d.currently.humidity
  // Dimensions
  let dimensions = {
    width: 800,
    height: 400,
    margins: 50
  };

  dimensions.ctrWidth = dimensions.width - dimensions.margins * 2
  dimensions.ctrHeight = dimensions.height - dimensions.margins * 2

  // Draw Image
  const svg = d3.select('#chart')
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)

  const ctr = svg.append("g") // <g>
    .attr(
      "transform",
      `translate(${dimensions.margins}, ${dimensions.margins})`
    )

    //Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(dataset, xAccessor))
      .range([0, dimensions.ctrWidth])
      .nice() //arrotonda i valori nel dominio.

    const bin = d3.bin() //funzione che divide in bin il dominio di ingresso, per calcolare le frequenze.
      .domain(xScale.domain()) //ritorna il dominio della scala
      .value(xAccessor) //indica come prendere il valore dal dataset
      .thresholds(10)    //le thresholds sono i gruppi in cui suggeriamo a d3 di dividere i dati. E' un suggerimento però, non sempre viene seguito.
    const newDataset = bin(dataset)   //ritorna un array con i dati raggruppati per bins per ogni bin ci sono due proprietà x0 e x1, che forniscono il min e il max del bin. 
    //console.log({original: dataset, new: newDataset})
    const padding = 1 //distanza tra i rettangoli
    //Draw bars
    ctr.selectAll('rect')
      .data(newDataset)
      .join('rect')
      .attr('width',d=>d3.max([0,xScale(d.x1) - xScale(d.x0) - padding])) //calcoliamo la larghezza del rettangolo usando i valori scalati dei confini dei bin
      .attr('height',100)
      .attr('x', d => xScale(d.x0))  //usiamo il valore x0 del bin, cioè il valore inferiore del bin
      .attr('y', 0)

}

draw()