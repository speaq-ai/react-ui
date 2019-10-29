import React, { Component } from "react";
import styled from "styled-components";
import * as Icon from "react-feather";

const Button = styled.button`
	border-radius: 100%;
	background-color: ${props => props.backgroundColor || "#6A7485"};
	color: ${props => props.color || "white"};
	font-size: 16px;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
		Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
	display: block;
	width: ${props => props.size || "36px"}
	height: ${props => props.size || "36px"}
	&:hover {
		cursor: pointer;
	}
	outline: none;
	box-shadow: 0 6px 12px 0 rgba(0,0,0,0.16);
	border: none;
`;

export default class FloatingButton extends Component {
	render() {
		const { text, children, activeIcon, icon, active, ...props } = this.props;
		const iconSize = 16;
		const DefaultIcon = Icon[icon];
		const ActiveIcon = Icon[activeIcon];
		return (
			<Button {...props}>
				{text}
				{active && activeIcon ? (
					<ActiveIcon size={iconSize} color="#fff" />
				) : (
					<DefaultIcon size={iconSize} color="#fff" />
				)}
			</Button>
		);
	}
}
