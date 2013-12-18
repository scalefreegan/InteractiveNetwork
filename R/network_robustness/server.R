library(igraph)
library(ENA)

reactiveAdjacencyMatrix <- function(func){
  reactive({
    
    to.r <- func()
    g <- to.r$g
    
    if (is.null(g)){
      return(list(names=character(), links=list(source=-1, target=-1)))
    }

    val <- get.adjacency(graph=g,sparse=F)
    rownames(val) <- seq(1,dim(val)[1]); colnames(val) <- seq(1,dim(val)[2])

    if (dim(val)[1]>5000) {
      ss <- order(degree(g),decreasing=T)[order(degree(g),decreasing=T)<=1000]
      val <- val[ss,ss]
    }
    
    #TODO: re-arrange columns if necessary
    if (!all(rownames(val) == colnames(val))){
      stop("Colnames and rownames of your matrix must be identical")
    }
    
    diag(val) <- 0
    
    #make the matrix symmetric
    #val <- symmetricize(val, method="avg")
    
    #now consider only the upper half of the matrix
    val[upper.tri(val)] <- 0
    
    conns <- cbind(source=row(val)[val>0]-1, target=col(val)[val>0]-1, weight=val[val>0])
    
    if (nrow(conns) == 0){
      conns <- list (source=-1, target=-1, weight=0)
    }

    # RUN SCORING FCNS
    if (to.r$run==T) {
      game.results <- do.call(rbind,lapply(seq(1,100), function(i){
        #print(i)
        g.mod <- g
        game.r <- list()
        # start by picking a random pair of nodes
        test.v <- sample(V(g.mod)$names,size=2)
        game.r$start.stop <- c()
        game.r$paths <- c()
        game.r$removed <- c()
        while(length(get.all.shortest.paths(g.mod,test.v[1],test.v[2])$res)>0) {
          #print(test.v)
          # you can still make the connection
          # record path 
          game.r$startstop <- c(game.r$start.stop,paste(test.v,collapse=" "))
          game.r$paths<-c(game.r$paths,
            paste(get.all.shortest.paths(g.mod,test.v[1],test.v[2])$res[[1]],collapse=" "))
          # ATTACK THE NETWORK
          node.removed <- sample(V(g.mod)$names,size=1)
          game.r$removed <- c(game.r$removed,node.removed)
          g.mod=g.mod-which(V(g.mod)$names==node.removed)
          # check to see if one of the nodes of interest was removed
          if (node.removed == test.v[1] || node.removed == test.v[2]) {
            break
          }
          if (class(try(get.all.shortest.paths(g.mod, test.v[1], test.v[2]),silent=T))=="try-error") {
            break
          }
        }
        return(do.call(cbind,game.r))
      }))
    }
    if (to.r$run==T) {
      return(list(names=rownames(val), links=conns, game=game.results))
      } else {
        return(list(names=rownames(val), links=conns))
      }
    
  })

}

shinyServer(function(input, output) {

  makeGraph <- reactive({
    
    # generate graph

    if (input$method == "g_powerlaw") {
        g <- barabasi.game (n=input$n_nodes,directed=F)
        V(g)$names <- seq(1,length(V(g)))
      } else if (input$method == "g_random") {
        #g.tmp <- barabasi.game (n=input$n_nodes)
        g<-erdos.renyi.game(n=input$n_nodes,p.or.m=1/input$n_nodes,directed=F)
        V(g)$names <- seq(1,length(V(g)))
      }
    to.r <- list()
    to.r$g <- g
    to.r$run <- input$run
    return(to.r)
  })
  
  output$mainnet <- reactiveAdjacencyMatrix(function() {
     makeGraph()
   })
  output$plots <- renderPlot({
    g <- makeGraph()
    layout(matrix(seq(1,4),nrow=2,ncol=2))
    # plot degree dist
    dd <- degree.distribution(g); names(dd) <- seq(0,length(dd)-1)
    barplot(dd,ylab="Fraction",xlab="Degree",main="Degree Distribution",ylim=c(0,1))
    # plot betweenness centrality
    bc.tmp <- hist(betweenness(g), 20,plot=F)
    bc <- bc.tmp$counts/sum(bc.tmp$counts); names(bc) <- bc.tmp$mids
    barplot(bc,ylab="Fraction",xlab="Betweeness", main="Betweenness Centrality Distribution",ylim=c(0,1))
    })
  output$whole_graph <- renderPlot({
    g <- makeGraph()
    if (input$n_nodes>1000) {
      plot(g,vertex.label=NA,vertex.size=50*(100/length(V(g))),layout=layout.drl,edge.curved=T,edge.arrow.size=0,
        margin=c(0,-.99,0,-.99))
      } else {
        plot(g,vertex.label=NA,vertex.size=25*(100/length(V(g))),layout=layout.spring,edge.curved=T,edge.arrow.size=0,
          margin=c(0,-.5,0,-.5))
      }
    
    })
})
