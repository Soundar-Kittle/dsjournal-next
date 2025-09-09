import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatHotkey } from "./hotkeys";
import Link from "next/link";

export const MenuSection = ({
	title,
	itemPad,
	items,
	collapsed,
	openIdx,
	pathname,
	startIndex,
	searchTerm,
	toggleDropdown,
	keyToggleDropdown,
	keyNavigate,
	setRef,
	showBadge,
	showHotkeys,
}) => {
	if (items.length === 0) return null;

	const ACTIVE_BAR =
		"bg-[var(--color-primary)]/20 text-[var(--color-primary)] " +
		"before:content-[''] before:absolute before:-left-[2px] " +
		"before:top-1/2 before:-translate-y-1/2 " +
		"before:h-8 before:w-1.5 before:rounded-full " +
		"before:bg-[var(--color-primary)]";

	return (
		<section className="mb-6">
			{!collapsed && (
				<h3 className="px-4 py-2 text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
					{title}
				</h3>
			)}
			<ul>
				{items.map((item, idx) => {
					const absoluteIdx = idx + startIndex;
					const isActive =
						pathname === item.path ||
						item.subItems?.some((s) => s.path === pathname);

					const autoOpen =
						!!searchTerm &&
						item.subItems?.some(
							(s) =>
								s.title.toLowerCase().includes(searchTerm) ||
								s.path.toLowerCase().includes(searchTerm)
						);

					const isOpen = autoOpen || openIdx === absoluteIdx;

					if (item.subItems) {
						return (
							<li
								key={absoluteIdx}
								ref={(el) => setRef(el, absoluteIdx)}
								className="relative mb-1"
								title={collapsed ? item.title : undefined}
							>
								<button
									onClick={() => toggleDropdown(absoluteIdx)}
									onKeyDown={keyToggleDropdown(absoluteIdx)}
									aria-expanded={isOpen}
									aria-controls={`submenu-${absoluteIdx}`}
									className={`
                    relative w-full flex items-center rounded-md
                    hover:bg-[var(--color-primary)]/10 transition-colors overflow-hidden
                    ${itemPad}
                    ${collapsed ? "justify-center" : "justify-between"}
                    ${isActive ? ACTIVE_BAR : "text-[var(--color-foreground)]"}
                  `}
								>
									<div className="flex items-center">
										{item.icon}
										{!collapsed && (
											<span className="ml-3 font-medium">{item.title}</span>
										)}
									</div>
									{!collapsed && (
										<div className="flex items-center ml-auto">
											{showBadge && item.badge && (
												<span className="bg-[var(--color-primary)]/[0.1] text-[var(--color-primary)] text-xs font-semibold px-2 py-0.5 rounded-full mr-2">
													{item.badge}
												</span>
											)}
											{showHotkeys && item.hotkey && (
												<kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--color-muted)] rounded mr-2 border-[var(--color-primary)">
													{formatHotkey(item.hotkey)}
												</kbd>
											)}
											{isOpen ? (
												<ChevronUp
													size={16}
													className="text-[var(--color-muted-foreground)]"
												/>
											) : (
												<ChevronDown
													size={16}
													className="text-[var(--color-muted-foreground)]"
												/>
											)}
										</div>
									)}
								</button>
								{!collapsed && isOpen && (
									<ul
										id={`submenu-${absoluteIdx}`}
										className="mt-1 py-1 bg-[var(--color-popover)] rounded-md"
										aria-label={`${item.title} submenu`}
									>
										{item.subItems.map((sub) => (
											<li key={sub.path}>
												<Link
													href={sub.path}
													onKeyDown={keyNavigate(sub.path)}
													className={`
                            flex items-center justify-between rounded-md
                            hover:bg-[var(--color-primary)]/10 transition-colors
                            pl-12 pr-4 py-2 text-sm
                            ${
															pathname === sub.path
																? "bg-[var(--color-muted)] text-[var(--color-primary)]"
																: "text-[var(--color-muted-foreground)]"
														}
                          `}
												>
													<span>{sub.title}</span>
													{(sub.badge || sub.hotkey) && (
														<span className="ml-2 flex items-center space-x-2">
															{sub.badge && showBadge && (
																<span className="bg-[var(--color-primary)]/[0.1] text-[var(--color-primary)] text-xs font-semibold px-2 py-0.5 rounded-full">
																	{sub.badge}
																</span>
															)}
															{sub.hotkey && showHotkeys && (
																<kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--color-muted)] rounded">
																	{formatHotkey(sub.hotkey)}
																</kbd>
															)}
														</span>
													)}
												</Link>
											</li>
										))}
									</ul>
								)}
							</li>
						);
					}

					return (
						<li
							key={absoluteIdx}
							ref={(el) => setRef(el, absoluteIdx)}
							className="relative mb-1"
							title={collapsed ? item.title : undefined}
						>
							<Link
								href={item.path}
								onKeyDown={keyNavigate(item.path)}
								className={`
                  relative flex items-center rounded-md
                  hover:bg-[var(--color-primary)]/10 transition-colors overflow-hidden
                  ${itemPad}
                  ${collapsed ? "justify-center" : "justify-between"}
                  ${isActive ? ACTIVE_BAR : "text-[var(--color-foreground)]"}
                `}
							>
								<div className="flex items-center">
									{item.icon}
									{!collapsed && (
										<span className="ml-3 font-medium">{item.title}</span>
									)}
								</div>
								{!collapsed && (
									<div className="flex items-center ml-auto">
										{showBadge && item.badge && (
											<span className="bg-[var(--color-primary)]/[0.1] text-[var(--color-primary)] text-xs font-semibold px-2 py-0.5 rounded-full mr-2">
												{item.badge}
											</span>
										)}
										{showHotkeys && item.hotkey && (
											<kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--color-muted)] rounded">
												{formatHotkey(item.hotkey)}
											</kbd>
										)}
									</div>
								)}
							</Link>
						</li>
					);
				})}
			</ul>
		</section>
	);
};
