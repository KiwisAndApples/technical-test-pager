import type { EPPort, MailPort, PersistencePort, SMSPort, TimerPort } from "../src/ports"
import { PagerService } from "../src/PagerService"
import { EPPortMock, MailPortMock, SMSPortMock, TimerPortMock, PersistencePortMock } from "./mocks"

describe("PagerService:Integration", () => {
	var pagerService: PagerService

	const ePPortMock: EPPort = new EPPortMock()
	const timerPortMock: TimerPort = new TimerPortMock()
	const persistencePortMock: PersistencePortMock = new PersistencePortMock()
	const mailPortMock: MailPort = new MailPortMock()
	const smsPortMock: SMSPort = new SMSPortMock()

	beforeEach(() => {
		pagerService = new PagerService(ePPortMock, timerPortMock, persistencePortMock, mailPortMock, smsPortMock)
	})

	afterEach(() => {
		jest.clearAllMocks()
		persistencePortMock.reset()
	})

	// First use case
	// Given a Monitored Service in a Healthy State,
	// when the Pager receives an Alert related to this Monitored Service,
	// then the Monitored Service becomes Unhealthy,
	// the Pager notifies all targets of the first level of the escalation policy,
	// and sets a 15-minutes acknowledgement delay
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
	// Given a Monitored Service in an Unhealthy State,
	// the corresponding Alert is not Acknowledged
	// and the last level has not been notified,
	// when the Pager receives the Acknowledgement Timeout,
	// then the Pager notifies all targets of the next level of the escalation policy
	// and sets a 15-minutes acknowledgement delay.
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
	// Given a Monitored Service in an Unhealthy State
	// when the Pager receives the Acknowledgement
	// and later receives the Acknowledgement Timeout,
	// then the Pager doesn't notify any Target
	// and doesn't set an acknowledgement delay.
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

	// Fourth use case
	// Given a Monitored Service in an Unhealthy State,
	// when the Pager receives an Alert related to this Monitored Service,
	// then the Pager doesn’t notify any Target
	// and doesn’t set an acknowledgement delay
	describe("Do not refire alert on unhealthy service", () => {
		beforeAll(() => {
			// set service_4 has unhealty state
			pagerService.fireAlert("service_4", "Test")
			jest.clearAllMocks()
		})

		test("", () => {
			const spyMailPort = jest.spyOn(mailPortMock, "send")
			const spySmsPort = jest.spyOn(smsPortMock, "send")
			const spyTimerPort = jest.spyOn(timerPortMock, "setTimeout")

			pagerService.fireAlert("service_4", "Test")

			expect(spyMailPort).not.toBeCalled()
			expect(spySmsPort).not.toBeCalled()
			expect(spyTimerPort).not.toBeCalled()
		})
	})

	// Fifth use case
	// Given a Monitored Service in an Unhealthy State,
	// when the Pager receives a Healthy event related to this Monitored Service
	// and later receives the Acknowledgement Timeout,
	// then the Monitored Service becomes Healthy,
	// the Pager doesn’t notify any Target
	// and doesn’t set an acknowledgement delay
	describe("No notification on timeoutExpired and incident state is back to healthy", () => {
		beforeAll(() => {
			// set service_5 has unhealty state
			pagerService.fireAlert("service_5", "Test")
			jest.clearAllMocks()
		})

		test("", () => {
			const spyMailPort = jest.spyOn(mailPortMock, "send")
			const spySmsPort = jest.spyOn(smsPortMock, "send")
			const spyTimerPort = jest.spyOn(timerPortMock, "setTimeout")
			const spyPeristencePort = jest.spyOn(persistencePortMock, "updateIncidentHealthState")

			pagerService.stopAlert("service_5")
			pagerService.setTimeoutExpired("service_3")

			expect(spyMailPort).not.toBeCalled()
			expect(spySmsPort).not.toBeCalled()
			expect(spyTimerPort).not.toBeCalled()
			expect(spyPeristencePort).toHaveBeenCalledWith("service_5", true)
		})
	})
})
