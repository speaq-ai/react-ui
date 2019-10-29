import React, { Component, Fragment } from "react";
import KeplerGl from "kepler.gl";
import { toggleSidePanel } from "kepler.gl/actions";
import store from "@/ducks";
import styled from "styled-components";
import { Chat } from "@/components/chat";
import { AutoSizer } from "react-virtualized";
import FloatingButton from "@/components/common/floating-button";
import { AudioRecorder, blobToBase64 } from "@/utils/audio";

const MainContainer = styled.div`
	display: flex;
	height: calc(100vh - 50px);
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
		this.props.dispatch(toggleSidePanel());
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

	_toggle = key => this.setState({ [key]: !this.state[key] });
	_toggleOutputFormat = e => this._toggle("outputAsSpeech");
	_toggleChatPanel = e => this._toggle("chatPanelOpen");

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
		return (
			<div>
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
											onClick={this._toggleChatPanel}
											active={chatPanelOpen}
											icon="MessageSquare"
											activeIcon="ArrowLeft"
										/>

										<FloatingButton
											backgroundColor={!outputAsSpeech ? "#6A7485" : "#F27E64"}
											onClick={this._toggleOutputFormat}
											active={outputAsSpeech}
											icon="VolumeX"
											activeIcon="Volume2"
										/>

										<FloatingButton
											backgroundColor={isRecording ? "#F27E64" : "#6A7485"}
											onClick={this._handleAudioRecording}
											active={isRecording}
											icon="Mic"
											activeIcon="Square"
										/>
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
