"use client";

import { Pin } from "lucide-react";
import ArrowLCurve from "./CurvedArrow";

export default function SubMenu({
  items,
  expandedItems,
  toggleItemExpansion,
  handleAddShortcut,
  isItemInShortcuts,
  primaryColor,
  onCopyToClipboard,
  acronym ,
  isChild = false,
  // Nuevas props para privilegios
  hasPrivilege = false,
  hasMenuPermission,
  hasAnyChildPermission,
  // Nueva prop para búsqueda
  searchTerm = "",
  currentSession
}) {
  if (!items || items.length === 0) return null;

  // Función para buscar en el texto del item
  const matchesSearch = (item, searchText) => {
    if (!searchText) return true;
    
    const searchLower = searchText.toLowerCase().trim();
    const itemText = (item.textOption || item.idName || "").toLowerCase();
    const itemId = (item.idName || "").toLowerCase();
    
    return itemText.includes(searchLower) || itemId.includes(searchLower);
  };

  // Función recursiva para filtrar por búsqueda
  const filterBySearch = (itemList, searchText) => {
    if (!searchText) return itemList;

    return itemList.filter(item => {
      // Si el item actual coincide con la búsqueda
      if (matchesSearch(item, searchText)) {
        return true;
      }
      
      // Si tiene hijos, verificar si algún hijo coincide
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterBySearch(item.children, searchText);
        return filteredChildren.length > 0;
      }
      
      return false;
    }).map(item => {
      // Si tiene hijos, filtrar recursivamente
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: filterBySearch(item.children, searchText)
        };
      }
      return item;
    });
  };

  // Aplicar filtro de búsqueda primero
  const searchFilteredItems = filterBySearch(items, searchTerm);

  // Filtrar items según privilegios
  const filteredItems = hasPrivilege 
    ? searchFilteredItems.filter(item => {
        // CON PRIVILEGIOS: Solo mostrar elementos que tienen permisos
        if (item.children && item.children.length > 0) {
          return hasAnyChildPermission(item);
        }
        return hasMenuPermission(item.idMenu);
      })
    : searchFilteredItems.filter(item => {
        // SIN PRIVILEGIOS: Solo mostrar elementos que NO tienen permisos
        if (item.children && item.children.length > 0) {
          return !hasAnyChildPermission(item);
        }
        return !hasMenuPermission(item.idMenu);
      });

  // Función recursiva para filtrar hijos con permisos
  const filterItemsWithPermissions = (itemList) => {
    return itemList.map(item => {
      if (item.children && item.children.length > 0) {
        const filteredChildren = hasPrivilege 
          ? item.children.filter(child => {
              // CON PRIVILEGIOS: Solo hijos con permisos
              if (child.children && child.children.length > 0) {
                return hasAnyChildPermission(child);
              }
              return hasMenuPermission(child.idMenu);
            })
          : item.children.filter(child => {
              // SIN PRIVILEGIOS: Solo hijos sin permisos
              if (child.children && child.children.length > 0) {
                return !hasAnyChildPermission(child);
              }
              return !hasMenuPermission(child.idMenu);
            });

        return {
          ...item,
          children: filterItemsWithPermissions(filteredChildren)
        };
      }
      return item;
    });
  };

  const finalFilteredItems = filterItemsWithPermissions(filteredItems);

  // Función para copiar al portapapeles
  const copyToClipboard = async (item) => {
    // Si no tiene privilegios, mostrar mensaje y no copiar
    if (!hasPrivilege) {
      onCopyToClipboard?.({
        success: false,
        message: 'No tienes privilegios para copiar elementos del menú',
        text: ''
      });
      return;
    }

    // En modo "Con privilegios": verificar permisos específicos
    if (hasPrivilege && !hasMenuPermission(item.idMenu)) {
      onCopyToClipboard?.({
        success: false,
        message: 'No tienes permisos para acceder a este elemento del menú',
        text: ''
      });
      return;
    }

    const paddedSession = currentSession.toString().padStart(10, '0');
    const combinedText = `${paddedSession}${acronym}${item.idName}`;
    const textToCopy = btoa(combinedText); 
    
    const textToShow = item.textOption || item.idName;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      onCopyToClipboard?.({
        success: true,
        message: `"${textToShow}" copiado al portapapeles`,
        text: textToCopy
      });
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error);
      onCopyToClipboard?.({
        success: false,
        message: 'Error al copiar al portapapeles',
        text: textToCopy
      });
    }
  };

  const handleItemClick = (item, e) => {
    if (!hasPrivilege) {
      onCopyToClipboard?.({
        success: false,
        message: 'No tienes privilegios para interactuar con el menú',
        text: ''
      });
      return;
    }

    if (item.children?.length > 0) {
      if (hasPrivilege && !hasAnyChildPermission(item)) {
        onCopyToClipboard?.({
          success: false,
          message: 'No tienes permisos para acceder a ningún elemento de este menú',
          text: ''
        });
        return;
      }
      
      toggleItemExpansion(item.keyValue);
    } else {
      copyToClipboard(item);
    }
  };

  return finalFilteredItems.map((item) => {
    const itemObj = { originalData: item };
    const isShortcut = isItemInShortcuts(itemObj);
    const isExpanded = !!expandedItems[item.keyValue];

    const hasPermissionForItem = hasPrivilege && (
      hasMenuPermission(item.idMenu) || 
      (item.children?.length > 0 && hasAnyChildPermission(item))
    );

    const cardClass =
      "flex items-center justify-between p-3 my-1 rounded-md border border-gray-200 dark:border-gray-700 transition-colors " +
      (isExpanded
        ? "bg-gray-100 dark:bg-[#232333]"
        : "bg-white dark:bg-[#1C1C24]") +
      (hasPermissionForItem 
        ? " cursor-pointer hover:bg-gray-100 dark:hover:bg-[#232333]"
        : " cursor-not-allowed opacity-50");

    const textClass = isExpanded
      ? "font-medium text-p"
      : "dark:text-white text-p font-medium text-gray-600";

    const textStyle = isExpanded
      ? { color: primaryColor, fontWeight: 500 }
      : {};

    return (
      <div key={item.keyValue}>
        {isChild ? (
          <div className="flex">
            <span className="text-primary ml-1 flex items-start mt-1">
              <ArrowLCurve className="w-10 h-7" style={{ color: primaryColor }} />
            </span>
            <div className="flex-1">
              <div
                onClick={(e) => handleItemClick(item, e)}
                className={cardClass}
              >
                <span className={textClass} style={textStyle}>
                  {item.textOption || item.idName}
                </span>

                <div className="flex items-center">
                  {(!item.children || item.children.length === 0) && (
                    <button
                      className={`p-1 rounded-full transition-colors ${
                        hasPermissionForItem 
                          ? "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" 
                          : "cursor-not-allowed opacity-50"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasPermissionForItem) {
                          handleAddShortcut(itemObj);
                        }
                      }}
                      disabled={!hasPermissionForItem}
                    >
                      <Pin
                        className={`w-4 h-4 transition-transform ${
                          isShortcut ? "transform rotate-90" : ""
                        }`}
                        style={
                          isShortcut && hasPermissionForItem
                            ? { color: primaryColor }
                            : { color: hasPermissionForItem ? "rgb(156, 163, 175)" : "rgb(156, 163, 175, 0.5)" }
                        }
                      />
                    </button>
                  )}
                  {item.children && item.children.length > 0 && (
                    isExpanded ? (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="ml-2"
                      >
                        <path
                          d="M3 17V5h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM10 13h4"
                          stroke={hasPermissionForItem ? primaryColor : "rgb(156, 163, 175, 0.5)"}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="ml-2"
                      >
                        <path
                          d="M3 17V5h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM12 11v4M10 13h4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={hasPermissionForItem ? "text-[#92929D] dark:text-gray-400" : "text-gray-300 dark:text-gray-600"}
                        />
                      </svg>
                    )
                  )}
                </div>
              </div>

              {item.children &&
                item.children.length > 0 &&
                isExpanded && 
                hasPermissionForItem && (
                  <div className="ml-9">
                    <SubMenu
                      items={item.children}
                      expandedItems={expandedItems}
                      toggleItemExpansion={toggleItemExpansion}
                      handleAddShortcut={handleAddShortcut}
                      isItemInShortcuts={isItemInShortcuts}
                      primaryColor={primaryColor}
                      onCopyToClipboard={onCopyToClipboard}
                      isChild={true}
                      hasPrivilege={hasPrivilege}
                      hasMenuPermission={hasMenuPermission}
                      hasAnyChildPermission={hasAnyChildPermission}
                      searchTerm={searchTerm}
                    />
                  </div>
                )
              }
            </div>
          </div>
        ) : (
          <div>
            <div
              onClick={(e) => handleItemClick(item, e)}
              className={cardClass}
            >
              <span className={textClass} style={textStyle}>
                {item.textOption || item.idName}
              </span>

              <div className="flex items-center">
                {(!item.children || item.children.length === 0) && (
                  <button
                    className={`p-1 rounded-full transition-colors ${
                      hasPermissionForItem 
                        ? "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" 
                        : "cursor-not-allowed opacity-50"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasPermissionForItem) {
                        handleAddShortcut(itemObj);
                      }
                    }}
                    disabled={!hasPermissionForItem}
                  >
                    <Pin
                      className={`w-4 h-4 transition-transform ${
                        isShortcut ? "transform rotate-90" : ""
                      }`}
                      style={
                        isShortcut && hasPermissionForItem
                          ? { color: primaryColor }
                          : { color: hasPermissionForItem ? "rgb(156, 163, 175)" : "rgb(156, 163, 175, 0.5)" }
                      }
                    />
                  </button>
                )}
                {item.children && item.children.length > 0 && (
                  isExpanded ? (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="ml-2"
                    >
                      <path
                        d="M3 17V5h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM10 13h4"
                        stroke={hasPermissionForItem ? primaryColor : "rgb(156, 163, 175, 0.5)"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="ml-2"
                    >
                      <path
                        d="M3 17V5h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM12 11v4M10 13h4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={hasPermissionForItem ? "text-[#92929D] dark:text-gray-400" : "text-gray-300 dark:text-gray-600"}
                      />
                    </svg>
                  )
                )}
              </div>
            </div>

            {item.children &&
              item.children.length > 0 &&
              isExpanded && 
              hasPermissionForItem && (
                <div className="ml-1">
                  <SubMenu
                    items={item.children}
                    expandedItems={expandedItems}
                    toggleItemExpansion={toggleItemExpansion}
                    handleAddShortcut={handleAddShortcut}
                    isItemInShortcuts={isItemInShortcuts}
                    primaryColor={primaryColor}
                    onCopyToClipboard={onCopyToClipboard}
                    isChild={true}
                    hasPrivilege={hasPrivilege}
                    hasMenuPermission={hasMenuPermission}
                    hasAnyChildPermission={hasAnyChildPermission}
                    searchTerm={searchTerm}
                    currentSession={currentSession}
                  />
                </div>
              )
            }
          </div>
        )}
      </div>
    );
  });
}