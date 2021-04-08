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

//LINE GENERATION
  const lineGenerator = d3.line()     //crea una funzione che genera una linea, un path svg
    .x((d) => xScale(xAccessor(d)))   //in questo modo indico dove leggere le x dei punti della linea dall'array.
    .y((d) => yScale(yAccessor(d)))   //in questo modo indico dove leggere le y dei punti della linea dall'array.
    //console.log(lineGenerator(dataset)) //stampa tutto il path della linea
    ctr.append('path')  //il valore generato dal linegenerator è compativile solo con un svg path
      .datum(dataset)   //invece di usare data, usiamo datum perchè associamo un singolo dato al path.
      .attr('d',lineGenerator)  //la funzione lineGenerator verrà applicata al dataset creando la linea. L'attributo d del path svg descrive i punti del path.
      .attr('fill', 'none')     //in questo modo il contenuto del path non viene riempito, di default i path svg sono riempiti di nero.
      .attr('stroke','#30475e') //d'altronde se non diamo un colore allo stroke non vedremo la linea di contorno del path, quindi dobbiamo settarlo.
      .attr('stroke-width',2)   //cambiamo lo spessore della linea

//AXIS 
    const xAxis = d3.axisBottom(xScale)
      .ticks(8)
      .tickFormat(d3.timeFormat("%m/%d/%y"))  //formattiamo la data sui tick sull'asse orizzontale
    const xAxisGroup = ctr.append('g')
    .call(xAxis) 
    .style('transform',`translateY(${dimensions.ctrHeight}px)`)

    const yAxis = d3.axisLeft(yScale)
      .tickFormat((d) =>`$${d}`)  //aggiungiamo il simbolo dollaro al tick sull'asse verticale
    const yAxisGroup = ctr.append('g')
      .call(yAxis)

  }
draw()