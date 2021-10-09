import type { EPPort, MailPort, PersistencePort, SMSPort, TimerPort } from "../src/ports"
import { PagerService } from "../src/PagerService"
import { EPPortMock, MailPortMock, SMSPortMock, TimerPortMock, PersistencePortMock } from "./mocks"

describe("PagerService:unit", () => {
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

	/**
	 * FireAlert
	 */
	test("fireAlert:First call", () => {
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

	test("fireAlert:Called twice in a row", () => {
		const spyMailPort = jest.spyOn(mailPortMock, "send")
		const spySmsPort = jest.spyOn(smsPortMock, "send")
		const spyTimerPort = jest.spyOn(timerPortMock, "setTimeout")
		const spyPeristencePort = jest.spyOn(persistencePortMock, "createIncident")

		pagerService.fireAlert("service_1", "Test")
		pagerService.fireAlert("service_1", "Test")

		expect(spyMailPort).toHaveBeenCalledTimes(1)
		expect(spySmsPort).not.toBeCalled()
		expect(spyTimerPort).toBeCalledWith("service_1", 15 * 60) // 15min
		expect(spyPeristencePort).toBeCalledWith("service_1", { message: "Test", escalationLevel: 0 })
	})

	/**
	 * setTimeoutExpired
	 */
	test("setTimeoutExpired:called on healthy service", () => {
		const spyMailPort = jest.spyOn(mailPortMock, "send")
		const spySmsPort = jest.spyOn(smsPortMock, "send")
		const spyTimerPort = jest.spyOn(timerPortMock, "setTimeout")

		pagerService.setTimeoutExpired("service_1")

		expect(spyMailPort).not.toBeCalled()
		expect(spySmsPort).not.toBeCalled()
		expect(spyTimerPort).not.toBeCalled()
	})

	describe("setTimeoutExpired:called on unhealthy service", () => {
		beforeAll(() => {
			// set service_1 has unhealty state
			pagerService.fireAlert("service_1", "Test")
			jest.clearAllMocks()
		})

		test("", () => {
			const spyMailPort = jest.spyOn(mailPortMock, "send")
			const spySmsPort = jest.spyOn(smsPortMock, "send")
			const spyTimerPort = jest.spyOn(timerPortMock, "setTimeout")
			const spyPeristencePort = jest.spyOn(persistencePortMock, "updateIncidentEscalationLevel")

			pagerService.setTimeoutExpired("service_1")

			expect(spyMailPort).not.toBeCalled()
			expect(spySmsPort).toHaveBeenCalledTimes(2)
			expect(spySmsPort).toHaveBeenLastCalledWith("234567890", "Test")
			expect(spyTimerPort).toBeCalledWith("service_1", 15 * 60) // 15min
			expect(spyPeristencePort).toHaveBeenCalledWith("service_1", 1)
		})
	})

	describe("setTimeoutExpired:Reach last escalation level", () => {
		beforeAll(() => {
			// set service_1 has unhealty state and reach the last escalation level
			pagerService.fireAlert("service_1", "Test")
			pagerService.setTimeoutExpired("service_1")
			jest.clearAllMocks()
		})

		test("", () => {
			const spyMailPort = jest.spyOn(mailPortMock, "send")
			const spySmsPort = jest.spyOn(smsPortMock, "send")

			pagerService.setTimeoutExpired("service_1")

			expect(spyMailPort).not.toBeCalled()
			expect(spySmsPort).not.toBeCalled()
		})
	})

	describe("setTimeoutExpired:On acknowledged incident", () => {
		beforeAll(() => {
			// set service_1 has unhealty state but acknowledged
			pagerService.fireAlert("service_1", "Test")
			pagerService.acknowledgeAlert("service_1")
			jest.clearAllMocks()
		})

		test("", () => {
			const spyMailPort = jest.spyOn(mailPortMock, "send")
			const spySmsPort = jest.spyOn(smsPortMock, "send")

			pagerService.setTimeoutExpired("service_1")

			expect(spyMailPort).not.toBeCalled()
			expect(spySmsPort).not.toBeCalled()
		})
	})

	/**
	 * acknowledgeAlert
	 */
	test("acknowledgeAlert:on healthy service", () => {
		const spyPeristencePort = jest.spyOn(persistencePortMock, "updateIncidentAcknowledged")

		pagerService.acknowledgeAlert("service_1")

		expect(spyPeristencePort).not.toBeCalled()
	})

	describe("acknowledgeAlert:on unhealthy service", () => {
		beforeAll(() => {
			// set service_2 has unhealty state
			pagerService.fireAlert("service_2", "Test")
			jest.clearAllMocks()
		})

		test("", () => {
			const spyPeristencePort = jest.spyOn(persistencePortMock, "updateIncidentAcknowledged")

			pagerService.acknowledgeAlert("service_2")

			expect(spyPeristencePort).toHaveBeenCalledWith("service_2", true)
		})
	})

	/**
	 * stopAlert
	 */
	test("stopAlert:on healthy service", () => {
		const spyPeristencePort = jest.spyOn(persistencePortMock, "updateIncidentHealthState")

		const ret = pagerService.stopAlert("service_1")

		expect(spyPeristencePort).not.toBeCalled()
		expect(ret).toBe(false)
	})

	describe("stopAlert:on unhealthy service", () => {
		beforeAll(() => {
			// set service_2 has unhealty state
			pagerService.fireAlert("service_2", "Test")
			jest.clearAllMocks()
		})

		test("", () => {
			const spyPeristencePort = jest.spyOn(persistencePortMock, "updateIncidentHealthState")

			const ret = pagerService.stopAlert("service_2")

			expect(spyPeristencePort).toBeCalledWith("service_2", true)
			expect(ret).toBe(true)
		})
	})

	describe("stopAlert:on unhealthy service twice in a row", () => {
		beforeAll(() => {
			// set service_2 has unhealty state
			pagerService.fireAlert("service_2", "Test")
			jest.clearAllMocks()
		})

		test("", () => {
			const spyPeristencePort = jest.spyOn(persistencePortMock, "updateIncidentHealthState")

			const ret1 = pagerService.stopAlert("service_2")
			const ret2 = pagerService.stopAlert("service_2")

			expect(spyPeristencePort).toHaveBeenCalledTimes(1)
			expect(ret1).toBe(true)
			expect(ret2).toBe(false)
		})
	})
})
