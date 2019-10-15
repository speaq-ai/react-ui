import React, { Component } from "react";
import styled from "styled-components";

const Button = styled.button`
	border-radius: 100%;
	background-color: ${props => props.backgroundColor || "#6A7485"};
	color: ${props => props.color || "white"};
	font-size: 16px;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
		Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
	display: block;
	width: ${props => props.size || "40px"}
	height: ${props => props.size || "40px"}
	&:hover {
		cursor: pointer;
	}
	outline: none;
	box-shadow: 0 6px 12px 0 rgba(0,0,0,0.16);
	border: none;
`;

export default class FloatingButton extends Component {
	render() {
		const { text, children, ...props } = this.props;
		return (
			<Button {...props}>
				{text}
				{children}
			</Button>
		);
	}
}
