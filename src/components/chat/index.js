import React, { Component } from "react";
import styled from "styled-components";
import { sendMessage } from "@/utils/speaq-api";
import { processCsvData } from "kepler.gl/processors";
import sacramentoRealEstate from "../../data/SacramentoRealEstate";
import earthquake from "../../data/Earthquake";

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #242730;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
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
  background-color: #29323c;
  margin: 0;
  padding: 1em;
`;

const MessageForm = styled.form`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  margin: 0;
  padding: 1em 0;
  background-color: #29323c;
`;

const Response = styled.p`
  margin: 0;
  padding: 1em;
  border-bottom: 1px solid white;
`;

export class Chat extends Component {
  ActionKeys = {
    AddFilter: "AddFilter",
    LoadDataset: "LoadData",
    Clear: "Clear",
  };

  state = {
    inputText: "",
    responses: [],
  };

  constructor(props) {
    super(props);
  }

  _sendMessage = async e => {
    e.preventDefault();
    this.setState({
      inputText: "",
      responses: [...this.state.responses, "..."],
    });
    const res = await sendMessage(this.state.inputText);
    this.setState({ responses: this.state.responses.slice(0, -1) });
    const responses = this.state.responses.concat(
      res.text ? res.text : "no response..."
    );
    this.setState({ responses });

    switch (res.action) {
      case null:
        // do nothing
        break;

      case this.ActionKeys.AddFilter:
        this._addFilter(
          res.variables.filter_field,
          res.variables.sys_number,
          res.variables.filter_comparison,
          res.variables.dataset_name
        );
        break;

      case this.ActionKeys.LoadDataset:
        this._loadDataset(res.variables.dataset_name);
        break;

      case this.ActionKeys.Clear:
        this._clearDataset(res.variables.dataset_name);
        break;
    }
  };

  // NOTE: uncomment to demo functionality without having to talk to watson
  // async componentDidMount() {
  //   await this._loadDataset("name");
  //   await this._addFilter("beds", 4, "lt");
  // }

  /*
   * ONLY WORKS FOR NUMERICS CURRENTLY
   * Taking actions below.
   * add filter takes the following arguments:
   * field: filed name to create the filter for
   * value: the value to use in the filter comparison
   * comparator: one of {"gt", "lt", "eq"}
   * dataset: TODO: lookup id if provided, else use
   * most recently loaded dataset ID.
   */
  async _addFilter(field, value, comparator, dataset) {
    const { addFilter, setFilter, keplerGl } = this.props;
    const { visState } = keplerGl.foo;
    const datasetId = dataset || Object.values(visState.datasets)[0].id;
    const filterId = visState.filters.length;

    await addFilter(datasetId);
    // get the ID of the filter we just added
    await setFilter(filterId, "name", this._resolveField(field));

    switch (comparator) {
      case "greater than":
        await this._setGtFilter(filterId, value);
        break;
      case "less than":
        await this._setLtFilter(filterId, value);
        break;
      case "equal":
        await this._setEqFilter(filterId, value);
        break;
      default:
        // do nothing
        // TODO: change this in the future. For our MVP demo, we can default to less than
        await this._setLtFilter(filterId, value); // feel free to make this greater than or whatever @ jamie for our demo script
        break;
    }
  }

  async _setGtFilter(filterId, value) {
    const { setFilter } = this.props;
    await setFilter(filterId, "value", [value, Number.MAX_SAFE_INTEGER]);
  }

  async _setLtFilter(filterId, value) {
    const { setFilter } = this.props;
    await setFilter(filterId, "value", [Number.MIN_SAFE_INTEGER, value]);
  }

  async _setEqFilter(filterId, value) {
    const { setFilter } = this.props;
    await setFilter(filterId, "value", [value, value]);
  }

  _resolveField(field) {
    var fieldMap = {
      "price": "price",
      "beds": "beds",
      "baths": "baths",
      "year": "year",
      "magnitude": "magnitude",
      "depth": "depth"
    };
    return fieldMap[field];
  }

  _clearDataset(dataset) {
    if (dataset != "Everything") {
      this.props.removeDataset(dataset);
    } else {
      // Everything
      const { removeDataset, keplerGl } = this.props;
      const { visState } = keplerGl.foo

      Object.values(visState.datasets).forEach(function (datasetObj) {
        removeDataset(datasetObj.id);
      });
    }
  }

  async _loadDataset(datasetName) {
    var data = this._resolveDataset(datasetName);

    await this.props.addDataToMap({
      datasets: [
        {
          info: {
            label: datasetName,
            id: datasetName,
          },
          data: processCsvData(data),
        },
      ],
    });
  }

  _resolveDataset(datasetName) {
    var datasetMap = {
      "Earthquake": earthquake,
      "Sacramento real estate": sacramentoRealEstate
    };

    return datasetMap[datasetName];
  }

  _renderResponses() {
    return this.state.responses.map((response, i) => (
      <Response key={i}>{response}</Response>
    ));
  }

  render() {
    const { inputText } = this.state;

    return (
      <ChatContainer>
        <ChatTitle>Chat With Watson</ChatTitle>
        <ResponseContainer>{this._renderResponses()}</ResponseContainer>
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
    );
  }
}
