import type { Category } from "@/services/category.service";

export interface CategoryOption {
  value: string;
  label: string;
  disabled?: boolean;
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
 * `onlySubcategories` lists only second-level categories (where products go);
 * `onlyMainCategories` lists only top-level ones (parent choices).
 */
export const flattenCategoryOptions = (
  tree: Category[] | undefined,
  {
    excludeArchived = true,
    excludeIds = [] as Iterable<string>,
    onlySubcategories = false,
    onlyMainCategories = false,
  } = {}
): CategoryOption[] => {
  const excluded = new Set(excludeIds);
  const options: CategoryOption[] = [];

  const walk = (nodes: Category[], prefix: string[]) => {
    nodes.forEach((node) => {
      if (excluded.has(node.id)) return;
      if (excludeArchived && node.status === "archived") return;
      const path = [...prefix, node.name];
      const isMain = prefix.length === 0;
      if (!(onlySubcategories && isMain) && !(onlyMainCategories && !isMain)) {
        options.push({
          value: node.id,
          label: path.join(" › ") + (STATUS_SUFFIX[node.status] ?? ""),
        });
      }
      if (node.children?.length) walk(node.children, path);
    });
  };

  walk((tree ?? []).filter((cat) => !cat.parent_id), []);
  return options;
};

/**
 * Levels in a category's own subtree: 1 for a leaf, 2 with children, and so
 * on. Pass a tree loaded with `include_archived`, because the server counts
 * archived descendants too. Unknown ids count as 1.
 */
export const subtreeHeight = (tree: Category[] | undefined, id: string): number => {
  const heightOf = (node: Category): number =>
    1 + Math.max(0, ...(node.children ?? []).map(heightOf));
  let found: Category | undefined;
  const visit = (nodes: Category[]) => {
    nodes.forEach((node) => {
      if (found) return;
      if (node.id === id) found = node;
      else if (node.children?.length) visit(node.children);
    });
  };
  visit(tree ?? []);
  return found ? heightOf(found) : 1;
};

/**
 * Parent choices for the category form. Categories are two levels deep, so a
 * parent must be a main category. Never the category itself, never archived.
 * (A category that has children can't take a parent: the form hides the field.)
 */
export const parentCategoryOptions = (
  tree: Category[] | undefined,
  selfId?: string
): CategoryOption[] => [
  { value: "", label: "None (main category)" },
  ...flattenCategoryOptions(tree, {
    excludeIds: selfId ? [selfId] : [],
    onlyMainCategories: true,
  }),
];
