import React, { Component } from "react";
import styled from "styled-components";
import { sendMessage } from "@/utils/speaq-api";
import { Send } from "react-feather";
import ActionProcessor from "./action-processor";
import { playBase64Audio } from "@/utils/audio";

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #white;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  height: 100%;
  box-shadow: 0 6px 12px 0 rgba(0, 0, 0, 0.16);
`;

export const MessageInput = styled.input`
  padding: 5px 10px;
  border: none;
  outline: none;
  color: white;
  background-color: #2b4059;
  width: 75%;
  font-size: 14px;
  &::placeholder {
    color: #b6defa;
  }
`;

export const MessageButton = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 3px;
  outline: none;
  color: white;
  background-color: #15a5fa;
  font-size: 0.6rem;
`;

export const ResponseContainer = styled.div`
  height: 100%;
  padding: 0 5px;
  background-color: rgba(43, 64, 89, 0.95);
  max-height: calc(100% - 40px);
  overflow: scroll;
`;

export const MessageForm = styled.form`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  margin: 0;
  padding: 5px 0;
  background-color: #2b4059;
  box-shadow: 0 6px 12px 0 rgba(0, 0, 0, 0.16);
`;

export const Message = styled.p`
  margin-left: 30px;
  padding: 10px 15px;
  background-color: #2786da;
  border-radius: 5px;
  color: #fff;
  font-size: 12px;
  box-shadow: 0 6px 12px 0 rgba(0, 0, 0, 0.16);
`;

export const Response = styled.p`
  margin-right: 30px;
  padding: 10px 15px;
  background-color: #436d9b;
  border-radius: 5px;
  color: #fff;
  font-size: 12px;
  box-shadow: 0 6px 12px 0 rgba(0, 0, 0, 0.16);
`;

const HeadingContainer = styled.div`
  background-color: #29323c;
  margin: 0;
  padding: 1em;
  display: flex;
  flex-direction: column;
`;

export class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputText: "",
      responses: [],
      actionProcessor: new ActionProcessor(
        this.props.keplerGl,
        this.props.dispatch
      ),
    };
  }

  componentDidUpdate(oldProps) {
    // when inputSpeech becomes available, use it to send a message to watson.
    if (!oldProps.inputSpeech && !!this.props.inputSpeech) {
      this._sendMessage();
    }
    if (oldProps.keplerGl !== this.props.keplerGl) {
      this.state.actionProcessor.updateKepler(this.props.keplerGl);
    }
  }

  _sendMessage = async e => {
    e && e.preventDefault();
    const {
      outputAsSpeech,
      inputSpeech,
      mimeType,
      onInputSpeechSent,
    } = this.props;
    const { inputText, actionProcessor } = this.state;

    const messageContent = !!inputSpeech ? inputSpeech : inputText;
    const messageConfig = {
      inputFormat: !!inputSpeech ? "speech" : "text",
      outputAsSpeech,
      mimeType,
    };

    if (!inputSpeech) {
      this.setState({
        inputText: "",
      });
      this._addMessagesToState([
        { text: inputText, isResponse: false },
        { text: "...", isResponse: true },
      ]);
    } else {
      this._addMessagesToState([
        { text: "...", isResponse: false },
        { text: "...", isResponse: true },
      ]);
      onInputSpeechSent();
    }
    const res = await sendMessage(messageContent, messageConfig);
    this._addMessagesToState(
      [{ text: res.text ? res.text : "no response...", isResponse: true }],
      { remove: 1 }
    );
    if (outputAsSpeech) {
      this.playBase64Audio(res.speech);
    }
    const responses = await actionProcessor.process(res);
    const messages = responses.map(response => ({
      text: response,
      isResponse: true,
    }));
    messages.length && this._addMessagesToState(messages, { remove: 1 });
  };

  _addMessagesToState(messages, options = { remove: 0 }) {
    let responses = this.state.responses.slice(
      0,
      this.state.responses.length - (options.remove ? options.remove : 0)
    );
    responses = responses.concat(
      messages.map(msg => ({ text: msg.text, response: msg.isResponse }))
    );
    this.setState({ responses });
  }

  _renderResponses() {
    return this.state.responses.map((msg, i) =>
      msg.response ? (
        <Response key={i}>{msg.text}</Response>
      ) : (
        <Message key={i}>{msg.text}</Message>
      )
    );
  }

  render() {
    const { outputAsSpeech } = this.props;
    const { inputText } = this.state;

    return (
      <ChatContainer>
        <ResponseContainer>{this._renderResponses()}</ResponseContainer>
        <MessageForm id="message-form">
          <MessageInput
            type="text"
            value={inputText}
            placeholder="Type your message here"
            onChange={e => this.setState({ inputText: e.target.value })}
          />
          <MessageButton type="submit" onClick={this._sendMessage}>
            <Send color="white" size={14} />
          </MessageButton>
        </MessageForm>
      </ChatContainer>
    );
  }
}
