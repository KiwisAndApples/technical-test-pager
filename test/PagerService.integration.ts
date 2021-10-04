import type { EPAdapter, MailAdapter, PersistenceAdapter, SMSAdapter, TimerAdapter } from "../src/adapters"
import { PagerService } from "../src/PagerService"
import { EPAdapterMock, MailAdapterMock, SMSAdapterMock, TimerAdapterMock, PersistenceAdapterMock } from "./mocks"

describe("PagerService", () => {
	var pagerService: PagerService

	const ePAdapterMock: EPAdapter = new EPAdapterMock()
	const timerAdapterMock: TimerAdapter = new TimerAdapterMock()
	const persistenceAdapterMock: PersistenceAdapter = new PersistenceAdapterMock()
	const mailAdapterMock: MailAdapter = new MailAdapterMock()
	const smsAdapterMock: SMSAdapter = new SMSAdapterMock()

	beforeEach(() => {
		pagerService = new PagerService(
			ePAdapterMock,
			timerAdapterMock,
			persistenceAdapterMock,
			mailAdapterMock,
			smsAdapterMock
		)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	// First use case
	test("Alert fired first time", () => {
		const spyMailAdapter = jest.spyOn(mailAdapterMock, "send")
		const spySmsAdapter = jest.spyOn(smsAdapterMock, "send")
		const spyTimerAdapter = jest.spyOn(timerAdapterMock, "setTimeout")
		const spyPeristenceAdapter = jest.spyOn(persistenceAdapterMock, "createIncident")

		pagerService.fireAlert("service_1", "Test")

		expect(spyMailAdapter).toHaveBeenCalledTimes(1)
		expect(spySmsAdapter).not.toBeCalled()
		expect(spyTimerAdapter).toBeCalledWith("service_1", 15 * 60) // 15min
		expect(spyPeristenceAdapter).toBeCalledWith("service_1", { message: "Test", escalationLevel: 0 })
	})

	// Second use case
	describe("", () => {
		beforeAll(() => {
			// set service_2 has unhealty state
			pagerService.fireAlert("service_2", "Test")
			jest.clearAllMocks()
		})

		test("Timeout on none-acknowledged alert and last level not reach", () => {
			const spyMailAdapter = jest.spyOn(mailAdapterMock, "send")
			const spySmsAdapter = jest.spyOn(smsAdapterMock, "send")
			const spyTimerAdapter = jest.spyOn(timerAdapterMock, "setTimeout")
			const spyPeristenceAdapter = jest.spyOn(persistenceAdapterMock, "updateIncidentEscalationLevel")

			pagerService.setTimeoutExpired("service_2")

			expect(spyMailAdapter).not.toBeCalled()
			expect(spySmsAdapter).toHaveBeenCalledTimes(2)
			expect(spySmsAdapter).toHaveBeenLastCalledWith("234567890", "Test")
			expect(spyTimerAdapter).toBeCalledWith("service_2", 15 * 60) // 15min
			expect(spyPeristenceAdapter).toHaveBeenCalledWith("service_2", 1)
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
			const spyMailAdapter = jest.spyOn(mailAdapterMock, "send")
			const spySmsAdapter = jest.spyOn(smsAdapterMock, "send")
			const spyTimerAdapter = jest.spyOn(timerAdapterMock, "setTimeout")
			const spyPeristenceAdapter = jest.spyOn(persistenceAdapterMock, "updateIncidentAcknowledged")

			pagerService.acknowledgeAlert("service_3")
			pagerService.setTimeoutExpired("service_3")

			expect(spyMailAdapter).not.toBeCalled()
			expect(spySmsAdapter).not.toBeCalled()
			expect(spyTimerAdapter).not.toBeCalled()
			expect(spyPeristenceAdapter).toHaveBeenCalledWith("service_3", true)
		})
	})
})
