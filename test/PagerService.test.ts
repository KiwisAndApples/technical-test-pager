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
		const spy = jest.spyOn(ePAdapterMock, "getEscalationPolicy")
		pagerService.fireAlert("service_1", "Test")
		expect(spy).toBeCalledWith("service_1")
	})
})
