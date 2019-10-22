import React, { Component } from "react";
import { connect } from "react-redux";
import Visualizer from "@/components/visualizer";
import * as keplerActions from "kepler.gl/actions";
import * as userActions from "@/ducks/user-duck";
class VisualizerContainer extends Component {
	render() {
		return (
			<div>
				<Visualizer {...this.props} />
			</div>
		);
	}
}

const mapStateToProps = state => state;

const mapDispatchToProps = (dispatch, props) => ({
	logout: userActions.logout,
	dispatch,
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(VisualizerContainer);
