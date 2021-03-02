//Definisco i dati in input
const slices = [100, 200, 300, 400, 500]

//Scegliamo una scala lineare in questo caso, ma d3 ha anche altre funzioni di scalatura.
const scale = d3.scaleLinear()
  //.domain([d3.min(slices), d3.max(slices)]) //domain definisce min e max di input della scala.
  .domain(d3.extent(slices))                  //extent prende automaticamente il minimo e il massimo dell'array
  .range([10, 350])                           //range è l'output della funzione di scala. 

  console.log(scale(100)) //print 10
  console.log(scale(500)) //print 350
  console.log(scale(300)) //print 180
