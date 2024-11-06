import define1 from "./e76d2c695f356743@745.js";

function _1(md){return(
md`md\`#header\``
)}

function _d3(require){return(
require("d3@6")
)}

function _selectedPapers(navio,papers){return(
navio(papers)
)}

function _papers(FileAttachment){return(
FileAttachment("csvjson-2.json").json()
)}

function _opacity(d3,network){return(
d3.scaleLinear()
.domain(d3.extent(network.links, d=> d.value))
.range([0.1,1])
)}

function _size(d3,network){return(
d3.scaleLinear()
.domain(d3.extent(network.nodes, d=> d.value))
.range([4,18])
)}

function _color(d3){return(
d3.scaleOrdinal(d3.schemeCategory10)
)}

function _9(network,d3,opacity,size,color,forceBoundary,drag,invalidation)
{
  const width = 600;
  const height = 600;
  const nodes = network.nodes.map(d => ({...d})),
    links = network.links.map(l => ({source: l.source.id, target: l.target.id, value: l.value}));
  
  const svg = d3.create("svg").attr("viewBox", [0,0,width,height])

  const lines = svg
    .selectAll("line")
    .data(links)
    .join("line")
    .style("stroke", "#333")
    .style("stroke-opacity", l=>opacity(l.value));
  
  /*const circles = svg
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", 3);
  */
  
  const text = svg
    .selectAll("text")
    .data(nodes)
    .join("text")
    .attr("fill", "#333")
    .style("font-size", d=>size(d.value) + "pt")
    .style("fill", d=>color(d.cluster))
    .text(d=>d.id);
  
  const ticked = () => {
    lines.attr("x1", l => l.source.x).attr("y1", l=>l.source.y)
      .attr("x2", l => l.target.x).attr("y2", l=>l.target.y);
    //circles.attr("cx", d => d.x).attr("cy", d=>d.y);
    text.attr("x", d => d.x).attr("y", d=>d.y);

  }


  const simulation = d3
    .forceSimulation(nodes)
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width/2, height/2))
    .force("link",d3.forceLink(links).id(d=>d.id))
    .force("boundary", forceBoundary(3,3, width, height))
    .on("tick", ticked);

  text.call(drag(simulation));
  invalidation.then(()=> simulation.stop());
  
  return svg.node()
}


function _drag(d3){return(
simulation => {
  function dragstarted(event) {
    if(!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event){
    if(!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end",dragended);  
}
)}

function _network(selectedPapers,getKeyByValue,getKey,findOrAdd,netClustering)
{
   const dLinks = new Map();
  //Find authors that published in 2023
  const recentAuthors = selectedPapers
    .filter(paper => paper.Year === 2023)
    .map(paper => paper.AuthorNames.split(";"))
    .flat();
  
  
  // Count occurrences of each author
  const authorFreq = new Map();
  for (let paper of selectedPapers) {
    const authors = paper.AuthorNames.split(";");
  
    for (let author of authors) {
      // Check if the author is in recentAuthors
      if (recentAuthors.includes(author)) {
        if (!authorFreq.has(author)) {
          authorFreq.set(author, 0);
        }
        authorFreq.set(author, authorFreq.get(author) + 1);
      }
    }
  }
  
  const values = Array.from(authorFreq.values());
  const max = Math.max(...values);
  
  const authorToSortFor = getKeyByValue(authorFreq, max);
  const paperToSort = selectedPapers.filter(paper=> paper.AuthorNames.toLowerCase().includes(authorToSortFor.toLowerCase()))

  /* This code create a new array that only contains papers in paperToSort that include authors that
haven't published in 2023 (except for the authorToSortFor).
  let cleanArray = [...paperToSort];
  for(let paper of paperToSort){
    const authors = paper.AuthorNames.split(";")
    for(let author of authors){
      if(recentAuthors.includes(author) && author !== authorToSortFor){
        const index = cleanArray.indexOf(paper);
        cleanArray.splice(index, 1);
        break;
      }
    }
  }
  */


  //Filter papers from past 30 years that only include this most-relevant author
   for (let t of paperToSort) {
    let authornames = t.AuthorNames.split(";")
    for (let i = 0; i < authornames.length; i++) {
      for (let j = i + 1; j < authornames.length; j++) {
        const key = getKey(
          authornames[i],
          authornames[j]
        );
        if (!dLinks.has(key)) dLinks.set(key, 0);

        dLinks.set(key, dLinks.get(key) + 1);
      }
    }
  }
   const dNodes = new Map();
   let links = [];
   for(let [l,v] of dLinks){
     const [source, target] = l.split("~");

     const s = findOrAdd(dNodes, source);
     const t = findOrAdd(dNodes, target);

     dNodes.set(source, ((s.value+=1), s));
     dNodes.set(target, ((t.value+=1), t));
     links.push({source: s, target: t, value: v});
   }
   const network = {nodes: Array.from(dNodes.values()), links};
   netClustering.cluster(network.nodes, network.links);
   return network;
 }


function _getKeyByValue(){return(
(map, value) => {
    for (let [key, val] of map.entries()) {
      if (val === value) {
        return key;
      }
    }
    return null; 
  }
)}

function _style(html){return(
html`<style>svg text {font-family: sans-serif; 
text-anchor: middle; 
cursor: pointer;}`
)}

function _findOrAdd(){return(
(dNodes, n) => {
  if(!dNodes.has(n)) dNodes.set(n, {id: n, value: 0});
  return dNodes.get(n)
}
)}

function _getKey(){return(
(a,b) => (a >= b ? `${a}~${b}` : `${b}~${a}`)
)}

function _forceBoundary(require){return(
require("d3-force-boundary")
)}

function _netClustering(require){return(
require("netclustering")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["csvjson-2.json", {url: new URL("./files/1f0cdb312dbfea430872bc65a7edb939d4e264193bca8d422c76243430f2788caee2bcc065f1e8b3a19a7ee24d90519ff82edd010560e97bd15af839723fe99b.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  const child1 = runtime.module(define1);
  main.import("navio", child1);
  main.variable(observer("viewof selectedPapers")).define("viewof selectedPapers", ["navio","papers"], _selectedPapers);
  main.variable(observer("selectedPapers")).define("selectedPapers", ["Generators", "viewof selectedPapers"], (G, _) => G.input(_));
  main.variable(observer("papers")).define("papers", ["FileAttachment"], _papers);
  main.variable(observer("opacity")).define("opacity", ["d3","network"], _opacity);
  main.variable(observer("size")).define("size", ["d3","network"], _size);
  main.variable(observer("color")).define("color", ["d3"], _color);
  main.variable(observer()).define(["network","d3","opacity","size","color","forceBoundary","drag","invalidation"], _9);
  main.variable(observer("drag")).define("drag", ["d3"], _drag);
  main.variable(observer("network")).define("network", ["selectedPapers","getKeyByValue","getKey","findOrAdd","netClustering"], _network);
  main.variable(observer("getKeyByValue")).define("getKeyByValue", _getKeyByValue);
  main.variable(observer("style")).define("style", ["html"], _style);
  main.variable(observer("findOrAdd")).define("findOrAdd", _findOrAdd);
  main.variable(observer("getKey")).define("getKey", _getKey);
  main.variable(observer("forceBoundary")).define("forceBoundary", ["require"], _forceBoundary);
  main.variable(observer("netClustering")).define("netClustering", ["require"], _netClustering);
  return main;
}
