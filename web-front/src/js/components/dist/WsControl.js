'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WsControl = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WsControl = exports.WsControl = function (_React$Component) {
  _inherits(WsControl, _React$Component);

  function WsControl(args) {
    _classCallCheck(this, WsControl);

    var _this = _possibleConstructorReturn(this, (WsControl.__proto__ || Object.getPrototypeOf(WsControl)).call(this, args));

    _this.state = {
      wsLogTxt: 'Log:',
      wsStatusTxt: 'Start',
      wsStatusClass: 'ws-err'
    };

    _this.apiCmd = {
      token: window.localStorage.getItem('token')

      // (+) WebSoket
    };setInterval(function () {
      if (_this.state.wsStatusClass === 'ws-err') {
        console.log('WebSocket reconnect');
        var socket = new WebSocket(_this.props.wsUrl);

        socket.onopen = function () {
          console.log("WebSocket Соединение установлено.");
          _this.setState({ wsStatusClass: 'ws-ok', wsStatusTxt: 'Connected' });
        };

        socket.onclose = function (event) {
          if (event.wasClean) {
            console.log('WebSocket Соединение закрыто чисто');
            _this.setState({ wsStatusClass: 'ws-err', wsStatusTxt: 'Connection Closed' });
          } else {
            console.log('WebSocket Обрыв соединения'); // например, "убит" процесс сервера
            _this.setState({ wsStatusClass: 'ws-err', wsStatusTxt: 'Connection Broken' });
          }
          console.log('Код: ' + event.code + ' причина: ' + event.reason);
        };

        socket.onerror = function (error) {
          console.log("WebSocket Ошибка " + error.message);
          _this.setState({ wsStatusClass: 'ws-err', wsStatusTxt: 'Connection Error' });
        };

        socket.onmessage = function (event) {

          var wsResData = {};
          if (event.data) {
            wsResData = JSON.parse(event.data);
            console.log(wsResData);

            _this.setState({ wsLogTxt: _this.state.wsLogTxt + '\n' + wsResData.type });
          }
        };
      }
    }, 1000);
    // (---) WebSoket

    return _this;
  }

  _createClass(WsControl, [{
    key: 'render',
    value: function render() {
      console.log('WsControl render');

      var finalTemplate = _react2.default.createElement(
        'div',
        { className: 'wscontrol-win' },
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
            { className: this.state.wsStatusClass, value: this.state.wsStatusTxt },
            this.state.wsStatusTxt
          )
        ),
        _react2.default.createElement(
          'pre',
          null,
          this.state.wsLogTxt
        )
      );

      return finalTemplate;
    }
  }]);

  return WsControl;
}(_react2.default.Component);