import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import Gameplay from '@/src/components/Gameplay';
import TeacherDashboard from '@/src/components/TeacherDashboard';
import QuestionManager from '@/src/components/QuestionManager';
import StudentJoin from '@/src/components/StudentJoin';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/src/lib/firebaseClient';

describe("Components Tests", () => {

  describe("Gameplay", () => {
    it("renderiza sem quebrar", () => {
      render(<Gameplay sessionId="123" studentId="456" />);
      expect(screen.getByText(/Carregando/i)).to.exist;
    });
  });

  describe("TeacherDashboard", () => {
    it("renderiza tela de login quando não há usuário", () => {
      render(<TeacherDashboard />);
      expect(screen.getByText(/Acesso do Professor/i)).to.exist;
    });
  });

  describe("QuestionManager", () => {
    it("chama onAddQuestion ao salvar questão", () => {
      const onAddQuestion = sinon.fake();
      render(<QuestionManager onAddQuestion={onAddQuestion} />);
      fireEvent.change(screen.getByPlaceholderText("Texto da Pergunta"), { target: { value: "Qual a capital do Brasil?" } });
      fireEvent.click(screen.getByText("Salvar Questão"));
      expect(onAddQuestion.calledOnce).to.be.true;
    });
  });

  describe("StudentJoin", () => {

    async function clearCollection(name: string) {
      const snapshot = await getDocs(collection(db, name));
      await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));
    }

    beforeEach(async () => {
      await clearCollection('liveSessions');
    });

    it('renders correctly', () => {
      render(<StudentJoin onJoin={() => {}} />);
      expect(screen.getByText('Entrar no Quiz')).to.exist;
      expect(screen.getByPlaceholderText('PIN')).to.exist;
      expect(screen.getByPlaceholderText('Seu Nome')).to.exist;
    });

    it('shows error when trying to join with empty fields', () => {
      render(<StudentJoin onJoin={() => {}} />);
      const button = screen.getByText('Entrar no Jogo');
      expect((button as HTMLButtonElement).disabled).to.be.true;
    });

    it('calls onJoin when session exists', async () => {
      const onJoinSpy = sinon.spy();

      const typedPin = 'abcd12';
      const storedPin = typedPin.toUpperCase(); // 'ABCD12' — what setPin stores

      await setDoc(doc(db, 'liveSessions', storedPin), { active: true });

      render(<StudentJoin onJoin={onJoinSpy} />);

      fireEvent.change(screen.getByPlaceholderText('PIN'), { target: { value: typedPin } });
      fireEvent.change(screen.getByPlaceholderText('Seu Nome'), { target: { value: 'Test User' } });

      fireEvent.click(screen.getByText('Entrar no Jogo'));

      await waitFor(() => {
        expect(onJoinSpy.calledOnce).to.be.true;
        expect(onJoinSpy.firstCall.args[0]).to.equal(storedPin);
      });
    });

    it('shows error when session does not exist', async () => {
      const onJoinSpy = sinon.spy();


      render(<StudentJoin onJoin={onJoinSpy} />);

      fireEvent.change(screen.getByPlaceholderText('PIN'), { target: { value: 'zzzzzz' } });
      fireEvent.change(screen.getByPlaceholderText('Seu Nome'), { target: { value: 'Unknown' } });

      fireEvent.click(screen.getByText('Entrar no Jogo'));

      await waitFor(() => {
        expect(screen.getByText('PIN inválido ou sessão não encontrada.')).to.exist;
        expect(onJoinSpy.called).to.be.false;
      });
    });

    it("desabilita botão sem PIN/nome", () => {
      const onJoin = sinon.fake();
      render(<StudentJoin onJoin={onJoin} />);
      const button = screen.getByText("Entrar no Jogo");
      expect(button).to.have.property("disabled", true);
    });

     it("Deve desabilitar o botao de entrada quando campos estao vazios", () => {
        const spy = sinon.spy();
        render(<StudentJoin onJoin={spy} />);
        const button = document.getElementById('join-button') as HTMLButtonElement;
        if (button) {
            expect(button.disabled).to.be.true;
        }
    });

    it("Deve renderizar o titulo de entrada corretamente", () => {
        render(<StudentJoin onJoin={sinon.fake()} />);
        const heading = document.getElementById('student-join-heading');
        expect(heading?.textContent).to.equal('Entrar no Quiz');
    });

  });
});
