'use client';

import { Pin, ChevronDown, ChevronUp } from 'lucide-react';

export default function SubMenu({
  items,
  expandedItems,
  toggleItemExpansion,
  handleAddShortcut,
  isItemInShortcuts,
  primaryColor,
}) {
  if (!items || items.length === 0) return null;

  return items.map(item => {
    const itemObj = { originalData: item };
    const isShortcut = isItemInShortcuts(itemObj);

    return (
      <div key={item.keyValue}>
        <div
          onClick={() => item.children?.length > 0 && toggleItemExpansion(item.keyValue)}
          className="flex items-center justify-between p-3 my-1 rounded-md cursor-pointer bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#252530]"
        >
          <span className=" dark:text-white text-h3 font-medium text-primary">{item.textOption || item.idName}</span>

          <div className="flex items-center">
            {(!item.children || item.children.length === 0) && (
              <button
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddShortcut(itemObj);
                }}
              >
                <Pin
                  className={`w-4 h-4 transition-transform ${isShortcut ? 'transform rotate-90' : ''}`}
                  style={isShortcut ? { color: primaryColor } : { color: "rgb(156, 163, 175)" }}
                />
              </button>
            )}
            {item.children && item.children.length > 0 && (
              expandedItems[item.keyValue] ? (
                <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )
            )}
          </div>
        </div>

        {item.children && item.children.length > 0 && expandedItems[item.keyValue] && (
          <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
            <SubMenu
              items={item.children}
              expandedItems={expandedItems}
              toggleItemExpansion={toggleItemExpansion}
              handleAddShortcut={handleAddShortcut}
              isItemInShortcuts={isItemInShortcuts}
              primaryColor={primaryColor}
            />
          </div>
        )}
      </div>
    );
  });
}