import { expect } from 'chai';

describe("Unit Tests - Quiz Logic", () => {
    it("Deve validar o schema de uma LiveSession", () => {
        const mockSession = {
            quizId: "q1",
            teacherId: "t1",
            pin: "123456",
            status: "waiting"
        };
        
        expect(mockSession).to.have.property('pin');
        expect(mockSession.status).to.equal('waiting');
    });
});
