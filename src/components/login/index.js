import React, { Component } from "react";

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
		if (authenticated) {
			history.push("/dashboard");
		} else {
			await login(username.value, password.value);
		}
	};

	componentDidUpdate(prevProps) {
		const { history } = this.props;
		if (!prevProps.authenticated && this.props.authenticated) {
			history.push("/dashboard");
		}
	}

	updateFieldText = (fieldName, value) => {
		this.setState({ [fieldName]: { ...this.state[fieldName], value } });
	};
	render() {
		const { username, password } = this.state;
		return (
			<div>
				<form onSubmit={this._handleSubmit}>
					<input
						type="text"
						onChange={e => {
							this.updateFieldText("username", e.target.value);
						}}
						value={username.value}
						name="username"
						id="username"
					/>
					<input
						type="text"
						onChange={e => {
							this.updateFieldText("password", e.target.value);
						}}
						value={password.value}
						name="password"
						id="password"
					/>
					<button onClick={this._handleSubmit}>login</button>
				</form>
			</div>
		);
	}
}
