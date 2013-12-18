<style>

.node {
  stroke: 'black';
  stroke-width: 1.5px;
}

.link {
  stroke: '#999';
  //stroke: #ff0000;
  stroke-opacity: .6;
}

</style>

<script src="http://d3js.org/d3.v2.js"></script>
<script type="text/javascript">var networkOutputBinding = new Shiny.OutputBinding();
  $.extend(networkOutputBinding, {
    find: function(scope) {
      return $(scope).find('.shiny-network-output');
    },
    renderValue: function(el, data) {
      
      var width = 800;
      var height = 600;

      nodes = [];
      links = [];

      var force = d3.layout.force()
          .nodes(nodes)
          .links(links)
          .charge(-(100*(100/data.names.length)))
          .linkDistance(10*(100/data.names.length)) 
          .theta(0.8)
          //.gravity(.15)      
          .size([width, height])
          .on("tick", tick);

      //remove the old graph
        var svg = d3.select(el).select("svg");      
        svg.remove();
        
        $(el).html("");
        
        //append a new one
        svg = d3.select(el).append("svg")
          .attr("width", width)
          .attr("height", height);

         // var mySquare=svg.append("rect")
         //  .attr("x",0)
         //  .attr("y",0)
         //  .attr("width",60)
         //  .attr("height",60);

        node = svg.selectAll(".node");
        link = svg.selectAll(".link");


      function initializeNodes(n) {
          nodes.splice(0,nodes.length);
          for (var i = 0; i < data.names.length; i++){
            nodes.push({"name": data.names[i]})
            }
          return(nodes);
        };

      function initializeLinks(n) {
          links.splice(0,links.length);
          for (var i = 0; i < data.links.length; i++){
            links.push({"source": data.links[i].source, "target": data.links[i].target, "weight": data.links[i].weight})
          }
          //console.log(data.game[0].startstop,data.game[0].removed);
          return(links);
        };
      function initializeGraph(n) {
          start(data.game[n].startstop.split(" ")[0],data.game[n].startstop.split(" ")[1],[],[]);
      };
          
      function iterColor(x) {
        // color node that is about to be destroyed
        console.log(data.game[x].startstop.split(" ")[0],data.game[x].startstop.split(" ")[1],data.game[x].paths.split(" "),data.game[x].removed);
        start(data.game[x].startstop.split(" ")[0],data.game[x].startstop.split(" ")[1],data.game[x].paths.split(" "),data.game[x].removed);
      };

      function removeNode(x) {
        var id = data.game[x].removed;
        var id_list = [];
        for (var i = 0; i < nodes.length; i++) {
          id_list.push(nodes[i].name);
        }
        var id_rm = id_list.indexOf(id);
        nodes.splice(id_rm,1);
        //return nodes;
      }

      function removeNodeLinks(x) {
        var id = data.game[x].removed;
        var links_remove = [];
          for (var i = 0; i < links.length; i++){
            if (links[i].source == id-1 ||  links[i].target == id-1) {
              links_remove.push(i);
            }
          }
          var i=0, L=links_remove.length;
          links_remove.sort(function(a,b){return b-a});
          while(i < L){
            links.splice(links_remove[i],1);
            i++;
          }
        //return links;
      }

      function iterRemove(x) {
        //console.log(data.game[i].startstop);
        start(data.game[x].startstop.split(" ")[0],data.game[x].startstop.split(" ")[1],data.game[x].paths.split(" "),data.game[x].removed);
      };
        
      // // RUN STUFF
      var n = 0;
      // setInterval(function(){
      //     console.debug(n)
      //     if (n>0) {
      //       // check to see if start.stop are the same
      //       if (data.game[n].startstop == data.game[n-1].startstop) {
      //         // same start and stop
      //         setTimeout(function() { iterColor(n); },2000);
      //         nodes = removeNode(n);
      //         links = removeNodeLinks(n);
      //         setTimeout(function() { iterRemove(n); },2000);
      //       } else {
      //         // new start and stop
      //         // reload the graph
      //         //console.debug(n);
      //         nodes = initializeNodes(n);
      //         links = initializeLinks(n);
      //         setTimeout(function() { initializeGraph(n); },0);
      //         setTimeout(function() { iterColor(n); },2000);
      //         nodes = removeNode(n);
      //         links = removeNodeLinks(n);
      //         setTimeout(function() { iterRemove(n); },2000);
      //       }
      //     } else {
      //       //console.debug(n);
      //       nodes = initializeNodes(n);
      //       links = initializeLinks(n);
      //       setTimeout(function() { initializeGraph(n); },0);
      //       setTimeout(function() { iterColor(n); },2000);
      //       nodes = removeNode(n);
      //       links = removeNodeLinks(n);
      //       setTimeout(function() { iterRemove(n); },2000);
      //     }
      //     n++;
      // },2000);
      
      nodes = initializeNodes(n);
      links = initializeLinks(n);
      setTimeout(function() { initializeGraph(n); },0);
      setTimeout(function() { iterColor(n); },2000);
      debugger;
      removeNode(n);
      //removeNodeLinks(n);
      //setTimeout(function() { iterRemove(n); },2000);


      function start(start,stop,path,remove) {
        
        link = link.data(force.links(), function(d) { return d.source + "-" + d.target; });
        link.enter().insert("line", ".node").attr("class", "link");
        link.exit().remove();

        // update
        //links = force.links();
        link 
          .style("stroke", function(links){
            //console.log(links.source.name);
            if( (path.indexOf(links.source) > - 1  && path.indexOf(links.target) > -1) ) {
                console.log(links.source,links.target);
                return '#ff0000';
              } else {
                return '#999';
              }
            })
          .style("stroke-width", function(links){
            //console.log(links.source.name);
            if( path.indexOf(links.source) > - 1  && path.indexOf(links.target) > -1) {
              return '3';
              } else {
                return '1.5';
              }
            });
        //debugger;
        node = node.data(force.nodes(), function(d) { return d.name;});
        node.enter().append("circle").attr("class", function(d) { return "node " + d.name; });
        node.exit().remove();

        // update
        node
          //.transition()
          //debugger;
          .attr("r", function(nodes){
            //console.log(d.name);
            if(nodes.name==start){
              return 15;
            } else if (nodes.name==stop) {
                return 15;
              } else if (nodes.name==remove) {
                return 10;
              } else {
                return 5;
              }
            })
          //.transition()
          .style("fill", function(nodes){
            if(nodes.name==start){
              return "blue";
            } else if (nodes.name==stop) {
                return "red";
              } else if (nodes.name==remove) {
                return "orange";
              } else {
                return "black";
              }
            })
          .call(force.drag)
          .append("title")
          .text(function(nodes) { return nodes.name; });
          

          //debugger;


        force.start();
      };

      function tick(){
        //force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
    
        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
      };

    }
  });
  Shiny.outputBindings.register(networkOutputBinding, 'abrooks.networkbinding');
  </script>
