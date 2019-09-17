import React, { Component } from "react";
import { Route, Redirect } from "react-router-dom";

export default class PrivateRoute extends Component {
	render() {
		const { component: Component, path, authenticated, ...rest } = this.props;
		return (
			<Route
				{...rest}
				path={path}
				render={props =>
					authenticated ? (
						<Component {...props} />
					) : (
						<Redirect
							to={{ pathname: "/login", state: { from: props.location } }}
						/>
					)
				}
			/>
		);
	}
}
