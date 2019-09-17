import React, { Component } from "react";
import Login from "@/components/login";
import { connect } from "react-redux";
import * as userActions from "@/ducks/user-duck";
class LoginContainer extends Component {
	render() {
		return <Login {...this.props} />;
	}
}

function mapStateToProps(state) {
	return {
		authenticated: state.user.authenticated,
	};
}
const mapDispatchToProps = {
	login: userActions.login,
	logout: userActions.logout,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(LoginContainer);
