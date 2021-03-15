async function draw(el,scale) {
  // Data
  const dataset = await d3.json('data.json')
  dataset.sort((a,b)=>a-b) //ordina in modo ascendente i dati (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
  // Dimensions
  let dimensions = {
    width: 600,
    height: 150,
  };
  let box = 30 //dimensione del lato dei quadrati.
  // Draw Image
  const svg = d3.select(el)
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)

    //Scales
    let colorScale;
    if (scale ==='linear'){
      colorScale = d3.scaleLinear()
        .domain(d3.extent(dataset))
        .range(['white','red'])   //associa una scala di colori che va dal bianco al rosso, secondo i valori di input(domain)
    }else if (scale ==='quantize') {
        colorScale = d3.scaleQuantize()
          .domain(d3.extent(dataset))
          .range(['white','pink','red']) //divide inputDomain in 3 intervalli uguali e associa il risultato ad
          console.log('Quantize:',colorScale.thresholds())  //stampa le soglie automaticamente calcolate da d3                                //uno dei tre colori, secondo l'intervallo.
    }else if (scale ==='quantile') {
        colorScale = d3.scaleQuantile()
          .domain(dataset) //invece di passare minimo e massimo,passiamo il dataset in modo che scalequantile possa calcolare i quantili
          .range(['white','pink','red']) //divide inputDomain in 3 intervalli con un numero uguale di campioni, e  per ognuno associa un colore
          console.log('Quantize:',colorScale.quantiles())  //stampa le soglie calcolate da d3                                             
    }else if (scale ==='threshold') {
      colorScale = d3.scaleThreshold()
        .domain([45200,135600]) //invece di passare minimo e massimo, passiamo l'array delle soglie che definiscono i 3 bucket
        .range(['white','pink','red']) 
                                      
  }

    //Rectangles
    svg.append('g')
      .attr('transform','translate(2,2)') //sposta il group a destra e in basso di 2, per avere margine
      .attr('stroke','black') //questi attributi, applicati al gruppo, verranno ereditati dalle forme disegnate dentro.
      .selectAll('rect')
      .data(dataset) //prende i dati dal nostro dataset
      .join('rect')  //crea un elemento rect per ogni dato
      .attr('width', box - 3)
      .attr('height', box -3)  //-3 serve per avere spazio tra un quadrato e l'altro
      .attr('x',(d,i)=> box * (i%20)) //d è il dato del dataset, i è l'indice dell'array
      //.attr('y',(d,i)=>box * ((i/20)| 0) //Il bitwise or converte il risultato della divisione in un intero (che porcata)
      .attr('y',(d,i)=>box * (Math.trunc(i/20))) //Fatto meglio
      .attr('fill',(d) => colorScale(d)) //riempie i quadrati seguendo la scala di colori lineare che abbiamo definito prima.
    }
    

draw('#heatmap1','linear')
draw('#heatmap2','quantize')
draw('#heatmap3','quantile')
draw('#heatmap4','threshold')