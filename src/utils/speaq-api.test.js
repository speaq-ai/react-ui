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
        it('Should error if the request throws an error', async () => {
            axios.post.mockImplementation(() => {throw new Error()})
            console.error = jest.fn();

            const result = await logout();
            
            expect(console.error).toHaveBeenCalled();
        });
    });
});
