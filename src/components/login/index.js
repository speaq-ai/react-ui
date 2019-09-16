import React, { Component } from "react";
import styled from "styled-components";

const LoginContainer = styled.form`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 30px 0;
`;

const LoginButton = styled.button`
	padding: 10px 20px;
	border-radius: 3px;
	background-color: green;
	color: white;
	font-size: 1rem;
	display: block;
`;

const LoginInput = styled.input`
	display: block;
	flex: 1;
	padding: 10px 20px;
	border-radius: 3px;
	outline: none;
	border: 1px solid gray;
	font-size: 1rem;
	color: black;
	background-color: white;
	margin-bottom: 8px;
`;

export default class Login extends Component {
	state = {
		username: {
			value: "",
			error: null,
		},
		password: {
			value: "",
			error: null,
		},
	};
	_handleSubmit = async e => {
		e.preventDefault();
		const { login, history, authenticated } = this.props;
		const { username, password } = this.state;
		await login(username.value, password.value);
	};

	componentDidUpdate(prevProps) {
		const { history } = this.props;
		if (!prevProps.authenticated && this.props.authenticated) {
			history.push("/dashboard");
		}
	}
	updateFieldError = (fieldName, error) => {
		this.setState({ [fieldName]: { ...this.state[fieldName], error } });
	};
	updateFieldText = (fieldName, value) => {
		this.setState({ [fieldName]: { ...this.state[fieldName], value } });
	};
	render() {
		const { username, password } = this.state;
		return (
			<LoginContainer onSubmit={this._handleSubmit}>
				<LoginInput
					type="text"
					placeholder="username"
					onChange={e => {
						this.updateFieldText("username", e.target.value);
					}}
					value={username.value}
					name="username"
					id="username"
				/>
				<LoginInput
					type="password"
					placeholder="password"
					onChange={e => {
						this.updateFieldText("password", e.target.value);
					}}
					value={password.value}
					name="password"
					id="password"
				/>
				<LoginButton onClick={this._handleSubmit}>login</LoginButton>
			</LoginContainer>
		);
	}
}
