import React from 'react'
var d3 = require("d3")


export class ChannelsMonitor extends React.Component {

  constructor(args){
    super(args)

    this.state = {
      clkHostId: ''
    }

    this.handleClkAction      = this.handleClkAction.bind(this)

    this.apiCmd = {
      token:      window.localStorage.getItem('token'),
      getLinks:   'chanlink_get',
      getGroups:  'hostgroup_get'
    }









    // Grapf ----------------------------------------------
    this.forceDirectedGraph = (layer, socket) => {
      // https://bl.ocks.org/mbostock/4062045
      var self = this

      // Сюда рисуем кругляши
      var svg = {}
      var graph = {nodes: [], links: []}



      svg = d3.select(this.node)
      var width = +svg.attr("width")
      var height = +svg.attr("height")

      svg.selectAll("*").remove()

      var color = d3.scaleOrdinal(d3.schemeCategory20);

      var simulation = d3.forceSimulation()
          .force("link", d3.forceLink().distance(100).strength(0.5).id(function(d) { return d.id; }))
          .force("charge", d3.forceManyBody())
          .force("center", d3.forceCenter(width / 2, height / 2));

      function dragstarted(d) {
        //self.setState({clkHostId: d.id})
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      // get Groups
      var drawSvgContent = () => {
        //var groupsObj = {}
        //this.props.swgClient.apis.Configuration[this.apiCmd.getGroups]({token: this.apiCmd.token})
        //.then((res) => {
        //  if (res.status === 200) {
        //    res.body.map((row, i) => {
        //      groupsObj[row.groupid] = {'name': row.name, 'color': color(i)}
        //    })
        //    drawLinks(groupsObj)
        //  }
        //  else {
        //    console.log(res.body)
        //  }
        //})
        //drawLinks(groupsObj)
        drawLinks()
      }

      // Get Nodes and Links
      var drawLinks = () => {
        this.props.swgClient.apis.Data[this.apiCmd.getLinks]({token: this.apiCmd.token, layer: layer })
        .then((res) => {
          if (res.status === 200) {
            
            // Data for D3 draw
            graph = {nodes: [], links: []}
            // HASH: group names
            var groupsObj = {}


            res.body.nodes.map((row, i) => { groupsObj[row.group] = {name: row.group, color: '', number: 0} })
            res.body.nodes.map((row, i) => { groupsObj[row.group].number = groupsObj[row.group].number + 1 })
            var colorOfGroup = 0
            for (let key in groupsObj) { groupsObj[key].color = color(colorOfGroup++) }


            graph = res.body

            var link = svg.append("g")
                .attr("class", "links")
              .selectAll("line")
              .data(graph.links)
              .enter().append("line")
                .attr("stroke-width", function(d) { return Math.sqrt(d.value); })

            var node = svg.append("g")
                .attr("class", "nodes")
              .selectAll("circle")
              .data(graph.nodes)
              .enter().append("circle")
                .attr("id", function(d) { return 'id'+d.idChannel.replace(/[\-\.]/gi, '_') })
                .attr("r", function(d) { return d.size })
                .attr("fill", function(d) { return groupsObj[d.group].color })
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))

            node.append("title")
              .text(function(d) { return d.idChannel })


            var ttt = svg.append("g")
                .attr("class", "texts")
              .selectAll("text")
              .data(graph.nodes)
              .enter().append("text")
                .attr("id", function(d) { return 'idt'+d.idChannel.replace(/[\-\.]/gi, '_') })
                .attr("fill", function(d) { return groupsObj[d.group].color })
                .text(function(d) { return d.id })

            // Legend
            var topPx = 20
            for (let key in groupsObj) {
              svg.append("text")
                  .attr("class", "texts")
                  .attr("fill", function(d) { return groupsObj[key].color })
                  .attr("x", "5px")
                  .attr("y", topPx+"px")
                  .text(groupsObj[key].name + ' (' + groupsObj[key].number + ' шт.)')
              topPx = topPx + 12
            }

            // go go go
            simulation
                .nodes(graph.nodes)
                .on("tick", ticked);

            simulation.force("link")
                .links(graph.links);

            function ticked() {
              link
                  .attr("x1", function(d) { return d.source.x; })
                  .attr("y1", function(d) { return d.source.y; })
                  .attr("x2", function(d) { return d.target.x; })
                  .attr("y2", function(d) { return d.target.y; })
  
              node
                  .attr("cx", function(d) { return d.x; })
                  .attr("cy", function(d) { return d.y; })
  
              ttt
                  .attr("x", function(d) { return d.x-2; })
                  .attr("y", function(d) { return d.y-10; })
            }

          }
          else {
            console.log(res.body)
          }

        })
      }

      drawSvgContent()

      socket.onmessage = (event) => {
  
        if (event.data) {
          var wsResData = JSON.parse(event.data)
          console.log(wsResData)

          if (wsResData.type === 'StasisEnd') {
            let chanIdReplaced = wsResData.channel.id.replace(/[\-\.]/gi, '_')
            svg.select('#id'+chanIdReplaced).attr("fill","#000000")
            svg.select('#idt'+chanIdReplaced).attr("fill","#000000")
          }
        }

      }
  

    }

  }




  handleClkAction(event) {
    this.forceDirectedGraph(event.target.value, this.props.wsClient)
  }




  render() {
    console.log('ChannelsMonitor render')

    var finalTemplate =
    <div className='channelsmonitor-win'>
      <pre className='std-item-header'>{this.props.headerTxt}</pre>

      <pre> 
        <button className='get-bttn' onClick={this.handleClkAction} value='Refrash'>Refrash</button>
      </pre>

      <svg ref={node => this.node = node} width={640} height={480}></svg>
    </div>

    return finalTemplate

  }

}
