async function draw() {

    // Data 
    const dataset = await d3.json('data.json');

    const xAccessor = (d) => d.currently.humidity
    const yAccessor = (d) => d.currently.apparentTemperature

    //Dimensions
    let dimensions = {
        width: 800,
        height: 800,
        margin: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
        }
    }
    dimensions.ctrWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
    dimensions.ctrHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;
    //Draw Image
    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', dimensions.width)
        .attr('height', dimensions.height)
    const ctr = svg.append('g').
        attr('transform', `translate(${dimensions.margin.left},${dimensions.margin.top})`)
    
    const tooltip = d3.select('#tooltip')
    
    //Scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(dataset, xAccessor))
        .rangeRound([0, dimensions.ctrWidth]) //rangeRound arrotonda l'output
        .clamp(true) //clamp disabilita la visualizzazione di valori che sono fuori dal range visualizzabile
    
        //dato che le coordinate y vanno dall'alto verso il basso, bisogna invertire il senso dell range di output
    const yScale = d3.scaleLinear()
        .domain(d3.extent(dataset, yAccessor))
        .rangeRound([dimensions.ctrHeight,0]) //rangeRound arrotonda l'output
        .nice() //arrotonda l'input all'intero più vicino
        .clamp(true)
        //Draw Circles
    ctr.selectAll('circle')
        .data(dataset)
        .join('circle')
        .attr('cx', d => xScale(xAccessor(d)))
        .attr('cy', d => yScale(yAccessor(d)))
        .attr('r', 5)
        .attr('fill', 'red')
        .attr('data-temp',yAccessor)

         //Axes
    const xAxis = d3.axisBottom(xScale) //ritorna una funzione per disegnare un asse
        .ticks(5)  //Impostiamo il numero di ticks visualizzate, d3 non segue esattamente il parametro passato, ma approssima.
        //.tickValues([0.4,0.5,0.8]) //Indichiamo esplicitamente i ticks dell'asse orizzontale
        .tickFormat((d)=> d*100 +'%') //Formattiamo i ticks in percentuale. d è il singolo valore del tick.
        const xAxisGroup = ctr.append('g') //L'asse sarà disegnato in un altro elemento <g>
        .call(xAxis) //la funzione xAxis non può essere chiamata direttamente, serve chiamarla così
        .style('transform',`translateY(${dimensions.ctrHeight}px)`)
        .classed('axis',true) //Serve per dare una classe css all'elemento <g>
        
        xAxisGroup.append('text')    //permette di aggiungere testo dentro un SVG
        .attr('x',dimensions.ctrWidth/2)
        .attr('y',dimensions.margin.bottom-10)
        .attr('fill','black')
        .text('Humidity')
    
    const yAxis = d3.axisLeft(yScale);
    const yAxisGroup = ctr.append('g')
        .call(yAxis)
        .classed('axis',true)

        yAxisGroup.append('text')
            .attr('x',-dimensions.ctrHeight/2)
            .attr('y',-dimensions.margin.left +15)
            .attr('fill','black')
            .html('Temperature &deg; F') //serve per scrivere testo codificato come html
            .style('transform','rotate(270deg)')

            //Calcola le partizioni per la triangolazione di ogni punto dell'array. In pratica per ogni punto indica le aree nelle quali il punto considerato è il più vicino.
            //il secondo e il terzo parametro sono le funzioni di accesso della coordinata x e della y.
    const delaunay = d3.Delaunay.from(
        dataset,        
        (d) => xScale(xAccessor(d)),
        (d) => yScale(yAccessor(d))
        ) 
    //console.log(delaunay)
    const voronoi = delaunay.voronoi() //la funzione ritorna un oggetto che ha dei metodi per disegnare il diagramma di voronoi. https://it.wikipedia.org/wiki/Diagramma_di_Voronoi
    voronoi.xmax = dimensions.ctrWidth
    voronoi.ymax = dimensions.ctrHeight //impostiamo altezza e larghezza massime del diagramma.
    //console.log(voronoi)
    //Disegniamo il diagramma di voronoi in un nuovo gruppo svg
    ctr.append('g')
        .selectAll('path')
        .data(dataset)
        .join('path')
        //.attr('stroke','black')   //il path della partizione non sarà disegnato in realtà.
        .attr('fill','transparent') //il contenuto del path sarà trasparente, altrimenti non si vedono i punti, ma solo tutte le forme delle partizioni.
        .attr('d',(d,i)=>voronoi.renderCell(i)) //questa funzione ritorna le coordinate del path necessario per renderizzare la cella del diagramma.
        //gli eventi di mouseenter e leave sono associati al passaggio sulla partizione e non più al passaggio sul punto.
        .on('mouseenter', function(event,datum) {  //non usiamo una arrow function perchè useremo la parola chiave this, che indicherà il cerchio sul quale stiamo passando il mouse sopra.
            //console.log(datum)
            //creiamo un nuovo punto che viene disegnato quando passiamo sopra la partizione col mouse. 
            ctr.append('circle')    
                .classed('dot-hovered',true)
                .attr('fill', '#120078')
                .attr('r',8)
                .attr('cx', d => xScale(xAccessor(datum)))
                .attr('cy', d => yScale(yAccessor(datum)))
                .style('pointer-event', 'none') //in questo modo l'evento viene soppresso se il mouse si trova proprio sopra il cerchio.
            d3.select(this)     //selezioniamo la partizione sul quale si trova il mouse e ne cambiamo il colore
 
            tooltip.style('display','block')    //visualizziamo il tooltip
                .style('top', yScale(yAccessor(datum)) - 25 + "px")
                .style('left', xScale(xAccessor(datum)) + "px")
            const formatter = d3.format('.2f')  //creo una funzione per formattare i numeri con 2 cifre decimali che poi applicherò al testo che scrivo nel tooltip
            const dateFormatter = d3.timeFormat('%B-%d, %Y')    //creo una funzione per formattare le date, che applicherò al dato.
            tooltip.select('.metric-humidity span')
                .text(formatter(xAccessor(datum)))
            tooltip.select('.metric-temp span')
                .text(formatter(yAccessor(datum)))
            tooltip.select('.metric-date')
                .text(dateFormatter(datum.currently.time*1000))
        })
        //on mouse leave ripristiniamo il punto e nascondiamo il tooltip
        .on('mouseleave',function(event,datum){
            ctr.select(".dot-hovered").remove()            
            tooltip.style('display','none')

        })



}
draw()