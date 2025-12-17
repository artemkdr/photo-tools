export class Processable {
    protected element: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
    }

    public setIsProcessing(isProcessing: boolean): void {
        this.element.classList.toggle("processing", isProcessing);
    }
}
