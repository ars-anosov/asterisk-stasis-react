import React from 'react'

export class SwgControl extends React.Component {

  constructor(args){
    super(args)

    this.apiCmd = {
      token:      window.localStorage.getItem('token')
    }


    // Контейнер App наполняет this.props.wsConnect функцией из swgControlActions
    // В результате выполнения this.props.wsConnect() контейнер App наполняет ---> this.props.wsClient для этой компоненты и других компонент
    this.props.swgConnect(this.props.specUrl)

  }






  render() {
    console.log('SwgControl render')
    console.log(this.props)

    var finalTemplate = <div className='swgcontrol-win'><pre className='std-item-header'>{this.props.headerTxt}</pre></div>
    if (this.props.swgState) {
      finalTemplate =
      <div className='swgcontrol-win'>
        <pre className='std-item-header'>{this.props.headerTxt}</pre>
  
        <pre> 
          <button className={this.props.swgState.StatusClass} value={this.props.swgState.StatusTxt}>{this.props.swgState.StatusTxt}</button>
        </pre>
  
      </div>
    }

    return finalTemplate

  }

}
