import React, { Component } from "react";
import styled from "styled-components";
import { sendMessage } from "@/utils/speaq-api";
import { processCsvData } from "kepler.gl/processors";
import sacramentoRealEstate from "../../data/SacramentoRealEstate";
import earthquake from "../../data/Earthquake";
import FileSaver from "file-saver";
import { Send } from "react-feather";
import { base64ToBlob, blobToBase64, AudioRecorder } from "@/utils/audio";
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
  ActionKeys = {
    AddFilter: "AddFilter",
    LoadDataset: "LoadData",
    Clear: "Clear",
    ChangeViewMode: "ChangeViewMode",
    ViewAction: "ViewAction",
    GotoAction: "GotoAction",
  };

  state = {
    inputText: "",
    responses: [],
  };

  constructor(props) {
    super(props);
  }

  componentDidUpdate(oldProps) {
    // when inputSpeech becomes available, use it to send a message to watson.
    if (!oldProps.inputSpeech && !!this.props.inputSpeech) {
      this._sendMessage();
    }
  }

  _playSpeechAudio = speech => {
    const speechBlob = base64ToBlob(speech);
    const speechUrl = URL.createObjectURL(speechBlob);
    const speechAudio = new Audio(speechUrl);
    speechAudio.play();
  };

  _sendMessage = async e => {
    const {
      outputAsSpeech,
      inputSpeech,
      mimeType,
      onInputSpeechSent,
    } = this.props;
    const { inputText } = this.state;
    e && e.preventDefault();
    let res;
    if (!!inputSpeech) {
      res = await sendMessage(inputSpeech, {
        inputFormat: "speech",
        outputAsSpeech,
        mimeType,
      });
      onInputSpeechSent();
    } else {
      this.setState({
        inputText: "",
      });
      await this._addMessageToState(inputText, false);
      this._addMessageToState("...", true);
      res = await sendMessage(inputText, {
        inputFormat: "text",
        outputAsSpeech,
      });
      this._removeLastMessage();
    }
    this._addMessageToState(res.text ? res.text : "no response...", true);

    if (outputAsSpeech) {
      this._playSpeechAudio(res.speech);
    }

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

      case this.ActionKeys.GotoAction:
        this._moveMap(res.variables.location[0], res.variables.location[1]);
        break;
    }
  };

  // Right now, this is used essentially every time before we add a new message
  // however, i feel like including this in the add message code is asking for confusion down the line
  _removeLastMessage() {
    this.setState({ responses: this.state.responses.slice(0, -1) });
  }

  _addMessageToState(message, isResponse) {
    const responses = this.state.responses.concat({
      response: isResponse,
      text: message,
    });
    this.setState({ responses });
  }

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
    // generally, we let watson append the success message, but as filter-everything can result
    // in multiple successes and failures, we want to remove only the watson response, and then append a result for
    // each filter processed.
    this._removeLastMessage();

    if (dataset == "Everything") {
      this._getAllDatasets().forEach(datasetObj => {
        this._addMessageToState("adding filter...", true);
        this._addFilter(field, value, comparator, datasetObj.id);
      });
    } else {
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

          this._addMessageToState("Great, let's get that filter going.", true);
        } else {
          this._addMessageToState(
            "That doesn't look like a valid field on the " +
              dataset +
              " dataset.",
            true
          );
        }
      } else {
        this._addMessageToState("Sorry, we can't find that dataset.", true);
      }
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
      price: "price",
      beds: "beds",
      baths: "baths",
      year: "year",
      magnitude: "magnitude",
      depth: "depth",
    };
    return fieldMap[field];
  }

  _clearDataset(dataset) {
    if (this._validateDatasetExists(dataset)) {
      if (dataset != "Everything") {
        this.props.removeDataset(dataset);
      } else {
        // Everything
        this._getAllDatasets().forEach(datasetObj => {
          this.props.removeDataset(datasetObj.id);
        });
      }
    } else {
      this._removeLastMessage();
      this._addMessageToState("Sorry, we can't find that dataset.", true);
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
      Earthquake: earthquake,
      "Sacramento real estate": sacramentoRealEstate,
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

    switch (viewMode) {
      case 3: // Watson strips the D for some reason
      case "3D":
        await this.props.togglePerspective();
        break;
      case "cluster":
        await this.props.layerTypeChange(layers[0], "cluster");
        break;
      case "point":
        await this.props.layerTypeChange(layers[0], "point");
        break;
      case "grid":
        await this.props.layerTypeChange(layers[0], "grid");
        break;
      case "hexbin":
        await this.props.layerTypeChange(layers[0], "hexagon");
        break;
      case "heatmap":
        await this.props.layerTypeChange(layers[0], "heatmap");
        break;
    }
  }

  async _executeViewAction(viewAction) {
    const mapState = this.props.keplerGl.foo.mapState;

    switch (viewAction) {
      case "in":
        await this.props.updateMap({ zoom: mapState.zoom * 1.1 });
        break;
      case "out":
        await this.props.updateMap({ zoom: mapState.zoom * 0.9 });
        break;
      case "up":
        await this.props.updateMap({ latitude: mapState.latitude + 1 / mapState.zoom });
        break;
      case "down":
        await this.props.updateMap({ latitude: mapState.latitude - 1 / mapState.zoom });
        break;
      case "right":
        await this.props.updateMap({ longitude: mapState.longitude + 1 / mapState.zoom });
        break;
      case "left":
        await this.props.updateMap({ longitude: mapState.longitude - 1 / mapState.zoom });
        break;
      case "enhance":
        await this.props.updateMap({ zoom: mapState.zoom * 1.5 });
        break;
    }
  }

  _moveMap(lat, long) {
    this.props.updateMap({latitude: lat, longitude: long});
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
