reactiveNetwork <- function (outputId) 
{
  HTML(paste("<div id=\"", outputId, "\" class=\"shiny-network-output\"><svg /></div>", sep=""))
}


googleAnalytics <- function(account="UA-36850640-1"){
  HTML(paste("<script type=\"text/javascript\">

    var _gaq = _gaq || [];
  _gaq.push(['_setAccount', '",account,"']);
  _gaq.push(['_setDomainName', 'rstudio.com']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

  </script>", sep=""))
}

makeGraphTab <- function(){
  includeHTML("graph.js")
  reactiveNetwork(outputId = "mainnet")
  #googleAnalytics())
}

shinyUI(pageWithSidebar(    
  headerPanel("Robustness Challenge"),
  
  sidebarPanel(
          
    HTML("<hr />"),
    
    selectInput("method", "Method:",
                list("Power Law" = "g_powerlaw", 
                     "Random" = "g_random"
                     )),

    sliderInput(inputId = "n_nodes",
                label="Number of nodes:",
                min = 10, max = 5000, value = 100, step = 5),


	helpText("Use the sliders to set the number of nodes and connections which 
             will be displayed in the graph."),

	submitButton("Update"),
    
    HTML("<hr />"),
    helpText(HTML("Source available at <a href = \"https://github.com/scalefreegan/InteractiveNetwork/tree/experimental/R/network_robustness\">Github</a>"))
  ),
  
  
  mainPanel(
    includeHTML("graph.js"),
    tabsetPanel(
      tabPanel("Live",makeGraphTab()),
      tabPanel("Stats",plotOutput("plots")), 
      tabPanel("Your Graph",plotOutput("whole_graph"))  
    )
  )
  
  

))
