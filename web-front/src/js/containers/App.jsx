import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'


import * as wsControlActions from '../actions/wsControlActions'
import * as swgControlActions from '../actions/swgControlActions'
import { ChannelsMonitor, WsControl, SwgControl, Endpoints } from '../components/asterisk-react-component'


//const wsUrl =   'ws://192.168.13.97:8006'

class App extends React.Component {
  render() {
    console.log('App render')

    // Всякое намэпленое в результате connect()
    const { specUrl, wsUrl, wsControl, swgControl } = this.props
    const { swgConnect } = this.props.swgControlActions
    const { wsConnect } = this.props.wsControlActions
    //console.log(this.props)
    
    return <div>
      <ChannelsMonitor  swgClient={swgControl.swgClient} wsClient={wsControl.wsClient} headerTxt='ChannelsMonitor component' />
      <Endpoints        swgClient={swgControl.swgClient} wsClient={wsControl.wsClient} headerTxt='Endpoints component' />

      <WsControl  wsUrl={wsUrl}     wsConnect={wsConnect}   wsState={wsControl.wsState}     headerTxt='WsControl component' />
      <SwgControl specUrl={specUrl} swgConnect={swgConnect} swgState={swgControl.swgState}  headerTxt='SwgControl component' />
    </div>
  }
}




function mapStateToProps (state) {
  //console.log(state)
  return {
    specUrl:    'http://192.168.13.97:8004/spec/swagger.json',
    wsUrl:      'ws://192.168.13.97:8006',
    wsControl:  state.wsControlRdcr,
    swgControl: state.swgControlRdcr
  }
}

function mapDispatchToProps(dispatch) {
  return {
    wsControlActions:   bindActionCreators(wsControlActions, dispatch),
    swgControlActions:  bindActionCreators(swgControlActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)







