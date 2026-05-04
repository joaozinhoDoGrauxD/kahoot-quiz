import { render, fireEvent, screen } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import Gameplay from '@/src/components/Gameplay';
import TeacherDashboard from '@/src/components/TeacherDashboard';
import QuestionManager from '@/src/components/QuestionManager';
import StudentJoin from '@/src/components/StudentJoin';

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
    it("desabilita botão sem PIN/nome", () => {
      const onJoin = sinon.fake();
      render(<StudentJoin onJoin={onJoin} />);
      const button = screen.getByText("Entrar no Jogo");
      expect(button).to.have.property("disabled", true);
    });
  });
});
