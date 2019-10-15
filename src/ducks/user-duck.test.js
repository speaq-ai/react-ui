import reducer, { login, logout, checkSession, ACTION_TYPES } from './user-duck';
import { login as apiLogin, logout as apiLogout, checkSession as apiCheckSession } from '@/utils/speaq-api'

jest.mock('@/utils/speaq-api')  // Automock speaq-api methods, define implmentation in tests

describe('User Duck', () => {
    describe('Login', () => {
        it('Should return login action type when provided valid credentials', async () => {
            const username = 'user';
            const password = 'password';
            const response = {
                type: ACTION_TYPES.LOGIN
            }
    
            apiLogin.mockImplementation(() => true);
            const result = await login(username, password);
            expect(result).toEqual(response)
        });
    
        it('Should return login error action type when provided invalid credentials', async () => {
            const username = 'user';
            const password = 'password';
            const response = {
                error: "Incorrect email/password",
                type: ACTION_TYPES.LOGIN_ERROR
            }
    
            apiLogin.mockImplementation(() => false);
            const result = await login(username, password);
            expect(result).toEqual(response)
        });
    });

    it('Should return logout action type', async () => {
        const response = {
            type: ACTION_TYPES.LOGOUT,
        }

        apiLogout.mockImplementation(() => '')
        const result = await logout();
        expect(result).toEqual(response)
    });

    describe('Session Check', ()=> {
        it('Should return check session action type and authentication status', async () => {
            const response = {
                type: ACTION_TYPES.CHECK_SESSION,
                authenticated: true
            }

            apiCheckSession.mockImplementation(() => true);
            const result = await checkSession();
            expect(result).toEqual(response)
        });

        it('Should return check session action type and authentication status', async () => {
            const response = {
                type: ACTION_TYPES.CHECK_SESSION,
                authenticated: true
            }

            apiCheckSession.mockImplementation(() => true);
            const result = await checkSession();
            expect(result).toEqual(response)
        });
    });

    // Assumes default state
    describe('Reducer', () => {
        let action;

        beforeEach(() => {
            action = {
                type: undefined
            }
        });

        it('Should return updated state when log in action is passed', () => {
            action['type'] = ACTION_TYPES.LOGIN;

            const state = reducer(undefined, action);

            expect(state.authenticated).toEqual(true);
            expect(state.loginError).toEqual(null);
        });

        it('Should return updated state when log in error action is passed', () => {
            action['type'] = ACTION_TYPES.LOGIN_ERROR;

            const state = reducer(undefined, action);

            expect(state.authenticated).toEqual(false);
            expect(state.loginError).not.toBeNull();
        });

        it('Should return updated state when log out action is passed', () => {
            action['type'] = ACTION_TYPES.LOGOUT;

            const state = reducer(undefined, action);

            expect(state.authenticated).toEqual(false);
            expect(state.loginError).toEqual('');
        });

        it('Should return updated state when authenticated check session action is passed', () => {
            action['type'] = ACTION_TYPES.CHECK_SESSION;
            action['authenticated'] = true;

            const state = reducer(undefined, action);

            expect(state.authenticated).not.toBeNull()
            expect(state.loginError).toEqual('');
        });

        it('Should return updated state when check unauthenticated session action is passed', () => {
            action['type'] = ACTION_TYPES.CHECK_SESSION;
            action['authenticated'] = false;

            const state = reducer(undefined, action);

            expect(state.authenticated).not.toBeNull()
            expect(state.loginError).toEqual('');
        });

        it('Should return unmodified state when any other action type is passed', () => {
            const inputState = {
                authenticated: false,
                loginError: 'Wrong login'
            }

            const state = reducer(inputState, action);

            expect(state).toEqual(inputState);
        });
    })
})