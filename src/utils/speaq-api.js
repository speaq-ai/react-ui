import axios from "axios";

const BASE_URL = "http://localhost:8000/";

axios.defaults.baseURL = BASE_URL;
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";

export async function login(username, password) {
	try {
		const res = await axios.post("auth/login/", {
			username,
			password,
		});
	} catch (e) {
		console.error(e);
		return false;
	}
	return true;
}

export async function logout() {
	try {
		const res = await axios.post("auth/logout/", {});
	} catch (e) {
		console.error(e);
	}
}

export async function checkSession() {
	try {
		const res = await axios.get("auth/check/");
		return JSON.parse(res.data).is_authenticated;
	} catch (e) {
		console.error(e);
	}
}

export async function sendMessage(input, config) {
	try {
		const res = await axios.post("message/", {
			input,
			config,
		});
		return JSON.parse(res.data);
	} catch (e) {
		console.error(e);
	}
}
