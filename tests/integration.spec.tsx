import { expect } from 'chai';
import { render, fireEvent, screen } from '@testing-library/react';
import App from '../src/App';

describe("App Integration Flow", () => {
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
});
