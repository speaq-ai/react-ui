import React, { Component } from "react";
import { HashRouter as Router, Route, Link, Redirect } from "react-router-dom";
import PrivateRoute from "@/components/login/private-route";
import { connect } from "react-redux";
import LoginContainer from "@/containers/login";
import VisualizerContainer from "@/containers/visualizer";
import * as userActions from "@/ducks/user-duck";

class App extends Component {
	componentDidMount() {
		this.props.checkSession();
	}
	render() {
		const { authenticated, logout } = this.props;
		return (
			<div>
				{authenticated === null ? (
					<h1>Loading...</h1>
				) : (
					<Router>
						<Route path="/login" component={LoginContainer} />
						<PrivateRoute
							path="/dashboard"
							logout={logout}
							authenticated={authenticated}
							component={VisualizerContainer}
						/>
						<Route
							path="/"
							exact
							render={props => (
								<Redirect
									to={{
										pathname: "/dashboard",
										state: { from: props.location },
									}}
								/>
							)}
						/>
					</Router>
				)}
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		authenticated: state.user.authenticated,
	};
}
const mapDispatchToProps = {
	checkSession: userActions.checkSession,
	logout: userActions.logout,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(App);
