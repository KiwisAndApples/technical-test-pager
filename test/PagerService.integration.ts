import type { EPPort, MailPort, PersistencePort, SMSPort, TimerPort } from "../src/ports"
import { PagerService } from "../src/PagerService"
import { EPPortMock, MailPortMock, SMSPortMock, TimerPortMock, PersistencePortMock } from "./mocks"

describe("PagerService", () => {
	var pagerService: PagerService

	const ePPortMock: EPPort = new EPPortMock()
	const timerPortMock: TimerPort = new TimerPortMock()
	const persistencePortMock: PersistencePort = new PersistencePortMock()
	const mailPortMock: MailPort = new MailPortMock()
	const smsPortMock: SMSPort = new SMSPortMock()

	beforeEach(() => {
		pagerService = new PagerService(ePPortMock, timerPortMock, persistencePortMock, mailPortMock, smsPortMock)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	// First use case
	test("Alert fired first time", () => {
		const spyMailPort = jest.spyOn(mailPortMock, "send")
		const spySmsPort = jest.spyOn(smsPortMock, "send")
		const spyTimerPort = jest.spyOn(timerPortMock, "setTimeout")
		const spyPeristencePort = jest.spyOn(persistencePortMock, "createIncident")

		pagerService.fireAlert("service_1", "Test")

		expect(spyMailPort).toHaveBeenCalledTimes(1)
		expect(spySmsPort).not.toBeCalled()
		expect(spyTimerPort).toBeCalledWith("service_1", 15 * 60) // 15min
		expect(spyPeristencePort).toBeCalledWith("service_1", { message: "Test", escalationLevel: 0 })
	})

	// Second use case
	describe("", () => {
		beforeAll(() => {
			// set service_2 has unhealty state
			pagerService.fireAlert("service_2", "Test")
			jest.clearAllMocks()
		})

		test("Timeout on none-acknowledged alert and last level not reach", () => {
			const spyMailPort = jest.spyOn(mailPortMock, "send")
			const spySmsPort = jest.spyOn(smsPortMock, "send")
			const spyTimerPort = jest.spyOn(timerPortMock, "setTimeout")
			const spyPeristencePort = jest.spyOn(persistencePortMock, "updateIncidentEscalationLevel")

			pagerService.setTimeoutExpired("service_2")

			expect(spyMailPort).not.toBeCalled()
			expect(spySmsPort).toHaveBeenCalledTimes(2)
			expect(spySmsPort).toHaveBeenLastCalledWith("234567890", "Test")
			expect(spyTimerPort).toBeCalledWith("service_2", 15 * 60) // 15min
			expect(spyPeristencePort).toHaveBeenCalledWith("service_2", 1)
		})
	})

	// Third use case
	describe("Timeout on acknowledged alert", () => {
		beforeAll(() => {
			// set service_3 has unhealty state
			pagerService.fireAlert("service_3", "Test")
			jest.clearAllMocks()
		})

		test("", () => {
			const spyMailPort = jest.spyOn(mailPortMock, "send")
			const spySmsPort = jest.spyOn(smsPortMock, "send")
			const spyTimerPort = jest.spyOn(timerPortMock, "setTimeout")
			const spyPeristencePort = jest.spyOn(persistencePortMock, "updateIncidentAcknowledged")

			pagerService.acknowledgeAlert("service_3")
			pagerService.setTimeoutExpired("service_3")

			expect(spyMailPort).not.toBeCalled()
			expect(spySmsPort).not.toBeCalled()
			expect(spyTimerPort).not.toBeCalled()
			expect(spyPeristencePort).toHaveBeenCalledWith("service_3", true)
		})
	})
})
