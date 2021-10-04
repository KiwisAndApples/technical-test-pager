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
	test("Alert fired first time", () => {
		const spyMailAdapter = jest.spyOn(mailAdapterMock, "send")
		const spySmsAdapter = jest.spyOn(smsAdapterMock, "send")
		const spyTimerAdapter = jest.spyOn(timerAdapterMock, "setTimeout")
		const spyPeristenceAdapter = jest.spyOn(persistenceAdapterMock, "updateIncident")

		// set service_1 has unhealty state
		pagerService.fireAlert("service_2", "Test")
		// and the last level has not been notified,
		pagerService.setTimeoutExpired("service_2")

		expect(spyMailAdapter).toBeCalled()
		expect(spySmsAdapter).toHaveBeenCalledTimes(2)
		expect(spySmsAdapter).toHaveBeenLastCalledWith("234567890", "Test")
		expect(spyTimerAdapter).toBeCalledWith("service_2", 15 * 60) // 15min
		expect(spyPeristenceAdapter).toHaveBeenCalled()
	})
})
