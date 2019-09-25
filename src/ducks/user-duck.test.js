import { login, logout, ACTION_TYPES } from './user-duck';
import { login as apiLogin, logout as apiLogout } from '@/utils/speaq-api'

jest.mock('@/utils/speaq-api')  // Automock speaq-api methods, define implmentation in tests

describe('User Duck', () => {
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

    it('Should return logout action type', async () => {
        const response = {
            type: ACTION_TYPES.LOGOUT,
        }

        apiLogout.mockImplementation(() => '')
        const result = await logout();
        expect(result).toEqual(response)
    });
})