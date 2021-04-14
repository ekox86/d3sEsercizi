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
      .value((d) => d.value)//questa funzione dirà a d3.pie come accedere ai dati del dataset. in questo modo potrà capire come calcolare la grandezza delle fette.
      .sort(null);            //di default i dati vengono ordinati in base al valore passato. Possiamo scegliere di non riordinarli o di ordinarli in base a un altro criterio. 
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
  
  const arcLabels = d3.arc()  //questa funzione arco serve per posizionare le labels
      .outerRadius(radius)    // ai bordi del grafico a torta. Useremo infatti poi la funzione arc.centroid
      .innerRadius(200)       // per mettere le labels a metà della distanza dal centro.
  // Draw Shape
  const arcGroup = ctr.append('g') //disegnamo in un gruppo che posizioniamo al centro del container.
      .attr('transform', `translate(${dimensions.ctrHeight/2},${dimensions.ctrWidth/2})`)
    
  arcGroup.selectAll('path')  //associamo un path ad ogni slice, usando le solite funzioni data e join
      .data(slices)
      .join('path')
      .attr('d',arc) //il valore generato dalla funzione arc è accettato dal path element per generare la fetta
      .attr('fill',d => colorScale(d.data.name)) //il colore della fetta sarà assegnato a partire dalla scala dei colori creata prima.
  //Labels
  const labelsGroup = ctr.append('g') //il gruppo sarà al centro ma le label saranno posizionate relativamente al centro
      .attr('transform',`translate(${dimensions.ctrHeight/2},${dimensions.ctrWidth/2})`)
      .classed('labels',true)
      
      labelsGroup.selectAll('text')
        .data(slices)
        .join('text')
        .attr('transform',(d) => `translate(${arcLabels.centroid(d)})`) //il centroid ritorna le coordinate x, y del centro dell'arco, cioè a metà srada tra il centro e la circoferenza.
        .call( text => text.append('tspan') 
                        .style('font-weight','bold') 
                        .attr('y',-4)
                        .text(d=>d.data.name) //spostiamo in alto il nome del dato
            )                 //la call permette di eseguire una funzione sulla selezione originale senza cambiare la selezione che viene ritornata.
        .call( text => text.filter((d) => (d.endAngle - d.startAngle) > 0.25)      //filter ritorna una nuova d3selection filtrata secondo la funzione passata com parametro
                                                                                  //In questo caso, il valore viene mostrato solo negli spicchi più larghi di un certo angolo. 
                        .append('tspan') 
                        .attr('y',9)        //spostiamo in basso il valore del dato. 
                        .attr('x',0)        // resettiamo a 0 la coordinata per allinearla con quella dello span col nome
                        .text(d=>d.data.value)
        )
        
    }

draw()