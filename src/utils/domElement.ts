export function toggleClass(element: HTMLElement, className: string) {
	element.classList.toggle(className);
}

export function rootInDarkMode() {
	return document.documentElement.getAttribute("data-theme") === "dark";
}
