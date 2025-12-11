export class Hideable {
    protected element: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
    }

    public show(): void {
        this.element.style.display = "";
    }

    public hide(): void {
        this.element.style.display = "none";
    }
}
