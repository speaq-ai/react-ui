import React, { Component } from "react";
import { connect } from "react-redux";
import Visualizer from "@/components/visualizer";

class VisualizerContainer extends Component {
    render() {
        return (
        <div>
			<Visualizer />
        </div>
        );
    }
}

const mapStateToProps = state => state;

const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(VisualizerContainer);
