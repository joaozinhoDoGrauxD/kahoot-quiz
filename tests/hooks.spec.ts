import {useLiveSession} from '@/src/hooks/useLiveSession';
import {expect} from 'chai';
import sinon from 'sinon';
import {renderHook, act} from '@testing-library/react'

describe("Hooks Tests", () => {

    describe("useLiveSession", () => {
       it ("1+1 need be equal 2", () => {
         expect(1+1).to.be.equal(2)
       })
    })

    describe("TeacherDashboard", () => {
       it ("1+1 need be equal 2", () => {
         expect(1+1).to.be.equal(2)
       })
    })

})



