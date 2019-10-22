import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import KeplerGl from "kepler.gl";
import { toggleSidePanel } from "kepler.gl/actions";
import { processCsvData } from "kepler.gl/processors";
import store from "@/ducks";
import { sendMessage } from "@/utils/speaq-api";
import styled from "styled-components";
import { Chat } from "@/components/chat";
import { AutoSizer } from "react-virtualized";
import FloatingButton from "@/components/common/floating-button";
import { AudioRecorder, blobToBase64 } from "@/utils/audio";
import {
	LogOut,
	Mic,
	Square,
	Volume2,
	VolumeX,
	ArrowLeft,
	MessageSquare,
} from "react-feather";

const MainContainer = styled.div`
	display: flex;

	height: calc(100vh - 50px);
`;

const NavContainer = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	background-color: #2b4059;
	padding: 10px;
	box-shadow: 0 6px 12px 0 rgba(0, 0, 0, 0.16);
`;

const Logo = styled.div`
	background-color: #15a5fa;
	border-radius: 100px;
	background-repeat: no-repeat;
	background-position: center;
	background-size: contain;
	color: #fff;
	font-size: 18px;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
		Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
	padding: 3px 10px;
`;

const MapContainer = styled.div`
	flex: 1;
	height: 100%;
	position: relative;
	transition: 0.35s all ease;
`;

const ChatContainer = styled.div`
	width: ${props => (props.open ? "200px" : "0")};
	height: 100%;
	transition: 0.35s all ease;
	overflow: hidden;
	box-shadow: 0 6px 12px 0 rgba(0, 0, 0, 0.16);
`;

const LogoutButton = styled.a`
	grid-column: 12 / 13;
	align-self: center;
	justify-self: center;
	color: white;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
		Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
	padding: 0.25em 1em;
	margin: 0.5em;
	background-color: #ff4136;
	border-radius: 4px;
	border: 2px solid #ff4136;

	&:hover {
		cursor: pointer;
	}
`;

const ButtonContainer = styled.div`
	position: absolute;
	top: 10px;
	left: 10px;
	z-index: 100;
	button {
		margin-bottom: 8px;
	}
`;

export default class Visualizer extends Component {
	constructor(props) {
		super(props);
	}

	state = {
		chatPanelOpen: true,
		inputSpeech: null,
		mimeType: null,
		outputAsSpeech: false,
		audioRecorder: new AudioRecorder(),
		isRecording: false,
	};

	componentDidMount() {
		this.props.dispatch(toggleSidePanel())
	}

	_handleAudioRecording = async () => {
		const { audioRecorder, isRecording } = this.state;
		if (isRecording) {
			const [audioBlob, mimeType] = await audioRecorder.stop();
			const inputSpeech = await blobToBase64(audioBlob);
			this.setState({ inputSpeech, mimeType, isRecording: false });
		} else {
			await audioRecorder.record();
			this.setState({ isRecording: true });
		}
	};

	_onInputSpeechSent = () => {
		this.setState({ inputSpeech: null });
	};

	render() {
		const mapboxAccessToken = process.env.MAPBOX_ACCESS_TOKEN;
		const { logout } = this.props;
		const {
			chatPanelOpen,
			inputSpeech,
			mimeType,
			audioRecorder,
			outputAsSpeech,
			isRecording,
		} = this.state;
		const iconSize = 16;
		const buttonSize = 36;
		return (
			<div>
				<NavContainer>
					<Logo>speaqAI</Logo>
					<LogOut color="white" size="20" onClick={logout} />
				</NavContainer>
				<MainContainer>
					<ChatContainer open={chatPanelOpen}>
						<Chat
							inputSpeech={inputSpeech}
							mimeType={mimeType}
							onInputSpeechSent={this._onInputSpeechSent}
							outputAsSpeech={outputAsSpeech}
							{...this.props}
						/>
					</ChatContainer>
					<MapContainer open={chatPanelOpen}>
						<AutoSizer>
							{({ height, width }) => (
								<Fragment>
									<ButtonContainer>
										<FloatingButton
											size={buttonSize}
											onClick={e =>
												this.setState({ chatPanelOpen: !chatPanelOpen })
											}
											backgroundColor="#6A7485"
										>
											{chatPanelOpen ? (
												<ArrowLeft color="white" size={iconSize} />
											) : (
												<MessageSquare color="white" size={iconSize} />
											)}
										</FloatingButton>

										<FloatingButton
											backgroundColor={!outputAsSpeech ? "#6A7485" : "#F27E64"}
											size={buttonSize}
											onClick={e =>
												this.setState({
													outputAsSpeech: !outputAsSpeech,
												})
											}
										>
											{!outputAsSpeech ? (
												<VolumeX color="white" size={iconSize} />
											) : (
												<Volume2 color="white" size={iconSize} />
											)}
										</FloatingButton>

										<FloatingButton
											backgroundColor={isRecording ? "#F27E64" : "#6A7485"}
											size={buttonSize}
											onClick={this._handleAudioRecording}
										>
											{isRecording ? (
												<Square color="white" size={iconSize} />
											) : (
												<Mic color="white" size={iconSize} />
											)}
										</FloatingButton>
									</ButtonContainer>
									<KeplerGl
										id="foo"
										store={store}
										mapboxApiAccessToken={mapboxAccessToken}
										width={width}
										height={height}
									/>
								</Fragment>
							)}
						</AutoSizer>
					</MapContainer>
				</MainContainer>
			</div>
		);
	}
}
