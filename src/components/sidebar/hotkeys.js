import { useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  Cross-platform helpers                                            */
/* ------------------------------------------------------------------ */
const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
export const kbdGlyph = isMac ? "⌘" : "Ctrl";

export const formatHotkey = (hk) =>
	hk
		?.replace(/mod\+/i, kbdGlyph + "+")
		.replace(/\+/g, "+")
		.toUpperCase() ?? "";

export const normaliseHotkey = (hk) =>
	hk.toLowerCase().replace(/mod\+/i, "ctrl+").replace(/\s+/g, "");

/* ------------------------------------------------------------------ */
/*  Hook: register global hotkeys                                     */
/* ------------------------------------------------------------------ */
export function useGlobalHotkeys(map) {
	useEffect(() => {
		const handler = (e) => {
			const tag = e.target?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

			const combo =
				(e.metaKey || e.ctrlKey ? "ctrl+" : "") + e.key.toLowerCase();

			const exec = map.get(combo);
			if (exec) {
				e.preventDefault();
				exec();
			}
		};

		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [map]);
}
