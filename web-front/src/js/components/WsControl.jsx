import React from 'react'

export class WsControl extends React.Component {

  constructor(args){
    super(args)

    this.state = {
      wsLogTxt: 'Log:',
      wsStatusTxt: 'Start',
      wsStatusClass: 'ws-err'
    }

    this.apiCmd = {
      token:      window.localStorage.getItem('token')
    }



    // (+) WebSoket
    setInterval(
    () => {
      if (this.state.wsStatusClass === 'ws-err') {
        console.log('WebSocket reconnect')
        var socket = new WebSocket(this.props.wsUrl)

        socket.onopen = () => {
          console.log("WebSocket Соединение установлено.");
          this.setState({wsStatusClass: 'ws-ok', wsStatusTxt: 'Connected'})
        };
        
        socket.onclose = (event) => {
          if (event.wasClean) {
            console.log('WebSocket Соединение закрыто чисто');
            this.setState({wsStatusClass: 'ws-err', wsStatusTxt: 'Connection Closed'})
          } else {
            console.log('WebSocket Обрыв соединения'); // например, "убит" процесс сервера
            this.setState({wsStatusClass: 'ws-err', wsStatusTxt: 'Connection Broken'})
          }
          console.log('Код: ' + event.code + ' причина: ' + event.reason);
        };
        
        socket.onerror = (error) => {
          console.log("WebSocket Ошибка " + error.message);
          this.setState({wsStatusClass: 'ws-err', wsStatusTxt: 'Connection Error'})
        };

        socket.onmessage = (event) => {

          var wsResData = {}
          if (event.data) {
            wsResData = JSON.parse(event.data)
            console.log(wsResData)

            this.setState({wsLogTxt: this.state.wsLogTxt +'\n'+ wsResData.type})
          }
    
        }

      }
    }, 1000)
    // (---) WebSoket

  }






  render() {
    console.log('WsControl render')

    var finalTemplate =
    <div className='wscontrol-win'>
      <pre className='std-item-header'>{this.props.headerTxt}</pre>

      <pre> 
        <button className={this.state.wsStatusClass} value={this.state.wsStatusTxt}>{this.state.wsStatusTxt}</button>
      </pre>

      <pre>{this.state.wsLogTxt}</pre>

    </div>

    return finalTemplate

  }

}
