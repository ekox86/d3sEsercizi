async function draw() {
  // Data
  const dataset = await d3.csv('data.csv',(d,index,columns) => { //index è l'indice della riga, columns è la lista delle colonne
    d3.autoType(d)  //questa funzione individua automaticamente il tipo di dato. Non è sempre perfetta, da testare il dato ricavato
    d.total = d3.sum(columns, (c) => d[c])  //in questo modo otteniamo per ogni riga il valore totale, sommando tutte le colonne
    return d
  })
  dataset.sort((a,b) => b.total - a.total)  //ordiniamo i dati dal più grande al più piccolo

  //console.log(dataset)
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
  const stackGenerator = d3.stack() //la funzione stack generator organizza i dati in base a un array di chiavi passato come parametro
      .keys(dataset.columns.slice(1))   //usiamo la slice function perchè dobbiamo escludere la prima colonna 
  const stackData = stackGenerator(dataset) //generiamo i dati che saranno usati per disegnare lo stacked bar chart. Otterremo 9 array(uno per ogni colonna), ognuno dei quali conterrà 52 sottoarray
                      .map((ageGroup) => {        //L'aggiunta di map permette di aggiungere il nome del gruppo di età
                        ageGroup.forEach((state) => { // su ogni sottoarray da 52 elementi dei 9 ottenuti.
                          state.key = ageGroup.key
                        })
                        return ageGroup
                      })
  //console.log(stackData)   //genera un'array con 9 elementi (uno per colonna),organizzato per rendere più facile la generazione del chart. 
  const yScale = d3.scaleLinear()
                      .domain([
                        0, d3.max(stackData,(ageGroup) =>{
                          return d3.max(ageGroup,(state) => state[1])  //cerchiamo l'array con valore superiore più alto.
                        } )                      
                      ])
                      .rangeRound([dimensions.ctrHeight,dimensions.margins])     //Usiamo rangeround per arrotondare i valori in output dalla scala.
                      
  const xScale = d3.scaleBand() //la funzione bandScale converte dati discreti o categorie in numeri, ovvero dati continui. In pratica, se ho 7 categorie, bandScale ripartisce in maniera uniforme i 7 dati e aggiunge il padding necessario. 
      .domain(dataset.map((state)=>state.name)) //forniamo i nomi di tutti gli stati, usando il dataset originale. 
      .range([dimensions.margins, dimensions.ctrWidth])
      //.paddingInner(0.1)   //indica lo spazio da inserire tra una barra e l'altra. 0.1 corrisponde al 10% della larghezza
      //.paddingOuter(0.1)   //indica lo spazio da inserire tra le barre estreme e il bordo del grafico.
      .padding(0.1)       //fa la stessa cosa delle 2 funzioni commentate sopra.
  const colorScale = d3.scaleOrdinal()    //creiamo una scala per i colori, per le associazioni ai vari gruppi. 
      .domain(stackData.map((ag)=>ag.key))
      .range(d3.schemeSpectral[stackData.length])
      .unknown('#ccc')  //Unknown viene usata quando schemespectral non sa come mappare il colore al valore.
//DRAW THE BARS
  const ageGroups = ctr.append('g') //creiamo un gruppo per ogni gruppo d'età. Avremo quindi 9 gruppi, uno per ogni fascia d'età.
      .classed('age-groups',true)          
      .selectAll('g')
      .data(stackData)  //i dati questa volta sono annidati, dovremo prima associarli a un gruppo e poi fare il join vero e proprio con i rettangoli. 
      .join('g') 
      .attr('fill', d => colorScale(d.key)) 
      //l'attributo fill sarà dato al gruppo, e tutti i rettangoli del gruppo di età corrispondente lo erediteranno.
      //in questo modo, in ogni barra del grafico, i segmenti della stessa fascia d'età avranno lo stesso colore. 

  ageGroups.selectAll('rect')   //per ogni gruppo aggiungiamo i rettangoli prendendoli dal dato (gruppo di età) associato al <g> corrispondente. 
    .data((d) => d)
    .join('rect')
    .attr('x', d => xScale(d.data.name)) //la bandscale converte il nome dello stato nella coordinata corrispondente.
    .attr('y', d => yScale (d[1]))    //prendiamo la posizione di fine perchè le y vanno dall'alto verso il basso.
    .attr('width', xScale.bandwidth)    //la funzione bandwidth calcola automaticamente quanto ogni barra  
    .attr('height', d =>yScale(d[0]) - yScale(d[1]) )  //facciamo il minore meno il maggiore sempre perchè le y crescono dall'alto verso il basso. 
  
  //AXIS
  const xAxis = d3.axisBottom(xScale)
      .tickSizeOuter(0)  //Indico di non disegnare extra ticks agli estremi dell'asse.
  const xAxisGroup = ctr.append('g')
    .call(xAxis) 
    .style('transform',`translateY(${dimensions.ctrHeight}px)`)
  const yAxis = d3.axisLeft(yScale)
      .tickFormat(d3.format('~s'))  //formatto i valori grandi per scrivere k invece che 000 e M invece che 000000.
  const yAxisGroup = ctr.append('g')
      .call(yAxis)
      .style('transform',`translateX(${dimensions.margins}px)`)


  //ogni elemento di data ha un array di 2 posizioni con la posizione di inizio e la posizione di fine, in modo che sia semplice metterli uno sopra l'altro.
}
draw()