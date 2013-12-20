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

      var node_drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);

      function dragstart(d, i) {
          force.stop() // stops the force auto positioning before you start dragging
      }

      function dragmove(d, i) {
          d.px += d3.event.dx;
          d.py += d3.event.dy;
          d.x += d3.event.dx;
          d.y += d3.event.dy; 
          tick(); // this is the key to make it work together with updating both px,py,x,y on d !
      }

      function dragend(d, i) {
          d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
          tick();
          force.resume();
      }

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

        var node = svg.selectAll(".node")
         .data(force.nodes())
        .enter().append("circle")
        .attr("class", function(d) { return "node " + d.name; })
        //.on("click", click)
        //.on("dblclick", dblclick)
        .call(node_drag);

        var link = svg.selectAll(".link");


      function initializeNodes(n,callback) {
        nodes.splice(0,nodes.length);
        for (var i = 0; i < data.names.length; i++){
          nodes.push({"name": data.names[i]})
          }
        links.splice(0,links.length);
        for (var i = 0; i < data.links.length; i++){
          links.push({"source": (data.links[i].source), "target": (data.links[i].target)});
        }
        //console.log(data.game[0].startstop,data.game[0].removed);
        start(data.game[n].startstop.split(" ")[0],data.game[n].startstop.split(" ")[1],[],[]);
        callback();
      };
        
      function iterColor(x,callback) {
        // color node that is about to be destroyed
        console.log(data.game[x].startstop.split(" ")[0],data.game[x].startstop.split(" ")[1],data.game[x].paths.split(" "),data.game[x].removed);
        start(data.game[x].startstop.split(" ")[0],data.game[x].startstop.split(" ")[1],data.game[x].paths.split(" "),data.game[x].removed);
        callback();
      };

      function removeNode(x,callback) {
        //debugger;
        var id = data.game[x].removed;
        var id_list = [];
        for (var i = 0; i < nodes.length; i++) {
          id_list.push(nodes[i].name);
        }
        var id_rm = id_list.indexOf(id);
        nodes.splice(id_rm,1);

        var id = data.game[x].removed;
        var links_remove = [];
          for (var i = 0; i < links.length; i++){
            if (links[i].source.name == id ||  links[i].target.name == id) {
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
        //console.log(data.game[i].startstop);
        start(data.game[x].startstop.split(" ")[0],data.game[x].startstop.split(" ")[1],data.game[x].paths.split(" "),data.game[x].removed);
        callback();
      };
      

      // RUN STUFF
      var n = 0;
      setInterval(function(){
          if (n>0 && n<data.game.length) {
            // check to see if start.stop are the same
            // new start and stop
            // reload the graph
              iterColor(n,function() {
                  removeNode(n, function() {
                      if (data.game[n].startstop != data.game[n+1].startstop) {
                        var x = n+1;
                        initializeNodes(x, function() {});
                      }
                    });
                });
            } else if (n==0) {
            //console.debug(n);
            initializeNodes(n,function() {
                iterColor(n, function() {
                      removeNode(n, function() {
                      });
                  });
            });
          }
          n++;
      },10000);
      
      // n = 0;
      // setTimeout(function() { initializeNodes(n); },0);
      // setTimeout(function() { iterColor(n); },2000);
      // setTimeout(function() { removeNode(n); },5000);
      // n = n++;
      // alert(n);

      // setTimeout(function() { console.log("I did it!");iterColor(1); },2000);
      // setTimeout(function() { removeNode(1); },5000);
      
    


      function start(start,stop,path,remove) {
        
        link = link.data(force.links(), function(d) { return d.source.name + "-" + d.target.name; });
        link.enter().insert("line", ".node").attr("class", "link");
        link.exit().remove();

        // update
        //links = force.links();
        link 
          .style("stroke", function(links){
            //console.log(links.source.name);
            if( ( (path.indexOf(links.source.name) > - 1)  && (path.indexOf(links.target.name) > -1) ) ){
                //console.log(links.source.name,links.target.name);
                return '#ff0000';
              } else {
                return '#999';
              }
            })
          .style("stroke-width", function(links){
            //console.log(links.source.name);
            if( (path.indexOf(links.source.name) > - 1)  && (path.indexOf(links.target.name) > -1) ) {
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
        node.transition().duration(1000).delay(500)
          //.transition()
          //debugger;
          .attr("r", function(nodes){
            //console.log(d.name);
            if(nodes.name==remove){
              if (nodes.name==start) {
                return 15;
              } else {
                return 10;
              }
            } else if (nodes.name==stop) {
                return 15;
              } else if (nodes.name==start) {
                return 15;
              } else {
                return 5;
              }
            })
          //.transition()
          .style("fill", function(nodes){
            if(nodes.name==remove){
              return "orange";
            } else if (nodes.name==stop) {
                return "red";
              } else if (nodes.name==start) {
                return "blue";
              } else {
                return "black";
              }
            });
          


        force.start();
      };

      function tick(){
        //force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
        
        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        // node.attr("cx", function(d) { return d.x; })
        //     .attr("cy", function(d) { return d.y; })
        //     .attr("px", function(d) { return d.x; })
        //     .attr("py", function(d) { return d.y; });
      };

    }
  });
  Shiny.outputBindings.register(networkOutputBinding, 'abrooks.networkbinding');
  </script>
