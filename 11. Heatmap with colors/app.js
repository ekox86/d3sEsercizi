async function draw(el) {
  // Data
  const dataset = await d3.json('data.json')

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

    //Rectangles
    svg.append('g')
      .attr('transform','translate(2,2)') //sposta il group a destra e in basso di 2, per avere margine
      .attr('stroke','black') //questi attributi, applicati al gruppo, verranno ereditati dalle forme disegnate dentro.
      .attr('fill',"#ddd")
      .selectAll('rect')
      .data(dataset) //prende i dati dal nostro dataset
      .join('rect')  //crea un elemento rect per ogni dato
      .attr('width', box - 3)
      .attr('height', box -3)  //-3 serve per avere spazio tra un quadrato e l'altro
      .attr('x',(d,i)=> box * (i%20)) //d è il dato del dataset, i è l'indice dell'array
      //.attr('y',(d,i)=>box * ((i/20)| 0) //Il bitwise or converte il risultato della divisione in un intero (che porcata)
      .attr('y',(d,i)=>box * (Math.trunc(i/20))) //Fatto meglio
    }
    

draw('#heatmap1')