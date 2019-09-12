import React, { Component } from "react";
import { connect } from "react-redux";
import KeplerGl from "kepler.gl";
import { addDataToMap } from "kepler.gl/actions";
import { processCsvData } from "kepler.gl/processors";
import store from "@/ducks";

class Visualizer extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		const mapboxAccessToken = process.env.MAPBOX_ACCESS_TOKEN;
		return (
			<div>
				<KeplerGl
					id="foo"
					store={store}
					mapboxApiAccessToken={mapboxAccessToken}
					width={width}
					height={height}
				/>
			</div>
		);
	}
}

const mapStateToProps = state => state;

const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Visualizer);
