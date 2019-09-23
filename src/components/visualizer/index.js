import React, { Component } from "react";
import { connect } from "react-redux";
import KeplerGl from "kepler.gl";
import { addDataToMap } from "kepler.gl/actions";
import { processCsvData } from "kepler.gl/processors";
import store from "@/ducks";
import { sendMessage } from "@/utils/speaq-api";
import styled from "styled-components";
import { Chat } from "@/components/chat";
import { AutoSizer } from "react-virtualized"

const MainContainer = styled.div`
	display: grid;
	height: 100vh;
	grid-template-columns: repeat(12, 1fr);
	grid-template-rows: 30px auto;
`;

const MapContainer = styled.div`
	grid-column: 3 / 13;
`;

const ChatContainer = styled.div`
	grid-column: 1 / 3;
	height: 100%;
`;

const LogoutButton = styled.button`
	padding: 5px 10px;
	border-radius: 3px;
	background-color: red;
	color: white;
	font-size: 0.6rem;
	display: block;
`;

export default class Visualizer extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const mapboxAccessToken = process.env.MAPBOX_ACCESS_TOKEN;
		const { logout } = this.props;

		return (
			<MainContainer>
				<LogoutButton onClick={logout}>Logout</LogoutButton>
				<ChatContainer>
					<Chat />
				</ChatContainer>
				<MapContainer>
					<AutoSizer>
						{({height, width}) => (
							<KeplerGl
							id="foo"
							store={store}
							mapboxApiAccessToken={mapboxAccessToken}
							width={width}
							height={height}
						/>
						)}
					</AutoSizer>
				</MapContainer>
			</MainContainer>
		);
	}
}
