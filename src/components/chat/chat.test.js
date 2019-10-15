import React from "react";
import { shallow } from "enzyme";
import {
  Chat,
  ResponseContainer,
  Response,
  MessageForm,
  MessageButton,
  MessageInput,
} from "./index";
import { sendMessage } from "@/utils/speaq-api";

jest.mock("@/utils/speaq-api"); // Automock speaq-api methods, define implmentation in tests

describe("<Chat />", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<Chat />);
  });

  it("Should update the state when text is input", () => {
    const message = "Message";
    const input = wrapper.find(MessageInput);

    input.simulate("change", { target: { value: message } });
    expect(wrapper.state().inputText).toBe(message);
  });

  it("Should reset the state.inputText when message is sent", async () => {
    sendMessage.mockResolvedValue("Responded message");

    const message = "Message";
    const input = wrapper.find(MessageInput);
    const preventDefault = jest.fn(); // Pretends to be event

    input.simulate("change", { target: { value: message } });
    await wrapper.instance()._sendMessage({ preventDefault });
    expect(wrapper.state().inputText).toBe("");
  });

  it("Should update state.responses with the response after a message is sent", async () => {
    const message = "Message";
    const response = "Response";
    const input = wrapper.find(MessageInput);
    const preventDefault = jest.fn(); // Pretends to be event
    const expectedResponseLength = wrapper.state().responses.length + 1;

    sendMessage.mockResolvedValue({ text: response });

    input.simulate("change", { target: { value: message } });
    await wrapper.instance()._sendMessage({ preventDefault });
    expect(wrapper.state().responses.length).toBe(expectedResponseLength);
    expect(wrapper.state().responses[0]).toBe(response);
  });

  it("When a new response is received, a new <Response> should appear", async () => {
    const message = "Message";
    const response = "Response";
    const input = wrapper.find(MessageInput);
    const preventDefault = jest.fn(); // Pretends to be event
    const expectedResponseLength = wrapper.state().responses.length + 1;

    sendMessage.mockResolvedValue({ text: response });

    input.simulate("change", { target: { value: message } });
    expect(wrapper.find(Response)).toHaveLength(0);
    await wrapper.instance()._sendMessage({ preventDefault });
    expect(wrapper.state().responses.length).toBe(expectedResponseLength);
    expect(wrapper.state().responses[0]).toBe(response);
    expect(wrapper.find(Response)).toHaveLength(1);
    expect(
      wrapper
        .find(Response)
        .first()
        .text()
    ).toBe(response);
  });
});
