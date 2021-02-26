async function getData() {
//const data = await d3.json('data.json').then((data)=> {
   const data = await d3.csv('data.csv').then((data)=> { 
    console.log(data)

});
}
getData();