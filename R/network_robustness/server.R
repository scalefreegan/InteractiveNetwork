library(igraph)
library(ENA)

reactiveAdjacencyMatrix <- function(func){
  reactive(function(){
    
    val <- func()
    
    if (is.null(val)){
      return(list(names=character(), links=list(source=-1, target=-1)))
    }
    
    #TODO: re-arrange columns if necessary
    if (!all(rownames(val) == colnames(val))){
      stop("Colnames and rownames of your matrix must be identical")
    }
    
    diag(val) <- 0
    
    #make the matrix symmetric
    val <- symmetricize(val, method="avg")
    
    #now consider only the upper half of the matrix
    val[lower.tri(val)] <- 0
    
    conns <- cbind(source=row(val)[val>0]-1, target=col(val)[val>0]-1, weight=val[val>0])
    
    if (nrow(conns) == 0){
      conns <- list (source=-1, target=-1, weight=0)
    }
    
    list(names=rownames(val), links=conns)
    
  })

}

shinyServer(function(input, output) {

  data <- reactive(function(){
    
    # generate graph

    if (input$method == "g_powerlaw") {
        g <- barabasi.game (n=input$n_nodes)
      } else if (input$method == "g_random") {
        g.tmp <- barabasi.game (n=input$n_nodes)
        g<-erdos.renyi.game(n=input$n_nodes,p.or.m=ecount(g.tmp),type="gnm")
      }
    # make adjacency
    data <- get.adjacency(graph=g,sparse=F)
    rownames(data) <- seq(1,dim(data)[1]); colnames(data) <- seq(1,dim(data)[2])
  
    data
  })
  
  output$mainnet <- reactiveAdjacencyMatrix(function() {
    
    net <- data()
    
    net

  })
})
