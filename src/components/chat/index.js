import React, { Component } from 'react';
import styled from 'styled-components';
import { sendMessage } from "@/utils/speaq-api";
import { addDataToMap } from "kepler.gl/actions";
import { processCsvData } from "kepler.gl/processors";

const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: #242730;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    height: 100%;
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
    width: 75%;
`;

const MessageButton = styled.button`
	padding: 5px 10px;
	border-radius: 3px;
	outline: none;
	border: 1px solid gray;
	color: black;
	background-color: lightgray;
	font-size: 0.6rem;
`;

const ResponseContainer = styled.div`
    height: 100%;
`;

const ChatTitle = styled.h3`
    background-color: #29323C;
    margin: 0;
    padding: 1em;
`;

const MessageForm = styled.form`
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    margin: 0;
    padding: 1em 0;
    background-color: #29323C;
`;

const Response = styled.p`
    margin: 0;
    padding: 1em;
    border-bottom: 1px solid white;
`;

export class Chat extends Component {
    ActionKeys = {
      AddFilter = "AddFilter",
      LoadDataset = "LoadData",
      Clear = "Clear"
    }

    state = {
        inputText: "",
        responses: []
    };

    constructor(props) {
        super(props);
    }

    _sendMessage = async e => {
        e.preventDefault();
        this.setState({inputText: "", responses: [...this.state.responses, '...']})
        const res = await sendMessage(this.state.inputText);
        this.setState({responses: this.state.responses.slice(0, -1)})
        const responses = this.state.responses.concat(
            res.text ? res.text : "no response..."
        );
        this.setState({ responses });

        switch (res.action) {
          case null:
            // do nothing
            break;

          case this.ActionKeys.AddFilter:
            this._addFilter(res.variables.FilterField, res.variables.Number, res.variables.FilterComparison);
            break;

          case this.ActionKeys.LoadDataset:
            this._loadDataset(res.variables.DatasetName);
            break;

          case this.ActionKeys.Clear:
            this._clearDatasets();
            break;
        }
    };

    /*
     * Taking actions below.
     * We can refactor this in the future to somewhere that makes more sense, but for the MVP...
     */
    _addFilter(field, value, comparator) {
      // TODO
    };

    _clearDatasets() {

    };

    _loadDataset(datasetName) {
      // @ Jamie - once we have our datasets loaded, we have to match the entity given by watson to the
      // proper actual dataset that we have.

      data = 0; // TODO: resolve the dataset name to the actual imported csv data here

			this.props.dispatch(
				addDataToMap({
					datasets: [
						{
							info: {
								label: datasetName,
								id: datasetName,
							},
							data: processCsvData(data),
						},
					],
				})
			);
    };

    _renderResponses() {
        return this.state.responses.map((response, i) => <Response key={i}>{response}</Response>);
    };

    render() {
        const { inputText } = this.state;

        return (
            <ChatContainer>
                <ChatTitle>Chat With Watson</ChatTitle>
                <ResponseContainer>
                    {this._renderResponses()}
                </ResponseContainer>
                <MessageForm id="message-form">
                    <MessageInput
						type="text"
						value={inputText}
						onChange={e => this.setState({ inputText: e.target.value })}
					/>
                    <MessageButton type="submit" onClick={this._sendMessage}>
						Send
					</MessageButton>
                </MessageForm>
            </ChatContainer>
        )
    }
}
