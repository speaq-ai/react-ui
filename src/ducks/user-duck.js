import {
	login as loginUser,
	logout as logoutUser,
	sendMessage as sendUserMessage,
	checkSession as checkUserSession,
} from "@/utils/speaq-api";

export const ACTION_TYPES = {
	LOGIN: Symbol("USER/LOGIN"),
	LOGIN_ERROR: Symbol("USER/LOGIN_ERROR"),
	LOGOUT: Symbol("USER/LOGOUT"),
	SEND_MESSAGE: Symbol("USER/SEND_MESSAGE"),
	CHECK_SESSION: Symbol("USER/CHECK_SESSION"),
};

const initialState = {
	authenticated: null,
	loginError: "",
};

// action creators
export async function login(username, password) {
	const success = await loginUser(username, password);
	return success
		? {
				type: ACTION_TYPES.LOGIN,
		  }
		: { type: ACTION_TYPES.LOGIN_ERROR, error: "Incorrect email/password" };
}

export async function logout() {
	const res = await logoutUser();
	return {
		type: ACTION_TYPES.LOGOUT,
	};
}

export async function checkSession() {
	const authenticated = await checkUserSession();
	return {
		type: ACTION_TYPES.CHECK_SESSION,
		authenticated,
	};
}

export default function reducer(state = initialState, action = {}) {
	switch (action.type) {
		case ACTION_TYPES.LOGIN:
			return { ...state, authenticated: true, loginError: null };
		case ACTION_TYPES.LOGIN_ERROR:
			return { ...state, authenticated: false, loginError: action.error };
		case ACTION_TYPES.LOGOUT:
			return { ...state, authenticated: false };
		case ACTION_TYPES.CHECK_SESSION:
			return { ...state, authenticated: action.authenticated };
		default:
			return { ...state };
	}
}
