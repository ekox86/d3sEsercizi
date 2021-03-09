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



}
draw()