import React, { Component } from "react";
import styled from "styled-components";
import { sendMessage } from "@/utils/speaq-api";
import { processCsvData } from "kepler.gl/processors";
import sacramentoRealEstate from "../../data/SacramentoRealEstate";
import earthquake from "../../data/Earthquake";
import FileSaver from "file-saver";
import { Send } from "react-feather";
const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #white;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  height: 100%;
  box-shadow: 0 6px 12px 0 rgba(0, 0, 0, 0.16);
`;

const MessageInput = styled.input`
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

const MessageButton = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 3px;
  outline: none;
  color: white;
  background-color: #15a5fa;
  font-size: 0.6rem;
`;

const ResponseContainer = styled.div`
  height: 100%;
  background-color: rgba(43, 64, 89, 0.95);
  max-height: calc(100% - 40px);
  overflow: scroll;
`;

const ChatTitle = styled.h3``;

const MessageForm = styled.form`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  margin: 0;
  padding: 5px 0;
  background-color: #2b4059;
  box-shadow: 0 6px 12px 0 rgba(0, 0, 0, 0.16);
`;

const Response = styled.p`
  margin: 0;
  padding: 1em;
  border-bottom: 1px solid white;
`;

const InputFormatToggle = styled.input``;

const OutputFormatToggle = styled.input``;

const FormatToggleContainer = styled.div`
  p {
    font-size: 12px;
  }
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
  };

  state = {
    inputText: "",
    responses: [],
    speechAudio: null,
    nextDatasetId: 0,
  };

  constructor(props) {
    super(props);
  }

  _playSpeechAudio = speech => {
    const byteData = atob(speech);
    const byteNums = new Array(byteData.length);
    for (let i = 0; i < byteData.length; i++) {
      byteNums[i] = byteData.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNums);
    const speechUrl = URL.createObjectURL(new Blob([byteArray]));
    const speechAudio = new Audio(speechUrl);
    speechAudio.play();
  };

  _sendMessage = async e => {
    e.preventDefault();
    this.setState({
      inputText: "",
      responses: [...this.state.responses, "..."],
    });
    const { inputFormat, outputFormat } = this.props;
    const res = await sendMessage(this.state.inputText, {
      inputFormat,
      outputFormat,
    });
    this.setState({ responses: this.state.responses.slice(0, -1) });
    const responses = this.state.responses.concat(
      res.text ? res.text : "no response..."
    );
    if (outputFormat === "speech") {
      this._playSpeechAudio(res.speech);
    }
    this.setState({ responses });

    switch (res.action) {
      case null:
        // do nothing
        break;

      case this.ActionKeys.AddFilter:
        this._addFilter(
          res.variables.filter_field,
          res.variables.sys_number,
          res.variables.filter_comparison
        );
        break;

      case this.ActionKeys.LoadDataset:
        this._loadDataset(res.variables.dataset_name);
        break;

      case this.ActionKeys.Clear:
        this._clearDatasets();
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
      price: "price",
      beds: "beds",
      baths: "baths",
      year: "year",
      magnitude: "magnitude",
      depth: "depth",
    };
    return fieldMap[field];
  }

  _clearDatasets() {
    var i;
    for (i = 0; i < this.state.nextDatasetId; i++) {
      this.props.removeDataset("" + i);
    }

    this.setState({ nextDatasetId: 0 });
  }

  async _loadDataset(datasetName) {
    var data = this._resolveDataset(datasetName);

    await this.props.addDataToMap({
      datasets: [
        {
          info: {
            label: datasetName,
            id: "" + this.state.nextDatasetId,
          },
          data: processCsvData(data),
        },
      ],
    });

    await this.setState({ nextDatasetId: this.state.nextDatasetId + 1 });
  }

  _resolveDataset(datasetName) {
    var datasetMap = {
      Earthquake: earthquake,
      "Sacramento real estate": sacramentoRealEstate,
    };

    return datasetMap[datasetName];
  }

  _renderResponses() {
    return this.state.responses.map((response, i) => (
      <Response key={i}>{response}</Response>
    ));
  }

  _handleFormatToggle = (type, e) => {
    this.setState({
      config: {
        ...this.state.config,
        [type]: e.target.checked ? "speech" : "text",
      },
    });
  };

  render() {
    const { inputFormat, outputForamt } = this.props;
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
