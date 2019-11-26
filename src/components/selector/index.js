import React from "react";
import Popup from "reactjs-popup";
import styled from "styled-components";
import FloatingButton from "@/components/common/floating-button";
import { ArrowRight } from "react-feather";

const Header = styled.h1`
  font-family: Arial, Helvetica, sans-serif;
  margin: 0 0 1rem 0;
  padding: 0;
`;

const ModalContainer = styled.div`
  margin: 0;
  padding: 1em;
  background-color: #2b4059;
  color: whitesmoke;
`

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const SearchForm = styled.form`
  display: flex;
  flex-direction: row;
  justify-content: space-around;

  input[type=text] {
    width: 80%;
  }
`;

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  > {
    &:nth-child(even) {
      background-color: #2D4A69;
    }

    &:nth-child(odd) {
      background-color: #436d9b
    }
  }
`;

const Result = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  * {
    color: inherit;
    font-family: Arial, Helvetica, sans-serif;
    text-decoration: none;
  }
`;

const SelectButton = styled.button`
  border-radius: 20%;
  margin: 0;
  padding: 0.25rem;
  background-color: #6A7485;
  outline: none;
  border: none;
`;

const FakeResults = [
  {name: "Sacramento Real Estate", link: "#"},
  {name: "California Earthquakes", link: "#"},
  {name: "New York Airbnb", link: "#"}
]

export default class SelectorPopup extends React.Component {
  submitHandler = () => {
    alert("Not yet implemented");
  }
  render() {
    return (
      <Popup
        trigger={<FloatingButton icon="Search" />}
        contentStyle={{padding: "0px", border:"none"}}
        modal
        closeOnDocumentClick
      >
        <ModalContainer>
          <Header>Search for a Dataset</Header>
          <ModalContent>
            <SearchForm onSubmit={this.submitHandler}>
              <input type="text"></input>
              <input type="submit"></input>
            </SearchForm>
            <ResultsContainer>
              {FakeResults.map(result => (
                <Result>
                  <a href={result.link}>{result.name}</a>
                  <SelectButton><ArrowRight /></SelectButton>
                </Result>
              ))}
            </ResultsContainer>
          </ModalContent>
        </ModalContainer>
      </Popup>
    );
  }
}
