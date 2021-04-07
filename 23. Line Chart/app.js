async function draw() {
  // Data
  const dataset = await d3.csv('data.csv')

  const parseDate = d3.timeParse('%Y-%m-%d')  //ritorna una funzione capace di parsificare una stringa e ritornare un oggetto data
  //Dobbiamo fare la conversione da stringa a oggetto data perchè scaletime() si aspetta degli oggetti data.
  const xAccessor = d => parseDate(d.date)  //in questo modo l'accesso al dato ritornerà un oggetto data come previsto
  const yAccessor = d => parseInt(d.close)  //convertiamo in interi i dati letti dal csv.

  // Dimensions
  let dimensions = {
    width: 1000,
    height: 500,
    margins: 50,
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

  // Scales
  const yScale = d3.scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.ctrHeight, 0])
    .nice()

  /*const xScale = d3.scaleTime()   //scaleTime lavora con date locali, cioè quelle del pc utente
      .domain(d3.extent(dataset, xAccessor)) //la extent funziona anche con le date: ritorna la data più vecchia e la più nuova.
      .range([0,dimensions.ctrWidth])
      console.log(xScale(xAccessor(dataset[0])),dataset[0])
    }*/
  const xScale = d3.scaleUtc() //a differenza di scaleTime, ScaleUtc lavora con date utc
    .domain(d3.extent(dataset, xAccessor)) //la extent funziona anche con le date: ritorna la data più vecchia e la più nuova.
    .range([0,dimensions.ctrWidth])    
  }
draw()