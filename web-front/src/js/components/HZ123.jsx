import React from 'react';


export class HZ123 extends React.Component {

  constructor(args) {
    super(args)      // наполняю this от Page

    this.state = {
      groupList:        [],
      inputHostName:    this.props.inputHostName || '',
      selectHostGroup:  this.props.selectHostGroup || '',
      showResult:       true,
      searchResult:     null,
      wsLog:            ''
    }

    this.handleChangeInput    = this.handleChangeInput.bind(this)
    this.handleChangeSelect   = this.handleChangeSelect.bind(this)
    this.handleClkShowResult  = this.handleClkShowResult.bind(this)
    this.handleClkAction      = this.handleClkAction.bind(this)

    this.apiCmd = {
      token:      window.localStorage.getItem('token'),
      get:        'host_get',
      post:       'host_post',
      put:        'host_put',
      del:        'host_del',
      getGroups:  'hostgroup_get'
    }




    // API actions ----------------------------------------
    this.hostAdd = () => {
      if (this.state.inputHostName && parseInt(this.state.selectHostGroup) > 0) {
        this.props.swgClient.apis.Configuration[this.apiCmd.post]({token: this.apiCmd.token, body: {dns: this.state.inputHostName, groupid: parseInt(this.state.selectHostGroup)} })
        .then((res) => {

          if (res.status === 200) {
            this.hostSearch()
          }
          else {
            console.log(res.body)
          }

        })
        .catch((err) => {
          // err
        })
      }
    }

    this.hostSearch = () => {
      var searchResultTemplate = []

      this.props.swgClient.apis.Configuration[this.apiCmd.get]({token: this.apiCmd.token, name: this.state.inputHostName, group: this.state.selectHostGroup})
      .then((res) => {

        if (res.status === 200) {
          res.body.map( (row, i) => {
            searchResultTemplate.push(<HostConfigRow {...{Win: this}} row={row} key={i}/>)
          })
        }
        else {
          console.log(res.body)
        }

        this.setState({searchResult: searchResultTemplate, showResult: true})
      })
      .catch((err) => {
        // err
      })
    }





    // Select oprions -------------------------------------
    //this.props.swgClient.apis.Configuration[this.apiCmd.getGroups]({token: this.apiCmd.token, name: '' })
    //.then((res) => {
    //
    //  if (res.status === 200) {
    //    this.setState({groupList: res.body})
    //  }
    //  else {
    //    console.log(res.body)
    //  }
    //
    //})
    //.catch((err) => {
    //  //err
    //})




    var socket = new WebSocket('ws://192.168.13.97:8006');
    
    socket.onopen = function() {
      console.log("Соединение установлено.");
    };
    
    socket.onclose = function(event) {
      if (event.wasClean) {
        console.log('Соединение закрыто чисто');
      } else {
        console.log('Обрыв соединения'); // например, "убит" процесс сервера
      }
      console.log('Код: ' + event.code + ' причина: ' + event.reason);
    };
    
    var self = this
    socket.onmessage = function(event) {
      console.log(event.data)
      //self.setState({wsLog: self.state.wsLog + '\n' + event.data})
      self.setState({wsLog: event.data})
    }


  }





  handleChangeInput(event) {
    this.setState({inputHostName: event.target.value})
  }

  handleChangeSelect(event) {
    this.setState({selectHostGroup: event.target.value})
  }

  handleClkShowResult(event) {
    this.setState({showResult: !this.state.showResult})
  }

  handleClkAction(event) {
    switch (true) {

      case (event.target.value === 'search'):
        this.setState({searchResult: null})
        this.hostSearch()
        break

      case (event.target.value === 'add'):
        this.hostAdd()
        break

      default:
        console.log('default')
        break

    }

  }



  render() {
    console.log('HZ123 render')

    var finalTemplate =
    <div className='hz123-win'>
      <div className='std-item-header' onClick={this.handleClkShowResult}>{this.props.headerTxt}</div>

      <input type='text' placeholder='hz' value={this.state.inputHostName} onChange={this.handleChangeInput} />
      <select size='1' value={this.state.selectHostGroup} onChange={this.handleChangeSelect}>
        <option value='' value=''>- select group -</option>
        {
          this.state.groupList.map((row,i) =>
            <option key={i} value={row.groupid}>{row.name}</option>
          )
        }
      </select>
      <br />
      <button className='get-bttn' onClick={this.handleClkAction} value='search'>Найти</button>
      <button className='add-bttn' onClick={this.handleClkAction} value='add'>Добавить</button>

      <div className={this.state.showResult ? '' : 'display-none'}>{this.state.searchResult}</div>

      <pre>log: {this.state.wsLog}</pre>

    </div>

    return finalTemplate
  }

}
