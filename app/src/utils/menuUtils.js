// src/utils/menuUtils.js

export function organizeMenuHierarchy(items) {
    const map = {}
    items.forEach(i => map[i.keyValue] = { ...i, children: [] })
    const roots = []
    items.forEach(i => {
      if (i.pKey && map[i.pKey]) map[i.pKey].children.push(map[i.keyValue])
      else roots.push(map[i.keyValue])
    })
    return roots
  }
  
  export function flattenHierarchy(hierarchy) {
    const out = []
    const dfs = (nodes, parent = null) => {
      nodes.forEach(n => {
        const { children, ...flat } = n
        flat.pKey = parent
        out.push(flat)
        if (children) dfs(children, n.keyValue)
      })
    }
    dfs(hierarchy)
    return out
  }
  