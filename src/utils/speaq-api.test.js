import { login, logout, checkSession, sendMessage } from './speaq-api';
import axios from 'axios';

jest.mock('axios');

describe('speaq-api', () => {
    describe('login', () => {
        it('Should return true if the request is resolved without error', async () => {
            axios.post.mockResolvedValue({status: 200, data: ''});
            const result = await login('username', 'password');

            expect(result).toEqual(true);
        });

        it('Should return false if the request throws an error', async () => {
            axios.post.mockImplementation(() => {throw new Error()})
            console.error = jest.fn();

            const result = await login('username', 'password');
            
            expect(console.error).toHaveBeenCalled();
            expect(result).toEqual(false);
        });
    });

    describe('logout', () => {
        it('Should log error if the request throws an error', async () => {
            axios.post.mockImplementation(() => {throw new Error()})
            console.error = jest.fn();

            await logout();
            
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('checkSession', () => {
        it('Should return true if authenticated', async () => {
            axios.get.mockResolvedValue({status: 200, data: '{"is_authenticated": true}'});

            const result = await checkSession();

            expect(result).toEqual(true);
        });

        it('Should return false if not authenticated', async () => {
            axios.get.mockResolvedValue({status: 200, data: '{"is_authenticated": false}'});

            const result = await checkSession();

            expect(result).toEqual(false);
        });

        it('Should log error if request throws an error', async () => {
            axios.get.mockImplementation(() => {throw new Error()});
            console.error = jest.fn();

            await checkSession();

            expect(console.error).toHaveBeenCalled();
        });
    });
});
