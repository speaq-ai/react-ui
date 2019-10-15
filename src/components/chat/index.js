import React, { Component } from "react";
import styled from "styled-components";
import { sendMessage } from "@/utils/speaq-api";
import { processCsvData } from "kepler.gl/processors";
import sacramentoRealEstate from "../../data/SacramentoRealEstate";
import earthquake from "../../data/Earthquake";

export const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: #242730;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    height: 100%;
`;

export const MessageInput = styled.input`
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

export const MessageButton = styled.button`
	padding: 5px 10px;
	border-radius: 3px;
	outline: none;
	border: 1px solid gray;
	color: black;
	background-color: lightgray;
	font-size: 0.6rem;
`;

export const ResponseContainer = styled.div`
    height: 100%;
`;

export const ChatTitle = styled.h3`
    background-color: #29323C;
    margin: 0;
    padding: 1em;
`;

export const MessageForm = styled.form`
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    margin: 0;
    padding: 1em 0;
    background-color: #29323C;
`;

export const Response = styled.p`
    margin: 0;
    padding: 1em;
    border-bottom: 1px solid white;
`;

export class Chat extends Component {
  ActionKeys = {
    AddFilter: "AddFilter",
    LoadDataset: "LoadData",
    Clear: "Clear",
    ChangeViewMode: "ChangeViewMode",
    ViewAction: "ViewAction",
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

    this._removeLastMessage();
    this._addMessageToState(res.text ? res.text : "no response...")

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

      case this.ActionKeys.ChangeViewMode:
        this._changeViewMode(res.variables.view_mode);
        break;

      case this.ActionKeys.ViewAction:
        this._executeViewAction(res.variables.view_action);
        break;
    }
  };

  // Right now, this is used essentially every time before we add a new message
  // however, i feel like including this in the add message code is asking for confusion down the line
  _removeLastMessage() {
    this.setState({ responses: this.state.responses.slice(0, -1) });
  }

  _addMessageToState(message) {
    const responses = this.state.responses.concat(message);
    this.setState({ responses });
  }

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
    // validation
    if (this._validateDatasetExists(dataset)) {
      if (this._validateField(dataset, field)) {
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
      } else {
        this._removeLastMessage();
        this._addMessageToState("That doesn't look like a valid field on that dataset.");
      }
    } else {
      this._removeLastMessage();
      this._addMessageToState("Sorry, we can't find that dataset.");
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
    if (this._validateDatasetExists(dataset)) {
      const { removeDataset } = this.props;

      if (dataset != "Everything") {
        removeDataset(dataset);
      } else {
        // Everything
        this._getAllDatasets().forEach(function (datasetObj) {
          removeDataset(datasetObj.id);
        });
      }
    } else {
      this._removeLastMessage();
      this._addMessageToState("Sorry, we can't find that dataset.");
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

  // return as an array
  _getAllDatasets() {
    const { removeDataset, keplerGl } = this.props;
    const { visState } = keplerGl.foo;
    return Object.values(visState.datasets);
  }

  _validateDatasetExists(datasetName) {
    const datasets = this._getAllDatasets();

    if (datasetName == "Everything") return true;
    return datasets.find(dataset => dataset.id == datasetName) ? true : false;
  }

  _validateField(datasetName, field) {
    const datasets = this._getAllDatasets();
    const dataset = datasets.find(dataset => dataset.id == datasetName);

    if (dataset) {
      return dataset.fields.find(f => f.name == field) ? true : false;
    } else {
      return false;
    }
  }

  async _changeViewMode(viewMode) {
    const layers = this.props.keplerGl.foo.visState.layers;

    switch(viewMode) {
      case 3:  // Watson strips the D for some reason
      case "3D":
        await this.props.togglePerspective()
        break;
      case "cluster":
        await this.props.layerTypeChange(layers[0], "cluster")
        break;
      case "point":
        await this.props.layerTypeChange(layers[0], "point")
        break;
      case "grid":
        await this.props.layerTypeChange(layers[0], "grid")
        break;
      case "hexbin":
        await this.props.layerTypeChange(layers[0], "hexagon")
        break;
      case "heatmap":
        await this.props.layerTypeChange(layers[0], "heatmap")
        break;
    }
  }

  async _executeViewAction(viewAction) {
    const mapState = this.props.keplerGl.foo.mapState;

    switch (viewAction) {
      case "in":
        await this.props.updateMap({zoom: mapState.zoom * 1.1})
        break;
      case "out":
        await this.props.updateMap({zoom: mapState.zoom * 0.9})
        break;
      case "up":
        await this.props.updateMap({latitude: mapState.latitude + 0.01});
        break;
      case "down":
        await this.props.updateMap({latitude: mapState.latitude - 0.01});
        break;
      case "right":
        await this.props.updateMap({longitude: mapState.longitude + 0.01});
        break;
      case "left":
        await this.props.updateMap({longitude: mapState.longitude - 0.01});
        break;
      case "enhance":
        await this.props.updateMap({zoom: mapState.zoom * 1.5});
        break;
    }
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
