async function draw() {
  // Data
  const dataset = await d3.csv('data.csv',d => {
    d3.autoType(d)  //questa funzione individua automaticamente il tipo di dato. Non è sempre perfetta, da testare il dato ricavato

    return d
  })
  console.log(dataset)
  // Dimensions
  let dimensions = {
    width: 1000,
    height: 600,
    margins: 20,
  };

  dimensions.ctrWidth = dimensions.width - dimensions.margins * 2
  dimensions.ctrHeight = dimensions.height - dimensions.margins * 2

  // Draw Image
  const svg = d3.select('#chart')
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)

  const ctr = svg.append("g")
    .attr(
      "transform",
      `translate(${dimensions.margins}, ${dimensions.margins})`
    )

  // Scales
}

draw()