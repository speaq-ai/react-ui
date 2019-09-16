import React, { Component } from "react";
import { connect } from "react-redux";
import KeplerGl from "kepler.gl";
import { addDataToMap } from "kepler.gl/actions";
import { processCsvData } from "kepler.gl/processors";
import store from "@/ducks";
import { sendMessage } from "@/utils/speaq-api";

export default class Visualizer extends Component {
	state = {
		inputText: "",
		responses: [],
	};
	constructor(props) {
		super(props);
	}

	_sendMessage = async e => {
		e.preventDefault();
		const res = await sendMessage(this.state.inputText);
		const responses = this.state.responses.concat(
			res.output.generic[0] ? res.output.generic[0].text : "no response..."
		);
		this.setState({ responses });
	};

	_renderResponses() {
		return this.state.responses.map((response, i) => <p key={i}>{response}</p>);
	}

	render() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		const mapboxAccessToken = process.env.MAPBOX_ACCESS_TOKEN;
		const { logout } = this.props;
		const { inputText } = this.state;

		return (
			<div>
				<button onClick={logout}>Logout</button>
				<form onSubmit={this._sendMessage}>
					<input
						type="text"
						value={inputText}
						onChange={e => this.setState({ inputText: e.target.value })}
					/>
					<button type="submit" onClick={this._sendMessage}>
						Send
					</button>
					{this._renderResponses()}
				</form>
			</div>
		);
	}
}
