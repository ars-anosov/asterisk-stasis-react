'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EndpointRow = function (_React$Component) {
  _inherits(EndpointRow, _React$Component);

  function EndpointRow(args) {
    _classCallCheck(this, EndpointRow);

    // наполняю this от Win

    var _this = _possibleConstructorReturn(this, (EndpointRow.__proto__ || Object.getPrototypeOf(EndpointRow)).call(this, args));

    _this.state = {
      description: _this.props.row.description || '',
      notes: _this.props.row.state || '{}',
      showResult: false,
      showModNote: false
    };

    _this.handleChangeTextDesc = _this.handleChangeTextDesc.bind(_this);
    _this.handleChangeTextNotes = _this.handleChangeTextNotes.bind(_this);
    _this.handleClkShowResult = _this.handleClkShowResult.bind(_this);
    _this.handleClkAction = _this.handleClkAction.bind(_this);

    return _this;
  }

  _createClass(EndpointRow, [{
    key: 'handleClkShowResult',
    value: function handleClkShowResult(event) {
      var _this2 = this;

      // Если результат скрыт, запрашиваем новые занчения
      if (!this.state.showResult) {
        this.props.Win.props.swgClient.apis.Configuration[this.props.Win.apiCmd.get]({
          token: this.props.Win.apiCmd.token,
          name: this.props.row.host
        }).then(function (res) {
          _this2.setState({ description: res.body[0].state, notes: res.body[0].state });
        });
      }

      // Показываем/скрываем результат
      this.setState({ showResult: !this.state.showResult });
    }
  }, {
    key: 'handleClkAction',
    value: function handleClkAction(event) {
      var _this3 = this;

      switch (true) {

        case event.target.value === 'del':

          var confAnswer = window.confirm("Delete?");
          if (confAnswer) {
            this.props.Win.props.swgClient.apis.Configuration[this.props.Win.apiCmd.del]({
              token: this.props.Win.apiCmd.token,
              endpointid: this.props.row.technology + '/' + this.props.row.resource
            }).then(function (res) {
              _this3.props.Win.hostSearch();
            });
          }

          break;

        case event.target.value === 'mod':

          var notesObj = false;

          console.log(this.state.notes);

          try {
            notesObj = JSON.parse(this.state.notes);
          } catch (e) {
            alert('inventory.notes Must be JSON object!');
          }

          if (notesObj) {
            this.props.Win.props.swgClient.apis.Configuration[this.props.Win.apiCmd.put]({
              token: this.props.Win.apiCmd.token,
              hostid: this.props.row.hostid,
              body: {
                description: this.state.description,
                inventory: {
                  notes: this.state.notes
                }
              }
            }).then(function (res) {
              _this3.setState({ showModNote: true });
              setTimeout(function () {
                _this3.setState({ showModNote: false });
              }, 500);
            });
          }

          break;

        default:
          console.log('default');
          break;

      }
    }
  }, {
    key: 'handleChangeTextDesc',
    value: function handleChangeTextDesc(event) {
      this.setState({ description: event.target.value });
    }
  }, {
    key: 'handleChangeTextNotes',
    value: function handleChangeTextNotes(event) {
      this.setState({ notes: event.target.value });
    }
  }, {
    key: 'render',
    value: function render() {
      console.log('render EndpointRow');
      var finalTemplate = null;
      var row = this.props.row;

      var channelsActive = '';
      row.channel_ids.map(function (chanId, i) {
        channelsActive = channelsActive + chanId + '\n';
      });

      finalTemplate = _react2.default.createElement(
        'div',
        { className: 'endpoint-item' },
        _react2.default.createElement(
          'div',
          { className: 'std-item-header-small', onClick: this.handleClkShowResult },
          row.technology + '/' + row.resource,
          ' ',
          _react2.default.createElement(
            'strong',
            { className: this.state.showModNote ? 'mod-bttn' : 'display-none' },
            ' \u0418\u0437\u043C\u0435\u043D\u0435\u043D\u043E '
          )
        ),
        _react2.default.createElement(
          'pre',
          { className: 'endpoint-item-menu' },
          channelsActive
        ),
        _react2.default.createElement(
          'div',
          { className: this.state.showResult ? 'endpoint-item-menu' : 'display-none' },
          'inventory.notes (JSON):',
          _react2.default.createElement('br', null),
          _react2.default.createElement('textarea', { className: 'endpoint-textarea', value: this.state.notes, onChange: this.handleChangeTextNotes }),
          _react2.default.createElement('br', null),
          'description:',
          _react2.default.createElement('br', null),
          _react2.default.createElement('textarea', { className: 'endpoint-textarea-small', value: this.state.description, onChange: this.handleChangeTextDesc }),
          _react2.default.createElement('br', null),
          _react2.default.createElement(
            'button',
            { className: 'del-bttn', onClick: this.handleClkAction, value: 'del' },
            '\u0423\u0434\u0430\u043B\u0438\u0442\u044C'
          ),
          '\xA0',
          _react2.default.createElement(
            'button',
            { className: 'mod-bttn', onClick: this.handleClkAction, value: 'mod' },
            '\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C'
          )
        )
      );

      return finalTemplate;
    }
  }]);

  return EndpointRow;
}(_react2.default.Component);

exports.default = EndpointRow;