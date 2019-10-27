import React, { Component, Fragment } from "react";
import { Route, Redirect } from "react-router-dom";
import styled from "styled-components";
import { LogOut } from "react-feather";

const NavContainer = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	background-color: #2b4059;
	padding: 10px;
	box-shadow: 0 6px 12px 0 rgba(0, 0, 0, 0.16);
`;

const Logo = styled.div`
	background-color: #15a5fa;
	border-radius: 100px;
	background-repeat: no-repeat;
	background-position: center;
	background-size: contain;
	color: #fff;
	font-size: 18px;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
		Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
	padding: 3px 10px;
`;

export default class PrivateRoute extends Component {
	render() {
		const {
			component: Component,
			path,
			logout,
			authenticated,
			...rest
		} = this.props;
		return (
			<Route
				{...rest}
				path={path}
				render={props =>
					authenticated ? (
						<Fragment>
							<NavContainer>
								<Logo>speaqAI</Logo>
								<LogOut color="white" size="20" onClick={logout} />
							</NavContainer>
							<Component {...props} />
						</Fragment>
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
