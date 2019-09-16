import {
	login as loginUser,
	logout as logoutUser,
	sendMessage as sendUserMessage,
	checkSession as checkUserSession,
} from "@/utils/speaq-api";

const ACTION_TYPES = {
	LOGIN: Symbol("USER/LOGIN"),
	LOGOUT: Symbol("USER/LOGOUT"),
	SEND_MESSAGE: Symbol("USER/SEND_MESSAGE"),
	CHECK_SESSION: Symbol("USER/CHECK_SESSION"),
};

const initialState = {
	authenticated: null,
};

// action creators
export async function login(username, password) {
	const res = await loginUser(username, password);
	return {
		type: ACTION_TYPES.LOGIN,
	};
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
			return { ...state, authenticated: true };
			break;
		case ACTION_TYPES.LOGOUT:
			return { ...state, authenticated: false };
			break;
		case ACTION_TYPES.CHECK_SESSION:
			return { ...state, authenticated: action.authenticated };
			break;
		default:
			return { ...state };
			break;
	}
}
