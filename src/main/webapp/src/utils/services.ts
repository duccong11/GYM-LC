/** Search the service list without changing its order or contents. */
export function filterServices<T extends { name: string }>(rows: T[], query: string): T[] {
  return rows.filter((r) => r.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
}
