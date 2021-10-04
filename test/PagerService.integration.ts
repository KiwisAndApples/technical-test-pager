import type { EPAdapter, MailAdapter, SMSAdapter, TimerAdapter } from "../src/adapters"
import { PagerService } from "../src/PagerService"
import { EPAdapterMock, MailAdapterMock, SMSAdapterMock, TimerAdapterMock } from "./mocks"

describe("PagerService", () => {
	var pagerService: PagerService

	const ePAdapterMock: EPAdapter = new EPAdapterMock()
	const timerAdapterMock: TimerAdapter = new TimerAdapterMock()
	const mailAdapterMock: MailAdapter = new MailAdapterMock()
	const smsAdapterMock: SMSAdapter = new SMSAdapterMock()

	beforeEach(() => {
		pagerService = new PagerService(ePAdapterMock, timerAdapterMock, mailAdapterMock, smsAdapterMock)
	})

	// First use case
	test("Alert fired first time", () => {
		const spyMailAdapter = jest.spyOn(mailAdapterMock, "send")
		const spySmsAdapter = jest.spyOn(smsAdapterMock, "send")
		const spyTimerAdapter = jest.spyOn(timerAdapterMock, "setTimeout")
		pagerService.fireAlert("service_1", "Test")

		expect(spyMailAdapter).toHaveBeenCalledTimes(1)
		expect(spySmsAdapter).not.toBeCalled()
		expect(spyTimerAdapter).toBeCalledWith("service_1", 15 * 60) // 15min
	})
	
})
