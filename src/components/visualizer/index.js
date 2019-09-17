import React, { Component } from "react";
import { connect } from "react-redux";
import KeplerGl from "kepler.gl";
import { addDataToMap } from "kepler.gl/actions";
import { processCsvData } from "kepler.gl/processors";
import store from "@/ducks";
import { sendMessage } from "@/utils/speaq-api";
import styled from "styled-components";

const LogoutButton = styled.button`
	padding: 5px 10px;
	border-radius: 3px;
	background-color: red;
	color: white;
	font-size: 0.6rem;
	display: block;
`;

const MessageInput = styled.input`
	padding: 5px 10px;
	border-radius: 3px;
	outline: none;
	border: 1px solid gray;
	border-right: none;
	font-size: 1rem;
	color: black;
	background-color: white;
	margin-bottom: 8px;
`;
const MessageButton = styled.button`
	padding: 5px 10px;
	border-radius: 3px;
	outline: none;
	border: 1px solid gray;
	color: black;
	background-color lightgray;
	font-size: 0.6rem;
`;

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
				<LogoutButton onClick={logout}>Logout</LogoutButton>
				<form onSubmit={this._sendMessage}>
					<h4 htmlFor="">Message Watson Here!</h4>
					<MessageInput
						type="text"
						value={inputText}
						onChange={e => this.setState({ inputText: e.target.value })}
					/>
					<MessageButton type="submit" onClick={this._sendMessage}>
						Send
					</MessageButton>
					{this._renderResponses()}
				</form>
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
