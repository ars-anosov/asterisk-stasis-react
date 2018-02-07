import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'


import * as endpointsActions from '../actions/endpointsActions'
import { Endpoints } from '../components/asterisk-react-component'




class App extends React.Component {
  render() {
    const { endpoints } = this.props
    const { swgConnect } = this.props.endpointsActions

    //console.log(this.props)
    return <div>
      <Endpoints swgClient={endpoints.client} swgConnect={swgConnect} headerTxt='Endpoints component' />
    </div>
  }
}




function mapStateToProps (state) {
  //console.log(state)
  return {
    endpoints: state.endpointsRdcr
  }
}

function mapDispatchToProps(dispatch) {
  return {
    endpointsActions: bindActionCreators(endpointsActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)







