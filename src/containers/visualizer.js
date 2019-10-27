import React, { Component } from "react";
import { connect } from "react-redux";
import Visualizer from "@/components/visualizer";
import * as userActions from "@/ducks/user-duck";
class VisualizerContainer extends Component {
	render() {
		return <Visualizer {...this.props} />;
	}
}

const mapStateToProps = state => state;

const mapDispatchToProps = (dispatch, props) => ({
	logout: () => dispatch(userActions.logout),
	dispatch,
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(VisualizerContainer);
