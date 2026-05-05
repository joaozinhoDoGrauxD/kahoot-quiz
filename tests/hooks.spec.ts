import { useLiveSession } from '@/src/hooks/useLiveSession';
import { expect } from 'chai';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { renderHook, act } from '@testing-library/react';
import { db } from '@/src/lib/firebaseClient';

describe("Hooks Tests", () => {

  describe("useLiveSession", () => {

    async function clearCollection(name: string) {
      const snapshot = await getDocs(collection(db, name));
      await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));
    }

    beforeEach(async () => {
      await clearCollection('liveSessions');
    });

    it('should return initial state of null and loading true when no sessionId is provided', () => {
      const { result } = renderHook(() => useLiveSession(''));

      expect(result.current.session).to.be.null;
      expect(result.current.loading).to.be.true;
    });

    it('should call onSnapshot and update session state', async () => {
      const sessionId = 'test-session-1';
      const mockData = { title: 'Test Session' };

      await setDoc(doc(db, 'liveSessions', sessionId), mockData);

      const { result } = renderHook(() => useLiveSession(sessionId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      expect(result.current.loading).to.be.false;
      expect(result.current.session).to.deep.equal({ id: sessionId, ...mockData });
});
  
   it("Deve iniciar com loading true", () => {
        const { result } = renderHook(() => useLiveSession('session_123'));
        expect(result.current.loading).to.be.true;
    });

    it("Deve seguir o schema de status do blueprint", () => {
        const { result } = renderHook(() => useLiveSession('session_123'));
        if (result.current.session) {
            expect(result.current.session.status).to.be.oneOf(['waiting', 'active', 'finished']);
        }
    });

});
});
