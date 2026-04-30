import { render } from '@testing-library/react';
import Gameplay from '@/src/components/Gameplay';
import TeacherDashboard from '@/src/components/TeacherDashboard';
import QuestionManager from '@/src/components/QuestionManager';
import StudentJoin from '@/src/components/StudentJoin';
import sinon from 'sinon';

describe("Components Tests", () => {

    describe("Gameplay", () => {
       it ("renders Gameplay component", () => {
           const sessionId: string = '123'
           const studentId: string = '412243214'
           render(<Gameplay sessionId={sessionId} studentId={studentId} />);
       })
    })

    describe("TeacherDashboard", () => {
       it ("renders TeacherDashboard component ", () => {
         render(<TeacherDashboard />);
       })
    })
    describe("QuestionManager", () => {
       it ("renders QuestionManager component", () => {
         const onAddQuestion = sinon.fake();
         render(<QuestionManager onAddQuestion={onAddQuestion}/>)
       })
    })

    describe("StudentJoin", () => {
       it ("renders StudentJoin component", () => {
          const onJoin = sinon.fake();
          render(<StudentJoin onJoin={onJoin} />)
       })
    })
})
