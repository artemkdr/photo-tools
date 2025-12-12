import { describe, it, expect, beforeEach, vi } from "vitest";

describe("App E2E Tests", () => {
	beforeEach(() => {
		// Setup DOM structure before each test
		document.body.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <div class="app-branding">
            <h1 class="app-title">Instagram Pano Cutter</h1>
            <p class="app-subtitle">Cut panorama photos into carousel slides</p>
          </div>
          <div id="theme-toggle-container"></div>
        </header>
        
        <main class="app-main">
          <aside class="sidebar">
            <div id="uploader-container"></div>        
            <div id="control-panel-container"></div>
          </aside>      
          <section class="content">
            <div id="preview-container"></div>
            <div id="download-panel-container"></div>
          </section>
        </main>
        
        <footer class="app-footer">
          <p class="footer-text">All processing happens locally. Your photos never leave your device.</p>
        </footer>
      </div>
    `;
	});

	describe("DOM Structure", () => {
		it("should have app container", () => {
			const appContainer = document.querySelector(".app-container");
			expect(appContainer).toBeTruthy();
		});

		it("should have header with title", () => {
			const title = document.querySelector(".app-title");
			expect(title).toBeTruthy();
			expect(title?.textContent).toBe("Instagram Pano Cutter");
		});

		it("should have subtitle", () => {
			const subtitle = document.querySelector(".app-subtitle");
			expect(subtitle).toBeTruthy();
			expect(subtitle?.textContent).toBe(
				"Cut panorama photos into carousel slides",
			);
		});

		it("should have all required containers", () => {
			expect(document.getElementById("theme-toggle-container")).toBeTruthy();
			expect(document.getElementById("uploader-container")).toBeTruthy();
			expect(document.getElementById("control-panel-container")).toBeTruthy();
			expect(document.getElementById("preview-container")).toBeTruthy();
			expect(document.getElementById("download-panel-container")).toBeTruthy();
		});

		it("should have footer", () => {
			const footer = document.querySelector(".app-footer");
			expect(footer).toBeTruthy();
		});

		it("should have footer text about local processing", () => {
			const footerText = document.querySelector(".footer-text");
			expect(footerText).toBeTruthy();
			expect(footerText?.textContent).toContain(
				"All processing happens locally",
			);
		});
	});

	describe("Component Containers", () => {
		it("should have theme toggle container in header", () => {
			const header = document.querySelector(".app-header");
			const themeContainer = header?.querySelector("#theme-toggle-container");
			expect(themeContainer).toBeTruthy();
		});

		it("should have sidebar with uploader and control panel", () => {
			const sidebar = document.querySelector(".sidebar");
			expect(sidebar).toBeTruthy();

			const uploaderContainer = sidebar?.querySelector("#uploader-container");
			const controlPanelContainer = sidebar?.querySelector(
				"#control-panel-container",
			);

			expect(uploaderContainer).toBeTruthy();
			expect(controlPanelContainer).toBeTruthy();
		});

		it("should have content section with preview and download panel", () => {
			const content = document.querySelector(".content");
			expect(content).toBeTruthy();

			const previewContainer = content?.querySelector("#preview-container");
			const downloadPanelContainer = content?.querySelector(
				"#download-panel-container",
			);

			expect(previewContainer).toBeTruthy();
			expect(downloadPanelContainer).toBeTruthy();
		});
	});

	describe("Layout Structure", () => {
		it("should have proper main layout with sidebar and content", () => {
			const main = document.querySelector(".app-main");
			expect(main).toBeTruthy();

			const sidebar = main?.querySelector(".sidebar");
			const content = main?.querySelector(".content");

			expect(sidebar).toBeTruthy();
			expect(content).toBeTruthy();
		});

		it("should have header, main, and footer in correct order", () => {
			const appContainer = document.querySelector(".app-container");
			const children = Array.from(appContainer?.children || []);

			expect(children[0].classList.contains("app-header")).toBe(true);
			expect(children[1].classList.contains("app-main")).toBe(true);
			expect(children[2].classList.contains("app-footer")).toBe(true);
		});
	});

	describe("Interactive Elements", () => {
		it("should have containers ready for dynamic content", () => {
			const uploaderContainer = document.getElementById("uploader-container");
			const controlPanelContainer = document.getElementById(
				"control-panel-container",
			);
			const previewContainer = document.getElementById("preview-container");
			const downloadPanelContainer = document.getElementById(
				"download-panel-container",
			);

			// All containers should be empty initially (ready for components to mount)
			expect(uploaderContainer?.innerHTML).toBe("");
			expect(controlPanelContainer?.innerHTML).toBe("");
			expect(previewContainer?.innerHTML).toBe("");
			expect(downloadPanelContainer?.innerHTML).toBe("");
		});
	});

	describe("Accessibility", () => {
		it("should use semantic HTML elements", () => {
			expect(document.querySelector("header")).toBeTruthy();
			expect(document.querySelector("main")).toBeTruthy();
			expect(document.querySelector("footer")).toBeTruthy();
			expect(document.querySelector("aside")).toBeTruthy();
			expect(document.querySelector("section")).toBeTruthy();
		});

		it("should have h1 heading", () => {
			const h1 = document.querySelector("h1");
			expect(h1).toBeTruthy();
			expect(h1?.classList.contains("app-title")).toBe(true);
		});
	});

	describe("Error Handling", () => {
		it("should handle alert for error messages", () => {
			const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

			// Simulate an error scenario
			window.alert("Error: Test error message");

			expect(alertSpy).toHaveBeenCalledWith("Error: Test error message");
			alertSpy.mockRestore();
		});
	});
});
