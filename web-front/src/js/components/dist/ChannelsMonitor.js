'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChannelsMonitor = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var d3 = require("d3");

var ChannelsMonitor = exports.ChannelsMonitor = function (_React$Component) {
  _inherits(ChannelsMonitor, _React$Component);

  function ChannelsMonitor(args) {
    _classCallCheck(this, ChannelsMonitor);

    var _this = _possibleConstructorReturn(this, (ChannelsMonitor.__proto__ || Object.getPrototypeOf(ChannelsMonitor)).call(this, args));

    _this.state = {
      clkHostId: ''
    };

    _this.handleClkAction = _this.handleClkAction.bind(_this);

    _this.apiCmd = {
      token: window.localStorage.getItem('token'),
      getLinks: 'chanlink_get',
      getGroups: 'hostgroup_get'

      // Сюда рисуем кругляши
    };var svg = {};
    var graph = { nodes: [], links: []

      // WebSoket Response (recieved text message -> event.data)
    };var wsResData = {};

    var cxNewChan = 140;
    var cyNewChan = 30;

    var socket_onmessage = function socket_onmessage(event) {

      if (event.data) {
        wsResData = JSON.parse(event.data);
        console.log(wsResData);
      }

      // Воздействие на swg
      if (svg) {

        if (wsResData.type === 'StasisEnd') {
          var chanIdReplaced = wsResData.channel.id.replace(/[\-\.]/gi, '_');
          svg.select('#id' + chanIdReplaced).attr("fill", "#000000");
          svg.select('#idt' + chanIdReplaced).attr("fill", "#000000");
          //svg.select('#id'+chanIdReplaced).remove()
          //svg.select('#idt'+chanIdReplaced).remove()
        }

        /*
        if (wsResData.type === 'StasisStart') {
          let chanIdReplaced = wsResData.channel.id.replace(/[\-\.]/gi, '_')
          
          svg.append("circle")
            .attr("id", 'id'+chanIdReplaced)
            .attr("r", 6)
            .attr("cx", cxNewChan)
            .attr("cy", 10)
            .attr("fill", "#ff0000")
            svg.append("text")
            .attr("id", 'idt'+chanIdReplaced)
            .attr("x", cxNewChan)
            .attr("y", cyNewChan)
            .attr("fill", "#ff0000")
            .text(wsResData.channel.name)
            cxNewChan = cxNewChan + 20
          cyNewChan = cyNewChan + 10
        }
        */
      }
    };

    // Grapf ----------------------------------------------
    _this.forceDirectedGraph = function (layer) {
      // https://bl.ocks.org/mbostock/4062045
      var self = _this;

      svg = d3.select(_this.node);
      var width = +svg.attr("width");
      var height = +svg.attr("height");

      svg.selectAll("*").remove();

      var color = d3.scaleOrdinal(d3.schemeCategory20);

      var simulation = d3.forceSimulation().force("link", d3.forceLink().distance(100).strength(0.5).id(function (d) {
        return d.id;
      })).force("charge", d3.forceManyBody()).force("center", d3.forceCenter(width / 2, height / 2));

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
      var drawSvgContent = function drawSvgContent() {
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
        drawLinks();
      };

      // Get Nodes and Links
      var drawLinks = function drawLinks() {
        _this.props.swgClient.apis.Data[_this.apiCmd.getLinks]({ token: _this.apiCmd.token, layer: layer }).then(function (res) {
          if (res.status === 200) {
            var ticked = function ticked() {
              link.attr("x1", function (d) {
                return d.source.x;
              }).attr("y1", function (d) {
                return d.source.y;
              }).attr("x2", function (d) {
                return d.target.x;
              }).attr("y2", function (d) {
                return d.target.y;
              });

              node.attr("cx", function (d) {
                return d.x;
              }).attr("cy", function (d) {
                return d.y;
              });

              ttt.attr("x", function (d) {
                return d.x - 2;
              }).attr("y", function (d) {
                return d.y - 10;
              });
            };

            // Data for D3 draw
            graph = { nodes: [], links: []
              // HASH: group names
            };var groupsObj = {};

            res.body.nodes.map(function (row, i) {
              groupsObj[row.group] = { name: row.group, color: '', number: 0 };
            });
            res.body.nodes.map(function (row, i) {
              groupsObj[row.group].number = groupsObj[row.group].number + 1;
            });
            var colorOfGroup = 0;
            for (var key in groupsObj) {
              groupsObj[key].color = color(colorOfGroup++);
            }

            graph = res.body;

            var link = svg.append("g").attr("class", "links").selectAll("line").data(graph.links).enter().append("line").attr("stroke-width", function (d) {
              return Math.sqrt(d.value);
            });

            var node = svg.append("g").attr("class", "nodes").selectAll("circle").data(graph.nodes).enter().append("circle").attr("id", function (d) {
              return 'id' + d.idChannel.replace(/[\-\.]/gi, '_');
            }).attr("r", function (d) {
              return d.size;
            }).attr("fill", function (d) {
              return groupsObj[d.group].color;
            }).call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

            node.append("title").text(function (d) {
              return d.idChannel;
            });

            var ttt = svg.append("g").attr("class", "texts").selectAll("text").data(graph.nodes).enter().append("text").attr("id", function (d) {
              return 'idt' + d.idChannel.replace(/[\-\.]/gi, '_');
            }).attr("fill", function (d) {
              return groupsObj[d.group].color;
            }).text(function (d) {
              return d.id;
            });

            // Legend
            var topPx = 20;

            var _loop = function _loop(_key) {
              svg.append("text").attr("class", "texts").attr("fill", function (d) {
                return groupsObj[_key].color;
              }).attr("x", "5px").attr("y", topPx + "px").text(groupsObj[_key].name + ' (' + groupsObj[_key].number + ' шт.)');
              topPx = topPx + 12;
            };

            for (var _key in groupsObj) {
              _loop(_key);
            }

            // go go go
            simulation.nodes(graph.nodes).on("tick", ticked);

            simulation.force("link").links(graph.links);
          } else {
            console.log(res.body);
          }
        });
      };

      drawSvgContent();
    };

    return _this;
  }

  _createClass(ChannelsMonitor, [{
    key: 'handleClkAction',
    value: function handleClkAction(event) {
      this.forceDirectedGraph(event.target.value);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      console.log('ChannelsMonitor render');

      var finalTemplate = _react2.default.createElement(
        'div',
        { className: 'channelsmonitor-win' },
        _react2.default.createElement(
          'pre',
          { className: 'std-item-header' },
          this.props.headerTxt
        ),
        _react2.default.createElement(
          'pre',
          null,
          _react2.default.createElement(
            'button',
            { className: 'get-bttn', onClick: this.handleClkAction, value: 'Refrash' },
            'Refrash'
          )
        ),
        _react2.default.createElement('svg', { ref: function ref(node) {
            return _this2.node = node;
          }, width: 640, height: 480 })
      );

      return finalTemplate;
    }
  }]);

  return ChannelsMonitor;
}(_react2.default.Component);