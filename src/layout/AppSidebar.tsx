"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import BrandLogo from "@/components/common/BrandLogo";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { usePermissions } from "../context/AuthContext";
import {
  BoxCubeIcon,
  BoxIconLine,
  ChatIcon,
  ChevronDownIcon,
  DollarLineIcon,
  GridIcon,
  GroupIcon,
  HorizontaLDots,
  ListIcon,
  LockIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  TaskIcon,
  UserCircleIcon,
} from "../icons/index";
import {
  MAIN_NAV_ITEMS,
  OTHER_NAV_ITEMS,
  MENU_LABELS,
  SIDEBAR_CONFIG,
  type NavItem as NavItemConfig,
  type NavSubItem as NavSubItemConfig,
} from "../utils/constants/navigation";

// Icon mapping from string names to components
const ICON_MAP: Record<string, React.ReactNode> = {
  GridIcon: <GridIcon />,
  ListIcon: <ListIcon />,
  BoxCubeIcon: <BoxCubeIcon />,
  UserCircleIcon: <UserCircleIcon />,
  PieChartIcon: <PieChartIcon />,
  PlugInIcon: <PlugInIcon />,
  TaskIcon: <TaskIcon />,
  GroupIcon: <GroupIcon />,
  ChatIcon: <ChatIcon />,
  DollarLineIcon: <DollarLineIcon />,
  BoxIconLine: <BoxIconLine />,
  TableIcon: <TableIcon />,
  PageIcon: <PageIcon />,
  LockIcon: <LockIcon />,
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// Transform config nav items to include React icon components
const transformNavItems = (items: NavItemConfig[]): NavItem[] =>
  items.map((item) => ({
    ...item,
    icon: ICON_MAP[item.icon] || <GridIcon />,
  }));

/**
 * Filters nav config by the admin's permissions before the icon transform.
 * A group is dropped if its own `permission` fails, or if it has subItems
 * and every one of them gets filtered out (a group's own `path`-only entries
 * are unaffected). `superOnly` groups (leftover template/demo pages) only
 * render for a Super Admin, regardless of `permission`.
 */
const filterNavItems = (
  items: NavItemConfig[],
  can: (key: string | string[]) => boolean,
  isSuper: boolean
): NavItemConfig[] =>
  items.reduce<NavItemConfig[]>((acc, item) => {
    if (item.superOnly && !isSuper) return acc;
    if (item.permission && !can(item.permission)) return acc;

    if (item.subItems) {
      const visibleSubItems = item.subItems.filter(
        (sub: NavSubItemConfig) => !sub.permission || can(sub.permission)
      );
      if (visibleSubItems.length === 0) return acc;
      acc.push({ ...item, subItems: visibleSubItems });
      return acc;
    }

    acc.push(item);
    return acc;
  }, []);

const AppSidebar: React.FC = () => {
  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsHovered,
    toggleSidebar,
    toggleMobileSidebar,
  } = useSidebar();
  const pathname = usePathname();
  const { can, isSuper, permissions } = usePermissions();

  const showLabels = isExpanded || isHovered || isMobileOpen;

  // Desktop: collapse/expand the rail. Mobile: close the drawer.
  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const navItems: NavItem[] = useMemo(
    () => transformNavItems(filterNavItems(MAIN_NAV_ITEMS, can, isSuper)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [permissions, isSuper]
  );
  const othersItems: NavItem[] = useMemo(
    () => transformNavItems(filterNavItems(OTHER_NAV_ITEMS, can, isSuper)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [permissions, isSuper]
  );

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  // Sync openSubmenu with pathname changes
  useEffect(() => {
    // Find which submenu should be open based on current pathname
    let matchedSubmenu: { type: "main" | "others"; index: number } | null = null;

    const menuTypes: Array<"main" | "others"> = ["main", "others"];
    for (const menuType of menuTypes) {
      const items = menuType === "main" ? navItems : othersItems;
      for (let index = 0; index < items.length; index++) {
        const nav = items[index];
        if (nav.subItems) {
          for (const subItem of nav.subItems) {
            if (subItem.path === pathname) {
              matchedSubmenu = { type: menuType, index };
              break;
            }
          }
        }
        if (matchedSubmenu) break;
      }
      if (matchedSubmenu) break;
    }

    setOpenSubmenu(matchedSubmenu);
  }, [pathname, navItems, othersItems]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const expandedWidth = `w-[${SIDEBAR_CONFIG.EXPANDED_WIDTH}px]`;
  const collapsedWidth = `w-[${SIDEBAR_CONFIG.COLLAPSED_WIDTH}px]`;

  return (
    <aside
      className={`fixed flex flex-col top-0 px-4 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${
          isExpanded || isMobileOpen
            ? expandedWidth
            : isHovered
            ? expandedWidth
            : collapsedWidth
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex items-center gap-2 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-between"
        }`}
      >
        {showLabels && (
          <Link href="/">
            <BrandLogo width={150} priority />
          </Link>
        )}
        <button
          onClick={handleToggle}
          aria-label={isMobileOpen ? "Close sidebar" : "Toggle sidebar"}
          className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg shrink-0 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          {isMobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path
                d="M1.33 1h13.34M1.33 11h13.34M1.33 6H8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  MENU_LABELS.MAIN
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            {othersItems.length > 0 && (
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  MENU_LABELS.OTHERS
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
            )}
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>

    </aside>
  );
};

export default AppSidebar;
