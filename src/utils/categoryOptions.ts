import type { Category } from "@/services/category.service";

export interface CategoryOption {
  value: string;
  label: string;
}

const STATUS_SUFFIX: Partial<Record<Category["status"], string>> = {
  draft: " (Draft)",
  inactive: " (Inactive)",
  archived: " (Archived)",
};

const collectIds = (category: Category, into: Set<string>) => {
  into.add(category.id);
  category.children?.forEach((child) => collectIds(child, into));
};

/** Ids of a category and all its descendants, found anywhere in the tree. */
export const subtreeIds = (tree: Category[], id: string): Set<string> => {
  const ids = new Set<string>();
  const visit = (nodes: Category[]) => {
    nodes.forEach((node) => {
      if (node.id === id) collectIds(node, ids);
      else if (node.children?.length) visit(node.children);
    });
  };
  visit(tree);
  return ids;
};

/**
 * Flatten the API tree into dropdown options labelled with the full path
 * ("Hardware › Door Hardware › Door Handle"), in tree order. Non-active
 * categories get a status suffix; archived ones are left out by default.
 */
export const flattenCategoryOptions = (
  tree: Category[] | undefined,
  { excludeArchived = true, excludeIds = [] as Iterable<string> } = {}
): CategoryOption[] => {
  const excluded = new Set(excludeIds);
  const options: CategoryOption[] = [];

  const walk = (nodes: Category[], prefix: string[]) => {
    nodes.forEach((node) => {
      if (excluded.has(node.id)) return;
      if (excludeArchived && node.status === "archived") return;
      const path = [...prefix, node.name];
      options.push({
        value: node.id,
        label: path.join(" › ") + (STATUS_SUFFIX[node.status] ?? ""),
      });
      if (node.children?.length) walk(node.children, path);
    });
  };

  walk((tree ?? []).filter((cat) => !cat.parent_id), []);
  return options;
};

/**
 * Parent choices for the category form: levels 1 and 2 only (a child of a
 * level-2 category is level 3, the deepest allowed), never the category
 * itself or its own subcategories, never archived.
 */
export const parentCategoryOptions = (
  tree: Category[] | undefined,
  selfId?: string
): CategoryOption[] => {
  const excluded = selfId ? subtreeIds(tree ?? [], selfId) : new Set<string>();
  const depthOf = new Map<string, number>();
  const walk = (nodes: Category[], depth: number) => {
    nodes.forEach((node) => {
      depthOf.set(node.id, depth);
      if (node.children?.length) walk(node.children, depth + 1);
    });
  };
  walk((tree ?? []).filter((cat) => !cat.parent_id), 1);

  return [
    { value: "", label: "None (main category)" },
    ...flattenCategoryOptions(tree, { excludeIds: excluded }).filter(
      (option) => (depthOf.get(option.value) ?? 1) <= 2
    ),
  ];
};
