import { TimerPort } from "../../src/ports"

export class TimerPortMock implements TimerPort {
	setTimeout(id: string, time: number): boolean {
		return true
	}
}
