import React from 'react'

export class WsControl extends React.Component {

  constructor(args){
    super(args)

    this.apiCmd = {
      token:      window.localStorage.getItem('token')
    }


    // Контейнер App наполняет this.props.wsConnect функцией из wsControlActions
    // В результате выполнения this.props.wsConnect() контейнер App наполняет ---> this.props.wsClient для этой компоненты и других компонент
    this.props.wsConnect(this.props.wsUrl)

  }






  render() {
    console.log('WsControl render')

    var finalTemplate = <div className='wscontrol-win'><pre className='std-item-header'>{this.props.headerTxt}</pre></div>
    if (this.props.wsState) {
      finalTemplate =
      <div className='wscontrol-win'>
        <pre className='std-item-header'>{this.props.headerTxt}</pre>
  
        <pre> 
          <button className={this.props.wsState.StatusClass} value={this.props.wsState.StatusTxt}>{this.props.wsState.StatusTxt}</button>
        </pre>
  
        <pre>{this.props.wsState.wsLogTxt}</pre>
  
      </div>
    }

    return finalTemplate

  }

}
