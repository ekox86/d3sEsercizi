async function draw() {
  // Data
  const dataset = await d3.csv('data.csv')

  // Dimensions
  let dimensions = {
    width: 600,
    height: 600,
    margins: 10,
  };

  dimensions.ctrWidth = dimensions.width - dimensions.margins * 2
  dimensions.ctrHeight = dimensions.height - dimensions.margins * 2
  const radius = dimensions.ctrWidth / 2; //raggio della torta
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
  //In questo caso le scale ci servono per capire quanto è grossa una fetta della torta.
  const populationPie = d3.pie() //ritorna una funzione che organizza i dati in fette.
      .value((d) => d.value);//questa funzione dirà a d3.pie come accedere ai dati del dataset. in questo modo potrà capire come calcolare la grandezza delle fette.
  
  const slices = populationPie(dataset);  //le slices sono le fette della torta, indicate con angolo di start e angolo di end di ogni fetta.
  //ogni fetta ha un index che indica l'ordine di disegno,
                                          //i valori degli angoli sono misurati in radianti. 

  //Uso di una ORDINAL SCALE per associare un colore a ogni fetta
  
  const colors = d3.quantize((t)=>d3.interpolateSpectral(t), dataset.length) //la quantize ritorna un'array. Il primo parametro è una funzione, il secondo è il numero di volte che la funzione dev'essere chiamata.
  //La quantize passa alla funzione interpolateSpectral un parametro t, che sarà sempre compreso tra 0  e 1 e distribuito uniformemente il numero di volte indicato nel secondo parametro.
  //in questo modo otterremo un numero di colori uniformemente distribuiti.  
  const colorScale = d3.scaleOrdinal()  //questa funzione fornisce una scala che associa valori discreti
        .domain(dataset.map(item => item.name)) //il domain sarà la prima colonna
        .range(colors);                                 //il range sarà una lista di colori fornita direttamente da d3(vedi pagina d3 su colors schema)
  //Disegno della torta 
  const arc = d3.arc() //funzione d3 che è in grado di disegnare un arco. 
      .outerRadius(radius) //Passiamo il valore del raggio alla funzione che disegna l'arco. 
       //L'arco sarà disegnato a partire dal centro del container, col raggio che gli abbiamo passato.
       .innerRadius(0)           //serve a fare un grafico a ciambella. 
  
  // Draw Shape
  const arcGroup = ctr.append('g') //disegnamo in un gruppo che posizioniamo al centro del container.
      .attr('transform', `translate(${dimensions.ctrHeight/2},${dimensions.ctrWidth/2})`)
    
  arcGroup.selectAll('path')  //associamo un path ad ogni slice, usando le solite funzioni data e join
      .data(slices)
      .join('path')
      .attr('d',arc) //il valore generato dalla funzione arc è accettato dal path element per generare la fetta
      .attr('fill',d => colorScale(d.data.name)) //il colore della fetta sarà assegnato a partire dalla scala dei colori creata prima.
  


    }

draw()