import { expect } from 'chai';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import App from '../src/App';
import {
  collection,
  addDoc,
  onSnapshot,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { getFirebaseConfig } from '@/src/lib/firebaseConfig';
import {db} from '@/src/lib/firebaseClient'

describe("App Integration Flow", () => {

    async function clearCollection(name: string) {
        const snapshot = await getDocs(collection(db,name));
        await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)))

    }

    beforeEach(async () => {
        await clearCollection('items')
    })


  it("renderiza tela inicial com botões de escolha", () => {
    render(<App />);
    expect(screen.getByText(/Como você deseja acessar/i)).to.exist;
    expect(screen.getByText(/Sou Aluno/i)).to.exist;
    expect(screen.getByText(/Sou Professor/i)).to.exist;
  });

  it("navega para StudentJoin ao clicar em Sou Aluno", () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Sou Aluno/i));
    expect(screen.getByText(/Entrar no Quiz/i)).to.exist;
  });

  it("navega para TeacherDashboard ao clicar em Sou Professor", () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Sou Professor/i));
    expect(screen.getByText(/Acesso do Professor/i)).to.exist;
  });

  it("volta para tela inicial ao clicar em Voltar", () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Sou Professor/i));
    fireEvent.click(screen.getByText(/Voltar para Início/i));
    expect(screen.getByText(/Como você deseja acessar/i)).to.exist;
  });

   it('navigates between roles correctly', async () => {
    render(<App />);

    expect(screen.getByText('Como você deseja acessar?')).to.exist;

    fireEvent.click(screen.getByText('Sou Aluno'));
    await waitFor(() => {
      expect(screen.getByText('Entrar no Quiz')).to.exist;
      expect(screen.getByPlaceholderText('PIN')).to.exist;
    });

    fireEvent.click(screen.getByText('← Voltar para Início'));
    await waitFor(() => {
      expect(screen.getByText('Como você deseja acessar?')).to.exist;
    });

    fireEvent.click(screen.getByText('Sou Professor'));
    await waitFor(() => {
      expect(screen.getByText('Acesso do Professor')).to.exist;
    });
  });

     it("Deve validar as chaves do ambiente de teste", () => {
        const config = getFirebaseConfig();
        expect(config.firebaseConfig.projectId).to.equal('demo-test');
        expect(config.databaseId).to.equal('test');
    });
});
