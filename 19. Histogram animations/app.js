async function draw() {
  // Data
  const dataset = await d3.json('data.json')

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
  //definiamo in questa parte i gruppi svg in modo che poi d3 riesca a ricalcolarne il contenuto correttamente nella funzione histogram.
  const ctr = svg.append("g") // <g> il contenitore del grafico viene spostato a destra e in basso per avere margine.
    .attr(
      "transform",
      `translate(${dimensions.margins}, ${dimensions.margins})`
    )
  const labelsGroup = ctr.append('g') //crea gli elementi group per le label di ogni barra.
    .classed('bar-labels', true)
  const xAxisGroup = ctr.append('g')
    .style('transform', `translateY(${dimensions.ctrHeight}px)`)   //Posiziona il gruppo con l'asse orizontale in basso.

  function histogram(metric) {
    const xAccessor = d => d.currently[metric] //prendiamo la metrica passata come parametro
    const yAccessor = d => d.length //prendo la lunghezza dell'array del bin
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
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(newDataset, yAccessor)]) //Il dominio di ingresso va da 0 al valore di frequenza più alto
      .range([dimensions.ctrHeight, 0])//al solito, prima il valore più alto perchè la y va dall'alto verso il basso NB: il parametro è un array di 2 elementi
      .nice() //arrotonda i valori del dominio

    const exitTransition = d3.transition().duration(1000) //memorizziamo la transizione di uscita dei rettangoli per aspettare che essa sia terminata quando facciamo partire quella di 
                                           //ingresso degl altri rettangoli (quando si switcha la metrica.)
    const updateTransition = exitTransition.transition().duration(1000) //In questo modo updateTransition sarà eseguito dopo exitTransition perchè avrà un id più alto
    //Draw bars
    const padding = 1 //distanza tra i rettangoli
    const temp = ctr.selectAll('rect')
      .data(newDataset)

      //per gestire le animazioni correttamente, bisogna fare override del comportamento della funzione di join, gestendo separatamente
      //la enter selection (ovvero gli elementi che verranno aggiunti all'svg)
      //la update selection (ovvero gli elementi che verranno aggiornati all'svg)
      //la exit selection (ovvero gli elementi che verranno rimossi dall'svg)
      .join(
          //ogni rettangolo che verrà aggiunto sarà già posizionato correttamente ma di altezza zero. Quando verrà aggiornato nella update, crescerà dal basso verso l'alto.
          (enter) => enter.append('rect')
          .attr('width', d => d3.max([0, xScale(d.x1) - xScale(d.x0) - padding])) 
          .attr('height',0) 
          .attr('x', d => xScale(d.x0))  
          .attr('y', dimensions.ctrHeight)
          .attr('fill', '#01c5c4'),

          (update) => update,
          //sulla selezione di uscita, cioè sui rettangoli che vengono rimossi, aggiungizmo una transizione per far vedere i rettangoli che si riducono prima di essere rimossi
          (exit) => exit.transition(exitTransition)
            .attr('y',dimensions.ctrHeight)
            .attr('height',0)
            .remove()
      )

      .transition(updateTransition)     //passiamo alla transition  la funzione che verrà eseguita per animare il disegno dei rettangoli 
                        //l'oggetto selection ritornato da transition è diverso dagli altri selection; i metodi attr ad esempio sono fatti per l'animazione.
                        //l'oggetto transition animerà le proprietà che sono state cambiate
      //.duration(3000)   //di default la transizione dura 0.25 s, duration(time) setta la durata della transizione in millisecondi
      .attr('width', d => d3.max([0, xScale(d.x1) - xScale(d.x0) - padding])) //calcoliamo la larghezza del rettangolo usando i valori scalati dei confini dei bin
      .attr('height', d => dimensions.ctrHeight - yScale(yAccessor(d)))  //l'altezza del rettangolo è data dall'altezza complessiva meno quella scalata, dato che la y viene calcolata in maniera inversa
      .attr('x', d => xScale(d.x0))  //usiamo il valore x0 del bin, cioè il valore inferiore del bin
      .attr('y', d => yScale(yAccessor(d))) //il rettangolo viene disegnato a partire dall'angolo in alto a sinistra
      .attr('fill', '#01c5c4')

    //Draw Axis 
    const xAxis = d3.axisBottom(xScale)     //Crea la funzione che genera l'asse

    xAxisGroup.transition()
      .call(xAxis)                  //Applica all'elemento group la funzione che genera l'asse
    //Labels 
    labelsGroup.selectAll('text')     //crea gli elementi group per le label di ogni barra.
      .data(newDataset)
      .join('text')
      .transition()
      .attr('x', d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)  //Formula necessaria per posizionare la label al centro sopra la colonna.
      .attr('y', d => yScale(yAccessor(d)) - 10)   //la posizione della label è appena sopra la colonna, cioè in yAccessor, dove la colonna comincia a essere disegnata
      .text(d => d.length)
  }

  //Events listening
  d3.select("#metric")
    .on('change', function (e) {   //la on può essere collegata aogni selezione, e prende l'id e una callback come parametro.
      //il parametro e contiene informazioni sull'evento.

      e.preventDefault();     //evitiamo il comportamento di default sull'evento        
      histogram(this.value)   //eseguiamo la funzione histogram per cambiare la metrica dell'istogramma
      //console.log(this)     //stampa l'oggetto html selezionato.
    }
    )
  histogram('humidity') //Serve a chiamare la funzione la prima volta, altrimenti quando chiamo draw () non viene eseguita.
}

draw()